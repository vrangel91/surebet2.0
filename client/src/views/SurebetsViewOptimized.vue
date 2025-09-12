<template>
  <RouteGuard :requiresVIP="true">
    <div class="surebets-container">
      <!-- Sidebar -->
      <Sidebar 
        :sidebarCollapsed="sidebarCollapsed"
        @toggle-sidebar="handleSidebarToggle"
        @sidebar-state-loaded="handleSidebarStateLoaded"
      />

      <!-- Conteúdo Principal -->
      <main class="main-content">
        <!-- Header Global -->
        <Header />
        
        <!-- Header do Conteúdo -->
        <header class="content-header">
          <div class="header-left">
            <h2 class="page-title">Surebets</h2>
            <p class="page-subtitle">Encontre as melhores oportunidades de arbitragem</p>
          </div>
          
          <!-- Estatísticas -->
          <div class="stats-container">
            <div class="stat-item">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ stats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Pré-live:</span>
              <span class="stat-value">{{ stats.prelive }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Live:</span>
              <span class="stat-value">{{ stats.live }}</span>
            </div>
          </div>
        </header>

        <!-- Controles -->
        <div class="controls">
          <div class="control-group">
            <button 
              class="control-btn" 
              :class="{ active: isSearching }"
              @click="toggleSearch"
              :disabled="isInitialLoading"
            >
              <span class="control-text">{{ isSearching ? 'Pausar' : 'Retomar' }}</span>
            </button>
            
            <button 
              class="control-btn" 
              :class="{ active: soundEnabled }"
              @click="toggleSound"
            >
              <span class="control-text">{{ soundEnabled ? 'Som On' : 'Som Off' }}</span>
            </button>
            
            <button 
              class="control-btn"
              @click="refreshData"
              :disabled="isRefreshing"
            >
              <span class="control-text">{{ isRefreshing ? 'Atualizando...' : 'Atualizar' }}</span>
            </button>
          </div>
          
          <!-- Filtros Rápidos -->
          <div class="quick-filters">
            <select v-model="activeFilter" class="filter-select">
              <option value="">Todos</option>
              <option value="prelive">Pré-live ({{ stats.prelive }})</option>
              <option value="live">Live ({{ stats.live }})</option>
            </select>
            
            <input 
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por esporte ou partida..."
              class="search-input"
            />
          </div>
        </div>

        <!-- Loading States -->
        <div v-if="isInitialLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando surebets...</p>
        </div>

        <!-- Conteúdo Principal -->
        <div v-else class="content-area">
          <!-- Cards Fixos -->
          <div v-if="pinnedCards.length > 0" class="pinned-section">
            <h3 class="section-title">Cards Fixos ({{ pinnedCards.length }})</h3>
            <div class="pinned-grid">
              <SurebetCard 
                v-for="(surebet, index) in pinnedCards" 
                :key="`pinned-${index}`"
                :surebet="surebet"
                :isPinned="true"
                @toggle-pin="togglePinCard"
              />
            </div>
          </div>

          <!-- Lista Principal com Virtual Scrolling -->
          <div class="main-section">
            <div class="section-header">
              <h3 class="section-title">
                Surebets Disponíveis 
                <span v-if="!isInitialLoading" class="count">({{ filteredSurebets.length }})</span>
              </h3>
              
              <!-- Controles de Visualização -->
              <div class="view-controls">
                <button 
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  Grid
                </button>
                <button 
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  Lista
                </button>
              </div>
            </div>

            <!-- Virtual Scroll Container -->
            <VirtualScroll
              :items="filteredSurebets"
              :item-height="viewMode === 'grid' ? 200 : 120"
              :container-height="600"
              :overscan="5"
              @scroll="handleScroll"
            >
              <template #default="{ item: surebet, index }">
                <SurebetCard 
                  :surebet="surebet"
                  :isPinned="isPinned(surebet)"
                  :view-mode="viewMode"
                  @toggle-pin="togglePinCard"
                  @add-to-reports="addSurebetToReports"
                />
              </template>
            </VirtualScroll>

            <!-- Loading de Paginação -->
            <div v-if="isPaginating" class="pagination-loading">
              <div class="loading-spinner small"></div>
              <span>Carregando mais...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </RouteGuard>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import SurebetCard from '../components/SurebetCard.vue'
import VirtualScroll from '../components/VirtualScroll.vue'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import RouteGuard from '../components/RouteGuard.vue'

// Composables
import { useOptimizedFilters } from '../composables/useOptimizedFilters'
import { usePagination } from '../composables/usePagination'
import { useOptimizedDataProcessing } from '../composables/useOptimizedDataProcessing'
import { useLoadingStates } from '../composables/useLoadingStates'

export default {
  name: 'SurebetsViewOptimized',
  components: {
    SurebetCard,
    VirtualScroll,
    Sidebar,
    Header,
    RouteGuard
  },
  setup() {
    const store = useStore()
    
    // Estado reativo
    const surebets = ref({})
    const sidebarCollapsed = ref(false)
    const isSearching = ref(true)
    const soundEnabled = ref(true)
    const searchTerm = ref('')
    const activeFilter = ref('')
    const viewMode = ref('grid')
    const pinnedCards = ref([])
    
    // Composables
    const { processSurebetsData, clearCache } = useOptimizedDataProcessing()
    const { 
      isLoading, 
      isInitialLoading, 
      isRefreshing, 
      isPaginating,
      startInitialLoading, 
      stopInitialLoading,
      startRefresh,
      stopRefresh,
      withLoading
    } = useLoadingStates()
    
    // Filtros otimizados
    const filters = computed(() => ({
      activeFilter: activeFilter.value,
      selectedHouses: [],
      selectedSports: [],
      selectedCurrencies: [],
      selectedDate: null,
      minProfit: 0,
      maxProfit: 100,
      totalHouses: 0,
      totalSports: 0,
      totalCurrencies: 0
    }))
    
    const { filteredSurebets } = useOptimizedFilters(surebets, filters)
    
    // Paginação
    const { 
      currentPageItems, 
      canLoadMore, 
      loadMore, 
      handleScroll: handlePaginationScroll 
    } = usePagination(filteredSurebets, {
      itemsPerPage: 50,
      enableAutoLoad: true
    })
    
    // Estatísticas
    const stats = computed(() => {
      if (!surebets.value || Object.keys(surebets.value).length === 0) {
        return { total: 0, prelive: 0, live: 0 }
      }
      
      const processed = processSurebetsData(surebets.value)
      return processed.stats
    })
    
    // Métodos
    const fetchSurebets = async () => {
      try {
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const data = await response.json()
        
        if (data.success && data.data) {
          surebets.value = data.data
        } else {
          surebets.value = data
        }
        
        console.log(`✅ Dados carregados: ${Object.keys(surebets.value).length} surebets`)
      } catch (error) {
        console.error('Erro ao carregar surebets:', error)
      }
    }
    
    const refreshData = async () => {
      await withLoading('refresh', fetchSurebets)
    }
    
    const toggleSearch = () => {
      isSearching.value = !isSearching.value
      if (isSearching.value) {
        startAutoUpdate()
      } else {
        stopAutoUpdate()
      }
    }
    
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }
    
    const togglePinCard = (surebet) => {
      const index = pinnedCards.value.findIndex(card => 
        JSON.stringify(card) === JSON.stringify(surebet)
      )
      
      if (index > -1) {
        pinnedCards.value.splice(index, 1)
      } else {
        pinnedCards.value.push(surebet)
      }
    }
    
    const isPinned = (surebet) => {
      return pinnedCards.value.some(card => 
        JSON.stringify(card) === JSON.stringify(surebet)
      )
    }
    
    const addSurebetToReports = (surebet) => {
      // Implementar lógica de adicionar aos relatórios
      console.log('Adicionando aos relatórios:', surebet)
    }
    
    const handleSidebarToggle = (collapsed) => {
      sidebarCollapsed.value = collapsed
    }
    
    const handleSidebarStateLoaded = (collapsed) => {
      sidebarCollapsed.value = collapsed
    }
    
    const handleScroll = (event) => {
      handlePaginationScroll(event)
    }
    
    // Auto-update
    let autoUpdateInterval = null
    
    const startAutoUpdate = () => {
      if (autoUpdateInterval) return
      
      autoUpdateInterval = setInterval(() => {
        if (isSearching.value) {
          fetchSurebets()
        }
      }, 30000) // 30 segundos
    }
    
    const stopAutoUpdate = () => {
      if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval)
        autoUpdateInterval = null
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      await withLoading('initial', fetchSurebets)
      if (isSearching.value) {
        startAutoUpdate()
      }
    })
    
    onUnmounted(() => {
      stopAutoUpdate()
      clearCache()
    })
    
    return {
      // Estado
      surebets,
      sidebarCollapsed,
      isSearching,
      soundEnabled,
      searchTerm,
      activeFilter,
      viewMode,
      pinnedCards,
      
      // Computed
      filteredSurebets,
      stats,
      isLoading,
      isInitialLoading,
      isRefreshing,
      isPaginating,
      canLoadMore,
      
      // Métodos
      fetchSurebets,
      refreshData,
      toggleSearch,
      toggleSound,
      togglePinCard,
      isPinned,
      addSurebetToReports,
      handleSidebarToggle,
      handleSidebarStateLoaded,
      handleScroll,
      loadMore
    }
  }
}
</script>

<style scoped>
.surebets-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
}

.header-left h2 {
  color: var(--text-primary);
  margin: 0 0 5px 0;
}

.header-left p {
  color: var(--text-secondary);
  margin: 0;
}

.stats-container {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-primary);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.control-group {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover:not(:disabled) {
  background: var(--bg-overlay);
  border-color: var(--accent-primary);
}

.control-btn.active {
  background: var(--accent-primary);
  color: var(--text-button-primary);
  border-color: var(--accent-primary);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input {
  min-width: 250px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-bottom: 0;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-area {
  flex: 1;
  padding: 20px;
}

.pinned-section {
  margin-bottom: 30px;
}

.section-title {
  color: var(--text-primary);
  margin: 0 0 15px 0;
  font-size: 18px;
}

.count {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: normal;
}

.pinned-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.main-section {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.view-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: var(--accent-primary);
  color: var(--text-button-primary);
  border-color: var(--accent-primary);
}

.pagination-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-secondary);
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .quick-filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    min-width: auto;
    width: 100%;
  }
}
</style>
