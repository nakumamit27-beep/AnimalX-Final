export function getImage(name, id) {
  return `https://loremflickr.com/600/400/${encodeURIComponent(name)}?lock=${id}`;
}

export function getEmoji(category) {
  const map = {
    Mammals: "🐾",
    Reptiles: "🐍",
    Birds: "🐦",
    Aquatic: "🐬",
    "Small Creatures": "🐜",
    Nature: "🌳",
    Mountains: "⛰️",
    Sea: "🌊",
    Desert: "🏜️",
    Trees: "🌲"
  };
  return map[category] || "🌍";
}
