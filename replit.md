# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Animal X wildlife explorer app.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (react-vite)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Styling**: CSS custom properties (dark theme), Tailwind CSS

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── animal-x/               # Animal X wildlife explorer app (React + Vite)
│   │   └── src/
│   │       ├── components/     # AnimalCard, CategoryFilter, Navbar
│   │       ├── pages/          # Home, Animals, AnimalDetail, Map, Reels, Travel, Chatbot, HelpDesk
│   │       ├── data/           # animals.js (1350 items), zoos.js (150 items)
│   │       ├── utils/          # image.js (getImage, getEmoji)
│   │       └── styles/         # app.css (dark theme)
│   └── api-server/             # Express API server
├── lib/                        # Shared libraries
│   ├── api-spec/               # OpenAPI spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas from OpenAPI
│   └── db/                     # Drizzle ORM schema + DB connection
├── scripts/                    # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Animal X App Features

- **Animals Page**: 1,350 animals (150 per category × 9 categories) with lazy loading (20 at a time), search, and category filters
- **Categories**: Mammals, Reptiles, Birds, Aquatic, Small Creatures, Nature, Mountains, Sea, Desert
- **Image System**: loremflickr.com images with emoji fallback on error
- **Zoo Map**: 150 zoos across 16 countries with SVG map and popup details
- **Reels**: Vertical auto-play wildlife stories with swipe/scroll navigation
- **Travel**: Links to Uber, Ola, Lyft, Bolt, Grab, Skyscanner, Google Flights, Kayak, VistaJet
- **Chatbot**: Wildlife-only chatbot that rejects off-topic questions
- **Help Desk**: Contact form + FAQ + social links (Instagram, YouTube, Facebook, Email)

## Help Desk Contacts

- Email: animalx00001@gmail.com
- Instagram: wild_life_animal_fight
- YouTube: wild_life_animal_fight
- Facebook: wild_life_animal_fight
