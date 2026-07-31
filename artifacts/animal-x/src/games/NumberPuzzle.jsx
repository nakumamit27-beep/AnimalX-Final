import { useState } from "react";
import GameShell from "./GameShell";
import "./games.css";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function NumberPuzzle() {
  const [level, setLevel] = useState(5);
  const [slots, setSlots] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [won, setWin] = useState(false);

  const startGame = () => {
    setSlots(Array.from({length: level}, (_, i) => ({ val: i + 1, filled: false })));
    setTiles(shuffle(Array.from({length: level}, (_, i) => i + 1)));
    setPlaying(true);
    setWin(false);
  };

  const handleDragStart = (e, val) => {
    e.dataTransfer.setData("text/plain", val);
  };

  const handleDrop = (e, targetVal) => {
    e.preventDefault();
    const val = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (val === targetVal) {
      setSlots(prev => prev.map(s => s.val === val ? {...s, filled: true} : s));
      setTiles(prev => prev.filter(t => t !== val));
      
      // Check win
      if (tiles.length === 1) {
        setWin(true);
        setPlaying(false);
      }
    }
  };

  return (
    <GameShell title="Number Count" onRestart={startGame}>
      <div className="number-puzzle-container">
        
        <div style={{display: "flex", gap: "12px", justifyContent: "center", marginBottom: "32px"}}>
          <button className="game-btn-secondary" onClick={() => {setLevel(5); startGame();}}>1 to 5</button>
          <button className="game-btn-secondary" onClick={() => {setLevel(10); startGame();}}>1 to 10</button>
        </div>

        {!playing && !won ? (
          <div style={{textAlign: "center", padding: "40px"}}>
            <span style={{fontSize: "4rem"}}>🔢</span>
            <h2>Learn Numbers</h2>
            <button className="game-btn" style={{marginTop: "24px"}} onClick={startGame}>Start Game</button>
          </div>
        ) : (
          <>
            <div className="drop-slots-grid">
              {slots.map(s => (
                <div 
                  key={s.val} 
                  className={`drop-slot ${s.filled ? 'filled' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, s.val)}
                >
                  {s.filled ? s.val : "?"}
                </div>
              ))}
            </div>

            <div className="drag-tiles-tray">
              {tiles.map(t => (
                <div 
                  key={t} 
                  className="drag-tile"
                  draggable
                  onDragStart={e => handleDragStart(e, t)}
                >
                  {t}
                </div>
              ))}
            </div>
          </>
        )}

        {won && (
          <div className="win-screen">
            <h2 className="win-title">Great Job!</h2>
            <div className="win-stars">⭐⭐⭐</div>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        )}

      </div>
    </GameShell>
  );
}
