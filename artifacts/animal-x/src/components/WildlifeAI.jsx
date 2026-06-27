import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import animals from "../data/animals";

const APP_VERSION = "v2.5.0";

/* ─── Large Knowledge Base ─────────────────────────────────────────── */
const KB = [
  // Greetings
  { p: /^(hi|hello|hey|helo|hii|howdy|sup|yo)\b/i, a: "👋 Hey there! I'm your **Wildlife AI** 🦁\n\nI can answer questions about any animal, app features, national parks, zoos, conservation, or wildlife science. What would you like to know?" },

  // App version & info
  { p: /version|app.*version|what.*version/i, a: `ℹ️ **Animal X ${APP_VERSION}**\n\nWildlife social media platform with:\n• 1,213+ animals & natural wonders\n• TikTok-style wildlife Reels\n• 300+ zoos on interactive map\n• Live animal GPS tracking\n• 200+ wildlife creators\n• AI chatbot (that's me!)\n\nAll features are **100% FREE** — no premium required!` },
  { p: /about.*app|what is animal x|what.*app/i, a: `🐾 **About Animal X ${APP_VERSION}**\n\nAnimal X is a professional wildlife social media app — like Instagram + TikTok, but 100% focused on wildlife.\n\n• 1,213+ animals with quizzes & abilities\n• Wildlife Reels (TikTok-style)\n• Zoo & wildlife map\n• Creator profiles & community\n• AI chatbot assistance\n\n📧 Contact: wildlifeanimalfight@gmail.com` },

  // Upload Reel
  { p: /upload.*reel|reel.*upload|post.*video|how.*reel|video.*upload/i, a: "📹 **Upload a Wildlife Reel:**\n1. Tap **🎬 Reels** in the bottom nav\n2. Tap **➕ Upload** (top right)\n3. **Step 1:** Enter title, description, hashtags, category\n4. Tap **Next: Upload Video →**\n5. **Step 2:** Select your video (max 200 MB)\n6. Tap **Review →**\n7. **Step 3:** Confirm details → tap **🚀 Post Reel**\n\n🤖 AI moderation checks content — only wildlife is allowed.\n⚠️ 3 violations = 30-day upload ban." },

  // Like / double tap
  { p: /like|heart|double.*tap|tap.*twice/i, a: "❤️ **Liking Reels:**\n• Tap the **❤️** button on the right side of any reel\n• **Double-tap** anywhere on the reel for a quick like (heart burst animation!)\n• Like counts sync instantly to Firebase\n• Tap again to **unlike**" },

  // Follow system
  { p: /follow|following|unfollow/i, a: "👥 **Following Creators:**\n• Tap **+ Follow** on any reel or profile\n• Tap **Following** again to unfollow\n• Visit 🔍 Search to discover 200+ wildlife creators\n• Your following list is saved permanently in Firebase" },

  // Search
  { p: /search.*user|find.*user|find.*creator|user.*search|discover/i, a: "🔍 **Find Creators:**\n1. Tap the **👥 icon** in the top bar\n2. Type @username, display name, or country\n3. Filter by category (Mammals, Birds, Aquatic…)\n4. Sort by most followers or most reels\n5. Tap any profile card to open their full profile" },

  // Map
  { p: /map|zoo.*map|gps|tracking|live.*track/i, a: "🗺️ **Map Features:**\n• **Zoo Layer 🏛️** — 300+ real zoos with ratings & Google Maps links\n• **Live Tracking 🦁** — 50+ GPS-tracked wild animals (lion, elephant, whale…)\n• **Migration Layer 🦋** — seasonal wildlife migration routes\n• **My Location 📍** — animated blue dot for your GPS position\n• Search by animal name, zoo, or country\n• Toggle each layer on/off independently" },

  // Travel
  { p: /travel|uber|ola|lyft|bolt|grab|flight|skyscanner|booking/i, a: "✈️ **Travel Section:**\n🚗 Ride apps: Uber, Ola, Lyft, Bolt, Grab\n✈️ Flights: Skyscanner, Google Flights, Kayak\n🛩️ Private aviation: VistaJet\n\nAll links deep-link to the apps on your device or open in browser." },

  // Notifications
  { p: /notification|bell|alerts|badge/i, a: "🔔 **Notifications:**\n• Tap the 🔔 bell icon in the top bar\n• You get notified when someone follows you\n• Red badge shows unread count\n• Tap 'Mark all read' to clear\n• Powered by Firebase Firestore real-time updates" },

  // Ads
  { p: /ad|advertise|advertisement|run.*ad/i, a: "📢 **Advertise on Animal X:**\n1. Go to ℹ️ Help → tap **Run Advertisement**\n2. Enter ad title, description, target URL\n3. Choose target categories (Mammals, Birds…)\n4. Select plan (₹149 — ₹4,999 / month)\n5. Pay via UPI: **nakumamit27-1@okicici**\n   or PayPal: paypal.me/animalx\n6. Admin reviews & activates your ad within 24h" },

  // Blue tick
  { p: /blue.*tick|verified|verification|checkmark/i, a: "🔵 **Blue Tick Verification:**\n• **Auto:** Reach 100,000 followers — blue tick granted automatically with a congratulations popup!\n• **Manual:** Admin can grant it directly from the admin panel\n• Blue tick appears on profiles, reels, and search results\n• Once granted, it's permanent unless the account violates guidelines" },

  // Profile
  { p: /profile|edit.*profile|my.*profile|account/i, a: "👤 **Your Profile:**\n1. Tap 👤 **Profile** in the bottom nav\n2. View your posts, reels, followers, following\n3. Tap ✏️ **Edit Profile** to change your name or photo\n4. Tap 📷 cover photo area to update your cover image\n5. Upload profile/cover via Object Storage (cloud) or local fallback" },

  // Stories
  { p: /story|stories|24.*hour/i, a: "🔴 **Stories:**\n• Auto-expire after 24 hours\n• Go to 🎬 Reels → Stories tab\n• Tap ➕ Add Story\n• Choose a photo or short video\n• Viewers can see who viewed your story" },

  // Login / signup
  { p: /sign.?up|register|create.*account|new account/i, a: "📝 **Create Account:**\n1. Tap 👤 Profile → **Login / Sign Up**\n2. Enter your display name, email, and password (6+ chars)\n3. Tap **Create Account**\n\n✅ All features are completely free!" },
  { p: /login|sign.?in|log.*in/i, a: "🔑 **Login:**\n1. Tap 👤 Profile\n2. Enter email + password\n3. Tap **Login**\n\nForgot password? Tap **Forgot Password?** on the login screen." },
  { p: /forgot.*password|reset.*password|password.*reset/i, a: "🔑 **Reset Password:**\n1. Go to 👤 Profile → Login\n2. Tap **Forgot Password?**\n3. Enter your email address\n4. Check inbox for the reset link\n\nStill need help? Email: wildlifeanimalfight@gmail.com" },

  // Guidelines / rules
  { p: /community.*guideline|rules|guidelines|policy/i, a: "📋 **Community Guidelines:**\n• ✅ Only wildlife, nature & animal content\n• ❌ No hate speech, violence, or abuse\n• ❌ No spam, misleading info, or copyrighted music\n• ⚠️ 3 violations = 30-day upload ban\n• 🚫 Severe violations = permanent ban\n\nFull Guidelines: tap 🦴 FAB → Community Guidelines" },

  // Privacy
  { p: /privacy|data.*collect|personal.*data/i, a: "🔒 **Privacy Policy:**\nWe collect:\n• Email (for login only)\n• Content you upload\n• Like & follow data\n\nAll data stored securely on Firebase. We never sell your data to third parties.\n\nFull policy: tap 🦴 FAB → Privacy Policy" },

  // Terms
  { p: /terms|terms.*service|terms.*condition/i, a: "📄 **Terms of Service:**\n• Must be 13+ to use Animal X\n• Only wildlife content allowed on platform\n• Admin retains right to remove violating content\n• Account ban possible for repeat violations\n\nFull terms: tap 🦴 FAB → Terms of Service" },

  // Report
  { p: /report|report.*reel|flag.*content|flag.*user/i, a: "🚩 **Report Content:**\n1. Tap ⋮ (three dots) on any reel\n2. Select 'Report'\n3. Choose violation type\n4. Admin reviews within 24h\n\nFor urgent issues: wildlifeanimalfight@gmail.com" },

  // Contact / support
  { p: /contact|support|help.*desk|email.*us/i, a: "📞 **Contact Support:**\n📧 Email: wildlifeanimalfight@gmail.com\n📸 Instagram: @wildlifeanimalfight\n▶️ YouTube: wildlifeanimalfight\n👥 Facebook: wildlifeanimalfight\n\nOr visit ❓ Help in the app for full FAQ." },

  // Admin
  { p: /admin|super.*admin|broadcast|admin.*mode/i, a: "👑 **Admin System:**\n• Login as the super admin email\n• Tap the 🦁 Animal X logo **7 times**\n• Access broadcast panel + testing panel\n• Send messages to all users\n• Grant/remove blue ticks\n• Ban users, add strikes\n• Access testing & emergency restore modes" },

  // Chatbot / AI
  { p: /chatbot|chat|ai.*assistant|wildlife.*ai/i, a: "🦴 I'm the **Wildlife AI** assistant!\n\nI can answer questions about:\n• 1,213+ animals in the app\n• Every app feature\n• Wildlife science & conservation\n• National parks & zoos\n• Travel & safari planning\n\nTap the 🦴 bone button to access me anytime!" },

  // ─── Wildlife Science ───────────────────────────────────────────────
  { p: /biggest|largest.*animal|largest.*creature|biggest.*animal/i, a: "📏 **Size Record Holders:**\n🐋 Largest ever: Blue Whale (30 m, 200 tons)\n🐘 Largest land animal: African Elephant (6,000 kg)\n🦒 Tallest land animal: Giraffe (5.8 m)\n🦈 Largest fish: Whale Shark (12 m)\n🐊 Largest reptile: Saltwater Crocodile (7 m)\n🦅 Largest wingspan: Wandering Albatross (3.5 m)\n🐦 Largest bird: Ostrich (2.7 m, 156 kg)" },
  { p: /fastest|speed.*animal|quickest/i, a: "🏃 **Speed Records:**\n🐆 Fastest land: Cheetah (112 km/h)\n🦅 Fastest dive: Peregrine Falcon (389 km/h!)\n🐟 Fastest fish: Sailfish (110 km/h)\n🐬 Fastest marine mammal: Orca (55 km/h)\n🦘 Fastest sustained: Pronghorn (90 km/h over 6 km)\n🦋 Monarch Butterfly migrates 4,800 km non-stop" },
  { p: /smartest|most.*intelligent|intelligent.*animal/i, a: "🧠 **Most Intelligent Animals:**\n🐒 Chimpanzees — closest DNA to humans (98.7%), use tools\n🐬 Dolphins — signature whistles (names), mirror self-recognition\n🐘 Elephants — mourn dead, remember faces for decades\n🐙 Octopus — can open jars, solve puzzles, change color\n🐦 Crow — makes hooks from wire, plans for the future\n🐷 Pigs — smarter than dogs, learn complex tricks\n🦜 African Grey Parrot — vocabulary of 1,000+ words" },
  { p: /endangered|extinction|conservation|protect/i, a: "🌍 **Wildlife Conservation:**\n• 1 million+ species face extinction risk\n• Main threats: habitat loss, climate change, poaching\n\n**Critically Endangered:**\n🐆 Amur Leopard (<100 wild)\n🐬 Vaquita porpoise (~10 remaining!)\n🦏 Javan Rhino (<80 wild)\n\n**Success stories:**\n✅ Arabian Oryx — brought back from extinction\n✅ California Condor — 27 to 500+\n✅ Giant Panda — upgraded from Endangered to Vulnerable" },
  { p: /migration|migrate|seasonal.*movement/i, a: "🦋 **Wildlife Migration Highlights:**\n🦬 Wildebeest: 3,000 km Serengeti circuit\n🐦 Arctic Tern: 70,000 km pole-to-pole each year!\n🦋 Monarch Butterfly: 4,800 km across North America\n🐋 Humpback Whale: 20,000 km tropical ↔ polar\n🐟 Pacific Salmon: swims upstream to birthplace to spawn\n🦌 Caribou: 5,000 km Arctic migration\n🐝 Monarch butterflies use Earth's magnetic field to navigate\n\nSee migration routes on the Map page!" },
  { p: /how.*many.*species|species.*count|animals.*earth|species.*earth/i, a: "🔬 **Species on Earth:**\n• Estimated total: 8.7 million species\n• Formally described: ~1.2 million\n• New discoveries: ~18,000 species/year\n• Animal X includes: 1,213+ species & natural wonders\n• Most diverse biomes: Tropical rainforests & coral reels" },

  // ─── Specific Animals ───────────────────────────────────────────────
  { p: /lion|lions|pride/i, a: "🦁 **Lion** *(Panthera leo)*\n🏠 African savanna & Gir Forest (India)\n🍽️ Diet: Zebra, wildebeest, buffalo\n⏳ Lifespan: 12–16 years wild\n👥 Live in groups called **prides** (5–20 lions)\n⚡ Roar audible up to **8 km** away\n🎉 The only truly social big cat\n📱 Search 'Lion' in Animals page for full details!" },
  { p: /tiger|tigers/i, a: "🐅 **Tiger** *(Panthera tigris)*\n🏠 Forests of India, Russia, SE Asia\n🍽️ Diet: Deer, wild boar, water buffalo\n⏳ Lifespan: 10–15 years wild\n🔢 Only 4,500 remaining in the wild\n⚡ Can swim 6 km across rivers\n🧬 Each tiger has unique stripe patterns (like fingerprints)\n📱 Search 'Tiger' in Animals page!" },
  { p: /elephant|elephants/i, a: "🐘 **Elephant** *(Elephantidae)*\n🏠 African savanna & Asian forests\n🍽️ Diet: Grass, roots, bark, fruit (200 kg/day!)\n⏳ Lifespan: 60–70 years\n⚡ They mourn their dead and have excellent long-term memory\n💧 Can sense water 12 km underground\n🗣️ Communicate via seismic ground vibrations\n📱 Find elephants in Animals → Mammals!" },
  { p: /cheetah|cheetahs/i, a: "🐆 **Cheetah** *(Acinonyx jubatus)*\n🏠 African savanna & Iran\n🍽️ Diet: Gazelle, impalas\n⏳ Lifespan: 10–12 years wild\n⚡ **Fastest land animal: 112 km/h** in 3 seconds\n😢 Only 7,000 remain — vulnerable to extinction\n🦷 Cannot roar — only purrs and chirps!" },
  { p: /whale|blue whale/i, a: "🐋 **Blue Whale** *(Balaenoptera musculus)*\n🏠 All oceans except Arctic\n🍽️ Diet: Krill (40 million krill/day!)\n⏳ Lifespan: 80–90 years\n⚡ **Largest animal on Earth ever** — heart the size of a car\n🔊 Call louder than a jet engine (188 dB)\n💪 Tongue weighs as much as an elephant!" },
  { p: /dolphin|dolphins/i, a: "🐬 **Dolphin** *(Delphinidae)*\n🏠 Oceans and coastal waters worldwide\n🍽️ Diet: Fish, squid, crustaceans\n⏳ Lifespan: 20–50 years\n⚡ Use **echolocation** to hunt in total darkness\n🗣️ Each dolphin has a unique signature whistle (their name!)\n🪞 One of few animals that pass the mirror self-recognition test" },
  { p: /gorilla|gorillas/i, a: "🦍 **Gorilla** *(Gorilla spp.)*\n🏠 Central African rainforests\n🍽️ Diet: Leaves, fruit, stems (27 kg/day)\n⏳ Lifespan: 35–40 years wild\n🧬 Share 98.3% DNA with humans\n⚡ A silverback can lift 800 kg — 10x their body weight\n📉 Mountain Gorilla: only ~1,000 remaining" },
  { p: /shark|sharks/i, a: "🦈 **Shark** *(Selachimorpha)*\n🏠 All oceans worldwide\n🍽️ Diet: Fish, seals, squid (varies by species)\n⏳ Lifespan: 20–500 years (Greenland Shark!)\n⚡ 450 million years old — older than trees!\n🦷 500+ species, from 20 cm dwarf to 12 m whale shark\n🩸 Can detect 1 drop of blood in 1 million litres of water" },
  { p: /eagle|eagles/i, a: "🦅 **Eagle** *(Accipitridae)*\n🏠 Every continent except Antarctica\n🍽️ Diet: Fish, rabbits, snakes, carrion\n⏳ Lifespan: 20–30 years wild\n⚡ Vision **4–8x sharper than humans** — spots prey from 3 km!\n🏔️ Bald Eagle is the USA's national bird\n🌍 60+ species worldwide including Harpy, Bald, Golden, Philippine" },
  { p: /polar bear|polar bears/i, a: "🐻‍❄️ **Polar Bear** *(Ursus maritimus)*\n🏠 Arctic Circle\n🍽️ Diet: Ringed seals, bearded seals\n⏳ Lifespan: 25–30 years wild\n⚡ Can swim 100 km non-stop in icy water\n🧊 Fur appears white but is actually transparent/hollow\n⚠️ Vulnerable — climate change is melting their habitat\n🐻 Largest land carnivore on Earth" },
  { p: /penguin|penguins/i, a: "🐧 **Penguin** *(Sphenisciformes)*\n🏠 Southern Hemisphere (mainly Antarctica)\n🍽️ Diet: Fish, squid, krill\n⏳ Lifespan: 15–20 years wild\n⚡ Cannot fly but swim at 35 km/h underwater!\n🥶 Emperor penguins breed in -50°C Antarctic winter\n🤿 Dive 500+ m, hold breath for 20 minutes\n🌍 18 species total" },
  { p: /wolf|wolves|pack/i, a: "🐺 **Wolf** *(Canis lupus)*\n🏠 N. America, Europe, Asia\n🍽️ Diet: Elk, deer, bison, rabbits\n⏳ Lifespan: 6–8 years wild\n⚡ Howl can be heard **10 km** away\n👥 Live in packs of 6–10 led by an alpha pair\n🔄 Wolves were reintroduced to Yellowstone in 1995, restoring the entire ecosystem!" },
  { p: /snake|snakes|viper|cobra/i, a: "🐍 **Snakes** *(Serpentes)*\n🏠 Every continent except Antarctica\n🍽️ Diet: Rodents, birds, eggs, insects\n⏳ Lifespan: 10–25 years\n⚡ 3,000+ species — only ~600 are venomous\n🏃 Black Mamba: fastest snake at 20 km/h\n📏 Reticulated Python: longest (7.5 m)\n💉 King Cobra: most venomous land snake (enough to kill an elephant)" },
  { p: /crocodile|alligator|croc/i, a: "🐊 **Crocodile** *(Crocodylidae)*\n🏠 Africa, Asia, Australia, Americas\n🍽️ Diet: Fish, wildebeest, buffalo\n⏳ Lifespan: 70–100 years\n⚡ **Strongest bite force on Earth** — 16,000 N!\n🦕 Largely unchanged for 200 million years\n🏊 Can hold breath for 2 hours underwater" },
  { p: /panda|giant panda/i, a: "🐼 **Giant Panda** *(Ailuropoda melanoleuca)*\n🏠 Mountain forests of central China\n🍽️ Diet: Almost exclusively bamboo (12 kg/day!)\n⏳ Lifespan: 20 years wild\n💪 Conservation success: from 1,000 to 1,800+\n🎋 Must eat 12 hours a day just to get enough nutrition\n⚡ Actually classified as a carnivore despite eating bamboo" },
  { p: /giraffe|giraffes/i, a: "🦒 **Giraffe** *(Giraffa camelopardalis)*\n🏠 African savanna\n🍽️ Diet: Leaves, mainly acacia trees\n⏳ Lifespan: 25 years wild\n⚡ **Tallest animal on Earth** at 5.8 m\n❤️ Heart weighs 11 kg and pumps blood 2 m up their neck\n😴 Only sleep 30 minutes per day (in short naps!)" },
  { p: /octopus|octopi|cephalopod/i, a: "🐙 **Octopus** *(Octopoda)*\n🏠 All oceans, coastal zones\n🍽️ Diet: Crabs, lobsters, fish\n⏳ Lifespan: 1–3 years\n⚡ **3 hearts, blue blood, and 9 brains!**\n🎨 Change colour & texture in 200 milliseconds\n🧠 Can open jars, use tools, and escape aquariums\n🖊️ 8 arms, each with independent neural control" },
  { p: /bee|bees|honey bee/i, a: "🐝 **Honeybee** *(Apis mellifera)*\n🏠 Every continent except Antarctica\n🍽️ Diet: Nectar and pollen\n⏳ Lifespan: 6 weeks (worker)\n⚡ Pollinate **1/3 of all human food crops**\n💃 Communicate via the 'waggle dance' to share flower locations\n🍯 A bee makes 1/12 teaspoon of honey in its lifetime\n👥 A single hive has 60,000 bees!" },
  { p: /butterfly|monarch butterfly/i, a: "🦋 **Monarch Butterfly** *(Danaus plexippus)*\n🏠 North America (migrates to Mexico)\n🍽️ Diet: Milkweed (caterpillar), nectar (adult)\n⏳ Lifespan: 2–6 weeks (or 8 months if migrating)\n⚡ Migrates **4,800 km** from Canada to Mexico!\n👅 Tastes with its feet\n👀 Sees UV light invisible to humans" },
  { p: /coral|coral reef|great barrier reef/i, a: "🪸 **Coral Reefs:**\n• Cover < 1% of the ocean floor\n• Home to 25% of all marine species\n• The **Great Barrier Reef** is the world's largest (2,300 km)\n• Generate \$375 billion in economic value per year\n⚠️ 50% of the world's reels bleached since 1980 due to climate change\n• Each coral polyp builds its skeleton over decades" },

  // ─── National Parks ─────────────────────────────────────────────────
  { p: /yellowstone|yellowstone.*park/i, a: "🏔️ **Yellowstone National Park (USA)**\n📍 Wyoming, Montana & Idaho\n🌋 World's first national park (1872)\n🦬 Home to the largest bison herd in the USA\n⚡ Contains 60% of the world's geysers (Old Faithful!)\n🐺 Wolf reintroduction in 1995 restored entire ecosystem balance\n🦅 Species: bison, wolf, grizzly, elk, bald eagle" },
  { p: /serengeti|serengeti.*park/i, a: "🌍 **Serengeti National Park (Tanzania)**\n📍 Northern Tanzania\n🦬 Annual wildebeest migration: **1.5 million animals**\n🦁 Largest lion population in Africa\n🐆 Cheetah, leopard, elephant, hippo, crocodile all present\n⚡ UNESCO World Heritage Site\n🌅 Best visited June–October for the Great Migration" },
  { p: /amazon|amazon.*rainforest/i, a: "🌿 **Amazon Rainforest:**\n📍 9 South American countries\n⚡ Covers 5.5 million km² — 40% of South America\n🐦 40,000+ plant species, 1,300 bird species, 3,000 fish species\n💧 Produces 20% of Earth's oxygen\n🌧️ Creates its own weather — recycles 50–75 billion tonnes of water daily\n⚠️ 17% deforested — conservation urgent!" },
  { p: /masai mara|maasai mara|kenya.*wildlife/i, a: "🌍 **Maasai Mara (Kenya)**\n📍 Southwest Kenya\n🦁 One of Africa's best big cat reserves\n🦬 Home to 1.5 million wildebeest during Great Migration (Jul–Oct)\n🐆 Highest density of leopards in any reserve\n⚡ Part of the Serengeti–Mara ecosystem\n🎟️ Best time to visit: July to October" },
  { p: /galapagos|galapagos island/i, a: "🦎 **Galápagos Islands (Ecuador)**\n📍 Pacific Ocean, 1,000 km from Ecuador\n🐢 Giant tortoises live 150+ years\n🦎 Marine iguanas — the only sea-going lizards\n🐦 Blue-footed boobies, Darwin's finches\n⚡ Where Darwin developed the theory of evolution\n🌊 UNESCO World Heritage Site\n🦈 One of the best shark diving destinations" },

  // ─── General Fallbacks ──────────────────────────────────────────────
  { p: /national park|parks|wildlife.*reserve/i, a: "🏞️ **Top Wildlife Destinations:**\n🌍 Serengeti, Tanzania — Great Migration\n🏔️ Yellowstone, USA — wolves & geysers\n🌿 Amazon Rainforest, Brazil — 40,000+ plant species\n🦁 Kruger Park, South Africa — Big Five\n🦎 Galápagos, Ecuador — evolution in action\n🐯 Ranthambore, India — Bengal tigers\n🌊 Palau, Pacific — shark sanctuary\n\nSee 300+ real zoos on the 🗺️ Map page!" },
  { p: /zoo|zoos/i, a: "🏛️ **Zoos on Animal X:**\nThe Map page shows **300+ real zoos** worldwide:\n• Official name, city, country\n• Rating & visitor info\n• 'Open in Maps' → Google Maps navigation\n• Filter by country or search by name\n\nTop global zoos: San Diego, Singapore, Chester, Taronga, Berlin, Prague" },
  { p: /reel|reels/i, a: "🎬 **Wildlife Reels:**\n• TikTok-style full-screen snap scroll\n• 1,000+ wildlife reels from 200+ creators\n• Double-tap anywhere to like ❤️\n• Right sidebar: like, comment, share, save\n• Filter by animal category\n• Upload your own wildlife video!" },
  { p: /feature|what.*can|what.*do|capabilities/i, a: `🐾 **Animal X ${APP_VERSION} — All Features:**\n• 🐾 1,213+ animals with quizzes & special abilities\n• 🎬 TikTok-style wildlife Reels\n• 🗺️ 300+ zoo map + live animal tracking\n• 🦋 Wildlife migration routes overlay\n• 👥 200+ creators to follow & connect with\n• 📸 Posts & 24-hour Stories\n• ✈️ Safari travel booking deep-links\n• 🦴 AI chatbot (that's me!)\n• 🔵 Blue tick verification\n• 🔍 Advanced creator search\n\nAll **100% FREE** — forever!` },
];

