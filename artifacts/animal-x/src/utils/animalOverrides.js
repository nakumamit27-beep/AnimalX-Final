const KEY = "ax_animal_overrides_v1";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
  try {
    window.dispatchEvent(new CustomEvent("ax-overrides-changed"));
  } catch {}
}

export function getOverride(animalId) {
  const all = readAll();
  return all[animalId] || {};
}

export function setOverride(animalId, patch) {
  const all = readAll();
  all[animalId] = { ...(all[animalId] || {}), ...patch };
  writeAll(all);
  return all[animalId];
}

export function clearOverride(animalId) {
  const all = readAll();
  delete all[animalId];
  writeAll(all);
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
