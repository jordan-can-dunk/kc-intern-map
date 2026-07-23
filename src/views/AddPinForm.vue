<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

const placeName = ref('')
const description = ref('')
const tips = ref('')
const submittedBy = ref('')
const company = ref('')
const rating = ref(0)
const lat = ref(null)
const lng = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const photos = ref([])
const hasSearched = ref(false)
let searchTimer = null
const displayLimit = ref(5)
const router = useRouter()

const submitting = ref(false)
const success = ref(false)
const errors = ref([])
const root = ref(null)
let ctx

/* photo thumbnails: object URLs are temporary browser links to local files */
const photoPreviews = computed(() => photos.value.map((f) => URL.createObjectURL(f)))

function handlePhotos(event) {
  photos.value = Array.from(event.target.files)
}

async function searchLocation() {
  if (searchQuery.value.length < 1) return
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery.value)}&limit=20&lat=39.0997&lon=-94.5786`,
  )
  const data = await response.json()
  searchResults.value = data.features || []
  hasSearched.value = true
}
/* Photon geocoding: ?q= is the search text (URL-encoded), lat/lon biases
   results toward Kansas City. data.features || [] means the app never
   crashes even if the server errors out. */

function onSearchInput() {
  clearTimeout(searchTimer)
  hasSearched.value = false
  displayLimit.value = 5

  if (searchQuery.value.length === 0) {
    lat.value = null
    lng.value = null
    searchResults.value = []
    return
  }

  searchTimer = setTimeout(searchLocation, 400)
}
/* debouncing: wait 400ms after the last keystroke instead of firing an
   API call on every letter */

function selectLocation(result) {
  lat.value = result.geometry.coordinates[1]
  lng.value = result.geometry.coordinates[0]
  searchResults.value = []
  const p = result.properties
  searchQuery.value = [p.name, p.city, p.state].filter(Boolean).join(', ')
  hasSearched.value = false
}
/* geojson stores coordinates as [longitude, latitude] — opposite of the
   usual order — so we flip them here */

function showMore() {
  displayLimit.value += 5
}

function setRating(n) {
  rating.value = n
  // the picked star (and its neighbors below) pop with the bounce ease
  gsap.fromTo(
    `.star-btn:nth-child(-n+${n})`,
    { scale: 1 },
    { scale: 1.3, duration: 0.18, ease: 'back.out(3)', yoyo: true, repeat: 1, stagger: 0.03 },
  )
}

async function submitPin() {
  errors.value = []
  if (!placeName.value) errors.value.push('place name')
  if (!rating.value) errors.value.push('rating')
  if (!description.value) errors.value.push('description')
  if (!lat.value) errors.value.push('location')

  if (errors.value.length) {
    gsap.fromTo('.error-banner', { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' })
    return
  }

  submitting.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pins/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: placeName.value,
        description: description.value,
        tips: tips.value,
        submitted_by: submittedBy.value,
        company: company.value,
        rating: rating.value,
        lat: lat.value,
        lng: lng.value,
      }),
    })

    if (response.ok) {
      const newPin = await response.json()

      for (const file of photos.value) {
        const formData = new FormData()
        formData.append('pin', newPin.id)
        formData.append('media', file)
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pin-photos/`, {
          method: 'POST',
          body: formData,
        })
      }

      success.value = true
      gsap.fromTo(
        '.success-heart',
        { scale: 0, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.4)' },
      )
      gsap.to('.success-overlay', { autoAlpha: 1, duration: 0.25 })
      setTimeout(() => router.push('/map'), 1100)
    } else if (response.status === 429) {
      errors.value = ["you're submitting too many pins in too little time — for security purposes, try again in a bit"]
    } else {
      errors.value = ['something went wrong on the server — try again']
    }
  } catch {
    errors.value = ['could not reach the server — is it running?']
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!root.value) return
  ctx = gsap.context(() => {
    gsap.from('.reveal', {
      autoAlpha: 0,
      y: 36,
      stagger: 0.07,
      duration: 0.55,
      ease: 'back.out(1.5)',
      clearProps: 'all',
    })
  }, root.value)
})

