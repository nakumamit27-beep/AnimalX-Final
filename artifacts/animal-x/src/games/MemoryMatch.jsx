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

export default function MemoryMatch() {
  const { user } = useAuth();
  const [level, setLevel] = useState("Easy"); // Easy: 8, Med: 12, Hard: 16 pairs
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [won, setWin] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);

  const timerRef = useRef(null);
  const winHandledRef = useRef(false);

  const initGame = () => {
    // animals is already an array of {id, name, baseName, category, habitat, diet, ...}
    const shuffledAnimals = shuffleArray([...animals]);
    const pairCount = level === "Easy" ? 8 : level === "Medium" ? 12 : 16;
    const selected = shuffledAnimals.slice(0, pairCount);
    
    // Create pairs
    let deck = [];
    selected.forEach((animal, i) => {
      const img = getAnimalImage(animal);
      deck.push({ id: `a_${i}`, animal: animal.name, img, isMatch: false });
      deck.push({ id: `b_${i}`, animal: animal.name, img, isMatch: false });
    });
    
    setCards(shuffleArray(deck));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setWin(false);
    setPlaying(true);
    setPaused(false);
    winHandledRef.current = false;
  };

  useEffect(() => {
    if (playing && !paused && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, paused, won]);

  useEffect(() => {
    if (
      playing &&
      cards.length > 0 &&
      matched.length === cards.length &&
      !won &&
      !winHandledRef.current
    ) {
      winHandledRef.current = true;
      handleWin(moves);
    }
  }, [playing, cards.length, matched.length, won, moves]);

  const handleCardClick = (index) => {
    if (!playing || paused || won || flipped.length >= 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idx1, idx2] = newFlipped;
      if (cards[idx1].animal === cards[idx2].animal) {
        setMatched(prev => [...prev, idx1, idx2]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const handleWin = async (finalMoves) => {
    setWin(true);
    setPlaying(false);
    
    let par = level === "Easy" ? 15 : level === "Medium" ? 25 : 35;
    let stars = 1;
    if (finalMoves <= par) stars = 3;
    else if (finalMoves <= par + 5) stars = 2;
    
    let earned = 100 + (stars * 20);
    setCoinsEarned(earned);
    setStarsEarned(stars);

    if (user) {
      try {
        const gameId = "memory_" + level;
        await setDoc(doc(db, "gameScores", gameId + "_" + user.uid), {
          gameId, userId: user.uid, score: finalMoves, stars, coins: earned, timestamp: serverTimestamp()
        }, { merge: true });
        
        await setDoc(doc(db, "userGameCoins", user.uid), { 
          coins: increment(earned), stars: increment(stars) 
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    
    // Confetti
    for(let i=0; i<40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = ['#8b5cf6', '#a855f7', '#d946ef'][Math.floor(Math.random()*3)];
      el.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  };

  const cols = level === "Easy" ? 4 : level === "Medium" ? 6 : 8;

  return (
    <GameShell 
      title="Memory Match"
      paused={paused}
      onPause={() => playing && setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={initGame}
      score={moves}
    >
      <div className="memory-container">
        
        <div className="puzzle-controls">
          <select className="puzzle-select" value={level} onChange={e => { setLevel(e.target.value); setPlaying(false); }}>
            <option value="Easy">Easy (4x4)</option>
            <option value="Medium">Medium (4x6)</option>
            <option value="Hard">Hard (4x8)</option>
          </select>
          <button className="tool-btn" onClick={initGame}>{playing ? "Restart" : "Start Game"}</button>
        </div>

        <div style={{fontSize: "1.2rem", fontWeight: "bold", marginBottom: "16px"}}>
          Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')} | Moves: {moves}
        </div>

        {cards.length > 0 ? (
          <div 
            className="memory-grid" 
            style={{ gridTemplateColumns: `repeat(${cols > 4 ? 4 : cols}, 1fr)` }} // Adjust for mobile
          >
            {cards.map((card, idx) => {
              const isFlipped = flipped.includes(idx) || matched.includes(idx);
              return (
                <div 
                  key={card.id} 
                  className={`memory-card ${isFlipped ? 'flipped' : ''} ${matched.includes(idx) ? 'matched' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-front">
                      <img src={card.img} alt={card.animal} loading="lazy" />
                    </div>
                    <div className="memory-card-back">?</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{textAlign: "center", padding: "40px"}}>
            <span style={{fontSize: "4rem"}}>🎴</span>
            <p style={{margin: "16px 0"}}>Find matching pairs of animals!</p>
            <button className="game-btn" onClick={initGame}>Play Now</button>
          </div>
        )}

        {won && (
          <div className="win-screen">
            <h2 className="win-title">Memory Master!</h2>
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
