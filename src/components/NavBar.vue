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
    <template v-if="route.name === 'home'">
      <span class="navbar-title navbar-title--brand">
        <span class="brand-kc">KC</span> Intern Map
      </span>
    </template>
    <template v-else-if="route.name === 'map'">
      <button class="back-btn" @click="router.push('/')">← Home</button>
      <span class="navbar-title">The Map</span>
      <button class="add-pin-btn" @click="goToAddPin">+ Add pin</button>
    </template>
    <template v-else>
      <button class="back-btn" @click="router.push('/map')">← Map</button>
      <span class="navbar-title">
        {{ route.name === 'pin-detail' ? 'Place details' : 'Add a Place' }}
      </span>
      <span class="nav-spacer"></span>
    </template>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 var(--sp-3);
  background: var(--cream);
  border-bottom: var(--border-ink);
  position: relative;
  z-index: 100;
}

.navbar-title {
  font-family: var(--font-varsity);
  font-size: 0.9rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.navbar-title--brand {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.01em;
  text-transform: none;
}

.brand-kc {
  color: var(--kc-red);
}

.add-pin-btn {
  font-family: var(--font-varsity);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--kc-red);
  color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-pill);
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--ink);
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-micro) var(--ease-bounce);
}

.add-pin-btn:hover {
  transform: translate(-1px, -2px);
  box-shadow: 4px 5px 0 var(--ink);
}

.add-pin-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 var(--ink);
}

.back-btn {
  font-family: var(--font-varsity);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--kc-royal);
  padding: 0;
  border-bottom: 2px solid var(--kc-gold);
}

.back-btn:hover {
  color: var(--kc-red);
}

.nav-spacer {
  width: 60px;
}
</style>
