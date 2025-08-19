<template>
  <div class="settings-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo e Header -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">👑</span>
          <h1 v-show="!sidebarCollapsed">SureStake</h1>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span v-if="sidebarCollapsed">☰</span>
          <span v-else>☰</span>
        </button>
      </div>

      <!-- Perfil do Usuário -->
      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details" v-show="!sidebarCollapsed">
            <p class="user-greeting">Olá, viniciius@live.com</p>
            <div class="user-status"> 
              <span class="status-dot"></span>
              <span class="status-text">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu de Navegação -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: $route.path === '/' }">
            <router-link to="/" class="nav-link" :title="sidebarCollapsed ? 'Dashboard' : ''">
              <span class="nav-icon">🏠</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/reports' }">
            <router-link to="/reports" class="nav-link" :title="sidebarCollapsed ? 'Relatórios' : ''">
              <span class="nav-icon">📊</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Relatórios</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/settings' }">
            <router-link to="/settings" class="nav-link" :title="sidebarCollapsed ? 'Configurações' : ''">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Configurações</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Configurações</h2>
          <p class="page-subtitle">Personalize sua experiência de arbitragem</p>
        </div>
      </header>

      <!-- Conteúdo das Configurações -->
      <div class="settings-content">
        <!-- Notificações -->
        <div class="settings-section">
          <h3 class="section-title">🔔 Notificações</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Som de Notificação</label>
                <p class="setting-description">Reproduz som quando novos surebets são encontrados</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notifications.sound" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Notificações do Navegador</label>
                <p class="setting-description">Mostra notificações do sistema quando novos surebets são encontrados</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notifications.browser" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Volume do Som</label>
                <p class="setting-description">Ajuste o volume das notificações sonoras</p>
              </div>
              <div class="setting-control">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="settings.notifications.volume" 
                  @change="saveSettings"
                  class="volume-slider"
                >
                <span class="volume-value">{{ settings.notifications.volume }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Busca Automática -->
        <div class="settings-section">
          <h3 class="section-title">🔄 Busca Automática</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Iniciar Busca Automaticamente</label>
                <p class="setting-description">Inicia a busca de surebets ao carregar a página</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.autoSearch.enabled" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Intervalo de Atualização</label>
                <p class="setting-description">Frequência de atualização dos surebets (em segundos)</p>
              </div>
              <div class="setting-control">
                <select v-model="settings.autoSearch.interval" @change="saveSettings" class="setting-select">
                  <option value="3">3 segundos</option>
                  <option value="5">5 segundos</option>
                  <option value="10">10 segundos</option>
                  <option value="15">15 segundos</option>
                  <option value="30">30 segundos</option>
                </select>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Busca em Segundo Plano</label>
                <p class="setting-description">Continua buscando mesmo quando a aba não está ativa</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.autoSearch.background" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros Padrão -->
        <div class="settings-section">
          <h3 class="section-title">🎯 Filtros Padrão</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Lucro Mínimo Padrão</label>
                <p class="setting-description">Lucro mínimo para exibir surebets (em %)</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  v-model="settings.defaultFilters.minProfit" 
                  @change="saveSettings"
                  class="setting-input"
                  min="0"
                  max="100"
                >
                <span class="input-suffix">%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Lucro Máximo Padrão</label>
                <p class="setting-description">Lucro máximo para exibir surebets (em %)</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  v-model="settings.defaultFilters.maxProfit" 
                  @change="saveSettings"
                  class="setting-input"
                  min="0"
                  max="1000"
                >
                <span class="input-suffix">%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Filtro Padrão</label>
                <p class="setting-description">Filtro inicial ao carregar a página</p>
              </div>
              <div class="setting-control">
                <select v-model="settings.defaultFilters.activeFilter" @change="saveSettings" class="setting-select">
                  <option value="all">Todas</option>
                  <option value="prelive">Pré-live</option>
                  <option value="live">Live</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Interface -->
        <div class="settings-section">
          <h3 class="section-title">🎨 Interface</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Tema Escuro</label>
                <p class="setting-description">Ativa o tema escuro por padrão</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.interface.darkMode" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Sidebar Colapsada</label>
                <p class="setting-description">Inicia com a sidebar minimizada</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.interface.sidebarCollapsed" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Cards por Linha</label>
                <p class="setting-description">Número de cards de surebet por linha</p>
              </div>
              <div class="setting-control">
                <select v-model="settings.interface.cardsPerRow" @change="saveSettings" class="setting-select">
                  <option value="1">1 card</option>
                  <option value="2">2 cards</option>
                  <option value="3">3 cards</option>
                  <option value="4">4 cards</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Relatórios -->
        <div class="settings-section">
          <h3 class="section-title">📊 Relatórios</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Aposta Padrão</label>
                <p class="setting-description">Valor padrão para apostas nos relatórios</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  v-model="settings.reports.defaultStake" 
                  @change="saveSettings"
                  class="setting-input"
                  min="1"
                  step="0.01"
                >
                <span class="input-suffix">R$</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Moeda Padrão</label>
                <p class="setting-description">Moeda padrão para exibição nos relatórios</p>
              </div>
              <div class="setting-control">
                <select v-model="settings.reports.defaultCurrency" @change="saveSettings" class="setting-select">
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="PEN">Sol Peruano (S/)</option>
                </select>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Auto-save de Relatórios</label>
                <p class="setting-description">Salva automaticamente os dados dos relatórios</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.reports.autoSave" @change="saveSettings">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="settings-section">
          <h3 class="section-title">🛠️ Ações</h3>
          <div class="settings-actions">
            <button @click="resetSettings" class="action-btn reset-btn">
              <span class="btn-icon">🔄</span>
              Restaurar Padrões
            </button>
            <button @click="exportSettings" class="action-btn export-btn">
              <span class="btn-icon">📤</span>
              Exportar Configurações
            </button>
            <button @click="importSettings" class="action-btn import-btn">
              <span class="btn-icon">📥</span>
              Importar Configurações
            </button>
            <button @click="clearData" class="action-btn clear-btn">
              <span class="btn-icon">🗑️</span>
              Limpar Dados
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Input oculto para importar arquivo -->
    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleFileImport"
    >
  </div>
</template>

<script>
import { useTheme } from '../composables/useTheme'

export default {
  name: 'SettingsView',
  setup() {
    const { setTheme } = useTheme()
    return { setTheme }
  },
  data() {
    return {
      sidebarCollapsed: false,
      settings: {
        notifications: {
          sound: true,
          browser: false,
          volume: 50
        },
        autoSearch: {
          enabled: true,
          interval: 5,
          background: true
        },
        defaultFilters: {
          minProfit: 0,
          maxProfit: 1000,
          activeFilter: 'all'
        },
        interface: {
          darkMode: true,
          sidebarCollapsed: false,
          cardsPerRow: 3
        },
        reports: {
          defaultStake: 100.00,
          defaultCurrency: 'BRL',
          autoSave: true
        }
      }
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    loadSettings() {
      const savedSettings = localStorage.getItem('app_settings')
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
        } catch (error) {
          console.error('Erro ao carregar configurações:', error)
        }
      }
    },
    
    saveSettings() {
      try {
        localStorage.setItem('app_settings', JSON.stringify(this.settings))
        
        // Aplicar tema se mudou
        if (this.settings.interface?.darkMode !== undefined) {
          const theme = this.settings.interface.darkMode ? 'dark' : 'light'
          this.setTheme(theme)
        }
        
        this.showNotification('Configurações salvas!')
      } catch (error) {
        console.error('Erro ao salvar configurações:', error)
        this.showNotification('Erro ao salvar configurações!', 'error')
      }
    },
    
    resetSettings() {
      if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
        localStorage.removeItem('app_settings')
        this.loadSettings()
        this.showNotification('Configurações restauradas!')
      }
    },
    
    exportSettings() {
      try {
        const dataStr = JSON.stringify(this.settings, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'surebets-settings.json'
        link.click()
        URL.revokeObjectURL(url)
        this.showNotification('Configurações exportadas!')
      } catch (error) {
        console.error('Erro ao exportar configurações:', error)
        this.showNotification('Erro ao exportar configurações!', 'error')
      }
    },
    
    importSettings() {
      this.$refs.fileInput.click()
    },
    
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          this.settings = { ...this.settings, ...importedSettings }
          this.saveSettings()
          this.showNotification('Configurações importadas!')
        } catch (error) {
          console.error('Erro ao importar configurações:', error)
          this.showNotification('Erro ao importar configurações!', 'error')
        }
      }
      reader.readAsText(file)
      event.target.value = '' // Limpa o input
    },
    
    clearData() {
      if (confirm('Tem certeza que deseja limpar todos os dados? Isso inclui relatórios e configurações.')) {
        localStorage.clear()
        this.loadSettings()
        this.showNotification('Dados limpos!')
      }
    },
    
    showNotification(message, type = 'success') {
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : '#00ff88'};
        color: #1a1a1a;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  
  .sidebar.collapsed & {
    justify-content: center;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .logo-icon {
    font-size: 24px;
  }
  
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }
}

