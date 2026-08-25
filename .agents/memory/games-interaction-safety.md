---
name: Games interaction safety
description: Durable implementation constraints for canvas and stateful game interactions.
---

State updater callbacks must remain pure: derive the next state there, then trigger score saving, rewards, confetti, or game-over transitions from an effect or event handler with a duplicate guard.

**Why:** React may invoke updater callbacks more than once in development, and side effects inside them can duplicate rewards or persistence writes.

**How to apply:** For game completion, observe the completed state and guard the completion path with a ref or equivalent idempotency check.

Canvas pointer handlers need to draw the initial point explicitly because setting `drawing` state is asynchronous. Movement math must also handle overlapping entities before normalizing a zero-length vector.

**Why:** Otherwise the first stroke is dropped and exact-overlap collisions can produce `NaN` positions.

**How to apply:** Pass an explicit “start” flag to the first draw event and branch on zero distance before dividing.