/* Suggested questions shown initially */
const SUGGESTED = [
  "Tell me about Lions 🦁",
  "How do I upload a reel?",
  "What's the fastest animal?",
  "How does Live Tracking work?",
  "Tell me about Polar Bears",
  "What is the Great Migration?",
  "How do I get a Blue Tick? 🔵",
  "Tell me about the Galapagos",
  "How do ads work?",
  "How do I follow users?",
  "Tell me about Dolphins 🐬",
  "What is Yellowstone Park?",
];

const MENU_ITEMS = [
  { icon: "🦁", label: "Wildlife AI Chat", key: "ai" },
  { icon: "❓", label: "Help & Support", key: "help", href: "/help" },
  { icon: "🔒", label: "Privacy Policy", key: "privacy", href: "/privacy" },
  { icon: "📄", label: "Terms of Service", key: "terms", href: "/terms" },
  { icon: "📋", label: "Community Guidelines", key: "guidelines", href: "/guidelines" },
  { icon: "📞", label: "Contact Us", key: "contact", href: "mailto:wildlifeanimalfight@gmail.com" },
  { icon: "ℹ️", label: `About App (${APP_VERSION})`, key: "about" },
  { icon: "🚩", label: "Report a Problem", key: "report", href: "mailto:wildlifeanimalfight@gmail.com?subject=Bug+Report+Animal+X" },
];

