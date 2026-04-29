const KEY = "ax_animal_overrides_v1";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch (err) {
    if (err && (err.name === "QuotaExceededError" || /quota/i.test(err.message || ""))) {
      const stripped = {};
      for (const id in map) {
        const o = map[id] || {};
        const { image, ...rest } = o;
        if (Object.keys(rest).length) stripped[id] = rest;
      }
      try {
        localStorage.setItem(KEY, JSON.stringify(stripped));
        try { window.dispatchEvent(new CustomEvent("ax-overrides-changed")); } catch {}
        if (typeof window !== "undefined") {
          window.alert(
            "Browser storage is full — older custom photos have been removed to free space. Your text edits are kept. Try a smaller image."
          );
        }
        return;
      } catch {
        if (typeof window !== "undefined") {
          window.alert(
            "Browser storage is full and could not save this change. Try clearing some custom photos."
          );
        }
        return;
      }
    }
    throw err;
  }
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

/**
 * Read an image file, downscale to max edge `maxEdge` px, and return a JPEG data URL.
 * Keeps localStorage payloads tiny (~30–150 KB instead of multi-MB).
 */
export function compressImageFile(file, { maxEdge = 800, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        try {
          const ratio = Math.min(1, maxEdge / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * ratio));
          const h = Math.max(1, Math.round(img.height * ratio));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No 2D canvas context");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
