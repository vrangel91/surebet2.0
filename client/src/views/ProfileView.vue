<template>
  <div class="profile-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />
      
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <div class="header-icon">👤</div>
          <div class="header-text">
            <h1 class="page-title">Perfil e Segurança</h1>
            <p class="page-subtitle">Gerencie suas informações pessoais e segurança</p>
          </div>
        </div>
      </header>

      <!-- Conteúdo do Perfil -->
      <div class="profile-content">
        <div class="profile-layout">
          <!-- Informações Pessoais -->
          <div class="profile-section">
            <div class="section-header">
              <div class="section-icon">🔐</div>
              <div class="section-title">
                <h3>Informações Pessoais</h3>
                <p>Atualize suas informações de perfil</p>
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
                    v-model="profile.fullName" 
                    @change="saveProfile"
                    class="enhanced-input"
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
                    v-model="profile.email" 
                    @change="saveProfile"
                    class="enhanced-input"
                    placeholder="seu@email.com"
                    disabled
                  >

                </div>
              </div>
            </div>
          </div>

          <!-- Alteração de Senha -->
          <div class="profile-section">
            <div class="section-header">
              <div class="section-icon">🔒</div>
              <div class="section-title">
                <h3>Alterar Senha</h3>
                <p>Atualize sua senha de acesso</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Nova Senha</label>
                  <p class="setting-description">Digite sua nova senha</p>
                </div>
                <div class="setting-control">
                  <input 
                    type="password" 
                    v-model="password.newPassword" 
                    class="enhanced-input"
                    placeholder="Nova senha"
                  >
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Confirmar Nova Senha</label>
                  <p class="setting-description">Confirme sua nova senha</p>
                </div>
                <div class="setting-control">
                  <input 
                    type="password" 
                    v-model="password.confirmPassword" 
                    class="enhanced-input"
                    placeholder="Confirme a nova senha"
                  >
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-control">
                  <button 
                    @click="changePassword"
                    class="primary-btn"
                    :disabled="!canChangePassword"
                  >
                    <span class="btn-icon">🔑</span>
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Configurações de Segurança -->
          <div class="profile-section">
            <div class="section-header">
              <div class="section-icon">🛡️</div>
              <div class="section-title">
                <h3>Configurações de Segurança</h3>
                <p>Gerencie suas preferências de segurança</p>
              </div>
            </div>
            <div class="section-content">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Notificações de Login</label>
                  <p class="setting-description">Receber notificações quando fizer login em novos dispositivos</p>
                </div>
                <div class="setting-control">
                  <label class="enhanced-toggle">
                    <input 
                      type="checkbox" 
                      v-model="security.loginNotifications"
                      @change="saveSecuritySettings"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Autenticação de Dois Fatores</label>
                  <p class="setting-description">Adicionar uma camada extra de segurança à sua conta</p>
                </div>
                <div class="setting-control">
                  <label class="enhanced-toggle">
                    <input 
                      type="checkbox" 
                      v-model="security.twoFactorAuth"
                      @change="saveSecuritySettings"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

export default {
  name: 'ProfileView',
  components: {
    Sidebar,
    Header
  },
  data() {
    return {
      sidebarCollapsed: false,
      profile: {
        fullName: '',
        email: ''
      },
      password: {
        newPassword: '',
        confirmPassword: ''
      },
      security: {
        loginNotifications: true,
        twoFactorAuth: false
      }
    }
  },
  computed: {
    canChangePassword() {
      return this.password.newPassword && 
             this.password.confirmPassword && 
             this.password.newPassword === this.password.confirmPassword &&
             this.password.newPassword.length >= 6
    }
  },
  mounted() {
    this.loadProfileData()
    // Carregar estado da sidebar das configurações
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.interface?.sidebarCollapsed !== undefined) {
          this.sidebarCollapsed = settings.interface.sidebarCollapsed
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da sidebar:', error)
      }
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
      // Atualizar também nas configurações
      const savedSettings = localStorage.getItem('app_settings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (!settings.interface) settings.interface = {}
          settings.interface.sidebarCollapsed = collapsed
          localStorage.setItem('app_settings', JSON.stringify(settings))
        } catch (error) {
          console.error('Erro ao salvar configurações da sidebar:', error)
        }
      }
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    loadProfileData() {
      // Carregar dados do perfil do localStorage ou da API
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        this.profile = { ...this.profile, ...JSON.parse(savedProfile) }
      }

      // Carregar configurações de segurança
      const savedSecurity = localStorage.getItem('securitySettings')
      if (savedSecurity) {
        this.security = { ...this.security, ...JSON.parse(savedSecurity) }
      }

      // Carregar email do usuário logado (se disponível)
      if (this.$store.state.user && this.$store.state.user.email) {
        this.profile.email = this.$store.state.user.email
      }
    },
    saveProfile() {
      // Salvar perfil no localStorage
      localStorage.setItem('userProfile', JSON.stringify(this.profile))
      
      // Aqui você pode adicionar uma chamada para a API para salvar no servidor
      console.log('Perfil salvo:', this.profile)
      this.showNotification('Perfil salvo com sucesso!')
    },
    changePassword() {
      if (!this.canChangePassword) {
        return
      }

      // Aqui você implementaria a lógica para alterar a senha na API
      console.log('Alterando senha...')
      
      // Limpar campos após alteração
      this.password.newPassword = ''
      this.password.confirmPassword = ''
      
      // Mostrar mensagem de sucesso
      this.showNotification('Senha alterada com sucesso!')
    },
    saveSecuritySettings() {
      // Salvar configurações de segurança no localStorage
      localStorage.setItem('securitySettings', JSON.stringify(this.security))
      
      // Aqui você pode adicionar uma chamada para a API para salvar no servidor
      console.log('Configurações de segurança salvas:', this.security)
      this.showNotification('Configurações de segurança salvas!')
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

<style scoped lang="scss">
.profile-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
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

.profile-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.profile-layout {
  margin: 0 auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-section {
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
  
  .setting-note {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 4px;
  }
}

.enhanced-input {
  width: 250px;
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
  
  &:disabled {
    background: var(--bg-muted);
    color: var(--text-muted);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
}

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
  .profile-layout {
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
  
  .profile-content {
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
  
  .enhanced-input {
    width: 100%;
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
