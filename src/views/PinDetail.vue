<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { gsap } from 'gsap'

const route = useRoute()
const router = useRouter()
const root = ref(null)
const pin = ref(null)
const notFound = ref(false)

const currentIndex = ref(0)
const imgLoaded = ref(false)
const showPlaceholder = ref(false)
const PLACEHOLDER_DELAY = 400 // ms a photo must still be loading before we show the placeholder
let imgTimer
let ctx

// start (or restart) tracking the current photo's load. Show the placeholder
// only if it's STILL loading after PLACEHOLDER_DELAY, so quick/cached swaps
// don't flash it.
function startImgLoad() {
  imgLoaded.value = false
  clearTimeout(imgTimer)
  imgTimer = setTimeout(() => {
    if (!imgLoaded.value) showPlaceholder.value = true
  }, PLACEHOLDER_DELAY)
}

function onImgLoad() {
  imgLoaded.value = true
  clearTimeout(imgTimer)
  showPlaceholder.value = false
}

function prevPhoto() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextPhoto() {
  if (currentIndex.value < pin.value.photos.length - 1) currentIndex.value++
}

/* slide + fade the photo in from the direction you're moving */
watch(currentIndex, (newIdx, oldIdx) => {
  // the browser keeps showing the previous photo until the next one finishes
  // downloading — start tracking the new photo's load so the placeholder can
  // cover the stale image if it takes a moment
  startImgLoad()
  const dir = newIdx > oldIdx ? 1 : -1
  gsap.fromTo(
    '.carousel-photo',
    { autoAlpha: 0.25, x: 44 * dir },
    { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out' },
  )
})

/* swipe support — phones are the primary platform */
let touchStartX = null
function onTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX
}
function onTouchEnd(e) {
  if (touchStartX === null) return
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 40) (dx < 0 ? nextPhoto : prevPhoto)()
  touchStartX = null
}

/* KC heart marker for the mini-map */
const heartIcon = L.divIcon({
  className: 'kc-divicon',
  html: `<div class="kc-pin is-selected">
    <svg viewBox="0 0 100 92" width="100%" height="100%">
      <path d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
        fill="#e31837" stroke="#1e1b18" stroke-width="5"/>
      <text x="34" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">K</text>
      <text x="64" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">C</text>
    </svg>
  </div>`,
  iconSize: [42, 39],
  iconAnchor: [21, 37],
})

// static snapshot feel: no drag/zoom scroll-traps on mobile
const miniMapOptions = {
  zoomControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  touchZoom: false,
  boxZoom: false,
  keyboard: false,
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  const response = await fetch(`http://localhost:8000/api/pins/${route.params.id}/`)
  if (response.ok) {
    pin.value = await response.json()
    startImgLoad()
  } else {
    notFound.value = true
  }

  if (!root.value || !pin.value) return
  await nextTick()
  ctx = gsap.context(() => {
    gsap.from('.reveal', {
      autoAlpha: 0,
      y: 44,
      stagger: 0.09,
      duration: 0.6,
      ease: 'back.out(1.5)',
      clearProps: 'all',
    })
  }, root.value)
})

onUnmounted(() => {
  ctx?.revert()
  clearTimeout(imgTimer)
})
</script>

<template>
  <!-- bad URL guard: /pin/999 shouldn't crash the page -->
  <div v-if="notFound" class="lost">
    <svg viewBox="0 0 100 92" width="72" height="66" aria-hidden="true">
      <path
        d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
        fill="#efdfc5"
        stroke="#1e1b18"
        stroke-width="4"
      />
    </svg>
    <h1 class="lost-title">This pin wandered off.</h1>
    <p>It might have been removed, or the link is off by a digit.</p>
    <button class="btn-kc btn-kc--red" @click="router.push('/map')">Back to the map</button>
  </div>

  <div v-else-if="pin" ref="root" class="detail-container">
    <!-- ============ CAROUSEL ============ -->
    <div class="carousel reveal" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <img
        :src="pin.photos[currentIndex]"
        :alt="`Photo ${currentIndex + 1} of ${pin.name}`"
        class="carousel-photo"
        @load="onImgLoad"
        @error="onImgLoad"
      />

      <!-- covers the (stale) image only if the current one is still loading after a beat -->
      <div v-if="showPlaceholder" class="carousel-loading">
        <svg class="carousel-loading-heart" viewBox="0 0 100 92" width="44" height="40" aria-hidden="true">
          <path
            d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
            fill="#e31837"
            stroke="#1e1b18"
            stroke-width="5"
          />
        </svg>
        <span class="carousel-loading-text">Loading photo…</span>
      </div>

      <button v-if="currentIndex > 0" class="carousel-btn prev" aria-label="Previous photo" @click="prevPhoto">‹</button>
      <button
        v-if="currentIndex < pin.photos.length - 1"
        class="carousel-btn next"
        aria-label="Next photo"
        @click="nextPhoto"
      >
        ›
      </button>

      <span class="carousel-counter">{{ currentIndex + 1 }} / {{ pin.photos.length }}</span>

      <div v-if="pin.photos.length > 1" class="carousel-dots">
        <button
          v-for="(photo, index) in pin.photos"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          :aria-label="`Go to photo ${index + 1}`"
          @click="currentIndex = index"
        />
      </div>
    </div>

    <div class="info-section">
      <div class="reveal">
        <h1 class="place-name">{{ pin.name }}</h1>
        <p class="place-rating" :aria-label="pin.rating + ' out of 5 stars'">
          <span class="stars">{{ '★'.repeat(pin.rating) }}{{ '☆'.repeat(5 - pin.rating) }}</span>
          <span class="rating-label">{{ pin.rating }}/5</span>
        </p>
      </div>

      <div class="section reveal">
        <h2 class="section-label">Description</h2>
        <p class="section-text">{{ pin.description }}</p>
      </div>

      <!-- tips render as a gold sticky note, only when an intern left one -->
      <div v-if="pin.tips" class="section reveal">
        <h2 class="section-label">Intern tip</h2>
        <div class="tip-note">
          <p class="section-text">{{ pin.tips }}</p>
        </div>
      </div>

      <div class="section reveal">
        <h2 class="section-label">Location</h2>
        <div class="mini-map-container">
          <l-map :zoom="15" :center="[pin.lat, pin.lng]" :options="miniMapOptions" style="height: 100%">
            <l-tile-layer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              :options="{ subdomains: 'abcd', maxZoom: 20 }"
            />
            <l-marker :lat-lng="[pin.lat, pin.lng]" :icon="heartIcon" />
          </l-map>
        </div>
        <a
          class="btn-kc btn-kc--red maps-btn"
          :href="`https://www.google.com/maps?q=${pin.lat},${pin.lng}`"
          target="_blank"
          rel="noopener"
        >
          Open in Google Maps ↗
        </a>
      </div>

      <p class="submitted-by reveal">
        <svg viewBox="0 0 100 92" width="15" height="14" aria-hidden="true">
          <path
            d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
            fill="#e31837"
          />
        </svg>
        Pinned by {{ pin.submitted_by || 'Anonymous' }} · {{ formatDate(pin.submitted_at) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--sp-4) var(--sp-3) var(--sp-7);
}

