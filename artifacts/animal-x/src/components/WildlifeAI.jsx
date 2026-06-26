import { useState, useRef, useEffect, useCallback } from "react";
import animals from "../data/animals";

/* ─── Local Knowledge Base ─────────────────────────────────────────────── */
const KB = [
  // App Navigation
  { p: /^(hi|hello|hey|helo|hii|howdy)/i, a: "👋 Hey there! I'm your Wildlife AI assistant. Ask me anything about animals, the app features, maps, zoos, or conservation! 🦁" },
  { p: /upload.*reel|reel.*upload|post.*video|how.*reel|video.*upload/i, a: "📹 **Upload a Reel:**\n1. Go to 🎬 Reels tab\n2. Tap **➕ Upload**\n3. Choose your wildlife video\n4. Add a caption with animal/nature keywords\n5. Tap Post!\n\n⚠️ Only animal & nature content is allowed. 3 strikes = upload ban." },
  { p: /upload.*post|new post|post.*image|share.*photo/i, a: "📸 **Upload a Post:**\n1. Go to 🎬 Reels → Posts tab\n2. Tap **➕ New Post**\n3. Choose photo or video\n4. Add a wildlife caption\n5. Done! Your post appears in the feed instantly." },
  { p: /story|stories|add story/i, a: "🔴 **Stories** expire after 24 hours automatically.\n1. Go to 🎬 Reels → Stories tab\n2. Tap **➕ Add Story**\n3. Choose a photo or video\n4. It vanishes in 24h!\n\nYou can delete your own story anytime." },
  { p: /follow|following|unfollow/i, a: "👥 **Follow system:**\n• Tap **+ Follow** on any creator's profile or reel\n• Tap again to **Unfollow**\n• Go to 👥 Search to discover 200+ wildlife creators\n• Your following count updates instantly and persists across sessions." },
  { p: /like|heart|double.*tap|tap.*twice/i, a: "❤️ **Liking Reels:**\n• Tap ❤️ on the right sidebar of any reel\n• Double-tap anywhere on the reel for a quick like\n• Like counts sync to Firebase — they persist forever!" },
  { p: /search.*user|find.*user|find.*creator|user.*search/i, a: "🔍 **Find Creators:**\n1. Tap the **👥 icon** in the top navigation\n2. Or go to **/search** page\n3. Search by @username, display name, or country\n4. Results appear in real-time as you type\n5. Tap any card to open their profile → Reels · Followers · Following tabs" },
  { p: /forgot.*password|reset.*password|password.*reset/i, a: "🔑 **Reset Password:**\n1. Go to 🔑 Login page\n2. Tap **Forgot Password?**\n3. Enter your email address\n4. Check your inbox for a reset link\n5. Click the link and set a new password\n\nContact: animalx00003@gmail.com if you need further help." },
  { p: /sign.?up|register|create.*account|new account/i, a: "📝 **Create Account:**\n1. Go to 👤 Profile → Login\n2. Tap **Sign Up**\n3. Enter your name, email & password (6+ chars)\n4. Tap **Create Account**\n\nAll features are free — no premium required!" },
  { p: /login|sign.?in|log.*in/i, a: "🔑 **Login:**\n1. Go to 👤 Profile\n2. Enter email + password\n3. Tap **Login**\n\nForgot password? Tap 'Forgot Password' on the login page." },
  { p: /notification|bell|alerts/i, a: "🔔 **Notifications:**\n• Tap the 🔔 bell icon in the top bar\n• Get notified when someone follows you\n• Unread count shows as a badge\n• Tap 'Mark all as read' to clear\n• Notifications sync in real-time via Firebase." },
  { p: /ad|advertise|advertisement|run.*ad|ad.*wizard/i, a: "📢 **Run an Advertisement:**\n1. Go to ℹ️ Help Desk\n2. Tap **Run Advertisement** button\n3. Step 1: Ad details (title, description, target URL)\n4. Step 2: Target animal categories\n5. Step 3: Choose plan (₹149–₹4,999)\n6. Step 4: Pay via UPI: **nakumamit27-1@okicici**\n\nAds reviewed by admin before going live." },
  { p: /blue.*tick|verified|verification|tick/i, a: "🔵 **Blue Tick Verification:**\n• **Auto:** Reach 100,000 followers — blue tick granted automatically with a congratulations popup!\n• **Manual:** Admin can grant to any user from the moderation panel\n• Blue ticks appear on your profile, reels, and in search results" },
  { p: /profile|edit.*profile|my.*profile/i, a: "👤 **Your Profile:**\n• Go to 👤 Profile in the bottom nav\n• Edit name, bio, country\n• View your posts, reels, followers, following\n• Tap any user's profile to follow them\n• Profile photo can be updated (photo upload feature)" },
  { p: /community.*guideline|rules|guidelines/i, a: "📋 **Community Guidelines:**\n• Only wildlife, nature & animal content\n• No hate speech, violence, or spam\n• No copyrighted music without permission\n• Report violations using the ⋮ menu on any reel/post\n• 3 violations = 30-day upload ban\n• Permanent ban for severe violations\n\nFull guidelines: Help Desk → Community Guidelines tab" },
  { p: /report|report.*reel|report.*user/i, a: "🚩 **Report Content:**\n1. Tap ⋮ (three dots) on any reel or post\n2. Select 'Report'\n3. Choose violation type\n4. Submit — admin reviews within 24h\n\nSerious violations are acted upon immediately." },
  { p: /privacy|privacy.*policy/i, a: "🔒 **Privacy Policy:**\nYour data is stored securely in Firebase. We collect:\n• Email (login only)\n• Content you upload\n• Follow/like data\n\nWe never sell your data. Full policy: Help Desk → Privacy Policy tab" },
  { p: /terms|terms.*condition/i, a: "📄 **Terms & Conditions:**\nYou must be 13+ to use Animal X. Uploading non-wildlife content is a violation. Admin retains the right to remove content. Full terms: Help Desk → Terms & Conditions tab" },
  { p: /contact|support|help.*desk|email.*us/i, a: "📞 **Contact Support:**\n📧 Email: animalx00003@gmail.com\n📸 Instagram: @wild_life_aniaml_fight\n▶️ YouTube: wild_life_aniaml_fight\n👥 Facebook: wild_life_aniaml_fight\n\nOr visit the Help Desk page in the app for FAQ & live support." },
  { p: /map|zoo.*map|live.*track|gps|tracking/i, a: "🗺️ **Map Features:**\n• **Zoo Layer** 🏛️ — 300+ real zoos worldwide with ratings, animal count & Google Maps links\n• **Live Tracking** 🦁 — 50+ GPS-tracked wild animals with status, species & last location\n• **Migration Layer** — seasonal wildlife migration routes\n• **My Location** 📍 — shows your GPS position with a blue animated marker\n• Search by animal name, zoo name, or country\n• Toggle layers on/off independently" },
  { p: /travel|uber|ola|lyft|flight|booking/i, a: "✈️ **Travel Section:**\nDeep links to:\n• 🚗 Ride booking: Uber, Ola, Lyft, Bolt, Grab\n• ✈️ Flights: Skyscanner, Google Flights, Kayak\n• 🛩️ Private: VistaJet\n\nPlan your wildlife safari trip directly from the app!" },
  { p: /admin|super.*admin|broadcast|admin.*mode/i, a: "👑 **Admin System (admin only):**\n• Login as malinotaling8@gmail.com\n• Tap the 🦁 logo 7 times to open the broadcast panel\n• Send messages to all users\n• Manage animal photos, abilities & quizzes\n• Grant/remove blue ticks\n• View content violations & ban users" },
  { p: /chatbot|chat|ai|assistant/i, a: "🤖 I'm the Wildlife AI! I can answer questions about:\n• Any animal in the app (1,213+ species)\n• How to use every feature\n• Wildlife facts & conservation\n• Maps, zoos, tracking\n• Profile, reels, ads\n\nJust ask me anything!" },

  // Wildlife general
  { p: /biggest|largest.*animal|largest.*creature/i, a: "📏 **Record Holders:**\n🐋 Largest ever: Blue Whale (30 m, 200 tons)\n🐘 Largest land: African Elephant (6,000 kg)\n🦒 Tallest: Giraffe (5.8 m)\n🦈 Largest fish: Whale Shark (12 m)\n🦅 Largest wingspan: Wandering Albatross (3.5 m)\n🐦 Largest bird: Ostrich (2.7 m, 156 kg)" },
  { p: /fastest|speed.*animal/i, a: "🏃 **Speed Records:**\n🐆 Fastest land: Cheetah (112 km/h)\n🦅 Fastest dive: Peregrine Falcon (389 km/h)\n🐠 Fastest fish: Sailfish (110 km/h)\n🐬 Fastest marine mammal: Orca (55 km/h)\n🦋 Monarch Butterfly migrates 4,800 km!" },
  { p: /endangered|extinction|conservation|protect/i, a: "🌍 **Conservation Crisis:**\n• 1 million+ species face extinction\n• Main causes: habitat loss, climate change, poaching\n• Key programs: WWF, IUCN Red List, CITES\n• Critically endangered: Amur Leopard, Vaquita, Javan Rhino\n• Success stories: Arabian Oryx, California Condor, Giant Panda" },
  { p: /migration/i, a: "🦋 **Wildlife Migration:**\n• Wildebeest: 3,000 km Serengeti circle\n• Arctic Tern: 70,000 km pole-to-pole\n• Monarch Butterfly: 4,800 km N. America\n• Humpback Whale: 20,000 km tropical/polar\n• Gray Whale: longest mammal migration — 20,000 km\n• Caribou: 5,000 km Arctic migration\n\nSee the Migration layer on the Map page!" },
  { p: /how.*many.*species|species.*count|animals.*earth/i, a: "🔬 **Species on Earth:**\n• Estimated total: 8.7 million species\n• Formally described: ~1.2 million\n• New discoveries: ~18,000/year\n• In Animal X: 1,213+ species & natural wonders\n• Most diverse: Tropical rainforests & coral reefs" },
];

