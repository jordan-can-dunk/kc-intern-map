<script setup>
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { pins } from '../data/pins.js'
import { ref } from 'vue'
import PinPopup from '../components/PinPopup.vue'

const selectedPin = ref(null)
</script>

<template>
  <div class="map-container">
    <l-map :zoom="12" :center="[39.0997, -94.5786]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <l-marker
        v-for="pin in pins"
        :key="pin.id"
        :lat-lng="[pin.lat, pin.lng]"
        @click="selectedPin = pin"
      >
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

    <!-- Gilded frame over the map -->
    <div class="map-frame deco-corners" aria-hidden="true" />

    <p class="map-legend">
      <span class="deco-diamond" aria-hidden="true" />
      {{ pins.length }} places pinned by interns
    </p>

    <PinPopup
      v-if="selectedPin"
      :pin="selectedPin"
      @close="selectedPin = null"
    /><!--
    only show when selectedPin is not null.
    :pin passes selected pin's data down to PinPopup as prop.
    @close listens for PinPopup's close emit and resets selectedPin to null to hide popup
    -->
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: calc(100vh - var(--nav-h));
  height: calc(100dvh - var(--nav-h));
  width: 100%;
  animation: rise-in 500ms var(--ease-out) both;
}

/* Ornamental inner frame — sits above the tiles, never intercepts the mouse */
.map-frame {
  position: absolute;
  inset: 10px;
  z-index: 800;
  pointer-events: none;
  border: 1px solid var(--line);
  box-shadow: inset 0 0 60px color-mix(in srgb, var(--bg) 55%, transparent);
}

.map-legend {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1rem 0.45rem;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  border: 1px solid var(--line);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  color: var(--ink-soft);
  animation: rise-in 600ms var(--ease-out) 250ms both;
}

@media (max-width: 560px) {
  .map-legend {
    left: 16px;
    bottom: 16px;
  }
}
</style>
