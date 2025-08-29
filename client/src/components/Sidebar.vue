<template>
  <aside class="sidebar" :class="{ collapsed: shouldBeCollapsed }">
    <!-- Logo e Header -->
    <div class="sidebar-header">
      <div class="logo">
        <img class="logo-icon" v-show="!shouldBeCollapsed" src="@/assets/img/logo.png" alt="SureStake Logo" width="31" height="31">
        <img class="logo-icon" v-show="shouldBeCollapsed" src="@/assets/img/logo.png" alt="SureStake Logo" width="31" height="31">
        <h1 v-show="!shouldBeCollapsed">
          <span class="sure-text">Sure</span><span class="stake-text">Stake</span>
        </h1>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar" :title="shouldBeCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'">
        <Menu v-if="!shouldBeCollapsed" size="16" />
        <ChevronRight v-else size="16" />
      </button>
    </div>

    <!-- Perfil do Usuário -->
    <div class="user-profile">
      <div class="user-info">
        <div class="user-avatar">
          <User size="20" />
        </div>
        <div class="user-details" v-show="!shouldBeCollapsed">
          <p class="user-greeting">Olá, {{ currentUser?.name || 'Usuário' }}</p>
          <div class="user-status"> 
            <span class="status-dot" :class="accountStatusClass"></span>
            <span class="status-text">{{ accountStatusText }}</span>
          </div>
          <div class="user-account-type">
            <span class="account-type-badge" :class="userAccountTypeClass">
              {{ userAccountTypeDisplay }}
            </span>
          </div>
          
          <!-- Informações de Expiração -->
          <div class="account-expiration" v-if="isVIP && accountExpiration">
            <div class="expiration-info" :class="expirationStatusClass">
              <Clock size="12" />
              <span class="expiration-text">{{ expirationDisplayText }}</span>
            </div>
            <div class="expiration-countdown" v-if="showCountdown">
              <span class="countdown-text">{{ countdownText }}</span>
            </div>
          </div>
          
          <!-- Mensagem quando não há dados VIP -->
          <div class="account-expiration" v-if="isVIP && !accountExpiration && userVIPData === null">
            <div class="expiration-info warning">
              <Clock size="12" />
              <span class="expiration-text">Carregando dados VIP...</span>
            </div>
          </div>
          
          <!-- Mensagem quando não há dados VIP da API -->
          <div class="account-expiration" v-if="isVIP && !accountExpiration && userVIPData === false">
            <div class="expiration-info expired">
              <Clock size="12" />
              <span class="expiration-text">Dados VIP não encontrados</span>
            </div>
          </div>
          
          <!-- Alertas de Expiração -->
          <div class="expiration-alert" v-if="isVIP && showExpirationAlert" :class="expirationAlertClass">
            <AlertTriangle size="12" />
            <span class="alert-text">{{ expirationAlertText }}</span>
          </div>
        </div>
        
        <!-- Tipo de conta no sidebar colapsado -->
        <div class="user-account-type-collapsed" v-show="shouldBeCollapsed">
          <span class="account-type-badge-collapsed" :class="userAccountTypeClass" :title="userAccountTypeDisplay">
            {{ userAccountTypeDisplay.charAt(0) }}
          </span>
        </div>
      </div>
      
      <!-- Ações do Perfil -->
      <div class="profile-actions" v-show="!shouldBeCollapsed">
        <button class="profile-action-btn renew-btn" @click="renewAccount" v-if="isVIP && showRenewButton" :title="renewButtonTitle">
          <RefreshCw size="14" />
          <span>Renovar</span>
        </button>

        <button class="profile-action-btn logout-btn" @click="logout" title="Sair da conta">
          <LogOut size="14" />
          <span>Sair</span>
        </button>
      </div>
      
      <!-- Ícones de Administração e Configurações -->
      <div class="admin-icons" v-show="!shouldBeCollapsed">
        <!-- Configurações (só para admins) -->
        <router-link v-if="isAdmin" to="/settings" class="admin-icon-link" title="Configurações">
          <Settings size="18" />
        </router-link>
        
        <!-- Administração (só para admins) -->
        <router-link v-if="isAdmin" to="/admin" class="admin-icon-link" title="Administração">
          <Shield size="18" />
        </router-link>
        
        <!-- Administração VIP (só para admins) -->
        <router-link v-if="isAdmin" to="/vip-admin" class="admin-icon-link" title="Administração VIP">
          <Crown size="18" />
        </router-link>
      </div>
    </div>

    <!-- Menu de Navegação -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Dashboard/Surebets sempre em primeiro -->
        <li class="nav-item" :class="{ active: $route.path === '/' }">
          <div class="nav-link" :class="{ 'locked': !isVIP }" @click="handleDashboardClick" :title="shouldBeCollapsed ? 'Surebets' : ''">
            <Target class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Surebets</span>
            <div v-if="!isVIP" class="vip-indicator" :title="shouldBeCollapsed ? 'Acesso VIP' : 'Acesso exclusivo para contas Premium/VIP'">
              <Lock class="vip-icon" size="14" />
              <span v-show="!shouldBeCollapsed" class="vip-text">VIP</span>
            </div>
          </div>
        </li>

        <!-- Juros Compostos -->
        <li class="nav-item" :class="{ active: $route.path === '/compound-interest' }">
          <div class="nav-link" :class="{ 'locked': !isVIP }" @click="handleCompoundInterestClick" :title="shouldBeCollapsed ? 'Juros Compostos' : ''">
            <Calculator class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Juros Compostos</span>
            <div v-if="!isVIP" class="vip-indicator" :title="shouldBeCollapsed ? 'Acesso VIP' : 'Acesso exclusivo para contas Premium/VIP'">
              <Lock class="vip-icon" size="14" />
              <span v-show="!shouldBeCollapsed" class="vip-text">VIP</span>
            </div>
          </div>
        </li>

        <!-- Indicações -->
        <li class="nav-item" :class="{ active: $route.path === '/referrals' }">
          <router-link to="/referrals" class="nav-link" :title="shouldBeCollapsed ? 'Indicações' : ''">
            <Users class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Indicações</span>
          </router-link>
        </li>

        <!-- Planos -->
        <li class="nav-item" :class="{ active: $route.path === '/plans' }">
          <router-link to="/plans" class="nav-link" :title="shouldBeCollapsed ? 'Planos' : ''">
            <CreditCard class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Planos</span>
          </router-link>
        </li>

        <!-- Relatórios -->
        <li class="nav-item" :class="{ active: $route.path === '/reports' }">
          <div class="nav-link" :class="{ 'locked': !isVIP }" @click="handleReportsClick" :title="shouldBeCollapsed ? 'Relatórios' : ''">
            <BarChart3 class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Relatórios</span>
            <div v-if="!isVIP" class="vip-indicator" :title="shouldBeCollapsed ? 'Acesso VIP' : 'Acesso exclusivo para contas Premium/VIP'">
              <Lock class="vip-icon" size="14" />
              <span v-show="!shouldBeCollapsed" class="vip-text">VIP</span>
            </div>
          </div>
        </li>

        <!-- Ranking -->
        <li class="nav-item" :class="{ active: $route.path === '/ranking' }">
          <router-link to="/ranking" class="nav-link" :title="shouldBeCollapsed ? 'Ranking' : ''">
            <Trophy class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Ranking</span>
          </router-link>
        </li>

        <!-- Contas de Casas de Apostas -->
        <li class="nav-item" :class="{ active: $route.path === '/bookmaker-accounts' }">
          <div class="nav-link" :class="{ 'locked': !isVIP }" @click="handleBookmakerAccountsClick" :title="shouldBeCollapsed ? 'Contas' : ''">
            <Building2 class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Contas</span>
            <div v-if="!isVIP" class="vip-indicator" :title="shouldBeCollapsed ? 'Acesso VIP' : 'Acesso exclusivo para contas Premium/VIP'">
              <Lock class="vip-icon" size="14" />
              <span v-show="!shouldBeCollapsed" class="vip-text">VIP</span>
            </div>
          </div>
        </li>



        <!-- Suporte -->
        <li class="nav-item" :class="{ active: $route.path === '/support' }">
          <router-link to="/support" class="nav-link" :title="shouldBeCollapsed ? 'Suporte' : ''">
            <HelpCircle class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Suporte</span>
          </router-link>
        </li>

        <!-- Glosário -->
        <li class="nav-item">
          <button class="nav-link glossary-btn" @click="openGlossary" :title="shouldBeCollapsed ? 'Glosário' : ''">
            <BookOpen class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Glosário</span>
          </button>
        </li>

        <!-- Sair -->
        <li class="nav-item">
          <button class="nav-link logout-btn" @click="logout" :title="shouldBeCollapsed ? 'Sair' : ''">
            <LogOut class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>

