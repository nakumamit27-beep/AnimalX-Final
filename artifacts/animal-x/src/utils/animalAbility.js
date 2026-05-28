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

// ─── Diet helpers ─────────────────────────────────────────────────────────────

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

// ─── Per-category Q2 (habitat/category) ──────────────────────────────────────

const HABITAT_QUESTIONS = {
  Mammals:{ q:"How long does the {name} typically live in the wild?", opt:(a)=>[a.lifespan||"10–15 years","1–2 years","50–80 years","200+ years"], ans:(a)=>a.lifespan||"10–15 years" },
  Reptiles:{ q:"Which class does the {name} belong to?", opt:()=>["Reptilia","Mammalia","Aves","Amphibia"], ans:()=>"Reptilia" },
  Birds:{ q:"Which feature is UNIQUE to birds like the {name}?", opt:()=>["Feathers","Fur","Scales","Slime"], ans:()=>"Feathers" },
  Aquatic:{ q:"Where does the {name} spend most of its life?", opt:()=>["In water","Underground","In trees","In caves"], ans:()=>"In water" },
  "Small Creatures":{ q:"What makes the {name} an invertebrate?", opt:()=>["No backbone","No brain","No heart","No eyes"], ans:()=>"No backbone" },
  Trees:{ q:"What process does the {name} use to produce energy?", opt:()=>["Photosynthesis","Respiration","Digestion","Fermentation"], ans:()=>"Photosynthesis" },
  Mountains:{ q:"How are most mountain ranges like this formed?", opt:()=>["Tectonic plate collision","Ocean flooding","Wind erosion","Meteor impact"], ans:()=>"Tectonic plate collision" },
  Sea:{ q:"What percentage of Earth's surface is covered by oceans?", opt:()=>["71%","29%","50%","90%"], ans:()=>"71%" },
  Desert:{ q:"What defines a desert environment?", opt:()=>["<250 mm rain/year","Very high temperatures","Sandy terrain","No plant life"], ans:()=>"<250 mm rain/year" },
  Nature:{ q:"Which gas is most essential for plant photosynthesis?", opt:()=>["Carbon Dioxide (CO₂)","Oxygen (O₂)","Nitrogen (N₂)","Hydrogen (H₂)"], ans:()=>"Carbon Dioxide (CO₂)" },
};

// ─── Per-category Q3 (region) ─────────────────────────────────────────────────

const REGION_QUESTIONS = {
  Mammals:{ q:"Which continent has the most diverse mammal species?", opt:()=>["Africa","Antarctica","Europe","Australia"], ans:()=>"Africa" },
  Reptiles:{ q:"Which environment do most reptiles prefer?", opt:()=>["Warm & dry","Cold & wet","Deep ocean","Arctic tundra"], ans:()=>"Warm & dry" },
  Birds:{ q:"Which bird group has the longest annual migration?", opt:()=>["Arctic Tern","Penguin","Ostrich","Kiwi"], ans:()=>"Arctic Tern" },
  Aquatic:{ q:"Which ocean is the deepest on Earth?", opt:()=>["Pacific","Atlantic","Indian","Arctic"], ans:()=>"Pacific" },
  "Small Creatures":{ q:"How many insect species are estimated on Earth?", opt:()=>["1 million+","10,000","50 billion","500"], ans:()=>"1 million+" },
  Trees:{ q:"Which forest type has the highest biodiversity?", opt:()=>["Tropical rainforest","Boreal forest","Temperate forest","Mangrove"], ans:()=>"Tropical rainforest" },
  Mountains:{ q:"What is the tallest mountain on Earth?", opt:()=>["Mount Everest","K2","Kilimanjaro","Mont Blanc"], ans:()=>"Mount Everest" },
  Sea:{ q:"What is the deepest part of the world's ocean called?", opt:()=>["Mariana Trench","Coral Reef","Continental Shelf","Abyssal Plain"], ans:()=>"Mariana Trench" },
  Desert:{ q:"Which is the largest hot desert on Earth?", opt:()=>["Sahara","Gobi","Arabian","Atacama"], ans:()=>"Sahara" },
  Nature:{ q:"Which process describes water movement through the environment?", opt:()=>["Water cycle","Carbon cycle","Nitrogen cycle","Oxygen cycle"], ans:()=>"Water cycle" },
};

