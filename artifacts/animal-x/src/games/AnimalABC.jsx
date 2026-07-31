import { useState, useEffect } from "react";
import GameShell from "./GameShell";
import { getAnimalImage } from "../utils/image";
import "./games.css";

const ALPHABET = [
  { letter: "A", animal: "Alligator", fact: "Alligators are large reptiles that live in freshwater environments." },
  { letter: "B", animal: "Bear", fact: "Bears have an excellent sense of smell and hibernate during winter." },
  { letter: "C", animal: "Cheetah", fact: "The cheetah is the fastest land animal in the world." },
  { letter: "D", animal: "Dolphin", fact: "Dolphins are highly intelligent marine mammals." },
  { letter: "E", animal: "Eagle", fact: "Eagles have incredible eyesight and can spot prey from far away." },
  { letter: "F", animal: "Fox", fact: "Foxes are clever animals that can adapt to many environments." },
  { letter: "G", animal: "Gorilla", fact: "Gorillas are our close relatives and live in family groups called troops." },
  { letter: "H", animal: "Hyena", fact: "Hyenas have a unique 'laugh' and very strong jaws." },
  { letter: "I", animal: "Iguana", fact: "Iguanas are large lizards that love to bask in the sun." },
  { letter: "J", animal: "Jaguar", fact: "Jaguars are powerful wild cats found in the Americas." },
  { letter: "K", animal: "Kangaroo", fact: "Kangaroos hop to move around and carry their babies in pouches." },
  { letter: "L", animal: "Lion", fact: "Lions roar so loudly it can be heard from 5 miles away." },
  { letter: "M", animal: "Monkey", fact: "Monkeys are very social and use their tails to swing from trees." },
  { letter: "N", animal: "Narwhal", fact: "Narwhals are known as the 'unicorns of the sea'." },
  { letter: "O", animal: "Orangutan", fact: "Orangutans are great apes with long reddish-brown hair." },
  { letter: "P", animal: "Parrot", fact: "Parrots are colorful birds that can often mimic human speech." },
  { letter: "Q", animal: "Quokka", fact: "Quokkas are known as the happiest animals on Earth." },
  { letter: "R", animal: "Rattlesnake", fact: "Rattlesnakes shake their tails to warn predators to stay away." },
  { letter: "S", animal: "Shark", fact: "Sharks are cartilaginous fish that have been around for millions of years." },
  { letter: "T", animal: "Tiger", fact: "Tigers are the largest wild cats and have unique stripe patterns." },
  { letter: "U", animal: "Uromastyx", fact: "Uromastyx are spiny-tailed lizards found in deserts." },
  { letter: "V", animal: "Vulture", fact: "Vultures play an important role in the ecosystem by eating carrion." },
  { letter: "W", animal: "Wolf", fact: "Wolves live and hunt in packs led by an alpha pair." },
  { letter: "X", animal: "X-Ray Fish", fact: "X-Ray Fish have translucent bodies so you can see their bones." },
  { letter: "Y", animal: "Yak", fact: "Yaks have long shaggy hair to keep warm in the mountains." },
  { letter: "Z", animal: "Zebra", fact: "Zebras have black and white stripes, and no two patterns are alike!" }
];

export default function AnimalABC() {
  const [idx, setIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speak = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak(`${ALPHABET[idx].letter} is for ${ALPHABET[idx].animal}`);
  }, [idx, voiceEnabled]);

  const curr = ALPHABET[idx];

  return (
    <GameShell title="Animal ABC">
      <div className="abc-page">
        
        <div style={{position: "absolute", top: 20, right: 20}}>
          <button className="game-icon-btn" onClick={() => setVoiceEnabled(!voiceEnabled)}>
            {voiceEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        <div key={curr.letter} className="abc-letter">{curr.letter}</div>
        <div className="abc-animal-name">{curr.animal}</div>
        
        <div className="abc-card">
          <img src={getAnimalImage({name: curr.animal})} alt={curr.animal} className="abc-img" />
          <div className="abc-fact">
            <span style={{fontSize: "1.5rem", display: "block", marginBottom: "8px"}}>💡</span>
            {curr.fact}
          </div>
        </div>

        <div className="abc-nav">
          <button 
            className="game-btn-secondary" 
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            ← Prev
          </button>
          <button 
            className="game-btn" 
            onClick={() => setIdx(i => Math.min(ALPHABET.length - 1, i + 1))}
            disabled={idx === ALPHABET.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </GameShell>
  );
}
