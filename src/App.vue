<script setup>
import NavBar from './components/NavBar.vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <!-- The home page carries its own hero masthead; the NavBar serves every other screen -->
  <NavBar v-if="route.name && route.name !== 'home'" />
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style scoped>
</style>
