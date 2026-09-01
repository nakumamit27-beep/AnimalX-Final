import { useState, useRef, useEffect } from "react";

const WILDLIFE_KEYWORDS = [
  "animal","wildlife","bird","fish","mammal","reptile","insect","plant","tree","nature",
  "habitat","forest","ocean","desert","mountain","jungle","savanna","ecosystem","species",
  "lion","tiger","elephant","wolf","bear","shark","eagle","dolphin","whale","crocodile",
  "snake","lizard","parrot","owl","penguin","butterfly","bee","ant","frog","coral",
  "zoo","safari","migration","extinction","endangered","conservation","predator","prey",
  "carnivore","herbivore","omnivore","food chain","biodiversity","climate","environment"
];

// Big animal knowledge base
const wildlifeQA = [
  { q: /lion|lions/i, a: "🦁 Lions are apex predators of the African savanna. They live in groups called prides (5–15 lions), and males have iconic manes. Diet: zebra, wildebeest, buffalo. Lifespan: 12–16 years wild." },
  { q: /tiger|tigers/i, a: "🐅 Tigers are the largest cats — Bengal and Siberian are the biggest. Solitary hunters, excellent swimmers, and can weigh up to 300 kg. Found in India, Russia, Indonesia, and parts of SE Asia." },
  { q: /elephant|elephants/i, a: "🐘 Elephants are the largest land animals. African elephants (bigger ears) and Asian elephants. They live 60–70 years, mourn their dead, and have remarkable memories." },
  { q: /shark|sharks/i, a: "🦈 Sharks are 450-million-year-old ocean predators. There are 500+ species, from the tiny dwarf lantern shark (20 cm) to the whale shark (12 m)." },
  { q: /whale|whales/i, a: "🐋 Whales are the largest animals on Earth. Blue whales reach 30 m and 200 tons. Their songs travel thousands of miles underwater." },
  { q: /eagle|eagles/i, a: "🦅 Eagles have eyesight 4–8x sharper than humans — they spot prey from 3 km away. Bald Eagle is the USA's national bird. 60+ species worldwide." },
  { q: /coral|reef/i, a: "🪸 Coral reefs cover < 1% of the ocean but support 25% of marine species. Climate change is bleaching them — protect them by reducing carbon footprint." },
  { q: /sahara|desert/i, a: "🏜️ The Sahara is the world's largest hot desert at 9.2 million km². Despite the heat it hosts 500+ plant species, 70 mammal species, and 90 bird species." },
  { q: /dolphin|dolphins/i, a: "🐬 Dolphins are highly intelligent — they use names (signature whistles), echolocation, and tools. Bottlenose dolphins can solve mirror self-recognition." },
  { q: /penguin|penguins/i, a: "🐧 Penguins are flightless but extraordinary swimmers. Emperor penguins dive 500+ m, hold breath 20 min, and breed in -50°C Antarctic winters." },
  { q: /endangered|extinction/i, a: "🌍 1 million+ species face extinction due to habitat loss, climate change, and poaching. Conservation efforts: protected reserves, breeding programs, and CITES treaty." },
  { q: /migration/i, a: "🦋 Wildebeest cover 3,000 km across Africa. Arctic terns fly 70,000 km/year. Monarch butterflies cross North America. Gray whales migrate 20,000 km." },
  { q: /zoo|zoos/i, a: "🏛️ Modern zoos save species through breeding programs (Arabian Oryx, California Condor were saved this way). Top zoos: San Diego, Singapore, Chester. Open the Map page to see 200+." },
  { q: /panda|pandas/i, a: "🐼 Giant pandas eat 12 kg of bamboo daily and live in China's mountain forests. Population recovered from 1,000 to ~1,800 thanks to conservation." },
  { q: /wolf|wolves/i, a: "🐺 Wolves live in packs of 6–10 led by an alpha pair. They communicate by howls heard 10 km away. Found across N. America, Europe, and Asia." },
  { q: /snake|snakes/i, a: "🐍 3,000+ snake species. Only ~600 are venomous. Fastest: Black Mamba (20 km/h). Largest: Reticulated Python (7 m). All snakes are carnivores." },
  { q: /crocodile|alligator/i, a: "🐊 Crocodiles haven't changed much in 200 million years. Saltwater crocs are the largest reptile (7 m, 1,000 kg). Their bite is the strongest in the animal kingdom." },
  { q: /bee|bees/i, a: "🐝 Bees pollinate 1/3 of all crops. A single hive holds 60,000 bees. They communicate via the 'waggle dance' to share flower locations." },
  { q: /butterfly|butterflies/i, a: "🦋 17,500 butterfly species. Monarchs migrate 4,800 km. They taste with their feet and have compound eyes. Caterpillars can eat 27,000x their body weight." },
  { q: /bear|bears/i, a: "🐻 8 bear species. Polar bears (largest) weigh 700 kg and swim 100 km. Grizzlies, black bears, sun bears, sloth bears — all omnivores except polar bears." },
  { q: /how many|species/i, a: "🔬 Scientists estimate 8.7 million species exist on Earth. Only ~1.2 million are formally described. New ones are discovered every year — many in deep ocean and rainforest." },
  { q: /largest|biggest/i, a: "📏 Largest ever: blue whale (30 m). Largest land animal: African elephant (6,000 kg). Largest bird: ostrich (2.7 m). Largest fish: whale shark (12 m)." },
  { q: /fastest/i, a: "🏃 Cheetah: 120 km/h (land). Peregrine falcon: 389 km/h (dive). Sailfish: 110 km/h (sea). Pronghorn: 90 km/h sustained over 6 km." },
  { q: /smart|intelligent/i, a: "🧠 Most intelligent: chimps, dolphins, elephants, octopuses, crows, pigs, parrots. Some use tools, solve puzzles, recognize themselves in mirrors." },
];

