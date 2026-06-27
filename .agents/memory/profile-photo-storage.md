---
name: Profile photo Object Storage fallback
description: Pattern for profile photo upload with Object Storage + base64 fallback and URL resolution.
---

## The rule
Profile photo (and cover photo) upload should:
1. Try Object Storage presigned URL first (`POST /api/storage/uploads/request-url` → `PUT uploadURL`)
2. Store `objectPath` (e.g. `/profiles/xxx`) in Firestore via `updateProfile({ photo: objectPath })`
3. Fall back to `fileToDataURL()` (base64) only if the API call fails
4. When displaying, resolve the stored value with a helper: `path.startsWith("data:") || path.startsWith("http") ? path : "/api/storage" + path`

**Why:** Storing base64 in Firestore/localStorage wastes ~133% space and hits Firestore document size limits for large images. Object Storage is the correct long-term solution. The fallback ensures the app still works if the storage API is down.

**How to apply:** Any new image upload feature (cover photo, reel thumbnail, animal photo) should follow this same try/fallback pattern. The `resolveUrl()` helper in Profile.jsx is the canonical implementation.
