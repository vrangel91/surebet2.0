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
  }
}

export default adminAPI
