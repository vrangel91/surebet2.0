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
import { requireAuth, requireGuest, requireAdmin, checkAuthStatus } from './guards'

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
    beforeEnter: requireAuth
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    beforeEnter: requireAuth
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
    beforeEnter: requireAuth
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: RankingView,
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Verifica o status de autenticação ao carregar a aplicação
checkAuthStatus()

export default router
