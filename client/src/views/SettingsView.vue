<template>
  <div class="settings-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <div class="header-icon">⚙️</div>
          <div class="header-text">
            <h1 class="page-title">Configurações</h1>
            <p class="page-subtitle">Personalize sua experiência de arbitragem</p>
          </div>
        </div>

      </header>

      <!-- Conteúdo das Configurações -->
      <div class="settings-content">
        <div class="settings-layout">
          <!-- Notificações -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">🔔</div>
              <div class="section-title">
                <h3>Notificações</h3>
                <p>Configure como receber alertas e notificações</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Som de Notificação</label>
                  <p class="setting-description">Reproduz som quando novos surebets são encontrados</p>
                </div>
                <div class="setting-control">
                  <label class="enhanced-toggle">
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
                  <label class="enhanced-toggle">
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
                  <div class="volume-control">
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
          </div>

          <!-- Busca Automática -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">🔄</div>
              <div class="section-title">
                <h3>Busca Automática</h3>
                <p>Configure a busca automática de surebets</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Iniciar Busca Automaticamente</label>
                  <p class="setting-description">Inicia a busca de surebets ao carregar a página</p>
                </div>
                <div class="setting-control">
                  <label class="enhanced-toggle">
                    <input type="checkbox" v-model="settings.autoSearch.enabled" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Intervalo de Atualização</label>
                  <p class="setting-description">Frequência de atualização dos surebets</p>
                </div>
                <div class="setting-control">
                  <select v-model="settings.autoSearch.interval" @change="saveSettings" class="enhanced-select">
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
                  <label class="enhanced-toggle">
                    <input type="checkbox" v-model="settings.autoSearch.background" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros Padrão -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">🎯</div>
              <div class="section-title">
                <h3>Filtros Padrão</h3>
                <p>Configure os filtros padrão para surebets</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Lucro Mínimo Padrão</label>
                  <p class="setting-description">Lucro mínimo para exibir surebets (em %)</p>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input 
                      type="number" 
                      v-model="settings.defaultFilters.minProfit" 
                      @change="saveSettings"
                      class="enhanced-input"
                      min="0"
                      max="100"
                    >
                    <span class="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Lucro Máximo Padrão</label>
                  <p class="setting-description">Lucro máximo para exibir surebets (em %)</p>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input 
                      type="number" 
                      v-model="settings.defaultFilters.maxProfit" 
                      @change="saveSettings"
                      class="enhanced-input"
                      min="0"
                      max="1000"
                    >
                    <span class="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Filtro Padrão</label>
                  <p class="setting-description">Filtro inicial ao carregar a página</p>
                </div>
                <div class="setting-control">
                  <select v-model="settings.defaultFilters.activeFilter" @change="saveSettings" class="enhanced-select">
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
            <div class="section-header">
              <div class="section-icon">🎨</div>
              <div class="section-title">
                <h3>Interface</h3>
                <p>Personalize a aparência da aplicação</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Tema Escuro</label>
                  <p class="setting-description">Ativa o tema escuro por padrão</p>
                </div>
                <div class="setting-control">
                  <label class="enhanced-toggle">
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
                  <label class="enhanced-toggle">
                    <input type="checkbox" v-model="settings.interface.sidebarCollapsed" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>


            </div>
          </div>

          <!-- Perfil e Segurança -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">🔐</div>
              <div class="section-title">
                <h3>Perfil e Segurança</h3>
                <p>Gerencie suas informações pessoais e segurança</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Nome Completo</label>
                  <p class="setting-description">Seu nome completo para exibição</p>
                </div>
                <div class="setting-control">
                  <input 
                    type="text" 
                    v-model="settings.profile.fullName" 
                    @change="saveSettings"
                    class="enhanced-input profile-input"
                    placeholder="Seu nome completo"
                  >
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Email</label>
                  <p class="setting-description">Seu endereço de email</p>
                </div>
                <div class="setting-control">
                  <input 
                    type="email" 
                    v-model="settings.profile.email" 
                    @change="saveSettings"
                    class="enhanced-input profile-input"
                    placeholder="seu@email.com"
                  >
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Nova Senha</label>
                  <p class="setting-description">Digite sua nova senha (mínimo 6 caracteres)</p>
                </div>
                <div class="setting-control">
                  <div class="password-input-group">
                    <input 
                      type="password" 
                      v-model="settings.profile.newPassword" 
                      @change="saveSettings"
                      class="enhanced-input profile-input"
                      placeholder="Nova senha"
                      minlength="6"
                    >
                    <button @click="togglePasswordVisibility" class="password-toggle-btn">
                      <span v-if="!showPassword" class="btn-icon">👁️</span>
                      <span v-if="showPassword" class="btn-icon">🙈</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Confirmar Senha</label>
                  <p class="setting-description">Confirme sua nova senha</p>
                </div>
                <div class="setting-control">
                  <div class="password-input-group">
                    <input 
                      type="password" 
                      v-model="settings.profile.confirmPassword" 
                      @change="saveSettings"
                      class="enhanced-input profile-input"
                      placeholder="Confirmar senha"
                      minlength="6"
                    >
                    <button @click="togglePasswordVisibility" class="password-toggle-btn">
                      <span v-if="!showPassword" class="btn-icon">👁️</span>
                      <span v-if="showPassword" class="btn-icon">🙈</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Alterar Senha</label>
                  <p class="setting-description">Clique para alterar sua senha</p>
                </div>
                <div class="setting-control">
                  <button @click="changePassword" class="primary-btn" :disabled="!isPasswordFormValid">
                    <span class="btn-icon">🔑</span>
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Relatórios e Ações -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">📊</div>
              <div class="section-title">
                <h3>Relatórios</h3>
                <p>Configure as opções de relatórios</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Aposta Padrão</label>
                  <p class="setting-description">Valor padrão para apostas nos relatórios</p>
                </div>
                <div class="setting-control">
                  <div class="input-group">
                    <input 
                      type="number" 
                      v-model="settings.reports.defaultStake" 
                      @change="saveSettings"
                      class="enhanced-input"
                      min="1"
                      step="0.01"
                    >
                    <span class="input-suffix">R$</span>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Moeda Padrão</label>
                  <p class="setting-description">Moeda padrão para exibição nos relatórios</p>
                </div>
                <div class="setting-control">
                  <select v-model="settings.reports.defaultCurrency" @change="saveSettings" class="enhanced-select">
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
                  <label class="enhanced-toggle">
                    <input type="checkbox" v-model="settings.reports.autoSave" @change="saveSettings">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="settings-section">
            <div class="section-header">
              <div class="section-icon">🛠️</div>
              <div class="section-title">
                <h3>Ações</h3>
                <p>Gerencie suas configurações</p>
              </div>
            </div>
            <div class="section-content">
              <div class="actions-grid">
                <button @click="resetSettings" class="action-btn reset-btn">
                  <span class="btn-icon">🔄</span>
                  <div class="btn-content">
                    <span class="btn-title">Restaurar Padrões</span>
                    <span class="btn-description">Volta para configurações iniciais</span>
                  </div>
                </button>
                <button @click="exportSettings" class="action-btn export-btn">
                  <span class="btn-icon">📤</span>
                  <div class="btn-content">
                    <span class="btn-title">Exportar Configurações</span>
                    <span class="btn-description">Salva suas configurações em arquivo</span>
                  </div>
                </button>
                <button @click="importSettings" class="action-btn import-btn">
                  <span class="btn-icon">📥</span>
                  <div class="btn-content">
                    <span class="btn-title">Importar Configurações</span>
                    <span class="btn-description">Carrega configurações de arquivo</span>
                  </div>
                </button>
                <button @click="clearData" class="action-btn clear-btn">
                  <span class="btn-icon">🗑️</span>
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
    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleFileImport"
    >

    <!-- Modal do Glossário -->
        <GlossaryModal
      :isVisible="showGlossaryModal"
      @close="closeGlossary"
    />
  </div>
