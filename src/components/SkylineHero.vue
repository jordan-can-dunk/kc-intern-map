<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

/*
 * Stylized Art Deco skyline of Kansas City, drawn as layered SVG:
 * Liberty Memorial, the Kauffman Center shells, the Power & Light
 * Building (glowing lantern crown), One Kansas City Place, and the
 * Bartle Hall pylons — with a City of Fountains fountain up front.
 * Layers drift at different speeds on scroll (parallax).
 */

// Upward fan of sunburst rays behind the skyline
const rayAngles = Array.from({ length: 13 }, (_, i) => -90 + i * 15)

// Night sky stars: [x, y, radius, animation delay (s)]
const stars = [
  [90, 90, 1.6, 0], [210, 170, 1.1, 1.2], [330, 60, 1.4, 2.1], [470, 140, 1.0, 0.6],
  [590, 70, 1.5, 1.7], [780, 110, 1.2, 0.3], [900, 55, 1.6, 2.6], [1030, 150, 1.0, 1.0],
  [1150, 80, 1.4, 1.9], [1280, 130, 1.2, 0.8], [1380, 60, 1.5, 2.3], [680, 40, 1.0, 1.4],
]

function windowGrid(x0, y0, cols, rows, dx, dy, w = 6, h = 9) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: x0 + c * dx,
        y: y0 + r * dy,
        w,
        h,
        // deterministic sparkle: roughly one window in four twinkles
        twinkle: (r * 7 + c * 3) % 4 === 0,
        delay: ((r * 5 + c * 11) % 9) * 0.55,
      })
    }
  }
  return cells
}

const windows = [
  ...windowGrid(700, 312, 4, 6, 12, 26),        // Power & Light shaft
  ...windowGrid(676, 486, 8, 5, 13, 26),        // Power & Light base
  ...windowGrid(834, 282, 4, 11, 13, 28, 5, 11), // One Kansas City Place
  ...windowGrid(1250, 420, 4, 7, 13, 26),       // right-side tower
  ...windowGrid(60, 450, 4, 6, 13, 26),         // left-side tower
]

const parallax = ref(0)
const mouseX = ref(0) // -0.5 .. 0.5 across the viewport
const mouseY = ref(0)
let rafId = null
let mouseRaf = null
let reduceMotion = false

function onScroll() {
  if (rafId || reduceMotion) return
  rafId = requestAnimationFrame(() => {
    parallax.value = Math.min(window.scrollY, 900)
    rafId = null
  })
}

