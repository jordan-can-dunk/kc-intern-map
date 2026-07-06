<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goToAddPin() {
  router.push('/add')
}
</script>

<template>
  <nav class="navbar">
    <template v-if="route.name === 'map'">
      <span class="navbar-title">KC Intern Map</span>
      <button class="add-pin-btn" @click="goToAddPin">+ Add pin</button>
    </template>
    <template v-else>
      <button class="back-btn" @click="router.push('/')">← Map</button>
      <span class="navbar-title">
        {{ route.name === 'pin-detail' ? 'Place details' : 'Add a Place' }}
      </span>
    </template>
  </nav>
</template>


<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.navbar-title {
  font-size: 1.125rem;
  font-weight: bold;
}

.add-pin-btn {
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.back-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: #4a90d9;
  padding: 0;
}
</style>