/* ============ carousel ============ */
.carousel {
  position: relative;
  width: 100%;
  border: var(--border-ink);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-ink);
  overflow: hidden;
  background: var(--cream-deep);
}

.carousel-photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

/* placeholder shown while the current photo is still downloading */
.carousel-loading {
  position: absolute;
  inset: 0;
  background: var(--cream-deep);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
}

.carousel-loading-heart {
  animation: carousel-pulse 0.9s var(--ease-bounce) infinite;
  transform-origin: 50% 60%;
}

@keyframes carousel-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.carousel-loading-text {
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.7;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--ink);
  font-size: 1.6rem;
  line-height: 1;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 3px 0 var(--ink);
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-micro) var(--ease-bounce);
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.12);
  box-shadow: 3px 4px 0 var(--ink);
}

.carousel-btn:active {
  transform: translateY(-50%) scale(0.94);
  box-shadow: 0 0 0 var(--ink);
}

.prev {
  left: var(--sp-3);
}

.next {
  right: var(--sp-3);
}

.carousel-counter {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  background: var(--ink);
  color: var(--cream);
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  padding: 5px 12px;
  border-radius: var(--r-pill);
}

.carousel-dots {
  position: absolute;
  bottom: var(--sp-3);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: var(--sp-2);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--paper);
  border: 2px solid var(--ink);
  padding: 0;
  cursor: pointer;
  transition:
    transform var(--t-quick) var(--ease-bounce),
    background var(--t-quick) ease;
}

.dot.active {
  background: var(--kc-red);
  transform: scale(1.35);
}

/* ============ info ============ */
.info-section {
  padding: var(--sp-5) var(--sp-1) 0;
}

.place-name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.9rem, 6vw, 2.6rem);
  line-height: 1.05;
  margin-bottom: var(--sp-2);
}

.place-rating {
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
  margin: 0 0 var(--sp-5);
}

.stars {
  color: var(--kc-gold);
  -webkit-text-stroke: 0.8px var(--ink);
  font-size: 1.3rem;
  letter-spacing: 2px;
}

.rating-label {
  font-family: var(--font-varsity);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
}

.section {
  margin-bottom: var(--sp-5);
}

.section-label {
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  color: var(--kc-royal);
  text-transform: uppercase;
  margin: 0 0 var(--sp-2);
}

.section-text {
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0;
}

/* the intern tip reads like a sticky note left on the fridge */
.tip-note {
  background: var(--kc-gold);
  border: 2px solid var(--ink);
  border-radius: var(--r-chip);
  box-shadow: 3px 3px 0 var(--ink);
  padding: var(--sp-3) var(--sp-4);
  rotate: -0.6deg;
}

/* ============ mini-map ============ */
.mini-map-container {
  height: 200px;
  border: var(--border-ink);
  border-radius: var(--r-card);
  overflow: hidden;
  margin-bottom: var(--sp-3);
  box-shadow: var(--shadow-ink);
  /* leaflet panes stack above page content without this */
  position: relative;
  z-index: 0;
}

.maps-btn {
  display: inline-block;
  text-decoration: none;
  font-size: 0.8rem;
  padding: 12px 24px;
}

.submitted-by {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-varsity);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.75;
  margin: var(--sp-6) 0 0;
}

/* ============ lost pin ============ */
.lost {
  min-height: calc(100dvh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  text-align: center;
  padding: var(--sp-4);
}

.lost-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.8rem, 6vw, 2.6rem);
}

.lost p {
  margin: 0 0 var(--sp-3);
}
</style>
