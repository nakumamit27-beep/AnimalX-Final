---
name: moderateContent export pattern
description: Why named exports from page files break Vite Fast Refresh and the fix pattern.
---

## The rule
Never export non-component functions (like `moderateContent`) from React page files. Move shared utilities to `src/utils/` instead.

**Why:** Vite Fast Refresh requires that a file either exports only React components or only non-component exports — not both. A page file like `Reels.jsx` exports `default function Reels()` (component) + `export function moderateContent()` (utility). This causes `hmr invalidate` with "incompatible export" warnings, which trigger full page reloads instead of fast refreshes.

**How to apply:** When a utility function is needed in multiple files, create `src/utils/moderation.js` (or similar) and import from there. The fix: `import { moderateContent } from "../utils/moderation"` in both Reels.jsx (can keep it private) and UploadReel.jsx.
