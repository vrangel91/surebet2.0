<template>
  <div class="ranking-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header -->
      <div class="ranking-header">
        <h1 class="ranking-title">
          <svg class="ranking-icon" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.792l4.79 4.792A7 7 0 0 0 7.5 1.018zm0 1.96l3.976 3.976a5.5 5.5 0 1 1-7.952 0L7.5 2.978z"/>
            <path d="M6.94 7.146a.5.5 0 0 1 .12-.223l2.5-2.5a.5.5 0 0 1 .707.707L8.061 7.39l-.353.353-.354-.354L5.147 5.183a.5.5 0 0 1 .708-.707l2.206 2.207-1.06 1.06z"/>
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
          </svg>
          Ranking das Casas de Apostas
        </h1>
        <p class="ranking-subtitle">Análise das casas mais frequentes nas surebets</p>
      </div>

      <!-- Filtros e Controles -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="selectedPeriod" @change="updateRanking" class="filter-select">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Ordenar por:</label>
          <select v-model="sortBy" @change="updateRanking" class="filter-select">
            <option value="frequency">Frequência</option>
            <option value="profit">Lucro Médio</option>
            <option value="roi">ROI Médio</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Atualização:</label>
          <select v-model="refreshInterval" @change="updateRefreshInterval(parseInt($event.target.value))" class="filter-select">
            <option :value="15000">15 segundos</option>
            <option :value="30000">30 segundos</option>
            <option :value="60000">1 minuto</option>
            <option :value="300000">5 minutos</option>
          </select>
        </div>
        
        <div class="filter-group">
          <button @click="forceRefresh" :disabled="isLoading" class="refresh-btn">
            <span v-if="isLoading">🔄</span>
            <span v-else>🔄</span>
            {{ isLoading ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
        
        <div class="filter-group">
          <button @click="forceRecreateCharts" class="chart-btn" :class="{ 'disabled': chartsDisabled }">
            {{ chartsDisabled ? '⚠️ Gráficos Desabilitados' : '📊 Recriar Gráficos' }}
          </button>
        </div>
        
        <div class="filter-group">
          <button @click="clearAndRecalculate" class="clear-btn">
            🧹 Limpar e Recalcular
          </button>
        </div>
      </div>
      
      <!-- Status de Atualização -->
      <div class="update-status" v-if="lastUpdate">
        <span class="status-text">
          📅 Última atualização: {{ formatDateTime(lastUpdate) }}
        </span>
        <span class="status-indicator" :class="{ active: !isLoading }"></span>
      </div>

      <!-- Estatísticas Gerais -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-number">{{ totalSurebets }}</span>
          <span class="stat-label">Total de Surebets</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ uniqueBookmakers }}</span>
          <span class="stat-label">Casas Únicas</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ formatROI(averageROI) }}%</span>
          <span class="stat-label">ROI Médio</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ formatCurrency(totalProfit) }}</span>
          <span class="stat-label">Lucro Total</span>
        </div>
      </div>

      <!-- Gráfico de Frequência -->
      <div class="chart-section">
        <h3>Frequência das Casas de Apostas</h3>
        <div class="chart-container">
          <canvas ref="frequencyChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Tabela de Ranking -->
      <div class="ranking-table-section">
        <h3>Ranking Detalhado</h3>
        <div class="ranking-table-container">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Casa de Aposta</th>
                <th>Frequência</th>
                <th>% do Total</th>
                <th>Lucro Médio</th>
                <th>ROI Médio</th>
                <th>Última Aparição</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bookmaker, index) in rankedBookmakers" :key="bookmaker.id" class="ranking-row">
                <td class="position">
                  <span class="position-badge" :class="getPositionClass(index + 1)">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="bookmaker-name">
                  <span class="bookmaker-logo">{{ bookmaker.name.charAt(0) }}</span>
                  {{ bookmaker.name }}
                </td>
                <td class="frequency">{{ bookmaker.count }}</td>
                <td class="percentage">{{ formatPercentage(bookmaker.percentage) }}%</td>
                <td class="avg-profit" :class="getProfitClass(bookmaker.averageProfit || 0)">
                  {{ formatCurrency(bookmaker.averageProfit || 0) }}
                </td>
                <td class="avg-roi" :class="getROIClass(bookmaker.averageROI || 0)">
                  {{ formatROI(bookmaker.averageROI || 0) }}%
                </td>
                <td class="last-appearance">{{ formatDate(bookmaker.lastAppearance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gráfico de Evolução Temporal -->
      <div class="chart-section">
        <h3>Evolução Temporal das Casas</h3>
        <div class="chart-container">
          <canvas ref="timelineChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Análise de Performance -->
      <div class="analysis-section">
        <h3>Análise de Performance</h3>
        <div class="analysis-grid">
          <div class="analysis-card">
            <h4>🏆 Top Performers</h4>
            <ul class="analysis-list">
              <li v-for="bookmaker in topPerformers" :key="bookmaker.id">
                                 <strong>{{ bookmaker.name }}</strong> - {{ formatROI(bookmaker.averageROI || 0) }}% ROI
              </li>
            </ul>
          </div>
          
          <div class="analysis-card">
            <h4>📊 Mais Frequentes</h4>
            <ul class="analysis-list">
              <li v-for="bookmaker in mostFrequent" :key="bookmaker.id">
                                 <strong>{{ bookmaker.name }}</strong> - {{ bookmaker.count }} aparições
              </li>
            </ul>
          </div>
          
          <div class="analysis-card">
            <h4>💰 Maior Lucro</h4>
            <ul class="analysis-list">
              <li v-for="bookmaker in highestProfit" :key="bookmaker.id">
                                 <strong>{{ bookmaker.name }}</strong> - {{ formatCurrency(bookmaker.averageProfit || 0) }}
              </li>
            </ul>
          </div>
                 </div>
       </div>
       
       <!-- Espaçamento final para scroll -->
       <div class="scroll-spacer"></div>
     </main>

     <!-- Modal do Glossário -->
     <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
   </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
import Chart from 'chart.js/auto'
import { 
  fetchSurebets, 
  fetchBookmakerStats, 
  fetchBookmakerRanking, 
  fetchTemporalData,
  initLocalDatabase,
  loadFromLocalDatabase,
  saveStatsToLocalDatabase,
  loadStatsFromLocalDatabase
} from '../utils/surebetsAPI'

export default {
  name: 'RankingView',
  components: {
    Sidebar,
    GlossaryModal
  },
  
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      selectedPeriod: '30',
      sortBy: 'frequency',
      surebets: [],
      bookmakersStats: [], // Adicionar esta propriedade
      bookmakersRanking: [],
      topPerformers: [],
      mostFrequent: [],
      highestProfit: [],
      rankedBookmakers: [],
      totalSurebets: 0,
      uniqueBookmakers: 0,
      totalProfit: 0,
      averageROI: 0,
      frequencyChart: null,
      timelineChart: null,
      autoRefreshInterval: null,
      lastUpdate: null,
      isLoading: false,
      refreshInterval: 30000, // 30 segundos
      isRecreatingCharts: false, // Proteção contra recursão infinita
      chartsDisabled: false // Desabilitar gráficos quando há problemas
    }
  },
  
  computed: {
    ...mapGetters([
      'isAdmin',
      'userCredits',
      'canUseSystem'
    ]),
    
    currentUser() {
      return this.$store.getters.currentUser
    },
    
    hasCredits() {
      return this.userCredits > 0 && this.canUseSystem
    },
    
    // Filtrar surebets por período
    filteredSurebets() {
      if (this.selectedPeriod === 'all') return this.surebets
      
      const days = parseInt(this.selectedPeriod)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      return this.surebets.filter(surebet => 
        new Date(surebet.createdAt) >= cutoffDate
      )
    },
    
    // Ranking ordenado
    rankedBookmakers() {
      const bookmakers = [...this.bookmakersStats]
      
      // Ordenar baseado na seleção
      switch (this.sortBy) {
        case 'frequency':
          return bookmakers.sort((a, b) => b.count - a.count)
        case 'profit':
          return bookmakers.sort((a, b) => b.averageProfit - a.averageProfit)
        case 'roi':
          return bookmakers.sort((a, b) => b.averageROI - a.averageROI)
        default:
          return bookmakers.sort((a, b) => b.count - a.count)
      }
    },
    

    

  },
  
  async mounted() {
    // Verificar créditos (comentado temporariamente para testes)
    // if (!this.hasCredits) {
    //   this.$router.push('/plans')
    //   return
    // }
    
    console.log('🚀 RankingView montado, iniciando carregamento...')
    console.log('💳 Status dos créditos:', this.hasCredits)
    
    // Inicializar banco de dados local
    try {
      await initLocalDatabase()
      console.log('✅ Banco de dados local inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar banco local:', error)
    }
    
    this.loadSurebets()
    
    // Aguardar o DOM estar completamente pronto antes de configurar gráficos
    this.$nextTick(() => {
      // Aguardar um pouco mais para garantir que todos os elementos estão renderizados
      setTimeout(() => {
        console.log('🎨 Iniciando configuração dos gráficos...')
        this.setupCharts()
      }, 1000) // Aumentar delay para garantir renderização completa
    })
    
    this.startAutoRefresh()
  },
  
  beforeUnmount() {
    this.stopAutoRefresh()
    if (this.frequencyChart) {
      this.frequencyChart.destroy()
    }
    if (this.timelineChart) {
      this.timelineChart.destroy()
    }
  },
  
  methods: {
    ...mapActions([
      'consumeCredit'
    ]),
    
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    openGlossary() {
      this.showGlossaryModal = true
    },
    
    closeGlossary() {
      this.showGlossaryModal = false
    },
    
         // Carregar surebets da API
     async loadSurebets() {
       if (this.isLoading) return
       
       try {
         this.isLoading = true
         console.log('🔄 Carregando surebets...')
         
         // Carregar estatísticas existentes do banco de dados primeiro
         await this.loadStatsFromDatabase()
         
         // Buscar dados da API (com fallback automático para dados de exemplo)
         this.surebets = await fetchSurebets({
           period: this.selectedPeriod,
           sortBy: this.sortBy
         })
         
         console.log('✅ Surebets carregados:', this.surebets.length, 'registros')
         
         this.lastUpdate = new Date()
         this.updateRanking()
         
         // Salvar dados no localStorage como cache
         localStorage.setItem('ranking_cache', JSON.stringify({
           data: this.surebets,
           timestamp: this.lastUpdate.getTime(),
           period: this.selectedPeriod,
           sortBy: this.sortBy
         }))
         
       } catch (error) {
         console.error('❌ Erro ao carregar surebets:', error)
         
         // Tentar carregar cache local
         const cached = await this.loadFromCache()
         if (cached) {
           console.log('📊 Usando cache local:', cached.length, 'registros')
           this.surebets = cached
           this.updateRanking()
         } else {
           // Fallback para dados de exemplo em caso de erro
           console.log('📊 Usando dados de exemplo')
           this.surebets = this.getFallbackData()
           
           // Debug dos dados de fallback
           console.log('🔍 Verificando ROI nos dados de fallback:', {
             totalSurebets: this.surebets.length,
             surebetsWithROI: this.surebets.filter(s => s.roi && s.roi > 0).length,
             sampleROI: this.surebets.slice(0, 3).map(s => ({ roi: s.roi, profit: s.profit, bookmaker1: s.bookmaker1 }))
           })
           
           this.updateRanking()
         }
       } finally {
         this.isLoading = false
       }
     },
    
    // Carregar dados do cache local
    async loadFromCache() {
      try {
        // Primeiro tentar do banco local
        const localData = await loadFromLocalDatabase({
          period: this.selectedPeriod,
          sortBy: this.sortBy
        })
        
        if (localData && localData.length > 0) {
          console.log('📊 Dados carregados do banco local:', localData.length, 'registros')
          return localData
        }
        
        // Fallback para localStorage
        const cached = localStorage.getItem('ranking_cache')
        if (cached) {
          const cacheData = JSON.parse(cached)
          const cacheAge = Date.now() - cacheData.timestamp
          
          // Cache válido por 5 minutos
          if (cacheAge < 5 * 60 * 1000 && 
              cacheData.period === this.selectedPeriod && 
              cacheData.sortBy === this.sortBy) {
            return cacheData.data
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cache:', error)
      }
      return null
    },
    
    // Dados de fallback para demonstração
    getFallbackData() {
      return [
        {
          id: 'surebet_2024_001',
          bookmaker1: 'Bet365',
          bookmaker2: 'William Hill',
          profit: 15.50,
          roi: 3.2,
          createdAt: '2024-01-15T10:00:00Z',
          sport: 'Futebol',
          event: 'Brasil vs Argentina',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_002',
          bookmaker1: 'Bet365',
          bookmaker2: 'Unibet',
          profit: 12.80,
          roi: 2.8,
          createdAt: '2024-01-14T15:30:00Z',
          sport: 'Futebol',
          event: 'Manchester United vs Liverpool',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_003',
          bookmaker1: 'William Hill',
          bookmaker2: 'Betfair',
          profit: 18.20,
          roi: 4.1,
          createdAt: '2024-01-13T09:15:00Z',
          sport: 'Futebol',
          event: 'Real Madrid vs Barcelona',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_004',
          bookmaker1: 'Betfair',
          bookmaker2: 'Unibet',
          profit: 22.10,
          roi: 4.8,
          createdAt: '2024-01-12T14:20:00Z',
          sport: 'Futebol',
          event: 'Bayern Munich vs Borussia Dortmund',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_005',
          bookmaker1: 'Bet365',
          bookmaker2: 'Betfair',
          profit: 16.75,
          roi: 3.5,
          createdAt: '2024-01-11T09:45:00Z',
          sport: 'Futebol',
          event: 'PSG vs Marseille',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_006',
          bookmaker1: 'Unibet',
          bookmaker2: 'William Hill',
          profit: 14.30,
          roi: 3.8,
          createdAt: '2024-01-10T16:00:00Z',
          sport: 'Futebol',
          event: 'Juventus vs Inter',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_007',
          bookmaker1: 'Betfair',
          bookmaker2: 'Bet365',
          profit: 19.80,
          roi: 4.3,
          createdAt: '2024-01-09T11:30:00Z',
          sport: 'Futebol',
          event: 'Ajax vs PSV',
          market: 'Resultado Final',
          status: 'active'
        },
        {
          id: 'surebet_2024_008',
          bookmaker1: 'William Hill',
          bookmaker2: 'Unibet',
          profit: 13.90,
          roi: 3.1,
          createdAt: '2024-01-08T13:45:00Z',
          sport: 'Futebol',
          event: 'Porto vs Benfica',
          market: 'Resultado Final',
          status: 'active'
        }
      ]
    },
    
    // Processar estatísticas de um bookmaker
    processBookmaker(stats, bookmakerName, surebet) {
      console.log('🔍 Processando bookmaker:', bookmakerName, 'para surebet:', surebet.id)
      
      if (!stats[bookmakerName]) {
        stats[bookmakerName] = {
          id: bookmakerName.toLowerCase().replace(/\s+/g, '-'),
          name: bookmakerName,
          count: 0,
          totalProfit: 0,
          totalROI: 0,
          surebets: []
        }
      }
      
      const bookmaker = stats[bookmakerName]
      bookmaker.count++
      
      // Garantir que os valores são números válidos
      const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
      const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
      
      bookmaker.totalProfit += validProfit
      bookmaker.totalROI += validROI
      bookmaker.surebets.push(surebet)
      
      // Calcular médias com validação
      if (bookmaker.count > 0) {
        bookmaker.averageProfit = bookmaker.totalProfit / bookmaker.count
        bookmaker.averageROI = bookmaker.totalROI / bookmaker.count
        
        // Verificar se as médias são válidas
        if (isNaN(bookmaker.averageProfit) || bookmaker.averageProfit === Infinity || bookmaker.averageProfit === -Infinity) {
          console.warn(`⚠️ averageProfit inválido para ${bookmaker.name}: ${bookmaker.averageProfit}, resetando para 0`)
          bookmaker.averageProfit = 0
        }
        if (isNaN(bookmaker.averageROI) || bookmaker.averageROI === Infinity || bookmaker.averageROI === -Infinity) {
          console.warn(`⚠️ averageROI inválido para ${bookmaker.name}: ${bookmaker.averageROI}, resetando para 0`)
          bookmaker.averageROI = 0
        }
      } else {
        bookmaker.averageProfit = 0
        bookmaker.averageROI = 0
      }
      
      console.log('📊 Bookmaker atualizado:', {
        name: bookmaker.name,
        count: bookmaker.count,
        totalROI: bookmaker.totalROI,
        averageROI: bookmaker.averageROI,
        lastSurebetROI: surebet.roi,
        calculoVerificacao: `${bookmaker.totalROI} / ${bookmaker.count} = ${bookmaker.totalROI / bookmaker.count}`
      })
    },
    
    // Processar estatísticas dos bookmakers
    processBookmakerStats() {
      console.log('🔄 Processando estatísticas dos bookmakers...')
      
      if (!this.surebets || !Array.isArray(this.surebets)) {
        console.log('⚠️ Surebets não é um array válido:', this.surebets)
        this.bookmakersStats = []
        return
      }
      
      // RECALCULAR TUDO desde zero para garantir dados corretos
      const bookmakerStats = {}
      
      console.log('🔄 Recalculando estatísticas desde zero para garantir precisão...')
      
      const processedSurebetIds = new Set()
      
      this.surebets.forEach(surebet => {
        // Verificar se já processamos este surebet_id para evitar duplicatas
        const uniqueId = surebet.surebet_id || surebet.id
        if (processedSurebetIds.has(uniqueId)) {
          console.log('⚠️ Surebet duplicado ignorado:', uniqueId)
          return
        }
        processedSurebetIds.add(uniqueId)
        
        console.log('🔍 Processando surebet único:', uniqueId, 'com bookmakers:', surebet.bookmaker1, surebet.bookmaker2)
        
        // Processar bookmaker1 (house da API real)
        if (surebet.bookmaker1) {
          const bookmaker = surebet.bookmaker1.trim()
          if (bookmaker) {
            if (!bookmakerStats[bookmaker]) {
              bookmakerStats[bookmaker] = {
                id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
                name: bookmaker,
                count: 0,
                totalProfit: 0,
                totalROI: 0,
                surebets: []
              }
            }
            
            bookmakerStats[bookmaker].count++
            
            // Garantir que os valores são números válidos
            const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
            const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
            
            bookmakerStats[bookmaker].totalProfit += validProfit
            bookmakerStats[bookmaker].totalROI += validROI
            bookmakerStats[bookmaker].surebets.push(surebet)
          }
        }
        
        // Processar bookmaker2 se existir
        if (surebet.bookmaker2 && surebet.bookmaker2.trim()) {
          const bookmaker = surebet.bookmaker2.trim()
          if (bookmaker) {
            if (!bookmakerStats[bookmaker]) {
              bookmakerStats[bookmaker] = {
                id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
                name: bookmaker,
                count: 0,
                totalProfit: 0,
                totalROI: 0,
                surebets: []
              }
            }
            
            bookmakerStats[bookmaker].count++
            
            // Garantir que os valores são números válidos
            const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
            const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
            
            bookmakerStats[bookmaker].totalProfit += validProfit
            bookmakerStats[bookmaker].totalROI += validROI
            bookmakerStats[bookmaker].surebets.push(surebet)
          }
        }
      })
      
      // Calcular totalCount após processar todos os bookmakers
      const totalCount = Object.values(bookmakerStats).reduce((sum, stats) => sum + stats.count, 0)
      
      // Calcular médias para cada bookmaker
      Object.values(bookmakerStats).forEach(stats => {
        // Garantir que os valores são números válidos
        const validTotalProfit = isNaN(stats.totalProfit) || stats.totalProfit === null || stats.totalProfit === undefined ? 0 : parseFloat(stats.totalProfit)
        const validTotalROI = isNaN(stats.totalROI) || stats.totalROI === null || stats.totalROI === undefined ? 0 : parseFloat(stats.totalROI)
        
        // Calcular médias com validação
        if (stats.count > 0) {
          stats.averageProfit = validTotalProfit / stats.count
          stats.averageROI = validTotalROI / stats.count
          
          // Verificar se as médias são válidas
          if (isNaN(stats.averageProfit) || stats.averageProfit === Infinity || stats.averageProfit === -Infinity) {
            console.warn(`⚠️ averageProfit inválido para ${stats.name}: ${stats.averageProfit}, resetando para 0`)
            stats.averageProfit = 0
          }
          if (isNaN(stats.averageROI) || stats.averageROI === Infinity || stats.averageROI === -Infinity) {
            console.warn(`⚠️ averageROI inválido para ${stats.name}: ${stats.averageROI}, resetando para 0`)
            stats.averageROI = 0
          }
        } else {
          stats.averageProfit = 0
          stats.averageROI = 0
        }
        
        stats.percentage = totalCount > 0 ? (stats.count / totalCount) * 100 : 0
        
        // Debug: verificar valores calculados
        console.log(`📊 ${stats.name}: count=${stats.count}, totalROI=${stats.totalROI}, averageROI=${stats.averageROI}`)
      })
      
      this.bookmakersStats = Object.values(bookmakerStats)
        .sort((a, b) => b.count - a.count)
      
      console.log('📊 Estatísticas processadas:', this.bookmakersStats.length, 'bookmakers')
      console.log('🏆 Top 3 bookmakers:', this.bookmakersStats.slice(0, 3).map(b => `${b.name}: ${b.count} surebets`))
      console.log('🔍 Debug ROI dos bookmakers:', this.bookmakersStats.slice(0, 5).map(b => ({
        name: b.name,
        count: b.count,
        totalROI: b.totalROI,
        averageROI: b.averageROI,
        totalProfit: b.totalProfit,
        roiCalculado: b.count > 0 ? (b.totalROI / b.count).toFixed(4) : 'N/A',
        roiOriginal: b.averageROI
      })))
      
      // Verificar especificamente os 3 primeiros bookmakers na tabela
      console.log('🎯 ROI na tabela (3 primeiros):', this.bookmakersStats.slice(0, 3).map(b => ({
        name: b.name,
        averageROI: b.averageROI,
        formatado: this.formatROI(b.averageROI),
        classe: this.getROIClass(b.averageROI)
      })))
      
      // Salvar estatísticas no banco de dados
      this.saveStatsToDatabase()
    },

    // Atualizar ranking e estatísticas
    updateRanking() {
      console.log('🔄 Atualizando ranking...')
      console.log('📊 Surebets disponíveis:', this.surebets)
      
      if (!this.surebets || this.surebets.length === 0) {
        console.log('⚠️ Nenhum surebet para processar')
        this.bookmakersStats = []
        this.totalSurebets = 0
        this.uniqueBookmakers = 0
        this.totalProfit = 0
        this.averageROI = 0
        return
      }
      
      // Processar estatísticas dos bookmakers
      this.processBookmakerStats()
      
      // Verificar se bookmakersStats foi processado corretamente
      if (!this.bookmakersStats || !Array.isArray(this.bookmakersStats)) {
        console.log('⚠️ bookmakersStats não é um array válido:', this.bookmakersStats)
        this.bookmakersStats = []
      }
      
      // Preservar estatísticas acumuladas e não zerar
      const currentSurebetsCount = this.surebets.length
      const currentTotalProfit = this.surebets.reduce((sum, surebet) => {
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        return sum + validProfit
      }, 0)
      const currentTotalROI = this.surebets.reduce((sum, surebet) => {
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        return sum + validROI
      }, 0)
      
      console.log('🔍 Debug ROI:', {
        currentSurebetsCount,
        currentTotalROI,
        surebetsWithROI: this.surebets.filter(s => s.roi > 0).length,
        firstSurebetROI: this.surebets[0]?.roi,
        averageCalculated: currentSurebetsCount > 0 ? currentTotalROI / currentSurebetsCount : 0
      })
      
      // Manter o maior valor (dados acumulados) - EXCETO para averageROI que deve ser recalculado
      this.totalSurebets = Math.max(currentSurebetsCount, this.totalSurebets || 0)
      this.totalProfit = Math.max(currentTotalProfit, this.totalProfit || 0)
      
      // Recalcular ROI médio corretamente
      if (currentSurebetsCount > 0) {
        this.averageROI = currentTotalROI / currentSurebetsCount
        console.log('✅ ROI médio atualizado:', this.averageROI)
      } else {
        console.log('⚠️ Sem surebets para calcular ROI médio')
      }
      this.uniqueBookmakers = this.bookmakersStats.length
      
      console.log('📈 Estatísticas calculadas:', {
        totalSurebets: this.totalSurebets,
        uniqueBookmakers: this.uniqueBookmakers,
        totalProfit: this.totalProfit,
        averageROI: this.averageROI
      })
      
      // Calcular porcentagens para cada bookmaker
      if (this.bookmakersStats && Array.isArray(this.bookmakersStats)) {
        this.bookmakersStats.forEach(bookmaker => {
          bookmaker.percentage = (bookmaker.count / this.totalSurebets) * 100
          bookmaker.lastAppearance = bookmaker.surebets.length > 0 
            ? new Date(Math.max(...bookmaker.surebets.map(s => new Date(s.createdAt).getTime())))
            : new Date()
        })
        
        // Ordenar por frequência (count)
        this.rankedBookmakers = [...this.bookmakersStats].sort((a, b) => b.count - a.count)
        
        // Top performers
        this.topPerformers = [...this.bookmakersStats]
          .sort((a, b) => (b.averageROI || 0) - (a.averageROI || 0))
          .slice(0, 5)
        
        // Mais frequentes
        this.mostFrequent = [...this.bookmakersStats]
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        // Maior lucro
        this.highestProfit = [...this.bookmakersStats]
          .sort((a, b) => b.totalProfit - a.totalProfit)
          .slice(0, 5)
      } else {
        // Inicializar arrays vazios se não houver dados
        this.rankedBookmakers = []
        this.topPerformers = []
        this.mostFrequent = []
        this.highestProfit = []
      }
      
      console.log('✅ Ranking atualizado:', {
        totalSurebets: this.totalSurebets,
        uniqueBookmakers: this.uniqueBookmakers,
        totalProfit: this.totalProfit,
        averageROI: this.averageROI,
        rankedBookmakers: this.rankedBookmakers.length,
        topPerformers: this.topPerformers.length,
        mostFrequent: this.mostFrequent.length,
        highestProfit: this.highestProfit.length
      })
      
      // Aguardar um tick para garantir que os dados estão atualizados no DOM
      this.$nextTick(() => {
        // Atualizar gráficos
        this.updateCharts()
      })
    },
    
    // Configurar gráficos
    setupCharts() {
      try {
        this.setupFrequencyChart()
        this.setupTimelineChart()
      } catch (error) {
        console.error('❌ Erro ao configurar gráficos:', error)
      }
    },
    
    // Gráfico de frequência
    setupFrequencyChart() {
      try {
        console.log('🎨 Configurando gráfico de frequência...')
        
        const ctx = this.$refs.frequencyChart
        if (!ctx) {
          console.log('⚠️ Referência do gráfico de frequência não encontrada')
          return
        }
        
        console.log('📊 Contexto do canvas encontrado:', ctx)
        
        // Destruir gráfico existente se houver
        if (this.frequencyChart) {
          console.log('🗑️ Destruindo gráfico de frequência existente...')
          this.frequencyChart.destroy()
          this.frequencyChart = null
        }
        
        // Verificar se temos dados para exibir
        const hasData = this.bookmakersStats && this.bookmakersStats.length > 0
        console.log('📈 Dados disponíveis para gráfico:', hasData, this.bookmakersStats?.length)
        
        // Criar dados iniciais (mesmo que vazios)
        const initialLabels = hasData ? this.bookmakersStats.slice(0, 10).map(b => b.name) : ['Sem dados']
        const initialData = hasData ? this.bookmakersStats.slice(0, 10).map(b => b.count) : [0]
        
        console.log('🏷️ Labels iniciais:', initialLabels)
        console.log('📊 Dados iniciais:', initialData)
        
        this.frequencyChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: initialLabels,
            datasets: [{
              label: 'Frequência',
              data: initialData,
              backgroundColor: 'rgba(0, 255, 136, 0.8)',
              borderColor: '#00ff88',
              borderWidth: 2,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#00ff88'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#ffffff',
                  font: {
                    size: 12
                  }
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#ffffff',
                  font: {
                    size: 11
                  },
                  maxRotation: 45
                }
              }
            }
          }
        })
        
        console.log('✅ Gráfico de frequência configurado com sucesso:', this.frequencyChart)
        
      } catch (error) {
        console.error('❌ Erro ao configurar gráfico de frequência:', error)
        console.error('Stack trace:', error.stack)
      }
    },
    
    // Gráfico de timeline
    setupTimelineChart() {
      try {
        console.log('🎨 Configurando gráfico de timeline...')
        
        const ctx = this.$refs.timelineChart
        if (!ctx) {
          console.log('⚠️ Referência do gráfico de timeline não encontrada')
          return
        }
        
        console.log('📊 Contexto do canvas timeline encontrado:', ctx)
        
        // Destruir gráfico existente se houver
        if (this.timelineChart) {
          console.log('🗑️ Destruindo gráfico de timeline existente...')
          this.timelineChart.destroy()
          this.timelineChart = null
        }
        
        // Verificar se temos dados para exibir
        const hasData = this.surebets && this.surebets.length > 0
        console.log('📈 Dados de timeline disponíveis:', hasData, this.surebets?.length)
        
        // Criar dados iniciais para timeline
        let initialLabels = ['Sem dados']
        let initialData = [0]
        
        if (hasData) {
          // Agrupar surebets por dia
          const dailyStats = {}
          this.surebets.forEach(surebet => {
            const date = new Date(surebet.createdAt).toDateString()
            dailyStats[date] = (dailyStats[date] || 0) + 1
          })
          
          const sortedDates = Object.keys(dailyStats).sort()
          initialLabels = sortedDates.map(date => 
            new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          )
          initialData = sortedDates.map(date => dailyStats[date])
        }
        
        console.log('🏷️ Labels de timeline:', initialLabels)
        console.log('📊 Dados de timeline:', initialData)
        
        this.timelineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: initialLabels,
            datasets: [{
              label: 'Surebets por Dia',
              data: initialData,
              borderColor: '#00ff88',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#00ff88',
              pointBorderColor: '#ffffff',
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#00ff88'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#ffffff',
                  font: {
                    size: 12
                  }
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#ffffff',
                  font: {
                    size: 11
                  },
                  maxRotation: 45
                }
              }
            }
          }
        })
        
        console.log('✅ Gráfico de timeline configurado com sucesso:', this.timelineChart)
        
      } catch (error) {
        console.error('❌ Erro ao configurar gráfico de timeline:', error)
        console.error('Stack trace:', error.stack)
      }
    },
    
    // Atualizar dados dos gráficos
    updateCharts() {
      try {
        // Verificar se os gráficos foram desabilitados devido a erros
        if (this.chartsDisabled) {
          console.log('⚠️ Gráficos desabilitados devido a erros anteriores - use "Recriar Gráficos"')
          return
        }
        
        console.log('🔄 Atualizando gráficos...')
        console.log('📊 Estado dos gráficos:', {
          frequencyChart: !!this.frequencyChart,
          timelineChart: !!this.timelineChart
        })
        
        // Aguardar um tick para garantir que os dados estão atualizados
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateFrequencyChart()
            this.updateTimelineChart()
          }, 100)
        })
      } catch (error) {
        console.error('❌ Erro ao atualizar gráficos:', error)
        this.chartsDisabled = true
      }
    },
    
    updateFrequencyChart() {
      if (!this.frequencyChart) {
        console.log('⚠️ Gráfico de frequência não foi inicializado')
        return
      }
      
      try {
        // Usar bookmakersStats diretamente se rankedBookmakers não estiver disponível
        const dataSource = this.rankedBookmakers?.length > 0 ? this.rankedBookmakers : this.bookmakersStats
        
        if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) {
          console.log('⚠️ Nenhum dado disponível para o gráfico de frequência:', dataSource)
          
          // Limpar gráfico se não há dados
          if (this.frequencyChart.data && this.frequencyChart.data.datasets && this.frequencyChart.data.datasets[0]) {
            this.frequencyChart.data.labels = []
            this.frequencyChart.data.datasets[0].data = []
            this.frequencyChart.update('none') // Usar 'none' para evitar animações
          }
          return
        }
        
        const top10 = dataSource.slice(0, 10)
        console.log('📊 Atualizando gráfico com', top10.length, 'bookmakers')
        
        // Verificar se o gráfico está em estado válido
        if (this.frequencyChart.data && this.frequencyChart.data.datasets && this.frequencyChart.data.datasets[0]) {
          this.frequencyChart.data.labels = top10.map(b => b.name || 'Desconhecido')
          this.frequencyChart.data.datasets[0].data = top10.map(b => b.count || 0)
          this.frequencyChart.update('none') // Usar 'none' para evitar animações
          
          console.log('✅ Gráfico de frequência atualizado com sucesso')
        } else {
          console.log('⚠️ Estrutura do gráfico inválida - desabilitando atualizações automáticas')
          // Desabilitar atualizações automáticas para evitar recursão
          this.chartsDisabled = true
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar gráfico de frequência:', error)
        // Desabilitar atualizações automáticas para evitar recursão
        this.chartsDisabled = true
      }
    },
    
    updateTimelineChart() {
      if (!this.timelineChart) {
        console.log('⚠️ Gráfico de timeline não foi inicializado')
        return
      }
      
      try {
        if (!this.filteredSurebets || !Array.isArray(this.filteredSurebets)) {
          console.log('⚠️ filteredSurebets não é um array válido:', this.filteredSurebets)
          
          // Limpar gráfico se não há dados
          if (this.timelineChart.data && this.timelineChart.data.datasets && this.timelineChart.data.datasets[0]) {
            this.timelineChart.data.labels = []
            this.timelineChart.data.datasets[0].data = []
            this.timelineChart.update('none')
          }
          return
        }
        
        // Agrupar surebets por dia
        const dailyStats = {}
        this.filteredSurebets.forEach(surebet => {
          const date = new Date(surebet.createdAt).toDateString()
          dailyStats[date] = (dailyStats[date] || 0) + 1
        })
        
        const sortedDates = Object.keys(dailyStats).sort()
        
        // Verificar se o gráfico está em estado válido
        if (this.timelineChart.data && this.timelineChart.data.datasets && this.timelineChart.data.datasets[0]) {
          this.timelineChart.data.labels = sortedDates.map(date => 
            new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          )
          this.timelineChart.data.datasets[0].data = sortedDates.map(date => dailyStats[date])
          this.timelineChart.update('none')
          
          console.log('✅ Gráfico de timeline atualizado com sucesso')
        } else {
          console.log('⚠️ Estrutura do gráfico de timeline inválida - desabilitando atualizações automáticas')
          // Desabilitar atualizações automáticas para evitar recursão
          this.chartsDisabled = true
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar gráfico de timeline:', error)
        // Desabilitar atualizações automáticas para evitar recursão
        this.chartsDisabled = true
      }
    },
    
    // Utilitários
    getPositionClass(position) {
      // Garantir que o valor é um número válido
      const validPosition = isNaN(position) || position === null || position === undefined ? 0 : parseInt(position)
      if (validPosition === 1) return 'gold'
      if (validPosition === 2) return 'silver'
      if (validPosition === 3) return 'bronze'
      return 'normal'
    },
    
    getProfitClass(profit) {
      // Garantir que o valor é um número válido
      const validProfit = isNaN(profit) || profit === null || profit === undefined ? 0 : parseFloat(profit)
      return validProfit > 0 ? 'positive' : validProfit < 0 ? 'negative' : 'neutral'
    },
    
    getROIClass(roi) {
      // Garantir que o valor é um número válido
      const validROI = isNaN(roi) || roi === null || roi === undefined ? 0 : parseFloat(roi)
      return validROI > 0 ? 'positive' : validROI < 0 ? 'negative' : 'neutral'
    },
    
    formatCurrency(value) {
      // Verificar se o valor é válido
      if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
        return 'R$ 0,00'
      }
      
      // Converter para número se for string
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      
      // Verificar novamente se é um número válido
      if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
        return 'R$ 0,00'
      }
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue)
    },
    
    formatROI(value) {
      // Verificar se o valor é válido
      if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
        return '0.00'
      }
      
      // Converter para número se for string
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      
      // Verificar novamente se é um número válido
      if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
        return '0.00'
      }
      
      return numValue.toFixed(2)
    },
    
    formatPercentage(value) {
      // Verificar se o valor é válido
      if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
        return '0.0'
      }
      
      // Converter para número se for string
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      
      // Verificar novamente se é um número válido
      if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
        return '0.0'
      }
      
      return numValue.toFixed(1)
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    // Iniciar atualização automática
    startAutoRefresh() {
      this.stopAutoRefresh() // Parar qualquer intervalo existente
      
      this.autoRefreshInterval = setInterval(() => {
        this.loadSurebets()
      }, this.refreshInterval)
      
      console.log(`🔄 Atualização automática iniciada a cada ${this.refreshInterval / 1000} segundos`)
    },
    
    // Parar atualização automática
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
        this.autoRefreshInterval = null
        console.log('⏹️ Atualização automática parada')
      }
    },
    
    // Atualizar intervalo de refresh
    updateRefreshInterval(newInterval) {
      this.refreshInterval = newInterval
      if (this.autoRefreshInterval) {
        this.startAutoRefresh() // Reiniciar com novo intervalo
      }
    },
    
    // Forçar atualização manual
    forceRefresh() {
      this.loadSurebets()
    },
    
    // Limpar todos os dados salvos e recalcular
    clearAndRecalculate() {
      console.log('🧹 Limpando todos os dados salvos...')
      
      // Limpar localStorage
      localStorage.removeItem('ranking_stats')
      localStorage.removeItem('surebets_cache')
      
      // Limpar dados em memória
      this.bookmakersStats = []
      this.totalSurebets = 0
      this.totalProfit = 0
      this.averageROI = 0
      this.uniqueBookmakers = 0
      
      // Recarregar dados
      this.loadSurebets()
    },
    
    // Forçar recriação dos gráficos
    forceRecreateCharts() {
      console.log('🔄 Forçando recriação dos gráficos...')
      
      // Resetar flags de erro
      this.chartsDisabled = false
      this.isRecreatingCharts = false
      
      // Destruir gráficos existentes
      if (this.frequencyChart) {
        this.frequencyChart.destroy()
        this.frequencyChart = null
      }
      if (this.timelineChart) {
        this.timelineChart.destroy()
        this.timelineChart = null
      }
      
      // Aguardar um pouco e recriar
      setTimeout(() => {
        this.setupCharts()
      }, 200)
    },
    
    // Formatar data e hora para exibição
    formatDateTime(date) {
      if (!date) return ''
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // Salvar estatísticas no banco de dados
    async saveStatsToDatabase() {
      try {
        // Preparar dados para salvar (remover referências circulares e objetos complexos)
        const cleanBookmakersStats = this.bookmakersStats.map(bookmaker => {
          // Garantir que todos os valores são válidos antes de salvar
          const validTotalProfit = isNaN(bookmaker.totalProfit) || bookmaker.totalProfit === null || bookmaker.totalProfit === undefined ? 0 : parseFloat(bookmaker.totalProfit)
          const validTotalROI = isNaN(bookmaker.totalROI) || bookmaker.totalROI === null || bookmaker.totalROI === undefined ? 0 : parseFloat(bookmaker.totalROI)
          const validAverageProfit = isNaN(bookmaker.averageProfit) || bookmaker.averageProfit === null || bookmaker.averageProfit === undefined ? 0 : parseFloat(bookmaker.averageProfit)
          const validAverageROI = isNaN(bookmaker.averageROI) || bookmaker.averageROI === null || bookmaker.averageROI === undefined ? 0 : parseFloat(bookmaker.averageROI)
          
          return {
            id: bookmaker.id,
            name: bookmaker.name,
            count: bookmaker.count,
            totalProfit: validTotalProfit,
            totalROI: validTotalROI,
            averageProfit: validAverageProfit,
            averageROI: validAverageROI,
            percentage: bookmaker.percentage,
            lastAppearance: bookmaker.lastAppearance,
            // Não salvar o array surebets para evitar problemas de clonagem
            surebetIds: bookmaker.surebets ? bookmaker.surebets.map(s => s.id || s.surebet_id) : []
          }
        })
        
        const statsData = {
          bookmakersStats: cleanBookmakersStats,
          totalSurebets: this.totalSurebets,
          uniqueBookmakers: this.uniqueBookmakers,
          totalProfit: this.totalProfit,
          averageROI: this.averageROI,
          lastUpdate: new Date().toISOString(),
          processedSurebetIds: this.surebets.map(s => s.surebet_id || s.id)
        }
        
        // Salvar no IndexedDB
        await saveStatsToLocalDatabase(statsData)
        console.log('💾 Estatísticas salvas no banco de dados')
        
        // Também salvar no localStorage como backup
        localStorage.setItem('ranking_stats', JSON.stringify(statsData))
        
      } catch (error) {
        console.error('❌ Erro ao salvar estatísticas:', error)
      }
    },
    
    // Carregar estatísticas do banco de dados
    async loadStatsFromDatabase() {
      try {
        // Tentar carregar do IndexedDB primeiro
        const dbStats = await loadStatsFromLocalDatabase()
        if (dbStats) {
          console.log('📊 Estatísticas carregadas do banco de dados')
          this.mergeWithDatabaseStats(dbStats)
          return true
        }
        
        // Fallback para localStorage
        const localStats = localStorage.getItem('ranking_stats')
        if (localStats) {
          const stats = JSON.parse(localStats)
          console.log('📊 Estatísticas carregadas do localStorage')
          this.mergeWithDatabaseStats(stats)
          return true
        }
        
        return false
      } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error)
        return false
      }
    },
    
    // Mesclar com estatísticas do banco de dados
    mergeWithDatabaseStats(savedStats) {
      try {
        // Se não há dados atuais, usar os salvos
        if (!this.bookmakersStats.length) {
          // Restaurar bookmakers salvos (sem o array surebets)
          this.bookmakersStats = (savedStats.bookmakersStats || []).map(savedBookmaker => ({
            ...savedBookmaker,
            surebets: [] // Inicializar array vazio
          }))
          this.totalSurebets = savedStats.totalSurebets || 0
          this.uniqueBookmakers = savedStats.uniqueBookmakers || 0
          this.totalProfit = savedStats.totalProfit || 0
          this.averageROI = savedStats.averageROI || 0
          return
        }
        
        // Mesclar bookmakers existentes com novos
        const existingStats = new Map()
        this.bookmakersStats.forEach(bookmaker => {
          existingStats.set(bookmaker.name, bookmaker)
        })
        
        // Adicionar ou atualizar com dados salvos
        if (savedStats.bookmakersStats) {
          savedStats.bookmakersStats.forEach(savedBookmaker => {
            if (existingStats.has(savedBookmaker.name)) {
              // Atualizar existing
              const existing = existingStats.get(savedBookmaker.name)
              existing.count += savedBookmaker.count
              existing.totalProfit += savedBookmaker.totalProfit
              existing.totalROI += savedBookmaker.totalROI
              
              // Recalcular médias com validação
              const validTotalProfit = isNaN(existing.totalProfit) || existing.totalProfit === null || existing.totalProfit === undefined ? 0 : parseFloat(existing.totalProfit)
              const validTotalROI = isNaN(existing.totalROI) || existing.totalROI === null || existing.totalROI === undefined ? 0 : parseFloat(existing.totalROI)
              
              existing.averageProfit = existing.count > 0 ? validTotalProfit / existing.count : 0
              existing.averageROI = existing.count > 0 ? validTotalROI / existing.count : 0
              
              // Verificar se as médias são válidas
              if (isNaN(existing.averageProfit) || existing.averageProfit === Infinity || existing.averageProfit === -Infinity) {
                existing.averageProfit = 0
              }
              if (isNaN(existing.averageROI) || existing.averageROI === Infinity || existing.averageROI === -Infinity) {
                existing.averageROI = 0
              }
            } else {
              // Adicionar novo (sem o array surebets)
              existingStats.set(savedBookmaker.name, {
                ...savedBookmaker,
                surebets: []
              })
            }
          })
        }
        
        // Atualizar array
        this.bookmakersStats = Array.from(existingStats.values())
          .sort((a, b) => b.count - a.count)
        
        // Recalcular totais (somar com os dados salvos)
        this.uniqueBookmakers = this.bookmakersStats.length
        
        // Somar valores salvos aos atuais
        const savedProfit = savedStats.totalProfit || 0
        const savedSurebets = savedStats.totalSurebets || 0
        
        // Evitar duplicação: só somar se os valores salvos são maiores
        if (savedProfit > this.totalProfit) {
          this.totalProfit = savedProfit
        }
        if (savedSurebets > this.totalSurebets) {
          this.totalSurebets = savedSurebets
        }
        
        console.log('🔄 Estatísticas mescladas com sucesso')
      } catch (error) {
        console.error('❌ Erro ao mesclar estatísticas:', error)
      }
    }
  }
}
</script>

