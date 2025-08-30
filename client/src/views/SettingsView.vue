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
        <div class="header-actions">
          <button @click="saveAllSettings" class="save-all-btn">
            <span class="btn-icon">💾</span>
            Salvar Tudo
          </button>
        </div>
      </header>

      <!-- Conteúdo das Configurações -->
      <div class="settings-content">
        <div class="settings-grid">
          <!-- Notificações -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">🔔</div>
              <h3 class="card-title">Notificações</h3>
              <p class="card-description">Configure como receber alertas e notificações</p>
            </div>
            <div class="card-content">
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
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">🔄</div>
              <h3 class="card-title">Busca Automática</h3>
              <p class="card-description">Configure a busca automática de surebets</p>
            </div>
            <div class="card-content">
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
                  <p class="setting-description">Frequência de atualização dos surebets</p>
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
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">🎯</div>
              <h3 class="card-title">Filtros Padrão</h3>
              <p class="card-description">Configure os filtros padrão para surebets</p>
            </div>
            <div class="card-content">
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
                      class="setting-input"
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
                      class="setting-input"
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
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">🎨</div>
              <h3 class="card-title">Interface</h3>
              <p class="card-description">Personalize a aparência da aplicação</p>
            </div>
            <div class="card-content">
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

          <!-- Perfil e Segurança -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-icon">🔐</div>
              <h3 class="card-title">Perfil e Segurança</h3>
              <p class="card-description">Gerencie suas informações pessoais e segurança</p>
            </div>
            <div class="card-content">
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
                    class="setting-input profile-input"
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
                    class="setting-input profile-input"
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
                      class="setting-input profile-input"
                      placeholder="Nova senha"
                      minlength="6"
                    >
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
                      class="setting-input profile-input"
                      placeholder="Confirmar senha"
                      minlength="6"
                    >
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Alterar Senha</label>
                  <p class="setting-description">Clique para alterar sua senha</p>
                </div>
                <div class="setting-control">
                  <button @click="changePassword" class="change-password-btn" :disabled="!isPasswordFormValid">
                    <span class="btn-icon">🔑</span>
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Relatórios e Ações -->
          <div class="reports-actions-container">
            <!-- Relatórios -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">📊</div>
                <h3 class="card-title">Relatórios</h3>
                <p class="card-description">Configure as opções de relatórios</p>
              </div>
              <div class="card-content">
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
                        class="setting-input"
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
            <div class="settings-card actions-card">
              <div class="card-header">
                <div class="card-icon">🛠️</div>
                <h3 class="card-title">Ações</h3>
                <p class="card-description">Gerencie suas configurações</p>
              </div>
              <div class="card-content">
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
          sidebarCollapsed: false,
          cardsPerRow: 3
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
    
    saveAllSettings() {
      this.saveSettings()
      this.showNotification('Todas as configurações foram salvas!', 'success')
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

.header-actions {
  .save-all-btn {
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
    
    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-2px);
    }
    
    .btn-icon {
      font-size: 16px;
    }
  }
}

.settings-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.settings-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 500px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  padding: 20px 24px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  border-radius: 12px 12px 0 0;
}

.card-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.card-content {
  padding: 20px 24px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
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
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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

/* Volume Control */
.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  gap: 4px;
}

.setting-input {
  width: 80px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  &.profile-input {
    width: 200px;
    text-align: left;
  }
}

.setting-select {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  option {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
}

.input-suffix {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Botão de Alterar Senha */
.change-password-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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
  }
  
  &:disabled {
    background: var(--bg-overlay);
    color: var(--text-secondary);
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-icon {
    font-size: 16px;
  }
}

/* Grupo de Input de Senha */
.password-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Relatórios e Ações */
.reports-actions-container {
  display: contents;
}

/* Ações */
.actions-card {
  // Removido grid-column: 1 / -1; pois agora está dentro do container
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  justify-content: space-between;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-overlay);
  }
  
  .btn-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .btn-content {
    flex: 1;
  }
  
  .btn-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }
  
  .btn-description {
    display: block;
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  &.reset-btn {
    &:hover {
      border-color: #ffc107;
      background: rgba(255, 193, 7, 0.1);
    }
  }
  
  &.export-btn {
    &:hover {
      border-color: var(--accent-primary);
      background: rgba(0, 255, 136, 0.1);
    }
  }
  
  &.import-btn {
    &:hover {
      border-color: #007bff;
      background: rgba(0, 123, 255, 0.1);
    }
  }
  
  &.clear-btn {
    &:hover {
      border-color: #dc3545;
      background: rgba(220, 53, 69, 0.1);
    }
  }
}

/* Botão de Alterar Senha */
.change-password-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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
  }
  
  &:disabled {
    background: var(--bg-overlay);
    color: var(--text-secondary);
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-icon {
    font-size: 16px;
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
  .settings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .settings-card {
    height: 550px;
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
  
  .header-actions {
    width: 100%;
    
    .save-all-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  .settings-content {
    padding: 16px 20px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .settings-card {
    height: auto;
    min-height: 450px;
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
  
  .actions-grid {
    flex-direction: column;
  }
  
  .action-btn {
    flex-direction: row;
    text-align: left;
    gap: 12px;
    
    .btn-content {
      text-align: left;
    }
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 20px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .setting-item {
    padding: 12px 0;
  }
}
</style>
