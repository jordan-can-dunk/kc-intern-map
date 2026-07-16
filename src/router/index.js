import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/pin/:id',
      name: 'pin-detail',
      component: () => import('../views/PinDetail.vue')
    },
    {
      path: '/add',
      name: 'add-pin',
      component: () => import('../views/AddPinForm.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
