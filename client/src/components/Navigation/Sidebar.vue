<template>


    <!-- Overlay para mobile -->
    <div 
      v-if="(isMobile || isTablet) && mobileMenuOpen" 
      class="mobile-overlay" 
      @click="closeMobileMenu"
    ></div>

    <aside 
      class="sidebar" 
      :class="{ 
        collapsed: shouldBeCollapsed,
        'mobile-open': mobileMenuOpen && (isMobile || isTablet),
        'mobile-closed': !mobileMenuOpen && (isMobile || isTablet)
      }"
    >
      <!-- Logo e Header -->
      <div class="sidebar-header">
        <div class="logo">
          <img class="logo-icon" v-show="shouldShowTexts" src="@/assets/img/logo.png" alt="SureStake Logo" width="31" height="31">
          <img class="logo-icon" v-show="shouldBeCollapsed" src="@/assets/img/logo.png" alt="SureStake Logo" width="31" height="31">
          <h1 v-show="shouldShowTexts">
            <span class="sure-text">Sure</span><span class="stake-text">Stake</span>
          </h1>
        </div>
        <!-- Toggle para desktop -->
        <button 
          v-if="isDesktop" 
          class="sidebar-toggle" 
          @click="toggleSidebar" 
          :title="shouldBeCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <Menu v-if="!shouldBeCollapsed" size="16" />
          <ChevronRight v-else size="16" />
        </button>
        <!-- Toggle para mobile/tablet -->
        <button 
          v-if="isMobile || isTablet" 
          class="mobile-toggle" 
          @click="toggleMobileMenu" 
          :title="mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'"
        >
          <Menu v-if="!mobileMenuOpen" size="16" />
          <X v-else size="16" />
        </button>
      </div>
  
  
  
      <!-- Menu de Navegação -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard/Surebets sempre em primeiro -->
          <li class="nav-item" :class="{ active: $route.path === '/' }">
            <div class="nav-link" @click="handleDashboardClick" :title="shouldBeCollapsed ? 'Surebets' : ''">
              <Target class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Surebets</span>
            </div>
          </li>
  
          <!-- Juros Compostos -->
          <li class="nav-item" :class="{ active: $route.path === '/compound-interest' }">
            <router-link to="/compound-interest" class="nav-link" :title="shouldBeCollapsed ? 'Juros Compostos' : ''">
              <Calculator class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Juros Compostos</span>
            </router-link>
          </li>
  
          <!-- Indicações -->
          <li class="nav-item" :class="{ active: $route.path === '/referrals' }">
            <router-link to="/referrals" class="nav-link" :title="shouldBeCollapsed ? 'Indicações' : ''">
              <Users class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Indicações</span>
            </router-link>
          </li>
  
          <!-- Planos -->
          <li class="nav-item" :class="{ active: $route.path === '/plans' }">
            <router-link to="/plans" class="nav-link" :title="shouldBeCollapsed ? 'Planos' : ''">
              <CreditCard class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Planos</span>
            </router-link>
          </li>
  
          <!-- Relatórios -->
          <li class="nav-item" :class="{ active: $route.path === '/reports' }">
            <router-link to="/reports" class="nav-link" :title="shouldBeCollapsed ? 'Relatórios' : ''">
              <BarChart3 class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Relatórios</span>
            </router-link>
          </li>
  
          <!-- Ranking -->
          <li class="nav-item" :class="{ active: $route.path === '/ranking' }">
            <router-link to="/ranking" class="nav-link" :title="shouldBeCollapsed ? 'Ranking' : ''">
              <Trophy class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Ranking</span>
            </router-link>
          </li>
  
          <!-- Contas de Casas de Apostas -->
          <li class="nav-item" :class="{ active: $route.path === '/bookmaker-accounts' }">
            <router-link to="/bookmaker-accounts" class="nav-link" :title="shouldBeCollapsed ? 'Contas' : ''">
              <Building2 class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Contas</span>
            </router-link>
          </li>

          <!-- Relatórios de Surebets -->
          <li class="nav-item" :class="{ active: $route.path === '/surebet-reports' }">
            <router-link to="/surebet-reports" class="nav-link" :title="shouldBeCollapsed ? 'Relatórios de Surebets' : ''">
              <FileText class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Relatórios de Surebets</span>
            </router-link>
          </li>
  
  
  
          <!-- Suporte -->
          <li class="nav-item" :class="{ active: $route.path === '/support' }">
            <router-link to="/support" class="nav-link" :title="shouldBeCollapsed ? 'Suporte' : ''">
              <HelpCircle class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Suporte</span>
            </router-link>
          </li>
  
          <!-- Guia de Apostas -->
          <li class="nav-item" :class="{ active: $route.path === '/guia-apostas' }">
            <router-link to="/guia-apostas" class="nav-link" :title="shouldBeCollapsed ? 'Guia de Apostas' : ''">
              <i class="bi bi-shield-check nav-icon"></i>
              <span class="nav-text" v-show="shouldShowTexts">
                Guia de Apostas
                <span class="nav-badge important">(importante)</span>
              </span>
            </router-link>
          </li>
  
          <!-- Glosário -->
          <li class="nav-item" :class="{ active: $route.path === '/glossary' }">
            <router-link to="/glossary" class="nav-link" :title="shouldBeCollapsed ? 'Glosário' : ''">
              <BookOpen class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Glosário</span>
            </router-link>
          </li>
  
          <!-- Sair -->
          <li class="nav-item">
            <button class="nav-link logout-btn" @click="logout" :title="shouldBeCollapsed ? 'Sair' : ''">
              <LogOut class="nav-icon" size="18" />
              <span class="nav-text" v-show="shouldShowTexts">Sair</span>
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
              <span class="nav-text" v-show="shouldShowTexts">
                {{ installingPWA ? 'Instalando...' : 'Instalar App' }}
              </span>
              <div v-if="shouldBeCollapsed" class="pwa-badge">
                📱
              </div>
            </button>
          </li>
        </ul>
      </nav>
      
      <!-- Footer do Sidebar -->
      <div class="sidebar-footer">
        <div class="developer-info">
          <span class="developer-text" v-show="shouldShowTexts">Desenvolvido por</span>
          <span class="developer-name">d2i</span>
        </div>
        
      </div>
    </aside>
  </template>
  
  <script>
  
  import { 
    Menu, 
    X,
    ChevronRight, 
    Target, 
    Calculator, 
    Users, 
    CreditCard, 
    BarChart3, 
    Trophy, 
    Building2, 
    FileText,
    HelpCircle, 
    BookOpen, 
    LogOut,
    Download
  } from 'lucide-vue-next'
  
