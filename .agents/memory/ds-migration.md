---
name: Design System Migration
description: How Animal X consumes the Animal X Design System package and key dark-first override pattern.
---

## Package: @workspace/animal-x-ds (artifacts/animal-x-ds)

Tokens extracted from Animal X's live CSS vars. Dark primary is `#22c55e` (wildlife green), deep navy `#0a0f1e`.

## Consumption in Animal X

`artifacts/animal-x/src/index.css`:
```css
@import "@workspace/animal-x-ds/styles.css";

:root {
  /* Animal X is dark-first — override DS light defaults */
  --background: 222 47% 7%;
  --primary: 142 72% 45%;
  /* ...all 20+ roles set to dark values... */
}
```

**Why:** DS styles.css includes `@import "tailwindcss"` plus light+dark token :root blocks. Animal X has no `.dark` class toggle; it runs dark always via `:root` override.

**How to apply:** Any new Animal X web artifact that should share the theme: add `@workspace/animal-x-ds: workspace:*` to devDependencies, import `@workspace/animal-x-ds/styles.css`, and add a dark-override `:root` block. Do NOT also add `@import "tailwindcss"` — it's already in the DS styles.
