/**
 * Animal overrides — Replit Object Storage (images) + Firestore (metadata) + localStorage cache.
 *
 * Image upload flow (admin only):
 *   1. Compress image to WebP / JPEG ≤ 300 KB via canvas
 *   2. Request presigned URL from POST /api/storage/uploads/request-url
 *   3. PUT file bytes directly to GCS (presigned URL)
 *   4. Store objectPath + text fields in Firestore (animals/{animalId})
 *   5. Cache in localStorage for instant repeat reads
 *   6. Dispatch "ax-overrides-changed" so React re-renders everywhere
 *
 * Image serve URL: /api/storage/objects/{objectPath trimmed of leading /objects/}
 *
 * NOTE: Firebase Storage is no longer used. Auth/Firestore/RTDB remain unchanged.
 */

import { db } from "./firebase";
import {
  collection, doc, setDoc, deleteField, onSnapshot,
} from "firebase/firestore";

const CACHE_KEY = "ax_overrides_cache_v3";

// ─── Storage URL helpers ──────────────────────────────────────────────────────

/**
 * Convert an objectPath returned by the API into a full serving URL.
 * objectPath looks like "/objects/uploads/some-uuid"
 * Serving URL:           /api/storage/objects/uploads/some-uuid
 */
export function objectPathToUrl(objectPath) {
  if (!objectPath) return null;
  // Already a full URL
  if (objectPath.startsWith("http")) return objectPath;
  // Remove leading /objects/ then prepend /api/storage/objects/
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
    // Only keep image if it's a URL string (not raw base64)
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

// ─── Object Storage upload ────────────────────────────────────────────────────

/**
 * Upload a Blob/File to Replit Object Storage via presigned URL.
 * Returns the objectPath string (e.g. "/objects/uploads/uuid").
 */
async function uploadToObjectStorage(blob, contentType = "image/webp") {
  // Step 1: request presigned URL
  const urlRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: `animal-image-${Date.now()}.webp`, size: blob.size, contentType }),
  });
  if (!urlRes.ok) throw new Error(`Presigned URL request failed: ${urlRes.status}`);
  const { uploadURL, objectPath } = await urlRes.json();

  // Step 2: upload directly to GCS
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!uploadRes.ok) throw new Error(`GCS upload failed: ${uploadRes.status}`);

  return objectPath;
}

// ─── Write (admin only) ───────────────────────────────────────────────────────

/**
 * Save a patch for one animal to Firestore.
 * If patch.image is a raw data URL, compress + upload to Object Storage first.
 */
export async function setOverride(animalId, patch) {
  const id = String(animalId);
  let data = { ...patch };

  if (data.image && data.image.startsWith("data:")) {
    const blob = dataURLToBlob(data.image);
    const objectPath = await uploadToObjectStorage(blob, "image/webp");
    data.image = objectPathToUrl(objectPath);
    data.imageObjectPath = objectPath;
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

          // Try WebP first; fall back to JPEG
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
