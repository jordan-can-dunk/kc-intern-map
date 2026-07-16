import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { tilt } from './directives/tilt.js'
import 'leaflet/dist/leaflet.css'
import './assets/deco.css'

const app = createApp(App)

app.use(router)
app.directive('tilt', tilt)

app.mount('#app')
