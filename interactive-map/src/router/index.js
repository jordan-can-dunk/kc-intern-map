import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
  ]
})

export default router
