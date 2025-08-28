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
            <span class="status-dot"></span>
            <span class="status-text">Online</span>
          </div>
        </div>
      </div>
      
      <!-- Status da Conta Compacto -->
      <CreditStatus :compact="true" v-show="!shouldBeCollapsed" />
      
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

        <!-- Relatórios de Contas -->
        <li class="nav-item" :class="{ active: $route.path === '/bookmaker-reports' }">
          <div class="nav-link" :class="{ 'locked': !isVIP }" @click="handleBookmakerReportsClick" :title="shouldBeCollapsed ? 'Relatórios' : ''">
            <BarChart3 class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Relatórios Contas</span>
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
import CreditStatus from './CreditStatus.vue'
import { 
  Menu, 
  ChevronRight, 
  User, 
  Settings, 
  Shield, 
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
  LogOut 
} from 'lucide-vue-next'

export default {
  name: 'Sidebar',
  components: {
    CreditStatus,
    Menu,
    ChevronRight,
    User,
    Settings,
    Shield,
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
    LogOut
  },
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalCollapsed: false
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
    // Computed para determinar se a sidebar deve estar colapsada
    shouldBeCollapsed() {
      return this.sidebarCollapsed || this.internalCollapsed
    },
    // Verificação de créditos
    userCredits() {
      return this.$store.getters.userCredits
    },
    canUseSystem() {
      return this.$store.getters.canUseSystem
    },
    hasCredits() {
      return this.userCredits > 0 && this.canUseSystem
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
    }
  },
  mounted() {
    this.loadSidebarState()
    
    // Monitorar mudanças no localStorage para configurações
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_settings') {
        this.loadSidebarState()
      }
    })
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
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
    
    handleBookmakerReportsClick() {
      if (this.isVIP) {
        this.$router.push('/bookmaker-reports')
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
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary, #cccccc);
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
