# The Fountain City Atlas — Design System

An Art Deco redesign of the KC Intern Map, channeling downtown Kansas City's skyline at
dusk: the Power & Light Building's glowing lantern, Bartle Hall's sky stations, Liberty
Memorial, the Kauffman Center shells, and the City of Fountains itself.

## Brand

- **Name:** *The Fountain City Atlas* (Kansas City has more fountains than any city but
  Rome; "Paris of the Plains" was its 1920s nickname). "KC Intern Map" survives as the
  sub-brand line in the NavBar and footer.
- **Wordmark:** three-tier lockup — italic *The* (Cormorant Garamond) / **FOUNTAIN CITY**
  (Limelight, gold gradient) / ◆ ATLAS ◆ (Josefin Sans, 0.55em tracking).
- **Motifs:** octagonal "gem-cut" corners (via `clip-path`), diamond glyphs, sunburst
  fans, double hairline rules, corner brackets, a faint 45° diamond lattice over the page.

## Themes

Both themes live as CSS custom properties on `:root[data-theme]` in
[src/assets/deco.css](src/assets/deco.css). The choice persists in
`localStorage('fca-theme')`, is applied pre-paint by an inline script in
[index.html](index.html), and defaults to the OS preference. Toggle logic:
[src/composables/useTheme.js](src/composables/useTheme.js) +
[src/components/ThemeToggle.vue](src/components/ThemeToggle.vue).

### Skyline at Dusk (dark — signature)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a101f` | midnight navy page |
| `--surface` / `--surface-2` | `#121d34` / `#182642` | cards, popup, navbar |
| `--ink` / `--ink-soft` / `--ink-faint` | `#f0e6cf` / `#cbbd9e` / `#8f846a` | champagne text ramp |
| `--gold` / `--gold-bright` / `--gold-deep` | `#d3ac5f` / `#eed398` / `#9d7a2f` | brass accent ramp |
| `--emerald` | `#46a78d` | success ("location marked") |
| `--star` | `#e9c76f` | ratings |
| `--line` / `--line-soft` | gold @ 34% / 15% | hairlines, frames |

### Daylight Parchment (light)

Cream field `#f3ebda`, surfaces `#faf5e9`, navy ink `#22304e`, darkened brass
`#8f6b1e`–`#6f5316` for contrast on cream, emerald `#1e7a62`, stars `#a87e22`.
`.btn-gold` gets a dedicated brighter brass plate (`#e3c06c → #9a7523`) because the token
golds run muddy as fills on parchment.

## Typography

Loaded from Google Fonts in `index.html`:

- **Limelight** (`--font-display`) — wordmark, brand, footer mark. Marquee glamour; always
  uppercase + letterspaced.
- **Marcellus** (`--font-heading`) — headings, place names, page titles, step titles.
- **Josefin Sans** (`--font-body`) — body, UI, labels, buttons. Geometric 1920s sans;
  weight 300 for body copy, 600 + uppercase + tracking for labels.
- **Cormorant Garamond italic** (`--font-editorial`) — taglines, descriptions, "The Word."

Label conventions: `.eyebrow` (0.72rem, 0.32em tracking, gold), `.deco-rule-label`
(label between fading hairlines). Buttons: 0.82rem, 0.14em tracking, uppercase.

## Components (deco.css)

- `.btn` — octagon-clipped, letterspaced. `.btn-gold` (gradient brass plate, dark text) is
  the primary; `.btn-ghost` (gold outline) the secondary. Hover: lift 2px + gold glow.
- `.deco-frame` — 1px gold border + inset second hairline (`::before` at `inset: 5px`).
- `.deco-corners` — gold L-brackets at all four corners via 8 background gradients.
- `.deco-card` — surface + hairline + shadow; hover lifts 4px, border turns gold, glow.
- `.deco-diamond`, `.deco-rule-label`, `.deco-chevrons` (zigzag band),
  [DecoDivider.vue](src/components/DecoDivider.vue) (sunburst-over-diamond divider).
