// 🚀 Sistema de Cache Offline para Dados VIP - SureStake

class VIPOfflineCache {
  constructor() {
    this.cacheKey = 'vip_offline_cache'
    this.cacheExpiryKey = 'vip_cache_expiry'
    this.cacheDuration = 24 * 60 * 60 * 1000 // 24 horas em ms
  }

  // Salvar dados VIP no cache local
  saveVIPData(vipData) {
    try {
      const cacheData = {
        data: vipData,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
      localStorage.setItem(this.cacheExpiryKey, Date.now() + this.cacheDuration)
      
      console.log('💾 Dados VIP salvos no cache offline:', vipData)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar dados VIP no cache:', error)
      return false
    }
  }

  // Carregar dados VIP do cache local
  loadVIPData() {
    try {
      const cacheData = localStorage.getItem(this.cacheKey)
      const expiryTime = localStorage.getItem(this.cacheExpiryKey)
      
      if (!cacheData || !expiryTime) {
        console.log('📱 Cache VIP não encontrado')
        return null
      }
      
      const parsed = JSON.parse(cacheData)
      const now = Date.now()
      
      // Verificar se o cache expirou
      if (now > parseInt(expiryTime)) {
        console.log('⏰ Cache VIP expirado, removendo...')
        this.clearCache()
        return null
      }
      
      console.log('📱 Dados VIP carregados do cache offline:', parsed.data)
      return parsed.data
    } catch (error) {
      console.error('❌ Erro ao carregar dados VIP do cache:', error)
      this.clearCache()
      return null
    }
  }

  // Verificar se há dados VIP válidos no cache
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
      console.log('🗑️ Cache VIP limpo')
    } catch (error) {
      console.error('❌ Erro ao limpar cache VIP:', error)
    }
  }

  // Verificar se o PWA está offline
  isOffline() {
    return !navigator.onLine
  }

  // Verificar se o PWA está em modo standalone
  isPWAStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true
  }

  // Obter dados VIP com fallback offline
  async getVIPDataWithFallback(apiCall) {
    try {
      // Se estiver online, tentar API primeiro
      if (!this.isOffline()) {
        try {
          const apiData = await apiCall()
          if (apiData && apiData.success && apiData.vipStatus) {
            // Salvar no cache para uso offline
            this.saveVIPData(apiData.vipStatus)
            return apiData.vipStatus
          }
        } catch (apiError) {
          console.warn('⚠️ API falhou, tentando cache offline:', apiError)
        }
      }
      
      // Se API falhou ou estiver offline, usar cache
      const cachedData = this.loadVIPData()
      if (cachedData) {
        return cachedData
      }
      
      // Se não há cache, retornar dados básicos do usuário
      return this.getBasicVIPData()
      
    } catch (error) {
      console.error('❌ Erro ao obter dados VIP:', error)
      return this.getBasicVIPData()
    }
  }

  // Obter dados básicos VIP do store
  getBasicVIPData() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const authToken = localStorage.getItem('authToken')
      
      if (user && user.is_vip && authToken) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          is_vip: user.is_vip,
          vip_expires_at: user.vip_expires_at,
          account_type: user.account_type,
          status: 'active',
          source: 'offline_cache'
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Erro ao obter dados básicos VIP:', error)
      return null
    }
  }

  // Atualizar cache quando dados mudarem
  updateCache(vipData) {
    if (vipData && vipData.id) {
      this.saveVIPData(vipData)
    }
  }

  // Sincronizar cache quando voltar online
  async syncCacheWhenOnline(apiCall) {
    if (this.isOffline()) return
    
    try {
      console.log('🔄 Sincronizando cache VIP com servidor...')
      const apiData = await apiCall()
      
      if (apiData && apiData.success && apiData.vipStatus) {
        this.saveVIPData(apiData.vipStatus)
        console.log('✅ Cache VIP sincronizado com sucesso')
      }
    } catch (error) {
      console.warn('⚠️ Falha ao sincronizar cache VIP:', error)
    }
  }
}

// Instância global do cache
const vipOfflineCache = new VIPOfflineCache()

// Event listeners para mudanças de conectividade
window.addEventListener('online', () => {
  console.log('🌐 PWA voltou online, sincronizando cache VIP...')
  // A sincronização será feita pelos componentes quando necessário
})

window.addEventListener('offline', () => {
  console.log('📱 PWA ficou offline, usando cache VIP local...')
})

export default vipOfflineCache
