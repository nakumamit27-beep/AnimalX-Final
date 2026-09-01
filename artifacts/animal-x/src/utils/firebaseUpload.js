/**
 * Firebase Storage upload utility.
 * Use for all user-generated media (profile photos, thumbnails, story images).
 * Free tier: 5 GB storage, 1 GB/day download — sufficient for images.
 * For large videos, use a public URL (YouTube, etc.) instead.
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a File or Blob to Firebase Storage.
 * Returns the public download URL.
 *
 * @param {File|Blob} file
 * @param {string} folder  e.g. "profile-photos", "thumbnails", "stories"
 * @returns {Promise<string>} public download URL
 */
export async function uploadToFirebase(file, folder = "uploads") {
  const ext = (file.name || "").split(".").pop() || "bin";
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, name);
  await uploadBytes(storageRef, file, { contentType: file.type || "application/octet-stream" });
  return getDownloadURL(storageRef);
}

/**
 * Compress a File to WebP (max 800px, ≤200 KB) then upload to Firebase Storage.
 * Ideal for profile photos and story images.
 *
 * @param {File} file
 * @param {string} folder
 * @returns {Promise<string>} public download URL
 */
export async function compressAndUpload(file, folder = "uploads") {
  const compressed = await compressImage(file, { maxEdge: 800, maxBytes: 200_000 });
  const blob = dataURLToBlob(compressed);
  const storageRef = ref(storage, `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`);
  await uploadBytes(storageRef, blob, { contentType: "image/webp" });
  return getDownloadURL(storageRef);
}

function dataURLToBlob(dataURL) {
  const [header, b64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function compressImage(file, { maxEdge = 800, maxBytes = 200_000 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
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
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          let quality = 0.85;
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (dataUrl.length * 0.75 > maxBytes && quality > 0.3) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL("image/webp", quality);
            if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        } catch (e) { reject(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resolve a stored media path to a displayable URL.
 *
 * Handles:
 *   - Full HTTPS URLs (Firebase Storage, etc.) → passthrough
 *   - data: / blob: URLs → passthrough
 *   - Legacy Replit /objects/... paths → /api/storage/objects/... (works in dev)
 *
 * @param {string|null} path
 * @param {string|null} fallback
 */
export function resolveMediaUrl(path, fallback = null) {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  // Legacy Replit object path
  if (path.startsWith("/objects/")) return `/api/storage/objects/${path.slice("/objects/".length)}`;
  if (path.startsWith("/api/storage")) return path;
  if (path.startsWith("/")) return `/api/storage${path}`;
  return fallback;
}