function getAIAnswer(query) {
  const q = query.trim();
  if (!q) return null;

  for (const entry of KB) {
    if (entry.p.test(q)) return entry.a;
  }

  const qLow = q.toLowerCase();
  const animalMatch = animals.find(a =>
    qLow.includes(a.name.toLowerCase()) ||
    (a.baseName && qLow.includes(a.baseName.toLowerCase()))
  );
  if (animalMatch) {
    const a = animalMatch;
    const catEmoji = { Mammals: "🦁", Birds: "🦅", Aquatic: "🐬", Reptiles: "🐍", "Small Creatures": "🦋", Trees: "🌳", Mountains: "⛰️", Sea: "🌊", Desert: "🏜️" }[a.category] || "🐾";
    return `**${a.name}** ${catEmoji}\n\n🏠 **Habitat:** ${a.habitat || "Various"}\n🍽️ **Diet:** ${a.diet || "Unknown"}\n🌍 **Found in:** ${a.country || "Various regions"}\n⏳ **Lifespan:** ${a.lifespan || "Unknown"}\n🏷️ **Category:** ${a.category}\n${a.description ? `\n📝 ${a.description.slice(0, 200)}…` : ""}\n\n🔍 Search for **"${a.name}"** in the Animals page to see its full profile, special ability card, and quiz!`;
  }

  if (/zoo|zoos/i.test(q)) return "🏛️ The **Map** page shows 300+ real zoos worldwide with names, ratings, and Google Maps links!";
  if (/reel/i.test(q)) return "🎬 The **Reels** page is a TikTok-style snap-scroll feed. Upload your own wildlife video with the ➕ button!";
  if (/map/i.test(q)) return "🗺️ The **Map** page shows 300+ zoos + 50+ live-tracked animals + migration routes. Toggle layers and search by name!";

  return null;
}

