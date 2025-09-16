import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const currentTheme = ref('dark')
  const isDarkMode = ref(true)

  // Carregar tema do localStorage
  const loadTheme = () => {
    try {
      // Primeiro tentar carregar de uma chave específica para tema
      const savedTheme = localStorage.getItem('app_theme')
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        currentTheme.value = savedTheme
        isDarkMode.value = savedTheme === 'dark'
        console.log('🎨 Tema carregado do localStorage:', savedTheme)
        return
      }
      
      // Fallback: tentar carregar das configurações antigas
      const savedSettings = localStorage.getItem('app_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        if (settings.interface?.darkMode !== undefined) {
          isDarkMode.value = settings.interface.darkMode
          currentTheme.value = isDarkMode.value ? 'dark' : 'light'
          console.log('🎨 Tema carregado das configurações:', currentTheme.value)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
    }
  }

  // Aplicar tema ao documento
  const applyTheme = (theme) => {
    console.log('🎨 Aplicando tema:', theme)
    const html = document.documentElement
    const body = document.body
    
    // Remover classes de tema anteriores
    html.classList.remove('theme-dark', 'theme-light')
    body.classList.remove('theme-dark', 'theme-light')
    
    // Aplicar novo tema
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light')
      html.classList.add('theme-light')
      body.classList.add('theme-light')
      console.log('✅ Tema claro aplicado')
    } else {
      html.setAttribute('data-theme', 'dark')
      html.classList.add('theme-dark')
      body.classList.add('theme-dark')
      console.log('✅ Tema escuro aplicado')
    }
    
    currentTheme.value = theme
    isDarkMode.value = theme === 'dark'
    console.log('🎯 Tema atualizado no composable:', currentTheme.value)
  }

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    console.log('🔄 Alternando tema de', currentTheme.value, 'para', newTheme)
    applyTheme(newTheme)
    
    // Salvar tema em chave específica
    try {
      localStorage.setItem('app_theme', newTheme)
      console.log('💾 Tema salvo no localStorage:', newTheme)
      
      // Também salvar nas configurações para compatibilidade
      const savedSettings = localStorage.getItem('app_settings')
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      
      if (!settings.interface) {
        settings.interface = {}
      }
      
      settings.interface.darkMode = isDarkMode.value
      localStorage.setItem('app_settings', JSON.stringify(settings))
      console.log('💾 Configurações atualizadas')
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
  }

  // Definir tema específico
  const setTheme = (theme) => {
    console.log('🎯 setTheme chamado com:', theme)
    applyTheme(theme)
    
    // Salvar tema em chave específica
    try {
      localStorage.setItem('app_theme', theme)
      console.log('💾 Tema salvo no localStorage:', theme)
      
      // Também salvar nas configurações para compatibilidade
      const savedSettings = localStorage.getItem('app_settings')
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      
      if (!settings.interface) {
        settings.interface = {}
      }
      
      settings.interface.darkMode = isDarkMode.value
      localStorage.setItem('app_settings', JSON.stringify(settings))
      console.log('💾 Configurações atualizadas')
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
  }

  // Observar mudanças no localStorage
  const watchThemeChanges = () => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_theme' || event.key === 'app_settings') {
        console.log('🔄 Mudança detectada no localStorage:', event.key)
        loadTheme()
        applyTheme(currentTheme.value)
      }
    })
  }

  // Inicializar tema
  onMounted(() => {
    console.log('🚀 useTheme inicializado')
    console.log('🎯 Tema inicial:', currentTheme.value)
    loadTheme()
    console.log('🎯 Tema após loadTheme:', currentTheme.value)
    applyTheme(currentTheme.value)
    watchThemeChanges()
  })

  // Observar mudanças no tema
  watch(currentTheme, (newTheme) => {
    console.log('👀 Mudança detectada no tema:', newTheme)
    applyTheme(newTheme)
  })

  return {
    currentTheme,
    isDarkMode,
    toggleTheme,
    setTheme,
    applyTheme,
    loadTheme
  }
}
