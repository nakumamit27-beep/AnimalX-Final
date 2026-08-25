import { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import "./games.css";

const COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#78716c", "#713f12", "#451a03", "#fef08a", "#bef264"
];

const OUTLINES = {
  lion: "M150,50 C200,50 250,100 250,150 C250,200 200,250 150,250 C100,250 50,200 50,150 C50,100 100,50 150,50 Z M150,100 C170,100 190,120 190,150 C190,180 170,200 150,200 C130,200 110,180 110,150 C110,120 130,100 150,100 Z M120,50 L100,10 L150,30 Z M180,50 L200,10 L150,30 Z",
  fish: "M50,150 C100,100 200,100 250,150 C200,200 100,200 50,150 Z M250,150 L290,110 L290,190 Z M120,100 L150,70 L180,100 Z M120,200 L150,230 L180,200 Z",
  bird: "M100,150 C100,100 200,100 250,150 C200,200 150,200 100,150 Z M250,150 L280,140 L280,160 Z M120,100 C150,50 200,50 200,100 Z"
};

export default function AnimalColoring() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(12);
  const [tool, setTool] = useState("draw"); // draw, erase
  const [drawing, setDrawing] = useState(false);
  const [outline, setOutline] = useState("lion");

  useEffect(() => {
    clearCanvas();
  }, [outline]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    draw(e, true);
  };

  const stopDraw = (e) => {
    e?.preventDefault();
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").beginPath();
  };

  const draw = (e, isStarting = false) => {
    e.preventDefault();
    if (!drawing && !isStarting) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const rect = canvas.getBoundingClientRect();
    const point = e.touches?.[0] || e;
    const x = (point.clientX - rect.left) * (canvas.width / rect.width);
    const y = (point.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "erase" ? "#ffffff" : color;

    if (isStarting) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <GameShell title="Art Studio">
      <div className="coloring-container">
        
        <div style={{display: "flex", gap: "10px", marginBottom: "16px"}}>
          {Object.keys(OUTLINES).map(k => (
            <button key={k} className={`tool-btn ${outline === k ? "active" : ""}`} onClick={() => setOutline(k)}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <div className="canvas-wrap">
          <canvas 
            ref={canvasRef}
            width={300} 
            height={300}
            onMouseDown={startDraw}
            onMouseUp={stopDraw}
            onMouseOut={stopDraw}
            onMouseMove={draw}
             onContextMenu={(e) => e.preventDefault()}
            onTouchStart={startDraw}
            onTouchEnd={stopDraw}
            onTouchMove={draw}
          />
          <div className="canvas-overlay">
            <svg viewBox="0 0 300 300">
              <path d={OUTLINES[outline]} fill="none" stroke="#000" strokeWidth="4" />
            </svg>
          </div>
        </div>

        <div className="tool-bar">
          <button className={`tool-btn ${tool === "draw" ? "active" : ""}`} onClick={() => setTool("draw")}>✏️ Brush</button>
          <button className={`tool-btn ${tool === "erase" ? "active" : ""}`} onClick={() => setTool("erase")}>🧹 Eraser</button>
          <button className="tool-btn" onClick={clearCanvas}>🗑️ Clear</button>
        </div>

        <div className="tool-bar">
          <button className={`tool-btn ${size === 4 ? "active" : ""}`} onClick={() => setSize(4)}>Small</button>
          <button className={`tool-btn ${size === 12 ? "active" : ""}`} onClick={() => setSize(12)}>Med</button>
          <button className={`tool-btn ${size === 24 ? "active" : ""}`} onClick={() => setSize(24)}>Large</button>
        </div>

        <div className="color-palette">
          {COLORS.map(c => (
            <div 
              key={c} 
              className={`color-swatch ${color === c && tool === "draw" ? "active" : ""}`} 
              style={{backgroundColor: c}}
              onClick={() => { setColor(c); setTool("draw"); }}
            />
          ))}
        </div>

      </div>
    </GameShell>
  );
}
