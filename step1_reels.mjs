import fs from 'fs';
import path from 'path';

const originalReelsCode = `import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import {
  collection, query, orderBy, limit,
  onSnapshot, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, addDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { DEMO_REELS, FAKE_FEED_REELS, ALL_USERS } from "../data/demoUsers";
import BlueTick from "../components/BlueTick";
import CommentsPanel from "../components/CommentsPanel";
import UploadReel from "../components/UploadReel";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const CATS = ["All", "Mammals", "Birds", "Aquatic", "Reptiles", "Small Creatures", "Trees", "Mountains", "Sea", "Desert"];

function buildFeed(liveReels, catFilter) {
  const all = [
    ...liveReels.map(r => ({ ...r, _rank: 2000 + (r.likes || 0) * 0.01 + (Date.now() - (r.createdAt?.toMillis?.() || 0)) * -0.000001 })),
    ...DEMO_REELS.map(r => ({ ...r, _rank: 800 + (r.likes || 0) * 0.005 })),
    ...FAKE_FEED_REELS.slice(0, 80).map(r => ({ ...r, _rank: 200 + (r.likes || 0) * 0.001 }))
  ];

  const seen = new Set();
  const deduped = all.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  const filtered = catFilter === "All" ? deduped : deduped.filter(r => r.category === catFilter || r.cat === catFilter);
  return filtered.sort((a, b) => b._rank - a._rank);
}

function getDemoUser(userId) {
  return ALL_USERS.find(u => u.id === userId || u.username === userId);
}

export default function Reels() {
  const [, navigate] = useLocation();
  const { user, adminMode, isSuperAdmin } = useAuth();
  const { likedReels, likeReel, following, followUser, unfollowUser, trackReelView } = useSocial();

  const [liveReels, setLiveReels] = useState([]);
  const [feed, setFeed] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [commentsReel, setCommentsReel] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [heartAnims, setHeartAnims] = useState({});
  const [savedReels, setSavedReels] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ax_saved_reels") || "{}"); } catch { return {}; }
  });

  const [liveLikes, setLiveLikes] = useState({});
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);
  const lastTapRef = useRef({});

  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, snap => {
      const reels = snap.docs.map(d => ({ id: d.id, ...d.data(), type: "live" }));
      setLiveReels(reels);
    }, () => {});
    return unsub;
  }, []);

  useEffect(() => {
    setFeed(buildFeed(liveReels, catFilter));
    setActiveIdx(0);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
  }, [liveReels, catFilter]);

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
              el.play().catch(() => {});
            } else {
              el.pause();
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

  const triggerHeart = useCallback((id) => {
    setHeartAnims(h => ({ ...h, [id]: true }));
    setTimeout(() => setHeartAnims(h => ({ ...h, [id]: false })), 800);
  }, []);

  async function handleLike(reel) {
    if (!user) { navigate("/auth"); return; }
    const already = !!likedReels[reel.id];
    if (!already) triggerHeart(reel.id);
    setLiveLikes(p => ({ ...p, [reel.id]: (p[reel.id] ?? reel.likes ?? 0) + (already ? -1 : 1) }));
    await likeReel(reel.id, reel.likes || 0);
  }

  function handleDoubleTap(reel, e) {
    const now = Date.now();
    const last = lastTapRef.current[reel.id] || 0;
    if (now - last < 350) {
      if (user && !likedReels[reel.id]) {
        handleLike(reel);
      } else if (!user) {
        triggerHeart(reel.id);
      }
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
    const text = \`\${reel.title} WildLingo Wildlife\\n#wildlifeapp\`;
    if (navigator.share) {
      try { await navigator.share({ title: reel.title, text, url: window.location.href }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied!");
    } catch {}
  }

  async function handleDeleteReel(reelId) {
    if (!window.confirm("Delete this reel?")) return;
    try { await deleteDoc(doc(db, "reels", reelId)); } catch (e) { alert(e.message); }
  }

  function handleFollowToggle(targetUserId) {
    if (!user) { navigate("/auth"); return; }
    if (following[targetUserId]) unfollowUser(targetUserId);
    else followUser(targetUserId);
  }

  return (
    <div className="reels-page">
      <div className="reels-top-bar">
        <span className="reels-top-title">Wildlife Reels</span>
        <div className="reels-top-actions">
          {user && (
            <button className="reels-upload-btn" onClick={() => setUploadOpen(true)}>
              + Upload
            </button>
          )}
        </div>
      </div>

      <div className="reels-cat-bar">
        {CATS.map(c => (
          <button
            key={c}
            className={\`reel-cat-pill \${catFilter === c ? "active" : ""}\`}
            onClick={() => setCatFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="reels-scroll" ref={scrollRef}>
        {feed.length === 0 ? (
          <div className="reels-empty">
            <div style={{ fontSize: "4rem" }}>🐾</div>
            <h3>No reels yet</h3>
            <p>Be the first to upload a wildlife reel!</p>
          </div>
        ) : (
          feed.map((reel, idx) => {
            const liked = !!likedReels[reel.id];
            const saved = !!savedReels[reel.id];
            const likes = liveLikes[reel.id] ?? reel.likes ?? 0;
            const demoUser = getDemoUser(reel.userId);
            const isOwn = user?.uid === reel.userId;
            const isAdmin = isSuperAdmin && adminMode;
            const isFollowed = !!following[reel.userId];
            const isActive = idx === activeIdx;

            return (
              <div
                key={reel.id}
                className={\`reel-item \${isActive ? "active" : ""}\`}
                data-idx={idx}
                onClick={(e) => handleDoubleTap(reel, e)}
              >
                <div>
                  {reel.videoUrl ? (
                    <video
                      ref={el => { if (el) videoRefs.current[idx] = el; }}
                      className="reel-video"
                      src={reel.videoUrl.startsWith('http') ? reel.videoUrl : \`/api/storage\${reel.videoUrl}\`}
                      loop
                      playsInline
                      muted={muted}
                      poster={reel.thumbnailUrl ? (reel.thumbnailUrl.startsWith('http') ? reel.thumbnailUrl : \`/api/storage\${reel.thumbnailUrl}\`) : undefined}
                    />
                  ) : (
                    <div className="reel-demo-bg" style={{ background: reel.bg || "linear-gradient(135deg, #0f4c2a, #065f46)" }}>
                      <div className="reel-demo-emoji">{reel.emoji || "🦁"}</div>
                    </div>
                  )}
                </div>

                {heartAnims[reel.id] && <div className="reel-heart-burst">❤️</div>}
                <div className="reel-gradient-overlay" />
                {reel.sponsored && <div className="reel-sponsored-tag">Sponsored</div>}
                {reel.copyrightClaimed && <div className="reel-sponsored-tag" style={{ background: '#dc2626' }}>© Copyright Claimed</div>}

                <div className="reel-overlay-bottom">
                  <div className="reel-creator-row">
                    <Link href={\`/user/\${reel.userId}\`} onClick={e => e.stopPropagation()}>
                      <div className="reel-avatar">
                        {demoUser?.avatar || reel.userAvatar || (reel.username?.[0]?.toUpperCase() || "W")}
                      </div>
                    </Link>
                    <div className="reel-creator-info">
                      <Link href={\`/user/\${reel.userId}\`} onClick={e => e.stopPropagation()} className="reel-username-link">
                        @{reel.username || "wildlifeuser"}
                        {(reel.userVerified || demoUser?.verified) && <BlueTick size={14} />}
                      </Link>
                    </div>
                    {!isOwn && (
                      <button
                        className={\`reel-follow-btn \${isFollowed ? "following" : ""}\`}
                        onClick={e => { e.stopPropagation(); handleFollowToggle(reel.userId); }}
                      >
                        {isFollowed ? "Following" : "+ Follow"}
                      </button>
                    )}
                  </div>

                  <div className="reel-title">{reel.title}</div>
                  {reel.desc && (
                    <div className="reel-desc">
                      {reel.desc.length > 80 ? reel.desc.slice(0, 80) + "..." : reel.desc}
                    </div>
                  )}

                  {reel.hashtags && (
                    <div className="reel-hashtags">
                      {String(reel.hashtags).split(/[\s,]+/).filter(Boolean).slice(0, 4).map(h => (
                        <span key={h} className="reel-hashtag">
                          {h.startsWith("#") ? h : "#" + h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="reel-meta-row">
                    <span>👁️ {fmt(reel.views || 0)}</span>
                    <span>🔄 {fmt(reel.shares || 0)}</span>
                    {reel.location && <span>📍 {reel.location}</span>}
                    <span className="reel-cat-badge">{reel.category || reel.cat}</span>
                  </div>
                </div>

                <div className="reel-actions-right">
                  <div className="reel-action-col">
                    <button className={\`reel-action-btn like-btn \${liked ? "liked" : ""}\`} onClick={e => { e.stopPropagation(); handleLike(reel); }}>
                      <span className="reel-action-icon">{liked ? "❤️" : "🤍"}</span>
                      <span className="reel-action-count">{fmt(likes)}</span>
                    </button>

                    <button className="reel-action-btn" onClick={e => { e.stopPropagation(); setCommentsReel(reel); }}>
                      <span className="reel-action-icon">💬</span>
                      <span className="reel-action-count">{fmt(reel.comments || 0)}</span>
                    </button>

                    <button className="reel-action-btn" onClick={e => { e.stopPropagation(); handleShare(reel); }}>
                      <span className="reel-action-icon">✈️</span>
                      <span className="reel-action-count">{fmt(reel.shares || 0)}</span>
                    </button>

                    <button className={\`reel-action-btn \${saved ? "saved" : ""}\`} onClick={e => { e.stopPropagation(); handleSave(reel.id); }}>
                      <span className="reel-action-icon">{saved ? "🔖" : "📑"}</span>
                      <span className="reel-action-count">Save</span>
                    </button>

                    {reel.videoUrl && (
                      <button className="reel-action-btn" onClick={e => { e.stopPropagation(); setMuted(m => !m); }}>
                        <span className="reel-action-icon">{muted ? "🔇" : "🔊"}</span>
                        <span className="reel-action-count">{muted ? "Muted" : "Sound"}</span>
                      </button>
                    )}

                    {(isOwn || isAdmin) && (
                      <button className="reel-action-btn danger-btn" onClick={e => { e.stopPropagation(); handleDeleteReel(reel.id); }}>
                        <span className="reel-action-icon">🗑️</span>
                        <span className="reel-action-count">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {commentsReel && (
        <CommentsPanel reel={commentsReel} onClose={() => setCommentsReel(null)} />
      )}

      {uploadOpen && (
        <UploadReel onClose={() => setUploadOpen(false)} onUploaded={() => setUploadOpen(false)} />
      )}
    </div>
  );
}
`;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Reels.jsx') fs.writeFileSync(full, originalReelsCode, 'utf8');
  }
}
scan('.');
console.log("✅ Step 1 Complete: Reels.jsx Restored!");
