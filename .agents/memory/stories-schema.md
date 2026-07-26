---
name: Stories Firestore schema
description: Data model and expiry logic for the Instagram-style Stories feature in Animal X.
---

## Firestore Collection: stories
```
stories/{storyId}: {
  userId: string,
  username: string,
  userVerified: boolean,
  userPhoto: string | null,   // objectPath from Object Storage, or null
  mediaUrl: string,           // objectPath — served via /api/storage${mediaUrl}
  mediaType: 'image' | 'video',
  caption: string | null,
  createdAt: Timestamp,       // serverTimestamp()
  expiresAt: number,          // Date.now() + 24 * 60 * 60 * 1000 (ms since epoch, NOT Timestamp)
  viewerIds: string[],        // array of viewer UIDs — updated via arrayUnion
  viewCount: number,          // incremented via increment(1) on each new view
}
```

## Expiry
expiresAt is stored as a plain JavaScript number (milliseconds), NOT a Firestore Timestamp. This allows simple client-side filtering:
```js
.filter(s => (s.expiresAt || 0) > Date.now())
```
Do NOT use a Firestore where("expiresAt", ">", ...) query with this field since it's a number not a Timestamp.

## Components
- StoriesRow.jsx — horizontal scroll of story bubbles; used in Profile.jsx
- StoriesViewer.jsx — full-screen viewer with progress bars, auto-advance (5s), tap zones
- UploadStory.jsx — modal for picking + uploading a story (image/video ≤ 100MB)

## Why expiresAt as number
Simpler to write (Date.now() + 86400000) and read client-side without conversion. Firestore Timestamp would require toMillis() on read.
