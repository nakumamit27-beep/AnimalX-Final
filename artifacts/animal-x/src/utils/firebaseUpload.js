/**
 * Resolve a stored media path to a displayable URL.
 *
 * Handles:
 *   - Full HTTPS URLs (Cloudinary, etc.) → passthrough
 *   - data: / blob: URLs → passthrough
 *   - Invalid legacy storage paths → fallback
 *
 * @param {string|null} path
 * @param {string|null} fallback
 */
export function resolveMediaUrl(path, fallback = null) {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  return fallback;
}
