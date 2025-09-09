<template>
  <div id="app">
    <!-- Loading após login -->
    <LoginLoading :isVisible="showLoginLoading" />
    
    <!-- 🔄 Loader global - apenas para área de conteúdo -->
    <LoaderOverlay :content-only="true" />
    
    <router-view />
    <!-- Botão flutuante do guia interativo - aparece em todas as páginas -->
    <FloatingGuideButton />
    
    <!-- Componentes PWA -->
    <PWAUpdateNotification />
  </div>
</template>

<script>
import { useTheme } from './composables/useTheme'
import LoginLoading from './components/LoginLoading.vue'
import FloatingGuideButton from './components/FloatingGuideButton.vue'
import LoaderOverlay from './components/LoaderOverlay.vue'
import PWAUpdateNotification from './components/PWAUpdateNotification.vue'

export default {
  name: 'App',
  components: {
    LoginLoading,
    FloatingGuideButton,
    LoaderOverlay,
    PWAUpdateNotification
  },
  data() {
    return {
      showLoginLoading: false
    }
  },
  watch: {
    '$route'(to, from) {
      // Mostrar loading quando navegar para dashboard após login
      if (from.path === '/login' && to.path === '/') {
        this.showLoginLoading = true
        // Esconder loading após 2 segundos
        setTimeout(() => {
          this.showLoginLoading = false
        }, 2000)
      }
    }
  },
  setup() {
    const { loadTheme, applyTheme } = useTheme()
    
    // Inicializar tema
    loadTheme()
    applyTheme('dark') // Tema padrão
    
    return {}
  }
}
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh; /* Mudar de height: 100vh para min-height: 100vh */
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow: hidden; /* Remove scroll do app para evitar duplicação */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden; /* Remove scroll do html/body para evitar duplicação */
  min-height: 100vh; /* Garantir altura mínima */
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh; /* Garantir altura mínima */
  overflow: hidden; /* Remove scroll do body para evitar duplicação */
}

html {
  transition: background-color 0.3s ease;
  min-height: 100vh; /* Garantir altura mínima */
}
</style>
