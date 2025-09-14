<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Mobile Hamburger Button (visível apenas em telas menores) -->
      <button 
        v-if="!isDesktop" 
        class="hamburger-button" 
        @click="toggleMobileMenu"
        :class="{ active: mobileMenuOpen }"
        :title="mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'"
        :aria-label="mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'"
        :aria-expanded="mobileMenuOpen"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Logo/Título -->
      <div class="header-left">
        <h1 class="app-title">SureBets</h1>
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
              <h4 class="username">{{ getUserDisplayName() }}</h4>
              <span class="user-status">
                <span class="status-dot" :class="accountStatusClass"></span>
                {{ accountStatusText }}
              </span>
            </div>
          </div>
          
          <!-- Tipo de Plano -->
          <div class="user-plan-info">
            <span class="plan-badge" :class="getPlanBadgeClass()">
              {{ getPlanDisplayName(userAccountType) }}
            </span>
          </div>
          
          <!-- Status Básico -->
          <div v-if="!isVIP || isVIPExpired" class="basic-status">
            <div class="basic-badge">
              <span class="basic-icon">👤</span>
              <span class="basic-text">BÁSICO</span>
            </div>
          </div>
          
          <!-- Informações VIP -->
          <div v-if="currentUserVIPPlan && currentUserVIPExpiration" class="vip-info-section">
            <div class="vip-info-header">
              <div class="vip-badge">
                <span class="vip-icon">👑</span>
                <span class="vip-text">{{ currentUserVIPPlan }}</span>
                <span v-if="getDaysRemaining(currentUserVIPExpiration) > 0" class="vip-days">
                  {{ getDaysRemaining(currentUserVIPExpiration) }}d
                </span>
              </div>
            </div>
            
            <!-- Informações de Expiração -->
            <div class="expiration-info">
              <div class="expiration-text" :class="getDaysRemainingClass(currentUserVIPExpiration)">
                <span v-if="getDaysRemaining(currentUserVIPExpiration) > 0">
                  Expira em {{ formatDate(currentUserVIPExpiration) }}
                </span>
                <span v-else>
                  Expirado em {{ formatDate(currentUserVIPExpiration) }}
                </span>
              </div>
            </div>
            
            <!-- Status VIP -->
            <div class="vip-status-info">
              <span class="status-badge" :class="getVIPStatus(currentUserVIPExpiration).class">
                {{ getVIPStatus(currentUserVIPExpiration).label }}
              </span>
            </div>
            
            <!-- Barra de Progresso VIP -->
            <div v-if="getDaysRemaining(currentUserVIPExpiration) > 0" class="vip-progress-container">
              <div class="vip-progress-info">
                <span class="progress-label">Dias restantes</span>
                <span class="progress-days">{{ getDaysRemaining(currentUserVIPExpiration) }} dias</span>
              </div>
              <div class="vip-progress-bar">
                <div 
                  class="vip-progress-fill"
                  :class="getDaysRemainingClass(currentUserVIPExpiration)"
                  :style="{ width: getVIPProgressPercent(currentUserVIPExpiration) + '%' }"
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
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'Header',
  setup() {
    const { currentTheme, toggleTheme, loadTheme } = useTheme()
    return { currentTheme, toggleTheme, loadTheme }
  },
  data() {
    return {
      showUserModal: false,
      showNotificationsModal: false,
      userVIPData: null,
      currentUserVIPPlan: null, // Plano VIP do usuário atual
      currentUserVIPExpiration: null, // Data de expiração do VIP do usuário atual
      countdownTimer: null,
      
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
    
    // Mobile menu state from store
    mobileMenuOpen() {
      return this.$store.getters.mobileMenuOpen
    },
    
    windowWidth() {
      return this.$store.getters.windowWidth
    },
    
    isDesktop() {
      return this.$store.getters.isDesktop
    },
    
    isMobile() {
      return this.$store.getters.isMobile
    },
    
    isTablet() {
      return this.$store.getters.isTablet
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
      // Determinar o tipo de PLANO (não o tipo de conta/role)
      if (!this.currentUser) {
        console.log('🔍 [Header] userAccountType: Usuário não logado')
        return 'basic'
      }
      
      console.log('🔍 [Header] userAccountType - Propriedades do usuário:', {
        is_admin: this.currentUser.is_admin,
        is_vip: this.currentUser.is_vip,
        isPremium: this.currentUser.isPremium,
        account_type: this.currentUser.account_type,
        role: this.currentUser.role,
        plan_id: this.currentUser.plan_id,
        plan_name: this.currentUser.plan_name,
        plan_type: this.currentUser.plan_type,
        currentUserVIPPlan: this.currentUserVIPPlan
      })
      
      // PRIORIDADE 1: Plano VIP real do usuário (mesmo método do VIPAdminView.vue)
      if (this.currentUserVIPPlan) {
        console.log('🔍 [Header] userAccountType: Usando plano VIP real:', this.currentUserVIPPlan)
        return this.currentUserVIPPlan
      }
      
      // PRIORIDADE 2: plan_name do usuário
      if (this.currentUser.plan_name) {
        console.log('🔍 [Header] userAccountType: Usando plan_name:', this.currentUser.plan_name)
        return this.currentUser.plan_name
      }
      
      // PRIORIDADE 3: plan_type do usuário
      if (this.currentUser.plan_type) {
        console.log('🔍 [Header] userAccountType: Usando plan_type:', this.currentUser.plan_type)
        return this.currentUser.plan_type
      }
      
      // PRIORIDADE 4: Flags de VIP/Premium
      if (this.currentUser.is_vip) {
        console.log('🔍 [Header] userAccountType: Detectado como VIP')
        return 'vip'
      }
      
      if (this.currentUser.isPremium) {
        console.log('🔍 [Header] userAccountType: Detectado como PREMIUM')
        return 'premium'
      }
      
      // PRIORIDADE 5: Admin sem plano específico
      if (this.currentUser.is_admin) {
        console.log('🔍 [Header] userAccountType: Admin sem plano específico, usando basic')
        return 'basic'
      }
      
      // Fallback para account_type ou basic
      const result = this.currentUser.account_type || 'basic'
      console.log('🔍 [Header] userAccountType: Resultado final:', result)
      return result
    },
    userAccountTypeDisplay() {
      return this.getPlanDisplayName(this.userAccountType)
    },
    userAccountTypeClass() {
      return `account-type-${this.userAccountType}`
    },
    
    accountExpiration() {
      // Garantir que userVIPData seja válido antes de acessar propriedades
      if (!this.userVIPData || typeof this.userVIPData !== 'object') {
        return null
      }
      return this.userVIPData.dataFim || null
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
    
    vipDaysRemaining() {
      if (!this.accountExpiration) return 0;
      
      try {
        const end = new Date(this.accountExpiration);
        const now = new Date();
        
        // Verificar se a data é válida
        if (isNaN(end.getTime())) {
          console.warn('Data de expiração VIP inválida:', this.accountExpiration);
          return 0;
        }
        
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays); // Garantir que não retorne negativo
      } catch (error) {
        console.error('Erro ao calcular dias restantes VIP:', error);
        return 0;
      }
    },

    isVIPExpired() {
      if (!this.accountExpiration) return false;
      
      try {
        const now = new Date();
        const expiration = new Date(this.accountExpiration);
        
        // Verificar se a data é válida
        if (isNaN(expiration.getTime())) {
          console.warn('Data de expiração VIP inválida:', this.accountExpiration);
          return false;
        }
        
        return now > expiration;
      } catch (error) {
        console.error('Erro ao verificar expiração VIP:', error);
        return false;
      }
    },

    // Cálculo do progresso VIP para a barra de progresso
    vipProgressPercent() {
      if (!this.userVIPData?.dataInicio || !this.accountExpiration) return 0;
      
      try {
        const now = new Date();
        const startDate = new Date(this.userVIPData.dataInicio);
        const endDate = new Date(this.accountExpiration);
        
        // Verificar se as datas são válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return 0;
        }
        
        const totalDuration = endDate - startDate;
        const remainingTime = endDate - now;
        
        if (totalDuration <= 0) return 0;
        if (remainingTime <= 0) return 100; // VIP expirado
        
        const progressPercent = (remainingTime / totalDuration) * 100;
        return Math.min(100, Math.max(0, progressPercent));
      } catch (error) {
        console.error('Erro ao calcular progresso VIP:', error);
        return 0;
      }
    },

    // Classe CSS para a barra de progresso baseada no status
    vipProgressClass() {
      if (!this.accountExpiration) return 'progress-neutral';
      
      const now = new Date();
      const expiration = new Date(this.accountExpiration);
      const timeDiff = expiration - now;
      const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (timeDiff < 0) return 'progress-expired';
      if (daysRemaining <= 1) return 'progress-critical';
      if (daysRemaining <= 3) return 'progress-warning';
      if (daysRemaining <= 7) return 'progress-attention';
      return 'progress-healthy';
    }
  },
  
  watch: {
    currentUser: {
      handler(newUser) {
        if (newUser && newUser.id) {
          this.loadUserVIPData()
          this.loadCurrentUserVIPPlan()
        } else {
          this.userVIPData = null
          this.currentUserVIPPlan = null
          this.currentUserVIPExpiration = null
        }
      },
      immediate: true
    },
    
    // Watcher para reagir quando os planos forem carregados
    '$store.getters.plansLoaded': {
      handler(plansLoaded) {
        if (plansLoaded) {
          console.log('📋 [Header] Planos carregados no store')
          // Removido $forceUpdate desnecessário - Vue reatividade já cuida disso
        }
      },
      immediate: true
    }
  },
  
  methods: {
    // Mobile menu methods
    toggleMobileMenu() {
      this.$store.commit('toggleMobileMenu')
    },
    
    handleResize() {
      this.$store.commit('setWindowWidth', window.innerWidth)
    },
    
    async loadUserVIPData() {
      try {
        console.log('🔍 [Header] Carregando dados VIP...')
        console.log('🔍 [Header] Current user:', this.currentUser)
        console.log('🔍 [Header] User ID:', this.currentUser?.id)
        console.log('🔍 [Header] Is VIP:', this.isVIP)
        
        if (!this.currentUser || !this.currentUser.id) {
          console.log('👤 [Header] Usuário não logado, não carregando dados VIP')
          this.userVIPData = null
          return
        }
        
        // Verificar se o usuário é VIP antes de fazer a requisição
        if (!this.isVIP) {
          console.log('👤 [Header] Usuário não é VIP, não carregando dados VIP')
          this.userVIPData = null
          return
        }
        
        // Verificar se o usuário tem role VIP no store
        const userRole = this.currentUser?.role || this.currentUser?.accountType
        const isVipUser = userRole === 'vip' || userRole === 'VIP' || this.currentUser?.is_vip
        
        console.log('🔍 [Header] User role:', userRole)
        console.log('🔍 [Header] Is VIP user:', isVipUser)
        
        if (!isVipUser) {
          console.log('👤 [Header] Usuário não tem role VIP, não carregando dados VIP')
          this.userVIPData = null
          return
        }
        
        console.log('🔄 [Header] Carregando dados VIP do usuário...')
        const response = await axios.get('/api/vip/my-status')
        
        console.log('🔍 [Header] Response status:', response.status)
        console.log('🔍 [Header] Response headers:', response.headers)
        console.log('🔍 [Header] Response data (raw):', response.data)
        
        if (response.data && response.data.success && response.data.vipStatus) {
          this.userVIPData = response.data.vipStatus
          console.log('✅ [Header] Dados VIP carregados:', this.userVIPData)
        } else {
          console.log('⚠️ [Header] Resposta VIP sem dados válidos:', response.data)
          this.userVIPData = null
        }
      } catch (error) {
        // Tratar diferentes tipos de erro
        if (error.response?.status === 404) {
          console.log('ℹ️ Usuário não possui dados VIP (404) - Normal para usuários não-VIP')
          this.userVIPData = null
        } else if (error.response?.status === 401) {
          console.log('🔒 Usuário não autenticado para dados VIP (401)')
          this.userVIPData = null
        } else if (error.response?.status === 403) {
          console.log('🚫 Acesso negado aos dados VIP (403)')
          this.userVIPData = null
        } else {
          // Só logar como erro se não for um 404 (que é normal para usuários não-VIP)
          console.warn('⚠️ Erro ao carregar dados VIP:', error.response?.status || error.message)
          this.userVIPData = null
        }
      }
    },
    
    startCountdownTimer() {
      this.stopCountdownTimer()
      
      // Reduzir frequência e remover $forceUpdate desnecessário
      this.countdownTimer = setInterval(() => {
        // Só recarregar dados VIP se o usuário for VIP e estiver logado
        if (this.isVIP && this.currentUser && this.currentUser.id) {
          this.loadUserVIPData()
        }
      }, 300000) // Aumentado para 5 minutos (era 30 segundos)
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
          this.notifications = response.data.data || []
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
        const notification = this.notifications && Array.isArray(this.notifications) 
          ? this.notifications.find(n => n.id === notificationId)
          : null;
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
        const notification = this.notifications && Array.isArray(this.notifications) 
          ? this.notifications.find(n => n.id === notificationId)
          : null;
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
        await axios.patch('/api/notifications/mark-all-read')
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
      const toast = this.activeToasts && Array.isArray(this.activeToasts) 
        ? this.activeToasts.find(t => t.id === toastId)
        : null;
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
            const newCount = response.data.data.unreadCount || 0
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
      }, 120000) // Aumentado para 2 minutos (era 30 segundos)
    },
    
    stopNotificationsPolling() {
      if (this.notificationsPolling) {
        clearInterval(this.notificationsPolling)
        this.notificationsPolling = null
      }
    },
    
    // toggleTheme agora vem do composable useTheme
    
    // Funções de mapeamento de planos
    getPlanDisplayName(planType) {
      console.log('🔍 [Header] getPlanDisplayName chamado com:', planType)
      console.log('🔍 [Header] Store plansLoaded:', this.$store.getters.plansLoaded)
      console.log('🔍 [Header] Store allPlans:', this.$store.getters.allPlans?.length || 0)
      
      // Primeiro tentar usar o store
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByType(planType)
        if (plan) {
          console.log('✅ [Header] Plano encontrado no store:', plan.display_name)
          return plan.display_name
        }
        
        // Tentar buscar por nome também
        const planByName = this.$store.getters.allPlans?.find(p => 
          p.name === planType || 
          p.type === planType || 
          p.display_name === planType
        )
        if (planByName) {
          console.log('✅ [Header] Plano encontrado por nome no store:', planByName.display_name)
          return planByName.display_name
        }
      }
      
      // Fallback para mapeamento dos planos do banco
      const planNames = {
        'basic': 'Plano Básico',
        'premium': 'Plano Premium', 
        'vip': 'Plano VIP',
        'pre-daily': 'Pré-Jogo Diário',
        'pre-weekly': 'Pré-Jogo Semanal',
        'pre-monthly': 'Pré-Jogo Mensal',
        'pre-yearly': 'Pré-Jogo Anual',
        'live-daily': 'Live Diário',
        'live-weekly': 'Live Semanal',
        'live-monthly': 'Live Mensal',
        'live-yearly': 'Live Anual',
        'prelive-daily': 'Pré+Live Diário',
        'prelive-weekly': 'Pré+Live Semanal',
        'prelive-monthly': 'Pré+Live Mensal',
        'prelive-yearly': 'Pré+Live Anual',
        'valuebet-daily': 'Valuebet Diário',
        'valuebet-weekly': 'Valuebet Semanal',
        'valuebet-monthly': 'Valuebet Mensal',
        'valuebet-yearly': 'Valuebet Anual',
        'full-daily': 'Full Diário',
        'full-weekly': 'Full Semanal',
        'full-monthly': 'Full Mensal',
        'full-yearly': 'Full Anual'
      }
      const result = planNames[planType] || planType || 'Plano Básico'
      console.log('⚠️ [Header] Usando fallback:', result)
      return result
    },
    
    getPlanTypeFromName(planName) {
      console.log('🔍 [Header] getPlanTypeFromName chamado com:', planName)
      
      // Primeiro tentar usar o store
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByDisplayName(planName)
        if (plan) {
          console.log('✅ [Header] Tipo encontrado no store:', plan.type)
          return plan.type
        }
      }
      
      // Fallback para mapeamento simples
      const typeMap = {
        'Básico': 'basic',
        'Premium': 'premium',
        'VIP': 'vip',
        'Administrador': 'admin'
      }
      const result = typeMap[planName] || 'basic'
      console.log('⚠️ [Header] Usando fallback para tipo:', result)
      return result
    },
    
    getPlanBadgeClass() {
      const planType = this.userAccountType
      console.log('🔍 [Header] getPlanBadgeClass chamado com planType:', planType)
      
      if (!planType) return 'basic'
      
      // Primeiro tentar usar o store para obter a classe correta
      if (this.$store.getters.plansLoaded) {
        const plan = this.$store.getters.getPlanByType(planType)
        if (plan) {
          // Usar o tipo do plano para a classe CSS
          const result = plan.type || planType
          console.log('✅ [Header] Classe encontrada no store:', result)
          return result
        }
      }
      
      // Fallback para mapeamento dos planos do banco
      const planClasses = {
        'basic': 'basic',
        'premium': 'premium',
        'vip': 'vip',
        'pre-daily': 'pre-daily',
        'pre-weekly': 'pre-weekly',
        'pre-monthly': 'pre-monthly',
        'pre-yearly': 'pre-yearly',
        'live-daily': 'live-daily',
        'live-weekly': 'live-weekly',
        'live-monthly': 'live-monthly',
        'live-yearly': 'live-yearly',
        'prelive-daily': 'prelive-daily',
        'prelive-weekly': 'prelive-weekly',
        'prelive-monthly': 'prelive-monthly',
        'prelive-yearly': 'prelive-yearly',
        'valuebet-daily': 'valuebet-daily',
        'valuebet-weekly': 'valuebet-weekly',
        'valuebet-monthly': 'valuebet-monthly',
        'valuebet-yearly': 'valuebet-yearly',
        'full-daily': 'full-daily',
        'full-weekly': 'full-weekly',
        'full-monthly': 'full-monthly',
        'full-yearly': 'full-yearly'
      }
      const result = planClasses[planType] || 'basic'
      console.log('⚠️ [Header] Usando fallback para classe:', result)
      return result
    },
    
    // Carregar planos do banco de dados
    async loadPlans() {
      try {
        console.log('📋 [Header] Carregando planos...')
        
        // Tentar carregar diretamente da API
        const response = await axios.get('/api/plans', {
          timeout: 10000
        })
        
        if (response.data && response.data.success && response.data.plans) {
          // Atualizar store com os planos
          this.$store.dispatch('setPlans', response.data.plans)
          console.log('✅ [Header] Planos carregados da API:', response.data.plans.length)
        } else {
          console.warn('⚠️ [Header] Resposta da API inválida:', response.data)
        }
      } catch (error) {
        console.error('❌ [Header] Erro ao carregar planos:', error)
        console.error('📋 [Header] Detalhes do erro:', error.response?.data)
      }
    },
    
    // Buscar plano VIP do usuário atual (igual ao VIPAdminView.vue)
    async loadCurrentUserVIPPlan() {
      try {
        console.log('🔍 [Header] Buscando plano VIP do usuário atual...')
        
        if (!this.currentUser?.id) {
          console.log('👤 [Header] Usuário não logado, não buscando plano VIP')
          return
        }
        
        // Buscar VIPs ativos (mesma API do VIPAdminView.vue)
        const response = await axios.get('/api/vip/active')
        console.log('📊 [Header] Resposta da API VIPs ativos:', response.data)
        
        if (response.data && response.data.activeVIPs) {
          // Encontrar o VIP do usuário atual
          const userVIP = response.data.activeVIPs.find(vip => vip.userId === this.currentUser.id)
          
          if (userVIP) {
            console.log('✅ [Header] Plano VIP encontrado para o usuário:', userVIP.planName)
            console.log('✅ [Header] Data de expiração:', userVIP.dataFim)
            // Armazenar o plano VIP e data de expiração do usuário
            this.currentUserVIPPlan = userVIP.planName
            this.currentUserVIPExpiration = userVIP.dataFim
          } else {
            console.log('ℹ️ [Header] Usuário não possui VIP ativo')
            this.currentUserVIPPlan = null
            this.currentUserVIPExpiration = null
          }
        }
      } catch (error) {
        console.error('❌ [Header] Erro ao buscar plano VIP do usuário:', error)
        this.currentUserVIPPlan = null
      }
    },
    
    // Obter nome de exibição do usuário (mesma lógica do AdminView.vue)
    getUserDisplayName() {
      if (!this.currentUser) {
        return 'Usuário'
      }
      
      // Mesma lógica do AdminView.vue linha 1237
      const displayName = this.currentUser.name || 
                         this.currentUser.username || 
                         `${this.currentUser.first_name || ''} ${this.currentUser.last_name || ''}`.trim() || 
                         'Usuário'
      
      console.log('🔍 [Header] getUserDisplayName:', {
        name: this.currentUser.name,
        username: this.currentUser.username,
        first_name: this.currentUser.first_name,
        last_name: this.currentUser.last_name,
        result: displayName
      })
      
      return displayName
    },
    
    // Funções de cálculo de dias restantes (mesma lógica do VIPAdminView.vue)
    getDaysRemaining(endDate) {
      if (!endDate) return 0
      const end = new Date(endDate)
      const now = new Date()
      const diffTime = end - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    },
    
    getDaysRemainingClass(endDate) {
      const days = this.getDaysRemaining(endDate)
      if (days <= 0) return 'expired'
      if (days <= 1) return 'critical'
      if (days <= 3) return 'urgent'
      if (days <= 7) return 'warning'
      return 'success'
    },
    
    getVIPStatus(endDate) {
      const daysRemaining = this.getDaysRemaining(endDate)
      
      if (daysRemaining <= 0) {
        return { status: 'expired', label: 'Expirado', class: 'expired' }
      } else if (daysRemaining <= 1) {
        return { status: 'critical', label: 'Crítico (1 dia)', class: 'critical' }
      } else if (daysRemaining <= 3) {
        return { status: 'urgent', label: 'Urgente (≤3 dias)', class: 'urgent' }
      } else if (daysRemaining <= 7) {
        return { status: 'expiring', label: 'Expirando (≤7 dias)', class: 'warning' }
      } else {
        return { status: 'active', label: 'Ativo', class: 'active' }
      }
    },
    
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('pt-BR')
    },
    
    // Calcular percentual de progresso VIP (baseado nos dias restantes)
    getVIPProgressPercent(endDate) {
      if (!endDate) return 0
      
      const daysRemaining = this.getDaysRemaining(endDate)
      
      // Assumir que o VIP tem 30 dias de duração (pode ser ajustado conforme necessário)
      const totalDays = 30
      const daysUsed = totalDays - daysRemaining
      
      if (daysUsed <= 0) return 100
      if (daysUsed >= totalDays) return 0
      
      return Math.round((daysUsed / totalDays) * 100)
    }
  },
  
  mounted() {
    console.log('🔧 [Header] Componente montado')
    console.log('🔧 [Header] Store state:', {
      isAuthenticated: this.$store.getters.isAuthenticated,
      currentUser: this.$store.getters.currentUser,
      isAdmin: this.$store.getters.isAdmin,
      isVIP: this.$store.getters.isVIP
    })
    console.log('👤 [Header] Usuário atual:', this.currentUser)
    console.log('👑 [Header] É VIP?', this.isVIP)
    console.log('👑 [Header] É Admin?', this.isAdmin)
    console.log('🔧 [Header] Estado inicial do componente:', {
      showUserModal: this.showUserModal,
      showNotificationsModal: this.showNotificationsModal,
      currentTheme: this.currentTheme,
      unreadCount: this.unreadCount
    })
    
    // Tema agora é gerenciado pelo composable useTheme
    
    // Carregar planos do banco de dados
    this.loadPlans()
    
    // Buscar plano VIP do usuário atual (mesmo método do VIPAdminView.vue)
    this.loadCurrentUserVIPPlan()
    
    this.loadUserVIPData()
    this.startCountdownTimer()
    
    // Inicializar sistema de notificações
    this.loadNotifications()
    this.startNotificationsPolling()
    
    // Event listeners
    window.addEventListener('resize', this.handleResize)
    
    // Inicializar largura da janela no store
    this.$store.commit('setWindowWidth', window.innerWidth)
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.showUserModal) {
        this.closeUserModal()
      }
      if (e.key === 'Escape' && this.showNotificationsModal) {
        this.closeNotificationsModal()
      }
      if (e.key === 'Escape' && this.mobileMenuOpen) {
        this.$store.commit('setMobileMenuOpen', false)
      }
    })
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
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
  position: relative;
}

