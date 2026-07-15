<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div class="popup-card">
      <button class="close-btn" aria-label="Close" @click="emit('close')">✕</button>
      <p class="popup-eyebrow">Pinned by {{ pin.submittedBy ?? 'Anonymous' }}</p>
      <h2 class="popup-name">{{ pin.name }}</h2>
      <p class="popup-rating" :aria-label="pin.rating + ' out of 5 stars'">
        <span class="stars">{{ '★'.repeat(pin.rating) }}{{ '☆'.repeat(5 - pin.rating) }}</span>
        <span class="rating-label">{{ pin.rating }}/5</span>
      </p>
      <p class="popup-description">{{ pin.description }}</p>
      <button class="see-more-btn" @click="goToDetail">See more →</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  pin: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()

function goToDetail() {
  router.push(`/pin/${props.pin.id}`)
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.popup-card {
  background: var(--paper);
  border: var(--border-ink);
  border-bottom: none;
  border-radius: var(--r-card) var(--r-card) 0 0;
  padding: var(--sp-4) var(--sp-4) var(--sp-5);
  width: 100%;
  max-width: 520px;
  box-shadow: 0 -5px 0 var(--kc-gold), 0 -8px 24px rgba(30, 27, 24, 0.25);
}

.close-btn {
  float: right;
  width: 34px;
  height: 34px;
  background: var(--cream-deep);
  border: 2px solid var(--ink);
  border-radius: 50%;
  font-size: 0.95rem;
  cursor: pointer;
  color: var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-micro) var(--ease-bounce);
}

.close-btn:hover {
  transform: translate(-1px, -1px) rotate(90deg);
  box-shadow: 3px 3px 0 var(--ink);
}

.popup-eyebrow {
  font-family: var(--font-varsity);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kc-royal);
  margin: 0 0 var(--sp-1);
}

.popup-name {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 var(--sp-6) var(--sp-2) 0;
  line-height: 1.2;
}

.popup-rating {
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
  margin: 0 0 var(--sp-3);
}

.stars {
  color: var(--kc-gold);
  -webkit-text-stroke: 0.8px var(--ink);
  font-size: 1.15rem;
  letter-spacing: 2px;
}

.rating-label {
  font-family: var(--font-varsity);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.popup-description {
  color: var(--ink);
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0 0 var(--sp-4);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.see-more-btn {
  font-family: var(--font-varsity);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--kc-red);
  color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--r-pill);
  padding: 10px 22px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--ink);
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-micro) var(--ease-bounce);
}

.see-more-btn:hover {
  transform: translate(-1px, -2px);
  box-shadow: 4px 5px 0 var(--ink);
}

.see-more-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 var(--ink);
}
</style>
