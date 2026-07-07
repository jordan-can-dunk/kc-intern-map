<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import { pins } from '../data/pins.js'

const route = useRoute()
const router = useRouter()

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

    <div class="carousel">
      <img :src="pin.photos[currentIndex]" class="carousel-photo" />

      <button class="carousel-btn prev" v-if="currentIndex > 0" @click="prevPhoto">‹</button>
      <button class="carousel-btn next" v-if="currentIndex < pin.photos.length - 1" @click="nextPhoto">›</button>

      <span class="carousel-counter">{{ currentIndex + 1 }} / {{ pin.photos.length }}</span> <!--turns array counting into normal counting so in arry 0 but it shows 1 -->

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
      <h1 class="place-name">{{ pin.name }}</h1>
        <div class="place-rating">
          <span v-for="n in pin.rating" :key="n">★</span>
          <span v-for="n in (5 - pin.rating)" :key="'empty-' + n">☆</span>
        </div>
      <div class="section">
        <h2 class="section-label">DESCRIPTION</h2>
        <p class="section-text">{{ pin.description }}</p>
      </div>
      <div class="section" v-if="pin.tips">
        <h2 class="section-label">TIPS</h2>
        <p class="section-text">{{ pin.tips }}</p>
      </div>

      <div class="section">
        <h2 class="section-label">LOCATION</h2>
        <div class="mini-map-container">
          <l-map :zoom="14" :center="[pin.lat, pin.lng]" :zoom-control="false" style="height: 100%;">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <l-marker :lat-lng="[pin.lat, pin.lng]" />
          </l-map>
        </div>
        <a
          class="maps-btn"
          :href="`https://www.google.com/maps?q=${pin.lat},${pin.lng}`"
          target="_blank"
        >
          Open in Google Maps ↗
        </a>
      </div>

      <p class="submitted-by">
        Submitted by {{ pin.submittedBy || 'Anonymous' }} on {{ pin.submittedAt }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Carousel Section */

.detail-container {
  max-width: 600px;
  margin: 0 auto;
}

.carousel {
  position: relative;
  width: 100%;
}

.carousel-photo {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  font-size: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prev { left: 0.75rem; }
.next { right: 0.75rem; }

.carousel-counter {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 0;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #ccc;
}

.dot.active {
  background: #4a90d9;
}

/* Info Section*/
.info-section {
  padding: 1.25rem 1rem;
}
/*breathing room around all text, 1.25 top/bottom 1 left/right */

.place-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.50rem;
}
/*gap between name and rating */

.place-rating {
  color: #f5a623;
  font-size: 1.1rem;
  margin-bottom: 1.25rem;
}

.section {
  margin-bottom: 1.25rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.section-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}

.submitted-by {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
}

/* Mini Map Container */
.mini-map-container {
  height: 180px;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.maps-btn {
  display: inline-block;
  /*<a>tags are inline by default which means padding behaves strangely on them. inline-block makes it behave like a block so padding properly works*/
  background-color: #4a90d9;
  color: white;
  text-decoration: none;
  /*browsers automatically underline <a> tags but this removes that underline */
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

</style>
