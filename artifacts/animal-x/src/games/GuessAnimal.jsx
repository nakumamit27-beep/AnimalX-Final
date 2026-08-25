import { useState, useEffect, useRef } from "react";
import GameShell from "./GameShell";
import animals from "../data/animals";
import { getAnimalImage } from "../utils/image";
import { db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./games.css";

export default function GuessAnimal() {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [animal, setAnimal] = useState(null);
  const [blur, setBlur] = useState(20);
  const [guess, setGuess] = useState("");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [won, setWin] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const timerRef = useRef(null);
  const allNames = useRef([]);

  useEffect(() => {
    // animals is an array of {id, name, baseName, category, ...}
    allNames.current = animals;
  }, []);

  const initRound = () => {
    const target = allNames.current[Math.floor(Math.random() * allNames.current.length)];
    setAnimal(target);
    setBlur(20);
    setGuess("");
    setPlaying(true);
    setWin(false);
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    initRound();
  };

  useEffect(() => {
    if (playing && blur > 0) {
      timerRef.current = setInterval(() => {
        setBlur(b => Math.max(0, b - 1));
      }, 1500); // decrease blur every 1.5s
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, blur]);

  const handleGuessChange = (e) => {
    const val = e.target.value;
    setGuess(val);
    if (val.length > 1) {
      // allNames.current is array of animal objects
      const matches = allNames.current
        .filter(a => a.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5)
        .map(a => a.name);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const submitGuess = (val) => {
    setGuess(val);
    setSuggestions([]);
    // animal is an animal object; compare by name
    const animalName = animal?.name || animal || "";
    if (val.toLowerCase() === animalName.toLowerCase()) {
      // Correct
      const roundScore = Math.floor(blur * 25);
      setScore(s => s + roundScore + 100);
      setBlur(0);
      setPlaying(false);
      setTimeout(() => {
        if (level < 10) {
          setLevel(l => l + 1);
          initRound();
        } else {
          endGame(score + roundScore + 100);
        }
      }, 2000);
    } else {
      // Wrong
      setLives(l => l - 1);
      setGuess("");
      if (lives <= 1) {
        endGame();
      }
    }
  };

  const endGame = async (finalScore = score) => {
    setPlaying(false);
    setWin(true);
    setBlur(0);
    
    let coins = Math.floor(finalScore / 10);
    
    if (user) {
      try {
        await setDoc(doc(db, "gameScores", "guess_" + user.uid), {
          gameId: "guess", userId: user.uid, score: finalScore, level, coins, timestamp: serverTimestamp()
        }, { merge: true });
        
        await setDoc(doc(db, "userGameCoins", user.uid), { 
          coins: increment(coins)
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <GameShell title="Guess Who" score={score} lives={lives} onRestart={startGame}>
      <div className="guess-container">
        {!animal ? (
          <div style={{padding: "60px 20px", textAlign: "center"}}>
            <span style={{fontSize: "4rem"}}>🔍</span>
            <h2>Guess the Blurred Animal</h2>
            <p style={{margin: "16px 0", color: "var(--text2)"}}>Identify the animal before the image becomes clear. Higher blur = more points!</p>
            <button className="game-btn" onClick={startGame}>Start Game</button>
          </div>
        ) : won ? (
          <div className="win-screen">
            <h2 className="win-title">{lives > 0 ? "You Win!" : "Game Over"}</h2>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-val">{score}</div>
                <div className="win-stat-lbl">Score</div>
              </div>
              <div className="win-stat">
                <div className="win-stat-val">{level}</div>
                <div className="win-stat-lbl">Level Reached</div>
              </div>
            </div>
            <button className="game-btn" onClick={startGame}>Play Again</button>
          </div>
        ) : (
          <>
            <div style={{display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "400px", marginBottom: "16px"}}>
              <span style={{fontWeight: "bold"}}>Level {level}/10</span>
              <span style={{color: "var(--accent)"}}>Blur: {blur}px</span>
            </div>
            
            <div className="guess-image-wrap">
              <img 
                src={getAnimalImage(animal)} 
                alt="Guess me" 
                className="guess-image" 
                style={{ filter: `blur(${blur}px)` }} 
              />
            </div>
            
            {!playing ? (
              <div style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)", animation: "letterBounce 0.5s"}}>
                 Correct! It's a {animal.name}!
              </div>
            ) : (
              <div className="guess-input-wrap">
                <input 
                  type="text" 
                  className="guess-input" 
                  placeholder="Type animal name..." 
                  value={guess}
                  onChange={handleGuessChange}
                  onKeyDown={e => e.key === 'Enter' && submitGuess(guess)}
                />
                {suggestions.length > 0 && (
                  <div className="guess-suggestions">
                    {suggestions.map((s, i) => (
                      <div key={i} className="guess-suggestion" onClick={() => submitGuess(s)}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button 
              className="game-btn-secondary" 
              style={{marginTop: "24px"}} 
              onClick={() => setBlur(b => Math.max(0, b - 5))}
              disabled={!playing}
            >
              Reveal More (-50 points)
            </button>
          </>
        )}
      </div>
    </GameShell>
  );
}