.user-profile {
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  
  .sidebar.collapsed & {
    padding: 20px 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-details {
  flex: 1;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  .sidebar.collapsed & {
    justify-content: center;
    padding: 12px 10px;
  }
}

.nav-item.active .nav-link {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.settings-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-grid {
  display: grid;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-primary);
  }
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-overlay);
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
}

input:checked + .toggle-slider {
  background-color: var(--accent-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Volume Slider */
.volume-slider {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-overlay);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
  }
}

.volume-value {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}

/* Inputs e Selects */
.setting-input {
  width: 80px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.setting-select {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
  
  option {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
}

.input-suffix {
  font-size: 14px;
  color: var(--text-secondary);
  margin-left: 4px;
}

/* Ações */
.settings-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .btn-icon {
    font-size: 16px;
  }
  
  &.reset-btn {
    background: var(--bg-overlay);
    color: var(--text-primary);
    
    &:hover {
      background: var(--border-secondary);
    }
  }
  
  &.export-btn {
    background: var(--accent-primary);
    color: var(--bg-primary);
    
    &:hover {
      background: var(--accent-secondary);
    }
  }
  
  &.import-btn {
    background: var(--info);
    color: var(--text-primary);
    
    &:hover {
      background: #0052cc;
    }
  }
  
  &.clear-btn {
    background: var(--error);
    color: var(--text-primary);
    
    &:hover {
      background: #cc3333;
    }
  }
}

/* Animações */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.open {
      left: 0;
    }
  }
  
  .settings-content {
    padding: 16px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .setting-control {
    width: 100%;
    justify-content: flex-end;
  }
  
  .settings-actions {
    grid-template-columns: 1fr;
  }
}
</style>
