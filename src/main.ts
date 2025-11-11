import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

// PrimeVue CSS - In PrimeVue 4, themes are configured via the theme preset, not CSS imports
import 'primeicons/primeicons.css'

// Import global styles
import './style.css'

const app = createApp(App)

// Install Pinia
const pinia = createPinia()
app.use(pinia)

// Install Vue Router
app.use(router)

// Install PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'light',
      cssLayer: false
    }
  }
})

// Install PrimeVue services
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
