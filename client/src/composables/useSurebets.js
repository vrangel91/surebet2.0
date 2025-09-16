/**
 * Composable para gerenciar estado dos Surebets com cache inteligente
 * Integra cache local, API calls e otimizações de performance
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import surebetsCache from '@/utils/surebetsCache'
import { SmartTimer, SmartDebounce } from '@/utils/visibilityManager'

export function useSurebets() {
  const router = useRouter()
  const store = useStore()
  
  // Estado reativo
  const surebets = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(null)
  const isSearching = ref(true)
  const soundEnabled = ref(true)
  
  // Configurações
  const autoUpdateInterval = ref(30000) // 30 segundos
  const cacheEnabled = ref(true)
  const maxRetries = ref(3)
  
  // Estatísticas
  const stats = ref({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    lastUpdate: null
  })
  
  // Timers
  let pollingTimer = null
  let retryTimer = null
  let retryCount = 0
  let smartTimer = null
  let debouncedFetch = null

  /**
   * Gera parâmetros de cache baseados no estado atual
   */
  const getCacheParams = () => {
    return {
      timestamp: Math.floor(Date.now() / 60000), // Cache por minuto
      isSearching: isSearching.value,
      soundEnabled: soundEnabled.value
    }
  }

  // Inicializar debounced fetch
  if (!debouncedFetch) {
    debouncedFetch = new SmartDebounce(fetchSurebetsInternal, 1000, {
      maxWait: 5000, // Máximo 5 segundos de espera
      leading: false,
      trailing: true
    })
  }

  /**
   * Busca surebets do cache do servidor (otimizado)
   */
  const fetchSurebets = async (forceRefresh = false) => {
    if (isLoading.value) {
      console.log('⏳ Busca já em andamento, ignorando...')
      return
    }

    // Para operações não forçadas, usar debounce
    if (!forceRefresh) {
      return debouncedFetch(forceRefresh)
    }

    // Para operações forçadas, executar imediatamente
    return fetchSurebetsInternal(forceRefresh)
  }

  const fetchSurebetsInternal = async (forceRefresh = false) => {
    if (isLoading.value) {
      console.log('⏳ Busca já em andamento, ignorando...')
      return
    }

    const cacheKey = surebetsCache.generateKey(getCacheParams())
    
    // Verificar cache local primeiro (se não for refresh forçado)
    if (!forceRefresh && cacheEnabled.value && surebetsCache.has(cacheKey)) {
      const cachedData = surebetsCache.get(cacheKey)
      if (cachedData) {
        surebets.value = cachedData.surebets || []
        lastFetchTime.value = cachedData.timestamp
        stats.value.cacheHits++
        console.log('✅ Dados carregados do cache local')
        return
      }
    }

    // Fazer requisição à API (que agora serve dados do cache do servidor)
    try {
      isLoading.value = true
      error.value = null
      stats.value.totalRequests++

      const startTime = Date.now()
      
      // Obter token de autenticação
      const authToken = store.getters.authToken
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
      }
      
      const response = await fetch('/api/surebets', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      // Processar dados
      if (data.success && data.data) {
        surebets.value = data.data.surebets || []
        lastFetchTime.value = Date.now()
        stats.value.lastUpdate = new Date().toISOString()
        
        // Salvar no cache local para navegação
        if (cacheEnabled.value) {
          surebetsCache.set(cacheKey, {
            surebets: surebets.value,
            timestamp: lastFetchTime.value,
            duration,
            source: data.cached ? 'server_cache' : 'api'
          })
        }

        // Reset retry count em caso de sucesso
        retryCount = 0
        
        const source = data.cached ? 'cache do servidor' : 'API externa'
        console.log(`✅ Surebets atualizados: ${surebets.value.length} encontrados (${duration}ms) - ${source}`)
      } else {
        throw new Error(data.message || 'Erro na resposta da API')
      }

    } catch (err) {
      error.value = err.message
      stats.value.errors++
      retryCount++
      
      console.error('❌ Erro ao buscar surebets:', err.message)
      
      // Tentar novamente se não excedeu o limite
      if (retryCount < maxRetries.value) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Backoff exponencial
        console.log(`🔄 Tentativa ${retryCount}/${maxRetries.value} em ${delay}ms`)
        
        retryTimer = setTimeout(() => {
          fetchSurebets(forceRefresh)
        }, delay)
      } else {
        console.error('❌ Máximo de tentativas excedido')
        retryCount = 0
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicia busca automática com SmartTimer
   */
  const startAutoUpdate = () => {
    // Parar timer anterior se existir
    if (smartTimer) {
      smartTimer.stop()
    }
    
    isSearching.value = true
    
    // Criar SmartTimer que pausa quando a página não está visível
    smartTimer = new SmartTimer(() => {
      if (isSearching.value) {
        fetchSurebets()
      }
    }, autoUpdateInterval.value, {
      pauseWhenHidden: true,
      resumeDelay: 2000, // 2 segundos de delay ao retomar
      maxPauseTime: 600000 // 10 minutos máximo de pausa
    })
    
    smartTimer.start()
    console.log(`🔄 Busca automática inteligente iniciada (${autoUpdateInterval.value / 1000}s)`)
  }

  /**
   * Para busca automática
   */
  const stopAutoUpdate = () => {
    if (smartTimer) {
      smartTimer.stop()
      smartTimer = null
    }
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
    isSearching.value = false
    console.log('⏸️ Busca automática parada')
  }

  /**
   * Alterna busca automática
   */
  const toggleSearch = () => {
    if (isSearching.value) {
      stopAutoUpdate()
    } else {
      startAutoUpdate()
    }
  }

  /**
   * Alterna som
   */
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
    console.log(`🔊 Som ${soundEnabled.value ? 'ativado' : 'desativado'}`)
  }

  /**
   * Força atualização (ignora cache)
   */
  const forceRefresh = () => {
    console.log('🔄 Forçando atualização...')
    fetchSurebets(true)
  }

  /**
   * Limpa cache
   */
  const clearCache = () => {
    surebetsCache.clear()
    console.log('🗑️ Cache limpo')
  }

  /**
   * Retorna estatísticas do cache
   */
  const getCacheStats = () => {
    return {
      ...surebetsCache.getStats(),
      ...stats.value,
      isSearching: isSearching.value,
      lastFetchTime: lastFetchTime.value,
      autoUpdateInterval: autoUpdateInterval.value
    }
  }

  // Computed properties
  const hasData = computed(() => surebets.value.length > 0)
  const isStale = computed(() => {
    if (!lastFetchTime.value) return true
    return Date.now() - lastFetchTime.value > autoUpdateInterval.value * 2
  })
  const cacheInfo = computed(() => surebetsCache.getInfo())

  // Lifecycle hooks
  onMounted(() => {
    console.log('🚀 useSurebets mounted')
    fetchSurebets()
    
    if (isSearching.value) {
      startAutoUpdate()
    }
  })

  onUnmounted(() => {
    console.log('🛑 useSurebets unmounted')
    stopAutoUpdate()
    
    if (retryTimer) {
      clearTimeout(retryTimer)
    }
  })

  return {
    // Estado
    surebets,
    isLoading,
    error,
    lastFetchTime,
    isSearching,
    soundEnabled,
    
    // Configurações
    autoUpdateInterval,
    cacheEnabled,
    maxRetries,
    
    // Estatísticas
    stats,
    
    // Computed
    hasData,
    isStale,
    cacheInfo,
    
    // Métodos
    fetchSurebets,
    startAutoUpdate,
    stopAutoUpdate,
    toggleSearch,
    toggleSound,
    forceRefresh,
    clearCache,
    getCacheStats
  }
}
