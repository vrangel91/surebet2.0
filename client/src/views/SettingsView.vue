<template>
  <div class="settings-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />

      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Configurações</h2>
          <p class="page-subtitle">Personalize sua experiência de arbitragem</p>
        </div>
      </header>

      <!-- Conteúdo das Configurações -->
      <div class="settings-content">
        <div class="settings-grid">
          <!-- Notificações -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div class="card-title">
                <h3>Notificações</h3>
                <p>Configure alertas e notificações</p>
              </div>
            </div>
            <div class="card-content">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Som de Notificação</label>
                    <p class="setting-description">Reproduz som quando novos surebets são encontrados</p>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="modern-toggle">
                    <input type="checkbox" v-model="settings.notifications.sound" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Notificações do Navegador</label>
                    <p class="setting-description">Mostra notificações do sistema quando novos surebets são encontrados
                    </p>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="modern-toggle">
                    <input type="checkbox" v-model="settings.notifications.browser" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Volume do Som</label>
                    <p class="setting-description">Ajuste o volume das notificações sonoras</p>
                  </div>
                </div>
                <div class="setting-control">
                  <div class="volume-control">
                    <input type="range" min="0" max="100" v-model="settings.notifications.volume" @change="saveSettings"
                      class="modern-slider">
                    <span class="volume-value">{{ settings.notifications.volume }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Busca Automática -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                  <path d="M12 3v9l4-4" />
                </svg>
              </div>
              <div class="card-title">
                <h3>Busca Automática</h3>
                <p>Configure a busca automática de surebets</p>
              </div>
            </div>
            <div class="card-content">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                      <path d="M12 3v9l4-4" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Iniciar Busca Automaticamente</label>
                    <p class="setting-description">Inicia a busca de surebets ao carregar a página</p>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="modern-toggle">
                    <input type="checkbox" v-model="settings.autoSearch.enabled" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Intervalo de Atualização</label>
                    <p class="setting-description">Frequência de atualização dos surebets</p>
                  </div>
                </div>
                <div class="setting-control">
                  <select v-model="settings.autoSearch.interval" @change="saveSettings" class="modern-select">
                    <option value="3">3 segundos</option>
                    <option value="5">5 segundos</option>
                    <option value="10">10 segundos</option>
                    <option value="15">15 segundos</option>
                    <option value="30">30 segundos</option>
                  </select>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Busca em Segundo Plano</label>
                    <p class="setting-description">Continua buscando mesmo quando a aba não está ativa</p>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="modern-toggle">
                    <input type="checkbox" v-model="settings.autoSearch.background" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros Padrão -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
                </svg>
              </div>
              <div class="card-title">
                <h3>Filtros Padrão</h3>
                <p>Configure os filtros padrão para surebets</p>
              </div>
            </div>
            <div class="card-content">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Lucro Mínimo Padrão</label>
                    <p class="setting-description">Lucro mínimo para exibir surebets (em %)</p>
                  </div>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input type="number" v-model="settings.defaultFilters.minProfit" @change="saveSettings"
                      class="modern-input" min="0" max="100">
                    <span class="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,19 5,12 12,5" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Lucro Máximo Padrão</label>
                    <p class="setting-description">Lucro máximo para exibir surebets (em %)</p>
                  </div>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input type="number" v-model="settings.defaultFilters.maxProfit" @change="saveSettings"
                      class="modern-input" min="0" max="1000">
                    <span class="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Filtro Padrão</label>
                    <p class="setting-description">Filtro inicial ao carregar a página</p>
                  </div>
                </div>
                <div class="setting-control">
                  <select v-model="settings.defaultFilters.activeFilter" @change="saveSettings" class="modern-select">
                    <option value="all">Todas</option>
                    <option value="prelive">Pré-live</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Relatórios -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <div class="card-title">
                <h3>Relatórios</h3>
                <p>Configure as opções de relatórios</p>
              </div>
            </div>
            <div class="card-content">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Aposta Padrão</label>
                    <p class="setting-description">Valor padrão para apostas nos relatórios</p>
                  </div>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input type="number" v-model="settings.reports.defaultStake" @change="saveSettings"
                      class="modern-input" min="1" step="0.01">
                    <span class="input-suffix">R$</span>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Moeda Padrão</label>
                    <p class="setting-description">Moeda padrão para exibição nos relatórios</p>
                  </div>
                </div>
                <div class="setting-control">
                  <select v-model="settings.reports.defaultCurrency" @change="saveSettings" class="modern-select">
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="PEN">Sol Peruano (S/)</option>
                  </select>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17,21 17,13 7,13 7,21" />
                      <polyline points="7,3 7,8 15,8" />
                    </svg>
                  </div>
                  <div class="setting-details">
                    <label class="setting-label">Auto-save de Relatórios</label>
                    <p class="setting-description">Salva automaticamente os dados dos relatórios</p>
                  </div>
                </div>
                <div class="setting-control">
                  <label class="modern-toggle">
                    <input type="checkbox" v-model="settings.reports.autoSave" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="settings-card actions-card">
            <div class="card-header">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div class="card-title">
                <h3>Ações</h3>
                <p>Gerencie suas configurações</p>
              </div>
            </div>
            <div class="card-content">
              <div class="actions-grid">
                <button @click="resetSettings" class="action-btn reset-btn">
                  <div class="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                      <path d="M12 3v9l4-4" />
                    </svg>
                  </div>
                  <div class="btn-content">
                    <span class="btn-title">Restaurar Padrões</span>
                    <span class="btn-description">Volta para configurações iniciais</span>
                  </div>
                </button>

                <button @click="exportSettings" class="action-btn export-btn">
                  <div class="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div class="btn-content">
                    <span class="btn-title">Exportar Configurações</span>
                    <span class="btn-description">Salva suas configurações em arquivo</span>
                  </div>
                </button>

                <button @click="importSettings" class="action-btn import-btn">
                  <div class="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div class="btn-content">
                    <span class="btn-title">Importar Configurações</span>
                    <span class="btn-description">Carrega configurações de arquivo</span>
                  </div>
                </button>

                <button @click="clearData" class="action-btn clear-btn">
                  <div class="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </div>
                  <div class="btn-content">
                    <span class="btn-title">Limpar Dados</span>
                    <span class="btn-description">Remove todos os dados salvos</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Input oculto para importar arquivo -->
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport">
  </div>
</template>

<script>
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'

export default {
  name: 'SettingsView',
  components: {
    Sidebar,
    Header
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
          sidebarCollapsed: false
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
    if (this.settings.interface?.sidebarCollapsed !== undefined) {
      this.sidebarCollapsed = this.settings.interface.sidebarCollapsed
    }
  },
  computed: {
    isAdmin() {
      return this.$store.getters.isAdmin
    },
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
      this.settings.interface.sidebarCollapsed = collapsed
      this.saveSettings()
    },

    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
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
      event.target.value = ''
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
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease, width 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100% - 280px);
  margin-left: 280px;
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
  }
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
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.settings-content {
  flex: 1;
  padding: 0 32px 32px;
  overflow-y: auto;
  background: var(--bg-primary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.settings-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-primary);
    z-index: 10;
  }
}

