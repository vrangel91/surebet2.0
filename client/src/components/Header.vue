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
        
        <!-- Notificações -->
        <button 
          class="notifications-btn"
          @click="toggleNotificationsModal"
          :title="`Notificações (${unreadCount} não lidas)`"
        >
          <i class="bi bi-bell-fill"></i>
          <span v-if="unreadCount > 0" class="notifications-badge">{{ unreadCount }}</span>
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
          <div v-if="isVIP && !isVIPExpired" class="vip-status">
            <div class="vip-badge">
              <span class="vip-icon">⭐</span>
              <span class="vip-text">VIP</span>
              <span v-if="vipDaysRemaining > 0" class="vip-days">
                {{ vipDaysRemaining }}d
              </span>
            </div>
          </div>
          
          <!-- Status Básico -->
          <div v-else class="basic-status">
            <div class="basic-badge">
              <span class="basic-icon">👤</span>
              <span class="basic-text">BÁSICO</span>
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
    
    <!-- Modal de Notificações -->
    <div 
      v-if="showNotificationsModal" 
      class="notifications-modal-overlay"
      @click="closeNotificationsModal"
    >
      <div class="notifications-modal">
        <!-- Cabeçalho do modal -->
        <div class="modal-header">
          <h3>Notificações</h3>
          <div class="notifications-actions">
            <button 
              v-if="unreadCount > 0"
              class="mark-all-read-btn" 
              @click="markAllAsRead"
              :disabled="markingAllAsRead"
            >
              {{ markingAllAsRead ? 'Marcando...' : 'Marcar todas como lidas' }}
            </button>
            <button class="close-btn" @click="closeNotificationsModal">×</button>
          </div>
        </div>
        
        <!-- Conteúdo do modal -->
        <div class="modal-content">
          <!-- Loading State -->
          <div v-if="loadingNotifications" class="loading-notifications">
            <div class="loading-spinner"></div>
            <p>Carregando notificações...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="notifications.length === 0" class="empty-notifications">
            <i class="bi bi-bell-slash"></i>
            <h4>Nenhuma notificação</h4>
            <p>Você está em dia com suas notificações!</p>
          </div>
          
          <!-- Lista de Notificações -->
          <div v-else class="notifications-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id" 
              class="notification-item"
              :class="{
                'unread': !notification.is_read,
                'dismissed': notification.is_dismissed,
                [`priority-${notification.priority}`]: notification.priority,
                [`type-${notification.type}`]: notification.type
              }"
            >
              <div class="notification-header">
                <div class="notification-type-icon">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <h5 class="notification-title">{{ notification.title }}</h5>
                  <p class="notification-message">{{ notification.message }}</p>
                  <div class="notification-meta">
                    <span class="notification-date">{{ formatDate(notification.created_at) }}</span>
                    <span class="notification-priority" :class="notification.priority">
                      {{ getPriorityText(notification.priority) }}
                    </span>
                  </div>
                </div>
                <div class="notification-actions">
                  <button 
                    v-if="!notification.is_read"
                    class="mark-read-btn" 
                    @click="markAsRead(notification.id)"
                    title="Marcar como lida"
                  >
                    <i class="bi bi-check2"></i>
                  </button>
                  <button 
                    class="dismiss-btn" 
                    @click="dismissNotification(notification.id)"
                    title="Descartar"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sistema de Toast para Notificações -->
    <div class="toast-container">
      <div 
        v-for="toast in activeToasts" 
        :key="toast.id"
        class="toast-notification"
        :class="[
          `toast-${toast.type}`,
          `toast-${toast.priority}`,
          { 'toast-showing': toast.showing, 'toast-hiding': toast.hiding }
        ]"
      >
        <div class="toast-header">
          <div class="toast-type-icon">
            <i :class="getNotificationIcon(toast.type)"></i>
          </div>
          <div class="toast-content">
            <h6 class="toast-title">{{ toast.title }}</h6>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click="closeToast(toast.id)">
            <i class="bi bi-x"></i>
          </button>
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
      showNotificationsModal: false,
      userVIPData: null,
      countdownTimer: null,
      currentTheme: 'dark', // Tema padrão
      
      // Sistema de notificações
      notifications: [],
      loadingNotifications: false,
      markingAllAsRead: false,
      unreadCount: 0,
      
      // Sistema de toast
      activeToasts: [],
      toastCounter: 0,
      
      // Polling de notificações
      notificationsPolling: null
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
    },

    vipDaysRemaining() {
      if (!this.accountExpiration) return 0;
      const now = new Date();
      const expiration = new Date(this.accountExpiration);
      const timeDiff = expiration - now;
      return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    },

    isVIPExpired() {
      if (!this.accountExpiration) return false;
      const now = new Date();
      const expiration = new Date(this.accountExpiration);
      return now > expiration;
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
    
    // Métodos de Notificações
    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal
      if (this.showNotificationsModal) {
        this.loadNotifications()
      }
    },
    
    closeNotificationsModal() {
      this.showNotificationsModal = false
    },
    
    async loadNotifications() {
      if (this.loadingNotifications) return
      
      this.loadingNotifications = true
      try {
        const response = await axios.get('/api/notifications')
        if (response.data.success) {
          this.notifications = response.data.notifications || []
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      } finally {
        this.loadingNotifications = false
      }
    },
    
    async markAsRead(notificationId) {
      try {
        await axios.patch(`/api/notifications/${notificationId}/read`)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    },
    
    async dismissNotification(notificationId) {
      try {
        await axios.patch(`/api/notifications/${notificationId}/dismiss`)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.is_dismissed = true
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Erro ao descartar notificação:', error)
      }
    },
    
    async markAllAsRead() {
      if (this.markingAllAsRead) return
      
      this.markingAllAsRead = true
      try {
        await axios.patch('/api/notifications/read-all')
        this.notifications.forEach(n => n.is_read = true)
        this.updateUnreadCount()
      } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error)
      } finally {
        this.markingAllAsRead = false
      }
    },
    
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.is_read && !n.is_dismissed).length
    },
    
    getNotificationIcon(type) {
      const icons = {
        info: 'bi bi-info-circle-fill',
        success: 'bi bi-check-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        error: 'bi bi-x-circle-fill',
        update: 'bi bi-arrow-clockwise'
      }
      return icons[type] || 'bi bi-bell-fill'
    },
    
    getPriorityText(priority) {
      const priorities = {
        low: 'Baixa',
        normal: 'Normal',
        high: 'Alta',
        urgent: 'Urgente'
      }
      return priorities[priority] || priority
    },
    
    formatDate(date) {
      if (!date) return ''
      const now = new Date()
      const notificationDate = new Date(date)
      const diffMs = now - notificationDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Agora'
      if (diffMins < 60) return `${diffMins}min atrás`
      if (diffHours < 24) return `${diffHours}h atrás`
      if (diffDays < 7) return `${diffDays}d atrás`
      
      return notificationDate.toLocaleDateString('pt-BR')
    },
    
    // Sistema de Toast
    showToast(notification) {
      const toast = {
        id: ++this.toastCounter,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        showing: false,
        hiding: false
      }
      
      this.activeToasts.push(toast)
      
      // Animar entrada
      setTimeout(() => {
        toast.showing = true
      }, 100)
      
      // Auto-remover após 5 segundos
      setTimeout(() => {
        this.closeToast(toast.id)
      }, 5000)
    },
    
    closeToast(toastId) {
      const toast = this.activeToasts.find(t => t.id === toastId)
      if (toast) {
        toast.hiding = true
        setTimeout(() => {
          const index = this.activeToasts.findIndex(t => t.id === toastId)
          if (index > -1) {
            this.activeToasts.splice(index, 1)
          }
        }, 300)
      }
    },
    
    // Polling de notificações
    startNotificationsPolling() {
      this.notificationsPolling = setInterval(async () => {
        try {
          const response = await axios.get('/api/notifications/unread-count')
          if (response.data.success) {
            const newCount = response.data.count || 0
            if (newCount > this.unreadCount) {
              // Nova notificação, carregar e mostrar toast
              await this.loadNotifications()
              const newNotifications = this.notifications.filter(n => !n.is_read && !n.is_dismissed)
              newNotifications.forEach(n => this.showToast(n))
            }
            this.unreadCount = newCount
          }
        } catch (error) {
          console.error('Erro no polling de notificações:', error)
        }
      }, 30000) // Verificar a cada 30 segundos
    },
    
    stopNotificationsPolling() {
      if (this.notificationsPolling) {
        clearInterval(this.notificationsPolling)
        this.notificationsPolling = null
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
    
    // Inicializar sistema de notificações
    this.loadNotifications()
    this.startNotificationsPolling()
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.showUserModal) {
        this.closeUserModal()
      }
      if (e.key === 'Escape' && this.showNotificationsModal) {
        this.closeNotificationsModal()
      }
    })
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.closeUserModal)
    this.stopCountdownTimer()
    this.stopNotificationsPolling()
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

