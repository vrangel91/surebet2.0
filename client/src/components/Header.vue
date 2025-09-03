<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo/Título -->
      <div class="header-left">
        <h1 class="app-title">SureStake</h1>
      </div>
      
      <!-- Área direita com usuário -->
      <div class="header-right">
        <!-- Toggle de Tema -->
        <button 
          class="theme-toggle-btn"
          @click="toggleTheme"
          :title="currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        >
          <i :class="themeIconClass"></i>
        </button>
        
        <!-- Ícone de usuário -->
        <button 
          class="user-button"
          @click="toggleUserModal"
          :title="currentUser ? `Olá, ${currentUser.username || 'Usuário'}` : 'Usuário'"
        >
          <div class="user-avatar">
            <i class="bi bi-person-fill"></i>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Modal de usuário -->
    <div 
      v-if="showUserModal" 
      class="user-modal-overlay"
      @click="closeUserModal"
    >
      <div class="user-modal">
        <!-- Cabeçalho do modal -->
        <div class="modal-header">
          <h3>Informações do Usuário</h3>
          <button class="close-btn" @click="closeUserModal">×</button>
        </div>
        
        <!-- Conteúdo do modal -->
        <div class="modal-content">
          <!-- Informações básicas -->
          <div class="user-info">
            <div class="user-avatar-large">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="user-details">
              <h4 class="username">{{ currentUser?.username || 'Usuário' }}</h4>
              <span class="user-status">
                <span class="status-dot" :class="accountStatusClass"></span>
                {{ accountStatusText }}
              </span>
            </div>
          </div>
          
          <!-- Badge Premium se aplicável -->
          <div v-if="isPremium" class="premium-badge">
            <i class="bi bi-star-fill"></i>
            PREMIUM
          </div>
          
          <!-- Tipo de Conta -->
          <div class="user-account-type">
            <span class="account-type-badge" :class="userAccountTypeClass">
              {{ userAccountTypeDisplay }}
            </span>
          </div>
          
          <!-- Status VIP -->
          <div v-if="isVIP" class="vip-status">
            <!-- Texto de expiração em linha única -->
            <div class="vip-info">
              <i class="bi bi-clock"></i>
              <span v-if="accountExpiration" class="expiration-text">
                {{ expirationDisplayText }}
              </span>
              <span v-else-if="userVIPData === null" class="expiration-text loading">
                Carregando dados VIP...
              </span>
              <span v-else class="expiration-text error">
                Dados VIP não encontrados
              </span>
            </div>
            
            <!-- Barra de progresso em linha separada -->
            <div v-if="accountExpiration" class="expiration-progress">
              <div class="progress-info">
                <span class="progress-label">Status da Conta:</span>
                <span class="progress-percentage">{{ Math.round(expirationProgressPercent) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :class="expirationProgressClass"
                  :style="{ width: expirationProgressPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Ações do usuário -->
          <div class="user-actions" @click.stop>
            <button class="action-btn profile-btn" @click="goToProfile">
              <i class="bi bi-person"></i>
              Perfil
            </button>
            <button class="action-btn settings-btn" @click="goToSettings">
              <i class="bi bi-gear"></i>
              Configurações
            </button>
            <button v-if="isAdmin" class="action-btn vip-admin-btn" @click="goToVIPAdmin">
              <i class="bi bi-crown"></i>
              Administração VIP
            </button>
            <button v-if="isAdmin" class="action-btn admin-btn" @click="goToAdmin">
              <i class="bi bi-gear"></i>
              Administração
            </button>
            <button class="action-btn logout-btn" @click="logout">
              <i class="bi bi-box-arrow-right"></i>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'Header',
  data() {
    return {
      showUserModal: false,
      userVIPData: null,
      countdownTimer: null,
      currentTheme: 'dark' // Tema padrão
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    themeIconClass() {
      return this.currentTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill'
    },
    isPremium() {
      return this.currentUser?.isPremium || false
    },
    isVIP() {
      return this.$store.getters.isVIP
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    userAccountType() {
      return this.$store.getters.userAccountType
    },
    userAccountTypeDisplay() {
      const accountTypes = {
        basic: 'Básico',
        premium: 'Premium',
        vip: 'VIP'
      }
      return accountTypes[this.userAccountType] || 'Básico'
    },
    userAccountTypeClass() {
      return `account-type-${this.userAccountType}`
    },
    
    accountExpiration() {
      return this.userVIPData?.dataFim || null
    },
    
    accountStatusClass() {
      if (!this.accountExpiration) return 'active'
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (timeDiff < 0) return 'expired'
      if (daysUntilExpiration <= 7) return 'warning'
      return 'active'
    },
    
    accountStatusText() {
      if (!this.accountExpiration) return 'Ativo'
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff < 0) return 'Expirado'
      return 'Ativo'
    },
    
    expirationDisplayText() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff < 0) {
        return 'Conta expirada'
      }
      
      const totalHours = Math.floor(timeDiff / (1000 * 60 * 60))
      const days = Math.floor(totalHours / 24)
      const hours = totalHours % 24
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      if (days === 0) {
        if (hours === 0) {
          if (minutes === 0) {
            return `Expira em ${seconds}s`
          }
          return `Expira em ${minutes}min ${seconds}s`
        }
        return `Expira em ${hours}h ${minutes}min`
      } else if (days === 1) {
        return `Expira em ${days}d ${hours}h ${minutes}min`
      } else {
        return `Expira em ${days}d ${hours}h ${minutes}min`
      }
    },
    
    expirationProgressClass() {
      if (!this.accountExpiration || !this.userVIPData?.dataInicio) return ''
      
      const now = new Date()
      const startDate = new Date(this.userVIPData.dataInicio)
      const endDate = new Date(this.accountExpiration)
      
      const totalPlanTime = endDate - startDate
      const remainingTime = endDate - now
      
      if (totalPlanTime <= 0) return 'progress-expired'
      if (remainingTime <= 0) return 'progress-expired'
      
      const progressPercent = (remainingTime / totalPlanTime) * 100
      
      if (progressPercent <= 25) return 'progress-expired'
      if (progressPercent <= 50) return 'progress-warning'
      return 'progress-active'
    },

    expirationProgressPercent() {
      if (!this.accountExpiration || !this.userVIPData?.dataInicio) return 0
      
      const now = new Date()
      const startDate = new Date(this.userVIPData.dataInicio)
      const endDate = new Date(this.accountExpiration)
      
      const totalPlanTime = endDate - startDate
      const remainingTime = endDate - now
      
      if (totalPlanTime <= 0) return 0
      if (remainingTime <= 0) return 100
      
      const progressPercent = (remainingTime / totalPlanTime) * 100
      return Math.min(100, Math.max(0, progressPercent))
    }
  },
  
  watch: {
    currentUser: {
      handler(newUser) {
        if (newUser && newUser.id) {
          this.loadUserVIPData()
        } else {
          this.userVIPData = null
        }
      },
      immediate: true
    }
  },
  
  methods: {
    async loadUserVIPData() {
      try {
        if (!this.currentUser || !this.currentUser.id) {
          console.log('👤 Usuário não logado, não carregando dados VIP')
          return
        }
        
        if (!this.isVIP) {
          console.log('👤 Usuário não é VIP, não carregando dados VIP')
          return
        }
        
        const response = await axios.get('/api/vip/my-status')
        
        if (response.data && response.data.success && response.data.vipStatus) {
          this.userVIPData = response.data.vipStatus
        } else {
          this.userVIPData = false
        }
      } catch (error) {
        console.error('Erro ao carregar dados VIP:', error)
        this.userVIPData = false
      }
    },
    
    startCountdownTimer() {
      this.stopCountdownTimer()
      
      this.countdownTimer = setInterval(() => {
        this.$forceUpdate()
        
        if (this.isVIP && this.currentUser) {
          this.loadUserVIPData()
        }
      }, 30000)
    },
    
    stopCountdownTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    
    toggleUserModal() {
      this.showUserModal = !this.showUserModal
    },
    
    closeUserModal() {
      this.showUserModal = false
    },
    
    goToProfile() {
      this.closeUserModal()
      this.$router.push('/profile')
    },
    
    goToSettings() {
      this.closeUserModal()
      this.$router.push('/settings')
    },
    
    goToVIPAdmin() {
      this.closeUserModal()
      this.$router.push('/vip-admin')
    },
    
    goToAdmin() {
      this.closeUserModal()
      this.$router.push('/admin')
    },
    
    async logout() {
      try {
        await this.$store.dispatch('logout')
        this.closeUserModal()
        this.$router.push('/login')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    },
    
    toggleTheme() {
      console.log('🔄 Toggle de tema chamado!')
      console.log('Tema atual:', this.currentTheme)
      
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
      console.log('Novo tema:', newTheme)
      
      // Aplicar tema diretamente
      const html = document.documentElement
      const body = document.body
      
      html.classList.remove('theme-dark', 'theme-light')
      body.classList.remove('theme-dark', 'theme-light')
      
      if (newTheme === 'light') {
        html.setAttribute('data-theme', 'light')
        html.classList.add('theme-light')
        body.classList.add('theme-light')
      } else {
        html.setAttribute('data-theme', 'dark')
        html.classList.add('theme-dark')
        body.classList.add('theme-dark')
      }
      
      // Atualizar estado local
      this.currentTheme = newTheme
      
      // Salvar no localStorage
      localStorage.setItem('app_theme', newTheme)
      
      console.log('Tema alterado para:', newTheme)
    }
  },
  
  mounted() {
    console.log('🔧 Header.vue mounted')
    
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('app_theme')
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      this.currentTheme = savedTheme
    }
    
    this.loadUserVIPData()
    this.startCountdownTimer()
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.showUserModal) {
        this.closeUserModal()
      }
    })
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.closeUserModal)
    this.stopCountdownTimer()
  }
}
</script>