/* Suggested questions shown on open */
const SUGGESTED = [
  "Tell me about Lions",
  "How do I upload a reel?",
  "How does Live Tracking work?",
  "How do I follow users?",
  "What are Community Guidelines?",
  "How does the Blue Tick work?",
  "Where can I find Tigers?",
  "How do ads work?",
  "How do I reset my password?",
  "How do I report a reel?",
];

/* ─── Match query against knowledge base + animal database ─── */
function getAIAnswer(query) {
  const q = query.trim();
  if (!q) return null;

  // 1. Check knowledge base (regex patterns)
  for (const entry of KB) {
    if (entry.p.test(q)) return entry.a;
  }

  // 2. Check if asking about a specific animal
  const qLow = q.toLowerCase();
  const animalMatch = animals.find(a =>
    qLow.includes(a.name.toLowerCase()) ||
    (a.baseName && qLow.includes(a.baseName.toLowerCase()))
  );
  if (animalMatch) {
    const a = animalMatch;
    return `**${a.name}** ${a.category === "Mammals" ? "🦁" : a.category === "Birds" ? "🦅" : a.category === "Aquatic" ? "🐬" : a.category === "Reptiles" ? "🐍" : "🌿"}\n\n` +
      `🏠 **Habitat:** ${a.habitat || "Various"}\n` +
      `🍽️ **Diet:** ${a.diet || "Unknown"}\n` +
      `🌍 **Found in:** ${a.country || "Various regions"}\n` +
      `⏳ **Lifespan:** ${a.lifespan || "Unknown"}\n` +
      `🏷️ **Category:** ${a.category}\n` +
      (a.description ? `\n📝 ${a.description.slice(0, 200)}…` : "") +
      `\n\n🔍 Open the **Animals** page and search for "${a.name}" to see full details, special ability & quiz!`;
  }

  // 3. Keyword fallback
  if (/zoo|zoos/i.test(q)) return "🏛️ **Zoos:** Animal X features 300+ real zoos worldwide on the Map page. Each zoo shows its official name, city, country, rating, and a 'Open in Maps' button for Google Maps navigation!";
  if (/reel/i.test(q)) return "🎬 The **Reels** page has an Instagram-style 9:16 scroll feed with 126+ wildlife reels. You can upload your own wildlife videos, like reels (double-tap!), follow creators, and delete your own reels.";
  if (/map/i.test(q)) return "🗺️ The **Map** page shows 300+ zoos + 50+ live-tracked animals + wildlife migration routes + your live GPS location. Toggle layers, search by name/country, and tap any marker for details!";
  if (/feature|what.*can|what.*do/i.test(q)) return "🐾 **Animal X Features:**\n• 🐾 1,213+ animals with quizzes & special abilities\n• 🎬 Instagram-style wildlife reels\n• 🗺️ 300+ zoo map + live animal tracking\n• 👥 200+ wildlife creators to follow\n• 📸 Posts & 24h Stories\n• ✈️ Safari travel booking\n• 🤖 AI chatbot (that's me!)\n• 🔵 Blue tick verification system\nAll features are **FREE!**";

  return null;
}