.notifications-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-size: 18px;
  position: relative;

  &:hover {
    background: var(--bg-overlay);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.notifications-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--accent-error);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
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

.vip-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.3);
  }

  .vip-icon {
    font-size: 16px;
    color: #ff6b6b;
  }

  .vip-text {
    color: #ff6b6b;
  }

  .vip-days {
    font-weight: 700;
    color: #ff6b6b;
  }
}

.basic-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
  background: rgba(108, 117, 125, 0.1);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(108, 117, 125, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(108, 117, 125, 0.2);
    border-color: rgba(108, 117, 125, 0.3);
  }

  .basic-icon {
    font-size: 16px;
    color: #6c757d;
  }

  .basic-text {
    color: #6c757d;
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

/* Modal de Notificações */
.notifications-modal-overlay {
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

.notifications-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  margin-right: 20px;
  margin-top: 70px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notifications-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark-all-read-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--accent-secondary);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-notifications {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-tertiary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-notifications {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);

  i {
    font-size: 48px;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-overlay);
  }

  &.unread {
    background: rgba(0, 123, 255, 0.05);
    border-left: 3px solid var(--accent-primary);
  }

  &.dismissed {
    opacity: 0.6;
  }

  &.priority-urgent {
    border-left-color: #dc3545;
  }

  &.priority-high {
    border-left-color: #ff6b35;
  }

  &.priority-normal {
    border-left-color: #ffc107;
  }

  &.priority-low {
    border-left-color: #6c757d;
  }
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-type-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;

  .bi-info-circle-fill {
    color: #007bff;
  }

  .bi-check-circle-fill {
    color: #28a745;
  }

  .bi-exclamation-triangle-fill {
    color: #ffc107;
  }

  .bi-x-circle-fill {
    color: #dc3545;
  }

  .bi-arrow-clockwise {
    color: #6f42c1;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
}

.notification-date {
  color: var(--text-tertiary);
}

.notification-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;

  &.urgent {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
  }

  &.high {
    background: rgba(255, 107, 53, 0.2);
    color: #ff6b35;
  }

  &.normal {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }

  &.low {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
  }
}

