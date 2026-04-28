const KEY = "ax_custom_animals_v1";

export function getCustomAnimals() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addCustomAnimal(data) {
  const all = getCustomAnimals();
  const id = `custom_${Date.now()}`;
  const animal = {
    id,
    name: data.name,
    baseName: data.name,
    category: data.category,
    description: data.description || `${data.name} — added by admin.`,
    habitat: data.habitat || data.habits || "Various habitats",
    diet: data.diet || "Varies by habitat",
    lifespan: data.lifespan || "Unknown",
    region: data.country || "Worldwide",
    country: data.country || "Worldwide",
    dailyFood: data.dailyFood || "N/A",
    image: data.image || null,
    isCustom: true,
  };
  all.push(animal);
  localStorage.setItem(KEY, JSON.stringify(all));
  try { window.dispatchEvent(new CustomEvent("ax-custom-animals-changed")); } catch {}
  return animal;
}

export function deleteCustomAnimal(id) {
  const all = getCustomAnimals().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
  try { window.dispatchEvent(new CustomEvent("ax-custom-animals-changed")); } catch {}
}
