/**
 * Animal overrides — Cloudinary (images) + Firestore (metadata) + localStorage cache.
 *
 * Image upload flow (admin only):
 *   1. Compress image to WebP / JPEG ≤ 300 KB via canvas
 *   2. Upload directly to Cloudinary using the shared unsigned uploader
 *   3. Store the permanent secure URL and public ID
 *   4. Store image URL + text fields in Firestore (animals/{animalId})
 *   5. Cache in localStorage for instant repeat reads
 *   6. Dispatch "ax-overrides-changed" so React re-renders everywhere
 *
 * Legacy Replit Object Storage paths are intentionally ignored by the client.
 * Existing seeded animal photos are baked into public/animals for Firebase Hosting.
 */

import { db } from "./firebase";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary";

const CACHE_KEY = "ax_overrides_cache_v3";

// ─── Storage URL helpers ──────────────────────────────────────────────────────

/**
 * Legacy object paths are not valid production media URLs.
 */
export function objectPathToUrl(objectPath) {
  return typeof objectPath === "string" && /^https?:\/\//i.test(objectPath)
    ? objectPath
    : null;
}

// ─── Local cache helpers ──────────────────────────────────────────────────────

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch { return {}; }
}

function writeCache(map) {
  const safe = {};
  for (const id in map) {
    const entry = map[id] || {};
    if (entry.image && entry.image.startsWith("data:")) {
      const { image, ...rest } = entry;
      if (Object.keys(rest).length) safe[id] = rest;
    } else {
      if (Object.keys(entry).length) safe[id] = entry;
    }
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(safe));
  } catch {
    try { localStorage.removeItem(CACHE_KEY); localStorage.setItem(CACHE_KEY, JSON.stringify(safe)); }
    catch { /* Firestore is source of truth */ }
  }
}

function dispatchChange() {
  try { window.dispatchEvent(new CustomEvent("ax-overrides-changed")); } catch {}
}

// ─── Public read ──────────────────────────────────────────────────────────────

export function getOverride(animalId) {
  const cache = readCache();
  return cache[String(animalId)] || {};
}

// ─── Firestore listener (call once at app start) ──────────────────────────────

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
    (err) => console.warn("Firestore overrides listener:", err.message),
  );
  return _unsubscribe;
}

// ─── Write (admin only) ───────────────────────────────────────────────────────

/**
 * Save a patch for one animal to Firestore.
 * If patch.image is a raw data URL, upload it to Cloudinary first.
 */
export async function setOverride(animalId, patch) {
  const id = String(animalId);
  let data = { ...patch };

  if (data.image && data.image.startsWith("data:")) {
    const blob = dataURLToBlob(data.image);
    const uploaded = await uploadToCloudinary(blob);
    data.image = uploaded.url;
    data.imagePublicId = uploaded.publicId;
    data.imageObjectPath = null;
  }

  await setDoc(doc(db, "animals", id), data, { merge: true });

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

// ─── Image compression ────────────────────────────────────────────────────────

function dataURLToBlob(dataURL) {
  const [header, b64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Compress an image File:
 *   - Resize to max 1080px (long edge)
 *   - Convert to WebP
 *   - Reduce quality until ≤ 300 KB
 * Returns a data URL.
 */
export function compressImageFile(file, { maxEdge = 1080, maxBytes = 300_000 } = {}) {
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
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No 2D canvas context");
          ctx.drawImage(img, 0, 0, w, h);

          let quality = 0.85;
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL("image/webp", quality);
            if (!dataUrl.startsWith("data:image/webp")) {
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }
          }
          resolve(dataUrl);
        } catch (e) { reject(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Legacy alias
export function fileToDataURL(file) {
  return compressImageFile(file);
}