.notification-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.mark-read-btn,
.dismiss-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;

  &:hover {
    background: var(--bg-overlay);
  }
}

.mark-read-btn {
  color: #28a745;

  &:hover {
    color: #20c997;
  }
}

.dismiss-btn {
  color: #6c757d;

  &:hover {
    color: #dc3545;
  }
}

/* Sistema de Toast */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast-notification {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  border-left: 4px solid;

  &.toast-showing {
    transform: translateX(0);
    opacity: 1;
  }

  &.toast-hiding {
    transform: translateX(100%);
    opacity: 0;
  }

  &.toast-info {
    border-left-color: #007bff;
  }

  &.toast-success {
    border-left-color: #28a745;
  }

  &.toast-warning {
    border-left-color: #ffc107;
  }

  &.toast-error {
    border-left-color: #dc3545;
  }

  &.toast-update {
    border-left-color: #6f42c1;
  }

  &.toast-urgent {
    border-left-color: #dc3545;
    animation: urgentPulse 1s infinite;
  }

  &.toast-high {
    border-left-color: #ff6b35;
  }

  &.toast-normal {
    border-left-color: #ffc107;
  }

  &.toast-low {
    border-left-color: #6c757d;
  }
}

@keyframes urgentPulse {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}

.toast-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-type-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-message {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  font-size: 14px;

  &:hover {
    background: var(--bg-overlay);
    color: var(--text-primary);
  }
}

/* Responsividade para notificações */
@media (max-width: 768px) {
  .notifications-modal {
    width: 320px;
    margin-right: 10px;
  }

  .toast-container {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .toast-notification {
    padding: 12px;
  }
}
</style>