onUnmounted(() => {
  ctx?.revert()
  photoPreviews.value.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div ref="root" class="form-container">
    <header class="form-header reveal">
      <p class="form-eyebrow">Leave your mark</p>
      <h1 class="form-title">Add a place <span class="accent">you love</span></h1>
    </header>

    <div class="field reveal">
      <label for="place-name">Place name <span class="req">*</span></label>
      <input id="place-name" v-model="placeName" type="text" placeholder="Joe's, Loose Park, that taco truck…" />
    </div>

    <div class="field reveal">
      <label>Rating <span class="req">*</span></label>
      <div class="star-selector">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ selected: n <= rating }"
          :aria-label="`${n} star${n > 1 ? 's' : ''}`"
          @click="setRating(n)"
        >
          ★
        </button>
        <span v-if="rating" class="rating-label">{{ rating }}/5</span>
      </div>
    </div>

    <div class="field reveal">
      <label for="description">Description <span class="req">*</span></label>
      <textarea id="description" v-model="description" placeholder="What makes this place worth pinning?"></textarea>
    </div>

    <div class="field reveal">
      <label for="tips">Intern tip <span class="opt">(optional)</span></label>
      <textarea id="tips" v-model="tips" placeholder="The stuff you'd only tell a friend — best time, secret entrance, what to order"></textarea>
    </div>

    <div class="field reveal">
      <label for="submitted-by">Your name <span class="opt">(optional)</span></label>
      <input id="submitted-by" v-model="submittedBy" type="text" placeholder="Who's vouching for this spot?" />
    </div>

    <div class="field reveal">
      <label for="company">Company <span class="opt">(optional)</span></label>
      <input id="company" v-model="company" type="text" placeholder="Where are you interning?" />
    </div>

    <div class="field reveal">
      <label for="photos">Photos</label>
      <label class="photo-drop" for="photos">
        <span class="photo-drop-icon">📷</span>
        <span v-if="!photos.length">Tap to add photos from your camera roll</span>
        <span v-else>{{ photos.length }} photo{{ photos.length > 1 ? 's' : '' }} picked — tap to change</span>
      </label>
      <input id="photos" class="visually-hidden" type="file" accept="image/*" multiple @change="handlePhotos" />
      <div v-if="photoPreviews.length" class="photo-strip">
        <img v-for="(src, i) in photoPreviews" :key="i" :src="src" alt="" />
      </div>
    </div>

    <div class="field reveal">
      <label for="location">Location <span class="req">*</span></label>
      <input
        id="location"
        v-model="searchQuery"
        type="text"
        placeholder="Search for a place or address"
        @input="onSearchInput"
      />
      <ul v-if="searchResults.length > 0" class="search-results">
        <li
          v-for="result in searchResults.slice(0, displayLimit)"
          :key="result.properties.osm_id"
          @click="selectLocation(result)"
        >
          {{ result.properties.name }}
          <span v-if="result.properties.city">, {{ result.properties.city }}</span>
        </li>
      </ul>
      <button v-if="searchResults.length > displayLimit" type="button" class="see-more-btn" @click="showMore">
        See more results
      </button>
      <p v-if="hasSearched && searchResults.length === 0" class="no-results">
        No results found — try searching by address.
      </p>
      <p v-if="lat" class="location-confirmed">
        <svg viewBox="0 0 100 92" width="14" height="13" aria-hidden="true">
          <path
            d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
            fill="#e31837"
          />
        </svg>
        Location locked in
      </p>
    </div>

    <p v-if="errors.length" class="error-banner" role="alert">
      Still need: <strong>{{ errors.join(', ') }}</strong>
    </p>

    <button class="btn-kc btn-kc--red submit-btn reveal" :disabled="submitting" @click="submitPin">
      {{ submitting ? 'Pinning…' : 'Pin it on the map' }}
    </button>

    <!-- success moment -->
    <div v-if="success" class="success-overlay">
      <svg class="success-heart" viewBox="0 0 100 92" width="110" height="101">
        <path
          d="M50 88 C22 68 4 50 4 30 C4 13 17 4 29 4 C38 4 46 9 50 16 C54 9 62 4 71 4 C83 4 96 13 96 30 C96 50 78 68 50 88 Z"
          fill="#e31837"
          stroke="#1e1b18"
          stroke-width="4"
        />
        <text x="34" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">K</text>
        <text x="64" y="52" text-anchor="middle" font-family="Graduate, serif" font-size="30" fill="#fffdf7">C</text>
      </svg>
      <p class="success-text">Pinned! Taking you to the map…</p>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--sp-5) var(--sp-3) var(--sp-8);
}

