/* ============================================================
   DEMO / FAKE USER SEED DATA
   - 20 original hero creators (du01–du20)
   - 180 procedurally-generated wildlife users (fu001–fu180)
   - Total: 200 users
   - Each fake user: 20 reels → 3600 generated + 26 original = 3626 total
   ============================================================ */

/* ---------- original 20 hero creators ---------- */
export const DEMO_USERS = [
  { id:"du01", username:"wildlion_africa",   name:"Leo Mwangi",       verified:true,  country:"Kenya",       bio:"Chasing sunsets and lions across Maasai Mara 🦁",   avatar:"🦁", followers:248000, following:312, reelCount:156 },
  { id:"du02", username:"ocean_queen_mia",   name:"Mia Nakamura",     verified:true,  country:"Japan",       bio:"Freediver & marine photographer 🌊",                 avatar:"🐬", followers:412000, following:890, reelCount:203 },
  { id:"du03", username:"safari_steve",      name:"Steve Odhiambo",   verified:false, country:"Tanzania",    bio:"Guide at Serengeti NP since 2010 🐘",                avatar:"🐘", followers:87000,  following:421, reelCount:89  },
  { id:"du04", username:"eagle_eye_anya",    name:"Anya Petrov",      verified:true,  country:"Russia",      bio:"Raptor researcher & wildlife cinematographer 🦅",     avatar:"🦅", followers:193000, following:201, reelCount:178 },
  { id:"du05", username:"reptile_realm",     name:"Carlos Mendez",    verified:false, country:"Brazil",      bio:"Herpetologist studying Amazonian reptiles 🐍",        avatar:"🐍", followers:62000,  following:543, reelCount:67  },
  { id:"du06", username:"wolf_tracker_nw",   name:"Nathan Wolf",      verified:true,  country:"Canada",      bio:"Wolf pack researcher in Yellowstone 🐺",              avatar:"🐺", followers:314000, following:278, reelCount:215 },
  { id:"du07", username:"birdwatch_bella",   name:"Isabella Ferraro", verified:false, country:"Italy",       bio:"Birding across 80 countries 🦜",                     avatar:"🦜", followers:58000,  following:1200,reelCount:44  },
  { id:"du08", username:"deep_sea_divers",   name:"Marco Torres",     verified:true,  country:"Philippines", bio:"Coral restoration diver 🪸",                         avatar:"🐠", followers:221000, following:339, reelCount:132 },
  { id:"du09", username:"savanna_stories",   name:"Amara Diallo",     verified:false, country:"Senegal",     bio:"African wildlife storyteller & blogger 🌍",           avatar:"🦒", followers:94000,  following:678, reelCount:71  },
  { id:"du10", username:"polar_explorer_k",  name:"Katja Lund",       verified:true,  country:"Norway",      bio:"Arctic wildlife guide & polar bear researcher ❄️",    avatar:"🐻‍❄️", followers:376000, following:156, reelCount:244 },
  { id:"du11", username:"jungle_nat",        name:"Natalia Cruz",     verified:false, country:"Colombia",    bio:"Amazon jungle guide & tree frog enthusiast 🐸",       avatar:"🐸", followers:41000,  following:820, reelCount:38  },
  { id:"du12", username:"desertdog_ali",     name:"Ali Hassan",       verified:false, country:"UAE",         bio:"Desert fox tracker & dune photographer 🦊",           avatar:"🦊", followers:73000,  following:412, reelCount:56  },
  { id:"du13", username:"sky_ranger_tom",    name:"Tom Eriksen",      verified:true,  country:"Sweden",      bio:"Drone cinematographer capturing wildlife from above 🎥",avatar:"🦆", followers:289000, following:234, reelCount:189 },
  { id:"du14", username:"turtle_tales",      name:"Priya Sharma",     verified:false, country:"India",       bio:"Sea turtle conservationist, Odisha coast 🐢",         avatar:"🐢", followers:112000, following:567, reelCount:83  },
  { id:"du15", username:"forest_whisperer",  name:"Yuki Tanaka",      verified:true,  country:"Japan",       bio:"Red panda & snow leopard photographer 🐆",            avatar:"🐆", followers:521000, following:189, reelCount:312 },
  { id:"du16", username:"reef_ranger_oz",    name:"Olivia Chen",      verified:false, country:"Australia",   bio:"Great Barrier Reef guardian & marine biologist 🪸",   avatar:"🐡", followers:138000, following:740, reelCount:97  },
  { id:"du17", username:"pangolin_patrol",   name:"David Kimani",     verified:true,  country:"Kenya",       bio:"Anti-poaching advocate & pangolin rescuer 🦔",        avatar:"🦔", followers:197000, following:302, reelCount:143 },
  { id:"du18", username:"mountain_monarch",  name:"Ravi Gupta",       verified:false, country:"Nepal",       bio:"Himalayan trekker & snow leopard spotter 🏔️",         avatar:"🏔️", followers:89000,  following:631, reelCount:62  },
  { id:"du19", username:"wildflower_wren",   name:"Sophie Laurent",   verified:true,  country:"France",      bio:"Pollinator & wildflower conservation photographer 🌸",avatar:"🌸", followers:345000, following:421, reelCount:267 },
  { id:"du20", username:"cheetah_chaser",    name:"James Mutua",      verified:false, country:"Kenya",       bio:"Cheetah Coalition field researcher & tracker 🐆",     avatar:"🐆", followers:67000,  following:880, reelCount:51  },
];

