import { getOverride } from "./animalOverrides";
import { getAnimalEmoji, getCategoryEmoji } from "./animalEmoji";
import animalAssets from "../data/animalAssets.json";

export function cleanName(name) {
  return (name || "")
    .replace(/[0-9]/g, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPermanentImageUrl(value) {
  return typeof value === "string" && (
    /^https?:\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("/animals/")
  );
}

// The production bundle owns the canonical image for every seeded animal.
export function getImage(name, id) {
  if (id != null) {
    const override = getOverride(id);
    if (isPermanentImageUrl(override?.image)) return override.image;
    if (animalAssets[String(id)]) return animalAssets[String(id)];
  }
  return "/opengraph.jpg";
}

// Single source of truth: the animal's image (override OR default URL).
// Use this everywhere (cards, banners, details) so they stay in sync.
export function getAnimalImage(animal) {
  if (!animal) return getImage("wildlife", null);
  const override = animal.id != null ? getOverride(animal.id) : {};
  if (isPermanentImageUrl(override?.image)) return override.image;
  if (animalAssets[String(animal.id)]) return animalAssets[String(animal.id)];
  if (isPermanentImageUrl(animal.imageUrl)) return animal.imageUrl;
  if (isPermanentImageUrl(animal.image)) return animal.image;
  return getImage(animal.baseName || animal.name, animal.id);
}

export function getEmoji(category) {
  return getCategoryEmoji(category);
}

export { getAnimalEmoji };