.form-header {
  margin-bottom: var(--sp-5);
}

.form-eyebrow {
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--kc-royal);
  margin: 0 0 var(--sp-1);
}

.form-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.9rem, 6vw, 2.8rem);
}

.form-title .accent {
  color: var(--kc-red);
}

.field {
  margin-bottom: var(--sp-4);
}

label {
  display: block;
  font-family: var(--font-varsity);
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  color: var(--ink);
  margin-bottom: var(--sp-2);
  text-transform: uppercase;
}

.req {
  color: var(--kc-red);
}

.opt {
  color: var(--ink);
  opacity: 0.5;
  letter-spacing: 0.08em;
}

input,
textarea {
  width: 100%;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-chip);
  padding: 12px 14px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--ink);
  box-sizing: border-box;
  box-shadow: 2px 2px 0 var(--ink);
  transition: box-shadow var(--t-micro) var(--ease-bounce);
}

input:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow:
    2px 2px 0 var(--ink),
    0 0 0 3px var(--kc-gold);
}

input::placeholder,
textarea::placeholder {
  color: #9a9184;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* stars */
.star-selector {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.star-btn {
  font-size: 2.1rem;
  line-height: 1;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--paper);
  -webkit-text-stroke: 2px var(--ink);
  transition: color var(--t-quick) ease;
}

.star-btn.selected {
  color: var(--kc-gold);
}

.rating-label {
  font-family: var(--font-varsity);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  margin-left: var(--sp-2);
}

/* photos */
.photo-drop {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  background: var(--cream-deep);
  border: 2px dashed var(--ink);
  border-radius: var(--r-chip);
  padding: var(--sp-4);
  font-family: var(--font-body);
  font-size: 0.9rem;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
  transition: background var(--t-micro) ease;
}

.photo-drop:hover {
  background: var(--kc-gold);
}

.photo-drop-icon {
  font-size: 1.3rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.photo-strip {
  display: flex;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  overflow-x: auto;
}

.photo-strip img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border: 2px solid var(--ink);
  border-radius: var(--r-chip);
  flex-shrink: 0;
}

/* location search */
.search-results {
  list-style: none;
  padding: 0;
  margin: var(--sp-2) 0 0;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-chip);
  box-shadow: 3px 3px 0 var(--ink);
  overflow: hidden;
}

.search-results li {
  padding: 12px 14px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 2px solid var(--cream-deep);
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results li:hover {
  background: var(--kc-gold);
}

.location-confirmed {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--kc-royal);
  margin: var(--sp-2) 0 0;
}

.no-results {
  font-size: 0.85rem;
  opacity: 0.65;
  margin: var(--sp-2) 0 0;
}

.see-more-btn {
  background: none;
  color: var(--kc-royal);
  border: none;
  border-bottom: 2px solid var(--kc-gold);
  font-family: var(--font-varsity);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 0;
  margin-top: var(--sp-2);
  cursor: pointer;
}

.see-more-btn:hover {
  color: var(--kc-red);
}

/* errors + submit */
.error-banner {
  background: var(--kc-red);
  color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-chip);
  box-shadow: 3px 3px 0 var(--ink);
  padding: 12px 16px;
  font-size: 0.9rem;
  margin: 0 0 var(--sp-3);
}

.submit-btn {
  width: 100%;
  font-size: 1rem;
  padding: 16px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}

/* success moment */
.success-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: var(--cream);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
  opacity: 0;
}

.success-text {
  font-family: var(--font-varsity);
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0;
}
</style>
