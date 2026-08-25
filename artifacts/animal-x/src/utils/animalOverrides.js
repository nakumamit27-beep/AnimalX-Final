/**
 * Animal overrides — Firebase Storage (images) + Firestore (metadata) + localStorage cache.
 *
 * Image upload flow (admin only):
 *   1. Compress image to WebP / JPEG ≤ 300 KB via canvas
 *   2. Upload directly to Firebase Storage under animal-images/{timestamp}-{uuid}.webp
 *   3. Get public download URL from Firebase Storage
 *   4. Store image URL + text fields in Firestore (animals/{animalId})
 *   5. Cache in localStorage for instant repeat reads
 *   6. Dispatch "ax-overrides-changed" so React re-renders everywhere
 *
 * Legacy Replit Object Storage paths (imageObjectPath starting with /objects/) are
 * served via /api/storage/objects/… for backward compatibility with existing records.
 */

import { db, storage } from "./firebase";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CACHE_KEY = "ax_overrides_cache_v3";

// ─── Storage URL helpers ──────────────────────────────────────────────────────

/**
 * Convert a legacy Replit objectPath into a serving URL.
 * New uploads return full HTTPS Firebase Storage URLs directly.
 * This function is kept for backward-compatibility with existing stored records.
 */
export function objectPathToUrl(objectPath) {
  if (!objectPath) return null;
  if (objectPath.startsWith("http")) return objectPath;
  // Legacy Replit path: /objects/uploads/uuid → /api/storage/objects/uploads/uuid
  const clean = objectPath.replace(/^\/objects\//, "");
  return `/api/storage/objects/${clean}`;
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

// ─── Firebase Storage upload ──────────────────────────────────────────────────

/**
 * Upload a Blob/File to Firebase Storage.
 * Returns the public download URL.
 */
async function uploadToFirebaseStorage(blob, contentType = "image/webp") {
  const ext = contentType === "image/webp" ? "webp" : "jpg";
  const fileName = `animal-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob, { contentType });
  return await getDownloadURL(storageRef);
}

// ─── Write (admin only) ───────────────────────────────────────────────────────

/**
 * Save a patch for one animal to Firestore.
 * If patch.image is a raw data URL, compress + upload to Firebase Storage first.
 */
export async function setOverride(animalId, patch) {
  const id = String(animalId);
  let data = { ...patch };

  if (data.image && data.image.startsWith("data:")) {
    const blob = dataURLToBlob(data.image);
    const downloadURL = await uploadToFirebaseStorage(blob, "image/webp");
    data.image = downloadURL;
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
