import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { initializeApp } from './utils/initApp'
import './assets/styles/main.scss'

// Inicializar aplicação e limpar dados mocados
initializeApp()

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
