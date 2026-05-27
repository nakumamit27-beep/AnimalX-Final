import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import animals from "../data/animals";
import { DEMO_REELS, DEMO_USERS } from "../data/demoUsers";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";

const ALLOWED_KEYWORDS = [
  "animal","lion","tiger","bird","fish","forest","wildlife","nature","jungle","ocean",
  "elephant","shark","whale","dolphin","eagle","snake","tree","reef","safari","reptile",
  "insect","mammal","desert","mountain","sea","river","wild","park","zoo","habitat",
];

function isAllowedContent(caption) {
  if (!caption) return true;
  const lower = caption.toLowerCase();
  return ALLOWED_KEYWORDS.some((k) => lower.includes(k));
}

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
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

      <div className="upload-warning">⚠️ Upload only animal / wildlife / nature content. Other content is not allowed.</div>

      {tab === "reels" && <ReelsTab user={user} isVerified={isVerified} profile={profile} updateProfile={updateProfile} />}
      {tab === "posts" && <PostsTab user={user} isVerified={isVerified} profile={profile} updateProfile={updateProfile} />}
      {tab === "stories" && <StoriesTab user={user} isVerified={isVerified} />}
    </div>
  );
}

/* ========================== REELS ========================== */
function ReelsTab({ user, isVerified, profile, updateProfile }) {
  const { likedReels, likeReel, following, followUser, unfollowUser } = useSocial();
  const [, navigate] = useLocation();

  const [reels, setReels] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ax_user_reels") || "[]");
    return [...saved, ...DEMO_REELS];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeTap, setLikeTap] = useState(false);
  const touchStartY = useRef(null);
  const fileInputRef = useRef(null);
  const doubleTapTimer = useRef(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const userReels = reels.filter((r) => r.type === "video");
    localStorage.setItem("ax_user_reels", JSON.stringify(userReels));
  }, [reels]);

  const goTo = useCallback((index) => {
    const clamped = (index + reels.length) % reels.length;
    setCurrentIndex(clamped);
  }, [reels.length]);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first to upload reels."); return; }
    const caption = window.prompt("Add a caption (must mention animal/wildlife/nature):", "Wildlife reel") || "wildlife";
    if (!isAllowedContent(caption)) { alert("❌ Only animal and nature content allowed."); return; }
    const url = URL.createObjectURL(file);
    const newReel = {
      id: `u_${Date.now()}`, type: "video", url, title: caption,
      user: user.name || user.email, username: user.name || user.email,
      userId: user.uid, verified: isVerified, uploadedAt: Date.now(),
      likes: 0, views: 0, shares: 0,
    };
    setReels((prev) => [newReel, ...prev]);
    setCurrentIndex(0);
    updateProfile({ reels: (profile.reels || 0) + 1 });
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleLike();
      setLikeTap(true);
      setTimeout(() => setLikeTap(false), 800);
    }
    lastTap.current = now;
  }

  async function handleLike() {
    if (!user) { navigate("/auth"); return; }
    const reel = reels[currentIndex];
    await likeReel(reel.id);
  }

  const updateReel = (id, updates) => {
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1); }
    touchStartY.current = null;
  };
  const handleWheel = (e) => {
    if (e.deltaY > 50) goTo(currentIndex + 1);
    else if (e.deltaY < -50) goTo(currentIndex - 1);
  };

  const reel = reels[currentIndex];
  const isLiked = !!likedReels[reel?.id];
  const isFollowing = reel?.userId ? !!following[reel.userId] : false;
  const isOwnReel = reel?.userId === user?.uid || reel?.username === user?.name;

  return (
    <div className="reels-page" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onWheel={handleWheel}>
      <div className="reels-upload-bar">
        <span className="reels-label">🎬 Wildlife Reels</span>
        {user ? (
          <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>➕ Upload Reel</button>
        ) : (
          <Link href="/auth" className="upload-btn" style={{ textDecoration: "none" }}>🔑 Login to Upload</Link>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      <div className="reel-card-outer" onClick={handleDoubleTap}>
        {reel?.type === "video" ? (
          <VideoReel reel={reel} onUpdate={updateReel} />
        ) : (
          <DefaultReel reel={reel} animals={animals} />
        )}

        {likeTap && <div className="like-heart-pop">❤️</div>}

        {/* Author info overlay */}
        <div className="reel-author-overlay">
          <div className="reel-author-info">
            <div
              className="reel-author-avatar"
              onClick={(e) => { e.stopPropagation(); if (reel.userId && !reel.userId.startsWith("demo_")) navigate(`/user/${reel.userId}`); else if (reel.username) navigate(`/user/${reel.username}`); }}
            >
              {(reel.username || reel.user || "W")[0].toUpperCase()}
            </div>
            <div className="reel-author-details">
              <span
                className="reel-author-username"
                onClick={(e) => { e.stopPropagation(); if (reel.userId && !reel.userId.startsWith("demo_")) navigate(`/user/${reel.userId}`); else if (reel.username) navigate(`/user/${reel.username}`); }}
              >
                @{reel.username || reel.user || "wildlifeuser"}
                {(reel.userVerified || reel.verified) && <BlueTick size={14} />}
              </span>
              {!isOwnReel && (
                <button
                  className={`reel-follow-btn ${isFollowing ? "following" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) { navigate("/auth"); return; }
                    const targetId = reel.userId || reel.username;
                    isFollowing ? unfollowUser(targetId) : followUser(targetId, reel.username || reel.user);
                  }}
                >
                  {isFollowing ? "Following ✓" : "+ Follow"}
                </button>
              )}
            </div>
          </div>
          <div className="reel-caption">{reel.title || reel.desc}</div>
        </div>

        {/* Actions sidebar */}
        <div className="reel-actions-sidebar" onClick={e => e.stopPropagation()}>
          <button
            className={`reel-action-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <span className="reel-action-icon" style={{ fontSize: 24 }}>{isLiked ? "❤️" : "🤍"}</span>
            <span>{fmtNum(reel.likes || 0)}</span>
          </button>
          <div className="reel-action-btn view-count">
            <span className="reel-action-icon">👁</span>
            <span>{fmtNum(reel.views || 0)}</span>
          </div>
          <button
            className="reel-action-btn"
            onClick={() => {
              if (navigator.share) navigator.share({ title: reel.title || "Animal X Reel", url: window.location.href }).catch(() => {});
              else { navigator.clipboard?.writeText(window.location.href).catch(() => {}); alert("Link copied!"); }
            }}
          >
            <span className="reel-action-icon">🔁</span>
            <span>{fmtNum(reel.shares || 0)}</span>
          </button>
          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex - 1)}>↑</button>
          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex + 1)}>↓</button>
        </div>

        <div className="reel-progress-dots">
          {reels.slice(0, 20).map((_, i) => (
            <div key={i} className={`progress-dot ${i === currentIndex ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); goTo(i); }} />
          ))}
        </div>

        <div className="reel-counter">{currentIndex + 1} / {reels.length}</div>
        <div className="reel-hint">↕ Swipe or scroll · Double-tap to like</div>
      </div>
    </div>
  );
}

function VideoReel({ reel, onUpdate }) {
  const videoRef = useRef(null);
  const [played, setPlayed] = useState(false);
  return (
    <div className="reel-video-wrap">
      <video
        ref={videoRef}
        src={reel.url}
        autoPlay loop muted playsInline
        className="reel-video"
        onPlay={() => { if (!played) { onUpdate(reel.id, { views: (reel.views || 0) + 1 }); setPlayed(true); } }}
      />
      <div className="reel-video-info">
        <h2 className="reel-title-overlay">{reel.title}</h2>
      </div>
    </div>
  );
}

function DefaultReel({ reel, animals }) {
  return (
    <div className="reel-default" style={{ background: reel.bg }}>
      <div className="reel-overlay" />
      <div className="reel-content">
        <div className="reel-emoji-large">{reel.emoji}</div>
        <div className="reel-category-badge">{reel.category}</div>
        <h2 className="reel-title">{reel.title}</h2>
        <p className="reel-desc">{reel.desc}</p>
        <div className="reel-stats">
          {animals.filter((a) => a.category === reel.category).length} animals in this category
        </div>
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
  const [likedPosts, setLikedPosts] = useState(() => JSON.parse(localStorage.getItem("ax_liked_posts") || "{}"));
  const fileRef = useRef(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    localStorage.setItem("ax_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("ax_liked_posts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  function seedPosts() {
    return [
      { id: "p1", user: "wildlion_africa", userId: "du01", verified: true, caption: "Bengal tiger at sunrise — Ranthambore 🐅", media: "https://loremflickr.com/600/600/tiger?lock=11", isVideo: false, likes: 1240, shares: 122, ts: Date.now() - 1000000 },
      { id: "p2", user: "ocean_queen_mia", userId: "du02", verified: true, caption: "Dolphin pod off the Maldives 🐬", media: "https://loremflickr.com/600/600/dolphin?lock=22", isVideo: false, likes: 890, shares: 56, ts: Date.now() - 2000000 },
      { id: "p3", user: "eagle_eye_anya", userId: "du04", verified: true, caption: "Peregrine falcon stoop at 380+ km/h 🦅", media: "https://loremflickr.com/600/600/eagle?lock=33", isVideo: false, likes: 2100, shares: 198, ts: Date.now() - 3000000 },
      { id: "p4", user: "wolf_tracker_nw", userId: "du06", verified: true, caption: "Wolf pack at Yellowstone sunset 🐺", media: "https://loremflickr.com/600/600/wolf?lock=44", isVideo: false, likes: 3450, shares: 341, ts: Date.now() - 5000000 },
    ];
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first to post."); return; }
    const caption = window.prompt("Caption (must mention animal/wildlife/nature):", "Wildlife post") || "wildlife";
    if (!isAllowedContent(caption)) { alert("❌ Only animal and nature content allowed."); return; }
    const url = URL.createObjectURL(file);
    const newPost = {
      id: `p_${Date.now()}`, user: user.name || user.email, userId: user.uid,
      verified: isVerified, caption, media: url,
      isVideo: file.type.startsWith("video"), likes: 0, shares: 0, ts: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
    updateProfile({ posts: (profile.posts || 0) + 1 });
  }

  function toggleLike(id, currentLikes) {
    if (!user) { navigate("/auth"); return; }
    const alreadyLiked = !!likedPosts[id];
    setLikedPosts(prev => {
      const next = { ...prev };
      if (alreadyLiked) delete next[id];
      else next[id] = true;
      return next;
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1 } : p));
  }

  function share(id) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)));
    if (navigator.share) navigator.share({ title: "Animal X Post", url: window.location.href }).catch(() => {});
    else navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  return (
    <div className="posts-page">
      <div className="reels-upload-bar">
        <span className="reels-label">📸 Wildlife Posts</span>
        {user ? (
          <button className="upload-btn" onClick={() => fileRef.current?.click()}>➕ New Post</button>
        ) : (
          <Link href="/auth" className="upload-btn" style={{ textDecoration: "none" }}>🔑 Login to Post</Link>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      <div className="posts-feed">
        {posts.map((p) => (
          <div key={p.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">{(p.user || "U")[0].toUpperCase()}</div>
              <div className="post-user-info">
                <Link href={p.userId && !p.userId.startsWith("du") ? `/user/${p.userId}` : `/user/${p.user}`} className="post-username">
                  @{p.user}
                  {p.verified && <BlueTick size={14} />}
                </Link>
              </div>
            </div>
            <div className="post-media-wrap">
              {p.isVideo ? (
                <video src={p.media} controls loop muted playsInline className="post-media" />
              ) : (
                <img src={p.media} alt={p.caption} className="post-media" />
              )}
            </div>
            <div className="post-actions">
              <button className={`post-like-btn ${likedPosts[p.id] ? "liked" : ""}`} onClick={() => toggleLike(p.id, p.likes)}>
                {likedPosts[p.id] ? "❤️" : "🤍"} {p.likes}
              </button>
              <button onClick={() => share(p.id)}>🔁 {p.shares}</button>
            </div>
            <p className="post-caption"><b>@{p.user}</b> {p.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================== STORIES ========================== */
function StoriesTab({ user, isVerified }) {
  const [stories, setStories] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ax_stories") || "[]");
    const now = Date.now();
    const fresh = saved.filter((s) => now - s.ts < 24 * 60 * 60 * 1000);
    if (fresh.length !== saved.length) localStorage.setItem("ax_stories", JSON.stringify(fresh));
    return fresh.length ? fresh : seedStories();
  });
  const fileRef = useRef(null);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    localStorage.setItem("ax_stories", JSON.stringify(stories));
  }, [stories]);

  function seedStories() {
    return [
      { id: "s1", user: "wildlion_africa", verified: true, media: "https://loremflickr.com/400/700/lion?lock=51", isVideo: false, ts: Date.now() - 3000000 },
      { id: "s2", user: "ocean_queen_mia", verified: true, media: "https://loremflickr.com/400/700/dolphin?lock=52", isVideo: false, ts: Date.now() - 5000000 },
      { id: "s3", user: "eagle_eye_anya", verified: true, media: "https://loremflickr.com/400/700/eagle?lock=53", isVideo: false, ts: Date.now() - 7000000 },
      { id: "s4", user: "wolf_tracker_nw", verified: false, media: "https://loremflickr.com/400/700/wolf?lock=54", isVideo: false, ts: Date.now() - 9000000 },
    ];
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first."); return; }
    const url = URL.createObjectURL(file);
    setStories((prev) => [
      { id: `s_${Date.now()}`, user: user.name || user.email, verified: isVerified, media: url, isVideo: file.type.startsWith("video"), ts: Date.now() },
      ...prev,
    ]);
  }

  return (
    <div className="stories-page">
      <div className="reels-upload-bar">
        <span className="reels-label">🔴 Stories (auto-delete after 24h)</span>
        {user ? (
          <button className="upload-btn" onClick={() => fileRef.current?.click()}>➕ Add Story</button>
        ) : (
          <Link href="/auth" className="upload-btn" style={{ textDecoration: "none" }}>🔑 Login</Link>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      <div className="stories-strip">
        {stories.map((s) => (
          <div key={s.id} className="story-bubble" onClick={() => setViewing(s)}>
            <div className="story-ring">
              <div className="story-inner">{(s.user || "U")[0].toUpperCase()}</div>
            </div>
            <div className="story-name">
              {s.user.split("_")[0]}
              {s.verified && <BlueTick size={12} />}
            </div>
          </div>
        ))}
      </div>

      <div className="stories-grid">
        {stories.map((s) => (
          <div key={s.id} className="story-thumb" onClick={() => setViewing(s)}>
            {s.isVideo ? (
              <video src={s.media} muted loop autoPlay playsInline />
            ) : (
              <img src={s.media} alt={s.user} />
            )}
            <div className="story-thumb-user">@{s.user}{s.verified && <BlueTick size={12} />}</div>
          </div>
        ))}
      </div>

      {viewing && (
        <div className="story-viewer" onClick={() => setViewing(null)}>
          <button className="story-close" onClick={() => setViewing(null)}>✕</button>
          <div className="story-viewer-content">
            {viewing.isVideo ? (
              <video src={viewing.media} controls autoPlay loop playsInline />
            ) : (
              <img src={viewing.media} alt={viewing.user} />
            )}
            <div className="story-viewer-caption">@{viewing.user}{viewing.verified && <BlueTick size={16} />}</div>
          </div>
        </div>
      )}
    </div>
  );
}
