const WILDLIFE_KW = [
  "lion","tiger","elephant","eagle","wolf","dolphin","whale","shark","cheetah","leopard",
  "gorilla","panda","penguin","crocodile","jaguar","orca","falcon","bear","fox","lynx",
  "bison","flamingo","animal","wildlife","nature","forest","jungle","bird","ocean","reptile",
  "snake","fish","reef","coral","turtle","frog","insect","safari","savanna","arctic",
  "mountain","desert","rainforest","conservation","wild","mammal","primate","raptor","marine",
  "zebra","giraffe","hippo","rhino","chimpanzee","orangutan","deer","moose","elk","wolf",
  "coyote","hyena","meerkat","mongoose","otter","seal","walrus","polar","grizzly","blackbear",
  "hawk","owl","parrot","toucan","hummingbird","peacock","ostrich","emu","albatross","pelican",
  "stork","crane","heron","flamingo","macaw","cockatoo","vulture","condor","kestrel","sparrow",
  "lizard","gecko","iguana","chameleon","python","cobra","anaconda","komodo","alligator",
  "octopus","squid","jellyfish","seahorse","stingray","lobster","crab","shrimp","starfish",
  "butterfly","bee","ant","beetle","dragonfly","spider","scorpion","centipede",
  "zoo","sanctuary","wildlife park","national park","game reserve","nature reserve",
  "habitat","ecosystem","biodiversity","endangered","extinct","conservation","species",
  "migration","hibernation","predator","prey","carnivore","herbivore","omnivore",
];

export function moderateContent(title, desc, hashtags) {
  const text = `${title} ${desc} ${hashtags}`.toLowerCase();
  return WILDLIFE_KW.some(w => text.includes(w));
}

export function getStrikeMessage(strikes) {
  if (strikes >= 3) return { banned: true, msg: "🚫 Upload access suspended for 30 days due to repeated violations." };
  if (strikes === 2) return { banned: false, warning: true, msg: "⚠️ Final warning: next violation will result in a 30-day upload ban." };
  if (strikes === 1) return { banned: false, warning: true, msg: "⚠️ Warning: this is your first strike. Only wildlife content is permitted." };
  return { banned: false, warning: false, msg: "" };
}