- **Map furniture:** zoom controls and attribution restyled to surface/gold; tiles get a
  theme filter — dark: `invert(1) hue-rotate(196deg) … sepia(0.22)` (navy night map),
  light: `sepia(0.3) …` (parchment map). Tile source is untouched.
- **`.deco-pin`** — custom Leaflet divIcon: gem-cut kite SVG, navy fill + gold stroke,
  drop-in animation, hover scale. Used on the main map and the detail mini-map.

## Motion

- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`; durations 200 / 400 / 700ms.
- **Entrances:** `rise-in` (fade + 24px rise). Hero items stagger via `--d` delays
  (100→700ms); PinDetail sections stagger 0→420ms.
- **Scroll reveal:** `.reveal` + IntersectionObserver adds `.is-visible`
  (staggered with `--reveal-delay`).
- **Route transitions:** `<Transition name="page" mode="out-in">` in App.vue —
  350ms fade/rise in, 200ms fade out.
- **Hero ambient:** three SVG parallax layers (0.04 / 0.09 / 0.16 × scrollY, rAF-throttled),
  ray fan "breathing" (14s), twinkling windows and stars (staggered `twinkle`),
  glowing lantern, floating scroll cue.
- All motion is disabled under `prefers-reduced-motion`.

## Depth (3D)

- **`v-tilt` directive** ([src/directives/tilt.js](src/directives/tilt.js)) — pointer-tracked
  3D tilt (±6° via `perspective(950px) rotateX/rotateY`) with a gold sheen that follows the
  cursor (`.tilt::after` radial gradient) and a hover lift. `transform-style: preserve-3d`
  lets children float above the card: `.lift-1` (+18px Z) on photo frames and numerals,
  `.lift-2` (+32px Z) on step icons. Applied to the home page's step and collection cards.
  Skipped entirely on touch devices and under reduced motion.
- **Extrusion** — `.btn-gold` and the wordmark get marquee-letter depth from stacked
  `drop-shadow` filters (crisp brass edge + soft throw shadow); `drop-shadow` rather than
  `box-shadow` so the extrusion follows the octagonal `clip-path`. Buttons press down 2px
  on `:active` with a collapsed extrusion.
- **Relief** — cards, the popup, and the form panel carry an inset gold top highlight
  (embossed plate); form inputs get an inset well shadow (engraved).
- **Skyline mouse parallax** — the three skyline layers also pursue the pointer
  (−10/−22/−36px X, −5/−10/−16px Y at viewport edges) with a 600ms eased chase, layered on
  top of the scroll parallax.
- **3D transitions** — carousel photos cross-turn in 3D (`rotateY` ±12–16° inside a
  `perspective: 1100px` window), the pin popup tips up into place (`rotateX(7deg)` from the
  bottom edge), and route changes enter with a 2° `rotateX` from the top.

## Screens

- **Home** ([HomeView.vue](src/views/HomeView.vue)) — full-viewport hero over the layered
  skyline illustration ([SkylineHero.vue](src/components/SkylineHero.vue)), wordmark,
  editorial tagline, dual CTAs; "How the Atlas Works" (Roman-numeral deco cards);
  "From the Collection" (real pins, sepia-framed photos); chevron-band closing CTA; footer.
- **Map** (`/map`) — full-bleed themed map, gold pins, corner-bracket frame overlay,
  "places pinned" chip.
- **Pin Popup** — bottom sheet on mobile / centered plaque on desktop, gilded frame,
  entrance slide.
- **Pin Detail** — exhibition-framed carousel (gem-cut arrows, plaque counter, diamond
  dots), centered title + stars + sunburst divider, ruled section labels ("The Word,"
  "Insider Tips," "Where to Find It"), framed mini-map, brass Google Maps button.
- **Add Pin** (`/add`) — "Leave Your Mark": double-framed panel, tracked gold labels,
  parchment/navy inputs with gold focus glow, oversized star selector, brass submit.

## Routing note

The map moved from `/` to `/map` to make room for the home page; the NavBar back button
and post-submit redirect now point at `/map`. All other logic, components, and data are
untouched.
