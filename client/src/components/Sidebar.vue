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
          <div class="nav-link accounts-locked" @click="showAccountsRestrictedMessage" :title="shouldBeCollapsed ? 'Contas' : ''">
            <Building2 class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Contas</span>
            <div class="lock-indicator" :title="shouldBeCollapsed ? 'Acesso Restrito' : 'Funcionalidade em manutenção'">
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
              </svg>
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
        <li class="nav-item" :class="{ active: $route.path === '/glossary' }">
          <router-link to="/glossary" class="nav-link" :title="shouldBeCollapsed ? 'Glosário' : ''">
            <BookOpen class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Glosário</span>
          </router-link>
        </li>

        <!-- Sair -->
        <li class="nav-item">
          <button class="nav-link logout-btn" @click="logout" :title="shouldBeCollapsed ? 'Sair' : ''">
            <LogOut class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">Sair</span>
          </button>
        </li>
        
        <!-- Instalar PWA -->
        <li v-if="showPWAInstall" class="nav-item pwa-install-item">
          <button 
            class="nav-link pwa-install-btn" 
            @click="installPWA" 
            :disabled="installingPWA"
            :title="shouldBeCollapsed ? 'Instalar App' : ''"
          >
            <Download class="nav-icon" size="18" />
            <span class="nav-text" v-show="!shouldBeCollapsed">
              {{ installingPWA ? 'Instalando...' : 'Instalar App' }}
            </span>
            <div v-if="shouldBeCollapsed" class="pwa-badge">
              📱
            </div>
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
  Download
} from 'lucide-vue-next'

import axios from '@/utils/axios'
import vipSecurityManager from '@/utils/vipSecurityManager';

