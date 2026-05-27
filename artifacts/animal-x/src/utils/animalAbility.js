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
  "Mantid":{ title:"Lightning Strike Reflex", desc:"Praying mantis strikes at 1/20th of an eye-blink (1 500 m/s²) — too fast for human vision. Their rotating heads give 300° field of view." },
  "Pistol Shrimp":{ title:"Sonoluminescence Snap", desc:"The snapping claw creates a 4 700 °C cavitation bubble — briefly producing light and sound louder than a gunshot." },
  "Dragonfly":{ title:"Aerial Intercept Targeting", desc:"Dragonflies intercept prey in mid-air with 95% success by predicting flight paths — the highest hunting accuracy of any animal." },
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

function shuffle(arr) { return [...arr].sort(() => 0.5 - Math.random()); }

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

export function getDefaultQuiz(animal) {
  const correctDiet = getDietLabel(animal.diet);
  const allDiets = ["Meat (Carnivore)","Plants (Herbivore)","Both plants & meat (Omnivore)","Plankton (Filter Feeder)","Insects (Insectivore)","Fruit (Frugivore)","Sunlight (Photosynthesis)"];
  const wrongDiets = allDiets.filter(d => d !== correctDiet);
  const dietOpts = shuffle([correctDiet, ...wrongDiets.slice(0,3)]);

  const q1 = {
    question: `What does the ${animal.name} primarily eat?`,
    options: dietOpts,
    answer: correctDiet,
  };

  const hq = HABITAT_QUESTIONS[animal.category];
  const q2 = hq
    ? {
        question: hq.q.replace("{name}", animal.name),
        options: shuffle(hq.opt(animal)),
        answer: hq.ans(animal),
      }
    : {
        question: `Which region is the ${animal.name} mainly found in?`,
        options: shuffle([(animal.region||"Africa").split(",")[0].trim(), "Antarctica", "Arctic", "Moon"]),
        answer: (animal.region||"Africa").split(",")[0].trim(),
      };

  return [q1, q2];
}
