import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import animals from "../data/animals";
import { getAnimalImage } from "../utils/image";
import "../games/games.css";

const GAMES = [
  { id: "puzzle", title: "Animal Puzzle", desc: "Slide the tiles to reveal the animal", path: "/games/puzzle", difficulty: "Easy", color: "#3b82f6", icon: "🧩", animal: "Lion" },
  { id: "memory", title: "Memory Match", desc: "Find matching pairs of animals", path: "/games/memory", difficulty: "Medium", color: "#8b5cf6", icon: "🎴", animal: "Tiger" },
  { id: "quiz", title: "Wildlife Quiz", desc: "Test your animal knowledge", path: "/games/quiz", difficulty: "Hard", color: "#f59e0b", icon: "❓", animal: "Elephant" },
  { id: "guess", title: "Guess Who", desc: "Identify the blurred animal", path: "/games/guess", difficulty: "Medium", color: "#ef4444", icon: "🔍", animal: "Cheetah" },
  { id: "shadow", title: "Shadow Match", desc: "Match animals to their silhouettes", path: "/games/shadow", difficulty: "Easy", color: "#6366f1", icon: "👤", animal: "Wolf" },
  { id: "abc", title: "Animal ABC", desc: "Learn the alphabet with wildlife", path: "/games/abc", difficulty: "Easy", color: "#ec4899", icon: "🔤", animal: "Gorilla" },
  { id: "coloring", title: "Art Studio", desc: "Color your favorite animals", path: "/games/coloring", difficulty: "Easy", color: "#14b8a6", icon: "🎨", animal: "Peacock" },
  { id: "survival", title: "Survival", desc: "Eat food and avoid predators", path: "/games/survival", difficulty: "Hard", color: "#22c55e", icon: "🏃", animal: "Dolphin" },
  { id: "numbers", title: "Number Count", desc: "Learn counting with animals", path: "/games/numbers", difficulty: "Easy", color: "#06b6d4", icon: "🔢", animal: "Panda" },
  { id: "jigsaw", title: "Jigsaw Puzzle", desc: "Classic jigsaw with animal photos", path: "/games/jigsaw", difficulty: "Medium", color: "#f97316", icon: "🖼️", animal: "Eagle" }
];

export default function Games() {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "userGameCoins", user.uid)).then(snap => {
        if (snap.exists()) {
          setCoins(snap.data().coins || 0);
          setStars(snap.data().stars || 0);
        }
      }).catch(console.error);
    }
  }, [user]);

  return (
    <div className="games-page">
      <div className="games-header">
        <div>
          <h1 className="page-title">Game Center</h1>
          <p className="page-subtitle">Play and learn with wildlife</p>
        </div>
        
        <div className="games-stats">
          <div className="stat-pill">
            <span className="icon-star">⭐</span>
            <span>{stars}</span>
          </div>
          <div className="stat-pill">
            <span className="icon-coin">🪙</span>
            <span>{coins}</span>
          </div>
        </div>
      </div>

      <div className="game-cards-grid">
        {GAMES.map(game => {
          // Find the representative animal
          let animalObj = null;
          for (const cat in animals) {
             const list = animals[cat];
             const found = list?.find && list.find(a => a.name === game.animal) || { name: game.animal };
             animalObj = found;
             break;
          }
          if(!animalObj) animalObj = { name: game.animal };

          const diffClass = game.difficulty === "Easy" ? "diff-easy" : game.difficulty === "Medium" ? "diff-medium" : "diff-hard";

          return (
            <div key={game.id} className="game-card" style={{borderColor: `color-mix(in srgb, ${game.color} 30%, var(--border))`}}>
              <div className="game-card-thumb">
                <img src={getAnimalImage(animalObj)} alt={game.title} loading="lazy" />
                <div className="game-card-overlay"></div>
                <div className={`difficulty-badge ${diffClass}`}>{game.difficulty}</div>
              </div>
              <div className="game-card-info">
                <h3 style={{color: game.color}}>{game.icon} {game.title}</h3>
                <p>{game.desc}</p>
                <Link href={game.path} className="play-btn" style={{backgroundColor: game.color, color: "#fff"}}>
                  Play Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