// Common animal name typo/spelling correction map
const TYPO_MAP = {
  lion: ["lin","lione","loin","lionn","lyon"],
  tiger: ["tigr","tigar","tiiger","tyger","teiger"],
  elephant: ["elefant","elephent","elphant","elephnt"],
  cheetah: ["cheeta","cheta","chetah","cheatah"],
  giraffe: ["girafe","giraff","gerafe","jiraffe"],
  crocodile: ["crocodil","corcodile","crocodial"],
  rhinoceros: ["rhino","rinocerous","rhinocerus"],
  shark: ["shak","sharc","sharkk"],
  dolphin: ["dolfin","dolphn","dolfine"],
  octopus: ["octapus","octopuss","octopas"],
  butterfly: ["buterfly","butterflai","buterfli"],
  panda: ["pandda","pandaa","banda"],
  penguin: ["pengin","penquin","pinguin","penguine"],
  kangaroo: ["kangroo","kangaru","kanguroo"],
  hippopotamus: ["hipo","hippoptamus","hippopotomus"],
  python: ["piton","pythn","phyton"],
  cobra: ["kobra","cobraa"],
  parrot: ["parot","parott","parrots"],
  flamingo: ["flamengo","flemingo","flamigo"],
  anaconda: ["anaconda","annaconda","anakonda"],
};

const REVERSE_TYPO = (() => {
  const m = {};
  for (const correct in TYPO_MAP) {
    for (const typo of TYPO_MAP[correct]) m[typo] = correct;
  }
  return m;
})();

function autoCorrect(message) {
  const words = message.toLowerCase().split(/\s+/);
  const corrections = [];
  const corrected = words.map((w) => {
    const stripped = w.replace(/[^a-z]/g, "");
    if (REVERSE_TYPO[stripped]) {
      corrections.push({ from: stripped, to: REVERSE_TYPO[stripped] });
      return REVERSE_TYPO[stripped];
    }
    return w;
  }).join(" ");
  return { corrected, corrections };
}

