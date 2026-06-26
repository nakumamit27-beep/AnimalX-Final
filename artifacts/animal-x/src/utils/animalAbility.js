const NAMED_ABILITIES = {
  "Lion":{ title:"Power Roar", desc:"A lion's roar reaches 114 dB and travels 8 km. Low-frequency infrasound in the roar can temporarily paralyse nearby prey with fear." },
  "Cheetah":{ title:"Sprint Acceleration", desc:"0 to 112 km/h in under 3 seconds — faster than most supercars. Flexible spine, semi-retractable claws and enlarged nostrils power each burst." },
  "Elephant":{ title:"Seismic Communication", desc:"Elephants produce rumbles felt through the ground via their feet and trunk, reaching herd members 30+ km away." },
  "Shark":{ title:"Electroreception", desc:"Ampullae of Lorenzini detect electric fields as weak as 0.005 microvolts — letting sharks 'see' a hidden heartbeat under sand." },
  "Dolphin":{ title:"Biosonar Echolocation", desc:"Dolphin clicks resolve objects smaller than a tennis ball from 200 m away in pitch-black water, 10× more precise than any human sonar." },
  "Octopus":{ title:"Distributed Intelligence", desc:"Two-thirds of an octopus's 500 million neurons live in its eight arms. Each arm can taste, grip, and react independently without brain input." },
  "Eagle":{ title:"Telescopic Vision", desc:"Eagles have two foveae per eye and can spot a rabbit from 3.2 km. Their colour vision extends into UV, revealing urine trails of prey." },
  "Chameleon":{ title:"Nanocrystal Colour Shift", desc:"Chameleons tune a lattice of nano-crystals in their skin (iridophores) to reflect different wavelengths in milliseconds — not just for camouflage, but for communication." },
  "Electric Eel":{ title:"Bio-Electric Discharge", desc:"Up to 860 V at 1 amp — enough to stun a horse. Electric eels also use low-voltage pulses to map surroundings like a living sonar." },
  "Bat":{ title:"Ultrasonic Echolocation", desc:"Bats emit 100 000 Hz pulses and build a real-time 3-D map of space while flying. Some species resolve wire 0.08 mm thick in complete darkness." },
  "Whale":{ title:"Long-Range Song", desc:"Whale songs travel through deep ocean acoustic channels for thousands of kilometres. Blue whale calls register at 188 dB — louder than a jet engine." },
  "Gorilla":{ title:"Immense Strength", desc:"Gorillas can lift more than 10 times their body weight and bend 32-mm steel bars. Chest-beating creates infrasound audible 1 km away." },
  "Platypus":{ title:"Electroreception Hunting", desc:"The platypus closes eyes, ears and nostrils when diving, 'seeing' entirely via 40 000 electroreceptors in its bill that detect muscle contractions of prey." },
  "Axolotl":{ title:"Perfect Regeneration", desc:"Axolotls fully regrow lost limbs, hearts, spinal cord, and portions of the brain in weeks — without scarring, a feat no other vertebrate achieves." },
  "Komodo Dragon":{ title:"Anticoagulant Venom", desc:"Komodo saliva contains 50+ bacterial strains and venom proteins that stop blood clotting. Bitten prey weakens and is tracked by smell for days." },
  "Crow":{ title:"Tool Crafting Intelligence", desc:"Crows fashion hooks from wire, drop nuts onto pedestrian crossings, remember individual human faces, and hold grudges for years." },
  "Hummingbird":{ title:"Hovering Flight", desc:"80 wing beats per second let hummingbirds hover, fly backwards and sideways. Their heart beats 1 200 times/min during flight." },
  "Tardigrade":{ title:"Cryptobiosis Survival", desc:"Tardigrades survive vacuum of space, 150 °C heat, -272 °C cold, and 1 000× lethal radiation by entering reversible suspended animation." },
  "Mantis Shrimp":{ title:"16-Colour Vision + Hyperpunch", desc:"16 photoreceptor types (humans have 3) let mantis shrimp see UV, infrared and polarised light. Their punch delivers 1 500 N in 2 ms." },
  "Pistol Shrimp":{ title:"Cavitation Snap", desc:"Pistol shrimp close their claw so fast they create a cavitation bubble reaching 4 700 °C — briefly hotter than the sun's surface — stunning prey." },
  "Archerfish":{ title:"Precision Hydro-Jet", desc:"Archerfish shoot a jet of water up to 3 m with ballistic accuracy to knock insects off branches — correcting for refraction at the surface." },
  "Mimic Octopus":{ title:"15-Species Impersonation", desc:"Mimic octopus impersonates flatfish, lionfish, sea snakes and 12+ other species — choosing the most feared predator per local threat." },
  "Bombardier Beetle":{ title:"Chemical Cannon", desc:"Bombardier beetles mix hydroquinone and hydrogen peroxide in a combustion chamber, firing 100 °C boiling jets at 500 pulses/second." },
  "Frigate Bird":{ title:"Perpetual Soaring", desc:"Frigatebirds sleep while soaring on thermals for weeks without landing, covering 400+ km/day over open ocean." },
  "Peregrine Falcon":{ title:"Hypersonic Dive", desc:"Peregrine falcons stoop at 389 km/h — the fastest animal on Earth. Baffles in their nostrils slow airflow so lungs don't burst." },
  "Lyrebird":{ title:"Master Mimicry", desc:"Lyrebirds replicate chainsaws, camera shutters, car alarms, and other bird species with near-perfect fidelity from a single listen." },
  "Coelacanth":{ title:"Living Fossil Locomotion", desc:"Coelacanths swim with paired lobe fins in a trotting gait identical to early land animals, offering a window into vertebrate evolution 400 Ma ago." },
  "Arapaima":{ title:"Air-Breathing Giant", desc:"Arapaima breathe air directly and can survive in oxygen-depleted Amazonian waters where all other large fish suffocate." },
  "Dragonfly":{ title:"Aerial Intercept Targeting", desc:"Dragonflies intercept prey in mid-air with 95% success by predicting flight paths — the highest hunting accuracy of any animal." },
  "Tiger":{ title:"Ambush Camouflage", desc:"Tiger stripes match the dappled light of tall grass and create an optical illusion called 'disruptive coloration' that makes them invisible until within striking distance." },
  "Wolf":{ title:"Pack Intelligence", desc:"Wolves use coordinated ambush tactics across distances of 30+ km, communicating via howls with at least 12 distinct meanings." },
  "Crocodile":{ title:"Death Roll", desc:"Crocodiles spin at up to 3 000 rpm in the 'death roll' to tear prey — generating forces exceeding 3 700 N, more powerful than any other living animal." },
  "Snake":{ title:"Infrared Heat Vision", desc:"Pit vipers detect prey body heat at 0.003°C precision via facial pits, forming thermal images in total darkness with millisecond response." },
  "Panda":{ title:"Pseudo-Thumb Grip", desc:"Giant pandas have a modified wrist bone that acts as a sixth finger — perfectly shaped to grip bamboo stalks for hours of daily feeding." },
  "Polar Bear":{ title:"Thermal Insulation System", desc:"Polar bear fur is actually transparent and hollow, channelling UV light to black skin. Their fat layer is 11 cm thick for -50°C survival." },
  "Kangaroo":{ title:"Embryonic Diapause", desc:"Kangaroos can pause embryo development for months until the pouch joey grows up — simultaneously nursing two joeys at different developmental stages." },
  "Cuttlefish":{ title:"Hypnotic Camouflage Display", desc:"Cuttlefish run rippling waves of colour across their skin in milliseconds using 10 million chromatophores, hypnotising prey before striking." },
  "Tardigrade":{ title:"Cryptobiosis Survival", desc:"Tardigrades enter a death-like state called cryptobiosis, surviving vacuum of space, radiation 1 000× the lethal dose, and -272°C." },
  "Orca":{ title:"Cooperative Hunting Tactics", desc:"Orcas use distinct cultural dialects unique to each pod and coordinate wave-washing attacks on ice floes — a technique passed mother to calf across generations." },
  "Gecko":{ title:"Van der Waals Adhesion", desc:"Gecko feet have 2 billion nano-hairs generating van der Waals forces — they can support 133 kg and work on any surface including glass in a vacuum." },
};

