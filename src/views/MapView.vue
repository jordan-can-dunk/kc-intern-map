<script setup>
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import PinPopup from '../components/PinPopup.vue'

const root = ref(null)
const mapRef = ref(null)
const selectedPin = ref(null)
const expandedKey = ref(null)
const loading = ref(true)
const showLoader = ref(false)
const pins = ref([])

let ctx
let loaderTimer
// the heart drop-in needs TWO things done before it can run: the map must be
// ready (so markers exist in the DOM) and the pins must have loaded (so there
// are markers to animate). Either can finish first, so whichever finishes last
// triggers the drop via dropHearts().
let mapReady = false
let pinsLoaded = false
let heartsDropped = false

function dropHearts() {
  if (heartsDropped || !mapReady || !pinsLoaded) return
  heartsDropped = true
  nextTick(() => {
    gsap.from(root.value.querySelectorAll('.kc-pin'), {
      y: -90,
      autoAlpha: 0,
      stagger: 0.09,
      duration: 0.7,
      delay: 0.45,
      ease: 'back.out(1.7)',
      clearProps: 'all',
    })
  })
}

/* ---- group pins that share exact coordinates, so stacks can fan out ---- */
const groups = computed(() => {
  const byCoord = new Map()
  for (const pin of pins.value) {
    const key = `${pin.lat},${pin.lng}`
    if (!byCoord.has(key)) byCoord.set(key, [])
    byCoord.get(key).push(pin)
  }
  return byCoord
})

// fanned hearts sit on a ring of screen pixels (not meters), so the
// spread looks identical at any zoom level. Hearts are 42px wide, so a
// 26px radius leaves side-by-side pairs almost touching — clearly the
// same spot, but each one tappable.
const SPREAD_PX = 26
const fannedPositions = ref({}) // pin.id -> [lat, lng]

function computeFanPositions(group) {
  const map = mapRef.value?.leafletObject
  if (!map) return
  const centerPt = map.latLngToContainerPoint(L.latLng(group[0].lat, group[0].lng))
  // 2 pins fan left/right; 3+ fan in a full ring starting at the top
  const startAngle = group.length === 2 ? 0 : -Math.PI / 2
  const positions = {}
  group.forEach((pin, i) => {
    const angle = startAngle + (i / group.length) * Math.PI * 2
    const pt = L.point(centerPt.x + Math.cos(angle) * SPREAD_PX, centerPt.y + Math.sin(angle) * SPREAD_PX)
    const ll = map.containerPointToLatLng(pt)
    positions[pin.id] = [ll.lat, ll.lng]
  })
  fannedPositions.value = positions
}

const markers = computed(() => {
  const out = []
  for (const [key, group] of groups.value) {
    const [lat, lng] = [group[0].lat, group[0].lng]
    if (group.length === 1) {
      out.push({ type: 'single', pin: group[0], latLng: [lat, lng], key: `pin-${group[0].id}` })
    } else if (expandedKey.value === key) {
      group.forEach((pin, i) => {
        out.push({
          type: 'fanned',
          pin,
          popIdx: i,
          latLng: fannedPositions.value[pin.id] ?? [lat, lng],
          key: `pin-${pin.id}`,
        })
      })
    } else {
      out.push({ type: 'stack', groupKey: key, count: group.length, latLng: [lat, lng], key: `stack-${key}` })
    }
  }
  return out
})

/* ---- KC heart icons (divIcon = real DOM we can style + animate) ---- */
const HEART_SVG = `
<svg viewBox="0 0 100 92" width="100%" height="100%">
  <path d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
    fill="#e31837" stroke="#1e1b18" stroke-width="5"/>
  <text x="34" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">K</text>
  <text x="64" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">C</text>
</svg>`

function heartIcon(pin, popIdx = null) {
  const selected = selectedPin.value?.id === pin.id
  const cls = ['kc-pin', selected ? 'is-selected' : '', popIdx !== null ? 'pop-in' : ''].join(' ')
  const delay = popIdx !== null ? `style="animation-delay:${popIdx * 70}ms"` : ''
  return L.divIcon({
    className: 'kc-divicon',
    html: `<div class="${cls}" ${delay}>${HEART_SVG}</div>`,
    iconSize: [42, 39],
    iconAnchor: [21, 37],
  })
}

function stackIcon(count) {
  return L.divIcon({
    className: 'kc-divicon',
    html: `
      <div class="kc-pin kc-stack" aria-label="${count} pins here">
        <div class="stack-heart stack-back">${HEART_SVG}</div>
        <div class="stack-heart stack-front">${HEART_SVG}</div>
      </div>`,
    iconSize: [50, 44],
    iconAnchor: [25, 40],
  })
}

/* ---- interactions ---- */
function onMarkerClick(m) {
  if (m.type === 'stack') {
    computeFanPositions(groups.value.get(m.groupKey))
    expandedKey.value = m.groupKey
  } else {
    selectedPin.value = m.pin
  }
}

function onMapClick() {
  expandedKey.value = null
  fannedPositions.value = {}
}

function onMapReady() {
  clearTimeout(loaderTimer)
  // pixel offsets mean something different at every zoom level, so
  // re-space an open fan whenever the zoom changes
  mapRef.value?.leafletObject?.on('zoomend', () => {
    if (expandedKey.value) computeFanPositions(groups.value.get(expandedKey.value))
  })
  // let the first tiles paint, then fade the loader (if it ever showed)
  nextTick(() => {
    if (showLoader.value) {
      gsap.to('.map-loader', {
        autoAlpha: 0,
        duration: 0.4,
        delay: 0.3,
        onComplete: () => {
          loading.value = false
          showLoader.value = false
        },
      })
    } else {
      loading.value = false
    }
  })
  mapReady = true
  dropHearts()
}

