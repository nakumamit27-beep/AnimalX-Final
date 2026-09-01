import { useState, useEffect, useRef, useCallback } from "react";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import BlueTick from "./BlueTick";
import { resolveMediaUrl } from "../utils/firebaseUpload";

const STORY_DURATION = 5000; // 5 seconds per story

function timeAgo(ts) {
  if (!ts) return "";
  const ms = ts?.toDate ? ts.toDate().getTime() : ts;
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

export default function StoriesViewer({ storyUsers, myUserId, startUserId, onClose }) {
  const { user } = useAuth();

  // Build ordered list starting from startUserId
  const orderedUsers = (() => {
    const idx = storyUsers.findIndex(u => u.userId === startUserId);
    if (idx < 0) return storyUsers;
    return [...storyUsers.slice(idx), ...storyUsers.slice(0, idx)];
  })();

  const [userIdx, setUserIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const videoRef = useRef(null);

  const currentUserData = orderedUsers[userIdx];
  const currentStories = currentUserData?.stories || [];
  const currentStory = currentStories[storyIdx];
  const isOwn = currentUserData?.userId === myUserId;
  const totalStories = currentStories.length;

  // Mark story as viewed
  useEffect(() => {
    if (!currentStory?.id || !user?.uid) return;
    if (currentStory.viewerIds?.includes(user.uid)) return;
    updateDoc(doc(db, "stories", currentStory.id), {
      viewerIds: arrayUnion(user.uid),
      viewCount: increment(1),
    }).catch(() => {});
  }, [currentStory?.id]);

  // Progress timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now() - elapsedRef.current;
    const duration = currentStory?.mediaType === "video" && videoDuration > 0
      ? videoDuration * 1000
      : STORY_DURATION;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 50);
  }, [userIdx, storyIdx, currentStory?.mediaType, videoDuration]);

  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setVideoDuration(0);
    setMediaError(false);
    if (!paused) startTimer();
    return () => clearInterval(timerRef.current);
  }, [userIdx, storyIdx]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
      elapsedRef.current = Date.now() - startTimeRef.current;
    } else {
      startTimer();
    }
  }, [paused, startTimer]);

  function goNext() {
    clearInterval(timerRef.current);
    elapsedRef.current = 0;
    if (storyIdx < totalStories - 1) {
      setStoryIdx(s => s + 1);
    } else if (userIdx < orderedUsers.length - 1) {
      setUserIdx(u => u + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }

  function goPrev() {
    clearInterval(timerRef.current);
    elapsedRef.current = 0;
    if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
    } else if (userIdx > 0) {
      setUserIdx(u => u - 1);
      setStoryIdx(0);
    }
  }

  // Handle keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") setPaused(p => !p);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [storyIdx, userIdx]);

  if (!currentStory) return null;

  const mediaUrl = resolveMediaUrl(currentStory.mediaUrl);
  const isVideo = currentStory.mediaType === "video";
  const photoUrl = resolveUrl(currentUserData?.userPhoto || null);

  return (
    <div className="sv-backdrop" onClick={onClose}>
      <div className="sv-container" onClick={e => e.stopPropagation()}>

        {/* Progress bars */}
        <div className="sv-progress-row">
          {currentStories.map((_, i) => (
            <div key={i} className="sv-progress-track">
              <div
                className="sv-progress-fill"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%"
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="sv-header">
          <div className="sv-user-row">
            {photoUrl
              ? <img src={photoUrl} alt={currentUserData.username} className="sv-avatar" />
              : <div className="sv-avatar-initial">{(currentUserData.username || "W")[0].toUpperCase()}</div>
            }
            <div className="sv-user-info">
              <span className="sv-username">
                @{currentUserData.username || "user"}
                {currentUserData.userVerified && <BlueTick size={13} />}
              </span>
              <span className="sv-time">{timeAgo(currentStory.createdAt)}</span>
            </div>
          </div>
          <div className="sv-header-actions">
            {isOwn && (
              <span className="sv-views">👁️ {currentStory.viewCount || 0}</span>
            )}
            <button className="sv-pause-btn" onClick={() => setPaused(p => !p)}>
              {paused ? "▶" : "⏸"}
            </button>
            <button className="sv-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Media */}
        <div className="sv-media-wrap">
          {isVideo && mediaUrl && !mediaError ? (
            <video
              ref={videoRef}
              key={currentStory.id}
              src={mediaUrl}
              className="sv-media"
              autoPlay
              playsInline
              loop={false}
               muted
               preload="metadata"
               onLoadedMetadata={(event) => {
                 const duration = event.currentTarget.duration;
                 if (Number.isFinite(duration) && duration > 0) setVideoDuration(duration);
               }}
               onError={() => setMediaError(true)}
              onEnded={goNext}
            />
          ) : mediaUrl ? (
            <img src={mediaUrl} alt="story" className="sv-media" />
          ) : (
            <div className="sv-media-placeholder">🦁</div>
          )}

          {/* Tap zones */}
          <button className="sv-tap-prev" onClick={goPrev} aria-label="Previous" />
          <button className="sv-tap-next" onClick={goNext} aria-label="Next" />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="sv-caption">{currentStory.caption}</div>
        )}

        {/* User navigation dots */}
        {orderedUsers.length > 1 && (
          <div className="sv-user-dots">
            {orderedUsers.map((_, i) => (
              <div key={i} className={`sv-user-dot ${i === userIdx ? "active" : ""}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
