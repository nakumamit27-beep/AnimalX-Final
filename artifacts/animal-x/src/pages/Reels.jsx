import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { DEMO_REELS, FAKE_FEED_REELS } from "../data/demoUsers";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";
import {
  analyzeContent, getModerationStatus, recordViolation,
  isCurrentlyBanned, getBanTimeLeft,
} from "../utils/contentModeration";

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n || 0);
}

export default function Reels() {
  const { user, isVerified, profile, updateProfile } = useAuth();
  const [tab, setTab] = useState("reels");

  return (
    <div className="reels-shell">
      <div className="reels-tabs-bar">
        <button className={`rt-tab ${tab === "stories" ? "active" : ""}`} onClick={() => setTab("stories")}>🔴 Stories</button>
        <button className={`rt-tab ${tab === "reels" ? "active" : ""}`} onClick={() => setTab("reels")}>🎬 Reels</button>
        <button className={`rt-tab ${tab === "posts" ? "active" : ""}`} onClick={() => setTab("posts")}>📸 Posts</button>
      </div>
      <div className="upload-warning">⚠️ Upload only animal / wildlife / nature content</div>
      {tab === "reels"   && <ReelsTab user={user} isVerified={isVerified} profile={profile} updateProfile={updateProfile} />}
      {tab === "posts"   && <PostsTab user={user} isVerified={isVerified} profile={profile} updateProfile={updateProfile} />}
      {tab === "stories" && <StoriesTab user={user} isVerified={isVerified} />}
    </div>
  );
}

/* ========================== REELS TAB ========================== */
function buildFeed(userReels) {
  // Real user reels FIRST (boost), then demo, then fake
  return [...userReels, ...DEMO_REELS, ...FAKE_FEED_REELS];
}

