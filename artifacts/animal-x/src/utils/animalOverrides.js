/**
 * Animal overrides — Firebase Storage (images) + Firestore (metadata) + localStorage cache.
 *
 * Flow when admin saves a new photo:
 *   1. Compress to JPEG ≤ 200 KB via canvas
 *   2. Upload to Firebase Storage  →  get download URL
 *   3. Write URL + text fields to Firestore  (animals/{animalId})
 *   4. Cache everything in localStorage so repeat reads are instant
 *   5. Dispatch "ax-overrides-changed" so React re-renders all cards
 *
 * Flow on read:
 *   1. Try localStorage cache first (instant)
 *   2. Bootstrap from Firestore once on app load via listenOverrides()
 */

import { storage, db } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const CACHE_KEY = "ax_overrides_cache_v2";

// ─── Local cache helpers ──────────────────────────────────────────────────────

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(map) {
  // Strip raw base64 images before caching (only URL strings are cached)
  const safe = {};
  for (const id in map) {
    const { image, ...rest } = map[id] || {};
    // Only keep image field if it's a URL (not base64)
    if (image && !image.startsWith("data:")) rest.image = image;
    if (Object.keys(rest).length) safe[id] = rest;
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(safe));
  } catch {
    // Cache full — clear and retry once
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_KEY, JSON.stringify(safe));
    } catch {
      /* silently ignore — Firestore is source of truth */
    }
  }
}

function dispatchChange() {
  try {
    window.dispatchEvent(new CustomEvent("ax-overrides-changed"));
  } catch {}
}

// ─── Public read ─────────────────────────────────────────────────────────────

export function getOverride(animalId) {
  const cache = readCache();
  return cache[String(animalId)] || {};
}

// ─── Firestore listener (call once at app start) ─────────────────────────────

let _unsubscribe = null;

export function listenOverrides() {
  if (_unsubscribe) return _unsubscribe;

  const col = collection(db, "animals");
  _unsubscribe = onSnapshot(
    col,
    (snap) => {
      const map = readCache();
      snap.forEach((docSnap) => {
        map[docSnap.id] = { ...map[docSnap.id], ...docSnap.data() };
      });
      writeCache(map);
      dispatchChange();
    },
    (err) => {
      console.warn("Firestore listener error:", err.message);
    }
  );

  return _unsubscribe;
}

// ─── Write (admin only) ───────────────────────────────────────────────────────

/**
 * Save a patch for one animal to Firestore.
 * If patch.image is a raw data URL, upload to Storage first, replace with URL.
 */
export async function setOverride(animalId, patch) {
  const id = String(animalId);
  let data = { ...patch };

  if (data.image && data.image.startsWith("data:")) {
    // Upload to Firebase Storage
    const blob = dataURLToBlob(data.image);
    const storageRef = ref(storage, `animal-photos/${id}.jpg`);
    await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
    data.image = await getDownloadURL(storageRef);
  }

  // Persist to Firestore
  await setDoc(doc(db, "animals", id), data, { merge: true });

  // Update local cache immediately so UI reflects change before snapshot fires
  const cache = readCache();
  cache[id] = { ...(cache[id] || {}), ...data };
  writeCache(cache);
  dispatchChange();

  return cache[id];
}

export function clearOverride(animalId) {
  const cache = readCache();
  delete cache[String(animalId)];
  writeCache(cache);
  dispatchChange();
}

// ─── Image helpers ────────────────────────────────────────────────────────────

function dataURLToBlob(dataURL) {
  const [header, b64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Compress an image File to a JPEG data URL ≤ 200 KB.
 * Progressively lowers quality until under budget.
 */
export function compressImageFile(file, { maxEdge = 1024, maxBytes = 200_000 } = {}) {
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

          // Lower quality until under 200 KB
          let quality = 0.85;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Legacy — kept for any callers that haven't migrated
export function fileToDataURL(file) {
  return compressImageFile(file);
}