function FormattedMessage({ text }) {
  const lines = text.split("\n");
  return (
    <div className="wai-msg-content">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="wai-msg-spacer" />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const isListItem = line.startsWith("•") || line.startsWith("-") || /^[✅❌⚠️🚫🔵🟢🔴]/.test(line);
        return (
          <div key={i} className={`wai-line ${isListItem ? "wai-list-item" : ""}`}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          </div>
        );
      })}
    </div>
  );
}

export default function WildlifeAI() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState("closed"); // "closed" | "menu" | "chat"
  const [messages, setMessages] = useState([
    { role: "ai", text: `👋 Welcome to **Wildlife AI** 🦁\n\nI'm your intelligent wildlife assistant — powered by a huge local knowledge base covering 1,213+ animals, national parks, zoos, conservation, and all app features.\n\nWhat would you like to know?` }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "chat") {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [mode, messages]);

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, q.length > 40 ? 700 : 400));
    const answer = getAIAnswer(q);
    const aiText = answer || `🔍 I couldn't find specific info about **"${q.slice(0, 40)}${q.length > 40 ? "…" : ""}"**.\n\nTry asking:\n• A specific animal ("Tell me about Sharks")\n• An app feature ("How do I upload a reel?")\n• Wildlife facts ("What is migration?")\n• National parks ("Tell me about Yellowstone")\n\n📧 For other help: wildlifeanimalfight@gmail.com`;
    setMessages(prev => [...prev, { role: "ai", text: aiText }]);
    setTyping(false);
  }, [input]);

  function handleMenuAction(item) {
    if (item.key === "ai") {
      setMode("chat");
    } else if (item.key === "about") {
      sendMessage("about app");
      setMode("chat");
    } else if (item.href?.startsWith("mailto:")) {
      window.open(item.href, "_blank");
      setMode("closed");
    } else if (item.href) {
      navigate(item.href);
      setMode("closed");
    }
  }

  const filtered = messages.filter(m =>
    !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop overlay when menu open */}
      {mode === "menu" && (
        <div className="wai-menu-backdrop" onClick={() => setMode("closed")} />
      )}

      {/* FAB Button */}
      {mode !== "chat" && (
        <button
          className={`wai-fab ${mode === "menu" ? "wai-fab-active" : ""}`}
          onClick={() => setMode(m => m === "menu" ? "closed" : "menu")}
          title="Wildlife AI & Quick Access"
          aria-label="Open Wildlife AI menu"
        >
          {mode === "menu" ? <span className="wai-fab-close">✕</span> : <span className="wai-fab-bone">🦴</span>}
        </button>
      )}

      {/* Animated Menu */}
      {mode === "menu" && (
        <div className="wai-menu">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.key}
              className="wai-menu-item"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => handleMenuAction(item)}
            >
              <span className="wai-menu-icon">{item.icon}</span>
              <span className="wai-menu-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Panel */}
      {mode === "chat" && (
        <div className="wai-panel" role="dialog" aria-label="Wildlife AI Chat">
          {/* Header */}
          <div className="wai-panel-header">
            <button className="wai-back-btn" onClick={() => setMode("menu")} title="Back to menu">←</button>
            <div className="wai-header-info">
              <div className="wai-header-avatar">🦴</div>
              <div>
                <div className="wai-header-title">Wildlife AI</div>
                <div className="wai-header-sub">🟢 Online · Instant answers</div>
              </div>
            </div>
            <button className="wai-close-btn" onClick={() => setMode("closed")} aria-label="Close">✕</button>
          </div>

          {/* Search in conversation */}
          {messages.length > 5 && (
            <div className="wai-chat-search">
              <span>🔍</span>
              <input
                placeholder="Search conversation…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="wai-search-input"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="wai-search-clear">✕</button>}
            </div>
          )}

          {/* Messages */}
          <div className="wai-messages">
            {filtered.map((m, i) => (
              <div key={i} className={`wai-msg-row ${m.role}`}>
                {m.role === "ai" && (
                  <div className="wai-msg-avatar-sm">🦴</div>
                )}
                <div className={`wai-bubble ${m.role}`}>
                  <FormattedMessage text={m.text} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="wai-msg-row ai">
                <div className="wai-msg-avatar-sm">🦴</div>
                <div className="wai-bubble ai wai-typing">
                  <span className="wai-dot" /><span className="wai-dot" /><span className="wai-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && !typing && (
            <div className="wai-suggestions">
              <div className="wai-suggestions-label">💡 Try asking:</div>
              <div className="wai-suggestions-scroll">
                {SUGGESTED.map((s, i) => (
                  <button key={i} className="wai-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input row */}
          <div className="wai-input-row">
            <input
              ref={inputRef}
              className="wai-input"
              placeholder="Ask about animals, app features, conservation…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
            />
            <button
              className="wai-send-btn"
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