/* ---------- procedural generator seeds ---------- */
const _PREFIXES = [
  "wild","safari","nature","jungle","ocean","forest","desert","mountain",
  "polar","reef","savanna","wetland","rainforest","arctic","coastal",
  "nocturnal","aerial","aquatic","highland","grassland",
];
const _ANIMALS = [
  "lion","tiger","elephant","eagle","wolf","dolphin","whale","shark",
  "cheetah","leopard","gorilla","panda","penguin","crocodile","jaguar",
  "manta","orca","falcon","bear","fox","lynx","bison","antelope","flamingo",
];
const _COUNTRIES = [
  "Kenya","Tanzania","South Africa","India","Brazil","Indonesia","Canada",
  "Australia","Norway","Japan","Philippines","Colombia","Nepal","France",
  "Sweden","Thailand","Mexico","New Zealand","Costa Rica","Ethiopia",
  "Zambia","Botswana","Ecuador","Malaysia","Sri Lanka","Uganda","Peru",
  "Madagascar","Namibia","Zimbabwe",
];
const _BIO_TEMPLATES = [
  "Wildlife photographer capturing the untamed 📷",
  "Conservation biologist protecting endangered species 🌿",
  "Safari guide with 10 years in the bush 🌍",
  "Marine biologist studying ocean ecosystems 🌊",
  "Raptor researcher tracking migratory birds 🦅",
  "Herpetologist documenting tropical reptiles 🐍",
  "Big cat conservationist in the savanna 🐆",
  "Deep sea explorer & underwater filmmaker 🤿",
  "National park ranger protecting wild spaces 🏕️",
  "Primatologist studying great apes 🦍",
  "Ornithologist documenting rare bird species 🦜",
  "Whale researcher in remote ocean waters 🐋",
  "Anti-poaching advocate & wildlife defender 🛡️",
  "Nature cinematographer for wildlife docs 🎬",
  "Entomologist discovering insect behavior 🪲",
  "Polar wildlife guide & ice researcher ❄️",
  "Coral reef conservationist & diver 🪸",
  "Desert ecology researcher in arid zones 🏜️",
  "Mountain wildlife tracker & alpinist 🏔️",
  "Freshwater biologist protecting rivers 💧",
];
const _AVATARS = ["🦁","🐯","🐘","🦅","🐺","🐬","🦈","🐆","🦍","🐼","🐧","🐊","🦓","🦒","🐻","🦊","🦜","🐠","🐢","🦔","🪸","🦋","🦩","🐸","🐍"];

