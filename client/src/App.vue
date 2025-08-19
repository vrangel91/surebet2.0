<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useTheme } from './composables/useTheme'

export default {
  name: 'App',
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
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

html {
  transition: background-color 0.3s ease;
}
</style>
