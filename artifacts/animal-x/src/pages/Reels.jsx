import { useState, useRef, useEffect } from "react";
import { getEmoji } from "../utils/image";
import animals, { categories } from "../data/animals";

const reelData = [
  { id: 1, title: "Lions of the Savanna", category: "Mammals", emoji: "🦁", bg: "linear-gradient(135deg, #f59e0b, #d97706)", desc: "Watch the king of the jungle in their natural habitat. Majestic and powerful." },
  { id: 2, title: "Deep Ocean Wonders", category: "Aquatic", emoji: "🐬", bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", desc: "Dive into the mysteries of the deep sea. Bioluminescent creatures and coral gardens." },
  { id: 3, title: "Desert Survival", category: "Desert", emoji: "🏜️", bg: "linear-gradient(135deg, #ef4444, #b45309)", desc: "How animals survive extreme heat and scarce water in desert environments." },
  { id: 4, title: "Mountain Eagles", category: "Birds", emoji: "🦅", bg: "linear-gradient(135deg, #6366f1, #4338ca)", desc: "Eagles soar above mountain peaks, their keen eyes scanning for prey below." },
  { id: 5, title: "Rainforest Reptiles", category: "Reptiles", emoji: "🐍", bg: "linear-gradient(135deg, #22c55e, #15803d)", desc: "Colorful chameleons and agile geckos navigate the dense rainforest canopy." },
  { id: 6, title: "Mountain Majesty", category: "Mountains", emoji: "⛰️", bg: "linear-gradient(135deg, #64748b, #334155)", desc: "The world's highest peaks — from Everest to the Andes, nature's skyscrapers." },
  { id: 7, title: "Tiny World", category: "Small Creatures", emoji: "🐜", bg: "linear-gradient(135deg, #f97316, #ea580c)", desc: "Ants, bees, and butterflies — small in size but mighty in ecological impact." },
  { id: 8, title: "Coral Kingdom", category: "Sea", emoji: "🌊", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)", desc: "Coral reefs teem with life — from tiny fish to majestic sea turtles." },
  { id: 9, title: "Forest Giants", category: "Nature", emoji: "🌳", bg: "linear-gradient(135deg, #84cc16, #4d7c0f)", desc: "Ancient trees that have stood for thousands of years, sheltering countless species." },
  { id: 10, title: "Arctic Animals", category: "Mammals", emoji: "🐻‍❄️", bg: "linear-gradient(135deg, #e2e8f0, #94a3b8)", desc: "Polar bears, arctic foxes, and seals brave extreme cold with remarkable adaptations." },
  { id: 11, title: "Flamingo Fiesta", category: "Birds", emoji: "🦩", bg: "linear-gradient(135deg, #ec4899, #be185d)", desc: "Watch thousands of flamingos create a breathtaking pink spectacle at salt lakes." },
  { id: 12, title: "Night Hunters", category: "Reptiles", emoji: "🦎", bg: "linear-gradient(135deg, #1e1b4b, #3730a3)", desc: "After dark, the desert comes alive with geckos, scorpions, and nocturnal hunters." },
];

export default function Reels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);
  const touchStartY = useRef(null);

  const goTo = (index) => {
    if (index < 0 || index >= reelData.length) return;
    setCurrentIndex(index);
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % reelData.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
    touchStartY.current = null;
  };

  const handleWheel = (e) => {
    if (e.deltaY > 50) goTo(currentIndex + 1);
    else if (e.deltaY < -50) goTo(currentIndex - 1);
  };

  const reel = reelData[currentIndex];

  return (
    <div
      className="reels-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div className="reel-card" style={{ background: reel.bg }}>
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

        <div className="reel-controls">
          <button
            className="reel-btn"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "⏸" : "▶️"}
          </button>
          <button className="reel-btn" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
            ↑
          </button>
          <button className="reel-btn" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === reelData.length - 1}>
            ↓
          </button>
        </div>

        <div className="reel-progress">
          {reelData.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="reel-counter">
          {currentIndex + 1} / {reelData.length}
        </div>

        <div className="reel-hint">↕ Scroll or swipe to navigate</div>
      </div>
    </div>
  );
}
