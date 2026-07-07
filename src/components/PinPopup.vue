
<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div class="popup-card">
      <button class="close-btn" @click="emit('close')">✕</button>
      <h2 class="popup-name">{{ pin.name }}</h2>
      <div class="popup-rating">
        <span v-for="n in pin.rating" :key="n">★</span>
        <span v-for="n in (5 - pin.rating)" :key="'empty-' + n">☆</span>
      </div>
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
}

.popup-card {
  background: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.close-btn {
  float: right;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.popup-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  margin-right: 2rem;
}

.popup-rating {
  color: #f5a623;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.popup-description {
  color: #444;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.see-more-btn {
  background: none;
  border: none;
  color: #4a90d9;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
</style>