.card-header {
  padding: 24px;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
}

.card-title {
  flex: 1;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
}

.card-content {
  padding: 24px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-primary);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.setting-icon {
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.setting-details {
  flex: 1;
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
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* Modern Toggle */
.modern-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.modern-toggle input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  background: var(--bg-overlay);
  border-radius: 28px;
  transition: all 0.3s ease;

  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: all 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

input:checked+.toggle-slider {
  background: var(--accent-primary);
}

input:checked+.toggle-slider:before {
  transform: translateX(24px);
}

/* Modern Slider */
.modern-slider {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-overlay);
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-value {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
  font-weight: 600;
}

/* Modern Inputs */
.modern-input {
  width: 120px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-hover);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
}

.modern-select {
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-hover);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  option {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 8px;
  }
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-suffix {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Actions Card */
.actions-card {
  grid-column: 1 / -1;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

.btn-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.btn-content {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.btn-description {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
}

/* Action Button Variants */
.reset-btn {
  border-left: 4px solid #ffc107;

  &:hover {
    background: rgba(255, 193, 7, 0.1);
  }

  .btn-icon {
    background: #ffc107;
  }
}

.export-btn {
  border-left: 4px solid var(--accent-primary);

  &:hover {
    background: rgba(0, 255, 136, 0.1);
  }
}

.import-btn {
  border-left: 4px solid #007bff;

  &:hover {
    background: rgba(0, 123, 255, 0.1);
  }

  .btn-icon {
    background: #007bff;
  }
}

.clear-btn {
  border-left: 4px solid #dc3545;

  &:hover {
    background: rgba(220, 53, 69, 0.1);
  }

  .btn-icon {
    background: #dc3545;
  }
}

/* Responsividade */
@media (max-width: 1023px) {
  .settings-container {
    margin-left: 0;
    width: 100%;
    max-width: 100%;
  }

  .settings-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .settings-content {
    padding: 0 20px 20px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .card-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .card-content {
    padding: 20px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .setting-control {
    width: 100%;
    justify-content: flex-start;
  }

  .modern-input,
  .modern-select {
    width: 100%;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .settings-content {
    padding: 0 12px 12px;
  }

  .card-header {
    padding: 16px;
  }

  .card-content {
    padding: 16px;
  }

  .setting-row {
    padding: 12px 0;
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
</style>
