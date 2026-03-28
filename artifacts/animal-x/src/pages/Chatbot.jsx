import { useState, useRef, useEffect } from "react";

const WILDLIFE_KEYWORDS = [
  "animal","wildlife","bird","fish","mammal","reptile","insect","plant","tree","nature",
  "habitat","forest","ocean","desert","mountain","jungle","savanna","ecosystem","species",
  "lion","tiger","elephant","wolf","bear","shark","eagle","dolphin","whale","crocodile",
  "snake","lizard","parrot","owl","penguin","butterfly","bee","ant","frog","coral",
  "zoo","safari","migration","extinction","endangered","conservation","predator","prey",
  "carnivore","herbivore","omnivore","food chain","biodiversity","climate","environment",
  "africa","amazon","himalayas","arctic","antarctic","rainforest","ocean","sea","river","lake"
];

const wildlifeQA = [
  { q: /lion|lions/i, a: "Lions are apex predators of the African savanna. They live in groups called prides and are the only truly social big cats. Males are known for their magnificent manes. 🦁" },
  { q: /elephant|elephants/i, a: "Elephants are the world's largest land animals. They have remarkable memories, use tools, mourn their dead, and are highly intelligent. African elephants have larger ears than Asian elephants. 🐘" },
  { q: /shark|sharks/i, a: "Sharks are ancient ocean predators that have existed for 450 million years. There are over 500 species, ranging from the tiny dwarf lantern shark to the massive whale shark. 🦈" },
  { q: /whale|whales/i, a: "Whales are the largest animals on Earth. Blue whales can reach 30 meters long and weigh up to 200 tons. They communicate through complex songs that can travel thousands of miles. 🐋" },
  { q: /eagle|eagles/i, a: "Eagles are powerful birds of prey with excellent eyesight — they can spot prey from 3km away. The Bald Eagle is the national bird of the USA. There are over 60 species worldwide. 🦅" },
  { q: /coral reef|coral/i, a: "Coral reefs cover less than 1% of the ocean floor but support 25% of all marine species. They are often called the 'rainforests of the sea.' Sadly, climate change is causing widespread bleaching. 🪸" },
  { q: /sahara|desert/i, a: "The Sahara Desert is the world's largest hot desert at 9.2 million km². Despite harsh conditions, it hosts over 500 plant species, 70 mammal species, and 90 bird species. 🏜️" },
  { q: /dolphin|dolphins/i, a: "Dolphins are highly intelligent marine mammals. They have their own language, use echolocation to hunt, and have been observed using tools. They're known to play and even surf ocean waves! 🐬" },
  { q: /penguin|penguins/i, a: "Penguins are flightless birds that are extraordinary swimmers. Emperor penguins can dive 500+ meters deep and hold their breath for 20 minutes. They breed in Antarctica's brutal winter. 🐧" },
  { q: /endangered|extinction/i, a: "Thousands of species face extinction due to habitat loss, climate change, poaching, and pollution. Conservation efforts include protected reserves, breeding programs, and international treaties. 🌍" },
  { q: /migration/i, a: "Animal migration is one of nature's most spectacular events. Wildebeest cover 3,000km across Africa, Arctic terns fly 70,000km each year, and monarch butterflies cross North America seasonally. 🦋" },
  { q: /zoo|zoos/i, a: "Modern zoos play a vital role in conservation through breeding programs, research, and education. Many species like the Arabian Oryx and California Condor were saved from extinction through zoo programs. 🦁" },
];

function getWildlifeResponse(message) {
  const lower = message.toLowerCase();
  
  for (const qa of wildlifeQA) {
    if (qa.q.test(lower)) return qa.a;
  }
  
  const isWildlife = WILDLIFE_KEYWORDS.some(k => lower.includes(k));
  
  if (!isWildlife) {
    return "🌿 I'm a wildlife-only assistant! I can only answer questions about animals, nature, habitats, conservation, zoos, and wildlife. Please ask me something about the natural world!";
  }

  if (lower.includes("how many") && lower.includes("species")) {
    return "Scientists have identified approximately 8.7 million species on Earth, but only about 1.2 million have been formally described. New species are discovered every year! 🔬";
  }
  if (lower.includes("largest") || lower.includes("biggest")) {
    return "The blue whale is the largest animal ever known to have existed. The largest land animal is the African elephant. The largest bird is the ostrich. The largest fish is the whale shark! 📏";
  }
  if (lower.includes("fastest")) {
    return "The cheetah is the fastest land animal (120 km/h). The peregrine falcon is the fastest bird in a dive (389 km/h). The sailfish is the fastest fish (110 km/h). 🏃";
  }
  if (lower.includes("smart") || lower.includes("intelligent")) {
    return "The most intelligent animals include great apes (chimps, gorillas, orangutans), elephants, dolphins, octopuses, crows, and parrots. Some can use tools, solve puzzles, and even understand language! 🧠";
  }
  
  return `That's a fascinating wildlife topic! The natural world is full of amazing creatures and ecosystems. From the depths of the ocean to the peaks of the Himalayas, life adapts in remarkable ways. Is there a specific animal or habitat you'd like to learn more about? 🌿`;
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "🦁 Welcome to the Animal X Wildlife Assistant! I can answer questions about animals, habitats, conservation, zoos, and nature. What would you like to know about the animal kingdom?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getWildlifeResponse(text);
    const botMsg = {
      id: Date.now() + 1,
      role: "assistant",
      text: response,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Tell me about lions",
    "What are the largest animals?",
    "How do dolphins communicate?",
    "What is the Sahara Desert?",
    "Tell me about coral reefs",
    "Which animals are endangered?"
  ];

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div className="bot-avatar">🦁</div>
        <div>
          <h2 className="bot-name">Wildlife Assistant</h2>
          <span className="bot-status">🟢 Online — Wildlife topics only</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === "assistant" && <div className="msg-avatar">🌿</div>}
            <div className="msg-bubble">
              <p>{msg.text}</p>
              <span className="msg-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="message assistant">
            <div className="msg-avatar">🌿</div>
            <div className="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {suggestions.map(s => (
          <button key={s} className="suggestion-btn" onClick={() => { setInput(s); }}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about animals, habitats, conservation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
          Send 🌿
        </button>
      </div>
    </div>
  );
}
