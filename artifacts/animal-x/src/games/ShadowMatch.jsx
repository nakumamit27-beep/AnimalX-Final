import { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import animals from "../data/animals";
import { getAnimalImage } from "../utils/image";
import { db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./games.css";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function ShadowMatch() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [won, setWin] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);

  const startGame = () => {
    // animals is already an array of objects
    const allAnimals = animals;
    
    let qs = [];
    for(let i=0; i<10; i++) {
      const correct = allAnimals[Math.floor(Math.random() * allAnimals.length)];
      let wrong = [];
      while(wrong.length < 3) {
        let r = allAnimals[Math.floor(Math.random() * allAnimals.length)];
        if (r.id !== correct.id && !wrong.find(w => w.id === r.id)) wrong.push(r);
      }
      qs.push({ correct, options: shuffle([correct, ...wrong]) });
    }
    
    setQuestions(qs);
    setCurrIdx(0);
    setScore(0);
    setPlaying(true);
    setWin(false);
    setSelectedAns(null);
  };

  const handleAnswer = (ans) => {
    setSelectedAns(ans);
    const isCorrect = ans === questions[currIdx].correct;
    
    if (isCorrect) {
      setScore(s => s + 100);
    }
    
    setTimeout(() => {
      if (currIdx < 9) {
        setCurrIdx(c => c + 1);
        setSelectedAns(null);
      } else {
        endGame();
      }
    }, 1200);
  };

  const endGame = async () => {
    setWin(true);
    setPlaying(false);
    
    let stars = score >= 900 ? 3 : score >= 600 ? 2 : 1;
    let earned = 75 + (stars * 10);
    setCoinsEarned(earned);
    setStarsEarned(stars);

    if (user) {
      try {
        await setDoc(doc(db, "gameScores", "shadow_" + user.uid), {
          gameId: "shadow", userId: user.uid, score, stars, coins: earned, timestamp: serverTimestamp()
        }, { merge: true });
        
        await setDoc(doc(db, "userGameCoins", user.uid), { 
          coins: increment(earned), stars: increment(stars) 
        }, { merge: true });
      } catch (e) {}
    }
  };

  return (
    <GameShell title="Shadow Match" score={score} onRestart={startGame}>
      <div className="shadow-container">
        {!playing && !won ? (
          <div style={{padding: "60px 20px"}}>
            <span style={{fontSize: "4rem"}}>👤</span>
            <h2>Shadow Match</h2>
            <p style={{margin: "16px 0", color: "var(--text2)"}}>Identify the animal by its silhouette.</p>
            <button className="game-btn" onClick={startGame}>Start Game</button>
          </div>
        ) : won ? (
          <div className="win-screen">
            <h2 className="win-title">Completed!</h2>
            <div className="win-stars">
              {Array.from({length: 3}).map((_, i) => (
                <span key={i} style={{color: i < starsEarned ? "#fbbf24" : "#4b5563"}}>⭐</span>
              ))}
            </div>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-val">{score}</div>
                <div className="win-stat-lbl">Score</div>
              </div>
              <div className="win-stat">
                <div className="win-stat-val">+{coinsEarned}</div>
                <div className="win-stat-lbl">Coins</div>
              </div>
            </div>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        ) : (
          <>
            <div style={{fontWeight: "bold", marginBottom: "16px"}}>Question {currIdx + 1}/10</div>
            
            <div className="shadow-target-wrap">
              <img src={getAnimalImage({name: questions[currIdx].correct})} alt="Shadow" className="shadow-target" />
            </div>
            
            <div className="shadow-options">
              {questions[currIdx].options.map((opt, i) => {
                let btnClass = "shadow-option";
                if (selectedAns) {
                  if (opt === questions[currIdx].correct) btnClass += " correct";
                  else if (opt === selectedAns) btnClass += " wrong";
                }
                return (
                  <button 
                    key={i} 
                    className={btnClass}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selectedAns}
                  >
                    <img src={getAnimalImage({name: opt})} alt={opt} />
                    <div style={{fontWeight: "600", fontSize: "0.9rem"}}>{opt}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}