import { 
  Menu, 
  ChevronRight, 
  User, 
  Settings, 
  Shield, 
  Crown,
  Target, 
  Lock, 
  Calculator, 
  Users, 
  CreditCard, 
  BarChart3, 
  Trophy, 
  Building2, 
  HelpCircle, 
  BookOpen, 
  LogOut,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-vue-next'

import axios from '@/utils/axios'

export default {
  name: 'Sidebar',
  components: {

    Menu,
    ChevronRight,
    User,
    Settings,
    Shield,
    Crown,
    Target,
    Lock,
    Calculator,
    Users,
    CreditCard,
    BarChart3,
    Trophy,
    Building2,
    HelpCircle,
    BookOpen,
    LogOut,
    Clock,
    AlertTriangle,
    RefreshCw
  },
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalCollapsed: false,
      countdownTimer: null,
      userVIPData: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    isVIP() {
      return this.$store.getters.isVIP
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
    // Computed para determinar se a sidebar deve estar colapsada
    shouldBeCollapsed() {
      return this.sidebarCollapsed || this.internalCollapsed
    },
    
    // Sistema de Expiração da Conta
    accountExpiration() {
      // Retornar apenas dados reais da API
      return this.userVIPData?.dataFim || null
    },
    
    accountStatusClass() {
      if (!this.accountExpiration) return 'status-active'
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (timeDiff < 0) return 'status-expired'
      if (daysUntilExpiration <= 7) return 'status-warning'
      return 'status-active'
    },
    
    accountStatusText() {
      if (!this.accountExpiration) return 'Ativo'
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff < 0) return 'Expirado'
      return 'Ativo'
    },
    
    expirationStatusClass() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (timeDiff < 0) return 'expired'
      if (daysUntilExpiration <= 7) return 'warning'
      return 'normal'
    },
    
    expirationDisplayText() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      let displayText = ''
      if (timeDiff < 0) {
        displayText = 'Conta expirada'
      } else {
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiration === 0) {
          displayText = 'Expira hoje'
        } else if (daysUntilExpiration === 1) {
          displayText = 'Expira amanhã'
        } else {
          displayText = `Expira em ${daysUntilExpiration} dias`
        }
      }
      
      return displayText
    },
    
    showCountdown() {
      if (!this.accountExpiration) return false
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      return timeDiff > 0 && daysUntilExpiration <= 3
    },
    
    countdownText() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff <= 0) return ''
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        return `${days}d ${hours % 24}h`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else {
        return `${minutes}m`
      }
    },
    
    showExpirationAlert() {
      if (!this.accountExpiration) return false
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      return timeDiff < 0 || daysUntilExpiration <= 7
    },
    
    expirationAlertClass() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      return timeDiff < 0 ? 'alert-expired' : 'alert-warning'
    },
    
    expirationAlertText() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff < 0) {
        return 'Renovação necessária!'
      }
      
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiration <= 1) {
        return 'Renovação urgente!'
      } else if (daysUntilExpiration <= 3) {
        return 'Renovação recomendada'
      } else {
        return 'Considere renovar'
      }
    },
    
    showRenewButton() {
      if (!this.accountExpiration) return false
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      return timeDiff < 0 || daysUntilExpiration <= 7
    },
    
    renewButtonTitle() {
      if (!this.accountExpiration) return 'Renovar conta'
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      
      if (timeDiff < 0) {
        return 'Conta expirada - Renovar agora'
      }
      
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiration <= 1) {
        return 'Renovação urgente - Expira em breve'
      } else {
        return `Renovar conta - Expira em ${daysUntilExpiration} dias`
      }
    }

  },
  watch: {
    // Observar mudanças na prop sidebarCollapsed
    sidebarCollapsed: {
      handler(newValue) {
        this.internalCollapsed = newValue
        this.saveSidebarState(newValue)
      },
      immediate: true
    },
    
    // Observar mudanças no usuário atual para recarregar dados VIP
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
  mounted() {
    this.loadSidebarState()
    this.startCountdownTimer()
    this.loadUserVIPData()
    
    // Monitorar mudanças no localStorage para configurações
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_settings') {
        this.loadSidebarState()
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    this.stopCountdownTimer()
  },
  methods: {
    handleDashboardClick() {
      if (this.isVIP) {
        this.$router.push('/')
      } else {
        this.showNotification('Acesso exclusivo para contas Premium/VIP. Faça upgrade da sua conta para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    handleReportsClick() {
      if (this.isVIP) {
        // Se já estiver na página de relatórios, força o refresh
        if (this.$route.path === '/reports') {
          // Força o refresh da página
          window.location.reload()
        } else {
          // Navega para a página de relatórios
          this.$router.push('/reports')
        }
      } else {
        this.showNotification('Acesso exclusivo para contas Premium/VIP. Faça upgrade da sua conta para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    handleCompoundInterestClick() {
      if (this.isVIP) {
        this.$router.push('/compound-interest')
      } else {
        this.showNotification('Acesso exclusivo para contas Premium/VIP. Faça upgrade da sua conta para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    

    
    handleBookmakerAccountsClick() {
      if (this.isVIP) {
        this.$router.push('/bookmaker-accounts')
      } else {
        this.showNotification('Acesso exclusivo para contas Premium/VIP. Faça upgrade da sua conta para continuar.', 'error')
        this.$router.push('/plans')
      }
    },
    

    showNotification(message, type = 'info') {
      this.$emit('show-notification', { message, type })
    },
    toggleSidebar() {
      this.internalCollapsed = !this.internalCollapsed
      this.saveSidebarState(this.internalCollapsed)
      this.$emit('toggle-sidebar', this.internalCollapsed)
    },
    openGlossary() {
      this.$emit('open-glossary')
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    renewAccount() {
      // Redireciona para a página de planos para renovação
      this.$router.push('/plans')
      this.showNotification('Redirecionando para renovação da conta...', 'info')
    },
    
    async loadUserVIPData() {
      try {
        // Verificar se o usuário está logado
        if (!this.currentUser || !this.currentUser.id) {
          console.log('👤 Usuário não logado, não carregando dados VIP')
          return
        }
        
        // Verificar se o usuário é VIP
        if (!this.isVIP) {
          console.log('👤 Usuário não é VIP, não carregando dados VIP')
          return
        }
        
        // Fazer chamada para a API para obter dados do VIP do usuário atual
        const response = await axios.get('/api/vip/my-status')
        
        if (response.data && response.data.success && response.data.vipStatus) {
          this.userVIPData = response.data.vipStatus
        } else {
          this.userVIPData = false // false indica que a API foi chamada mas não retornou dados
        }
              } catch (error) {
          console.error('Erro ao carregar dados VIP:', error)
          this.userVIPData = false // false indica que houve erro na API
        }
    },
    

    

    
    startCountdownTimer() {
      // Limpa timer anterior se existir
      this.stopCountdownTimer()
      
      // Inicia timer para atualizar countdown a cada minuto
      this.countdownTimer = setInterval(() => {
        // Força re-render dos computed properties
        this.$forceUpdate()
        
        // Recarregar dados do VIP a cada 5 minutos
        if (this.isVIP && this.currentUser) {
          this.loadUserVIPData()
        }
      }, 60000) // Atualiza a cada minuto
    },
    
    stopCountdownTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    
    // Carregar estado da sidebar das configurações
    loadSidebarState() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.interface && settings.interface.sidebarCollapsed !== undefined) {
            this.internalCollapsed = settings.interface.sidebarCollapsed
            this.$emit('sidebar-state-loaded', this.internalCollapsed)

          }
        }
      } catch (error) {
        console.warn('Erro ao carregar estado da sidebar:', error)
      }
    },
    
    // Salvar estado da sidebar nas configurações
    saveSidebarState(collapsed) {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        let settings = savedSettings ? JSON.parse(savedSettings) : {}
        
        // Inicializar interface se não existir
        if (!settings.interface) {
          settings.interface = {}
        }
        
        // Atualizar estado da sidebar
        settings.interface.sidebarCollapsed = collapsed
        
        localStorage.setItem('app_settings', JSON.stringify(settings))

      } catch (error) {
        console.error('Erro ao salvar estado da sidebar:', error)
      }
    },
    
    handleStorageChange(event) {
      if (event.key === 'app_settings') {
        this.loadSidebarState()
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--bg-secondary, #2a2a2a);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  flex-shrink: 0;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px 8px;
  position: relative;
}

.sidebar.collapsed .nav-icon {
  margin: 0;
}

.sidebar.collapsed .lock-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  margin: 0;
  width: 12px;
  height: 12px;
}

/* Estilos específicos para badges VIP no sidebar colapsado */
.sidebar.collapsed .vip-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  margin: 0;
  padding: 2px;
  border-radius: 50%;
  font-size: 8px;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  box-shadow: 0 1px 4px rgba(255, 215, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: vipPulse 2s ease-in-out infinite;
}

@keyframes vipPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 1px 4px rgba(255, 215, 0, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.6);
  }
}

.sidebar.collapsed .vip-icon {
  width: 6px;
  height: 6px;
  color: #1a1a1a;
}

.sidebar.collapsed .vip-text {
  display: none;
}

/* Ajuste para nav-link com badge VIP no sidebar colapsado */
.sidebar.collapsed .nav-link:has(.vip-indicator) {
  padding-right: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Tooltip para badges VIP no sidebar colapsado */
.sidebar.collapsed .vip-indicator::before {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  margin-bottom: 4px;
}

.sidebar.collapsed .vip-indicator::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  margin-bottom: -4px;
}

.sidebar.collapsed .vip-indicator:hover::before,
.sidebar.collapsed .vip-indicator:hover::after {
  opacity: 1;
  visibility: visible;
}

.sidebar.collapsed .user-profile {
  padding: 16px 8px;
}

.sidebar.collapsed .user-info {
  justify-content: center;
}

.sidebar.collapsed .user-avatar {
  margin: 0 auto;
}

.sidebar.collapsed .admin-icons {
  justify-content: center;
  gap: 4px;
}

.sidebar.collapsed .profile-actions {
  display: none;
}

.sidebar.collapsed .account-expiration {
  display: none;
}

.sidebar.collapsed .expiration-alert {
  display: none;
}

.sidebar.collapsed .admin-icon-link {
  width: 28px;
  height: 28px;
}

.sidebar.collapsed .sidebar-header {
  padding: 16px 8px;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.sidebar.collapsed .logo {
  justify-content: center;
  margin-bottom: 4px;
}

.sidebar.collapsed .sidebar-toggle {
  position: static;
  margin: 0;
  align-self: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed .sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #00ff88;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-primary, #ffffff);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.sidebar-toggle svg {
  transition: transform 0.3s ease;
}

.sidebar-toggle:hover svg {
  transform: scale(1.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 45px;
  height: 45x;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 4px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.sure-text {
  color: #ffffff;
  font-weight: 700;
}

.stake-text {
  color: #00ff88;
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
}

.user-profile {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary, #00ff88);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary, #1a1a1a);
}

.user-avatar svg {
  color: var(--bg-primary, #1a1a1a);
  stroke-width: 1.5;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-secondary, #cccccc);
  margin: 0;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ff88;
  transition: background-color 0.3s ease;
}

.status-dot.status-active {
  background-color: #00ff88;
}

.status-dot.status-warning {
  background-color: #ffa500;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.status-expired {
  background-color: #ff4444;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary, #cccccc);
}

.user-account-type {
  margin-top: 6px;
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

/* Badge do tipo de conta no sidebar colapsado */
.user-account-type-collapsed {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.account-type-badge-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: help;
}

.account-type-badge-collapsed.account-type-basic {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: #ffffff;
}

.account-type-badge-collapsed.account-type-premium {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #ffffff;
}

.account-type-badge-collapsed.account-type-vip {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  animation: vipGlow 2s ease-in-out infinite alternate;
}

/* Informações de Expiração */
.account-expiration {
  margin-top: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.expiration-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary, #cccccc);
}

.expiration-info.normal {
  color: #00ff88;
}

.expiration-info.warning {
  color: #ffa500;
}

.expiration-info.expired {
  color: #ff4444;
}

.expiration-info svg {
  width: 12px;
  height: 12px;
  stroke-width: 1.5;
}

.expiration-text {
  font-weight: 500;
}

.expiration-countdown {
  margin-top: 4px;
  text-align: center;
}

.countdown-text {
  font-size: 10px;
  font-weight: 700;
  color: #ffa500;
  background: rgba(255, 165, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

/* Alertas de Expiração */
.expiration-alert {
  margin-top: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  animation: alertPulse 2s ease-in-out infinite;
}

.expiration-alert.alert-warning {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  color: #ffa500;
}

.expiration-alert.alert-expired {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  color: #ff4444;
}

.expiration-alert svg {
  width: 12px;
  height: 12px;
  stroke-width: 1.5;
}

.alert-text {
  font-weight: 600;
}

@keyframes alertPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Ações do Perfil */
.profile-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.profile-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  background: var(--bg-secondary, #2a2a2a);
  color: var(--text-secondary, #cccccc);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.profile-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.profile-action-btn.renew-btn {
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.3);
}

.profile-action-btn.renew-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
}

.profile-action-btn.logout-btn {
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.3);
}

.profile-action-btn.logout-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.profile-action-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 1.5;
}

/* Ícones de Administração */
.admin-icons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.admin-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  color: var(--text-secondary, #cccccc);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.admin-icon-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00ff88;
  color: #00ff88;
  transform: translateY(-1px);
}

.admin-icon-link svg {
  width: 16px;
  height: 16px;
  color: currentColor;
  stroke-width: 1.5;
}

.sidebar-nav {
  padding: 16px 20px;
  flex: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00ff88;
}

.nav-item.active .nav-link {
  background: #00ff88;
  color: #1a1a1a;
  border-color: #00ff88;
}

.nav-link.glossary-btn {
  color: #00ff88;
}

.nav-link.glossary-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
}

.nav-link.logout-btn {
  color: #ff4444;
}

.nav-link.logout-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff4444;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  stroke-width: 1.5;
}

.lock-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0.7;
  color: #ff4444;
}

.nav-link.locked {
  opacity: 0.6;
  cursor: not-allowed;
  position: relative;
}

.nav-link.locked:hover {
  background: var(--bg-secondary, #2a2a2a);
  border-color: var(--border-primary, rgba(255, 255, 255, 0.1));
  transform: none;
}

.nav-link.locked .nav-icon {
  opacity: 0.5;
}

.nav-link.locked .nav-text {
  opacity: 0.5;
}

.nav-text {
  flex-grow: 1;
}

/* Indicadores VIP */
.vip-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 2px 6px;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  animation: vipGlow 2s ease-in-out infinite alternate;
}

@keyframes vipGlow {
  from {
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
  to {
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
  }
}

.vip-icon {
  width: 12px;
  height: 12px;
  color: #1a1a1a;
  stroke-width: 1.5;
}

.vip-text {
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .sidebar.collapsed {
    width: 280px;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 12px 16px;
  }
  
  .logo h1 {
    font-size: 18px;
  }
  
  .sidebar-toggle {
    padding: 6px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .user-greeting {
    font-size: 12px;
  }

  .user-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .status-text {
    font-size: 10px;
  }
}

.sidebar.collapsed .sidebar-toggle svg {
  transform: rotate(0deg);
}

.sidebar.collapsed .sidebar-toggle:hover svg {
  transform: rotate(0deg) scale(1.1);
}
</style>
