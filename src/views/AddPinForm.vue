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
    router.push('/')
  } else {
    alert('Something went wrong. Please try again.')
  }
}


</script>
      

<template>
  <div class="form-container">

    <div class="field">
      <label>Place Name</label>
      <input type="text" v-model="placeName" placeholder="Enter a place name" />
    </div>
    <!-- makes seperate divs so it creates a block container for each field class so they stack, however input and label will still be inline without CSS-->
    <div class="field">
      <label>Rating</label>
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
      <label>Description</label>
      <textarea v-model="description" placeholder="Enter a description"></textarea>
    </div>
    <!-- do textarea over input when expecting a lot of text-->

    <div class="field">
      <label>Tips (optional)</label>
      <textarea v-model="tips" placeholder="Enter any tips"></textarea>
    </div>

    <div class="field">
      <label>Submitted By (optional)</label>
      <input type="text" v-model="submittedBy" placeholder="Enter your name" />
    </div>

    <div class="field">
      <label>Photos</label>
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
      <p class="location-confirmed" v-if="lat">✓ Location selected</p>
    </div>


    <button @click="submitPin">Submit</button>

  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.field {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
/*this is how you can override the style of html tag */

input,
textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  width: 100%;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
.star-selector {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
}

.star.selected {
  color: #f5a623;
}

.search-results {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  overflow: hidden;
}

.search-results li {
  padding: 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results li:hover {
  background: #f5f5f5;
}

.location-confirmed {
  color: green;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.no-results {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.5rem;
}

.see-more-btn {
  width: auto;
  background: none;
  color: #4a90d9;
  border: none;
  font-size: 0.85rem;
  padding: 0.4rem 0;
  margin-top: 0;
  cursor: pointer;
  font-weight: 600;
}

</style>