function onPointer(e) {
  if (mouseRaf) return
  mouseRaf = requestAnimationFrame(() => {
    mouseX.value = e.clientX / window.innerWidth - 0.5
    mouseY.value = e.clientY / window.innerHeight - 0.5
    mouseRaf = null
  })
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', onScroll, { passive: true })
  if (!reduceMotion && !window.matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('pointermove', onPointer, { passive: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointer)
  if (rafId) cancelAnimationFrame(rafId)
  if (mouseRaf) cancelAnimationFrame(mouseRaf)
})
</script>

<template>
  <svg
    class="skyline"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    :style="{ '--p': parallax, '--mx': mouseX, '--my': mouseY }"
  >
    <defs>
      <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--sky-top)" />
        <stop offset="0.64" stop-color="var(--sky-mid)" />
        <stop offset="0.85" stop-color="var(--sky-plum)" />
        <stop offset="1" stop-color="var(--sky-horizon)" />
      </linearGradient>
      <radialGradient id="sun-grad" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="var(--sun-core)" stop-opacity="0.95" />
        <stop offset="0.55" stop-color="var(--sun-core)" stop-opacity="0.35" />
        <stop offset="1" stop-color="var(--sun-core)" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Dusk sky -->
    <rect width="1440" height="900" fill="url(#sky-grad)" />

    <!-- Stars (evening theme only) -->
    <g class="sky-stars">
      <circle
        v-for="([x, y, r, d], i) in stars"
        :key="i"
        class="sky-star"
        :cx="x" :cy="y" :r="r"
        :style="{ animationDelay: d + 's' }"
      />
    </g>

    <!-- The city sits in the lower 620 units; the extra sky above keeps the
         skyline from towering over the hero copy on tall or narrow screens -->
    <g transform="translate(0 280)">
    <!-- Sunburst fan rising behind downtown -->
    <g class="rays">
      <path
        v-for="a in rayAngles"
        :key="a"
        d="M720 470 L710 88 L730 88 Z"
        :transform="`rotate(${a} 720 470)`"
      />
    </g>
    <circle cx="720" cy="470" r="130" fill="url(#sun-grad)" />

    <!-- BACK layer: distant blocks -->
    <g class="layer layer-back">
      <path
        fill="var(--bldg-back)"
        d="M0 620 V430 h48 v-36 h40 v58 h56 v-84 h44 v46 h60 v-30 h50 v72 h70 v-48 h52 v30 h64 v-58 h46 v84
           h76 v-40 h58 v26 h72 v-64 h50 v48 h66 v-26 h58 v52 h78 v-70 h48 v42 h70 v-24 h54 v58 h64 v-36 h52 v36 h64 V620 Z"
      />
    </g>

    <!-- MID layer: the landmarks -->
    <g class="layer layer-mid">
      <g fill="var(--bldg-mid)">
        <!-- Left filler tower -->
        <path d="M46 620 V440 h8 v-16 h44 v16 h8 V620 Z" />
        <!-- Liberty Memorial: base + tapered shaft -->
        <path d="M150 620 v-44 h30 v-16 h120 v16 h30 v44 Z" />
        <path d="M226 560 L233 258 h14 L254 560 Z" />
        <rect x="229" y="240" width="22" height="18" />
        <!-- Kauffman Center: nested shells -->
        <path d="M420 620 A115 165 0 0 1 650 620 Z" />
        <path d="M478 620 A88 130 0 0 1 654 620 Z" opacity="0.75" />
        <!-- Power & Light Building: stepped ziggurat + lantern crown -->
        <path
          d="M660 620 V478 h12 v-46 h12 v-42 h12 v-88 h12 v-40 h12 v-30 h20 v30 h12 v40 h12 v88 h12 v42 h12 v46 h12 V620 Z"
        />
        <rect x="712" y="200" width="16" height="34" />
        <line x1="720" y1="152" x2="720" y2="200" stroke="var(--bldg-mid)" stroke-width="3" />
        <!-- One Kansas City Place -->
        <path d="M818 620 V276 l10 -12 v-22 h44 v22 l10 12 V620 Z" />
        <!-- Bartle Hall pylons with sky stations -->
        <g>
          <rect x="1008" y="352" width="9" height="268" />
          <rect x="1072" y="336" width="9" height="284" />
          <rect x="1136" y="336" width="9" height="284" />
          <rect x="1200" y="352" width="9" height="268" />
          <path d="M1012.5 328 l12 12 -12 12 -12 -12 Z" />
          <path d="M1076.5 306 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6 Z" />
          <path d="M1140.5 310 a13 13 0 1 1 -0.1 0 Z" />
          <path d="M1204.5 330 l11 11 -11 11 -11 -11 Z" />
        </g>
        <!-- Right filler tower -->
        <path d="M1240 620 V412 h10 v-18 h48 v18 h10 V620 Z" />
        <path d="M1330 620 V470 h60 V620 Z" />
      </g>

      <!-- Lantern crown + memorial flame, glowing -->
      <rect class="lantern" x="713" y="202" width="14" height="20" />
      <circle class="lantern" cx="240" cy="236" r="6" />

      <!-- Lit windows -->
      <g class="windows">
        <rect
          v-for="(w, i) in windows"
          :key="i"
          :class="['win', { tw: w.twinkle }]"
          :x="w.x" :y="w.y" :width="w.w" :height="w.h"
          :style="w.twinkle ? { animationDelay: w.delay + 's' } : null"
        />
      </g>
    </g>

    <!-- FRONT layer: low rooftops + the fountain -->
    <g class="layer layer-front">
      <path
        fill="var(--bldg-front)"
        d="M0 620 V560 h90 v-24 h70 v34 h110 v-20 h90 v28 h140 v-18 h120 v18 h150 v-26 h110 v30 h130 v-20 h100 v24 h110 v-30 h90 v24 h130 V620 Z"
      />
      <!-- City of Fountains -->
      <g class="fountain">
        <ellipse cx="720" cy="606" rx="112" ry="12" fill="var(--bldg-front)" />
        <rect x="712" y="560" width="16" height="42" fill="var(--bldg-front)" />
        <path class="water" d="M720 560 C 720 528 718 516 720 506" />
        <path class="water" d="M720 556 C 690 540 668 556 656 586" />
        <path class="water" d="M720 556 C 750 540 772 556 784 586" />
        <path class="water" d="M720 560 C 700 550 686 562 678 584" opacity="0.6" />
        <path class="water" d="M720 560 C 740 550 754 562 762 584" opacity="0.6" />
      </g>
    </g>
    </g>
  </svg>
</template>

<style scoped>
.skyline {
  display: block;
  width: 100%;
  height: 100%;
}

.layer {
  will-change: transform;
  /* eased pursuit of the pointer, instant response to scroll */
  transition: transform 600ms cubic-bezier(0.25, 0.6, 0.35, 1);
}

.layer-back {
  transform: translate3d(
    calc(var(--mx, 0) * -10px),
    calc(var(--p, 0) * 0.04px + var(--my, 0) * -5px),
    0
  );
}

.layer-mid {
  transform: translate3d(
    calc(var(--mx, 0) * -22px),
    calc(var(--p, 0) * 0.09px + var(--my, 0) * -10px),
    0
  );
}

.layer-front {
  transform: translate3d(
    calc(var(--mx, 0) * -36px),
    calc(var(--p, 0) * 0.16px + var(--my, 0) * -16px),
    0
  );
}

.rays path {
  fill: var(--ray);
}

.rays {
  /* fill-box puts the origin at the fan's hinge regardless of the parent translate */
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: rays-breathe 14s ease-in-out infinite;
}

@keyframes rays-breathe {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
}

.sky-star {
  fill: var(--gold-bright);
  animation: twinkle 4.5s ease-in-out infinite;
}

[data-theme='light'] .sky-star {
  display: none;
}

.win {
  fill: var(--window);
  opacity: 0.85;
}

.win.tw {
  animation: twinkle 5s ease-in-out infinite;
}

[data-theme='light'] .win {
  animation: none;
  opacity: 0.55;
}

.lantern {
  fill: var(--window);
  filter: drop-shadow(0 0 8px var(--sun-core));
  animation: twinkle 7s ease-in-out infinite;
}

.water {
  fill: none;
  stroke: var(--gold);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .layer {
    transform: none !important;
  }
}
</style>
