# KC Intern Map

An interactive map for interns in Kansas City to share and discover their favorite spots around the city — restaurants, parks, hangouts, whatever's worth visiting. The idea is simple: interns often only have a summer (or a semester) to explore a new city, and the best recommendations usually come from other interns, not a generic guide. This app is meant to help interns pin the places they love so others — especially those coming from out of town — can find good spots faster, while also giving KC locals a fun way to see the city through other interns' eyes.

## Project History

This project started as a version of the KC Intern Map that I built manually by hand. After getting familiar with that base code, I wanted to experiment with AI-assisted development to see how much of the frontend I could redo by prompting an AI instead of writing it myself.

Each stage lives on its own branch so the progression is visible over time:

- **Original manual build (`original-design` branch)** — the base version I built file by file.
- **First AI design (`first-AI-design` branch)** — the frontend rebuilt by prompting Claude Fable 5 with a single well-crafted prompt: no external tools, plugins, or add-ons.
- **Second AI design (`main` branch — this one)** — the frontend rebuilt again with Claude Fable 5, this time with a full AI-assisted design workflow: official plugins/skills, researched design references, and an approved design-token system.

The goal is to keep each stage as its own visible step, so the change in approach and results is easy to compare over time.

## How This Design Was Built with Fable 5

This branch wasn't one prompt — it was a workflow. The steps, roughly in order:

**1. Built the prompt itself with AI help.** Before any design work, I worked with Claude to plan what a strong Fable 5 prompt needed: context about the app and its users, design goals ("Awwwards-caliber, bright, playful, KC intern energy"), non-negotiables (mobile-first, since the app is mainly used on phones; performance-conscious animation), a scoped deliverable, and — most importantly — reference material. I collected links to websites I admired (found through Awwwards and similar galleries), wrote a note for each one about *which specific element* I wanted from it (mouse-follow interactions, organic section dividers, scroll effects, color energy), and gathered screenshots: a Pinterest mood board, the KC heart I wanted as the map pin, and illustrated city-map posters as style references.

**2. Installed official plugins so Fable 5 had specialist skills.** Two plugins, both installed through Claude Code's plugin system: Anthropic's official `frontend-design` plugin (pushes deliberate aesthetic direction and away from generic "AI-looking" design) and GreenSock's official `gsap-skills` plugin (teaches idiomatic GSAP — including the correct Vue patterns for creating and cleaning up animations). Vue Bits was considered as a Vue-native animation source, but I chose GSAP as the single animation library for consistency, keeping Vue Bits as interaction-pattern inspiration only.

**3. Let the AI research the references directly.** Instead of relying only on screenshots, Fable 5 fetched the actual CSS/JS of my favorite reference site and extracted its real hex palette, its fonts, its signature bounce easing curve, and confirmed its animation stack (GSAP + ScrollTrigger + Lenis) — which became the stack for this project.

**4. Design tokens first, pages second.** Before writing any page, I had Fable 5 interview me on the open decisions (palette anchors, typography personality, how the illustrated map should be produced), then delivered a design-token system — colors, type roles, spacing scale, motion durations/easings, the KC heart pin — as a live visual page I could review and approve. Only after approval did any screen get built, and every screen was built from those same tokens (they live in `src/assets/main.css` as CSS custom properties), which is what keeps the four screens feeling like one product.

**5. One screen at a time, with feedback loops.** Homepage first, then the map, then pin details, then the add-pin form. Before each screen, another short interview and after each screen, I tested and reported what felt wrong, and the AI fixed it.

**6. AI-generated artwork where it fit.** The illustrated Kansas City poster at the end of the homepage was generated with an external image tool from a prompt Fable 5 wrote (landmarks, palette, and composition specified — including leaving the sky simple so animated SVG clouds and a plane could be layered over it with GSAP).

## Tech Stack

| Tool | Role |
|---|---|
| Vue 3 | UI framework (Composition API, `<script setup>`) |
| Vite | Dev server + build tool |
| Vue Router | Screen navigation (home / map / pin detail / add pin) |
| Leaflet + @vue-leaflet/vue-leaflet | Interactive map |
| CARTO Voyager tiles | Warm-toned basemap (OpenStreetMap data, no API key) |
| GSAP 3 + ScrollTrigger + SplitText | All animation: scroll scenes, staggers, mouse-follow |
| Lenis | Smooth scrolling, synced to ScrollTrigger |
| Photon (komoot) | Free geocoding for the add-pin location search |
| Google Fonts | Modak (display), Graduate (varsity labels), Nunito (body) |

Design tokens (colors, type, spacing, motion) are defined once in `src/assets/main.css` and used by every component.

## Project Setup

Requires Node 22 (via nvm: `nvm use 22`).

```sh
npm install
```

### Run the dev server

```sh
npm run dev
```

### Build for production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

### Notes

- The homepage's illustrated map expects an image at `public/photos/kc-illustrated-map.png` (generated artwork, not committed by the build).
- The add-pin form submits to a backend API at `http://localhost:8000/api/pins/` — the map and detail pages work fine without it (mock data lives in `src/data/pins.js`), but submitting a new pin requires the backend to be running. The backend is not on my github for privacy reasons, but soon the application will be hosted on a live URL that I will link.
- Photo upload to permanent storage (Cloudinary) is planned but not wired up yet — photos can be selected in the form but aren't uploaded.
