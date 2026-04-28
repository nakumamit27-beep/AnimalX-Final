import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import animals from "../data/animals";
import { useAuth } from "../context/AuthContext";

const ALLOWED_KEYWORDS = [
  "animal","lion","tiger","bird","fish","forest","wildlife","nature","jungle","ocean",
  "elephant","shark","whale","dolphin","eagle","snake","tree","reef","safari","reptile",
  "insect","mammal","desert","mountain","sea","river","wild","park","zoo","habitat",
];

function isAllowedContent(caption) {
  if (!caption) return true; // empty caption: allow (defaults set later)
  const lower = caption.toLowerCase();
  return ALLOWED_KEYWORDS.some((k) => lower.includes(k));
}

const defaultReels = [
  { id: "d1", type: "default", title: "Lions of the Savanna", category: "Mammals", emoji: "🦁", bg: "linear-gradient(135deg, #f59e0b, #d97706)", desc: "Watch the king of the jungle in their natural habitat.", likes: 0, views: 0, shares: 0 },
  { id: "d2", type: "default", title: "Deep Ocean Wonders", category: "Aquatic", emoji: "🐬", bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", desc: "Dive into the mysteries of the deep sea.", likes: 0, views: 0, shares: 0 },
  { id: "d3", type: "default", title: "Desert Survival", category: "Desert", emoji: "🏜️", bg: "linear-gradient(135deg, #ef4444, #b45309)", desc: "How animals survive extreme heat in deserts.", likes: 0, views: 0, shares: 0 },
  { id: "d4", type: "default", title: "Mountain Eagles", category: "Birds", emoji: "🦅", bg: "linear-gradient(135deg, #6366f1, #4338ca)", desc: "Eagles soar above mountain peaks.", likes: 0, views: 0, shares: 0 },
  { id: "d5", type: "default", title: "Rainforest Reptiles", category: "Reptiles", emoji: "🐍", bg: "linear-gradient(135deg, #22c55e, #15803d)", desc: "Chameleons and geckos in the rainforest canopy.", likes: 0, views: 0, shares: 0 },
  { id: "d6", type: "default", title: "Tiny World", category: "Small Creatures", emoji: "🐜", bg: "linear-gradient(135deg, #f97316, #ea580c)", desc: "Ants, bees, and butterflies — small but mighty.", likes: 0, views: 0, shares: 0 },
  { id: "d7", type: "default", title: "Coral Kingdom", category: "Sea", emoji: "🌊", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)", desc: "Coral reefs teem with life.", likes: 0, views: 0, shares: 0 },
];

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
  const [reels, setReels] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("ax_user_reels") || "[]");
    return [...saved, ...defaultReels];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userReels = reels.filter((r) => r.type === "video");
    localStorage.setItem("ax_user_reels", JSON.stringify(userReels));
  }, [reels]);

  const goTo = (index) => {
    const clamped = (index + reels.length) % reels.length;
    setCurrentIndex(clamped);
  };

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      alert("Please login first to upload reels.");
      return;
    }
    const caption = window.prompt("Add a caption (must mention animal/wildlife/nature):", "Wildlife reel") || "wildlife";
    if (!isAllowedContent(caption)) {
      alert("❌ Only animal and nature content allowed.");
      return;
    }
    const url = URL.createObjectURL(file);
    const newReel = {
      id: `u_${Date.now()}`,
      type: "video",
      url,
      title: caption,
      user: user.name || user.email,
      verified: isVerified,
      uploadedAt: Date.now(),
      likes: 0,
      views: 0,
      shares: 0,
    };
    setReels((prev) => [newReel, ...prev]);
    setCurrentIndex(0);
    updateProfile({ reels: (profile.reels || 0) + 1 });
  }

  const updateReel = (id, updates) => {
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) { if (diff > 0) goTo(currentIndex + 1); else goTo(currentIndex - 1); }
    touchStartY.current = null;
  };
  const handleWheel = (e) => {
    if (e.deltaY > 50) goTo(currentIndex + 1);
    else if (e.deltaY < -50) goTo(currentIndex - 1);
  };

  const reel = reels[currentIndex];

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

      <div className="reel-card-outer">
        {reel.type === "video" ? (
          <VideoReel reel={reel} onUpdate={updateReel} />
        ) : (
          <DefaultReel reel={reel} animals={animals} />
        )}

        <div className="reel-actions-sidebar">
          <button className="reel-action-btn liked" onClick={() => updateReel(reel.id, { likes: reel.likes + 1 })}>
            <span className="reel-action-icon">❤️</span>
            <span>{reel.likes}</span>
          </button>
          <div className="reel-action-btn view-count">
            <span className="reel-action-icon">👁</span>
            <span>{reel.views}</span>
          </div>
          <button
            className="reel-action-btn"
            onClick={() => {
              updateReel(reel.id, { shares: reel.shares + 1 });
              if (navigator.share) {
                navigator.share({ title: reel.title || "Animal X Reel", url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                alert("Link copied to clipboard!");
              }
            }}
          >
            <span className="reel-action-icon">🔁</span>
            <span>{reel.shares}</span>
          </button>
          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex - 1)}>↑</button>
          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex + 1)}>↓</button>
        </div>

        <div className="reel-progress-dots">
          {reels.map((_, i) => (
            <div key={i} className={`progress-dot ${i === currentIndex ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="reel-counter">{currentIndex + 1} / {reels.length}</div>
        <div className="reel-hint">↕ Scroll or swipe · Loops infinitely</div>
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
        autoPlay
        loop
        muted
        playsInline
        className="reel-video"
        onPlay={() => {
          if (!played) { onUpdate(reel.id, { views: reel.views + 1 }); setPlayed(true); }
        }}
      />
      <div className="reel-video-info">
        <div className="reel-user-badge">
          👤 {reel.user || "Wildlife Fan"}
          {reel.verified && <span className="blue-tick" style={{ marginLeft: 4 }}>✓</span>}
        </div>
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
  const fileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("ax_posts", JSON.stringify(posts));
  }, [posts]);

  function seedPosts() {
    return [
      { id: "p1", user: "WildlifePhotographer", verified: true, caption: "Bengal tiger at sunrise — Ranthambore 🐅", media: "https://loremflickr.com/600/600/tiger?lock=11", isVideo: false, likes: 124, shares: 12, ts: Date.now() - 1000000 },
      { id: "p2", user: "OceanExplorer", verified: false, caption: "Dolphin pod off the Maldives 🐬", media: "https://loremflickr.com/600/600/dolphin?lock=22", isVideo: false, likes: 89, shares: 5, ts: Date.now() - 2000000 },
    ];
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      alert("Please login first to post.");
      return;
    }
    const caption = window.prompt("Caption (must mention animal/wildlife/nature):", "Wildlife post") || "wildlife";
    if (!isAllowedContent(caption)) {
      alert("❌ Only animal and nature content allowed.");
      return;
    }
    const url = URL.createObjectURL(file);
    const newPost = {
      id: `p_${Date.now()}`,
      user: user.name || user.email,
      verified: isVerified,
      caption,
      media: url,
      isVideo: file.type.startsWith("video"),
      likes: 0,
      shares: 0,
      ts: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
    updateProfile({ posts: (profile.posts || 0) + 1 });
  }

  function like(id) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
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
              <div className="post-user">
                {p.user}
                {p.verified && <span className="blue-tick">✓</span>}
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
              <button onClick={() => like(p.id)}>❤️ {p.likes}</button>
              <button onClick={() => share(p.id)}>🔁 {p.shares}</button>
            </div>
            <p className="post-caption"><b>{p.user}</b> {p.caption}</p>
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
      { id: "s1", user: "Safari Guide", verified: true, media: "https://loremflickr.com/400/700/lion?lock=51", isVideo: false, ts: Date.now() - 3000000 },
      { id: "s2", user: "Marine Bio", verified: false, media: "https://loremflickr.com/400/700/dolphin?lock=52", isVideo: false, ts: Date.now() - 5000000 },
      { id: "s3", user: "Birdwatcher", verified: false, media: "https://loremflickr.com/400/700/eagle?lock=53", isVideo: false, ts: Date.now() - 7000000 },
    ];
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) { alert("Please login first to add a story."); return; }
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
              {s.user.split(" ")[0]}
              {s.verified && <span className="blue-tick">✓</span>}
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
            <div className="story-thumb-user">{s.user}{s.verified && <span className="blue-tick">✓</span>}</div>
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
            <div className="story-viewer-caption">{viewing.user}{viewing.verified && <span className="blue-tick">✓</span>}</div>
          </div>
        </div>
      )}
    </div>
  );
}
