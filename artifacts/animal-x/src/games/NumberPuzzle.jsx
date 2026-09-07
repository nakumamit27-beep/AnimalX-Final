import React, { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import "./games.css";

// Voice Speech Synthesizer for Kids (speaks "one, one, one" and "Seven!")
const speakText = (text, rate = 1.1, pitch = 1.3) => {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch; // Cute kids pitch
      window.speechSynthesis.speak(utter);
    }
  } catch (_) {}
};

// Cute Animal Number Data with unique colors & SVG Animal Art
const ANIMAL_NUMBERS = {
  1: { num: 1, name: "Giraffe Bird", color: "#3b82f6", bg: "#dbeafe", eyes: "👀", emoji: "🦒", shape: "1" },
  2: { num: 2, name: "Pink Flamingo", color: "#ec4899", bg: "#fce7f3", eyes: "👀", emoji: "🦩", shape: "2" },
  3: { num: 3, name: "Tiger Cub", color: "#f59e0b", bg: "#fef3c7", eyes: "🐾", emoji: "🐯", shape: "3" },
  4: { num: 4, name: "Croco Alligator", color: "#10b981", bg: "#d1fae5", eyes: "🐊", emoji: "🐊", shape: "4" },
  5: { num: 5, name: "Ocean Whale", color: "#6366f1", bg: "#e0e7ff", eyes: "🐳", emoji: "🐳", shape: "5" },
  6: { num: 6, name: "Purple Octopus", color: "#8b5cf6", bg: "#ede9fe", eyes: "🐙", emoji: "🐙", shape: "6" },
  7: { num: 7, name: "Spotted Caterpillar", color: "#14b8a6", bg: "#ccfbf1", eyes: "🐛", emoji: "🐛", shape: "7" },
  8: { num: 8, name: "Wise Owl", color: "#f97316", bg: "#ffedd5", eyes: "🦉", emoji: "🦉", shape: "8" },
  9: { num: 9, name: "Forest Fox", color: "#ef4444", bg: "#fee2e2", eyes: "🦊", emoji: "🦊", shape: "9" },
  10: { num: 10, name: "Lion King", color: "#eab308", bg: "#fef9c3", eyes: "🦁", emoji: "🦁", shape: "10" },
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function NumberPuzzle() {
  const [level, setLevel] = useState(7); // Default 1 to 7 like video
  const [placed, setPlaced] = useState({}); // { 1: true, 2: true, ... }
  const [trayNumbers, setTrayNumbers] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Drag state for touch & mouse
  const [draggingItem, setDraggingItem] = useState(null); // { num, x, y, startX, startY }
  const slotRefs = useRef({});
  const repeatInterval = useRef(null);

  const startGame = (count = level) => {
    setLevel(count);
    const nums = Array.from({ length: count }, (_, i) => i + 1);
    setTrayNumbers(shuffle(nums));
    setPlaced({});
    setPlaying(true);
    setWon(false);
    setConfetti([]);
    speakText("Let's count animals!");
  };

  useEffect(() => {
    startGame(7);
  }, []);

  // Repeat cute voice while dragging (e.g. "one, one, one")
  const startChanting = (num) => {
    speakText(String(num), 1.3, 1.4);
    if (repeatInterval.current) clearInterval(repeatInterval.current);
    repeatInterval.current = setInterval(() => {
      speakText(String(num), 1.3, 1.4);
    }, 900);
  };

  const stopChanting = () => {
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
      repeatInterval.current = null;
    }
  };

  // TOUCH & MOUSE EVENT HANDLERS (Works 100% on Mobile / iPad)
  const handlePointerDown = (e, num) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    setDraggingItem({
      num,
      x: clientX,
      y: clientY,
    });
    startChanting(num);
  };

  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    setDraggingItem((prev) => (prev ? { ...prev, x: clientX, y: clientY } : null));
  };

  const handlePointerUp = (e) => {
    if (!draggingItem) return;
    stopChanting();

    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

    const targetSlotEl = slotRefs.current[draggingItem.num];
    let matched = false;

    if (targetSlotEl) {
      const rect = targetSlotEl.getBoundingClientRect();
      // Generous kid-friendly drop threshold
      const hit =
        clientX >= rect.left - 30 &&
        clientX <= rect.right + 30 &&
        clientY >= rect.top - 30 &&
        clientY <= rect.bottom + 30;

      if (hit) {
        matched = true;
        // Placed Successfully!
        const nextPlaced = { ...placed, [draggingItem.num]: true };
        setPlaced(nextPlaced);
        setTrayNumbers((prev) => prev.filter((n) => n !== draggingItem.num));

        speakText(`${draggingItem.num}!`, 1.0, 1.2);

        // Check if all placed
        const totalPlaced = Object.keys(nextPlaced).length;
        if (totalPlaced === level) {
          triggerVictory();
        }
      }
    }

    if (!matched) {
      // Return back to tray
    }

    setDraggingItem(null);
  };

  const triggerVictory = () => {
    setWon(true);
    setPlaying(false);

    // Sequential count out loud (1, 2, 3, 4, 5, 6, 7!)
    let delay = 600;
    for (let i = 1; i <= level; i++) {
      setTimeout(() => {
        speakText(String(i), 1.1, 1.3);
      }, delay);
      delay += 550;
    }
    setTimeout(() => {
      speakText("Hurray! Good job!", 1.0, 1.3);
    }, delay + 200);

    // Confetti particles
    const conf = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 90,
      color: ["#f59e0b", "#ec4899", "#3b82f6", "#10b981", "#8b5cf6"][i % 5],
      delay: Math.random() * 0.5,
    }));
    setConfetti(conf);
  };

  return (
    <GameShell title="Animal Numbers Count" onRestart={() => startGame(level)}>
      <div
        className="number-puzzle-container"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          userSelect: "none",
          touchAction: "none",
          minHeight: "480px",
          background: "linear-gradient(180deg, #fdfbf7 0%, #f5efe6 100%)",
          borderRadius: "16px",
          padding: "16px 12px",
          position: "relative",
          overflow: "hidden",
          border: "2px solid #e7dfd5",
        }}
      >
        {/* LEVEL SWITCHER */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          {[5, 7, 10].map((cnt) => (
            <button
              key={cnt}
              onClick={() => startGame(cnt)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "bold",
                fontSize: "13px",
                background: level === cnt ? "#f59e0b" : "#e5e7eb",
                color: level === cnt ? "#fff" : "#4b5563",
                cursor: "pointer",
                boxShadow: level === cnt ? "0 3px 8px rgba(245,158,11,0.4)" : "none",
              }}
            >
              1 to {cnt}
            </button>
          ))}
        </div>

        {/* TOP SLOTS: DOTTED OUTLINES (Jaise Video Me Thi) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flexWrap: "nowrap",
            overflowX: "auto",
            padding: "12px 6px",
            minHeight: "105px",
            background: "rgba(255,255,255,0.6)",
            borderRadius: "14px",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          {Array.from({ length: level }, (_, i) => i + 1).map((num) => {
            const data = ANIMAL_NUMBERS[num];
            const isFilled = !!placed[num];

            return (
              <div
                key={num}
                ref={(el) => (slotRefs.current[num] = el)}
                style={{
                  width: level > 7 ? "46px" : "56px",
                  height: level > 7 ? "68px" : "80px",
                  borderRadius: "12px",
                  border: isFilled ? `3px solid ${data.color}` : "2.5px dashed #c7bdaf",
                  background: isFilled ? data.bg : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isFilled ? "scale(1.05)" : "scale(1)",
                  boxShadow: isFilled ? `0 4px 12px ${data.color}40` : "none",
                }}
              >
                {isFilled ? (
                  <>
                    <span style={{ fontSize: "20px" }}>{data.emoji}</span>
                    <span
                      style={{
                        fontSize: level > 7 ? "24px" : "28px",
                        fontWeight: "900",
                        color: data.color,
                        lineHeight: "1",
                      }}
                    >
                      {num}
                    </span>
                  </>
                ) : (
                  // Dotted Faint Outline Number for Baby to guide
                  <span
                    style={{
                      fontSize: level > 7 ? "30px" : "36px",
                      fontWeight: "900",
                      color: "#d1c7b7",
                      opacity: 0.6,
                    }}
                  >
                    {num}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM TRAY: SCATTERED ANIMAL NUMBERS FOR BABY TO DRAG */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            marginTop: "35px",
            minHeight: "150px",
            padding: "10px",
          }}
        >
          {trayNumbers.map((num) => {
            const data = ANIMAL_NUMBERS[num];
            const isBeingDragged = draggingItem?.num === num;

            return (
              <div
                key={num}
                onMouseDown={(e) => handlePointerDown(e, num)}
                onTouchStart={(e) => handlePointerDown(e, num)}
                style={{
                  width: "66px",
                  height: "82px",
                  borderRadius: "16px",
                  background: data.bg,
                  border: `3px solid ${data.color}`,
                  display: isBeingDragged ? "none" : "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  boxShadow: `0 6px 16px ${data.color}35`,
                  transition: "transform 0.15s ease",
                  transform: "scale(1)",
                  position: "relative",
                  touchAction: "none",
                }}
              >
                {/* Cute Eyes Decor on Animal */}
                <div style={{ position: "absolute", top: "4px", fontSize: "14px" }}>
                  {data.eyes}
                </div>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "900",
                    color: data.color,
                    marginTop: "8px",
                    textShadow: "1px 2px 0px rgba(0,0,0,0.1)",
                  }}
                >
                  {num}
                </span>
              </div>
            );
          })}
        </div>

        {/* FLOATING DRAGGED ANIMAL NUMBER UNDER USER'S FINGER */}
        {draggingItem && (() => {
          const data = ANIMAL_NUMBERS[draggingItem.num];
          return (
            <div
              style={{
                position: "fixed",
                left: draggingItem.x - 38,
                top: draggingItem.y - 48,
                width: "76px",
                height: "96px",
                borderRadius: "18px",
                background: data.bg,
                border: `3.5px solid ${data.color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 9999,
                boxShadow: `0 12px 28px ${data.color}60`,
                transform: "scale(1.18) rotate(-4deg)",
              }}
            >
              <div style={{ position: "absolute", top: "6px", fontSize: "16px" }}>{data.eyes}</div>
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: "900",
                  color: data.color,
                  marginTop: "10px",
                }}
              >
                {draggingItem.num}
              </span>
            </div>
          );
        })()}

        {/* WIN CELEBRATION (Balloons, Confetti, Stars) */}
        {won && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              borderRadius: "16px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ fontSize: "55px", marginBottom: "8px" }}>🎉🎈⭐</div>
            <h2 style={{ color: "#10b981", fontSize: "2.2rem", margin: "0 0 6px 0", fontWeight: "900" }}>
              Awesome Job!
            </h2>
            <p style={{ color: "#6b7280", fontSize: "16px", margin: "0 0 20px 0" }}>
              You counted all animals from 1 to {level}!
            </p>
            <button
              onClick={() => startGame(level)}
              style={{
                padding: "14px 34px",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "30px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(16,185,129,0.4)",
              }}
            >
              🔄 Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
