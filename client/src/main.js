import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { initializeApp } from './utils/initApp'
import './assets/styles/main.scss'
import './assets/styles/mobile-fixes.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import FloatingGuideButton from './components/FloatingGuideButton.vue'
import './utils/debug-auth.js'
import './utils/loaderTest.js'
import './utils/pwaAutoRefresh.js'
import './utils/memoryManager.js'

// Inicializar aplicação e limpar dados mocados
initializeApp()

const app = createApp(App)

// Registrar componente global
app.component('FloatingGuideButton', FloatingGuideButton)

app.use(router)
app.use(store)
app.mount('#app')
