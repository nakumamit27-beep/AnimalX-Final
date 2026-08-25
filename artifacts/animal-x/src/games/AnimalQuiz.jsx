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

export default function AnimalQuiz() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [won, setWin] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [streak, setStreak] = useState(0);
  
  const timerRef = useRef(null);

  const generateQuestions = () => {
    // animals is an array of { id, name, baseName, category, habitat, diet, lifespan, region, country }
    const pool = [...animals].sort(() => Math.random() - 0.5);

    const getRandOthers = (exclude, field, count) => {
      const others = [];
      for (let i = 0; i < pool.length && others.length < count; i++) {
        const val = pool[i][field];
        if (pool[i].id !== exclude.id && val && !others.includes(val)) {
          others.push(val);
        }
      }
      return others;
    };

    const TYPES = [
      (target) => ({
        text: `Look at this animal — what is it?`,
        image: getAnimalImage(target),
        correct: target.name,
        options: shuffle([target.name, ...getRandOthers(target, "name", 3)]),
      }),
      (target) => ({
        text: `What is the diet of the ${target.name}?`,
        image: null,
        correct: target.diet,
        options: shuffle([target.diet, ...getRandOthers(target, "diet", 3)]),
      }),
      (target) => ({
        text: `In which habitat does the ${target.name} live?`,
        image: null,
        correct: target.habitat,
        options: shuffle([target.habitat, ...getRandOthers(target, "habitat", 3)]),
      }),
      (target) => ({
        text: `What is the lifespan of a ${target.name}?`,
        image: null,
        correct: target.lifespan,
        options: shuffle([target.lifespan, ...getRandOthers(target, "lifespan", 3)]),
      }),
      (target) => ({
        text: `The ${target.name} is found in which region?`,
        image: null,
        correct: target.region,
        options: shuffle([target.region, ...getRandOthers(target, "region", 3)]),
      }),
      (target) => ({
        text: `Which animal belongs to the "${target.category}" category?`,
        image: null,
        correct: target.name,
        options: shuffle([target.name, ...getRandOthers(target, "name", 3)]),
      }),
    ];

    const qs = [];
    for (let i = 0; i < 10; i++) {
      const target = pool[i % pool.length];
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const q = type(target);
      if (q.options.length === 4) qs.push(q);
      else i--; // retry if not enough options
    }

    setQuestions(qs);
    setCurrIdx(0);
    setScore(0);
    setTime(30);
    setStreak(0);
    setPlaying(true);
    setWin(false);
    setSelectedAns(null);
  };

  useEffect(() => {
    if (playing && !won && !selectedAns) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            handleAnswer(null); // Time out
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, won, selectedAns]);

  const handleAnswer = (ans) => {
    setSelectedAns(ans);
    const isCorrect = ans === questions[currIdx].correct;
    
    if (isCorrect) {
      setScore(s => s + 100 + (time > 20 ? 50 : 0));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      if (currIdx < 9) {
        setCurrIdx(c => c + 1);
        setTime(30);
        setSelectedAns(null);
      } else {
        const finalScore = score + (isCorrect ? 100 + (time > 20 ? 50 : 0) : 0);
        endGame(finalScore);
      }
    }, 1500);
  };

  const endGame = async (finalScore = score) => {
    setWin(true);
    setPlaying(false);
    
    let stars = finalScore > 1200 ? 3 : finalScore > 800 ? 2 : 1;
    let earned = 50 + (stars * 10);
    setCoinsEarned(earned);
    setStarsEarned(stars);

    if (user) {
      try {
        await setDoc(doc(db, "gameScores", "quiz_" + user.uid), {
          gameId: "quiz", userId: user.uid, score: finalScore, stars, coins: earned, timestamp: serverTimestamp()
        }, { merge: true });
        
        await setDoc(doc(db, "userGameCoins", user.uid), { 
          coins: increment(earned), stars: increment(stars) 
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <GameShell title="Wildlife Quiz" score={score} onRestart={generateQuestions}>
      <div className="quiz-container">
        {!playing && !won ? (
          <div style={{padding: "60px 20px"}}>
            <span style={{fontSize: "4rem"}}>❓</span>
            <h2>Test Your Knowledge</h2>
            <p style={{margin: "16px 0", color: "var(--text2)"}}>10 questions. 30 seconds each. Can you get them all right?</p>
            <button className="game-btn" onClick={generateQuestions}>Start Quiz</button>
          </div>
        ) : won ? (
          <div className="win-screen">
            <h2 className="win-title">Quiz Complete!</h2>
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
            <button className="game-btn" onClick={generateQuestions}>Play Again</button>
          </div>
        ) : (
          <>
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold"}}>
              <span>Question {currIdx + 1}/10</span>
              <span style={{color: time <= 5 ? "#ef4444" : "var(--accent)"}}>⏱️ {time}s</span>
            </div>
            
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{width: `${(time/30)*100}%`, background: time <= 5 ? "#ef4444" : "var(--accent)"}}></div>
            </div>
            
            <div className="quiz-question-box">
              {questions[currIdx].image && (
                <img src={questions[currIdx].image} alt="Question" className="quiz-image" />
              )}
              <div className="quiz-question">{questions[currIdx].text}</div>
            </div>
            
            <div className="quiz-options">
              {questions[currIdx].options.map((opt, i) => {
                let btnClass = "option-btn";
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
                    {opt}
                  </button>
                );
              })}
            </div>
            
            {streak > 2 && <div style={{marginTop: "20px", color: "#f59e0b", fontWeight: "bold", animation: "letterBounce 0.5s"}}>🔥 {streak} Streak!</div>}
          </>
        )}
      </div>
    </GameShell>
  );
}
