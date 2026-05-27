# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Animal X wildlife explorer app — 1,213+ animals (9 categories), 200+ zoos on a Leaflet map, Live Animal Tracking map, video Reels/Posts/Stories, Travel deep-links, wildlife chatbot, Firebase Auth, social system (likes/follows/notifications), Ads platform, and admin broadcast system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (react-vite)
- **API framework**: Express 5
- **Auth/Database**: Firebase Auth + Firestore + Realtime Database + Storage (project: happy-fd1bc)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Styling**: CSS custom properties (dark teal-to-green gradient dark theme)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── animal-x/               # Animal X wildlife explorer app (React + Vite)
│   │   └── src/
│   │       ├── components/     # AnimalCard, CategoryFilter, Navbar, NotificationBell, BlueTick
│   │       ├── context/        # AuthContext (Firebase), SocialContext (likes/follows/notifs)
│   │       ├── pages/          # Home, Animals, AnimalDetail, Map, Reels, Travel, Chatbot,
│   │       │                   # HelpDesk, Auth, Profile, UserProfile, Ads
│   │       ├── data/           # animals.js, zoos.js, demoUsers.js (20 users + 26 reels)
│   │       ├── utils/          # image.js, firebase.js, animalAbility.js, animalOverrides.js
│   │       └── styles/         # app.css (dark theme + all feature styles)
│   └── api-server/             # Express API server
├── lib/                        # Shared libraries
└── scripts/                    # Utility scripts
```

## Animal X App Features

- **Animals Page**: 1,213+ animals (9 categories) with lazy loading, search, and category filters
- **Categories**: Mammals, Reptiles, Birds, Aquatic, Small Creatures, Trees, Mountains, Sea, Desert
- **Animal Detail**: Each animal has ⚡ Special Ability card (named abilities for 30+ species) + 🧠 Quiz (2 questions, instant feedback with correct/wrong reveal)
- **Image System**: loremflickr.com images with emoji fallback on error; admin can upload custom photos
- **Zoo Map**: 200+ zoos globally on Leaflet map with popup details
- **Reels**: 26 demo reels from 20 demo creators with real like counts; Firebase unique-like system; double-tap to like animation; author overlay + follow button; swipe/scroll navigation
- **Posts**: Feed with like/share; user can upload wildlife photos/videos
- **Stories**: 24h auto-expiry stories with viewer
- **Travel**: Links to Uber, Ola, Lyft, Bolt, Grab, Skyscanner, Google Flights, Kayak, VistaJet
- **Chatbot**: Wildlife-only chatbot that rejects off-topic questions
- **Help Desk**: 4 tabs — Help Center (contact + FAQ), Privacy Policy, Terms & Conditions, Community Guidelines; "Run Advertisement" button
- **Auth**: Firebase Auth (email/password), forgot password modal, show/hide password toggle, loading spinner
- **Profile**: Instagram-style with verified badge, follower/post/reel counts
- **User Profile** (`/user/:userId`): Public profile page for any user/demo creator with follow button + reel grid
- **Ads** (`/ads`): 4-step ad wizard — details → target categories → plan (₹149–₹4,999) → UPI payment to nakumamit27-1@okicici
- **Notifications**: Bell icon with unread badge; real-time Firestore notifications for follows

## Admin System

- **Super Admin**: malinotaling8@gmail.com
- **Unlock**: Tap the 🦁 logo in top bar 7 times while logged in as admin → broadcast panel opens
- **Admin Broadcast**: Send message to all users; shown as top banner with dismiss button
- **Animal Edit**: 7-tap on animal banner image (in admin mode) → edit habits, lifespan, ability, photo

## Firebase / Social System

- **Auth**: Firebase Auth (email/password); `onAuthStateChanged` keeps session persistent
- **Likes**: `userLikes/{uid}` doc with `liked` map; `reelMeta/{reelId}` with `likesCount`; localStorage cache for instant UI
- **Follows**: `userFollowing/{uid}` + `userFollowers/{uid}`; follow notification sent to Firestore
- **Notifications**: `notifications` collection; real-time listener; unread badge on bell
- **Broadcasts**: `adminBroadcasts` collection; active broadcasts shown to all users as a top banner
- **Ads**: `advertisements` collection; submitted with plan, price, UPI confirmation; admin reviews

## Firebase Firestore Security Rules (MUST SET)

In Firebase Console → Firestore → Rules, set:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /userLikes/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /userFollowing/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /userFollowers/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /reelMeta/{reelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /notifications/{docId} {
      allow read, write: if request.auth != null && (
        resource.data.targetUid == request.auth.uid ||
        resource.data.actorUid == request.auth.uid
      );
      allow create: if request.auth != null;
    }
    match /adminBroadcasts/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "malinotaling8@gmail.com";
    }
    match /advertisements/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Help Desk Contacts

- Email: animalx00003@gmail.com
- Instagram: @wild_life_aniaml_fight
- YouTube: wild_life_aniaml_fight
- Facebook: wild_life_aniaml_fight

## User Preferences

- Free app — no premium, no locks, all features accessible to everyone
- Admin email: malinotaling8@gmail.com (hardcoded SUPER_ADMIN_EMAIL)
- UPI payment for ads: nakumamit27-1@okicici
