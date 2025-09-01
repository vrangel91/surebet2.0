import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import SurebetsView from '../views/SurebetsView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import PlansView from '../views/PlansView.vue'
import ReferralsView from '../views/ReferralsView.vue'
import SupportView from '../views/SupportView.vue'
import CompoundInterestView from '../views/CompoundInterestView.vue'
import RankingView from '../views/RankingView.vue'
import BookmakerAccountsView from '../views/BookmakerAccountsView.vue'
import SurebetsGuideView from '../views/SurebetsGuideView.vue'
import VIPAdminView from '../views/VIPAdminView.vue'
import { requireAuth, requireGuest, requireAdmin, requireVIP, checkAuthStatus } from './guards'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'surebets',
    component: SurebetsView,
    meta: { requiresVIP: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { requiresVIP: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/plans',
    name: 'plans',
    component: PlansView
  },
  {
    path: '/referrals',
    name: 'referrals',
    component: ReferralsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/support',
    name: 'support',
    component: SupportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/compound-interest',
    name: 'compound-interest',
    component: CompoundInterestView,
    meta: { requiresVIP: true }
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: RankingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookmaker-accounts',
    name: 'bookmaker-accounts',
    component: BookmakerAccountsView,
    meta: { requiresVIP: true }
  },
  {
    path: '/guide',
    name: 'guide',
    component: SurebetsGuideView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vip-admin',
    name: 'vip-admin',
    component: VIPAdminView,
    meta: { requiresAdmin: true }
  },
  // Rota catch-all para páginas não encontradas
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guard global para todas as rotas
router.beforeEach((to, from, next) => {
  console.log(`🔄 Navegação: ${from.path} → ${to.path}`)
  
  // Verifica se a rota requer guest (não autenticado)
  if (to.meta.requiresGuest && store.getters.isAuthenticated) {
    console.log('🔄 Usuário já autenticado, redirecionando...')
    if (store.getters.isVIP) {
      next('/')
    } else {
      next('/plans')
    }
    return
  }
  
  // Verifica se a rota requer autenticação
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    console.log('🚫 Rota protegida acessada sem autenticação:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }
  
  // Verifica se a rota requer VIP
  if (to.meta.requiresVIP && (!store.getters.isAuthenticated || !store.getters.isVIP)) {
    console.log('🚫 Rota VIP acessada sem permissão:', to.path)
    localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    next('/plans')
    return
  }
  
  // Verifica se a rota requer admin
  if (to.meta.requiresAdmin && (!store.getters.isAuthenticated || !store.getters.isAdmin)) {
    console.log('🚫 Rota admin acessada sem permissão:', to.path)
    next('/plans')
    return
  }
  
  next()
})

// Verifica o status de autenticação ao carregar a aplicação
checkAuthStatus()

export default router
