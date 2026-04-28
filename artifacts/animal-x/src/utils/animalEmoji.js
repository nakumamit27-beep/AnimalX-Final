const EMOJI_BY_NAME = {
  // Mammals
  lion: "🦁", tiger: "🐅", elephant: "🐘", wolf: "🐺", bear: "🐻", "polar bear": "🐻‍❄️",
  panda: "🐼", leopard: "🐆", cheetah: "🐆", jaguar: "🐆", deer: "🦌", fox: "🦊",
  rabbit: "🐰", hare: "🐰", kangaroo: "🦘", koala: "🐨", monkey: "🐒", gorilla: "🦍",
  chimpanzee: "🦧", orangutan: "🦧", giraffe: "🦒", zebra: "🦓", hippo: "🦛", hippopotamus: "🦛",
  rhino: "🦏", rhinoceros: "🦏", buffalo: "🐃", bison: "🦬", yak: "🐂", camel: "🐪",
  horse: "🐎", donkey: "🫏", cow: "🐄", goat: "🐐", sheep: "🐑", pig: "🐖",
  dog: "🐕", cat: "🐈", mouse: "🐁", rat: "🐀", squirrel: "🐿️", hedgehog: "🦔",
  bat: "🦇", sloth: "🦥", otter: "🦦", skunk: "🦨", raccoon: "🦝", badger: "🦡",
  beaver: "🦫", lynx: "🐱", panther: "🐆", puma: "🐆", cougar: "🐆", mongoose: "🦦",
  meerkat: "🦦", platypus: "🦦", anteater: "🐜", armadillo: "🦔", lemur: "🐒", baboon: "🐒",
  mandrill: "🐒", gibbon: "🐒", elk: "🦌", moose: "🫎", caribou: "🦌", reindeer: "🦌",
  antelope: "🦌", impala: "🦌", gazelle: "🦌", wildebeest: "🐃", warthog: "🐗", boar: "🐗",
  weasel: "🦦", ferret: "🦦", marten: "🦦", ocelot: "🐱", serval: "🐱", caracal: "🐱",
  // Reptiles
  snake: "🐍", cobra: "🐍", python: "🐍", anaconda: "🐍", viper: "🐍", rattlesnake: "🐍",
  mamba: "🐍", boa: "🐍", crocodile: "🐊", alligator: "🐊", gharial: "🐊", caiman: "🐊",
  lizard: "🦎", iguana: "🦎", gecko: "🦎", chameleon: "🦎", "komodo dragon": "🦎",
  turtle: "🐢", tortoise: "🐢",
  // Birds
  eagle: "🦅", hawk: "🦅", falcon: "🦅", owl: "🦉", parrot: "🦜", peacock: "🦚",
  flamingo: "🦩", penguin: "🐧", swan: "🦢", duck: "🦆", goose: "🦆", chicken: "🐔",
  rooster: "🐓", turkey: "🦃", sparrow: "🐦", crow: "🐦‍⬛", raven: "🐦‍⬛", dove: "🕊️",
  pigeon: "🕊️", hummingbird: "🐦", woodpecker: "🐦", kingfisher: "🐦", pelican: "🦤",
  ostrich: "🪶", emu: "🪶", kiwi: "🥝", toucan: "🦜", cockatoo: "🦜", macaw: "🦜",
  vulture: "🦅", condor: "🦅", stork: "🦩", heron: "🦩", crane: "🦩",
  // Aquatic
  shark: "🦈", whale: "🐋", "blue whale": "🐋", dolphin: "🐬", orca: "🐋", seal: "🦭",
  walrus: "🦭", "sea lion": "🦭", octopus: "🐙", squid: "🦑", "blue whale": "🐋",
  fish: "🐟", "tropical fish": "🐠", pufferfish: "🐡", clownfish: "🐠", angelfish: "🐠",
  tuna: "🐟", salmon: "🐟", swordfish: "🗡️", marlin: "🐟", barracuda: "🐟", "sea turtle": "🐢",
  jellyfish: "🪼", crab: "🦀", lobster: "🦞", shrimp: "🦐", prawn: "🦐", starfish: "⭐",
  manatee: "🦭", dugong: "🦭", stingray: "🐟", "manta ray": "🐟", eel: "🐍",
  // Small Creatures
  ant: "🐜", bee: "🐝", honeybee: "🐝", wasp: "🐝", hornet: "🐝", butterfly: "🦋",
  moth: "🦋", spider: "🕷️", tarantula: "🕷️", scorpion: "🦂", beetle: "🪲", ladybug: "🐞",
  ladybird: "🐞", grasshopper: "🦗", cricket: "🦗", cockroach: "🪳", fly: "🪰", mosquito: "🦟",
  worm: "🪱", earthworm: "🪱", caterpillar: "🐛", snail: "🐌", slug: "🐌", centipede: "🐛",
  millipede: "🐛", dragonfly: "🪲", firefly: "🪲", termite: "🐜", flea: "🪰", tick: "🕷️",
  frog: "🐸", toad: "🐸", salamander: "🦎", newt: "🦎", axolotl: "🦎",
  // Nature / Trees / Plants
  tree: "🌳", oak: "🌳", pine: "🌲", maple: "🍁", palm: "🌴", coconut: "🥥",
  banyan: "🌳", baobab: "🌳", sequoia: "🌲", redwood: "🌲", cedar: "🌲", cypress: "🌲",
  willow: "🌳", birch: "🌳", bamboo: "🎋", fern: "🌿", cactus: "🌵", flower: "🌸",
  rose: "🌹", sunflower: "🌻", tulip: "🌷", lotus: "🪷", orchid: "🌸", lily: "🌺",
  // Mountains / Geography
  mountain: "⛰️", volcano: "🌋", everest: "🏔️", himalayas: "🏔️", andes: "🏔️", alps: "🏔️",
  rockies: "🏔️", "k2": "🏔️", glacier: "🧊", iceberg: "🧊",
  // Sea / Water
  sea: "🌊", ocean: "🌊", reef: "🪸", coral: "🪸", wave: "🌊", lagoon: "🏖️",
  lake: "💧", river: "💧", waterfall: "🌊",
  // Desert
  desert: "🏜️", sahara: "🏜️", oasis: "🏜️", dune: "🏜️", "sand dune": "🏜️",
};

const CATEGORY_FALLBACK = {
  Mammals: "🐾",
  Reptiles: "🐍",
  Birds: "🐦",
  Aquatic: "🐬",
  "Small Creatures": "🐜",
  Nature: "🌳",
  Mountains: "⛰️",
  Sea: "🌊",
  Desert: "🏜️",
  Trees: "🌲",
};

function clean(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[0-9#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAnimalEmoji(name, category) {
  const c = clean(name);
  if (EMOJI_BY_NAME[c]) return EMOJI_BY_NAME[c];
  // try last word fallback
  const last = c.split(" ").pop();
  if (last && EMOJI_BY_NAME[last]) return EMOJI_BY_NAME[last];
  return CATEGORY_FALLBACK[category] || "🌍";
}

export function getCategoryEmoji(category) {
  return CATEGORY_FALLBACK[category] || "🌍";
}
