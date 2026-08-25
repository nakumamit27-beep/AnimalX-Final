import { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import "./games.css";

export default function SurvivalAdventure() {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const reqRef = useRef();

  const state = useRef({
    x: 400, y: 300,
    foods: [],
    preds: [],
    keys: { w:false, a:false, s:false, d:false, up:false, down:false, left:false, right:false }
  });

  const startGame = () => {
    state.current = {
      x: 400, y: 300,
      foods: Array.from({length: 10}, () => ({x: Math.random()*800, y: Math.random()*600})),
       preds: [{x: 0, y: 0, speed: 2, hitCooldown: 0}],
      keys: { w:false, a:false, s:false, d:false, up:false, down:false, left:false, right:false }
    };
    setHp(100);
    setScore(0);
    setPlaying(true);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') state.current.keys.up = true;
      if (key === 's' || e.key === 'ArrowDown') state.current.keys.down = true;
      if (key === 'a' || e.key === 'ArrowLeft') state.current.keys.left = true;
      if (key === 'd' || e.key === 'ArrowRight') state.current.keys.right = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') state.current.keys.up = false;
      if (key === 's' || e.key === 'ArrowDown') state.current.keys.down = false;
      if (key === 'a' || e.key === 'ArrowLeft') state.current.keys.left = false;
      if (key === 'd' || e.key === 'ArrowRight') state.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const loop = () => {
      const s = state.current;
      
      // Move player
      const speed = 4;
      if (s.keys.up) s.y -= speed;
      if (s.keys.down) s.y += speed;
      if (s.keys.left) s.x -= speed;
      if (s.keys.right) s.x += speed;
      
      // Bounds
      s.x = Math.max(15, Math.min(785, s.x));
      s.y = Math.max(15, Math.min(585, s.y));

      // Draw
      ctx.clearRect(0, 0, 800, 600);
      
      // Foods
      ctx.fillStyle = '#22c55e';
      s.foods.forEach((f, i) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI*2);
        ctx.fill();
        
        // Collide
        const dist = Math.hypot(s.x - f.x, s.y - f.y);
        if (dist < 20) {
          s.foods[i] = {x: Math.random()*800, y: Math.random()*600};
          setScore(sc => sc + 10);
          setHp(h => Math.min(100, h + 5));
          if (Math.random() < 0.3) {
            s.preds.push({x: Math.random() > 0.5 ? 0 : 800, y: Math.random()*600, speed: 1.5 + Math.random()});
          }
        }
      });
      
      // Preds
      ctx.fillStyle = '#ef4444';
       s.preds.forEach(p => {
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        const len = Math.hypot(dx, dy);
         if (len > 0) {
           p.x += (dx/len) * p.speed;
           p.y += (dy/len) * p.speed;
         }
         p.hitCooldown = Math.max(0, (p.hitCooldown || 0) - 1);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
        ctx.fill();
        
         if (len < 25 && p.hitCooldown === 0) {
           p.hitCooldown = 30;
           setHp(h => Math.max(0, h - 2));
        }
      });
      
      // Player
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 15, 0, Math.PI*2);
      ctx.fill();
      
      if (playing) reqRef.current = requestAnimationFrame(loop);
    };
    
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [playing]);

  useEffect(() => {
    if (playing && hp <= 0) {
      setPlaying(false);
      setGameOver(true);
    }
  }, [hp, playing]);

  const btnProps = (key) => ({
    onPointerDown: () => { state.current.keys[key] = true; },
    onPointerUp: () => { state.current.keys[key] = false; },
    onPointerLeave: () => { state.current.keys[key] = false; }
  });

  return (
    <GameShell title="Survival Adventure" score={score} lives={Math.max(0, Math.ceil(hp/20))} onRestart={startGame}>
      <div className="survival-container">
        
        <div style={{position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 10, color: "#fff", fontWeight: "bold"}}>
          <div>HP: {Math.max(0, Math.floor(hp))}/100</div>
          <div>Score: {score}</div>
        </div>

        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />

        {playing && (
          <div className="gamepad-controls">
            <button className="dpad-btn dpad-up" {...btnProps("up")}>⬆️</button>
            <button className="dpad-btn dpad-left" {...btnProps("left")}>⬅️</button>
            <button className="dpad-btn dpad-right" {...btnProps("right")}>➡️</button>
            <button className="dpad-btn dpad-down" {...btnProps("down")}>⬇️</button>
          </div>
        )}

        {!playing && !gameOver && (
          <div className="win-screen" style={{background: "rgba(0,0,0,0.8)"}}>
            <h2 className="win-title" style={{color: "#fff"}}>Survival</h2>
            <p style={{color: "#ccc", marginBottom: "24px"}}>Eat green dots. Avoid red dots. Use arrow keys or buttons.</p>
            <button className="game-btn" onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameOver && (
          <div className="win-screen">
            <h2 className="win-title" style={{color: "#ef4444"}}>Game Over</h2>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-val">{score}</div>
                <div className="win-stat-lbl">Final Score</div>
              </div>
            </div>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        )}

      </div>
    </GameShell>
  );
}
