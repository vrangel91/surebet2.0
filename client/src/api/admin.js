import axios from '@/utils/axios'

// API para funcionalidades administrativas
export const adminAPI = {
  // Forçar atualização PWA para todos os usuários
  forcePWAUpdate: async (data) => {
    try {
      console.log('🔍 [AdminAPI] Forçando atualização PWA...')
      console.log('🔍 [AdminAPI] Request data:', data)
      
      const response = await axios.post('/api/admin/force-pwa-update', data)
      
      console.log('🔍 [AdminAPI] Response status:', response.status)
      console.log('🔍 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao forçar atualização PWA:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Obter estatísticas de usuários PWA
  getPWAStats: async () => {
    try {
      console.log('🔍 [AdminAPI] Obtendo estatísticas PWA...')
      
      const response = await axios.get('/api/admin/pwa-stats')
      
      console.log('🔍 [AdminAPI] Response status:', response.status)
      console.log('🔍 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter estatísticas PWA:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Enviar notificação push para todos os usuários
  sendGlobalNotification: async (notification) => {
    try {
      const response = await axios.post('/api/admin/send-notification', notification)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Enviar notificação (novo método)
  sendNotification: async (notification) => {
    try {
      const response = await axios.post('/api/admin/send-notification', notification)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obter notificações
  getNotifications: async (params = '') => {
    try {
      const response = await axios.get(`/api/admin/notifications${params ? '?' + params : ''}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de notificações
  getNotificationStats: async () => {
    try {
      const response = await axios.get('/api/admin/notifications/stats')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Deletar notificação
  deleteNotification: async (id) => {
    try {
      const response = await axios.delete(`/api/admin/notifications/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obter usuários
  getUsers: async () => {
    try {
      console.log('🔍 [AdminAPI] Obtendo lista de usuários...')
      
      const response = await axios.get('/api/users')
      
      console.log('🔍 [AdminAPI] Response status:', response.status)
      console.log('🔍 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter usuários:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // ===== DASHBOARD APIs =====

  // Obter estatísticas do dashboard
  getDashboardStats: async () => {
    try {
      console.log('📊 [AdminAPI] Obtendo estatísticas do dashboard...')
      
      const response = await axios.get('/api/admin/dashboard/stats')
      
      console.log('📊 [AdminAPI] Response status:', response.status)
      console.log('📊 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter estatísticas do dashboard:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Obter usuários recentes
  getRecentUsers: async () => {
    try {
      console.log('👥 [AdminAPI] Obtendo usuários recentes...')
      
      const response = await axios.get('/api/admin/dashboard/recent-users')
      
      console.log('👥 [AdminAPI] Response status:', response.status)
      console.log('👥 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter usuários recentes:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Obter planos ativos
  getActivePlans: async () => {
    try {
      console.log('💎 [AdminAPI] Obtendo planos ativos...')
      
      const response = await axios.get('/api/admin/dashboard/active-plans')
      
      console.log('💎 [AdminAPI] Response status:', response.status)
      console.log('💎 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter planos ativos:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Obter atividades recentes
  getRecentActivities: async () => {
    try {
      console.log('📋 [AdminAPI] Obtendo atividades recentes...')
      
      const response = await axios.get('/api/admin/dashboard/recent-activities')
      
      console.log('📋 [AdminAPI] Response status:', response.status)
      console.log('📋 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter atividades recentes:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // ===== USUÁRIOS APIs =====

  // Listar usuários
  getUsers: async (params = {}) => {
    try {
      console.log('👥 [AdminAPI] Obtendo lista de usuários...')
      
      const queryParams = new URLSearchParams(params).toString()
      const response = await axios.get(`/api/admin/users${queryParams ? '?' + queryParams : ''}`)
      
      console.log('👥 [AdminAPI] Response status:', response.status)
      console.log('👥 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter usuários:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // ===== PLANOS APIs =====

  // Listar planos
  getPlans: async (params = {}) => {
    try {
      console.log('💎 [AdminAPI] Obtendo lista de planos...')
      
      const queryParams = new URLSearchParams(params).toString()
      const response = await axios.get(`/api/admin/plans${queryParams ? '?' + queryParams : ''}`)
      
      console.log('💎 [AdminAPI] Response status:', response.status)
      console.log('💎 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao obter planos:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Ativar/Desativar plano
  togglePlan: async (planId) => {
    try {
      console.log(`🔄 [AdminAPI] Alternando status do plano ${planId}...`)
      
      const response = await axios.patch(`/api/admin/plans/${planId}/toggle`)
      
      console.log('🔄 [AdminAPI] Response status:', response.status)
      console.log('🔄 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro ao alternar status do plano:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  },

  // Teste de planos
  testPlans: async () => {
    try {
      console.log('🧪 [AdminAPI] Testando busca de planos...')
      
      const response = await axios.get('/api/admin/plans/test')
      
      console.log('🧪 [AdminAPI] Response status:', response.status)
      console.log('🧪 [AdminAPI] Response data:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ [AdminAPI] Erro no teste de planos:', error)
      console.error('❌ [AdminAPI] Error response:', error.response?.data)
      throw error
    }
  }
}

export default adminAPI
