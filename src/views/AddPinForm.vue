<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const placeName = ref('')
const description = ref('')
const tips = ref('')
const submittedBy = ref('')
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


function handlePhotos(event) {
  photos.value = Array.from(event.target.files)
}

async function searchLocation() {
  if (searchQuery.value.length < 1) return
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery.value)}&limit=20&lat=39.0997&lon=-94.5786`
  )
  const data = await response.json()
  searchResults.value = data.features ||[]
  hasSearched.value = true
}
/*URL explaination: usees Phtons server address ?q is the search query passed. encode converts text into URL safe characters and limit and lat and lon biases to kansas city results and 5 results at most
response.json turns returned geojson into a JavaScript object so data.features is the array of results
inside returned object is a property called features which is the array of matching places so it stores this in searchResults ref

  searchResults.value = data.features ||[]
  even if there are no results for any reason (internet drops, photon server error, etc--app never crashes )
*/

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
/*runs every keystroke
dont fire API call for every single letter, wait 400 miliseconds before searching again=DEBOUNCING
resets limit of see more search when a new search is initiated */

function selectLocation(result) {
  lat.value = result.geometry.coordinates[1]
  lng.value = result.geometry.coordinates[0]
  searchResults.value = []
  const p = result.properties
  searchQuery.value = [p.name, p.city, p.state].filter(Boolean).join(', ')
  hasSearched.value = false
}
/*geojson stores coordinates as longitute, latitude opposite of typical so we have to switch order
searchQuery developing queery by joining parts in proper order */

function showMore() {
  displayLimit.value += 5
}

async function submitPin() {
  if (!placeName.value || !description.value || !rating.value || !lat.value) {
    alert('Please fill in name, description, rating, and location.')
    return
  }

  const response = await fetch('http://localhost:8000/api/pins/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: placeName.value,
      description: description.value,
      tips: tips.value,
      submitted_by: submittedBy.value,
      rating: rating.value,
      lat: lat.value,
      lng: lng.value,
    })
  })

  if (response.ok) {
    router.push('/map')
  } else {
    alert('Something went wrong. Please try again.')
  }
}


</script>


<template>
  <div class="form-page">
    <div class="form-container deco-frame deco-corners">
      <header class="form-header">
        <p class="eyebrow">Join the Atlas</p>
        <h1 class="form-title">Pin a Place Worth Remembering</h1>
        <p class="form-lede editorial">
          Tell the next class of interns where to find it — and why it matters.
        </p>
      </header>

      <div class="field">
        <label>Place Name</label>
        <input type="text" v-model="placeName" placeholder="e.g. The Rieger, Loose Park, Betty Rae's…" />
      </div>
      <!-- makes seperate divs so it creates a block container for each field class so they stack, however input and label will still be inline without CSS-->
      <div class="field">
        <label>Your Rating</label>
        <div class="star-selector">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ selected: n <= rating }"
            @click="rating = n"
          >★</span>
        </div>
      </div>

      <div class="field">
        <label>The Word</label>
        <textarea v-model="description" placeholder="What makes this place worth the trip?"></textarea>
      </div>
      <!-- do textarea over input when expecting a lot of text-->

      <div class="field">
        <label>Insider Tips <span class="optional">optional</span></label>
        <textarea v-model="tips" placeholder="Best time to go, what to order, where to park…"></textarea>
      </div>

      <div class="field">
        <label>Pinned By <span class="optional">optional</span></label>
        <input type="text" v-model="submittedBy" placeholder="Your name, for the record" />
      </div>

      <div class="field">
        <label>Photographs</label>
        <input type="file" accept="image/*" multiple @change="handlePhotos" />
      </div>
      <!--browser loads the file picker, you dont build it yourself. accept... filters what the picker shows
      * means any so image/* means any file type jpg, png, etc
      multiple  means allow selecting more than on
      @change fires when user finishes picking files and confirms. it passes the info to our handlePhotos function  -->

      <div class="field">
        <label>Location</label>
        <input
          type="text"
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Search for a place or address"
        />
        <ul class="search-results" v-if="searchResults.length > 0">
          <li
            v-for="result in searchResults.slice(0, displayLimit)"
            :key="result.properties.osm_id"
            @click="selectLocation(result)"
          >
            {{ result.properties.name }}
            <span v-if="result.properties.city">, {{ result.properties.city }}</span>
          </li>
        </ul>
        <button type="button" class="see-more-btn" v-if="searchResults.length > displayLimit" @click="showMore">
          See more results
        </button>
        <p class="no-results" v-if="hasSearched && searchResults.length === 0">No results found - try searching by address.</p>
        <p class="location-confirmed" v-if="lat"><span aria-hidden="true">✦</span> Location marked on the map</p>
      </div>


      <button class="submit-btn btn btn-gold" @click="submitPin">✦ &nbsp;Pin It to the Map&nbsp; ✦</button>

    </div>
  </div>
</template>

<style scoped>
.form-page {
  padding: clamp(1.5rem, 5vw, 3.5rem) 1rem 4rem;
}

.form-container {
  max-width: 640px;
  margin: 0 auto;
  padding: clamp(1.75rem, 5vw, 3rem);
  background: var(--surface);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 color-mix(in srgb, var(--gold-bright) 14%, transparent);
  animation: rise-in 600ms var(--ease-out) both;
}

.form-header {
  text-align: center;
  margin-bottom: 2.4rem;
}

.form-title {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 4.5vw, 1.95rem);
  margin: 0.7rem 0 0.5rem;
  line-height: 1.25;
}

.form-lede {
  font-size: 1.1rem;
}

.field {
  margin-bottom: 1.6rem;
}

label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 0.55rem;
  text-transform: uppercase;
  letter-spacing: var(--track-wide);
}
/*this is how you can override the style of html tag */

.optional {
  color: var(--ink-faint);
  letter-spacing: 0.12em;
  text-transform: lowercase;
  font-style: italic;
  font-weight: 400;
}

input,
textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--line-soft);
  color: var(--ink);
  padding: 0.8rem 0.9rem 0.68rem;
  font-family: var(--font-body);
  font-size: 0.97rem;
  box-sizing: border-box;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.16); /* engraved well */
  transition: border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

input::placeholder,
textarea::placeholder {
  color: var(--ink-faint);
  opacity: 0.75;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.16), 0 0 0 1px var(--gold), var(--glow-gold);
}

textarea {
  min-height: 110px;
  resize: vertical;
}

input[type='file'] {
  padding: 0.6rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

input[type='file']::file-selector-button {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  color: var(--gold);
  background: transparent;
  border: 1px solid var(--line);
  padding: 0.55rem 1rem 0.45rem;
  margin-right: 0.9rem;
  cursor: pointer;
  transition: border-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

input[type='file']::file-selector-button:hover {
  border-color: var(--gold);
  color: var(--gold-bright);
}

.star-selector {
  display: flex;
  gap: 0.45rem;
}

.star {
  font-size: 2.1rem;
  line-height: 1;
  color: var(--line);
  cursor: pointer;
  transition: color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-out), text-shadow var(--dur-fast) ease;
}

.star:hover {
  transform: scale(1.18);
  color: var(--gold-bright);
}

.star.selected {
  color: var(--star);
  text-shadow: 0 0 14px color-mix(in srgb, var(--star) 55%, transparent);
}

.search-results {
  list-style: none;
  padding: 0;
  margin: 0.6rem 0 0;
  border: 1px solid var(--line);
  background: var(--bg);
  overflow: hidden;
}

.search-results li {
  padding: 0.8rem 0.9rem 0.68rem;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 1px solid var(--line-soft);
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results li:hover {
  background: var(--surface-2);
  color: var(--gold-bright);
}

.location-confirmed {
  color: var(--emerald);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin-top: 0.6rem;
}

.no-results {
  font-size: 0.85rem;
  color: var(--ink-faint);
  margin-top: 0.6rem;
}

.see-more-btn {
  width: auto;
  background: none;
  color: var(--gold);
  border: none;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  padding: 0.5rem 0 0;
  cursor: pointer;
  transition: color var(--dur-fast) ease;
}

.see-more-btn:hover {
  color: var(--gold-bright);
}

.submit-btn {
  width: 100%;
  margin-top: 0.8rem;
  padding-top: 1.05rem;
  padding-bottom: 0.9rem;
  font-size: 0.9rem;
}
</style>