// ─── Per-category Q4 (speed/special fact) ────────────────────────────────────

const SPEED_QUESTIONS = {
  Mammals:{ q:"Which mammal is the fastest land animal?", opt:()=>["Cheetah","Lion","Greyhound","Horse"], ans:()=>"Cheetah" },
  Reptiles:{ q:"Which reptile can run the fastest on land?", opt:()=>["Black Mamba","Komodo Dragon","Iguana","Crocodile"], ans:()=>"Black Mamba" },
  Birds:{ q:"Which is the fastest bird in a dive?", opt:()=>["Peregrine Falcon","Swift","Eagle","Albatross"], ans:()=>"Peregrine Falcon" },
  Aquatic:{ q:"Which fish is the fastest in the ocean?", opt:()=>["Sailfish","Tuna","Shark","Marlin"], ans:()=>"Sailfish" },
  "Small Creatures":{ q:"Which insect has the fastest wings beat per second?", opt:()=>["Midge","Bee","Butterfly","Dragonfly"], ans:()=>"Midge" },
  Trees:{ q:"Which tree grows the fastest?", opt:()=>["Bamboo","Oak","Pine","Redwood"], ans:()=>"Bamboo" },
  Mountains:{ q:"How fast do tectonic plates typically move per year?", opt:()=>["2–5 cm","1 metre","10 metres","0.1 mm"], ans:()=>"2–5 cm" },
  Sea:{ q:"What is the speed of an ocean current like the Gulf Stream?", opt:()=>["~2 m/s","~50 m/s","~0.01 m/s","~200 m/s"], ans:()=>"~2 m/s" },
  Desert:{ q:"How hot can a Sahara surface temperature get?", opt:()=>["70°C","30°C","100°C","45°C"], ans:()=>"70°C" },
  Nature:{ q:"What percentage of species have gone extinct since 1900?", opt:()=>["~50%","~1%","~90%","~10%"], ans:()=>"~50%" },
};

/**
 * Generate 4 quiz questions for any animal.
 * Q1: Diet    Q2: Category/Habitat    Q3: Region    Q4: Speed/Special
 */
export function getDefaultQuiz(animal) {
  const correctDiet = getDietLabel(animal.diet);
  const allDiets = ["Meat (Carnivore)","Plants (Herbivore)","Both plants & meat (Omnivore)","Plankton (Filter Feeder)","Insects (Insectivore)","Fruit (Frugivore)","Sunlight (Photosynthesis)"];
  const wrongDiets = allDiets.filter(d => d !== correctDiet);

  const q1 = {
    question: `What does the ${animal.name} primarily eat?`,
    options: shuffle([correctDiet, ...wrongDiets.slice(0, 3)]),
    answer: correctDiet,
  };

  const hq = HABITAT_QUESTIONS[animal.category];
  const q2 = hq
    ? { question: hq.q.replace("{name}", animal.name), options: shuffle(hq.opt(animal)), answer: hq.ans(animal) }
    : { question: `Which region is the ${animal.name} mainly found in?`, options: shuffle([(animal.region||"Africa").split(",")[0].trim(),"Antarctica","Arctic","Moon"]), answer: (animal.region||"Africa").split(",")[0].trim() };

  const rq = REGION_QUESTIONS[animal.category];
  const q3 = rq
    ? { question: rq.q, options: shuffle(rq.opt(animal)), answer: rq.ans(animal) }
    : { question: `What is the primary habitat of the ${animal.name}?`, options: shuffle([(animal.habitat||"Savanna").split(" ")[0],"Ocean","Arctic tundra","Dense jungle"]), answer: (animal.habitat||"Savanna").split(" ")[0] };

  const sq = SPEED_QUESTIONS[animal.category];
  const q4 = sq
    ? { question: sq.q, options: shuffle(sq.opt(animal)), answer: sq.ans(animal) }
    : { question: `Approximately how old can a ${animal.name} get in the wild?`, options: shuffle([animal.lifespan||"10–20 years","1–2 years","100+ years","50–80 years"]), answer: animal.lifespan||"10–20 years" };

  return [q1, q2, q3, q4];
}
