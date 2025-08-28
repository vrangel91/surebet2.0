import { createRouter, createWebHistory } from 'vue-router'
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
    beforeEnter: requireGuest
  },
  {
    path: '/',
    name: 'surebets',
    component: SurebetsView,
    beforeEnter: requireVIP
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    beforeEnter: requireVIP
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    beforeEnter: requireAdmin
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    beforeEnter: requireAdmin
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
    beforeEnter: requireAuth
  },
  {
    path: '/support',
    name: 'support',
    component: SupportView,
    beforeEnter: requireAuth
  },
  {
    path: '/compound-interest',
    name: 'compound-interest',
    component: CompoundInterestView,
    beforeEnter: requireVIP
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: RankingView,
    beforeEnter: requireAuth
  },
  {
    path: '/bookmaker-accounts',
    name: 'bookmaker-accounts',
    component: BookmakerAccountsView,
    beforeEnter: requireVIP
  },
  {
    path: '/bookmaker-reports',
    name: 'bookmaker-reports',
    component: () => import('../views/BookmakerReportsView.vue'),
    beforeEnter: requireVIP
  },
  {
    path: '/guide',
    name: 'guide',
    component: SurebetsGuideView,
    beforeEnter: requireAuth
  },
  {
    path: '/vip-admin',
    name: 'vip-admin',
    component: VIPAdminView,
    beforeEnter: requireAdmin
  },
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Verifica o status de autenticação ao carregar a aplicação
checkAuthStatus()

export default router
