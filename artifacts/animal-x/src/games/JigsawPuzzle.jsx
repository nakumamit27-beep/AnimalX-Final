import React, { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import "./games.css";

// Built-in Sound FX
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "swap") {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (_) {}
};

// High Quality Animal Photos
const ANIMAL_PHOTOS = [
  {
    name: "Royal Bengal Tiger",
    emoji: "🐯",
    url: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "African Lion King",
    emoji: "🦁",
    url: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Majestic Wild Elephant",
    emoji: "🐘",
    url: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Giant Bamboo Panda",
    emoji: "🐼",
    url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Golden Leopard",
    emoji: "🐆",
    url: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&auto=format&fit=crop&q=80",
  },
];

export default function JigsawPuzzle() {
  const [gridSize, setGridSize] = useState(3); // 3x3 = 9 pieces
  const [selectedAnimal, setSelectedAnimal] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalTiles = gridSize * gridSize;
  const currentPhoto = ANIMAL_PHOTOS[selectedAnimal];

  // Timer
  useEffect(() => {
    let timer;
    if (isPlaying && !isWon) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isWon]);

  // Shuffle & Start Game
  const initGame = (size = gridSize, animalIdx = selectedAnimal) => {
    const total = size * size;
    let initial = Array.from({ length: total }, (_, i) => i);

    // Shuffle until not solved
    let shuffled = [...initial];
    do {
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } while (shuffled.every((val, idx) => val === idx));

    setGridSize(size);
    setSelectedAnimal(animalIdx);
    setTiles(shuffled);
    setSelectedTile(null);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsWon(false);
    setShowHint(false);
  };

  useEffect(() => {
    initGame(3, 0);
  }, []);

  // Tile Selection & Swap
  const handleTileClick = (index) => {
    if (isWon) return;

    if (selectedTile === null) {
      setSelectedTile(index);
      playSound("swap");
    } else {
      // Swap tiles
      const newTiles = [...tiles];
      const temp = newTiles[selectedTile];
      newTiles[selectedTile] = newTiles[index];
      newTiles[index] = temp;

      setTiles(newTiles);
      setSelectedTile(null);
      setMoves((m) => m + 1);
      playSound("swap");

      // Check win condition
      const won = newTiles.every((val, idx) => val === idx);
      if (won) {
        setIsWon(true);
        setIsPlaying(false);
        playSound("win");
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <GameShell
      title="Wild Animal Jigsaw Puzzle"
      score={Math.max(0, 1000 - moves * 15 - time * 2)}
      onRestart={() => initGame()}
    >
      <div
        className="jigsaw-wrapper"
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "16px 12px",
          userSelect: "none",
          textAlign: "center",
        }}
      >
        {/* ANIMAL SELECTOR TABS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "14px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {ANIMAL_PHOTOS.map((animal, idx) => (
            <button
              key={animal.name}
              onClick={() => initGame(gridSize, idx)}
              style={{
                background: selectedAnimal === idx ? "#10b981" : "#1f2937",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s",
                boxShadow: selectedAnimal === idx ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
              }}
            >
              <span>{animal.emoji}</span>
              <span>{animal.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* STATUS BAR: TIME, MOVES, HINT */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#111827",
            padding: "10px 16px",
            borderRadius: "12px",
            marginBottom: "14px",
            fontSize: "13px",
            color: "#9ca3af",
          }}
        >
          <div>
            Moves: <b style={{ color: "#38bdf8", fontSize: "15px" }}>{moves}</b>
          </div>
          <div>
            Time: <b style={{ color: "#f59e0b", fontSize: "15px" }}>{formatTime(time)}</b>
          </div>
          <button
            onClick={() => setShowHint((h) => !h)}
            style={{
              background: showHint ? "#3b82f6" : "#374151",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {showHint ? "🙈 Hide Hint" : "👁️ Peek Hint"}
          </button>
        </div>

        {/* JIGSAW BOARD CONTAINER */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "100%", // Perfect 1:1 Aspect Square
            background: "#1f2937",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* FULL PREVIEW HINT OVERLAY */}
          {showHint && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${currentPhoto.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.65,
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          )}

          {/* GRID OF TILES */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              gap: "2px",
              padding: "2px",
              background: "#111827",
            }}
          >
            {tiles.map((tileOrigPos, currIdx) => {
              // Calculate background offset for this tile
              const origRow = Math.floor(tileOrigPos / gridSize);
              const origCol = tileOrigPos % gridSize;
              const isSelected = selectedTile === currIdx;
              const isCorrect = tileOrigPos === currIdx;

              const bgX = (origCol / (gridSize - 1)) * 100;
              const bgY = (origRow / (gridSize - 1)) * 100;

              return (
                <div
                  key={currIdx}
                  onClick={() => handleTileClick(currIdx)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: `url(${currentPhoto.url})`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                    borderRadius: "6px",
                    outline: isSelected ? "3px solid #f59e0b" : "none",
                    boxShadow: isSelected ? "0 0 16px rgba(245, 158, 11, 0.9)" : "none",
                    transform: isSelected ? "scale(0.96)" : "scale(1)",
                    transition: "transform 0.15s ease, outline 0.1s ease",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    padding: "4px",
                  }}
                >
                  {/* Small number badge on tile for help */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: isCorrect ? "#34d399" : "rgba(255,255,255,0.75)",
                      background: "rgba(0,0,0,0.55)",
                      borderRadius: "4px",
                      padding: "1px 5px",
                    }}
                  >
                    {tileOrigPos + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* WIN OVERLAY CELEBRATION */}
          {isWon && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                padding: "20px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>🎉🏆🐾</div>
              <h2 style={{ color: "#10b981", fontSize: "1.8rem", margin: "0 0 8px 0" }}>
                Puzzle Solved!
              </h2>
              <p style={{ color: "#d1d5db", fontSize: "14px", margin: "0 0 16px 0" }}>
                You completed the <b>{currentPhoto.name}</b> in <b>{moves} moves</b> ({formatTime(time)}).
              </p>
              <button
                onClick={() => initGame()}
                style={{
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
                }}
              >
                🔄 Play Next Animal
              </button>
            </div>
          )}
        </div>

        {/* DIFFICULTY SELECTOR */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          <button
            onClick={() => initGame(3)}
            style={{
              background: gridSize === 3 ? "#3b82f6" : "#374151",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Easy (3x3)
          </button>
          <button
            onClick={() => initGame(4)}
            style={{
              background: gridSize === 4 ? "#3b82f6" : "#374151",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Hard (4x4)
          </button>
        </div>
      </div>
    </GameShell>
  );
}
