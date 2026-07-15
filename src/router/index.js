import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
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
  ]
})

export default router