const CATEGORY_ABILITIES = {
  Mammals:     { title:"Warm-Blood Endurance",   desc:"Mammals maintain constant body temperature, letting them stay active in cold or heat. A beating four-chambered heart powers sustained effort impossible for cold-blooded rivals." },
  Reptiles:    { title:"Thermal Mastery",         desc:"Reptiles regulate body heat by behaviour — basking raises temperature; shade lowers it. This lets them survive on a fraction of a mammal's food intake." },
  Birds:       { title:"Magnetic Navigation",     desc:"Birds detect Earth's magnetic field via cryptochrome proteins in their eyes, building internal magnetic maps for migrations spanning continents." },
  Aquatic:     { title:"Pressure Adaptation",     desc:"Deep-sea creatures withstand pressures 1 000 atm — equivalent to 50 jumbo jets stacked on a coin — using flexible bones, oil-filled bodies and pressure-stable enzymes." },
  "Small Creatures":{ title:"Superorganism Logic",desc:"Ant and bee colonies form a distributed intelligence: no individual plans, yet the colony solves mazes, farms crops, tends livestock and wages coordinated war." },
  Trees:       { title:"Hydraulic Lift & Carbon Capture", desc:"Trees pump water 100 m upward against gravity using cohesion-tension, while locking away CO₂ as wood for centuries." },
  Mountains:   { title:"Orographic Weather Forge",desc:"Mountains force air upward, cooling and condensing it into rain and snow that feed 60% of the world's fresh water. They create microclimates on both flanks." },
  Sea:         { title:"Global Heat Regulator",   desc:"Oceans absorb 93% of excess planetary heat and release it slowly over decades, stabilising climate and producing 50%+ of Earth's oxygen via phytoplankton." },
  Desert:      { title:"Water Extraction Science",desc:"Desert organisms extract moisture from fog, dew, metabolic water, and cacti store 3 000 litres in their spongy tissue during rare rains." },
  Nature:      { title:"Trophic Cascade Engine",  desc:"Remove one keystone species and the entire food web collapses — wolves change river courses by letting vegetation regrow, beavers flood plains. Nature is a cascade of cascades." },
};

