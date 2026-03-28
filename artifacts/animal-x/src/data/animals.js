const categories = [
  "Mammals",
  "Reptiles",
  "Birds",
  "Aquatic",
  "Small Creatures",
  "Nature",
  "Mountains",
  "Sea",
  "Desert"
];

const baseNames = {
  Mammals: ["Lion","Tiger","Elephant","Leopard","Wolf","Fox","Bear","Panda","Deer","Horse"],
  Reptiles: ["Cobra","Python","Crocodile","Lizard","Gecko","Iguana","Chameleon","Tortoise","Komodo Dragon","Monitor Lizard"],
  Birds: ["Eagle","Parrot","Peacock","Owl","Sparrow","Flamingo","Penguin","Toucan","Macaw","Crane"],
  Aquatic: ["Shark","Dolphin","Whale","Octopus","Crab","Jellyfish","Seahorse","Manta Ray","Swordfish","Clownfish"],
  "Small Creatures": ["Ant","Bee","Butterfly","Spider","Frog","Snail","Grasshopper","Ladybug","Dragonfly","Scorpion"],
  Nature: ["Banyan Tree","Rainforest","River","Waterfall","Forest","Glacier","Mangrove","Swamp","Savanna","Tundra"],
  Mountains: ["Mount Everest","K2","Himalayas","Alps","Rocky Mountains","Andes","Kilimanjaro","Mont Blanc","Fuji","Denali"],
  Sea: ["Coral Reef","Ocean","Lagoon","Sea Cave","Marine Ecosystem","Tide Pool","Kelp Forest","Seagrass Meadow","Deep Ocean","Estuary"],
  Desert: [
    "Sahara Desert","Thar Desert","Arabian Desert","Gobi Desert","Kalahari Desert",
    "Atacama Desert","Mojave Desert","Sonoran Desert","Namib Desert","Desert Dunes",
    "Oasis","Cactus Field","Sandstorm","Desert Plateau"
  ]
};

const habitatMap = {
  Mammals: "Forests, Grasslands, and Jungles",
  Reptiles: "Tropical and Subtropical Regions",
  Birds: "Forests, Wetlands, and Open Skies",
  Aquatic: "Oceans, Rivers, and Lakes",
  "Small Creatures": "Gardens, Forests, and Underground",
  Nature: "Various Natural Habitats",
  Mountains: "High-altitude Alpine Zones",
  Sea: "Ocean and Coastal Waters",
  Desert: "Arid and Semi-arid Regions"
};

const dietMap = {
  Mammals: "Carnivore / Herbivore / Omnivore",
  Reptiles: "Carnivore / Insectivore",
  Birds: "Seeds, Insects, Fish",
  Aquatic: "Plankton, Fish, Crustaceans",
  "Small Creatures": "Plants, Insects, Nectar",
  Nature: "Photosynthesis / Water",
  Mountains: "N/A",
  Sea: "Plankton, Algae, Marine Life",
  Desert: "Varies"
};

const lifespanMap = {
  Mammals: "10–80 years",
  Reptiles: "5–150 years",
  Birds: "5–60 years",
  Aquatic: "1–100 years",
  "Small Creatures": "1–10 years",
  Nature: "Centuries to millennia",
  Mountains: "Geological timescale",
  Sea: "Geological timescale",
  Desert: "Geological timescale"
};

const animals = [];
let globalId = 1;

categories.forEach(category => {
  const list = baseNames[category];
  for (let i = 0; i < 150; i++) {
    const name = list[i % list.length];
    const idx = Math.floor(i / list.length) + 1;
    const displayName = idx > 1 ? `${name} #${idx}` : name;
    animals.push({
      id: globalId++,
      name: displayName,
      baseName: name,
      category,
      description: `${name} is a remarkable part of the ${category.toLowerCase()} ecosystem. Found across various regions of the world, it plays a vital role in maintaining ecological balance.`,
      habitat: habitatMap[category],
      country: "Global",
      diet: dietMap[category],
      lifespan: lifespanMap[category]
    });
  }
});

export default animals;

export { categories };