<style scoped>
/* Garantir que o scroll funcione corretamente */
html, body {
  scroll-behavior: smooth;
}

.ranking-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
  width: 100%;
  align-items: stretch;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: auto;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 200px; /* Espaço extra para scroll */
  width: 100%;
  box-sizing: border-box;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  height: 100vh;
}

/* Estilos personalizados para scrollbar */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.scroll-spacer {
  height: 200px;
  flex-shrink: 0;
  min-height: 200px;
  margin-bottom: 50px;
}

.ranking-header {
  text-align: center;
  margin-bottom: 32px;
}

.ranking-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.ranking-icon {
  width: 36px;
  height: 36px;
  color: #00ff88;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

.ranking-subtitle {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
}

.filters-section {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.filter-select {
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #00ff88;
}

.refresh-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

 .refresh-btn:disabled {
   opacity: 0.6;
   cursor: not-allowed;
   transform: none;
 }
 
 .chart-btn {
   background: linear-gradient(135deg, #ff6b35, #f7931e);
   border: none;
   border-radius: 8px;
   padding: 12px 20px;
   color: #ffffff;
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all 0.3s ease;
   min-width: 150px;
 }
 
   .chart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  .chart-btn.disabled {
    background: linear-gradient(135deg, #ff4757, #ff3838);
    opacity: 0.8;
    cursor: pointer;
  }
  
  .chart-btn.disabled:hover {
    transform: none;
    box-shadow: none;
  }
  
  .clear-btn {
    background: linear-gradient(135deg, #ff4757, #ff3838);
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 150px;
  }
  
  .clear-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

.update-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(42, 42, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-text {
  color: #cccccc;
  font-size: 14px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4444;
  transition: background-color 0.3s ease;
}

.status-indicator.active {
  background: #00ff88;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 8px;
}

.stat-label {
  color: #cccccc;
  font-size: 14px;
}

.chart-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.chart-section h3 {
  color: #ffffff;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  position: relative;
}

.ranking-table-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.ranking-table-section h3 {
  color: #ffffff;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.ranking-table-container {
  overflow-x: auto;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ranking-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.ranking-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.position-badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.position-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #1a1a1a;
}

.position-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #1a1a1a;
}

.position-badge.bronze {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: #ffffff;
}

.position-badge.normal {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.bookmaker-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bookmaker-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.frequency, .percentage {
  text-align: center;
  font-weight: 600;
}

.avg-profit.positive {
  color: #00ff88;
}

.avg-profit.negative {
  color: #ff4444;
}

.avg-profit.neutral {
  color: #cccccc;
}

.avg-roi.positive {
  color: #00ff88;
}

.avg-roi.negative {
  color: #ff4444;
}

.avg-roi.neutral {
  color: #cccccc;
}

.analysis-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 100px; /* Espaço extra no final */
  flex-shrink: 0;
}

.analysis-section h3 {
  color: #ffffff;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.analysis-card {
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.analysis-card h4 {
  color: #00ff88;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.analysis-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.analysis-list li {
  color: #cccccc;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.analysis-list li:last-child {
  border-bottom: none;
}

.analysis-list strong {
  color: #ffffff;
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
    padding-bottom: 120px;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-table {
    font-size: 12px;
  }
  
  .ranking-table th,
  .ranking-table td {
    padding: 8px;
  }
}

/* Ajustes para telas menores */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 0;
  }
  
  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .analysis-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
</style>
