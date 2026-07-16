<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div class="popup-card deco-frame deco-corners">
      <button class="close-btn" aria-label="Close" @click="emit('close')">✕</button>
      <p class="popup-kicker eyebrow">From the Atlas</p>
      <h2 class="popup-name">{{ pin.name }}</h2>
      <div class="popup-rating" :aria-label="`Rated ${pin.rating} of 5`">
        <span v-for="n in pin.rating" :key="n">★</span>
        <span v-for="n in (5 - pin.rating)" :key="'empty-' + n">☆</span>
      </div>
      <p class="popup-description">{{ pin.description }}</p>
      <button class="see-more-btn" @click="goToDetail">Read the Full Entry <span aria-hidden="true">→</span></button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  pin: {
    type: Object,
    required: true
  }
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
  background: linear-gradient(180deg, transparent 30%, var(--overlay));
  animation: overlay-in 300ms ease both;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.popup-card {
  position: relative;
  background: var(--surface);
  padding: 1.9rem 1.75rem 1.6rem;
  width: 100%;
  max-width: 500px;
  margin: 0 1rem 1.25rem;
  box-shadow:
    var(--shadow),
    inset 0 1px 0 color-mix(in srgb, var(--gold-bright) 16%, transparent);
  transform-origin: 50% 100%;
  animation: card-up 500ms var(--ease-out) both;
}

/* rises and levels out, like a plaque tipping up into place */
@keyframes card-up {
  from {
    opacity: 0;
    transform: perspective(900px) translateY(44px) rotateX(7deg);
  }
  to {
    opacity: 1;
    transform: perspective(900px) translateY(0) rotateX(0);
  }
}

.close-btn {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--line-soft);
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--ink-faint);
  transition: color var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.close-btn:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.popup-kicker {
  font-size: 0.62rem;
  margin-bottom: 0.5rem;
}

.popup-name {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
  margin-right: 2.4rem;
  line-height: 1.25;
}

.popup-rating {
  color: var(--star);
  font-size: 1.05rem;
  letter-spacing: 0.28em;
  margin-bottom: 0.8rem;
}

.popup-description {
  font-family: var(--font-editorial);
  font-size: 1.05rem;
  color: var(--ink-soft);
  line-height: 1.55;
  margin-bottom: 1.2rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.see-more-btn {
  background: none;
  border: none;
  border-bottom: 1px solid var(--line);
  color: var(--gold);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: var(--track);
  text-transform: uppercase;
  cursor: pointer;
  padding: 0 0 0.3rem;
  transition: color var(--dur-fast) ease, border-color var(--dur-fast) ease;
}

.see-more-btn:hover {
  color: var(--gold-bright);
  border-color: var(--gold);
}

@media (min-width: 700px) {
  .popup-overlay {
    align-items: center;
  }

  .popup-card {
    margin: 0 1rem;
  }
}
</style>
