import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import {
  collection, query, orderBy, limit, where,
  onSnapshot, doc, getDoc, setDoc, updateDoc,
  increment, serverTimestamp, addDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";
import CommentsPanel from "../components/CommentsPanel";
import UploadReel from "../components/UploadReel";

function fmt(n) {
  if (!n || n === 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const CATS = ["All","Mammals","Birds","Aquatic","Reptiles","Small Creatures","Trees","Mountains","Sea","Desert"];

function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `/api/storage${path}`;
}

export default function Reels() {
  const [, navigate] = useLocation();
  const { user, adminMode, isSuperAdmin } = useAuth();
  const { likedReels, likeReel, following, followUser, unfollowUser, trackReelView } = useSocial();

  const [allReels, setAllReels] = useState([]);
  const [feed, setFeed] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true); // must start muted for autoplay to work
  const [commentsReel, setCommentsReel] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [heartAnims, setHeartAnims] = useState({});
  const [savedReels, setSavedReels] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ax_saved_reels") || "{}"); } catch { return {}; }
  });
  const [liveLikes, setLiveLikes] = useState({});
  const [creatorCache, setCreatorCache] = useState({});
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);
  const lastTapRef = useRef({});
  const uploadedRef = useRef(false);

  // Load real reels from Firestore only
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, snap => {
      const reels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllReels(reels);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Build feed from real reels only
  useEffect(() => {
    const filtered = catFilter === "All"
      ? allReels
      : allReels.filter(r => r.category === catFilter);
    setFeed(filtered);
    setActiveIdx(0);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
  }, [allReels, catFilter]);

  // Fetch creator profiles for all reels in feed
  useEffect(() => {
    const missing = [...new Set(feed.map(r => r.userId).filter(id => id && !creatorCache[id]))];
    if (missing.length === 0) return;
    Promise.all(missing.map(async id => {
      try {
        const snap = await getDoc(doc(db, "users", id));
        return [id, snap.exists() ? snap.data() : {}];
      } catch { return [id, {}]; }
    })).then(pairs => {
      const update = Object.fromEntries(pairs);
      setCreatorCache(p => ({ ...p, ...update }));
    });
  }, [feed]);

  // Intersection Observer for autoplay
  useEffect(() => {
    if (!scrollRef.current || feed.length === 0) return;
    observerRef.current?.disconnect();

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const idx = Number(entry.target.dataset.idx);
          setActiveIdx(idx);
          const reel = feed[idx];
          if (reel?.id) trackReelView(reel.id);

          Object.entries(videoRefs.current).forEach(([vi, el]) => {
            if (!el) return;
            if (Number(vi) === idx) {
              el.muted = muted;
              const playPromise = el.play();
              if (playPromise) playPromise.catch(() => {
                el.muted = true;
                el.play().catch(() => {});
              });
            } else {
              el.pause();
              el.currentTime = 0;
            }
          });
        }
      });
    }, { threshold: 0.6, root: scrollRef.current });

    const slides = scrollRef.current.querySelectorAll("[data-idx]");
    slides.forEach(s => obs.observe(s));
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [feed.length, muted]);

  // Sync muted state to active video immediately
  useEffect(() => {
    const el = videoRefs.current[activeIdx];
    if (el) {
      el.muted = muted;
      if (!muted) el.play().catch(() => { el.muted = true; setMuted(true); });
    }
  }, [muted, activeIdx]);

  const triggerHeart = useCallback((id) => {
    setHeartAnims(h => ({ ...h, [id]: true }));
    setTimeout(() => setHeartAnims(h => ({ ...h, [id]: false })), 900);
  }, []);

  async function handleLike(reel) {
    if (!user) { navigate("/auth"); return; }
    const already = !!likedReels[reel.id];
    if (!already) triggerHeart(reel.id);
    setLiveLikes(p => ({ ...p, [reel.id]: (p[reel.id] ?? reel.likes ?? 0) + (already ? -1 : 1) }));
    await likeReel(reel.id, reel.likes || 0);
  }

  function handleDoubleTap(reel) {
    const now = Date.now();
    const last = lastTapRef.current[reel.id] || 0;
    if (now - last < 350) {
      if (!likedReels[reel.id]) handleLike(reel);
      triggerHeart(reel.id);
    }
    lastTapRef.current[reel.id] = now;
  }

  function handleSave(reelId) {
    const next = { ...savedReels, [reelId]: !savedReels[reelId] };
    if (!next[reelId]) delete next[reelId];
    setSavedReels(next);
    localStorage.setItem("ax_saved_reels", JSON.stringify(next));
  }

  async function handleShare(reel) {
    const text = `${reel.title} — Animal X Wildlife`;
    if (navigator.share) {
      try { await navigator.share({ title: reel.title, text, url: window.location.href }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    } catch {}
  }

  async function handleDeleteReel(reelId) {
    if (!window.confirm("Delete this reel permanently?")) return;
    try { await deleteDoc(doc(db, "reels", reelId)); } catch (e) { alert(e.message); }
  }

  function handleFollowToggle(targetUserId) {
    if (!user) { navigate("/auth"); return; }
    if (following[targetUserId]) unfollowUser(targetUserId);
    else followUser(targetUserId);
  }

  function toggleMute() {
    setMuted(m => !m);
  }

  if (loading) {
    return (
      <div className="reels-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "var(--text2)" }}>
        <div style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}>🐾</div>
        <p>Loading wildlife reels…</p>
      </div>
    );
  }

  return (
    <div className="reels-page">
      {/* Top bar */}
      <div className="reels-top-bar">
        <span className="reels-top-title">🎬 Wildlife Reels</span>
        <div className="reels-top-actions">
          <button className="reels-mute-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
          {user && (
            <button className="reels-upload-btn" onClick={() => setUploadOpen(true)}>
              + Upload
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="reels-cat-bar">
        {CATS.map(c => (
          <button
            key={c}
            className={`reel-cat-pill ${catFilter === c ? "active" : ""}`}
            onClick={() => setCatFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Reels feed */}
      <div className="reels-scroll" ref={scrollRef}>
        {feed.length === 0 ? (
          <div className="reels-empty">
            <div style={{ fontSize: "5rem" }}>🦁</div>
            <h3>No wildlife reels yet</h3>
            <p>Be the first to upload a wildlife reel and inspire the community!</p>
            {user ? (
              <button className="btn-primary" onClick={() => setUploadOpen(true)} style={{ marginTop: 16 }}>
                🎬 Upload Your First Reel
              </button>
            ) : (
              <Link href="/auth" className="btn-primary" style={{ marginTop: 16 }}>
                Login to Upload
              </Link>
            )}
          </div>
        ) : (
          feed.map((reel, idx) => {
            const liked = !!likedReels[reel.id];
            const saved = !!savedReels[reel.id];
            const likes = liveLikes[reel.id] ?? reel.likes ?? 0;
            const isOwn = user?.uid === reel.userId;
            const isAdmin = isSuperAdmin && adminMode;
            const isFollowed = !!following[reel.userId];
            const isActive = idx === activeIdx;
            const creator = creatorCache[reel.userId] || {};
            const creatorPhoto = resolveUrl(creator.photo || reel.userPhoto || null);
            const creatorName = creator.name || reel.username || "wildlife_creator";
            const creatorVerified = creator.manualVerified || reel.userVerified || false;
            const creatorFollowers = creator.followers || reel.userFollowers || 0;
            const videoUrl = resolveUrl(reel.videoUrl);
            const thumbUrl = resolveUrl(reel.thumbnailUrl);

            return (
              <div
                key={reel.id}
                className={`reel-item ${isActive ? "active" : ""}`}
                data-idx={idx}
                onClick={() => handleDoubleTap(reel)}
              >
                {/* Video */}
                {videoUrl ? (
                  <video
                    ref={el => { if (el) videoRefs.current[idx] = el; }}
                    className="reel-video"
                    src={videoUrl}
                    poster={thumbUrl || undefined}
                    preload={idx <= activeIdx + 2 ? "metadata" : "none"}
                    autoPlay={isActive}
                    loop
                    playsInline
                    muted={muted}
                  />
                ) : (
                  <div className="reel-demo-bg" style={{ background: "linear-gradient(135deg,#0a2818,#065f46,#0f4c2a)" }}>
                    <div className="reel-demo-emoji">🦁</div>
                  </div>
                )}

                {/* Heart animation on double tap */}
                {heartAnims[reel.id] && <div className="reel-heart-burst">❤️</div>}

                {/* Gradient overlay */}
                <div className="reel-gradient-overlay" />

                {/* Bottom info */}
                <div className="reel-overlay-bottom">
                  {/* Creator row */}
                  <div className="reel-creator-row">
                    <Link href={`/user/${reel.userId}`} onClick={e => e.stopPropagation()}>
                      <div className="reel-avatar-wrap">
                        {creatorPhoto
                          ? <img src={creatorPhoto} alt={creatorName} className="reel-avatar-img" />
                          : <div className="reel-avatar-initials">{creatorName[0]?.toUpperCase() || "🦁"}</div>
                        }
                      </div>
                    </Link>
                    <div className="reel-creator-info">
                      <Link href={`/user/${reel.userId}`} onClick={e => e.stopPropagation()} className="reel-username-link">
                        <span>@{creatorName}</span>
                        {creatorVerified && <BlueTick size={14} />}
                      </Link>
                      {creatorFollowers > 0 && (
                        <div className="reel-creator-followers">{fmt(creatorFollowers)} followers</div>
                      )}
                    </div>
                    {!isOwn && (
                      <button
                        className={`reel-follow-btn ${isFollowed ? "following" : ""}`}
                        onClick={e => { e.stopPropagation(); handleFollowToggle(reel.userId); }}
                      >
                        {isFollowed ? "✓ Following" : "+ Follow"}
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div className="reel-title">{reel.title}</div>
                  {reel.desc && (
                    <div className="reel-desc">
                      {reel.desc.length > 90 ? reel.desc.slice(0, 90) + "…" : reel.desc}
                    </div>
                  )}

                  {/* Hashtags */}
                  {reel.hashtags && (
                    <div className="reel-hashtags">
                      {String(reel.hashtags).split(/[\s,]+/).filter(Boolean).slice(0, 4).map(h => (
                        <span key={h} className="reel-hashtag">{h.startsWith("#") ? h : "#" + h}</span>
                      ))}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="reel-meta-row">
                    <span>👁️ {fmt(reel.views || 0)}</span>
                    {reel.location && <span>📍 {reel.location}</span>}
                    {reel.category && <span className="reel-cat-badge">{reel.category}</span>}
                  </div>
                </div>

                {/* Right-side action buttons */}
                <div className="reel-actions-right">
                  {/* Like */}
                  <button
                    className={`reel-action-btn ${liked ? "liked" : ""}`}
                    onClick={e => { e.stopPropagation(); handleLike(reel); }}
                  >
                    <span className="reel-action-icon">{liked ? "❤️" : "🤍"}</span>
                    <span className="reel-action-count">{fmt(likes)}</span>
                  </button>

                  {/* Comment */}
                  <button
                    className="reel-action-btn"
                    onClick={e => { e.stopPropagation(); setCommentsReel(reel); }}
                  >
                    <span className="reel-action-icon">💬</span>
                    <span className="reel-action-count">{fmt(reel.comments || 0)}</span>
                  </button>

                  {/* Share */}
                  <button
                    className="reel-action-btn"
                    onClick={e => { e.stopPropagation(); handleShare(reel); }}
                  >
                    <span className="reel-action-icon">↗️</span>
                    <span className="reel-action-count">{fmt(reel.shares || 0)}</span>
                  </button>

                  {/* Save */}
                  <button
                    className={`reel-action-btn ${saved ? "saved" : ""}`}
                    onClick={e => { e.stopPropagation(); handleSave(reel.id); }}
                  >
                    <span className="reel-action-icon">{saved ? "🔖" : "📌"}</span>
                    <span className="reel-action-count">{saved ? "Saved" : "Save"}</span>
                  </button>

                  {/* Mute toggle */}
                  {videoUrl && (
                    <button
                      className="reel-action-btn"
                      onClick={e => { e.stopPropagation(); toggleMute(); }}
                    >
                      <span className="reel-action-icon">{muted ? "🔇" : "🔊"}</span>
                      <span className="reel-action-count">{muted ? "Muted" : "Sound"}</span>
                    </button>
                  )}

                  {/* Delete (own or admin) */}
                  {(isOwn || isAdmin) && (
                    <button
                      className="reel-action-btn danger-btn"
                      onClick={e => { e.stopPropagation(); handleDeleteReel(reel.id); }}
                    >
                      <span className="reel-action-icon">🗑️</span>
                      <span className="reel-action-count">Delete</span>
                    </button>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && videoUrl && muted && (
                  <button
                    className="reel-unmute-hint"
                    onClick={e => { e.stopPropagation(); setMuted(false); }}
                  >
                    🔇 Tap for sound
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Comments panel */}
      {commentsReel && (
        <CommentsPanel reel={commentsReel} onClose={() => setCommentsReel(null)} />
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <UploadReel
          onClose={() => setUploadOpen(false)}
          onUploaded={() => { setUploadOpen(false); uploadedRef.current = true; }}
        />
      )}
    </div>
  );
}