/* Mobile Hamburger Button */
.hamburger-button {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 44px;
  min-height: 44px;
  z-index: 1001;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: var(--bg-hover);
    transform: scale(1.05);
  }
  
  &:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
  
  .hamburger-line {
    width: 20px;
    height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
    display: block;
  }
  
  &.active {
    .hamburger-line {
      &:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }
      
      &:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      
      &:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
      }
    }
  }
  
  &:hover .hamburger-line {
    background: var(--accent-primary);
  }
  
  &.active .hamburger-line {
    background: var(--accent-primary);
  }
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
  background: var(--overlay-light);
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
  box-shadow: var(--shadow-modal);
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
    background: var(--accent-primary);
    box-shadow: 0 0 8px var(--accent-primary);
  }
  &.warning {
    background: var(--warning);
    box-shadow: 0 0 8px var(--warning);
  }
  &.expired {
    background: var(--error);
    box-shadow: 0 0 8px var(--error);
  }
}

.premium-badge {
  background: var(--bg-gradient-purple-button);
  color: var(--text-button-purple);
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

.user-plan-info {
  margin-bottom: 16px;
  text-align: center;
  padding: 8px 0;
}

.plan-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  border: 2px solid transparent;
  
  &.basic {
    background: var(--text-tertiary);
    color: var(--text-button-neutral);
  }
  
  &.premium {
    background: var(--accent-primary);
    color: var(--text-button-primary);
  }
  
  &.vip {
    background: var(--warning);
    color: var(--text-button-warning);
  }
  
  &.admin {
    background: var(--info);
    color: var(--text-button-info);
    border-color: var(--info);
    box-shadow: 0 0 10px var(--info);
  }
  
  /* Estilos para planos pré-jogo */
  &.pre-daily,
  &.pre-weekly,
  &.pre-monthly,
  &.pre-yearly {
    background: var(--info);
    color: var(--text-button-info);
  }
  
  /* Estilos para planos live */
  &.live-daily,
  &.live-weekly,
  &.live-monthly,
  &.live-yearly {
    background: var(--error);
    color: var(--text-button-error);
  }
  
  /* Estilos para planos pré+live */
  &.prelive-daily,
  &.prelive-weekly,
  &.prelive-monthly,
  &.prelive-yearly {
    background: var(--info);
    color: var(--text-button-info);
  }
  
  /* Estilos para planos valuebet */
  &.valuebet-daily,
  &.valuebet-weekly,
  &.valuebet-monthly,
  &.valuebet-yearly {
    background: var(--warning);
    color: var(--text-button-warning);
  }
  
  /* Estilos para planos full */
  &.full-daily,
  &.full-weekly,
  &.full-monthly,
  &.full-yearly {
    background: var(--success);
    color: var(--text-button-success);
  }
}



