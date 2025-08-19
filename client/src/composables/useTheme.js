import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const currentTheme = ref('dark')
  const isDarkMode = ref(true)

  // Carregar tema do localStorage
  const loadTheme = () => {
    try {
      const savedSettings = localStorage.getItem('app_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        if (settings.interface?.darkMode !== undefined) {
          isDarkMode.value = settings.interface.darkMode
          currentTheme.value = isDarkMode.value ? 'dark' : 'light'
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
    }
  }

  // Aplicar tema ao documento
  const applyTheme = (theme) => {
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
    } else {
      html.setAttribute('data-theme', 'dark')
      html.classList.add('theme-dark')
      body.classList.add('theme-dark')
    }
    
    currentTheme.value = theme
    isDarkMode.value = theme === 'dark'
  }

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
    
    // Salvar nas configurações
    try {
      const savedSettings = localStorage.getItem('app_settings')
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      
      if (!settings.interface) {
        settings.interface = {}
      }
      
      settings.interface.darkMode = isDarkMode.value
      localStorage.setItem('app_settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
  }

  // Definir tema específico
  const setTheme = (theme) => {
    applyTheme(theme)
    
    // Salvar nas configurações
    try {
      const savedSettings = localStorage.getItem('app_settings')
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      
      if (!settings.interface) {
        settings.interface = {}
      }
      
      settings.interface.darkMode = isDarkMode.value
      localStorage.setItem('app_settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
  }

  // Observar mudanças no localStorage
  const watchThemeChanges = () => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_settings') {
        loadTheme()
        applyTheme(currentTheme.value)
      }
    })
  }

  // Inicializar tema
  onMounted(() => {
    loadTheme()
    applyTheme(currentTheme.value)
    watchThemeChanges()
  })

  // Observar mudanças no tema
  watch(currentTheme, (newTheme) => {
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
