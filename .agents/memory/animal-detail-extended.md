---
name: Animal Detail Extended Page
description: Architecture of the new 19-section wildlife profile page and its Firestore data model.
---

## Firestore data model — `animalDetails/{animalId}`

All fields are optional. Missing fields show "Not available" in the UI.

| Field | Type | Example |
|---|---|---|
| `scientificName` | string | "Panthera leo" |
| `weight` | string | "Male: 190 kg, Female: 130 kg" |
| `speed` | string | "80 km/h" |
| `height` | string | "1.2 m" |
| `length` | string | "2.5 m" |
| `lifespan` | string | "10–15 years" (overrides local + overrides) |
| `diet` | string | overrides local animal.diet |
| `habitat` | string | overrides local animal.habitat |
| `conservationStatus` | string | "Endangered" |
| `population` | string | "~20,000" |
| `family` | string | "Felidae" |
| `taxonomicClass` | string | "Mammalia" |
| `order` | string | "Carnivora" |
| `behaviour` | string or string[] | "Solitary, Territorial" or ["Solitary","Territorial"] |
| `humanBehaviour` | string or string[] | "Dangerous" |
| `distribution` | string or string[] | ["Africa", "India"] |
| `threats` | string or string[] | ["Poaching", "Habitat Loss"] |
| `funFacts` | string or string[] | ["Fastest land animal", ...] |
| `soundUrl` | string | public URL to audio file |

Array fields: `toArray()` splits string by comma/semicolon or uses array directly.

## Page sections (in order)
1. Hero image banner
2. Header card: category badge, IUCN badge, name + emoji, scientific name, description
3. Quick Stats grid (9 cells): Habitat, Diet, Lifespan, Region, Weight, Speed, Height, Length, Population
4. Classification: Class, Order, Family
5. Behaviour: behaviour chips + human behaviour chips
6. Conservation: IUCN Red List badge + threats chips
7. Distribution: country/region chips (falls back to animal.country)
8. Fun Facts: numbered list
9. Animal Sound: HTML5 audio player
10. Special Ability (existing)
11. Wildlife Quiz (existing)
12. Related Animals (existing)

## IUCN badge CSS classes
`iucn-lc`, `iucn-nt`, `iucn-vu`, `iucn-en`, `iucn-cr`, `iucn-ew`, `iucn-ex`, `iucn-dd`

## CSS files
- `src/styles/animal-detail.css` — all new section styles
- Chip colours: `chip-green`, `chip-blue`, `chip-orange`, `chip-red`, `chip-purple`

## Design system migration
- `@workspace/animal-x-ds` added as devDependency to Animal X
- `src/index.css` now imports `@workspace/animal-x-ds/styles.css` (replaces standalone `@import "tailwindcss"`)
- `:root` block overrides light-mode DS defaults with Animal X's dark-first token values