<style lang="scss" scoped>
/* Transições globais para mudanças de tema */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.app-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: 
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  .app-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent-primary);
    margin: 0;
    transition: color 0.3s ease;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-size: 18px;

  &:hover {
    background: var(--bg-overlay);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.user-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-overlay);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.user-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px 0;
  z-index: 10000;
}

.user-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  margin-right: 20px;
  margin-top: 70px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-overlay);
    color: var(--text-primary);
  }
}

.modal-content {
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: 20px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.active {
    background: #00ff88;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
  }
  &.warning {
    background: #ffd700;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }
  &.expired {
    background: #ff6b6b;
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
  }
}

.premium-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  i {
    font-size: 10px;
  }
}

.user-account-type {
  margin-bottom: 16px;
}

.account-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.account-type-basic {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: #ffffff;
}

.account-type-premium {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #ffffff;
}

.account-type-vip {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  animation: vipGlow 2s ease-in-out infinite alternate;
}

@keyframes vipGlow {
  from {
    box-shadow: 0 1px 3px rgba(255, 215, 0, 0.3);
  }
  to {
    box-shadow: 0 2px 6px rgba(255, 215, 0, 0.5);
  }
}

.vip-status {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  
  i {
    font-size: 12px;
  }
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  justify-content: flex-start;
  transition: color 0.3s ease;
}