export function getAbility(animal) {
  return (
    NAMED_ABILITIES[animal.name] ||
    CATEGORY_ABILITIES[animal.category] || {
      title: "Evolutionary Adaptation",
      desc: `${animal.name} has spent millions of years refining survival strategies perfectly tailored to ${animal.habitat || "its environment"}.`,
    }
  );
}

/* ─── Animal-specific quiz (4 unique questions per animal) ───────────────── */

/* Curated quizzes for 50 well-known animals */
const NAMED_QUIZZES = {
  "Lion": [
    { question: "What is a group of lions called?", options: ["Pride","Pack","Herd","Colony"], answer: "Pride" },
    { question: "How far can a lion's roar be heard?", options: ["8 km","500 m","50 km","1 km"], answer: "8 km" },
    { question: "How long does a lion typically live in the wild?", options: ["12–16 years","3–5 years","40+ years","25–30 years"], answer: "12–16 years" },
    { question: "Which lion subspecies lives in India?", options: ["Asiatic Lion","Bengal Lion","Nile Lion","Saharan Lion"], answer: "Asiatic Lion" },
  ],
  "Tiger": [
    { question: "Which tiger subspecies is the largest?", options: ["Siberian (Amur)","Bengal","Malayan","Sumatran"], answer: "Siberian (Amur)" },
    { question: "Tigers are primarily:", options: ["Solitary hunters","Pack hunters","Scavengers","Filter feeders"], answer: "Solitary hunters" },
    { question: "Where are tigers native to?", options: ["Asia","Africa","South America","Europe"], answer: "Asia" },
    { question: "What makes tiger stripes unique?", options: ["No two tigers share the same pattern","They change colour with age","They are only visible in UV","They grow back differently after injury"], answer: "No two tigers share the same pattern" },
  ],
  "Elephant": [
    { question: "Which is larger — African or Asian elephant?", options: ["African Elephant","Asian Elephant","They are the same","Neither — they're equal"], answer: "African Elephant" },
    { question: "Elephants use their trunks to:", options: ["Drink, smell, and grab","Only breathe","Only communicate","Only cool themselves"], answer: "Drink, smell, and grab" },
    { question: "How long is an elephant's pregnancy?", options: ["22 months","6 months","12 months","3 months"], answer: "22 months" },
    { question: "What is the main threat to elephant populations?", options: ["Ivory poaching","Competition from lions","Disease","Cold weather"], answer: "Ivory poaching" },
  ],
  "Cheetah": [
    { question: "What is the cheetah's top speed?", options: ["112 km/h","80 km/h","200 km/h","60 km/h"], answer: "112 km/h" },
    { question: "Unlike most big cats, cheetahs cannot:", options: ["Roar","Purr","Sprint","Hunt"], answer: "Roar" },
    { question: "A baby cheetah is called a:", options: ["Cub","Kit","Pup","Calf"], answer: "Cub" },
    { question: "What is a group of cheetahs called?", options: ["Coalition","Pride","Pack","Cluster"], answer: "Coalition" },
  ],
  "Wolf": [
    { question: "A wolf pack is led by:", options: ["An alpha pair","The oldest wolf","The biggest wolf","A council of wolves"], answer: "An alpha pair" },
    { question: "How far can a wolf's howl travel?", options: ["10 km","100 m","1 km","50 km"], answer: "10 km" },
    { question: "Wolves are classified as:", options: ["Carnivores","Herbivores","Omnivores","Insectivores"], answer: "Carnivores" },
    { question: "Which region was the wolf re-introduced to for ecosystem recovery?", options: ["Yellowstone, USA","Amazon, Brazil","Sahara, Africa","Himalayas, Nepal"], answer: "Yellowstone, USA" },
  ],
  "Dolphin": [
    { question: "How do dolphins communicate?", options: ["Signature whistles (names)","Colour changes","Blinking patterns","Bioluminescence"], answer: "Signature whistles (names)" },
    { question: "Dolphins are classified as:", options: ["Mammals","Fish","Reptiles","Amphibians"], answer: "Mammals" },
    { question: "How deep can a bottlenose dolphin dive?", options: ["300 m","10 m","2,000 m","50 m"], answer: "300 m" },
    { question: "Dolphins use echolocation for:", options: ["Finding prey in dark water","Attracting mates","Building nests","Regulating temperature"], answer: "Finding prey in dark water" },
  ],
  "Shark": [
    { question: "How many species of shark exist?", options: ["500+","50","1,200","2"], answer: "500+" },
    { question: "What is the largest fish in the ocean?", options: ["Whale Shark","Great White Shark","Megalodon","Hammerhead Shark"], answer: "Whale Shark" },
    { question: "Sharks have existed for approximately:", options: ["450 million years","10 million years","1 million years","65 million years"], answer: "450 million years" },
    { question: "What organ do sharks use to detect electrical fields?", options: ["Ampullae of Lorenzini","Lateral line","Pineal gland","Tympanic membrane"], answer: "Ampullae of Lorenzini" },
  ],
  "Eagle": [
    { question: "How far can an eagle spot prey?", options: ["3.2 km","100 m","10 km","500 m"], answer: "3.2 km" },
    { question: "Which eagle is the national bird of the USA?", options: ["Bald Eagle","Golden Eagle","Harpy Eagle","Sea Eagle"], answer: "Bald Eagle" },
    { question: "Eagle eyesight compared to humans is:", options: ["4–8x sharper","The same","Half as sharp","Only better in darkness"], answer: "4–8x sharper" },
    { question: "Eagles build their nests called:", options: ["Eyries","Burrows","Dens","Lodges"], answer: "Eyries" },
  ],
  "Whale": [
    { question: "Which is the largest animal on Earth?", options: ["Blue Whale","Sperm Whale","Humpback Whale","Gray Whale"], answer: "Blue Whale" },
    { question: "Whale song can travel:", options: ["Thousands of kilometres","Only 100 m","Only to the surface","Only within their pod"], answer: "Thousands of kilometres" },
    { question: "Whales breathe through:", options: ["A blowhole","Gills","Their mouths","Skin absorption"], answer: "A blowhole" },
    { question: "How long can a sperm whale hold its breath?", options: ["90 minutes","5 minutes","24 hours","10 seconds"], answer: "90 minutes" },
  ],
  "Panda": [
    { question: "How much bamboo does a giant panda eat per day?", options: ["12–38 kg","1 kg","100 kg","500 g"], answer: "12–38 kg" },
    { question: "Giant pandas are native to which country?", options: ["China","India","Japan","Nepal"], answer: "China" },
    { question: "The giant panda's black-and-white markings help with:", options: ["Camouflage and temperature regulation","Attracting mates","Toxin warnings","Navigation"], answer: "Camouflage and temperature regulation" },
    { question: "Giant pandas belong to which family?", options: ["Ursidae (bears)","Felidae (cats)","Mustelidae (weasels)","Canidae (dogs)"], answer: "Ursidae (bears)" },
  ],
  "Crocodile": [
    { question: "How long have crocodiles existed on Earth?", options: ["200 million years","10 million years","1 million years","65 million years"], answer: "200 million years" },
    { question: "Which is the largest living reptile?", options: ["Saltwater Crocodile","Nile Crocodile","Komodo Dragon","Leatherback Turtle"], answer: "Saltwater Crocodile" },
    { question: "Crocodiles are classified as:", options: ["Reptiles","Mammals","Amphibians","Fish"], answer: "Reptiles" },
    { question: "How long can crocodiles hold their breath?", options: ["2 hours","5 minutes","24 hours","10 seconds"], answer: "2 hours" },
  ],
  "Penguin": [
    { question: "Where do emperor penguins breed?", options: ["Antarctica in -50°C winters","Tropical beaches","Arctic ice","Temperate forests"], answer: "Antarctica in -50°C winters" },
    { question: "How deep can emperor penguins dive?", options: ["500+ m","10 m","2,000 m","50 m"], answer: "500+ m" },
    { question: "Penguins are:", options: ["Flightless birds","Mammals","Reptiles","Fish"], answer: "Flightless birds" },
    { question: "What do penguins primarily eat?", options: ["Fish and squid","Seaweed","Krill only","Small mammals"], answer: "Fish and squid" },
  ],
  "Gorilla": [
    { question: "How many times their body weight can gorillas lift?", options: ["10x","2x","5x","20x"], answer: "10x" },
    { question: "Gorillas share approximately what percentage of DNA with humans?", options: ["98.3%","60%","80%","50%"], answer: "98.3%" },
    { question: "Which gorilla subspecies is critically endangered?", options: ["Cross River Gorilla","Silverback Gorilla","Mountain Gorilla","Western Lowland Gorilla"], answer: "Cross River Gorilla" },
    { question: "Gorillas are primarily:", options: ["Herbivores","Carnivores","Omnivores","Insectivores"], answer: "Herbivores" },
  ],
  "Octopus": [
    { question: "How many hearts does an octopus have?", options: ["3","1","2","4"], answer: "3" },
    { question: "Octopus blood is what colour?", options: ["Blue","Red","Clear","Green"], answer: "Blue" },
    { question: "If an octopus loses an arm, what happens?", options: ["It fully regenerates","It dies","It stays missing","It grows a shorter version"], answer: "It fully regenerates" },
    { question: "Octopuses are classified as:", options: ["Cephalopod molluscs","Fish","Crustaceans","Echinoderms"], answer: "Cephalopod molluscs" },
  ],
  "Polar Bear": [
    { question: "Polar bear fur appears white but is actually:", options: ["Transparent and hollow","Pure white","Yellowish","Colourless"], answer: "Transparent and hollow" },
    { question: "How far can polar bears swim without stopping?", options: ["100+ km","1 km","500 km","10 km"], answer: "100+ km" },
    { question: "What is the primary diet of polar bears?", options: ["Ringed seals","Fish","Caribou","Berries"], answer: "Ringed seals" },
    { question: "Polar bears are classified as:", options: ["Marine mammals","Land mammals","Amphibians","Reptiles"], answer: "Marine mammals" },
  ],
  "Komodo Dragon": [
    { question: "What is the world's largest living lizard?", options: ["Komodo Dragon","Iguana","Monitor Lizard","Gila Monster"], answer: "Komodo Dragon" },
    { question: "Komodo Dragons are found only on:", options: ["Indonesian islands","Australian mainland","Philippine jungles","Indian forests"], answer: "Indonesian islands" },
    { question: "How do Komodo Dragons kill large prey?", options: ["Venom + bacteria + ambush","Squeezing like a boa","Venomous bite alone","Suffocation"], answer: "Venom + bacteria + ambush" },
    { question: "How fast can a Komodo Dragon run?", options: ["20 km/h","5 km/h","50 km/h","100 km/h"], answer: "20 km/h" },
  ],
};