// App-guide knowledge
const appGuideQA = [
  { q: /(how|where).*(map|zoo)/i, a: "🗺️ The Map page shows 200+ zoos worldwide. Tap the 🗺️ button at the top, search by name or country, then tap any marker to open it in Google Maps." },
  { q: /(how|where).*(track|tracking|live)/i, a: "📍 Live Tracking is at the top bar (📍 icon). It shows 50 animals across the globe with their daily travel distance — updated every day." },
  { q: /(how|where).*(reel|reels|story|stories|post)/i, a: "🎬 Tap Reels in the bottom nav. Three tabs: Reels (vertical videos), Posts (image/video feed), Stories (24-hour). Tap ➕ to upload — instant, no approval needed." },
  { q: /(how|where).*(travel|book|uber|ola|flight)/i, a: "✈️ Travel page (bottom nav). Tap Book on Uber/Ola/Skyscanner — opens the actual app on your phone, or the website if not installed." },
  { q: /(how|where).*(profile|verify|verified|blue tick)/i, a: "👤 Tap Profile in the bottom nav. Hit 100K followers and you auto-get the 🔵 blue tick. Super admin can manually verify any user from the admin panel." },
  { q: /(how|where).*(follow|creator)/i, a: "👥 Tap any creator's name in Reels or Posts to open their profile, then tap Follow. Their posts and reels show in their grid." },
  { q: /(how|where).*(animal|category|categories)/i, a: "🐾 Tap Animals in the bottom nav. Filter by 10 categories (Mammals, Reptiles, Birds, Aquatic, Small Creatures, Nature, Mountains, Sea, Desert, Trees) or search by name." },
  { q: /(how|where).*(chat|chatbot|ai)/i, a: "🤖 You're already here! Type any wildlife question or tap a chip below for instant suggestions. I auto-correct misspelled animal names." },
];

function getResponse(message) {
  const { corrected, corrections } = autoCorrect(message);
  const lower = corrected.toLowerCase();

  // App guide first
  for (const qa of appGuideQA) {
    if (qa.q.test(lower)) {
      const prefix = corrections.length
        ? `Did you mean **${corrections[0].to}**? Here's what I found:\n\n`
        : "";
      return prefix + qa.a;
    }
  }

  for (const qa of wildlifeQA) {
    if (qa.q.test(lower)) {
      const prefix = corrections.length
        ? `Did you mean **${corrections[0].to}**? Here's what I found:\n\n`
        : "";
      return prefix + qa.a;
    }
  }

  const isWildlife = WILDLIFE_KEYWORDS.some((k) => lower.includes(k));
  if (!isWildlife) {
    return "🌿 I'm a wildlife specialist! Ask me about any animal, habitat, conservation topic, or how to use the app. Try a chip below!";
  }

  return "🌿 That's a great wildlife topic! Try asking more specifically about an animal, habitat, or conservation question. I know 1000+ animal facts and how every page in this app works.";
}

const QUICK_CHIPS = [
  "Tell me about Lions",
  "Top 5 facts about Sharks",
  "How to book a Safari?",
  "What is Live Tracking?",
  "How to upload a Reel?",
  "Which animals are endangered?",
  "Fastest animals on Earth",
  "How does the Map page work?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "🦁 Hi! I'm your Wildlife Assistant. Ask me about any animal, habitat, conservation, or how the app works. Tap a chip below to get started!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendText(text) {
    if (!text || !text.trim()) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const response = getResponse(text);
    const botMsg = {
      id: Date.now() + 1,
      role: "assistant",
      text: response,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText(input);
    }
  }

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div className="bot-avatar">🦁</div>
        <div>
          <h2 className="bot-name">Wildlife Assistant</h2>
          <span className="bot-status">🟢 Online · Smart wildlife AI</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.role === "assistant" && <div className="msg-avatar">🌿</div>}
            <div className="msg-bubble">
              <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
              <span className="msg-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="message assistant">
            <div className="msg-avatar">🌿</div>
            <div className="msg-bubble typing-bubble">
              <span className="typing-text">AI is thinking</span>
              <span className="typing-dots"><span></span><span></span><span></span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {QUICK_CHIPS.map((s) => (
          <button key={s} className="suggestion-btn" onClick={() => sendText(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about animals, habitats, or the app..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="send-btn" onClick={() => sendText(input)} disabled={!input.trim()}>
          Send 🌿
        </button>
      </div>
    </div>
  );
}