.expiration-text {
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.3s ease;
  
  &.loading {
    color: var(--text-secondary);
  }
  
  &.error {
    color: #ff6b6b;
  }
}

.expiration-progress {
  margin-top: 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.progress-label {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.progress-percentage {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s ease;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
  }
  
  &.progress-active {
    background: linear-gradient(90deg, #00ff88, #00cc6a, #00ff88);
    background-size: 200% 100%;
    animation: gradientMove 3s ease infinite;
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
  }
  
  &.progress-warning {
    background: linear-gradient(90deg, #ffc107, #e0a800, #ffc107);
    background-size: 200% 100%;
    animation: gradientMove 2s ease infinite;
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.6);
  }
  
  &.progress-expired {
    background: linear-gradient(90deg, #dc3545, #c82333, #dc3545);
    background-size: 200% 100%;
    animation: gradientMove 1.5s ease infinite;
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.6);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: var(--bg-overlay);
    border-color: var(--accent-primary);
    transform: translateY(-1px);
  }
  
  i {
    font-size: 14px;
    color: var(--text-secondary);
    transition: color 0.3s ease;
  }
  
  &.logout-btn {
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.3);
    
    &:hover {
      background: rgba(255, 107, 107, 0.1);
      border-color: #ff6b6b;
    }
    
    i {
      color: #ff6b6b;
    }
  }
  
  &.vip-admin-btn {
    color: #ffd700;
    border-color: rgba(255, 215, 0, 0.3);
    
    &:hover {
      background: rgba(255, 215, 0, 0.1);
      border-color: #ffd700;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }
    
    i {
      color: #ffd700;
    }
  }
  
  &.admin-btn {
    color: #007bff;
    border-color: rgba(0, 123, 255, 0.3);
    
    &:hover {
      background: rgba(0, 123, 255, 0.1);
      border-color: #007bff;
      box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
    }
    
    i {
      color: #007bff;
    }
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 56px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .user-modal {
    width: 280px;
  }
  
  .modal-content {
    padding: 16px;
  }
}
</style>
