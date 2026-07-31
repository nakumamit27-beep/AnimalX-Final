import { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import animals from "../data/animals";
import { getAnimalImage } from "../utils/image";
import { db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./games.css";

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSolvable(arr, size) {
  let inversions = 0;
  const filtered = arr.filter(n => n !== null);
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) inversions++;
    }
  }
  if (size % 2 !== 0) return inversions % 2 === 0;
  const emptyIdx = arr.indexOf(null);
  const emptyRowFromBottom = size - Math.floor(emptyIdx / size);
  if (emptyRowFromBottom % 2 === 0) return inversions % 2 !== 0;
  return inversions % 2 === 0;
}

export default function AnimalPuzzle() {
  const { user } = useAuth();
  const [size, setSize] = useState(3);
  const [animal, setAnimal] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [won, setWin] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [preview, setPreview] = useState(false);
  const [hintIdx, setHintIdx] = useState(null);
  
  const timerRef = useRef(null);

  // Pick random animal on load
  useEffect(() => {
    const rand = animals[Math.floor(Math.random() * animals.length)];
    setAnimal(rand);
  }, []);

  const initGame = () => {
    const totalTiles = size * size;
    let arr = Array.from({length: totalTiles - 1}, (_, i) => i);
    arr.push(null);
    
    let shuffled = shuffleArray(arr);
    while (!isSolvable(shuffled, size) || isWon(shuffled)) {
      shuffled = shuffleArray(arr);
    }
    
    setTiles(shuffled);
    setMoves(0);
    setTime(0);
    setWin(false);
    setPlaying(true);
    setPaused(false);
    setHintIdx(null);
  };

  useEffect(() => {
    if (playing && !paused && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, paused, won]);

  const isWon = (currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i) return false;
    }
    return currentTiles[currentTiles.length - 1] === null;
  };

  const moveTile = (idx) => {
    if (!playing || paused || won) return;
    
    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(idx / size);
    const col = idx % size;
    const eRow = Math.floor(emptyIdx / size);
    const eCol = emptyIdx % size;
    
    const isAdjacent = (Math.abs(row - eRow) === 1 && col === eCol) || 
                       (Math.abs(col - eCol) === 1 && row === eRow);
                       
    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIdx] = tiles[idx];
      newTiles[idx] = null;
      setTiles(newTiles);
      setMoves(m => m + 1);
      setHintIdx(null);
      
      if (isWon(newTiles)) {
        handleWin();
      }
    }
  };

  const handleWin = async () => {
    setWin(true);
    setPlaying(false);
    
    let stars = 1;
    let parMoves = size === 3 ? 30 : size === 4 ? 60 : 100;
    if (moves <= parMoves) stars = 3;
    else if (moves <= parMoves * 1.5) stars = 2;
    
    let earned = 50 + (stars * 10);
    setCoinsEarned(earned);
    setStarsEarned(stars);

    if (user) {
      try {
        const gameId = "puzzle_" + size;
        await setDoc(doc(db, "gameScores", gameId + "_" + user.uid), {
          gameId, userId: user.uid, score: moves, stars, coins: earned, timestamp: serverTimestamp()
        }, { merge: true });
        
        await setDoc(doc(db, "userGameCoins", user.uid), { 
          coins: increment(earned), stars: increment(stars) 
        }, { merge: true });
      } catch (e) {
        console.error("Save failed", e);
      }
    }
    
    // Confetti burst
    for(let i=0; i<30; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'][Math.floor(Math.random()*4)];
      el.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  };

  const showHint = () => {
    if (hintIdx !== null || !playing || paused) return;
    // Just highlight a tile adjacent to empty space to help
    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;
    const adj = [];
    if (row > 0) adj.push(emptyIdx - size);
    if (row < size - 1) adj.push(emptyIdx + size);
    if (col > 0) adj.push(emptyIdx - 1);
    if (col < size - 1) adj.push(emptyIdx + 1);
    
    setHintIdx(adj[Math.floor(Math.random() * adj.length)]);
    setTimeout(() => setHintIdx(null), 1000);
  };

  const handlePreview = () => {
    setPreview(true);
    setTimeout(() => setPreview(false), 2000);
  };

  const imgUrl = animal ? getAnimalImage(animal) : "";

  return (
    <GameShell 
      title="Animal Puzzle"
      paused={paused}
      onPause={() => playing && setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={initGame}
      score={moves}
    >
      <div className="puzzle-container">
        
        <div className="puzzle-controls">
          <select className="puzzle-select" value={size} onChange={e => { setSize(Number(e.target.value)); setPlaying(false); }}>
            <option value={3}>3x3 (8 tiles)</option>
            <option value={4}>4x4 (15 tiles)</option>
            <option value={5}>5x5 (24 tiles)</option>
          </select>
          <button className="tool-btn" onClick={initGame}>{playing ? "Restart" : "Start Game"}</button>
          <button className="tool-btn" onClick={handlePreview} disabled={!playing}>Preview</button>
          <button className="tool-btn" onClick={showHint} disabled={!playing}>Hint (Free)</button>
        </div>

        <div style={{fontSize: "1.2rem", fontWeight: "bold", marginBottom: "16px"}}>
          Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')} | Moves: {moves}
        </div>

        {animal && (
          <div 
            className="puzzle-board" 
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              width: "100%", maxWidth: "400px", aspectRatio: "1"
            }}
          >
            {preview ? (
              <img src={imgUrl} style={{width: "100%", height: "100%", objectFit: "cover", gridColumn: `1 / span ${size}`, gridRow: `1 / span ${size}`}} alt="Preview" />
            ) : tiles.length > 0 ? tiles.map((val, idx) => {
              if (val === null) return <div key="empty" className="puzzle-tile empty" />;
              
              const bgX = (val % size) * (100 / (size - 1));
              const bgY = Math.floor(val / size) * (100 / (size - 1));
              
              return (
                <div 
                  key={val}
                  className={`puzzle-tile ${hintIdx === idx ? 'hint' : ''}`}
                  data-index={val + 1}
                  onClick={() => moveTile(idx)}
                  style={{
                    backgroundImage: `url(${imgUrl})`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                    backgroundSize: `${size * 100}% ${size * 100}%`
                  }}
                />
              );
            }) : (
              <div style={{gridColumn: `1 / span ${size}`, gridRow: `1 / span ${size}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                <img src={imgUrl} style={{width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, position: "absolute", zIndex: 0}} alt="bg" />
                <button className="game-btn" style={{position: "relative", zIndex: 1}} onClick={initGame}>Play Now</button>
              </div>
            )}
          </div>
        )}

        {won && (
          <div className="win-screen">
            <h2 className="win-title">Puzzle Solved!</h2>
            <div className="win-stars">
              {Array.from({length: 3}).map((_, i) => (
                <span key={i} style={{color: i < starsEarned ? "#fbbf24" : "#4b5563"}}>⭐</span>
              ))}
            </div>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-val">{moves}</div>
                <div className="win-stat-lbl">Moves</div>
              </div>
              <div className="win-stat">
                <div className="win-stat-val">+{coinsEarned}</div>
                <div className="win-stat-lbl">Coins</div>
              </div>
            </div>
            <button className="game-btn" onClick={initGame}>Play Again</button>
          </div>
        )}

      </div>
    </GameShell>
  );
}