.basic-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-tertiary);
  background: var(--badge-neutral-bg);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  .basic-icon {
    font-size: 16px;
    color: var(--text-tertiary);
  }

  .basic-text {
    color: var(--text-tertiary);
  }
}

/* Status Badge */
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  &.active {
    background: var(--success);
    color: var(--text-button-success);
  }
  
  &.expired {
    background: var(--error);
    color: var(--text-button-error);
  }
  
  &.warning {
    background: var(--warning);
    color: var(--text-button-warning);
  }
  
  &.critical {
    background: var(--error);
    color: var(--text-button-error);
    animation: pulse 1s ease-in-out infinite;
  }
  
  &.urgent {
    background: var(--warning-strong);
    color: var(--text-button-warning);
    animation: pulse 2s ease-in-out infinite;
  }
}

.vip-status-info {
  margin-bottom: 8px;
  text-align: center;
}

/* Seção de Informações VIP */
.vip-info-section {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.vip-info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary), var(--warning), var(--accent-primary));
  background-size: 200% 100%;
  animation: vipGradient 3s ease-in-out infinite;
}

@keyframes vipGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.vip-info-header {
  margin-bottom: 8px;
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-primary);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--accent-primary);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 255, 136, 0.2);

  &:hover {
    background: var(--accent-light);
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    transform: translateY(-1px);
  }

  .vip-icon {
    font-size: 16px;
    color: var(--accent-primary);
    text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
  }

  .vip-text {
    color: var(--text-primary);
  }

  .vip-days {
    font-weight: 700;
    color: var(--accent-primary);
  }
}

