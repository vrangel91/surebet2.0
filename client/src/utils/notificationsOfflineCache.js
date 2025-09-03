// 🚀 Sistema de Cache Offline para Notificações - SureStake

class NotificationsOfflineCache {
  constructor() {
    this.cacheKey = 'notifications_offline_cache'
    this.cacheExpiryKey = 'notifications_cache_expiry'
    this.cacheDuration = 6 * 60 * 60 * 1000 // 6 horas em ms
    this.unreadCountKey = 'notifications_unread_count'
  }

  // Salvar notificações no cache local
  saveNotifications(notifications, unreadCount = 0) {
    try {
      const cacheData = {
        notifications: notifications,
        unreadCount: unreadCount,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
      localStorage.setItem(this.cacheExpiryKey, Date.now() + this.cacheDuration)
      localStorage.setItem(this.unreadCountKey, unreadCount.toString())
      
      console.log('💾 Notificações salvas no cache offline:', notifications.length)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar notificações no cache:', error)
      return false
    }
  }

  // Carregar notificações do cache local
  loadNotifications() {
    try {
      const cacheData = localStorage.getItem(this.cacheKey)
      const expiryTime = localStorage.getItem(this.cacheExpiryKey)
      
      if (!cacheData || !expiryTime) {
        console.log('📱 Cache de notificações não encontrado')
        return { notifications: [], unreadCount: 0 }
      }
      
      const parsed = JSON.parse(cacheData)
      const now = Date.now()
      
      // Verificar se o cache expirou
      if (now > parseInt(expiryTime)) {
        console.log('⏰ Cache de notificações expirado, removendo...')
        this.clearCache()
        return { notifications: [], unreadCount: 0 }
      }
      
      console.log('📱 Notificações carregadas do cache offline:', parsed.notifications.length)
      return {
        notifications: parsed.notifications || [],
        unreadCount: parsed.unreadCount || 0
      }
    } catch (error) {
      console.error('❌ Erro ao carregar notificações do cache:', error)
      this.clearCache()
      return { notifications: [], unreadCount: 0 }
    }
  }

  // Verificar se há cache válido
  hasValidCache() {
    try {
      const expiryTime = localStorage.getItem(this.cacheExpiryKey)
      if (!expiryTime) return false
      
      const now = Date.now()
      return now <= parseInt(expiryTime)
    } catch (error) {
      return false
    }
  }

  // Limpar cache
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey)
      localStorage.removeItem(this.cacheExpiryKey)
      localStorage.removeItem(this.unreadCountKey)
      console.log('🗑️ Cache de notificações limpo')
    } catch (error) {
      console.error('❌ Erro ao limpar cache de notificações:', error)
    }
  }

  // Verificar se o PWA está offline
  isOffline() {
    return !navigator.onLine
  }

  // Obter notificações com fallback offline
  async getNotificationsWithFallback(apiCall) {
    try {
      // Se estiver online, tentar API primeiro
      if (!this.isOffline()) {
        try {
          const apiData = await apiCall()
          if (apiData && apiData.success) {
            const notifications = apiData.notifications || []
            const unreadCount = apiData.unreadCount || 0
            
            // Salvar no cache para uso offline
            this.saveNotifications(notifications, unreadCount)
            return { notifications, unreadCount }
          }
        } catch (apiError) {
          console.warn('⚠️ API de notificações falhou, tentando cache offline:', apiError)
        }
      }
      
      // Se API falhou ou estiver offline, usar cache
      const cachedData = this.loadNotifications()
      if (cachedData.notifications.length > 0) {
        return cachedData
      }
      
      // Se não há cache, retornar dados vazios
      return { notifications: [], unreadCount: 0 }
      
    } catch (error) {
      console.error('❌ Erro ao obter notificações:', error)
      return { notifications: [], unreadCount: 0 }
    }
  }

  // Marcar notificação como lida no cache
  markAsRead(notificationId) {
    try {
      const cachedData = this.loadNotifications()
      const notification = cachedData.notifications.find(n => n.id === notificationId)
      
      if (notification && !notification.is_read) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
        
        // Atualizar contagem de não lidas
        const newUnreadCount = Math.max(0, cachedData.unreadCount - 1)
        
        // Salvar cache atualizado
        this.saveNotifications(cachedData.notifications, newUnreadCount)
        
        console.log('✅ Notificação marcada como lida no cache offline')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error)
      return false
    }
  }

  // Marcar todas como lidas no cache
  markAllAsRead() {
    try {
      const cachedData = this.loadNotifications()
      
      cachedData.notifications.forEach(notification => {
        if (!notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        }
      })
      
      // Salvar cache atualizado
      this.saveNotifications(cachedData.notifications, 0)
      
      console.log('✅ Todas as notificações marcadas como lidas no cache offline')
      return true
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error)
      return false
    }
  }

  // Descartar notificação no cache
  dismissNotification(notificationId) {
    try {
      const cachedData = this.loadNotifications()
      const notification = cachedData.notifications.find(n => n.id === notificationId)
      
      if (notification && !notification.is_dismissed) {
        notification.is_dismissed = true
        notification.dismissed_at = new Date().toISOString()
        
        // Atualizar contagem de não lidas se não estava lida
        let newUnreadCount = cachedData.unreadCount
        if (!notification.is_read) {
          newUnreadCount = Math.max(0, newUnreadCount - 1)
        }
        
        // Salvar cache atualizado
        this.saveNotifications(cachedData.notifications, newUnreadCount)
        
        console.log('✅ Notificação descartada no cache offline')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Erro ao descartar notificação:', error)
      return false
    }
  }

  // Adicionar nova notificação ao cache
  addNotification(notification) {
    try {
      const cachedData = this.loadNotifications()
      
      // Verificar se já existe
      const existingIndex = cachedData.notifications.findIndex(n => n.id === notification.id)
      
      if (existingIndex >= 0) {
        // Atualizar existente
        cachedData.notifications[existingIndex] = notification
      } else {
        // Adicionar nova
        cachedData.notifications.unshift(notification)
      }
      
      // Atualizar contagem de não lidas
      const newUnreadCount = cachedData.notifications.filter(n => !n.is_read && !n.is_dismissed).length
      
      // Salvar cache atualizado
      this.saveNotifications(cachedData.notifications, newUnreadCount)
      
      console.log('✅ Nova notificação adicionada ao cache offline')
      return true
    } catch (error) {
      console.error('❌ Erro ao adicionar notificação ao cache:', error)
      return false
    }
  }

  // Sincronizar cache quando voltar online
  async syncCacheWhenOnline(apiCall) {
    if (this.isOffline()) return
    
    try {
      console.log('🔄 Sincronizando cache de notificações com servidor...')
      const apiData = await apiCall()
      
      if (apiData && apiData.success) {
        const notifications = apiData.notifications || []
        const unreadCount = apiData.unreadCount || 0
        
        this.saveNotifications(notifications, unreadCount)
        console.log('✅ Cache de notificações sincronizado com sucesso')
      }
    } catch (error) {
      console.warn('⚠️ Falha ao sincronizar cache de notificações:', error)
    }
  }

  // Obter estatísticas do cache
  getCacheStats() {
    try {
      const cachedData = this.loadNotifications()
      const total = cachedData.notifications.length
      const unread = cachedData.notifications.filter(n => !n.is_read && !n.is_dismissed).length
      const dismissed = cachedData.notifications.filter(n => n.is_dismissed).length
      
      return {
        total,
        unread,
        dismissed,
        read: total - unread - dismissed,
        hasCache: this.hasValidCache(),
        isOffline: this.isOffline()
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do cache:', error)
      return {
        total: 0,
        unread: 0,
        dismissed: 0,
        read: 0,
        hasCache: false,
        isOffline: this.isOffline()
      }
    }
  }
}

// Instância global do cache
const notificationsOfflineCache = new NotificationsOfflineCache()

export default notificationsOfflineCache
