---
name: Real-only social media system
description: Architecture decisions for the pure-Firebase social media system in Animal X (no demo data in user-facing pages).
---

## Rule
Reels.jsx, UserProfile.jsx, and Search.jsx load ONLY from Firebase Firestore. demoUsers.js exports (DEMO_REELS, FAKE_FEED_REELS, ALL_USERS, getUserReels, FAKE_USERS) must NOT be imported in these files. AdminModerationPanel.jsx still uses ALL_USERS and that is intentional (admin-only tool).

**Why:** Previous implementation mixed 3,626 demo reels into the feed which looked fake. Real users uploading reels would never see their content surface because demo reels dominated the feed.

## Video Autoplay Fix
`autoPlay` (not `AutoPlay`) is the correct JSX attribute. Start videos `muted={true}` (useState default true) — browsers block autoplay with sound. Provide a visible unmute button. The IntersectionObserver plays the active video and pauses all others; sync muted state via `useEffect([muted, activeIdx])`.

## Creator Profile Cache
Load creator profiles from Firestore on demand when new reels appear in feed. Store in `useState({})` map keyed by userId. Batch fetch missing UIDs using `Promise.all`. Display real photo from `resolveUrl(creator.photo)` — where `resolveUrl` handles: null → null, "data:…" → passthrough, "http…" → passthrough, else → `/api/storage${path}`.

## Search Architecture
Firestore doesn't have full-text search. Workaround: orderBy("name") + startAt/endAt for prefix match, plus a full scan of the first 200 users filtered client-side. Reels searched by loading last 200 ordered by createdAt and filtering client-side on title/hashtags/category. Results split into 3 tabs: Users, Reels, Hashtags.

## How to apply
Whenever touching Reels, UserProfile, or Search — do NOT import from demoUsers.js. If admin features need demo user lookup, that's only allowed in admin-specific components.