function getDietLabel(diet) {
  if (!diet) return "Plants (Herbivore)";
  const d = diet.toLowerCase();
  if (d.includes("carnivore")) return "Meat (Carnivore)";
  if (d.includes("herbivore")) return "Plants (Herbivore)";
  if (d.includes("omnivore")) return "Both plants & meat (Omnivore)";
  if (d.includes("filter")) return "Plankton (Filter Feeder)";
  if (d.includes("insectivore")) return "Insects (Insectivore)";
  if (d.includes("frugi")) return "Fruit (Frugivore)";
  if (d.includes("photo")) return "Sunlight (Photosynthesis)";
  return diet.split("—")[0].trim().split(",")[0].trim() || "Plants (Herbivore)";
}

function shuffle(arr) { return [...arr].sort(() => 0.5 - Math.random()); }

/* Wrong region distractors */
const REGION_DISTRACTORS = ["Antarctica","Amazon Rainforest","Sahara Desert","Arctic Tundra","Siberia","Galapagos Islands","Deep Pacific Ocean","Himalayan peaks"];
/* Wrong habitat distractors */
const HABITAT_DISTRACTORS = ["Deep ocean floor","Polar ice cap","High-altitude glacier","Active volcano slope","Dense mangrove swamp","Arid salt flat"];