.expiration-info {
  margin-bottom: 8px;
}

.expiration-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  
  &.active {
    color: var(--text-secondary);
  }
  
  &.warning {
    color: var(--warning);
  }
  
  &.expired {
    color: var(--error);
  }
}

/* Barra de Progresso VIP */
.vip-progress-container {
  margin-top: 8px;
  padding: 0;
}

.vip-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
}

.progress-label {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.progress-percentage,
.progress-days {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 12px;
  transition: color 0.3s ease;
}

.vip-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--progress-bg);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-primary);
  box-shadow: inset 0 1px 2px var(--transparent-dark);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.vip-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &.success {
    background: var(--success);
  }
  
  &.warning {
    background: var(--warning);
    animation: warningPulse 1.5s ease-in-out infinite;
  }
  
  &.urgent {
    background: var(--warning-strong);
    animation: criticalPulse 1s ease-in-out infinite;
  }
  
  &.critical {
    background: var(--error);
    animation: criticalPulse 1s ease-in-out infinite;
  }
  
  &.expired {
    background: var(--text-tertiary);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
}

@keyframes warningPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes criticalPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
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
    color: var(--error);
  }
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
    color: var(--error);
    border-color: var(--border-error);
    
    &:hover {
      background: var(--bg-error);
      border-color: var(--error);
    }
    
    i {
      color: var(--error);
    }
  }
  
  &.vip-admin-btn {
    color: var(--warning);
    border-color: var(--border-warning);
    
    &:hover {
      background: var(--bg-warning);
      border-color: var(--warning);
      box-shadow: 0 0 15px var(--warning);
    }
    
    i {
      color: var(--warning);
    }
  }
  
  &.admin-btn {
    color: var(--info);
    border-color: var(--border-info);
    
    &:hover {
      background: var(--bg-info);
      border-color: var(--info);
      box-shadow: 0 0 15px var(--info);
    }
    
    i {
      color: var(--info);
    }
  }
}

