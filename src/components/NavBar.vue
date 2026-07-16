<script setup>
import { useRouter, useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

function goToAddPin() {
  router.push('/add')
}
</script>

<template>
  <nav class="navbar">
    <template v-if="route.name === 'map'">
      <RouterLink to="/" class="brand">
        <span class="deco-diamond" aria-hidden="true" />
        <span class="brand-text">
          <span class="brand-name">Fountain City Atlas</span>
          <span class="brand-sub">The KC Intern Map</span>
        </span>
      </RouterLink>
      <div class="nav-actions">
        <ThemeToggle />
        <button class="add-pin-btn btn btn-gold" @click="goToAddPin">
          <span aria-hidden="true">✦</span> Add a Place
        </button>
      </div>
    </template>
    <template v-else>
      <button class="back-btn" @click="router.push('/map')">
        <span aria-hidden="true">‹</span> Back to Map
      </button>
      <span class="navbar-title">
        {{ route.name === 'pin-detail' ? 'The Entry' : 'Leave Your Mark' }}
      </span>
      <div class="nav-actions nav-actions-end">
        <ThemeToggle />
      </div>
    </template>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1100;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: var(--nav-h);
  padding: 0 clamp(0.9rem, 3vw, 2rem);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 12px 26px -18px rgba(0, 0, 0, 0.55);
  transition: background-color var(--dur) ease;
}

/* Second hairline beneath — the classic deco double rule */
.navbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 1px;
  background: var(--line-soft);
  pointer-events: none;
}

/* Map view: brand left, actions right */
.navbar > .brand {
  grid-column: 1;
  justify-self: start;
}

.navbar > .nav-actions {
  grid-column: 3;
  justify-self: end;
}

/* Sub-pages: back left, title centered, toggle right */
.back-btn {
  grid-column: 1;
  justify-self: start;
}

.navbar-title {
  grid-column: 2;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
  white-space: nowrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.02rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  white-space: nowrap;
}

.brand-sub {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.nav-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}

.add-pin-btn {
  padding: 0.68rem 1.3rem 0.56rem;
  font-size: 0.74rem;
}

.back-btn {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  background: none;
  border: none;
  padding: 0.4rem 0;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  color: var(--gold);
  transition: color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-out);
}

.back-btn:hover {
  color: var(--gold-bright);
  transform: translateX(-2px);
}

.back-btn,
.navbar-title {
  white-space: nowrap;
}

@media (max-width: 560px) {
  .brand-sub {
    display: none;
  }

  .brand-name {
    font-size: 0.92rem;
  }

  .add-pin-btn {
    padding: 0.6rem 0.9rem 0.5rem;
  }

  .navbar-title {
    font-size: 0.88rem;
  }

  .back-btn {
    font-size: 0.66rem;
  }
}
</style>
