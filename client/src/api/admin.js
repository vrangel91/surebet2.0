import axios from '@/utils/axios'

// API para funcionalidades administrativas
export const adminAPI = {
  // Forçar atualização PWA para todos os usuários
  forcePWAUpdate: async (data) => {
    try {
      const response = await axios.post('/api/admin/force-pwa-update', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Obter estatísticas de usuários PWA
  getPWAStats: async () => {
    try {
      const response = await axios.get('/api/admin/pwa-stats')
      return response.data
    } catch (error) {
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
      const response = await axios.get('/api/users')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default adminAPI
