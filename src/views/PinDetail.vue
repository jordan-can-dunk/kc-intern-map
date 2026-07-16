<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { pins } from '../data/pins.js'
import DecoDivider from '../components/DecoDivider.vue'

const route = useRoute()

const pin = pins.find(p => p.id === Number(route.params.id))
/*route.params.id reads :id from route(current URL) so if the URL is /pin/5, route.params.id will be 5
Number() converts string to number becasue URL params are always strings
pins.find loops through every pin and returns first pin where condition is true
p =>is just a nickname for each pin in the array
full consdition is find the pin whose id matches number from URL */

const currentIndex = ref(0)
/* tracks which photo the carousel is showing */

function prevPhoto() {
  currentIndex.value = currentIndex.value - 1
}

function nextPhoto() {
  currentIndex.value = currentIndex.value + 1
}
</script>

<template>
  <div class="detail-container">

    <div class="carousel deco-corners rise" style="--d: 0ms">
      <div class="carousel-window">
        <Transition name="photo-turn">
          <img :key="currentIndex" :src="pin.photos[currentIndex]" :alt="pin.name" class="carousel-photo" />
        </Transition>

        <button class="carousel-btn prev" v-if="currentIndex > 0" aria-label="Previous photo" @click="prevPhoto">‹</button>
        <button class="carousel-btn next" v-if="currentIndex < pin.photos.length - 1" aria-label="Next photo" @click="nextPhoto">›</button>

        <span class="carousel-counter">{{ currentIndex + 1 }} ∕ {{ pin.photos.length }}</span> <!--turns array counting into normal counting so in arry 0 but it shows 1 -->
      </div>

      <div class="carousel-dots" v-if="pin.photos.length > 1">
        <span
          v-for="(photo, index) in pin.photos"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
        />
          <!-- span is self-closing and its used to style a specific something or loop something -->
      </div>
    </div>

    <div class="info-section">
      <header class="place-header rise" style="--d: 90ms">
        <h1 class="place-name">{{ pin.name }}</h1>
        <div class="place-rating" :aria-label="`Rated ${pin.rating} of 5`">
          <span v-for="n in pin.rating" :key="n">★</span>
          <span v-for="n in (5 - pin.rating)" :key="'empty-' + n">☆</span>
        </div>
        <DecoDivider class="place-divider" />
      </header>

      <div class="section rise" style="--d: 180ms">
        <h2 class="section-label deco-rule-label">The Word</h2>
        <p class="section-text editorial">{{ pin.description }}</p>
      </div>

      <div class="section rise" style="--d: 260ms" v-if="pin.tips">
        <h2 class="section-label deco-rule-label">Insider Tips</h2>
        <p class="section-text">{{ pin.tips }}</p>
      </div>

      <div class="section rise" style="--d: 340ms">
        <h2 class="section-label deco-rule-label">Where to Find It</h2>
        <div class="mini-map-container deco-frame">
          <l-map :zoom="14" :center="[pin.lat, pin.lng]" :zoom-control="false" style="height: 100%;">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <l-marker :lat-lng="[pin.lat, pin.lng]">
              <l-icon :icon-size="[34, 44]" :icon-anchor="[17, 42]" class-name="deco-marker">
                <div class="deco-pin">
                  <svg viewBox="0 0 34 44">
                    <path
                      d="M17 1 L31 18 L17 43 L3 18 Z"
                      fill="var(--surface)"
                      stroke="var(--gold)"
                      stroke-width="2"
                    />
                    <path d="M17 9 L25 18.5 L17 33 L9 18.5 Z" fill="var(--gold)" />
                    <circle cx="17" cy="18.5" r="2.4" fill="var(--surface)" />
                  </svg>
                </div>
              </l-icon>
            </l-marker>
          </l-map>
        </div>
        <a
          class="maps-btn btn btn-gold"
          :href="`https://www.google.com/maps?q=${pin.lat},${pin.lng}`"
          target="_blank"
        >
          Open in Google Maps <span aria-hidden="true">↗</span>
        </a>
      </div>

      <p class="submitted-by rise" style="--d: 420ms">
        Pinned by <em>{{ pin.submittedBy || 'Anonymous' }}</em> &middot; {{ pin.submittedAt }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 680px;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 2.5rem) 1rem 3.5rem;
}

/* Staggered entrance */
.rise {
  animation: rise-in 700ms var(--ease-out) both;
  animation-delay: var(--d, 0ms);
}

/* Carousel — a gilded exhibition frame */
.carousel {
  position: relative;
  width: 100%;
  padding: 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-soft);
}

.carousel-window {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  perspective: 1100px; /* photos turn in 3D as they swap */
}

.carousel-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-turn-enter-active {
  transition: transform 480ms var(--ease-out), opacity 480ms ease;
}

.photo-turn-leave-active {
  transition: transform 240ms ease, opacity 240ms ease;
}

.photo-turn-enter-from {
  opacity: 0;
  transform: rotateY(16deg) scale(0.97) translateX(26px);
}

.photo-turn-leave-to {
  opacity: 0;
  transform: rotateY(-12deg) scale(0.97) translateX(-26px);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  color: var(--gold-bright);
  border: 1px solid var(--line);
  font-size: 1.6rem;
  font-family: var(--font-heading);
  width: 2.6rem;
  height: 2.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(
    8px 0, calc(100% - 8px) 0, 100% 8px,
    100% calc(100% - 8px), calc(100% - 8px) 100%,
    8px 100%, 0 calc(100% - 8px), 0 8px
  );
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

.carousel-btn:hover {
  background: color-mix(in srgb, var(--bg) 90%, transparent);
  color: var(--gold);
}

.prev { left: 0.9rem; }
.next { right: 0.9rem; }

.carousel-counter {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  border: 1px solid var(--line-soft);
  color: var(--gold-bright);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  padding: 0.32rem 0.6rem 0.22rem;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  padding: 0.85rem 0 0.35rem;
}

/* Diamond-cut dots */
.dot {
  width: 7px;
  height: 7px;
  transform: rotate(45deg);
  border: 1px solid var(--gold);
  background: transparent;
  transition: background-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

.dot.active {
  background: var(--gold);
  box-shadow: var(--glow-gold);
}

/* Info Section */
.info-section {
  padding: 2rem 0.25rem 0;
}

.place-header {
  text-align: center;
  margin-bottom: 2rem;
}

.place-name {
  font-family: var(--font-heading);
  font-size: clamp(1.7rem, 5vw, 2.3rem);
  letter-spacing: 0.02em;
  margin-bottom: 0.6rem;
}

.place-rating {
  color: var(--star);
  font-size: 1.15rem;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  margin-bottom: 1.1rem;
}

.section {
  margin-bottom: 2rem;
}

.section-label {
  margin-bottom: 0.9rem;
}

.section-text {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.75;
  color: var(--ink-soft);
}

.section-text.editorial {
  font-size: 1.18rem;
  line-height: 1.6;
  color: var(--ink);
}

.submitted-by {
  text-align: center;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  margin-top: 2.4rem;
  padding-top: 1.3rem;
  border-top: 1px solid var(--line-soft);
}

.submitted-by em {
  font-family: var(--font-editorial);
  font-size: 0.95rem;
  color: var(--ink-soft);
}

/* Mini Map */
.mini-map-container {
  height: 210px;
  overflow: hidden;
  margin-bottom: 1.1rem;
  box-shadow: var(--shadow-soft);
}

.mini-map-container::before {
  z-index: 800; /* keep the double-rule frame above the tiles */
}

.maps-btn {
  font-size: 0.76rem;
}
</style>
