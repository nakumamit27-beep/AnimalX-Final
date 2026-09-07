import React, { useState, useEffect, useRef, useCallback } from "react";
import GameShell from "./GameShell";
import "./games.css";

// Built-in Web Audio Sound FX (No external audio files needed)
const playFx = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "eat") {
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "powerup") {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "over") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (_) {}
};

export default function SurvivalAdventure() {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("wild_survival_highscore") || 0);
  });
  const [gameOver, setGameOver] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [activePowerText, setActivePowerText] = useState("");

  const reqRef = useRef(null);

  const state = useRef({
    player: { x: 400, y: 300, radius: 18, speed: 4.5, isSprinting: false },
    foods: [],
    predators: [],
    powerups: [],
    particles: [],
    keys: { w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false },
    touchTarget: null,
    shieldUntil: 0,
    speedUntil: 0,
    magnetUntil: 0,
    lastPredatorSpawn: 0,
  });

  const spawnFood = (customCount = 1) => {
    const types = [
      { emoji: "🌿", points: 10, heal: 2 },
      { emoji: "🍎", points: 25, heal: 6 },
      { emoji: "🍓", points: 15, heal: 4 },
      { emoji: "⭐", points: 50, heal: 10 },
    ];
    for (let i = 0; i < customCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      state.current.foods.push({
        x: 30 + Math.random() * 740,
        y: 30 + Math.random() * 540,
        emoji: type.emoji,
        points: type.points,
        heal: type.heal,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }
  };

  const spawnPredator = () => {
    const predTypes = [
      { emoji: "🐺", speed: 2.2, dmg: 14, name: "Wolf" },
      { emoji: "🦁", speed: 2.8, dmg: 22, name: "Lion" },
      { emoji: "🐊", speed: 1.8, dmg: 30, name: "Crocodile" },
    ];
    const chosen = predTypes[Math.floor(Math.random() * predTypes.length)];
    
    // Spawn from edge
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * 800; y = -20; }
    else if (side === 1) { x = 820; y = Math.random() * 600; }
    else if (side === 2) { x = Math.random() * 800; y = 620; }
    else { x = -20; y = Math.random() * 600; }

    state.current.predators.push({
      x, y,
      speed: chosen.speed + Math.random() * 0.4,
      dmg: chosen.dmg,
      emoji: chosen.emoji,
      hitCooldown: 0,
    });
  };

  const spawnPowerup = () => {
    const pTypes = [
      { type: "shield", emoji: "🛡️", label: "Shield Protected!" },
      { type: "speed", emoji: "⚡", label: "Speed Rush!" },
      { type: "magnet", emoji: "🧲", label: "Food Magnet!" },
    ];
    const picked = pTypes[Math.floor(Math.random() * pTypes.length)];
    state.current.powerups.push({
      x: 50 + Math.random() * 700,
      y: 50 + Math.random() * 500,
      ...picked,
    });
  };

  const startGame = () => {
    state.current.player = { x: 400, y: 300, radius: 18, speed: 4.5, isSprinting: false };
    state.current.foods = [];
    state.current.predators = [];
    state.current.powerups = [];
    state.current.particles = [];
    state.current.touchTarget = null;
    state.current.shieldUntil = 0;
    state.current.speedUntil = 0;
    state.current.magnetUntil = 0;
    state.current.lastPredatorSpawn = Date.now();

    // Initial Spawns
    spawnFood(12);
    spawnPredator();
    spawnPredator();

    setHp(100);
    setStamina(100);
    setScore(0);
    setLevel(1);
    setShieldActive(false);
    setActivePowerText("");
    setPlaying(true);
    setGameOver(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") state.current.keys.up = true;
      if (k === "arrowdown" || k === "s") state.current.keys.down = true;
      if (k === "arrowleft" || k === "a") state.current.keys.left = true;
      if (k === "arrowright" || k === "d") state.current.keys.right = true;
      if (k === "shift" || k === " ") state.current.player.isSprinting = true;
    };
    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") state.current.keys.up = false;
      if (k === "arrowdown" || k === "s") state.current.keys.down = false;
      if (k === "arrowleft" || k === "a") state.current.keys.left = false;
      if (k === "arrowright" || k === "d") state.current.keys.right = false;
      if (k === "shift" || k === " ") state.current.player.isSprinting = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = state.current;
      const curTime = Date.now();

      // Stamina & Sprint logic
      let currentSpeed = s.player.speed;
      if (curTime < s.speedUntil) currentSpeed *= 1.5;

      if (s.player.isSprinting && stamina > 5) {
        currentSpeed *= 1.6;
        setStamina((prev) => Math.max(0, prev - 30 * dt));
      } else {
        setStamina((prev) => Math.min(100, prev + 15 * dt));
      }

      // Movement by Key or Touch
      let dx = 0;
      let dy = 0;
      if (s.keys.up) dy -= 1;
      if (s.keys.down) dy += 1;
      if (s.keys.left) dx -= 1;
      if (s.keys.right) dx += 1;

      // Touch / Virtual Joystick drag target
      if (s.touchTarget) {
        const tx = s.touchTarget.x - s.player.x;
        const ty = s.touchTarget.y - s.player.y;
        const dist = Math.hypot(tx, ty);
        if (dist > 15) {
          dx = tx / dist;
          dy = ty / dist;
        }
      }

      // Apply movement
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        s.player.x += (dx / len) * currentSpeed;
        s.player.y += (dy / len) * currentSpeed;
      }

      // Screen boundary clamp
      s.player.x = Math.max(22, Math.min(778, s.player.x));
      s.player.y = Math.max(22, Math.min(578, s.player.y));

      // Magnet effect
      const hasMagnet = curTime < s.magnetUntil;
      const hasShield = curTime < s.shieldUntil;
      setShieldActive(hasShield);

      // CLEAR CANVAS & DRAW BACKGROUND SAFARI MAP
      ctx.fillStyle = "#0c1a12"; // Deep savanna night/jungle floor
      ctx.fillRect(0, 0, 800, 600);

      // Subtle Grid / Flora texture
      ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 40; x < 800; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 40; y < 600; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // DRAW PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // DRAW & UPDATE FOOD
      ctx.font = "22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = s.foods.length - 1; i >= 0; i--) {
        const f = s.foods[i];

        if (hasMagnet) {
          const mdx = s.player.x - f.x;
          const mdy = s.player.y - f.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 180 && mdist > 1) {
            f.x += (mdx / mdist) * 5;
            f.y += (mdy / mdist) * 5;
          }
        }

        const dist = Math.hypot(s.player.x - f.x, s.player.y - f.y);
        if (dist < 26) {
          // Eat food
          playFx("eat");
          setScore((sc) => {
            const next = sc + f.points;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem("wild_survival_highscore", String(next));
            }
            return next;
          });
          setHp((h) => Math.min(100, h + f.heal));

          // Spawn burst particles
          for (let k = 0; k < 6; k++) {
            s.particles.push({
              x: f.x,
              y: f.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 4 + 2,
              color: "#34d399",
              alpha: 1,
            });
          }

          s.foods.splice(i, 1);
          spawnFood(1);

          // Random powerup drop
          if (Math.random() < 0.12 && s.powerups.length < 2) {
            spawnPowerup();
          }
          continue;
        }

        // Draw food emoji with soft glow
        ctx.fillText(f.emoji, f.x, f.y);
      }

      // DRAW & UPDATE POWERUPS
      for (let i = s.powerups.length - 1; i >= 0; i--) {
        const pow = s.powerups[i];
        const dist = Math.hypot(s.player.x - pow.x, s.player.y - pow.y);

        // Pulsing circle
        const pulse = 18 + Math.sin(now / 150) * 4;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pow.x, pow.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(pow.emoji, pow.x, pow.y);

        if (dist < 28) {
          playFx("powerup");
          if (pow.type === "shield") s.shieldUntil = curTime + 7000;
          if (pow.type === "speed") s.speedUntil = curTime + 6000;
          if (pow.type === "magnet") s.magnetUntil = curTime + 8000;

          setActivePowerText(pow.label);
          setTimeout(() => setActivePowerText(""), 2000);

          s.powerups.splice(i, 1);
        }
      }

      // PREDATOR SPAWNER (Dynamic difficulty)
      if (curTime - s.lastPredatorSpawn > Math.max(3500, 10000 - score * 10)) {
        if (s.predators.length < 7) {
          spawnPredator();
          s.lastPredatorSpawn = curTime;
        }
      }

      // DRAW & UPDATE PREDATORS
      for (let i = 0; i < s.predators.length; i++) {
        const p = s.predators[i];
        const pdx = s.player.x - p.x;
        const pdy = s.player.y - p.y;
        const plen = Math.hypot(pdx, pdy);

        if (plen > 0) {
          p.x += (pdx / plen) * p.speed;
          p.y += (pdy / plen) * p.speed;
        }

        p.hitCooldown = Math.max(0, (p.hitCooldown || 0) - 1);

        // Collision with Player
        if (plen < 26 && p.hitCooldown === 0) {
          if (hasShield) {
            // Repel predator
            p.x -= (pdx / plen) * 60;
            p.y -= (pdy / plen) * 60;
            p.hitCooldown = 25;
            playFx("hit");
          } else {
            playFx("hit");
            p.hitCooldown = 35;
            setHp((prev) => {
              const newHp = Math.max(0, prev - p.dmg);
              if (newHp <= 0) {
                playFx("over");
                setPlaying(false);
                setGameOver(true);
              }
              return newHp;
            });

            // Red hit particles
            for (let k = 0; k < 8; k++) {
              s.particles.push({
                x: s.player.x,
                y: s.player.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 5 + 2,
                color: "#ef4444",
                alpha: 1,
              });
            }
          }
        }

        // Draw predator
        ctx.fillText(p.emoji, p.x, p.y);
      }

      // DRAW PLAYER (Deer 🦌 with glow & shield)
      if (hasShield) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, 24, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sprint trail
      if (s.player.isSprinting && stamina > 5) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
        ctx.beginPath();
        ctx.arc(s.player.x - dx * 6, s.player.y - dy * 6, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillText("🦌", s.player.x, s.player.y);

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [playing, stamina, score, highScore]);

  // Touch handlers for Mobile virtual canvas dragging
  const handleTouchStart = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    state.current.touchTarget = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const handleTouchMove = (e) => {
    if (!state.current.touchTarget) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    state.current.touchTarget = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const handleTouchEnd = () => {
    state.current.touchTarget = null;
  };

  const btnProps = (dir) => ({
    onPointerDown: () => { state.current.keys[dir] = true; },
    onPointerUp: () => { state.current.keys[dir] = false; },
    onPointerLeave: () => { state.current.keys[dir] = false; },
  });

  return (
    <GameShell
      title="Wildlife Safari Survival"
      score={score}
      lives={Math.max(0, Math.ceil(hp / 20))}
      onRestart={startGame}
    >
      <div className="survival-container" style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
        
        {/* TOP STATUS BAR */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
            fontSize: "13px",
            color: "#fff",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.65)",
            padding: "8px 14px",
            borderRadius: "10px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span>❤️ HP: {Math.max(0, Math.floor(hp))}%</span>
            <span>⚡ Stamina: {Math.floor(stamina)}%</span>
            {shieldActive && <span style={{ color: "#38bdf8" }}>🛡️ Shield</span>}
          </div>
          <div style={{ display: "flex", gap: "14px" }}>
            <span style={{ color: "#34d399" }}>Score: {score}</span>
            <span style={{ color: "#f59e0b" }}>Best: {highScore}</span>
          </div>
        </div>

        {/* ACTIVE POWERUP BANNER */}
        {activePowerText && (
          <div
            style={{
              position: "absolute",
              top: "55px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#10b981",
              color: "#fff",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
              zIndex: 15,
            }}
          >
            {activePowerText}
          </div>
        )}

        {/* CANVAS */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: "12px",
            touchAction: "none",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* ON-SCREEN MOBILE CONTROLS */}
        {playing && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              padding: "0 10px",
            }}
          >
            {/* D-PAD */}
            <div className="gamepad-controls" style={{ margin: "0" }}>
              <button className="dpad-btn dpad-up" {...btnProps("up")}>⬆️</button>
              <button className="dpad-btn dpad-left" {...btnProps("left")}>⬅️</button>
              <button className="dpad-btn dpad-right" {...btnProps("right")}>➡️</button>
              <button className="dpad-btn dpad-down" {...btnProps("down")}>⬇️</button>
            </div>

            {/* SPRINT BUTTON */}
            <button
              onPointerDown={() => { state.current.player.isSprinting = true; }}
              onPointerUp={() => { state.current.player.isSprinting = false; }}
              onPointerLeave={() => { state.current.player.isSprinting = false; }}
              style={{
                background: stamina > 10 ? "#ef4444" : "#4b5563",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "65px",
                height: "65px",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>🔥</span>
              <span style={{ fontSize: "10px" }}>SPRINT</span>
            </button>
          </div>
        )}

        {/* START SCREEN */}
        {!playing && !gameOver && (
          <div
            className="win-screen"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.88)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              zIndex: 25,
            }}
          >
            <h2 style={{ color: "#34d399", fontSize: "1.8rem", marginBottom: "8px" }}>
              🦌 Safari Survival Adventure
            </h2>
            <p style={{ color: "#9ca3af", maxWidth: "420px", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
              Eat leaves 🌿 & fruit 🍎 to gain points and HP. Dodge predators 🐺 🦁 🐊!
              Grab power-ups 🛡️ ⚡ 🧲 and use Sprint 🔥 to escape!
            </p>
            <button
              className="game-btn"
              onClick={startGame}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "10px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Play Survival
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div
            className="win-screen"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              zIndex: 25,
            }}
          >
            <h2 style={{ color: "#ef4444", fontSize: "2rem", marginBottom: "6px" }}>🐾 Caught by Predator!</h2>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>You survived bravely in the wild.</p>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "#1f2937", padding: "10px 18px", borderRadius: "8px" }}>
                <div style={{ color: "#9ca3af", fontSize: "11px" }}>Final Score</div>
                <div style={{ color: "#34d399", fontSize: "22px", fontWeight: "bold" }}>{score}</div>
              </div>
              <div style={{ background: "#1f2937", padding: "10px 18px", borderRadius: "8px" }}>
                <div style={{ color: "#9ca3af", fontSize: "11px" }}>All-Time Best</div>
                <div style={{ color: "#f59e0b", fontSize: "22px", fontWeight: "bold" }}>{highScore}</div>
              </div>
            </div>

            <button
              className="game-btn"
              onClick={startGame}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "10px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                cursor: "pointer",
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