function _hash(n, mod) {
  let h = (n * 2654435761) >>> 0;
  return h % mod;
}

/* ---------- generate 180 fake users ---------- */
function _generateFakeUsers() {
  const users = [];
  for (let i = 0; i < 180; i++) {
    const n = i + 1;
    const prefix = _PREFIXES[_hash(n * 3, _PREFIXES.length)];
    const animal = _ANIMALS[_hash(n * 7, _ANIMALS.length)];
    const country = _COUNTRIES[_hash(n * 11, _COUNTRIES.length)];
    const bio = _BIO_TEMPLATES[_hash(n * 13, _BIO_TEMPLATES.length)];
    const avatar = _AVATARS[_hash(n * 5, _AVATARS.length)];
    const followers = 1000 + _hash(n * 17, 95000);
    const isVerified = followers >= 100000;
    users.push({
      id: `fu${String(n).padStart(3, "0")}`,
      username: `${prefix}_${animal}${n}`,
      name: `Wildlife Creator ${n}`,
      verified: isVerified,
      country,
      bio,
      avatar,
      followers,
      following: 50 + _hash(n * 19, 1200),
      reelCount: 20,
    });
  }
  return users;
}

export const FAKE_USERS = _generateFakeUsers();
export const ALL_USERS = [...DEMO_USERS, ...FAKE_USERS];