/* ─── Render markdown-ish text ─── */
function FormattedMessage({ text }) {
  const lines = text.split("\n");
  return (
    <div className="ai-msg-content">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i} className={line.startsWith("•") || line.startsWith("-") ? "ai-bullet" : ""}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function WildlifeAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "👋 Hi! I'm your **Wildlife AI** 🦁\n\nAsk me about any animal, app features, maps, zoos, or wildlife conservation.\n\nI answer instantly from my local knowledge base — no internet needed for most questions!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");

    const userMsg = { role: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate thinking delay for natural feel
    await new Promise(r => setTimeout(r, q.length > 30 ? 600 : 350));

    const answer = getAIAnswer(q);
    const aiText = answer || `🔍 I couldn't find specific information about "${q.slice(0, 30)}${q.length > 30 ? "…" : ""}".\n\nTry asking about:\n• A specific animal (e.g. "Tell me about Sharks")\n• App features (e.g. "How do I upload a reel?")\n• Wildlife topics (e.g. "What is migration?")\n\n📧 For other help: animalx00003@gmail.com`;

    setMessages(prev => [...prev, { role: "ai", text: aiText }]);
    setTyping(false);
  }, [input]);

  const filtered = messages.filter(m =>
    !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`ai-fab ${open ? "ai-fab-open" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Wildlife AI Assistant"
        aria-label="Open Wildlife AI chat"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="ai-panel" role="dialog" aria-label="Wildlife AI">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-header-left">
              <div className="ai-avatar">🤖</div>
              <div>
                <div className="ai-header-title">Wildlife AI</div>
                <div className="ai-header-sub">🟢 Online · Instant answers</div>
              </div>
            </div>
            <button className="ai-panel-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Search inside chat */}
          {messages.length > 4 && (
            <div className="ai-chat-search">
              <input
                placeholder="🔍 Search conversation…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ai-search-input"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="ai-search-clear">✕</button>}
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {filtered.map((m, i) => (
              <div key={i} className={`ai-msg-wrap ${m.role}`}>
                {m.role === "ai" && <div className="ai-msg-avatar">🤖</div>}
                <div className={`ai-msg-bubble ${m.role}`}>
                  <FormattedMessage text={m.text} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="ai-msg-wrap ai">
                <div className="ai-msg-avatar">🤖</div>
                <div className="ai-msg-bubble ai ai-typing-bubble">
                  <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && (
            <div className="ai-suggestions">
              <div className="ai-suggestions-label">💡 Try asking:</div>
              <div className="ai-suggestions-scroll">
                {SUGGESTED.map((s, i) => (
                  <button key={i} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="ai-input-wrap">
            <input
              ref={inputRef}
              className="ai-input"
              placeholder="Ask about animals or app features…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
