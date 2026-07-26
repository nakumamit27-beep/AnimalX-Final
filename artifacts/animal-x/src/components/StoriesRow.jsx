import { useState, useEffect } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import StoriesViewer from "./StoriesViewer";
import UploadStory from "./UploadStory";

function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `/api/storage${path}`;
}

export default function StoriesRow() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartUser, setViewerStartUser] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const now = Date.now();

  useEffect(() => {
    // Load stories that haven't expired (expiresAt > now)
    // We filter client-side since Firestore doesn't support > on milliseconds easily
    const q = query(
      collection(db, "stories"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => (s.expiresAt || 0) > Date.now());
      setStories(all);
    }, () => {});
    return unsub;
  }, []);

  // Group stories by userId
  const storyUsers = {};
  stories.forEach(s => {
    if (!storyUsers[s.userId]) storyUsers[s.userId] = { userId: s.userId, username: s.username, userPhoto: s.userPhoto, userVerified: s.userVerified, stories: [] };
    storyUsers[s.userId].stories.push(s);
  });

  const storyUserList = Object.values(storyUsers);

  // Check if current user has a story
  const myStories = user ? (storyUsers[user.uid]?.stories || []) : [];
  const hasMyStory = myStories.length > 0;

  function openViewer(userId) {
    setViewerStartUser(userId);
    setViewerOpen(true);
  }

  if (!user && storyUserList.length === 0) return null;

  return (
    <>
      <div className="stories-row">
        {/* Add Story button for logged-in user */}
        {user && (
          <div className="story-bubble-wrap" onClick={() => hasMyStory ? openViewer(user.uid) : setUploadOpen(true)}>
            <div className={`story-bubble ${hasMyStory ? "has-story" : "add-story"}`}>
              {hasMyStory ? (
                (() => {
                  const photoUrl = resolveUrl(profile?.photo || null);
                  return photoUrl
                    ? <img src={photoUrl} alt="My story" className="story-bubble-img" />
                    : <div className="story-bubble-initial">{(profile?.name || user.email || "U")[0].toUpperCase()}</div>;
                })()
              ) : (
                <div className="story-add-icon">+</div>
              )}
            </div>
            <div className="story-bubble-name">
              {hasMyStory ? "Your Story" : "Add Story"}
            </div>
          </div>
        )}

        {/* Other users' stories */}
        {storyUserList
          .filter(su => !user || su.userId !== user.uid)
          .map(su => {
            const photoUrl = resolveUrl(su.userPhoto || null);
            const viewed = su.stories.every(s => s.viewerIds?.includes(user?.uid));
            return (
              <div key={su.userId} className="story-bubble-wrap" onClick={() => openViewer(su.userId)}>
                <div className={`story-bubble has-story ${viewed ? "viewed" : ""}`}>
                  {photoUrl
                    ? <img src={photoUrl} alt={su.username} className="story-bubble-img" />
                    : <div className="story-bubble-initial">{(su.username || "W")[0].toUpperCase()}</div>
                  }
                </div>
                <div className="story-bubble-name">@{su.username || "user"}</div>
              </div>
            );
          })}
      </div>

      {viewerOpen && (
        <StoriesViewer
          storyUsers={storyUserList}
          myUserId={user?.uid}
          startUserId={viewerStartUser}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {uploadOpen && (
        <UploadStory
          onClose={() => setUploadOpen(false)}
          onUploaded={() => setUploadOpen(false)}
        />
      )}
    </>
  );
}