/* ---------- reel templates for generation ---------- */
const _REEL_POOL = [
  { title:"Lion Pride at Dusk",        cat:"Mammals",        emoji:"🦁", bg:"linear-gradient(135deg,#f59e0b,#b45309)", kw:"lion" },
  { title:"Tiger Hunting at Night",    cat:"Mammals",        emoji:"🐯", bg:"linear-gradient(135deg,#f97316,#9a3412)", kw:"tiger" },
  { title:"Elephant Herd Migration",   cat:"Mammals",        emoji:"🐘", bg:"linear-gradient(135deg,#78716c,#44403c)", kw:"elephant" },
  { title:"Cheetah Sprint 120 km/h",   cat:"Mammals",        emoji:"🐆", bg:"linear-gradient(135deg,#fbbf24,#d97706)", kw:"cheetah" },
  { title:"Gorilla Family Grooming",   cat:"Mammals",        emoji:"🦍", bg:"linear-gradient(135deg,#4ade80,#15803d)", kw:"gorilla" },
  { title:"Wolf Pack Coordination",    cat:"Mammals",        emoji:"🐺", bg:"linear-gradient(135deg,#7c3aed,#4c1d95)", kw:"wolf" },
  { title:"Polar Bear Arctic Hunt",    cat:"Mammals",        emoji:"🐻‍❄️", bg:"linear-gradient(135deg,#bae6fd,#0369a1)", kw:"polar" },
  { title:"Red Panda in Snow",         cat:"Mammals",        emoji:"🐼", bg:"linear-gradient(135deg,#f87171,#b91c1c)", kw:"panda" },
  { title:"Eagle Precision Strike",    cat:"Birds",          emoji:"🦅", bg:"linear-gradient(135deg,#6366f1,#4338ca)", kw:"eagle" },
  { title:"Peregrine Falcon Dive",     cat:"Birds",          emoji:"🦅", bg:"linear-gradient(135deg,#0f172a,#1e3a8a)", kw:"falcon" },
  { title:"Lyrebird Perfect Mimic",    cat:"Birds",          emoji:"🎵", bg:"linear-gradient(135deg,#7dd3fc,#0369a1)", kw:"bird" },
  { title:"Flamingo Colony Dance",     cat:"Birds",          emoji:"🦩", bg:"linear-gradient(135deg,#fda4af,#e11d48)", kw:"flamingo" },
  { title:"Hummingbird 80 Beats/sec",  cat:"Birds",          emoji:"🐦", bg:"linear-gradient(135deg,#a855f7,#6d28d9)", kw:"bird" },
  { title:"Orca Superpod Feeding",     cat:"Aquatic",        emoji:"🐋", bg:"linear-gradient(135deg,#0ea5e9,#1d4ed8)", kw:"orca" },
  { title:"Shark Breach Moment",       cat:"Aquatic",        emoji:"🦈", bg:"linear-gradient(135deg,#0284c7,#075985)", kw:"shark" },
  { title:"Octopus Color Change",      cat:"Aquatic",        emoji:"🐙", bg:"linear-gradient(135deg,#ec4899,#be185d)", kw:"octopus" },
  { title:"Dolphin Pod Acrobatics",    cat:"Aquatic",        emoji:"🐬", bg:"linear-gradient(135deg,#22d3ee,#0891b2)", kw:"dolphin" },
  { title:"Narwhal Arctic Dance",      cat:"Aquatic",        emoji:"🦄", bg:"linear-gradient(135deg,#67e8f9,#0891b2)", kw:"narwhal" },
  { title:"Coral Reef at Sunrise",     cat:"Sea",            emoji:"🪸", bg:"linear-gradient(135deg,#06b6d4,#0284c7)", kw:"reef" },
  { title:"Sea Turtle Nesting Night",  cat:"Sea",            emoji:"🐢", bg:"linear-gradient(135deg,#34d399,#065f46)", kw:"turtle" },
  { title:"Bioluminescent Bay Kayak",  cat:"Sea",            emoji:"🌊", bg:"linear-gradient(135deg,#1e40af,#312e81)", kw:"ocean" },
  { title:"Coral Spawning Event",      cat:"Sea",            emoji:"🪸", bg:"linear-gradient(135deg,#fda4af,#e11d48)", kw:"coral" },
  { title:"Anaconda vs Caiman",        cat:"Reptiles",       emoji:"🐍", bg:"linear-gradient(135deg,#22c55e,#15803d)", kw:"anaconda" },
  { title:"Komodo Dragon Hunt",        cat:"Reptiles",       emoji:"🦎", bg:"linear-gradient(135deg,#84cc16,#4d7c0f)", kw:"komodo" },
  { title:"Crocodile Ambush Strike",   cat:"Reptiles",       emoji:"🐊", bg:"linear-gradient(135deg,#4ade80,#166534)", kw:"crocodile" },
  { title:"Mantis Shrimp Power Punch", cat:"Small Creatures",emoji:"🦐", bg:"linear-gradient(135deg,#f97316,#c2410c)", kw:"shrimp" },
  { title:"Dragonfly Air Ambush",      cat:"Small Creatures",emoji:"🪲", bg:"linear-gradient(135deg,#a78bfa,#5b21b6)", kw:"dragonfly" },
  { title:"Tree Frog Poison Display",  cat:"Small Creatures",emoji:"🐸", bg:"linear-gradient(135deg,#4ade80,#16a34a)", kw:"frog" },
  { title:"Desert Fox Dune Hunt",      cat:"Desert",         emoji:"🦊", bg:"linear-gradient(135deg,#fcd34d,#b45309)", kw:"desert" },
  { title:"Scorpion UV Glow Night",    cat:"Desert",         emoji:"🦂", bg:"linear-gradient(135deg,#4338ca,#1e1b4b)", kw:"scorpion" },
  { title:"Snow Leopard Cliff Run",    cat:"Mountains",      emoji:"🐆", bg:"linear-gradient(135deg,#94a3b8,#334155)", kw:"leopard" },
  { title:"Mountain Goat Cliff Edge",  cat:"Mountains",      emoji:"🐐", bg:"linear-gradient(135deg,#e2e8f0,#475569)", kw:"mountain" },
  { title:"Forest Canopy at Dawn",     cat:"Trees",          emoji:"🌳", bg:"linear-gradient(135deg,#4ade80,#15803d)", kw:"forest" },
  { title:"Rainforest Night Sounds",   cat:"Trees",          emoji:"🌿", bg:"linear-gradient(135deg,#22c55e,#166534)", kw:"rainforest" },
];