@media (max-width: 1023px) {
  .hamburger-button {
    display: flex;
    order: -1; /* Colocar antes do logo */
    margin-right: 12px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 56px;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .app-title {
    font-size: 18px; /* Reduzir tamanho em mobile */
  }
  
  .header-right {
    gap: 8px; /* Reduzir gap entre elementos */
  }
  
  .hamburger-button {
    min-width: 40px;
    min-height: 40px;
    padding: 6px;
    margin-right: 8px;
    
    .hamburger-line {
      width: 18px;
      height: 2px;
    }
  }
  
  .theme-toggle-btn,
  .notifications-btn,
  .user-button {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 8px;
    height: 48px;
  }
  
  .app-title {
    font-size: 16px;
  }
  
  .header-right {
    gap: 4px;
  }
  
  .hamburger-button {
    min-width: 36px;
    min-height: 36px;
    padding: 4px;
    margin-right: 6px;
    
    .hamburger-line {
      width: 16px;
      height: 2px;
    }
  }
  
  .theme-toggle-btn,
  .notifications-btn,
  .user-button {
    min-width: 36px;
    min-height: 36px;
    padding: 6px;
  }
  
  .notifications-badge {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
  }
}

/* Modal de Notificações */
.notifications-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-light);
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
  box-shadow: var(--shadow-modal);
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
  color: var(--text-button-primary);
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
    background: var(--accent-light);
    border-left: 3px solid var(--accent-primary);
  }

  &.dismissed {
    opacity: 0.6;
  }

  &.priority-urgent {
    border-left-color: var(--error);
  }

  &.priority-high {
    border-left-color: var(--warning-strong);
  }

  &.priority-normal {
    border-left-color: var(--warning);
  }

  &.priority-low {
    border-left-color: var(--text-tertiary);
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
    color: var(--info);
  }

  .bi-check-circle-fill {
    color: var(--success);
  }

  .bi-exclamation-triangle-fill {
    color: var(--warning);
  }

  .bi-x-circle-fill {
    color: var(--error);
  }

  .bi-arrow-clockwise {
    color: var(--accent-primary);
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
    background: var(--badge-error-bg);
    color: var(--badge-error-text);
  }

  &.high {
    background: var(--badge-warning-bg);
    color: var(--badge-warning-text);
  }

  &.normal {
    background: var(--badge-warning-bg);
    color: var(--badge-warning-text);
  }

  &.low {
    background: var(--badge-neutral-bg);
    color: var(--badge-neutral-text);
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
  color: var(--success);

  &:hover {
    color: var(--accent-primary);
  }
}

.dismiss-btn {
  color: var(--text-tertiary);

  &:hover {
    color: var(--error);
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
  box-shadow: var(--shadow-button-hover);
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
    border-left-color: var(--info);
  }

  &.toast-success {
    border-left-color: var(--success);
  }

  &.toast-warning {
    border-left-color: var(--warning);
  }

  &.toast-error {
    border-left-color: var(--error);
  }

  &.toast-update {
    border-left-color: var(--accent-primary);
  }

  &.toast-urgent {
    border-left-color: var(--error);
    animation: urgentPulse 1s infinite;
  }

  &.toast-high {
    border-left-color: var(--warning);
  }

  &.toast-normal {
    border-left-color: var(--warning);
  }

  &.toast-low {
    border-left-color: var(--text-tertiary);
  }
}

@keyframes urgentPulse {
  0% { box-shadow: 0 0 0 0 var(--error); }
  70% { box-shadow: 0 0 0 10px var(--transparent); }
  100% { box-shadow: 0 0 0 0 var(--transparent); }
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
