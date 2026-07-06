<script setup>
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
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
      />
    </l-map>
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
  height: calc(98vh - 60px);
  width: 100%;
}
</style>
