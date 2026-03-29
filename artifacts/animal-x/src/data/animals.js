const categories = [
  "Mammals",
  "Reptiles",
  "Birds",
  "Aquatic",
  "Small Creatures",
  "Nature",
  "Mountains",
  "Sea",
  "Desert",
  "Trees"
];

const baseNames = {
  Mammals: [
    "Lion","Tiger","Elephant","Leopard","Cheetah","Jaguar","Wolf","Fox","Bear","Panda",
    "Gorilla","Chimpanzee","Orangutan","Baboon","Hyena","Jackal","Deer","Moose","Elk","Reindeer",
    "Bison","Buffalo","Cow","Yak","Horse","Donkey","Zebra","Giraffe","Camel","Llama",
    "Alpaca","Kangaroo","Wallaby","Koala","Wombat","Platypus","Otter","Seal","Walrus","Dolphin",
    "Whale","Bat","Hedgehog","Mole","Rabbit","Hare","Squirrel","Chipmunk","Raccoon","Skunk",
    "Badger","Weasel","Ferret","Mink","Lynx","Caracal","Serval","Snow Leopard","Polar Bear","Grizzly Bear",
    "Sloth","Anteater","Armadillo","Tapir","Okapi","Manatee","Dugong","Porcupine","Beaver","Capybara",
    "Agouti","Tarsier","Lemur","Aye-aye","Galago","Fossa","Bandicoot","Quokka","Tasmanian Devil","Dingo",
    "Red Panda","Sun Bear","Spectacled Bear","Clouded Leopard","Fishing Cat","Civet","Genet","Pika","Ibex","Chamois"
  ],
  Reptiles: [
    "Cobra","King Cobra","Python","Anaconda","Boa","Viper","Mamba","Rattlesnake","Krait","Coral Snake",
    "Gecko","Iguana","Chameleon","Komodo Dragon","Monitor Lizard","Skink","Agama","Frilled Lizard","Horned Lizard","Basilisk",
    "Crocodile","Alligator","Gharial","Caiman","Turtle","Sea Turtle","Snapping Turtle","Box Turtle","Softshell Turtle","Tortoise",
    "Leopard Gecko","Tokay Gecko","Green Iguana","Marine Iguana","Black Mamba","Gaboon Viper","Bushmaster","King Snake","Milk Snake","Rat Snake",
    "Glass Lizard","Slow Worm","Blue Tongue Skink","Sand Lizard","Desert Iguana","Water Dragon","Chinese Alligator","Nile Crocodile","Saltwater Crocodile","American Alligator",
    "Leatherback Turtle","Hawksbill Turtle","Loggerhead Turtle","Green Sea Turtle","Red-eared Slider","Painted Turtle","Mud Turtle","Terrapin","Uromastyx","Chuckwalla",
    "Rock Python","Tree Python","Carpet Python","Ball Python","Sand Boa","Emerald Boa","Green Anaconda","Yellow Anaconda","Sea Snake","Olive Sea Snake",
    "Blind Snake","Worm Lizard","Gila Monster","Beaded Lizard","Komodo Monitor","Asian Water Monitor","Savannah Monitor","Desert Monitor","Fence Lizard","Anole"
  ],
  Birds: [
    "Eagle","Golden Eagle","Bald Eagle","Hawk","Falcon","Kite","Vulture","Owl","Barn Owl","Snowy Owl",
    "Parrot","Macaw","Cockatoo","Lovebird","Parakeet","Peacock","Peahen","Pigeon","Dove","Crow",
    "Raven","Sparrow","Finch","Canary","Swallow","Swift","Hummingbird","Kingfisher","Woodpecker","Hornbill",
    "Toucan","Flamingo","Pelican","Heron","Egret","Stork","Crane","Duck","Goose","Swan",
    "Penguin","Emperor Penguin","King Penguin","Albatross","Seagull","Tern","Cormorant","Grebe","Loon","Quail",
    "Turkey","Chicken","Rooster","Ostrich","Emu","Cassowary","Secretary Bird","Roadrunner","Cuckoo","Nightjar",
    "Lapwing","Sandpiper","Avocet","Curlew","Bittern","Jacana","Sunbird","Bee-eater","Drongo","Magpie",
    "Starling","Myna","Bulbul","Warbler","Shrike","Flycatcher","Thrush","Robin","Blue Jay","Cardinal",
    "Goldfinch","Chaffinch","Bunting","Weaver","Ibis","Spoonbill","Bustard","Kestrel","Harrier","Goshawk"
  ],
  Aquatic: [
    "Shark","Great White Shark","Hammerhead Shark","Tiger Shark","Bull Shark","Whale Shark","Dolphin","Orca","Blue Whale","Humpback Whale",
    "Sperm Whale","Beluga Whale","Narwhal","Octopus","Giant Octopus","Squid","Giant Squid","Cuttlefish","Crab","Hermit Crab",
    "Lobster","Shrimp","Prawn","Jellyfish","Box Jellyfish","Starfish","Sea Urchin","Sea Cucumber","Clam","Oyster",
    "Mussel","Scallop","Seal","Sea Lion","Walrus","Manatee","Dugong","Clownfish","Angelfish","Butterflyfish",
    "Tuna","Salmon","Trout","Cod","Haddock","Mackerel","Sardine","Anchovy","Barracuda","Swordfish",
    "Marlin","Eel","Moray Eel","Electric Eel","Ray","Manta Ray","Stingray","Skate","Sea Horse","Pipefish",
    "Coral","Anemone","Krill","Plankton","Gobies","Blenny","Snapper","Grouper","Pufferfish","Triggerfish",
    "Lionfish","Surgeonfish","Parrotfish","Damselfish","Flying Fish","Mudskipper","Catfish","Tilapia","Carp","Goldfish"
  ],
  "Small Creatures": [
    "Ant","Fire Ant","Carpenter Ant","Bee","Honey Bee","Bumblebee","Butterfly","Monarch Butterfly","Moth","Silkworm",
    "Spider","Tarantula","Black Widow","Wolf Spider","Mosquito","Fly","Housefly","Beetle","Ladybug","Weevil",
    "Dragonfly","Damselfly","Grasshopper","Locust","Cricket","Cockroach","Termite","Flea","Tick","Louse",
    "Snail","Slug","Earthworm","Leech","Centipede","Millipede","Scorpion","Pill Bug","Silverfish","Earwig",
    "Aphid","Caterpillar","Glowworm","Firefly","Water Strider","Gnat","Midge","Mayfly","Stonefly","Caddisfly",
    "Antlion","Stick Insect","Leaf Insect","Mantid","Praying Mantis","Thrips","Planthopper","Leafhopper","Cicada","Spittlebug",
    "Frog","Tree Frog","Toad","Poison Frog","Newt","Salamander","Axolotl","Flatworm","Roundworm","Tapeworm",
    "Hydra","Rotifer","Copepod","Isopod","Amphipod","Barnacle","Krill","Zooplankton","Phytoplankton","Tardigrade"
  ],
  Nature: [
    "Rainforest","Mangrove Forest","Deciduous Forest","Coniferous Forest","Grassland","Savanna","Tundra","Wetland","Swamp","Marsh",
    "River","Lake","Waterfall","Valley","Plateau","Canyon","Cliff","Island","Volcano","Glacier",
    "Forest Canopy","Understory","Meadow","Prairie","Steppe","Oasis","Spring","Lagoon","Delta","Estuary",
    "Banyan Tree","Neem Tree","Peepal Tree","Oak Tree","Pine Tree","Cedar Tree","Palm Tree","Baobab","Sequoia","Redwood",
    "Coral Reef","Kelp Forest","Sea Grass","Rock Pool","Ice Sheet","Snow Field","Rain Cloud","Thunderstorm","Rainbow","Aurora",
    "Sunset","Sunrise","Sand Dune","Sandstorm","Fog","Mist","Geyser","Hot Spring","Lava Field","Ash Cloud",
    "Cliff Edge","Hill","Slope","Forest Floor","Root System","Tree Bark","Leaf Canopy","Flower Field","Wildflowers","Shrubland"
  ],
  Mountains: [
    "Mount Everest","K2","Kangchenjunga","Lhotse","Makalu","Cho Oyu","Dhaulagiri","Manaslu","Nanga Parbat","Annapurna",
    "Mount Fuji","Kilimanjaro","Elbrus","Denali","Mont Blanc","Matterhorn","Rocky Mountains","Himalayas","Alps","Andes",
    "Zagros","Ural","Carpathians","Pyrenees","Appalachians","Atlas Mountains","Drakensberg","Tien Shan","Altai","Caucasus",
    "Sierra Nevada","Cascade Range","Alaskan Range","Great Dividing Range","Patagonian Andes","Southern Alps","Blue Mountains","Aravalli Range","Western Ghats","Eastern Ghats",
    "Snow Peak","Ice Ridge","Glacier Peak","Volcanic Peak","Cliff Ridge","Mountain Pass","Summit","Base Camp","Rock Face","Snowfield",
    "Dolomites","Karakoram","Hindu Kush","Kunlun","Tatra","Beskids","Sudetes","Rila","Rhodopes","Balkan Mountains"
  ],
  Sea: [
    "Pacific Ocean","Atlantic Ocean","Indian Ocean","Arctic Ocean","Southern Ocean","Coral Reef","Deep Sea","Ocean Trench","Abyss","Sea Floor",
    "Sea Cave","Sea Cliff","Lagoon","Bay","Gulf","Strait","Harbor","Port","Tidal Pool","Wave",
    "Tsunami","Current","Underwater Volcano","Seamount","Kelp Forest","Seagrass","Marine Ecosystem","Saltwater","Brine Pool","Hydrothermal Vent",
    "Ocean Ridge","Continental Shelf","Open Ocean","Pelagic Zone","Benthic Zone","Neritic Zone","Abyssal Zone","Coral Atoll","Barrier Reef","Fringing Reef",
    "Bioluminescence","Sea Mist","Tidal Flat","Estuary","Mangrove Coast","Rocky Shore","Sandy Beach","Kelp Bed","Sargasso Sea","Coral Garden"
  ],
  Desert: [
    "Sahara Desert","Arabian Desert","Gobi Desert","Kalahari Desert","Thar Desert","Mojave Desert","Sonoran Desert","Atacama Desert","Namib Desert","Great Victoria Desert",
    "Sand Dune","Oasis","Salt Flat","Desert Plateau","Rock Desert","Cold Desert","Hot Desert","Desert Storm","Dry River","Wadi",
    "Cactus","Succulent","Desert Shrub","Acacia Tree","Baobab Tree","Desert Grass","Date Palm","Yucca Plant","Agave","Prickly Pear",
    "Fennec Fox","Desert Fox","Camel","Dromedary Camel","Bactrian Camel","Jerboa","Meerkat","Sand Cat","Sidewinder Snake","Horned Viper",
    "Desert Lizard","Gila Monster","Roadrunner","Desert Tortoise","Scorpion","Dung Beetle","Antlion","Locust","Termite","Dust Devil"
  ],
  Trees: [
    "Banyan Tree","Neem Tree","Peepal Tree","Oak Tree","Pine Tree","Cedar Tree","Maple Tree","Birch Tree","Willow Tree","Palm Tree",
    "Coconut Tree","Date Palm","Baobab Tree","Sequoia Tree","Redwood Tree","Teak Tree","Sandalwood Tree","Eucalyptus Tree","Ash Tree","Elm Tree",
    "Fir Tree","Spruce Tree","Cherry Blossom","Apple Tree","Mango Tree","Guava Tree","Banana Tree","Papaya Tree","Orange Tree","Lemon Tree",
    "Fig Tree","Olive Tree","Walnut Tree","Almond Tree","Pecan Tree","Chestnut Tree","Hazel Tree","Rubber Tree","Coffee Tree","Cocoa Tree",
    "Acacia Tree","Bamboo","Mahogany Tree","Rosewood Tree","Poplar Tree","Aspen Tree","Dogwood Tree","Juniper Tree","Cypress Tree","Palm Fan Tree",
    "Rain Tree","Flame Tree","Gulmohar Tree","Kadamba Tree","Arjun Tree","Sal Tree","Deodar Tree","Chinar Tree","Khejri Tree","Prosopis Tree",
    "Tamarind Tree","Jackfruit Tree","Lychee Tree","Avocado Tree","Persimmon Tree","Mulberry Tree","Breadfruit Tree","Starfruit Tree","Durian Tree","Mangrove Tree"
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
  Desert: "Arid and Semi-arid Regions",
  Trees: "Forests, Tropical and Subtropical Regions"
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
  Desert: "Varies",
  Trees: "Photosynthesis"
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
  Desert: "Geological timescale",
  Trees: "50–1000+ years"
};

const animals = [];
let globalId = 1;

categories.forEach(category => {
  const list = baseNames[category];
  for (let i = 0; i < 150; i++) {
    const name = list[i % list.length];
    animals.push({
      id: globalId++,
      name,
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
