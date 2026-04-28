import { getOverride } from "./animalOverrides";
import { getAnimalEmoji, getCategoryEmoji } from "./animalEmoji";

export function cleanName(name) {
  return (name || "")
    .replace(/[0-9]/g, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Stable, deterministic image URL per animal name.
// Same name always returns the same image (lock seed = name hash).
export function getImage(name, id) {
  if (id != null) {
    const override = getOverride(id);
    if (override && override.image) return override.image;
  }
  const clean = cleanName(name || "wildlife");
  const lockKey = clean.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const query = encodeURIComponent(clean + " animal wildlife");
  return `https://loremflickr.com/600/400/${query}?lock=${lockKey}`;
}

// Single source of truth: the animal's image (override OR default URL).
// Use this everywhere (cards, banners, details) so they stay in sync.
export function getAnimalImage(animal) {
  if (!animal) return getImage("wildlife", null);
  return getImage(animal.baseName || animal.name, animal.id);
}

export function getEmoji(category) {
  return getCategoryEmoji(category);
}

export { getAnimalEmoji };
