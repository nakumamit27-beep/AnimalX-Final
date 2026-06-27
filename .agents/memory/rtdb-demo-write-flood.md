---
name: RTDB demo-reel write flood
description: How to prevent 80+ Firebase permission_denied errors flooding the console from trackReelView on demo reels.
---

## The rule
In `trackReelView` (and `likeReelLive`), always add two guards before any RTDB write:
1. `if (!reelId || !user?.uid) return;` — never write when unauthenticated
2. `if (reelId.startsWith("ff") || reelId.startsWith("dr") || reelId.startsWith("du") || reelId.startsWith("fu")) return;` — skip all demo/fake reel IDs

**Why:** The feed mixes ~80 demo reels (FAKE_FEED_REELS with IDs like `ff0`…`ff79`) with live Firestore reels. IntersectionObserver fires for all of them on initial load. Without the guard, every demo reel triggers an RTDB write to `/live-views/{id}` and `/trending/{id}/score` — all of which fail with `permission_denied` because RTDB rules require auth, and demo IDs have no real Firebase documents.

**How to apply:** Any new function that writes to RTDB based on a reel ID must apply both guards. Demo reel ID prefixes in demoUsers.js: `ff` (FAKE_FEED_REELS), `dr` (DEMO_REELS), `du` (demo user reels).