function zoom(dir) {
  const map = mapRef.value?.leafletObject
  if (!map) return
  dir > 0 ? map.zoomIn() : map.zoomOut()
}

/* ---- popup enter/leave (GSAP drives the Transition hooks) ---- */
function popupEnter(el, done) {
  const card = el.querySelector('.popup-card')
  gsap.fromTo(el, { backgroundColor: 'rgba(30,27,24,0)' }, { backgroundColor: 'rgba(30,27,24,0.35)', duration: 0.3 })
  gsap.fromTo(card, { y: '115%' }, { y: 0, duration: 0.55, ease: 'back.out(1.4)', onComplete: done })
}

function popupLeave(el, done) {
  const card = el.querySelector('.popup-card')
  gsap.to(el, { backgroundColor: 'rgba(30,27,24,0)', duration: 0.25 })
  gsap.to(card, { y: '115%', duration: 0.3, ease: 'power2.in', onComplete: done })
}

onMounted(async () => {
  ctx = gsap.context(() => {}, root.value)
  loaderTimer = setTimeout(() => {
    if (loading.value) showLoader.value = true
  }, 250)
  const response = await fetch('http://localhost:8000/api/pins/')
  pins.value = await response.json()
  pinsLoaded = true
  dropHearts()
})

onUnmounted(() => {
  ctx?.revert()
  clearTimeout(loaderTimer)
})
</script>

<template>
  <div ref="root" class="map-shell">
    <l-map
      ref="mapRef"
      :zoom="12"
      :center="[39.0997, -94.5786]"
      :options="{ zoomControl: false }"
      @ready="onMapReady"
      @click="onMapClick"
    >
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        :options="{ subdomains: 'abcd', maxZoom: 20 }"
      />
      <l-marker
        v-for="m in markers"
        :key="m.key"
        :lat-lng="m.latLng"
        :icon="m.type === 'stack' ? stackIcon(m.count) : heartIcon(m.pin, m.type === 'fanned' ? m.popIdx : null)"
        @click="onMarkerClick(m)"
      />
    </l-map>

    <!-- loader -->
    <div v-if="showLoader" class="map-loader">
      <svg class="loader-heart" viewBox="0 0 100 92" width="64" height="59">
        <path
          d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
          fill="#e31837"
          stroke="#1e1b18"
          stroke-width="4"
        />
      </svg>
      <p class="loader-text">Loading the good stuff…</p>
    </div>

    <!-- playful chrome -->
    <div class="zoom-stack">
      <button class="zoom-btn" aria-label="Zoom in" @click="zoom(1)">+</button>
      <button class="zoom-btn" aria-label="Zoom out" @click="zoom(-1)">−</button>
    </div>
    <div class="legend-chip" aria-hidden="true">
      <svg viewBox="0 0 100 92" width="18" height="17">
        <path
          d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
          fill="#e31837"
          stroke="#1e1b18"
          stroke-width="6"
        />
      </svg>
      = an intern's favorite spot
    </div>

    <Transition :css="false" @enter="popupEnter" @leave="popupLeave">
      <PinPopup v-if="selectedPin" :pin="selectedPin" @close="selectedPin = null" />
    </Transition>
  </div>
</template>

<style scoped>
.map-shell {
  position: relative;
  height: calc(100dvh - 60px);
  width: 100%;
}

.map-loader {
  position: absolute;
  inset: 0;
  z-index: 900;
  background: var(--cream);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
}

.loader-heart {
  animation: loader-pulse 0.9s var(--ease-bounce) infinite;
  transform-origin: 50% 60%;
}

@keyframes loader-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}

.loader-text {
  font-family: var(--font-varsity);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0;
}

.zoom-stack {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  z-index: 800;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.zoom-btn {
  width: 44px;
  height: 44px;
  font-size: 1.4rem;
  font-weight: 800;
  font-family: var(--font-body);
  background: var(--kc-gold);
  color: var(--ink);
  border: var(--border-ink);
  border-radius: var(--r-chip);
  box-shadow: 3px 3px 0 var(--ink);
  cursor: pointer;
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-micro) var(--ease-bounce);
}

.zoom-btn:hover {
  transform: translate(-1px, -2px);
  box-shadow: 4px 5px 0 var(--ink);
}

.zoom-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 var(--ink);
}

.legend-chip {
  position: absolute;
  bottom: var(--sp-4);
  left: var(--sp-3);
  z-index: 800;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-pill);
  box-shadow: 3px 3px 0 var(--ink);
  padding: 6px 14px;
  font-family: var(--font-varsity);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>

<!-- unscoped: divIcon markup lives outside this component's scope.
     Shared .kc-pin styles live in assets/main.css so PinDetail's
     mini-map heart works even on direct navigation. -->
<style>
/* stacked deck: two fanned hearts hint there's more than one */
.kc-stack {
  position: relative;
}

.stack-heart {
  position: absolute;
  inset: 0;
}

.stack-back {
  transform: rotate(-14deg) translate(-6px, -2px);
  opacity: 0.85;
}

.stack-front {
  transform: rotate(6deg);
}

.kc-stack:hover {
  transform: scale(1.12);
}

.kc-stack:hover .stack-back {
  transform: rotate(-22deg) translate(-10px, -3px);
}

.kc-stack:hover .stack-front {
  transform: rotate(10deg) translate(3px, 0);
}

.stack-heart {
  transition: transform var(--t-quick) var(--ease-bounce);
}
</style>