const _DESCS = [
  "Rare footage captured at golden hour in the wild.",
  "Witnessed by our team after 3 weeks in the field.",
  "Behaviour never documented before — a world first.",
  "Ultra slow-motion reveals incredible detail.",
  "Drone footage shows the full scale of this event.",
  "Night-vision camera captures the full sequence.",
  "Hidden camera trap reveals secretive behaviour.",
  "Underwater footage from a depth of 40 metres.",
  "Thermal imaging shows body heat in the cold night.",
  "Scientists estimate only 200 individuals remain.",
];

/* ---------- generate 20 reels per user ---------- */
function _generateUserReels(user) {
  const reels = [];
  for (let j = 0; j < 20; j++) {
    const seed = _hash(parseInt(user.id.replace(/\D/g,"")) * 31 + j * 7, 9999);
    const tpl = _REEL_POOL[_hash(seed * 3, _REEL_POOL.length)];
    const desc = _DESCS[_hash(seed * 5, _DESCS.length)];
    const likes = 100 + _hash(seed * 7, 49900);
    const views = likes * (3 + _hash(seed * 11, 7));
    const shares = Math.floor(likes * 0.08);
    reels.push({
      id: `${user.id}_r${j}`,
      type: "default",
      title: `${tpl.title}`,
      emoji: tpl.emoji,
      bg: tpl.bg,
      desc,
      category: tpl.cat,
      userId: user.id,
      username: user.username,
      userVerified: user.verified,
      likes,
      views,
      shares,
    });
  }
  return reels;
}

/** Get all reels for a specific user (for profile pages) */
export function getUserReels(userId) {
  // Check original demo users first
  const origReels = DEMO_REELS.filter(r => r.userId === userId);
  if (origReels.length > 0) return origReels;
  // Then check fake users
  const fu = FAKE_USERS.find(u => u.id === userId || u.username === userId);
  if (fu) return _generateUserReels(fu);
  return [];
}

/** 100 curated feed reels from fake users (rotating selection) for the main feed */
export const FAKE_FEED_REELS = (() => {
  const picks = [];
  for (let i = 0; i < 100; i++) {
    const user = FAKE_USERS[i % FAKE_USERS.length];
    const tpl = _REEL_POOL[_hash(i * 13, _REEL_POOL.length)];
    const desc = _DESCS[_hash(i * 7, _DESCS.length)];
    const likes = 200 + _hash(i * 11, 29800);
    picks.push({
      id: `ff${i}`,
      type: "default",
      title: tpl.title,
      emoji: tpl.emoji,
      bg: tpl.bg,
      desc,
      category: tpl.cat,
      userId: user.id,
      username: user.username,
      userVerified: user.verified,
      likes,
      views: likes * (3 + _hash(i * 3, 7)),
      shares: Math.floor(likes * 0.07),
    });
  }
  return picks;
})();

