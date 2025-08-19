import { createRouter, createWebHistory } from 'vue-router'
import SurebetsView from '../views/SurebetsView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'surebets',
    component: SurebetsView
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