import { useSidebarState } from '@/composables/useSidebarState'
  
  export default {
    name: 'Sidebar',
    components: {
      Menu,
      ChevronRight,
      Target,
      Calculator,
      Users,
      CreditCard,
      BarChart3,
      Trophy,
      Building2,
      FileText,
      HelpCircle,
      BookOpen,
      LogOut,
      Download
    },
    setup() {
      const { setSidebarState } = useSidebarState()
      
      return {
        setSidebarState
      }
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
        installingPWA: false,
        pwaInstallable: false
      }
    },
    computed: {
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
  
      // Computed para determinar se a sidebar deve estar colapsada
      shouldBeCollapsed() {
        // Em mobile/tablet, nunca colapsar (sempre mostrar textos quando aberto)
        if (this.isMobile || this.isTablet) {
          return false
        }
        // Em desktop, usar a lógica normal de colapso
        return this.sidebarCollapsed || this.internalCollapsed
      },

      // Computed para determinar se deve mostrar os textos
      shouldShowTexts() {
        // Em mobile/tablet, mostrar textos apenas quando menu estiver aberto
        if (this.isMobile || this.isTablet) {
          return this.mobileMenuOpen
        }
        // Em desktop, mostrar textos quando não estiver colapsado
        return !this.shouldBeCollapsed
      },
  
  
  
  
  
      // Computed para verificar permissões do usuário
      isAdmin() {
        return this.$store.getters.isAdmin
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
  
  
      
    },
    mounted() {
      console.log('🔧 [Sidebar] Componente montado')
      console.log('🔧 [Sidebar] Store state:', {
        isAuthenticated: this.$store.getters.isAuthenticated,
        currentUser: this.$store.getters.currentUser,
        isAdmin: this.$store.getters.isAdmin
      })
      console.log('🔧 [Sidebar] Props recebidas:', {
        sidebarCollapsed: this.sidebarCollapsed
      })
      console.log('🔧 [Sidebar] Estado inicial do componente:', {
        shouldBeCollapsed: this.shouldBeCollapsed
      })
      
      this.loadSidebarState()
      
      // Monitorar mudanças no localStorage para configurações
      window.addEventListener('storage', (event) => {
        if (event.key === 'app_settings') {
          console.log('🔧 [Sidebar] Storage event detectado:', event.key)
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
        this.$router.push('/')
      },
      
  
      
      
  
      showNotification(message, type = 'info') {
        this.$emit('show-notification', { message, type })
      },
      toggleSidebar() {
        this.internalCollapsed = !this.internalCollapsed
        this.saveSidebarState(this.internalCollapsed)
        this.setSidebarState(this.internalCollapsed) // Sincronizar com o composable
        this.$emit('toggle-sidebar', this.internalCollapsed)
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
              this.setSidebarState(this.internalCollapsed) // Sincronizar com o composable
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
      },

      // Métodos para controle do menu mobile
      toggleMobileMenu() {
        this.$store.commit('toggleMobileMenu');
        if (this.mobileMenuOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      },
      
      closeMobileMenu() {
        this.$store.commit('setMobileMenuOpen', false);
        document.body.style.overflow = '';
      },

      detectScreenSize() {
        this.$store.commit('setWindowWidth', window.innerWidth);
        
        // Fechar menu mobile se mudou para desktop
        if (this.isDesktop && this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      },

      handleResize() {
        this.detectScreenSize();
      }
    },

    mounted() {
      this.detectScreenSize();
      window.addEventListener('resize', this.handleResize);
      
      // Capturar evento de instalação PWA
      window.addEventListener('beforeinstallprompt', this.capturePWAInstallPrompt);
      
      // Carregar estado da sidebar
      this.loadSidebarState();
      
      // Verificar se PWA já está instalado
      if (this.isPWAInstalled()) {
        this.pwaInstallable = false;
      }
      
    },

    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('beforeinstallprompt', this.capturePWAInstallPrompt);
      window.removeEventListener('storage', this.handleStorageChange);
      
      
      // Restaurar overflow do body
      document.body.style.overflow = '';
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
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: var(--bg-secondary, #2a2a2a);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
    z-index: 100;
    overflow: hidden;
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
    padding: 10px 8px;
    position: relative;
    transition: all 0.3s ease;
    min-height: 44px;
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
    padding-top: 6px;
    padding-bottom: 6px;
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
    flex-shrink: 0;
  }
  
  /* Footer do Sidebar */
  .sidebar-footer {
    margin-top: auto;
    padding: 16px 20px;
    border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    background: var(--bg-secondary, #2a2a2a);
    flex-shrink: 0;
  }
  
  .developer-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  
  .developer-text {
    font-size: 11px;
    color: var(--text-muted, #888);
    font-weight: 400;
    opacity: 0.8;
  }
  
  .developer-name {
    font-size: 14px;
    color: var(--accent-primary, #10b981);
    font-weight: 600;
    letter-spacing: 1px;
  }
  
  .sidebar.collapsed .sidebar-footer {
    padding: 12px 8px;
  }
  
  .sidebar.collapsed .developer-info {
    flex-direction: row;
    justify-content: center;
  }
  
  .sidebar.collapsed .developer-text {
    display: none;
  }
  
  .sidebar.collapsed .developer-name {
    font-size: 12px;
    font-weight: 700;
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
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
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
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--text-primary, #ffffff);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100%;
    text-align: left;
    position: relative;
    min-height: 44px;
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
  }
  
  /* Badge Importante */
  .nav-badge.important {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 4px;
    background: var(--accent-primary);
    color: var(--text-button-primary);
    border-radius: 8px;
    font-size: 7px;
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    white-space: nowrap;
    vertical-align: middle;
  }
  
  .nav-badge.important:hover {
    transform: scale(1.02);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
    .sidebar.collapsed {
      width: 80px;
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

  /* ===== ESTILOS PARA MOBILE ===== */
  
  /* Botão de Menu Mobile */
  /* Botão de toggle mobile dentro do header */
  .mobile-toggle {
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    padding: 8px;
    color: var(--text-primary, #ffffff);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
  }

  .mobile-toggle:hover {
    background: var(--bg-hover, #3a3a3a);
    transform: scale(1.05);
  }

  .mobile-toggle:active {
    transform: scale(0.95);
  }

  /* Botão de fallback para mobile (sempre visível) */
  .mobile-fallback-button {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    padding: 12px;
    color: var(--text-primary, #ffffff);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: none;
  }

  .mobile-fallback-button:hover {
    background: var(--bg-hover, #3a3a3a);
    transform: scale(1.05);
  }

  .mobile-fallback-button.active {
    background: var(--accent-primary, #00ff88);
    color: var(--bg-primary, #1a1a1a);
  }

  /* Overlay para mobile */
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(4px);
  }

  /* Sidebar em mobile */
  .sidebar.mobile-closed {
    transform: translateX(-100%);
    z-index: 1000;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    z-index: 1000;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
    width: 280px !important;
  }

  /* Media queries para mobile */
  @media (max-width: 1023px) {
    .mobile-fallback-button {
      display: block;
    }
    
    .sidebar {
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
    }
    
    .sidebar.mobile-open {
      transform: translateX(0);
    }
    
    .sidebar.mobile-closed {
      transform: translateX(-100%);
    }
  }

  /* Tablet específico */
  @media (min-width: 768px) and (max-width: 1023px) {
    .sidebar.mobile-open {
      width: 280px !important;
    }
  }

  /* Mobile específico */
  @media (max-width: 767px) {
    .sidebar.mobile-open {
      width: 100vw !important;
      max-width: 320px;
    }
    
  }

  /* Melhorias para touch em mobile */
  @media (max-width: 1023px) {
    .nav-link {
      padding: 12px 16px;
      min-height: 48px;
      display: flex;
      align-items: center;
      touch-action: manipulation; /* Melhorar responsividade do touch */
    }
    
    .nav-icon {
      width: 18px;
      height: 18px;
    }
    
    .nav-text {
      font-size: 14px;
    }

    /* Estilos específicos para o header mobile */
    .sidebar-header {
      padding: 12px 16px;
      gap: 12px;
    }
    
    .logo {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo h1 {
      font-size: 16px;
      margin: 0;
    }
    
    .mobile-toggle {
      flex-shrink: 0;
      touch-action: manipulation; /* Melhorar responsividade do touch */
    }

    /* Corrigir problemas de overflow em mobile */
    .sidebar {
      max-width: 100vw;
      overflow: hidden;
    }

    /* Corrigir problemas de posicionamento em mobile */
    .sidebar.mobile-open {
      width: min(280px, 90vw) !important;
      max-width: 90vw;
    }

    /* Melhorar área de toque para botões */
    .mobile-fallback-button {
      min-width: 44px;
      min-height: 44px;
      touch-action: manipulation;
    }
  }

  /* Animações suaves para mobile */
  .sidebar {
    transition: 
      width 0.3s ease,
      background-color 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s ease;
  }

  /* Garantir que o conteúdo principal não seja afetado */
  @media (max-width: 1023px) {
    body {
      overflow-x: hidden;
    }
  }
  </style>