/* ---------- original 26 rich demo reels ---------- */
const REEL_TEMPLATES = [
  { title:"Pride of Lions at Dusk",        cat:"Mammals",        emoji:"🦁", bg:"linear-gradient(135deg,#f59e0b,#b45309)", desc:"12 lions share a buffalo kill at golden hour. Maasai Mara, Kenya.", userId:"du01", likes:342000, views:1520000,shares:23400 },
  { title:"Orca Superpod Hunt",            cat:"Aquatic",        emoji:"🐋", bg:"linear-gradient(135deg,#0ea5e9,#1d4ed8)", desc:"200+ orcas herd a massive baitball in Norwegian fjords.",           userId:"du02", likes:784000, views:3410000,shares:110200 },
  { title:"Cheetah 0–100 Sprint",          cat:"Mammals",        emoji:"🐆", bg:"linear-gradient(135deg,#fbbf24,#d97706)", desc:"Slow-motion footage of a cheetah accelerating to 112 km/h.",       userId:"du20", likes:1230000,views:8920000,shares:340000 },
  { title:"Eagle Strikes Fish at 80 km/h", cat:"Birds",          emoji:"🦅", bg:"linear-gradient(135deg,#6366f1,#4338ca)", desc:"Bald eagle dives and snatches trout from a river in one pass.",    userId:"du04", likes:561000, views:2870000,shares:78000  },
  { title:"Anaconda vs Caiman",            cat:"Reptiles",       emoji:"🐍", bg:"linear-gradient(135deg,#22c55e,#15803d)", desc:"Green anaconda subdues a 2-metre caiman in the Pantanal.",         userId:"du05", likes:920000, views:5100000,shares:189000 },
  { title:"Wolf Pack Coordinated Hunt",    cat:"Mammals",        emoji:"🐺", bg:"linear-gradient(135deg,#7c3aed,#4c1d95)", desc:"8 wolves use relay tactics to bring down an elk in Yellowstone.",  userId:"du06", likes:810000, views:4200000,shares:125000 },
  { title:"Mantis Shrimp 1500 N Punch",   cat:"Small Creatures",emoji:"🦐", bg:"linear-gradient(135deg,#f97316,#c2410c)", desc:"High-speed camera captures the deadliest punch in the animal kingdom.",userId:"du08",likes:1140000,views:7200000,shares:280000 },
  { title:"Great Barrier Reef Sunrise",    cat:"Sea",            emoji:"🪸", bg:"linear-gradient(135deg,#06b6d4,#0284c7)", desc:"Free dive through a coral garden at first light, GBR, Australia.", userId:"du16", likes:670000, views:3120000,shares:94000  },
  { title:"Polar Bear Ice Drift",          cat:"Mammals",        emoji:"🐻‍❄️", bg:"linear-gradient(135deg,#bae6fd,#0369a1)", desc:"Mother polar bear and cubs drift on Arctic sea ice.",              userId:"du10", likes:1420000,views:9500000,shares:420000 },
  { title:"Hummingbird 80 Beats/Second",  cat:"Birds",          emoji:"🐦", bg:"linear-gradient(135deg,#a855f7,#6d28d9)", desc:"Ultra slow-mo: ruby-throated hummingbird hovers motionless mid-air.",userId:"du07",likes:990000, views:5800000,shares:210000 },
  { title:"Desert Fennec Fox Hunt",        cat:"Desert",         emoji:"🦊", bg:"linear-gradient(135deg,#fcd34d,#b45309)", desc:"Fennec fox uses oversized ears to detect mice underground in Sahara.",userId:"du12",likes:430000, views:1980000,shares:52000  },
  { title:"Snow Leopard Cliffside Run",   cat:"Mountains",      emoji:"🐆", bg:"linear-gradient(135deg,#94a3b8,#334155)", desc:"Rare footage of a snow leopard sprinting on a near-vertical cliff.", userId:"du18", likes:1870000,views:12800000,shares:560000},
  { title:"Octopus Colour Change",         cat:"Aquatic",        emoji:"🐙", bg:"linear-gradient(135deg,#ec4899,#be185d)", desc:"Pacific giant octopus cycles 30 colour patterns in 4 seconds.",     userId:"du02", likes:880000, views:4700000,shares:170000 },
  { title:"Pangolin Armour Defence",       cat:"Mammals",        emoji:"🦔", bg:"linear-gradient(135deg,#84cc16,#4d7c0f)", desc:"Pangolin curls into an impenetrable ball — lion can't open it.",    userId:"du17", likes:720000, views:3800000,shares:110000 },
  { title:"Red Panda Mountain Forest",    cat:"Mammals",        emoji:"🐼", bg:"linear-gradient(135deg,#f87171,#b91c1c)", desc:"Red panda tumbles through bamboo in Sikkim, India at -10 °C.",     userId:"du15", likes:2210000,views:16700000,shares:890000},
  { title:"Amazon Tree Frog Choir",       cat:"Small Creatures",emoji:"🐸", bg:"linear-gradient(135deg,#4ade80,#16a34a)", desc:"Hundreds of poison dart frogs chorus at dusk in Colombian rainforest.",userId:"du11",likes:510000, views:2300000,shares:67000 },
  { title:"Bioluminescent Bay at Night",  cat:"Sea",            emoji:"🌊", bg:"linear-gradient(135deg,#1e40af,#312e81)", desc:"Kayaking through bioluminescent plankton — every paddle stroke glows.", userId:"du08",likes:1680000,views:11200000,shares:620000},
  { title:"Elephant Herd River Crossing", cat:"Mammals",        emoji:"🐘", bg:"linear-gradient(135deg,#78716c,#44403c)", desc:"100+ elephants ford the Mara River guided by the oldest matriarch.", userId:"du03", likes:1340000,views:8700000,shares:380000 },
  { title:"Peregrine Falcon 389 km/h",   cat:"Birds",          emoji:"🦅", bg:"linear-gradient(135deg,#0f172a,#1e3a8a)", desc:"World-record stoop captured by a gyro-stabilised chase drone.",      userId:"du04", likes:2100000,views:14500000,shares:710000},
  { title:"Coral Spawning Night",         cat:"Sea",            emoji:"🪸", bg:"linear-gradient(135deg,#fda4af,#e11d48)", desc:"Annual coral mass-spawning — billions of eggs fill the ocean at once.",userId:"du16",likes:940000, views:5400000,shares:230000 },
  { title:"Lyrebird Sound Machine",       cat:"Birds",          emoji:"🎵", bg:"linear-gradient(135deg,#7dd3fc,#0369a1)", desc:"Lyrebird perfectly mimics a chainsaw, camera, and five other birds.", userId:"du07", likes:3120000,views:21000000,shares:1200000},
  { title:"Dragonfly Aerial Ambush",      cat:"Small Creatures",emoji:"🪲", bg:"linear-gradient(135deg,#a78bfa,#5b21b6)", desc:"95% success rate: dragonfly intercepts fruit flies mid-flight.",     userId:"du11",likes:680000, views:3500000,shares:120000 },
  { title:"Narwhal Arctic Spiral",        cat:"Aquatic",        emoji:"🦄", bg:"linear-gradient(135deg,#67e8f9,#0891b2)", desc:"Pod of narwhals spiral their 2-metre tusks near the ice surface.",   userId:"du10", likes:1110000,views:6800000,shares:290000 },
  { title:"Cheetah & Cubs Play",          cat:"Mammals",        emoji:"🐆", bg:"linear-gradient(135deg,#fde68a,#f59e0b)", desc:"Mother cheetah teaches her 4 cubs stalking technique at Amboseli.", userId:"du20", likes:1760000,views:9800000,shares:440000 },
  { title:"Night Scorpion Glows UV",      cat:"Desert",         emoji:"🦂", bg:"linear-gradient(135deg,#4338ca,#1e1b4b)", desc:"UV torch reveals 200 scorpions invisible to the naked eye in the Negev.", userId:"du12",likes:830000, views:4400000,shares:160000 },
  { title:"Sea Turtle Nesting",           cat:"Sea",            emoji:"🐢", bg:"linear-gradient(135deg,#34d399,#065f46)", desc:"Loggerhead turtle lays 120 eggs under a full moon on Odisha beach.", userId:"du14", likes:1490000,views:9200000,shares:510000 },
];

let _rid = 1;
export const DEMO_REELS = REEL_TEMPLATES.map(r => ({
  ...r,
  id: `dr${_rid++}`,
  type: "default",
  username: DEMO_USERS.find(u => u.id === r.userId)?.username || "wildlifeuser",
  userVerified: DEMO_USERS.find(u => u.id === r.userId)?.verified || false,
  category: r.cat,
}));
