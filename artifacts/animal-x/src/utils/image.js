export function cleanName(name) {
  return name
    .replace(/[0-9]/g, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getImage(name, id) {
  const clean = cleanName(name || "wildlife");
  const lockKey = clean.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://loremflickr.com/600/400/${encodeURIComponent(clean + " animal")}?lock=${lockKey}`;
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
