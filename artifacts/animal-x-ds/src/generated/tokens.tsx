/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f0fdf4",
      "foreground": "#0f172a",
      "card": "#ffffff",
      "cardForeground": "#0f172a",
      "popover": "#ffffff",
      "popoverForeground": "#0f172a",
      "primary": "#16a34a",
      "primaryForeground": "#ffffff",
      "secondary": "#e2e8f0",
      "secondaryForeground": "#0f172a",
      "muted": "#f1f5f9",
      "mutedForeground": "#64748b",
      "accent": "#dcfce7",
      "accentForeground": "#14532d",
      "destructive": "#dc2626",
      "destructiveForeground": "#ffffff",
      "border": "#e2e8f0",
      "input": "#e2e8f0",
      "ring": "#16a34a",
      "chart1": "#16a34a",
      "chart2": "#2563eb",
      "chart3": "#d97706",
      "chart4": "#7c3aed",
      "chart5": "#dc2626",
      "sidebar": "#f0fdf4",
      "sidebarForeground": "#0f172a",
      "sidebarBorder": "#d1fae5",
      "sidebarPrimary": "#16a34a",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#dcfce7",
      "sidebarAccentForeground": "#14532d",
      "sidebarRing": "#16a34a"
    },
    "dark": {
      "background": "#0a0f1e",
      "foreground": "#f1f5f9",
      "card": "#1a2332",
      "cardForeground": "#f1f5f9",
      "popover": "#111827",
      "popoverForeground": "#f1f5f9",
      "primary": "#22c55e",
      "primaryForeground": "#0a0f1e",
      "secondary": "#1f2937",
      "secondaryForeground": "#f1f5f9",
      "muted": "#111827",
      "mutedForeground": "#94a3b8",
      "accent": "#22c55e",
      "accentForeground": "#0a0f1e",
      "destructive": "#ef4444",
      "destructiveForeground": "#f1f5f9",
      "border": "#2d3748",
      "input": "#2d3748",
      "ring": "#22c55e",
      "chart1": "#22c55e",
      "chart2": "#3b82f6",
      "chart3": "#f59e0b",
      "chart4": "#8b5cf6",
      "chart5": "#ef4444",
      "sidebar": "#0a0f1e",
      "sidebarForeground": "#f1f5f9",
      "sidebarBorder": "#2d3748",
      "sidebarPrimary": "#22c55e",
      "sidebarPrimaryForeground": "#0a0f1e",
      "sidebarAccent": "#1f2937",
      "sidebarAccentForeground": "#f1f5f9",
      "sidebarRing": "#22c55e"
    }
  },
  "fontFamily": {
    "sans": [
      "Inter",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "Menlo",
      "monospace"
    ]
  },
  "radius": "0.75rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