export default {
  name: 'Sidebar',
  components: {

    Menu,
    ChevronRight,
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
    Download
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
      userVIPData: null,
      installingPWA: false,
      pwaInstallable: false
    }
  },
  computed: {

    // Computed para determinar se a sidebar deve estar colapsada
    shouldBeCollapsed() {
      return this.sidebarCollapsed || this.internalCollapsed
    },





    // Computed para verificar permissões do usuário
    isAdmin() {
      return this.$store.getters.isAdmin
    },

    isVIP() {
      return this.$store.getters.isVIP
    },

    userAccountType() {
      return this.$store.getters.userAccountType
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
      
      if (timeDiff < 0) {
        return 'Conta expirada'
      }
      
      // Calcular dias e horas restantes
      const totalHours = Math.floor(timeDiff / (1000 * 60 * 60))
      const days = Math.floor(totalHours / 24)
      const hours = totalHours % 24
      
      if (days === 0) {
        if (hours === 0) {
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
          return `Expira em ${minutes} min`
        }
        return `Expira em ${hours}h`
      } else if (days === 1) {
        return `Expira em ${days}d ${hours}h`
      } else {
        return `Expira em ${days}d ${hours}h`
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
    },

    // Computed para a barra de progresso de expiração
    expirationProgressClass() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (timeDiff < 0) return 'progress-expired'
      if (daysUntilExpiration <= 7) return 'progress-warning'
      return 'progress-active'
    },

    expirationProgressPercent() {
      if (!this.accountExpiration) return 0
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (totalDays <= 0) return 100
      return ((totalDays / 7) * 100)
    },

    expirationProgressText() {
      if (!this.accountExpiration) return ''
      
      const now = new Date()
      const expiration = new Date(this.accountExpiration)
      const timeDiff = expiration - now
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      if (timeDiff < 0) {
        return 'Conta expirada'
      }
      
      if (daysUntilExpiration <= 1) {
        return 'Expira em breve'
      } else if (daysUntilExpiration <= 3) {
        return 'Renovação recomendada'
      } else {
        return 'Conta ativa'
      }
    },
    
    // Computed para mostrar botão de instalação PWA
    showPWAInstall() {
      return this.pwaInstallable && 
             !this.isPWAInstalled() && 
             !this.isMobileDevice();
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
    
    // Event listener para PWA
    window.addEventListener('beforeinstallprompt', this.capturePWAInstallPrompt);
    
    // Verificar se já está instalado
    if (this.isPWAInstalled()) {
      this.pwaInstallable = false;
    }

  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('beforeinstallprompt', this.capturePWAInstallPrompt)
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
    

    
    showAccountsRestrictedMessage() {
      this.showNotification('A funcionalidade de Contas está temporariamente indisponível para manutenção', 'warning')
    },
    

    showNotification(message, type = 'info') {
      this.$emit('show-notification', { message, type })
    },
    toggleSidebar() {
      this.internalCollapsed = !this.internalCollapsed
      this.saveSidebarState(this.internalCollapsed)
      this.$emit('toggle-sidebar', this.internalCollapsed)
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
    
    // 🔒 Verificar acesso VIP com sistema de segurança
    async checkVIPAccess() {
      try {
        console.log('🔒 [Sidebar] Verificando acesso VIP...');
        
        const result = await vipSecurityManager.checkVIPAccess();
        
        if (result.access) {
          console.log('✅ [Sidebar] Acesso VIP autorizado:', result.source);
          this.userVIP = {
            isVIP: result.data.isValid,
            expiresAt: result.data.expiration
          };
          return true;
        } else {
          console.log('❌ [Sidebar] Acesso VIP bloqueado:', result.reason);
          this.userVIP = { isVIP: false, expiresAt: null };
          return false;
        }
        
      } catch (error) {
        console.error('❌ [Sidebar] Erro ao verificar acesso VIP:', error);
        this.userVIP = { isVIP: false, expiresAt: null };
        return false;
      }
    },
    
    // 🔄 Carregar dados VIP com sistema de segurança
    async loadUserVIPData() {
      try {
        console.log('🔄 [Sidebar] Carregando dados VIP...');
        
        // Verificar acesso VIP primeiro
        const hasAccess = await this.checkVIPAccess();
        
        if (!hasAccess) {
          console.log('❌ [Sidebar] Sem acesso VIP');
          return;
        }
        
        // Se tem acesso, carregar dados adicionais se necessário
        if (this.userVIP?.isVIP) {
          console.log('✅ [Sidebar] Dados VIP carregados com sucesso');
        }
        
      } catch (error) {
        console.error('❌ [Sidebar] Erro ao carregar dados VIP:', error);
      }
    },
    

    

    
    startCountdownTimer() {
      // Limpa timer anterior se existir
      this.stopCountdownTimer()
      
      // Inicia timer para atualizar countdown a cada 30 segundos
      this.countdownTimer = setInterval(() => {
        // Força re-render dos computed properties
        this.$forceUpdate()
        
        // Recarregar dados do VIP a cada 5 minutos
        if (this.isVIP && this.currentUser) {
          this.loadUserVIPData()
        }
      }, 30000) // Atualiza a cada 30 segundos
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
    },
    
    // Métodos PWA
    isPWAInstalled() {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone === true;
    },
    
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    async installPWA() {
      if (this.installingPWA) return;
      
      this.installingPWA = true;
      
      try {
        // Verificar se o evento beforeinstallprompt foi capturado
        if (window.deferredPrompt) {
          console.log('[Sidebar] Executando prompt de instalação PWA...');
          window.deferredPrompt.prompt();
          const { outcome } = await window.deferredPrompt.userChoice;
          
          if (outcome === 'accepted') {
            console.log('[Sidebar] PWA instalado com sucesso!');
            this.showNotification('PWA instalado com sucesso!', 'success');
            // O botão será ocultado automaticamente pelo computed
          } else {
            console.log('[Sidebar] Usuário recusou a instalação');
            this.showNotification('Instalação cancelada pelo usuário', 'info');
          }
          
          window.deferredPrompt = null;
        } else {
          console.log('[Sidebar] Prompt de instalação não disponível');
          this.showNotification('Instalação não disponível no momento', 'warning');
        }
      } catch (error) {
        console.error('[Sidebar] Erro ao instalar PWA:', error);
        this.showNotification('Erro ao instalar PWA', 'error');
      } finally {
        this.installingPWA = false;
      }
    },
    
    // Capturar evento de instalação PWA
    capturePWAInstallPrompt(event) {
      console.log('[Sidebar] Evento beforeinstallprompt capturado!');
      event.preventDefault();
      window.deferredPrompt = event;
      this.pwaInstallable = true;
    }
  }
}
</script>

<style scoped>
/* Transições globais para mudanças de tema */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary, #2a2a2a);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  flex-shrink: 0;
  transition: 
    width 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

/* Melhorias visuais para o estado colapsado */
.sidebar.collapsed .nav-link {
  position: relative;
  overflow: hidden;
}

/* Tooltip para itens do menu no estado colapsado */
.sidebar.collapsed .nav-link::before {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  margin-left: 12px;
  pointer-events: none;
}

.sidebar.collapsed .nav-link:hover::before {
  opacity: 1;
  visibility: visible;
}

/* Indicador de item ativo mais visível */
.sidebar.collapsed .nav-item.active .nav-link {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 2px 8px rgba(var(--accent-primary-rgb), 0.4);
}

/* Melhorias para o header no estado colapsado */
.sidebar.collapsed .sidebar-header {
  padding: 12px 8px;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.sidebar.collapsed .logo {
  justify-content: center;
  margin-bottom: 4px;
}

.sidebar.collapsed .logo-icon {
  width: 32px;
  height: 32px;
}

.sidebar.collapsed .sidebar-toggle {
  position: static;
  margin: 0;
  align-self: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.sidebar.collapsed .sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

/* Melhorias para o perfil do usuário no estado colapsado */
.sidebar.collapsed .user-profile {
  padding: 16px 8px;
}

.sidebar.collapsed .user-info {
  justify-content: center;
}

.sidebar.collapsed .user-avatar {
  margin: 0 auto;
  width: 36px;
  height: 36px;
}

.sidebar.collapsed .user-avatar svg {
  width: 20px;
  height: 20px;
}

/* Melhorias para os ícones de administração no estado colapsado */
.sidebar.collapsed .admin-icons {
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.sidebar.collapsed .admin-icon-link {
  width: 28px;
  height: 28px;
  transition: all 0.3s ease;
}

.sidebar.collapsed .admin-icon-link:hover {
  transform: scale(1.1);
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px 8px;
  position: relative;
  transition: all 0.3s ease;
}

.sidebar.collapsed .nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
  border-color: rgba(var(--accent-primary-rgb), 0.3);
}

.sidebar.collapsed .nav-icon {
  margin: 0;
  transition: all 0.3s ease;
}

.sidebar.collapsed .nav-link:hover .nav-icon {
  transform: scale(1.1);
  color: var(--accent-primary);
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

/* Estilos específicos para o indicador de bloqueio no sidebar colapsado */
.sidebar.collapsed .lock-indicator {
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
  background: rgba(255, 165, 0, 0.2);
  box-shadow: 0 1px 4px rgba(255, 165, 0, 0.3);
  border: 1px solid rgba(255, 165, 0, 0.4);
  animation: lockPulse 2s ease-in-out infinite;
}

.sidebar.collapsed .lock-indicator .lock-icon {
  width: 6px;
  height: 6px;
  color: #ffa500;
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

/* Tooltip para o indicador de bloqueio no sidebar colapsado */
.sidebar.collapsed .lock-indicator::before {
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

.sidebar.collapsed .lock-indicator::after {
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

.sidebar.collapsed .lock-indicator:hover::before,
.sidebar.collapsed .lock-indicator:hover::after {
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
  border-color: var(--accent-primary);
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
  color: var(--text-primary);
  font-weight: 700;
  transition: color 0.3s ease;
}

.stake-text {
  color: var(--accent-primary);
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.4);
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
  background: var(--accent-primary, #198754);
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
  background-color: var(--accent-primary);
  transition: background-color 0.3s ease;
}

.status-dot.status-active {
  background-color: var(--accent-primary);
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
  color: var(--accent-primary);
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

/* Barra de Progresso de Expiração */
.expiration-progress {
  margin-top: 8px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.progress-fill.progress-active {
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
}

.progress-fill.progress-warning {
  background: linear-gradient(90deg, #ffc107, #e0a800);
}

.progress-fill.progress-expired {
  background: linear-gradient(90deg, #dc3545, #c82333);
}

.progress-text {
  font-size: 10px;
  color: var(--text-secondary, #cccccc);
  font-weight: 500;
  text-align: center;
  display: block;
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
  color: var(--accent-primary);
  border-color: rgba(var(--accent-primary-rgb), 0.3);
}

.profile-action-btn.renew-btn:hover {
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-color: var(--accent-primary);
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
  border-color: var(--accent-primary);
  color: var(--accent-primary);
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
  border-color: var(--accent-primary);
}

.nav-item.active .nav-link {
  background: var(--accent-primary);
  color: #1a1a1a;
  border-color: var(--accent-primary);
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

/* Indicador de bloqueio para Contas */
.lock-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 2px 6px;
  background: rgba(var(--warning-color-rgb, 255, 165, 0), 0.1);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: var(--warning-color, #ffa500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.2);
  animation: lockGlow 2s ease-in-out infinite alternate;
}

.lock-indicator .lock-icon {
  width: 12px;
  height: 12px;
  color: var(--warning-color, #ffa500);
  stroke-width: 1.5;
  animation: lockPulse 2s ease-in-out infinite;
}



/* Estilos para o item Contas bloqueado */
.nav-link.accounts-locked {
  background: rgba(var(--warning-color-rgb, 255, 165, 0), 0.05);
  border-color: var(--warning-color, #ffa500);
  color: var(--warning-color, #ffa500);
  cursor: not-allowed;
  position: relative;
  opacity: 0.8;
}

.nav-link.accounts-locked:hover {
  background: rgba(var(--warning-color-rgb, 255, 165, 0), 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.2);
}

.nav-link.accounts-locked .nav-icon {
  color: var(--warning-color, #ffa500);
  animation: lockPulse 2s ease-in-out infinite;
}

.nav-link.accounts-locked .nav-text {
  color: var(--warning-color, #ffa500);
}

/* Animações para o cadeado */
@keyframes lockPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 5px var(--warning-color, #ffa500));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px var(--warning-color, #ffa500));
  }
}

@keyframes lockGlow {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 5px var(--warning-color, #ffa500);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 10px var(--warning-color, #ffa500);
  }
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

/* Estilos para o botão PWA */
.pwa-install-item {
  margin-top: 8px;
  border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  padding-top: 8px;
}

.pwa-install-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border-color: rgba(99, 102, 241, 0.3) !important;
  color: white !important;
  position: relative;
  overflow: hidden;
}

.pwa-install-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.pwa-install-btn:hover::before {
  left: 100%;
}

.pwa-install-btn:hover {
  background: linear-gradient(135deg, #5b5eea, #7c3aed) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.pwa-install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pwa-install-btn:disabled::before {
  display: none;
}

/* Badge PWA para sidebar colapsada */
.pwa-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 10px;
  animation: pwaPulse 2s ease-in-out infinite;
}

@keyframes pwaPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Estilos específicos para o botão PWA no sidebar colapsado */
.sidebar.collapsed .pwa-install-btn {
  justify-content: center;
  padding: 12px 8px;
  position: relative;
}

.sidebar.collapsed .pwa-install-btn .nav-icon {
  margin: 0;
}

.sidebar.collapsed .pwa-install-btn .pwa-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 8px;
}

/* Responsividade para o botão PWA */
@media (max-width: 768px) {
  .pwa-install-item {
    margin-top: 4px;
    padding-top: 4px;
  }
  
  .pwa-install-btn {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .pwa-install-btn {
    padding: 8px 10px;
  }
  
  .pwa-install-btn .nav-text {
    font-size: 12px;
  }
}
</style>