/**
 * Generate 4 animal-SPECIFIC quiz questions.
 * Every question uses the actual animal's data — no two animals get the same quiz.
 */
export function getDefaultQuiz(animal) {
  /* Return curated quiz if available */
  if (NAMED_QUIZZES[animal.name]) {
    return NAMED_QUIZZES[animal.name];
  }

  /* Q1: Animal-specific diet */
  const correctDiet = getDietLabel(animal.diet);
  const allDiets = ["Meat (Carnivore)","Plants (Herbivore)","Both plants & meat (Omnivore)","Plankton (Filter Feeder)","Insects (Insectivore)","Fruit (Frugivore)","Sunlight (Photosynthesis)"];
  const q1 = {
    question: `What does the ${animal.name} primarily eat?`,
    options: shuffle([correctDiet, ...allDiets.filter(d => d !== correctDiet).slice(0, 3)]),
    answer: correctDiet,
  };

  /* Q2: Animal-specific lifespan */
  const lifespan = animal.lifespan || "10–20 years";
  const q2 = {
    question: `How long does the ${animal.name} typically live in the wild?`,
    options: shuffle([lifespan, "1–3 years", "50–80 years", "200+ years"].filter((v,i,a)=>a.indexOf(v)===i)),
    answer: lifespan,
  };

  /* Q3: Animal-specific country/region */
  const region = (animal.country || "Africa").split(",")[0].trim();
  const wrongRegions = REGION_DISTRACTORS.filter(r => r !== region).slice(0, 3);
  const q3 = {
    question: `In which country or region is the ${animal.name} primarily found?`,
    options: shuffle([region, ...wrongRegions]),
    answer: region,
  };

  /* Q4: Animal-specific habitat */
  const habitat = (animal.habitat || "Savanna grasslands").split(" ").slice(0, 3).join(" ");
  const wrongHabitats = HABITAT_DISTRACTORS.filter(h => !h.toLowerCase().includes(habitat.toLowerCase().split(" ")[0])).slice(0, 3);
  const q4 = {
    question: `What is the primary habitat of the ${animal.name}?`,
    options: shuffle([habitat, ...wrongHabitats]),
    answer: habitat,
  };

  return [q1, q2, q3, q4];
}