</template>

<script>
import { useTheme } from '../composables/useTheme'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'

export default {
  name: 'SettingsView',
  components: {
    Sidebar,
    GlossaryModal
  },
  setup() {
    const { setTheme } = useTheme()
    return { setTheme }
  },
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
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
          sidebarCollapsed: false
        },
        profile: {
          fullName: '',
          email: '',
          newPassword: '',
          confirmPassword: ''
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
    // Carregar estado da sidebar das configurações
    if (this.settings.interface?.sidebarCollapsed !== undefined) {
      this.sidebarCollapsed = this.settings.interface.sidebarCollapsed
    }
  },
  computed: {
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    isPasswordFormValid() {
      return this.settings.profile.newPassword && 
             this.settings.profile.confirmPassword && 
             this.settings.profile.newPassword === this.settings.profile.confirmPassword &&
             this.settings.profile.newPassword.length >= 6;
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
      // Atualizar também nas configurações
      this.settings.interface.sidebarCollapsed = collapsed
      this.saveSettings()
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },
    
    closeGlossary() {
      this.showGlossaryModal = false
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
      },
      
      async changePassword() {
        if (!this.isPasswordFormValid) {
          this.showNotification('As senhas não coincidem ou são muito curtas.', 'error');
          return;
        }

        try {
          // Aqui você pode implementar a chamada para a API de mudança de senha
          // Por enquanto, vamos simular o sucesso
          console.log('Alterando senha para:', this.settings.profile.newPassword);
          
          // Simular delay da API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          this.showNotification('Senha alterada com sucesso!', 'success');
          
          // Limpar os campos de senha
          this.settings.profile.newPassword = '';
          this.settings.profile.confirmPassword = '';
          
          // Salvar configurações
          this.saveSettings();
        } catch (error) {
          console.error('Erro ao alterar senha:', error);
          this.showNotification('Erro ao alterar senha: ' + (error.message || 'Erro desconhecido'), 'error');
        }
      },
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
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
  background: var(--bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text {
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

/* NOVO LAYOUT - DIV INTEIRA COM SEÇÕES SEPARADAS */
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.settings-section {
  border-bottom: 2px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: var(--bg-tertiary);
  }
}

.section-header {
  padding: 24px 32px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-icon {
  font-size: 28px;
  color: var(--accent-primary);
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 52px;
}

.section-title {
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

.section-content {
  padding: 32px;
  background: var(--bg-secondary);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
    margin: 0 -32px;
    padding-left: 32px;
    padding-right: 32px;
    border-radius: 8px;
  }
}

.setting-info {
  flex: 1;
  margin-right: 24px;
}

.setting-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
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

/* Enhanced Toggle Switch */
.enhanced-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
    transform: translateY(-1px);
  }
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: var(--bg-overlay);
  border-radius: 24px;
  transition: 0.3s;
  
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







/* Enhanced Inputs */
.enhanced-input {
  width: 200px;
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
  
  &.profile-input {
    width: 250px;
  }
}

.enhanced-select {
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

/* Password Toggle Button */
.password-toggle-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
}

.password-input-group {
  display: flex;
  align-items: stretch;
  
  .enhanced-input {
    border-radius: 8px 0 0 8px;
    border-right: none;
  }
}

/* Primary Button */
.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
  
  &:disabled {
    background: var(--bg-overlay);
    color: var(--text-secondary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .btn-icon {
    font-size: 16px;
  }
}

/* Password Strength Indicator */
.password-strength {
  margin: 20px 0;
  padding: 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--text-primary);
}

.strength-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 120px;
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-overlay);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.strength-fill {
  height: 100%;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.strength-fill.very-weak {
  background: linear-gradient(90deg, #dc3545, #ff6b6b);
  width: 25%;
}

.strength-fill.weak {
  background: linear-gradient(90deg, #ffc107, #ffdb4d);
  width: 50%;
}

.strength-fill.medium {
  background: linear-gradient(90deg, #007bff, #4da6ff);
  width: 75%;
}

.strength-fill.strong {
  background: linear-gradient(90deg, #28a745, #5cb85c);
  width: 100%;
}

.strength-text {
  font-weight: 700;
  min-width: 80px;
  text-align: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.strength-text.very-weak {
  color: #fff;
  background: #dc3545;
}

.strength-text.weak {
  color: #000;
  background: #ffc107;
}

.strength-text.medium {
  color: #fff;
  background: #007bff;
}

.strength-text.strong {
  color: #fff;
  background: #28a745;
}

/* Volume Control */
.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-slider {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-overlay);
  outline: none;
  -webkit-appearance: none;
  position: relative;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }
}

.volume-value {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
  font-weight: 600;
}

/* Inputs e Selects */
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

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .btn-icon {
    font-size: 24px;
    flex-shrink: 0;
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
  
  &.reset-btn {
    border-left: 4px solid #ffc107;
    
    &:hover {
      background: rgba(255, 193, 7, 0.1);
    }
  }
  
  &.export-btn {
    border-left: 4px solid var(--accent-primary);
    
    &:hover {
      background: rgba(0, 255, 136, 0.1);
    }
  }
  
  &.import-btn {
    border-left: 4px solid #007bff;
    
    &:hover {
      background: rgba(0, 123, 255, 0.1);
    }
  }
  
  &.clear-btn {
    border-left: 4px solid #dc3545;
    
    &:hover {
      background: rgba(220, 53, 69, 0.1);
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
@media (max-width: 1400px) {
  .settings-layout {
    max-width: 100%;
    margin: 0 16px;
  }
}

@media (max-width: 768px) {
  .content-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-left {
    width: 100%;
  }
  

  
  .settings-content {
    padding: 16px 20px;
  }
  
  .section-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .section-content {
    padding: 20px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .setting-control {
    width: 100%;
    justify-content: flex-start;
  }
  
  .enhanced-input,
  .enhanced-select {
    width: 100%;
  }
  
  .password-strength {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .strength-label {
    min-width: auto;
  }
  
  .strength-bar {
    width: 100%;
  }
  
  .strength-text {
    align-self: flex-end;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 16px;
  }
  
  .section-content {
    padding: 16px;
  }
  
  .setting-item {
    padding: 12px 0;
  }
}
</style>