function ReelsTab({ user, isVerified, profile, updateProfile }) {
  const { likedReels, likeReel, following, followUser, unfollowUser } = useSocial();
  const [, navigate] = useLocation();

  const [userReels, setUserReels] = useState(() =>
    JSON.parse(localStorage.getItem("ax_user_reels") || "[]")
  );
  const feed = buildFeed(userReels);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeTap, setLikeTap] = useState(false);
  const fileInputRef = useRef(null);
  const lastTap = useRef(0);
  const feedRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [warnModal, setWarnModal] = useState(null);
  const [banModal, setBanModal] = useState(null);

  useEffect(() => {
    localStorage.setItem("ax_user_reels", JSON.stringify(userReels));
  }, [userReels]);

  /* Scroll-snap index tracker */
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    function onScroll() {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setCurrentIndex(idx);
      setMenuOpen(false);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, feed.length - 1));
    const el = feedRef.current;
    if (el) el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
    setMenuOpen(false);
  }, [feed.length]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login to upload reels."); return; }
    const modStatus = await getModerationStatus(user.uid);
    if (isCurrentlyBanned(modStatus)) {
      setBanModal({ timeLeft: modStatus.permanentBan ? "permanently" : `for ${getBanTimeLeft(modStatus)}` });
      e.target.value = ""; return;
    }
    const caption = window.prompt("Caption (mention animal/wildlife/nature):", "Wildlife reel") || "";
    const check = analyzeContent(caption, file.name);
    if (!check.allowed) {
      const updated = await recordViolation(user.uid, check.reason);
      setWarnModal({ level: Math.min(updated?.warnings || 1, 3), message: check.reason, banned: isCurrentlyBanned(updated) });
      e.target.value = ""; return;
    }
    const url = URL.createObjectURL(file);
    const newReel = {
      id: `u_${Date.now()}`, type: "video", url,
      title: caption || "Wildlife reel",
      user: user.name || user.email, username: user.name || user.email,
      userId: user.uid, verified: isVerified,
      uploadedAt: Date.now(), likes: 0, views: 0, shares: 0,
    };
    setUserReels(prev => [newReel, ...prev]);
    goTo(0);
    updateProfile({ reels: (profile.reels || 0) + 1 });
    e.target.value = "";
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const reel = feed[currentIndex];
      if (reel) {
        if (!user) { navigate("/auth"); return; }
        likeReel(reel.id);
        setLikeTap(true);
        setTimeout(() => setLikeTap(false), 800);
      }
    }
    lastTap.current = Date.now();
  }

  function handleDeleteReel() {
    const reel = feed[currentIndex];
    setUserReels(prev => prev.filter(r => r.id !== reel.id));
    setDeleteConfirm(false); setMenuOpen(false);
    updateProfile({ reels: Math.max(0, (profile.reels || 1) - 1) });
  }

  const reel = feed[currentIndex];
  const isLiked = !!likedReels[reel?.id];
  const isFollowing = reel?.userId ? !!following[reel.userId] : false;
  const isOwnReel = reel?.userId === user?.uid;

  return (
    <div className="reels-page">
      <div className="reels-upload-bar">
        <span className="reels-label">🎬 Wildlife Reels</span>
        {user
          ? <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>➕ Upload</button>
          : <Link href="/auth" className="upload-btn" style={{ textDecoration: "none" }}>🔑 Login</Link>
        }
        <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      {/* Snap-scroll feed container */}
      <div className="reels-snap-feed" ref={feedRef} onClick={handleDoubleTap}>
        {feed.map((r, i) => (
          <div key={r.id} className="reel-snap-slide">
            {r.type === "video"
              ? <VideoSlide reel={r} active={i === currentIndex} />
              : <DefaultSlide reel={r} />
            }

            {/* Author overlay */}
            <div className="reel-author-overlay">
              <div className="reel-author-info">
                <div className="reel-author-avatar"
                  onClick={e => { e.stopPropagation(); if (r.userId) navigate(`/user/${r.userId}`); }}>
                  {(r.username || r.user || "W")[0].toUpperCase()}
                </div>
                <div className="reel-author-details">
                  <span className="reel-author-username"
                    onClick={e => { e.stopPropagation(); if (r.userId) navigate(`/user/${r.userId}`); }}>
                    @{r.username || r.user || "wildlifeuser"}
                    {(r.userVerified || r.verified) && <BlueTick size={13} />}
                  </span>
                  {!isOwnReel && i === currentIndex && (
                    <button
                      className={`reel-follow-btn ${isFollowing ? "following" : ""}`}
                      onClick={e => {
                        e.stopPropagation();
                        if (!user) { navigate("/auth"); return; }
                        const tid = r.userId || r.username;
                        isFollowing ? unfollowUser(tid) : followUser(tid, r.username || r.user);
                      }}
                    >
                      {isFollowing ? "Following ✓" : "+ Follow"}
                    </button>
                  )}
                </div>
              </div>
              <div className="reel-caption">{r.title || r.desc}</div>
            </div>

            {/* Like animation */}
            {likeTap && i === currentIndex && <div className="like-heart-pop">❤️</div>}

            {/* ⋮ own reel menu */}
            {isOwnReel && user && i === currentIndex && (
              <div className="reel-menu-wrap" onClick={e => e.stopPropagation()}>
                <button className="reel-menu-btn" onClick={() => setMenuOpen(v => !v)}>⋮</button>
                {menuOpen && (
                  <div className="reel-menu-popup">
                    <button onClick={() => {
                      const t = window.prompt("Edit caption:", r.title || "");
                      if (t !== null) setUserReels(prev => prev.map(x => x.id === r.id ? { ...x, title: t } : x));
                      setMenuOpen(false);
                    }}>✏️ Edit Caption</button>
                    <button className="danger-item" onClick={() => { setDeleteConfirm(true); setMenuOpen(false); }}>🗑️ Delete</button>
                    <button onClick={() => setMenuOpen(false)}>✕ Cancel</button>
                  </div>
                )}
              </div>
            )}

            {/* Actions sidebar */}
            {i === currentIndex && (
              <div className="reel-actions-sidebar" onClick={e => e.stopPropagation()}>
                <button className={`reel-action-btn ${isLiked ? "liked" : ""}`} onClick={() => {
                  if (!user) { navigate("/auth"); return; }
                  likeReel(r.id);
                }}>
                  <span style={{ fontSize: 24 }}>{isLiked ? "❤️" : "🤍"}</span>
                  <span>{fmtNum(r.likes)}</span>
                </button>
                <div className="reel-action-btn">
                  <span>👁</span><span>{fmtNum(r.views)}</span>
                </div>
                <button className="reel-action-btn" onClick={() => {
                  if (navigator.share) navigator.share({ title: r.title, url: window.location.href }).catch(() => {});
                  else navigator.clipboard?.writeText(window.location.href).catch(() => {});
                }}>
                  <span>🔁</span><span>{fmtNum(r.shares)}</span>
                </button>
                <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex - 1)}>↑</button>
                <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex + 1)}>↓</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="reel-counter">{currentIndex + 1} / {feed.length}</div>

      {/* Modals */}
      {deleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-box">
            <div className="delete-confirm-icon">⚠️</div>
            <div className="delete-confirm-title">Delete this reel permanently?</div>
            <div className="delete-confirm-note">This action cannot be undone.</div>
            <div className="delete-confirm-btns">
              <button className="delete-btn-confirm" onClick={handleDeleteReel}>🗑️ Delete</button>
              <button className="delete-btn-cancel" onClick={() => setDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {warnModal && (
        <div className="warn-overlay">
          <div className="warn-box">
            <div className="warn-icon">⚠️</div>
            <div className="warn-title">Warning {warnModal.level}/3</div>
            <div className="warn-message">Only animal & nature videos are allowed.</div>
            <div className="warn-reason">{warnModal.message}</div>
            {warnModal.banned && <div className="warn-banned">🚫 Uploads restricted for 30 days.</div>}
            <button className="warn-ok-btn" onClick={() => setWarnModal(null)}>I Understand</button>
          </div>
        </div>
      )}
      {banModal && (
        <div className="warn-overlay">
          <div className="warn-box">
            <div className="warn-icon">🚫</div>
            <div className="warn-title">Uploads Restricted</div>
            <div className="warn-message">Uploads restricted {banModal.timeLeft} due to repeated violations.</div>
            <button className="warn-ok-btn" onClick={() => setBanModal(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- Video slide with black-screen fix -------- */
function VideoSlide({ reel, active }) {
  const videoRef = useRef(null);
  const [errored, setErrored] = useState(false);
  const posterUrl = `https://loremflickr.com/400/711/wildlife?lock=${reel.id}`;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active]);

  function handleError() {
    setErrored(true);
    // retry once after 1s
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
        setErrored(false);
      }
    }, 1000);
  }

  return (
    <div className="reel-video-wrap">
      {errored
        ? <img src={posterUrl} alt={reel.title} className="reel-poster-fallback" />
        : (
          <video
            ref={videoRef}
            src={reel.url}
            poster={posterUrl}
            loop muted playsInline
            preload="metadata"
            className="reel-video"
            onError={handleError}
          />
        )
      }
      <div className="reel-video-info"><h2 className="reel-title-overlay">{reel.title}</h2></div>
    </div>
  );
}

/* -------- Default (non-video) slide -------- */
function DefaultSlide({ reel }) {
  return (
    <div className="reel-default" style={{ background: reel.bg }}>
      <div className="reel-overlay" />
      <div className="reel-content">
        <div className="reel-emoji-large">{reel.emoji}</div>
        <div className="reel-category-badge">{reel.category}</div>
        <h2 className="reel-title">{reel.title}</h2>
        <p className="reel-desc">{reel.desc}</p>
      </div>
    </div>
  );
}

/* ========================== POSTS ========================== */
function PostsTab({ user, isVerified, profile, updateProfile }) {
  const [posts, setPosts] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ax_posts") || "[]");
    return saved.length ? saved : seedPosts();
  });
  const [likedPosts, setLikedPosts] = useState(() =>
    JSON.parse(localStorage.getItem("ax_liked_posts") || "{}")
  );
  const fileRef = useRef(null);
  const [, navigate] = useLocation();
  const [menuId, setMenuId] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [warnModal, setWarnModal] = useState(null);

  useEffect(() => { localStorage.setItem("ax_posts", JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem("ax_liked_posts", JSON.stringify(likedPosts)); }, [likedPosts]);

  function seedPosts() {
    return [
      { id:"p1", user:"wildlion_africa",  userId:"du01", verified:true,  caption:"Bengal tiger at sunrise 🐅",         media:"https://loremflickr.com/600/600/tiger?lock=11",   isVideo:false, likes:12400, shares:1220, ts:Date.now()-1000000 },
      { id:"p2", user:"ocean_queen_mia",  userId:"du02", verified:true,  caption:"Dolphin pod off the Maldives 🐬",     media:"https://loremflickr.com/600/600/dolphin?lock=22", isVideo:false, likes:8900,  shares:560,  ts:Date.now()-2000000 },
      { id:"p3", user:"eagle_eye_anya",   userId:"du04", verified:true,  caption:"Peregrine falcon stoop at 380+ km/h 🦅",media:"https://loremflickr.com/600/600/eagle?lock=33",isVideo:false, likes:21000, shares:1980, ts:Date.now()-3000000 },
      { id:"p4", user:"wolf_tracker_nw",  userId:"du06", verified:true,  caption:"Wolf pack at Yellowstone sunset 🐺",  media:"https://loremflickr.com/600/600/wolf?lock=44",   isVideo:false, likes:34500, shares:3410, ts:Date.now()-5000000 },
    ];
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first to post."); return; }
    const modStatus = await getModerationStatus(user.uid);
    if (isCurrentlyBanned(modStatus)) {
      alert(`Posts restricted due to repeated violations.`);
      e.target.value = ""; return;
    }
    const caption = window.prompt("Caption (must mention animal/wildlife/nature):", "Wildlife post") || "";
    const check = analyzeContent(caption, file.name);
    if (!check.allowed) {
      const updated = await recordViolation(user.uid, check.reason);
      setWarnModal({ level: Math.min(updated?.warnings || 1, 3), message: check.reason, banned: isCurrentlyBanned(updated) });
      e.target.value = ""; return;
    }
    const url = URL.createObjectURL(file);
    setPosts(prev => [{
      id: `p_${Date.now()}`, user: user.name || user.email, userId: user.uid,
      verified: isVerified, caption, media: url,
      isVideo: file.type.startsWith("video"), likes: 0, shares: 0, ts: Date.now(),
    }, ...prev]);
    updateProfile({ posts: (profile.posts || 0) + 1 });
    e.target.value = "";
  }

  function deletePost(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeletePostId(null); setMenuId(null);
    updateProfile({ posts: Math.max(0, (profile.posts || 1) - 1) });
  }

  function toggleLike(id) {
    if (!user) { navigate("/auth"); return; }
    const liked = !!likedPosts[id];
    setLikedPosts(prev => { const n = { ...prev }; if (liked) delete n[id]; else n[id] = true; return n; });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: liked ? p.likes - 1 : p.likes + 1 } : p));
  }

  return (
    <div className="posts-page">
      <div className="reels-upload-bar">
        <span className="reels-label">📸 Wildlife Posts</span>
        {user
          ? <button className="upload-btn" onClick={() => fileRef.current?.click()}>➕ New Post</button>
          : <Link href="/auth" className="upload-btn" style={{ textDecoration: "none" }}>🔑 Login</Link>
        }
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      {warnModal && (
        <div className="warn-overlay"><div className="warn-box">
          <div className="warn-icon">⚠️</div>
          <div className="warn-title">Warning {warnModal.level}/3</div>
          <div className="warn-message">Only animal & nature content allowed.</div>
          <div className="warn-reason">{warnModal.message}</div>
          {warnModal.banned && <div className="warn-banned">🚫 Posts restricted for 30 days.</div>}
          <button className="warn-ok-btn" onClick={() => setWarnModal(null)}>I Understand</button>
        </div></div>
      )}

      {deletePostId && (
        <div className="delete-confirm-overlay"><div className="delete-confirm-box">
          <div className="delete-confirm-icon">⚠️</div>
          <div className="delete-confirm-title">Delete this post permanently?</div>
          <div className="delete-confirm-btns">
            <button className="delete-btn-confirm" onClick={() => deletePost(deletePostId)}>🗑️ Delete</button>
            <button className="delete-btn-cancel" onClick={() => setDeletePostId(null)}>Cancel</button>
          </div>
        </div></div>
      )}

      <div className="posts-feed">
        {posts.map(p => {
          const isOwn = p.userId === user?.uid;
          return (
            <div key={p.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">{(p.user || "U")[0].toUpperCase()}</div>
                <Link href={`/user/${p.userId || p.user}`} className="post-username">
                  @{p.user}{p.verified && <BlueTick size={14} />}
                </Link>
                {isOwn && user && (
                  <div className="post-menu-wrap">
                    <button className="post-menu-btn" onClick={() => setMenuId(menuId === p.id ? null : p.id)}>⋮</button>
                    {menuId === p.id && (
                      <div className="post-menu-popup">
                        <button className="danger-item" onClick={() => { setDeletePostId(p.id); setMenuId(null); }}>🗑️ Delete</button>
                        <button onClick={() => setMenuId(null)}>✕ Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="post-media-wrap">
                {p.isVideo
                  ? <video src={p.media} controls loop muted playsInline className="post-media" />
                  : <img src={p.media} alt={p.caption} className="post-media"
                      onError={e => { e.target.src = `https://loremflickr.com/600/600/wildlife?lock=${p.id}`; }} />
                }
              </div>
              <div className="post-actions">
                <button className={`post-like-btn ${likedPosts[p.id] ? "liked" : ""}`} onClick={() => toggleLike(p.id)}>
                  {likedPosts[p.id] ? "❤️" : "🤍"} {fmtNum(p.likes)}
                </button>
                <button onClick={() => setPosts(prev => prev.map(x => x.id === p.id ? { ...x, shares: x.shares + 1 } : x))}>
                  🔁 {fmtNum(p.shares)}
                </button>
              </div>
              <p className="post-caption"><b>@{p.user}</b> {p.caption}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========================== STORIES ========================== */
function StoriesTab({ user, isVerified }) {
  const [stories, setStories] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ax_stories") || "[]");
    const now = Date.now();
    const fresh = saved.filter(s => now - s.ts < 24 * 60 * 60 * 1000);
    if (fresh.length !== saved.length) localStorage.setItem("ax_stories", JSON.stringify(fresh));
    return fresh.length ? fresh : seedStories();
  });
  const fileRef = useRef(null);
  const [viewing, setViewing] = useState(null);
  const [deleteStoryId, setDeleteStoryId] = useState(null);
  const [menuId, setMenuId] = useState(null);

  useEffect(() => { localStorage.setItem("ax_stories", JSON.stringify(stories)); }, [stories]);

  function seedStories() {
    return [
      { id:"s1", user:"wildlion_africa", verified:true,  media:"https://loremflickr.com/400/700/lion?lock=51",    isVideo:false, ts:Date.now()-3000000 },
      { id:"s2", user:"ocean_queen_mia", verified:true,  media:"https://loremflickr.com/400/700/dolphin?lock=52", isVideo:false, ts:Date.now()-5000000 },
      { id:"s3", user:"eagle_eye_anya",  verified:true,  media:"https://loremflickr.com/400/700/eagle?lock=53",   isVideo:false, ts:Date.now()-7000000 },
      { id:"s4", user:"wolf_tracker_nw", verified:false, media:"https://loremflickr.com/400/700/wolf?lock=54",    isVideo:false, ts:Date.now()-9000000 },
    ];
  }

  function deleteStory(id) {
    setStories(prev => prev.filter(s => s.id !== id));
    if (viewing?.id === id) setViewing(null);
    setDeleteStoryId(null); setMenuId(null);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first."); return; }
    const url = URL.createObjectURL(file);
    setStories(prev => [
      { id:`s_${Date.now()}`, user:user.name||user.email, verified:isVerified, media:url, isVideo:file.type.startsWith("video"), ts:Date.now(), userId:user.uid },
      ...prev,
    ]);
    e.target.value = "";
  }

  return (
    <div className="stories-page">
      <div className="reels-upload-bar">
        <span className="reels-label">🔴 Stories (24h)</span>
        {user
          ? <button className="upload-btn" onClick={() => fileRef.current?.click()}>➕ Add Story</button>
          : <Link href="/auth" className="upload-btn" style={{ textDecoration:"none" }}>🔑 Login</Link>
        }
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={handleUpload} />
      </div>

      {deleteStoryId && (
        <div className="delete-confirm-overlay"><div className="delete-confirm-box">
          <div className="delete-confirm-icon">⚠️</div>
          <div className="delete-confirm-title">Delete this story?</div>
          <div className="delete-confirm-btns">
            <button className="delete-btn-confirm" onClick={() => deleteStory(deleteStoryId)}>🗑️ Delete</button>
            <button className="delete-btn-cancel" onClick={() => setDeleteStoryId(null)}>Cancel</button>
          </div>
        </div></div>
      )}

      <div className="stories-strip">
        {stories.map(s => {
          const isOwn = s.userId === user?.uid;
          return (
            <div key={s.id} className="story-bubble-wrap">
              <div className="story-bubble" onClick={() => setViewing(s)}>
                <div className="story-ring">
                  <div className="story-inner">{(s.user || "U")[0].toUpperCase()}</div>
                </div>
                <div className="story-name">{s.user.split("_")[0]}{s.verified && <BlueTick size={12} />}</div>
              </div>
              {isOwn && user && (
                <div className="story-own-menu">
                  <button onClick={() => setMenuId(menuId === s.id ? null : s.id)}>⋮</button>
                  {menuId === s.id && (
                    <div className="story-menu-popup">
                      <button className="danger-item" onClick={() => { setDeleteStoryId(s.id); setMenuId(null); }}>🗑️ Delete</button>
                      <button onClick={() => setMenuId(null)}>✕ Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="stories-grid">
        {stories.map(s => (
          <div key={s.id} className="story-thumb" onClick={() => setViewing(s)}>
            {s.isVideo
              ? <video src={s.media} muted loop autoPlay playsInline />
              : <img src={s.media} alt={s.user}
                  onError={e => { e.target.src = `https://loremflickr.com/400/700/wildlife?lock=${s.id}`; }} />
            }
            <div className="story-thumb-user">@{s.user}{s.verified && <BlueTick size={12} />}</div>
          </div>
        ))}
      </div>

      {viewing && (
        <div className="story-viewer" onClick={() => setViewing(null)}>
          <button className="story-close" onClick={() => setViewing(null)}>✕</button>
          <div className="story-viewer-content">
            {viewing.isVideo
              ? <video src={viewing.media} controls autoPlay loop playsInline />
              : <img src={viewing.media} alt={viewing.user}
                  onError={e => { e.target.src = `https://loremflickr.com/400/700/wildlife?lock=${viewing.id}`; }} />
            }
            <div className="story-viewer-caption">@{viewing.user}{viewing.verified && <BlueTick size={16} />}</div>
            {viewing.userId === user?.uid && user && (
              <button className="story-viewer-delete"
                onClick={e => { e.stopPropagation(); setDeleteStoryId(viewing.id); setViewing(null); }}>
                🗑️ Delete Story
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
