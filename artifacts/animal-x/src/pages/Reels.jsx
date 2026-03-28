import { useState, useRef, useEffect } from "react";
import { getEmoji } from "../utils/image";
import animals, { categories } from "../data/animals";

const defaultReels = [
  { id: "d1", type: "default", title: "Lions of the Savanna", category: "Mammals", emoji: "🦁", bg: "linear-gradient(135deg, #f59e0b, #d97706)", desc: "Watch the king of the jungle in their natural habitat. Majestic and powerful.", likes: 0, views: 0, shares: 0 },
  { id: "d2", type: "default", title: "Deep Ocean Wonders", category: "Aquatic", emoji: "🐬", bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", desc: "Dive into the mysteries of the deep sea. Bioluminescent creatures and coral gardens.", likes: 0, views: 0, shares: 0 },
  { id: "d3", type: "default", title: "Desert Survival", category: "Desert", emoji: "🏜️", bg: "linear-gradient(135deg, #ef4444, #b45309)", desc: "How animals survive extreme heat and scarce water in desert environments.", likes: 0, views: 0, shares: 0 },
  { id: "d4", type: "default", title: "Mountain Eagles", category: "Birds", emoji: "🦅", bg: "linear-gradient(135deg, #6366f1, #4338ca)", desc: "Eagles soar above mountain peaks, their keen eyes scanning for prey below.", likes: 0, views: 0, shares: 0 },
  { id: "d5", type: "default", title: "Rainforest Reptiles", category: "Reptiles", emoji: "🐍", bg: "linear-gradient(135deg, #22c55e, #15803d)", desc: "Colorful chameleons and agile geckos navigate the dense rainforest canopy.", likes: 0, views: 0, shares: 0 },
  { id: "d6", type: "default", title: "Mountain Majesty", category: "Mountains", emoji: "⛰️", bg: "linear-gradient(135deg, #64748b, #334155)", desc: "The world's highest peaks — from Everest to the Andes, nature's skyscrapers.", likes: 0, views: 0, shares: 0 },
  { id: "d7", type: "default", title: "Tiny World", category: "Small Creatures", emoji: "🐜", bg: "linear-gradient(135deg, #f97316, #ea580c)", desc: "Ants, bees, and butterflies — small in size but mighty in ecological impact.", likes: 0, views: 0, shares: 0 },
  { id: "d8", type: "default", title: "Coral Kingdom", category: "Sea", emoji: "🌊", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)", desc: "Coral reefs teem with life — from tiny fish to majestic sea turtles.", likes: 0, views: 0, shares: 0 },
];

export default function Reels() {
  const [reels, setReels] = useState(defaultReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef(null);
  const fileInputRef = useRef(null);
  const videoRefs = useRef({});

  const goTo = (index) => {
    if (index < 0 || index >= reels.length) return;
    setCurrentIndex(index);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newReel = {
      id: `u_${Date.now()}`,
      type: "video",
      url,
      title: file.name.replace(/\.[^.]+$/, ""),
      category: "User Upload",
      likes: 0,
      views: 0,
      shares: 0
    };
    setReels(prev => [newReel, ...prev]);
    setCurrentIndex(0);
  };

  const updateReel = (id, updates) => {
    setReels(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
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
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          ➕ Upload MP4
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/*"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>

      <div className="reel-card-outer">
        {reel.type === "video" ? (
          <VideoReel
            reel={reel}
            onUpdate={updateReel}
          />
        ) : (
          <DefaultReel reel={reel} animals={animals} />
        )}

        <div className="reel-actions-sidebar">
          <button
            className="reel-action-btn liked"
            onClick={() => updateReel(reel.id, { likes: reel.likes + 1 })}
          >
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

          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>↑</button>
          <button className="reel-action-btn nav-arrow" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === reels.length - 1}>↓</button>
        </div>

        <div className="reel-progress-dots">
          {reels.slice(0, 15).map((_, i) => (
            <div key={i} className={`progress-dot ${i === currentIndex ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="reel-counter">{currentIndex + 1} / {reels.length}</div>
        <div className="reel-hint">↕ Scroll or swipe to navigate</div>
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
        playsInline
        className="reel-video"
        onPlay={() => {
          if (!played) { onUpdate(reel.id, { views: reel.views + 1 }); setPlayed(true); }
        }}
      />
      <div className="reel-video-info">
        <div className="reel-user-badge">📤 User Upload</div>
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
          {animals.filter(a => a.category === reel.category).length} animals in this category
        </div>
      </div>
    </div>
  );
}
