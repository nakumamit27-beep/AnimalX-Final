import { useState, useEffect } from "react";
import GameShell from "./GameShell";
import animals from "../data/animals";
import { getAnimalImage } from "../utils/image";
import "./games.css";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function JigsawPuzzle() {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [animal, setAnimal] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [won, setWin] = useState(false);
  
  const [pieces, setPieces] = useState([]);
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(0);

  const startGame = () => {
    // animals is already an array of objects
    const target = animals[Math.floor(Math.random() * animals.length)];
    setAnimal(target);
    
    const count = cols * rows;
    let initialPieces = Array.from({length: count}, (_, i) => i);
    setPieces(shuffle(initialPieces));
    setGrid(Array.from({length: count}, () => null));
    setMoves(0);
    setPlaying(true);
    setWin(false);
  };

  const handleDragStart = (e, val, isFromGrid, idx) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({val, isFromGrid, idx}));
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { val, isFromGrid, idx: sourceIdx } = data;
    
    // If dropping on filled slot, ignore for simplicity
    if (grid[targetIdx] !== null) return;

    const newGrid = [...grid];
    newGrid[targetIdx] = val;
    
    if (isFromGrid) {
      newGrid[sourceIdx] = null;
    } else {
      setPieces(p => p.filter(x => x !== val));
    }
    
    setGrid(newGrid);
    setMoves(m => m + 1);
    
    // Check win
    if (newGrid.every((v, i) => v === i)) {
      setWin(true);
      setPlaying(false);
    }
  };

  const imgUrl = animal ? getAnimalImage(animal) : "";

  return (
    <GameShell title="Jigsaw Puzzle" score={moves} onRestart={startGame}>
      <div className="jigsaw-container">
        
        {!playing && !won ? (
          <div style={{textAlign: "center", padding: "40px"}}>
            <span style={{fontSize: "4rem"}}>🖼️</span>
            <h2>Jigsaw Puzzle</h2>
            <div style={{margin: "20px 0"}}>
              <select className="puzzle-select" onChange={e => {
                const [c,r] = e.target.value.split("x");
                setCols(Number(c)); setRows(Number(r));
              }}>
                <option value="4x3">12 Pieces (Easy)</option>
                <option value="5x4">20 Pieces (Medium)</option>
                <option value="8x6">48 Pieces (Hard)</option>
              </select>
            </div>
            <button className="game-btn" onClick={startGame}>Start Game</button>
          </div>
        ) : (
          <>
            <div className="jigsaw-board-wrap">
              <div 
                className="jigsaw-board"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  width: "100%", maxWidth: "600px", aspectRatio: "16/9",
                  '--board-w': `${cols * 100}%`,
                  '--board-h': `${rows * 100}%`
                }}
              >
                {grid.map((val, i) => (
                  <div 
                    key={i} 
                    className="jigsaw-slot"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, i)}
                  >
                    {val !== null ? (
                      <div 
                        draggable
                        onDragStart={e => handleDragStart(e, val, true, i)}
                        style={{
                          width: "100%", height: "100%",
                          backgroundImage: `url(${imgUrl})`,
                          backgroundPosition: `${(val % cols) * (100 / (cols - 1))}% ${Math.floor(val / cols) * (100 / (rows - 1))}%`,
                          backgroundSize: `var(--board-w) var(--board-h)`
                        }}
                      />
                    ) : (
                      i + 1
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="jigsaw-tray">
              {pieces.map(val => (
                <div 
                  key={val} 
                  className="jigsaw-piece"
                  draggable
                  onDragStart={e => handleDragStart(e, val, false, null)}
                  style={{
                    width: `calc(100% / ${cols})`,
                    aspectRatio: `${cols}/${rows}`,
                    backgroundImage: `url(${imgUrl})`,
                    backgroundPosition: `${(val % cols) * (100 / (cols - 1))}% ${Math.floor(val / cols) * (100 / (rows - 1))}%`,
                    backgroundSize: `${cols * 100}% ${rows * 100}%`
                  }}
                />
              ))}
              {pieces.length === 0 && <div style={{color: "var(--text2)", margin: "auto"}}>All pieces placed!</div>}
            </div>
          </>
        )}

        {won && (
          <div className="win-screen">
            <h2 className="win-title">Picture Perfect!</h2>
            <div className="win-stars">⭐⭐⭐</div>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        )}

      </div>
    </GameShell>
  );
}
