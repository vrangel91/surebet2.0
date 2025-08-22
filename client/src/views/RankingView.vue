<template>
  <div class="ranking-container">
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <main class="main-content">
      <div class="ranking-header">
        <h1 class="ranking-title">
          <svg class="ranking-icon" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z"/>
          </svg>
          Insights de Surebets
        </h1>
        <p class="ranking-subtitle">Análise completa de padrões, casas, mercados e oportunidades</p>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="selectedPeriod" @change="updateAnalysis" class="filter-select">
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Esporte:</label>
          <select v-model="selectedSport" @change="updateAnalysis" class="filter-select">
            <option value="all">Todos</option>
            <option v-for="sport in availableSports" :key="sport" :value="sport">{{ sport }}</option>
          </select>
        </div>
        <div class="filter-group">
          <button @click="forceRefresh" :disabled="isLoading" class="refresh-btn">
            {{ isLoading ? '🔄 Atualizando...' : '🔄 Atualizar' }}
          </button>
        </div>
      </div>

      <div class="stats-dashboard">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-number">{{ totalSurebets }}</span>
            <span class="stat-label">Surebets</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <span class="stat-number">{{ uniqueHouses }}</span>
            <span class="stat-label">Casas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-number">{{ uniqueMarkets }}</span>
            <span class="stat-label">Mercados</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-number">{{ formatCurrency(averageProfit) }}</span>
            <span class="stat-label">Lucro Médio</span>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-section">
          <h3>🏆 Top Casas</h3>
          <div class="chart-container">
            <canvas ref="housesChart"></canvas>
          </div>
        </div>
        <div class="chart-section">
          <h3>📈 Mercados</h3>
          <div class="chart-container">
            <canvas ref="marketsChart"></canvas>
          </div>
        </div>
        <div class="chart-section">
          <h3>⏰ Atividade por Hora</h3>
          <div class="chart-container">
            <canvas ref="timeChart"></canvas>
          </div>
        </div>
        <div class="chart-section">
          <h3>⚽ Esportes</h3>
          <div class="chart-container">
            <canvas ref="sportsChart"></canvas>
          </div>
        </div>
      </div>

             <div class="ranking-section">
         <h3>🏢 Ranking das Casas</h3>
         <div class="ranking-table-container">
           <table class="ranking-table">
             <thead>
               <tr>
                 <th>Pos</th>
                 <th>Casa</th>
                 <th>Aparições</th>
                 <th>%</th>
                 <th>Lucro Médio</th>
                 <th>Lucro Max</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="(house, index) in topHouses" :key="house.name" class="ranking-row">
                 <td><span class="position-badge" :class="getPositionClass(index + 1)">{{ index + 1 }}</span></td>
                 <td class="house-name">
                   <span class="house-logo">{{ house.name.charAt(0) }}</span>
                   {{ house.name }}
                 </td>
                 <td>{{ house.count }}</td>
                 <td>{{ formatPercentage(house.percentage) }}%</td>
                 <td class="positive">{{ formatCurrency(house.averageProfit) }}</td>
                 <td class="positive">{{ formatCurrency(house.maxProfit) }}</td>
               </tr>
             </tbody>
           </table>
         </div>
         
         <!-- Estatísticas das casas não ativas -->
         <div class="inactive-houses-info">
           <h4>📊 Casas Não Ativas no Período</h4>
           <p>Total de casas disponíveis: <strong>{{ totalAvailableHouses }}</strong></p>
           <p>Casas ativas: <strong class="positive">{{ activeHousesCount }}</strong></p>
           <p>Casas inativas: <strong class="neutral">{{ inactiveHousesCount }}</strong></p>
         </div>
       </div>

      <div class="ranking-section">
        <h3>🤝 Duplas Mais Frequentes</h3>
        <div class="ranking-table-container">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Dupla</th>
                <th>Freq</th>
                <th>%</th>
                <th>Lucro Médio</th>
                <th>Consistência</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pair, index) in topHousePairs" :key="pair.id" class="ranking-row">
                <td><span class="position-badge" :class="getPositionClass(index + 1)">{{ index + 1 }}</span></td>
                <td class="pair-names">
                  <span class="house-tag">{{ pair.house1 }}</span>
                  <span class="pair-separator">+</span>
                  <span class="house-tag">{{ pair.house2 }}</span>
                </td>
                <td>{{ pair.count }}</td>
                <td>{{ formatPercentage(pair.percentage) }}%</td>
                <td class="positive">{{ formatCurrency(pair.averageProfit) }}</td>
                <td><span class="consistency-score" :class="getConsistencyClass(pair.consistency)">{{ formatPercentage(pair.consistency) }}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="insights-section">
        <h3>🔍 Insights</h3>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">⭐</span>
              <h4>Melhor Dupla</h4>
            </div>
            <div class="insight-content">
              <p v-if="bestPair">
                <strong>{{ bestPair.house1 }} + {{ bestPair.house2 }}</strong><br>
                <span class="insight-detail">{{ bestPair.count }} aparições</span>
              </p>
              <p v-else class="no-data">Sem dados</p>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">🕐</span>
              <h4>Pico</h4>
            </div>
            <div class="insight-content">
              <p v-if="peakHour">
                <strong>{{ peakHour.hour }}:00h</strong><br>
                <span class="insight-detail">{{ peakHour.count }} surebets</span>
              </p>
              <p v-else class="no-data">Sem dados</p>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">💎</span>
              <h4>Melhor Mercado</h4>
            </div>
            <div class="insight-content">
              <p v-if="bestMarket">
                <strong>{{ bestMarket.name }}</strong><br>
                <span class="insight-detail">{{ formatCurrency(bestMarket.averageProfit) }}</span>
              </p>
              <p v-else class="no-data">Sem dados</p>
            </div>
          </div>
          <div class="insight-card">
            <div class="insight-header">
              <span class="insight-icon">⚽</span>
              <h4>Esporte Ativo</h4>
            </div>
            <div class="insight-content">
              <p v-if="mostActiveSport">
                <strong>{{ mostActiveSport.name }}</strong><br>
                <span class="insight-detail">{{ mostActiveSport.count }} surebets</span>
              </p>
              <p v-else class="no-data">Sem dados</p>
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-spacer"></div>
    </main>

    <GlossaryModal :isVisible="showGlossaryModal" @close="closeGlossary" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
import { Chart, registerables } from 'chart.js'
import { filterOptions } from '../config/filters.js'
Chart.register(...registerables)

export default {
  name: 'RankingView',
  components: { Sidebar, GlossaryModal },
  
  data() {
    return {
      sidebarCollapsed: false,
      showGlossaryModal: false,
      selectedPeriod: '30',
      selectedSport: 'all',
      surebets: [],
      totalSurebets: 0,
      uniqueHouses: 0,
      uniqueMarkets: 0,
      averageProfit: 0,
      topHouses: [],
      topHousePairs: [],
      topMarkets: [],
      bestPair: null,
      peakHour: null,
      bestMarket: null,
      mostActiveSport: null,
      housesChart: null,
      marketsChart: null,
      timeChart: null,
      sportsChart: null,
      isLoading: false,
      availableSports: []
    }
  },
  
  computed: {
    ...mapGetters(['isAdmin', 'isAuthenticated']),
    
    filteredSurebets() {
      let filtered = [...this.surebets]
      if (this.selectedPeriod !== 'all') {
        const days = parseInt(this.selectedPeriod)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        filtered = filtered.filter(s => new Date(s.date) >= cutoffDate)
      }
      if (this.selectedSport !== 'all') {
        filtered = filtered.filter(s => s.sport === this.selectedSport)
      }
      return filtered
    },
    
    // Estatísticas das casas disponíveis
    totalAvailableHouses() {
      return filterOptions.houses.length
    },
    
    activeHousesCount() {
      return this.uniqueHouses
    },
    
    inactiveHousesCount() {
      return this.totalAvailableHouses - this.activeHousesCount
    }
  },
  
  async mounted() {
    await this.loadSurebetsData()
    this.$nextTick(() => {
      setTimeout(() => {
        this.setupCharts()
      }, 1000)
    })
  },
  
  beforeUnmount() {
    this.destroyCharts()
  },
  
  methods: {
    handleSidebarToggle(collapsed) { this.sidebarCollapsed = collapsed },
    handleSidebarStateLoaded(collapsed) { this.sidebarCollapsed = collapsed },
    openGlossary() { this.showGlossaryModal = true },
    closeGlossary() { this.showGlossaryModal = false },

    async loadSurebetsData() {
      if (this.isLoading) return
      try {
        this.isLoading = true
        
        // Tentar carregar dados do banco primeiro
        try {
          const dbStats = await this.$store.dispatch('fetchSurebetStats', {
            period: this.selectedPeriod,
            sport: this.selectedSport,
            limit: 1000
          })
          
          if (dbStats && dbStats.length > 0) {
            console.log(`✅ Carregados ${dbStats.length} registros do banco de dados`)
            this.surebets = dbStats
          } else {
            console.log('📊 Nenhum dado encontrado no banco, usando dados de exemplo')
            this.surebets = this.generateSampleData()
          }
        } catch (dbError) {
          console.warn('⚠️ Erro ao carregar do banco, usando dados de exemplo:', dbError)
          this.surebets = this.generateSampleData()
        }
        
        this.processAnalytics()
        
        // Salvar dados no banco se não existirem
        if (this.surebets.length > 0) {
          this.saveDataToDatabase()
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error)
        // Fallback para dados de exemplo
        this.surebets = this.generateSampleData()
        this.processAnalytics()
      } finally {
        this.isLoading = false
      }
    },

    generateSampleData() {
      // Usar as casas reais do filtro
      const houses = filterOptions.houses
      const markets = ['Resultado Final', 'Over/Under 2.5', 'Ambas Marcam', 'Handicap', 'Dupla Chance', 'Escanteios', 'Cartões', 'Gols por Tempo']
      const sports = ['Futebol', 'Tênis', 'Basquete', 'Vôlei', 'Handebol', 'Futsal', 'Rugby', 'Hóquei']
      const data = []

      for (let i = 0; i < 150; i++) {
        const surebetId = `surebet_${i}`
        const cloneCount = Math.floor(Math.random() * 4) + 2 // 2 a 5 casas por surebet
        const selectedHouses = this.getRandomHouses(houses, cloneCount)
        const selectedMarket = markets[Math.floor(Math.random() * markets.length)]
        const selectedSport = sports[Math.floor(Math.random() * sports.length)]
        
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 90))
        let hour = Math.floor(Math.random() * 24)
        if (Math.random() < 0.6) hour = 14 + Math.floor(Math.random() * 9)
        
        const baseProfit = 8 + Math.random() * 60 // Lucro entre 8% e 68%

        for (let j = 0; j < cloneCount; j++) {
          data.push({
            surebet_id: surebetId,
            house: selectedHouses[j],
            market: selectedMarket,
            profit: parseFloat((baseProfit + (Math.random() - 0.5) * 8).toFixed(2)),
            date: baseDate.toISOString().split('T')[0],
            hour: hour,
            sport: selectedSport,
            period: Math.random() < 0.7 ? '90min' : '45min',
            minutes: Math.random() < 0.3 ? Math.floor(Math.random() * 90) : 0
          })
        }
      }
      return data
    },

    processAnalytics() {
      const filtered = this.filteredSurebets
      this.totalSurebets = new Set(filtered.map(s => s.surebet_id)).size
      this.uniqueHouses = new Set(filtered.map(s => s.house)).size
      this.uniqueMarkets = new Set(filtered.map(s => s.market)).size
      this.availableSports = [...new Set(this.surebets.map(s => s.sport))].sort()
      
      const surebetProfits = {}
      filtered.forEach(item => {
        if (!surebetProfits[item.surebet_id]) {
          surebetProfits[item.surebet_id] = item.profit
        }
      })
      
      const profits = Object.values(surebetProfits)
      this.averageProfit = profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) / profits.length : 0

      this.processHousesRanking(filtered)
      this.processHousePairsRanking(filtered)
      this.processMarketsRanking(filtered)
      this.processInsights(filtered)
      this.updateCharts()
      
      // Log das estatísticas das casas
      console.log(`📊 Estatísticas das Casas:`)
      console.log(`Total disponíveis: ${this.totalAvailableHouses}`)
      console.log(`Ativas no período: ${this.activeHousesCount}`)
      console.log(`Inativas no período: ${this.inactiveHousesCount}`)
      console.log(`Taxa de atividade: ${((this.activeHousesCount / this.totalAvailableHouses) * 100).toFixed(1)}%`)
      
      // Salvar análises no banco
      this.saveAnalyticsToDatabase(filtered)
    },

    processHousesRanking(data) {
      const houseStats = {}
      data.forEach(item => {
        if (!houseStats[item.house]) {
          houseStats[item.house] = { name: item.house, count: 0, profits: [] }
        }
        houseStats[item.house].count++
        houseStats[item.house].profits.push(item.profit)
      })
      
      this.topHouses = Object.values(houseStats).map(house => ({
        ...house,
        percentage: (house.count / data.length) * 100,
        averageProfit: house.profits.reduce((sum, p) => sum + p, 0) / house.profits.length,
        maxProfit: Math.max(...house.profits)
      })).sort((a, b) => b.count - a.count).slice(0, 15) // Mostrar top 15 casas
    },

    processHousePairsRanking(data) {
      const pairStats = {}
      const surebetGroups = {}
      
      data.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = []
        surebetGroups[item.surebet_id].push(item)
      })
      
      Object.values(surebetGroups).forEach(group => {
        const houses = [...new Set(group.map(item => item.house))].sort()
        if (houses.length >= 2) {
          for (let i = 0; i < houses.length; i++) {
            for (let j = i + 1; j < houses.length; j++) {
              const pairKey = `${houses[i]}|${houses[j]}`
              if (!pairStats[pairKey]) {
                pairStats[pairKey] = { id: pairKey, house1: houses[i], house2: houses[j], count: 0, profits: [] }
              }
              pairStats[pairKey].count++
              const groupProfit = group.reduce((sum, item) => sum + item.profit, 0) / group.length
              pairStats[pairKey].profits.push(groupProfit)
            }
          }
        }
      })
      
      const totalPairs = Object.values(pairStats).reduce((sum, pair) => sum + pair.count, 0)
      this.topHousePairs = Object.values(pairStats).map(pair => {
        const averageProfit = pair.profits.reduce((sum, p) => sum + p, 0) / pair.profits.length
        const profitVariation = this.calculateVariation(pair.profits)
        return {
          ...pair,
          percentage: (pair.count / totalPairs) * 100,
          averageProfit,
          consistency: 100 - profitVariation
        }
      }).sort((a, b) => b.count - a.count).slice(0, 10)
    },

    processMarketsRanking(data) {
      const marketStats = {}
      const surebetGroups = {}
      
      data.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
      })
      
      Object.values(surebetGroups).forEach(item => {
        if (!marketStats[item.market]) {
          marketStats[item.market] = { name: item.market, count: 0, profits: [] }
        }
        marketStats[item.market].count++
        marketStats[item.market].profits.push(item.profit)
      })
      
      this.topMarkets = Object.values(marketStats).map(market => {
        const averageProfit = market.profits.reduce((sum, p) => sum + p, 0) / market.profits.length
        const variability = this.calculateVariation(market.profits)
        const score = (market.count * 0.4) + (averageProfit * 0.4) + ((100 - variability) * 0.2)
        return { ...market, averageProfit, variability, score }
      }).sort((a, b) => b.score - a.score).slice(0, 10)
    },

    processInsights(data) {
      this.bestPair = this.topHousePairs.filter(pair => pair.count >= 3).sort((a, b) => b.averageProfit - a.averageProfit)[0] || null

      const hourStats = {}
      data.forEach(item => hourStats[item.hour] = (hourStats[item.hour] || 0) + 1)
      this.peakHour = Object.entries(hourStats).map(([hour, count]) => ({ hour: parseInt(hour), count })).sort((a, b) => b.count - a.count)[0] || null

      this.bestMarket = this.topMarkets[0] || null

      const sportStats = {}
      const surebetGroups = {}
      data.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
      })
      Object.values(surebetGroups).forEach(item => sportStats[item.sport] = (sportStats[item.sport] || 0) + 1)
      const totalSports = Object.values(sportStats).reduce((sum, count) => sum + count, 0)
      this.mostActiveSport = Object.entries(sportStats).map(([sport, count]) => ({ name: sport, count, percentage: (count / totalSports) * 100 })).sort((a, b) => b.count - a.count)[0] || null
    },

    setupCharts() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.setupHousesChart()
          this.setupMarketsChart()
          this.setupTimeChart()
          this.setupSportsChart()
        }, 500)
      })
    },

    setupHousesChart() {
      const ctx = this.$refs.housesChart
      if (!ctx) return
      if (this.housesChart) this.housesChart.destroy()
      
      const data = this.topHouses.slice(0, 12) // Mostrar top 12 casas no gráfico
      this.housesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(h => h.name),
          datasets: [{ 
            label: 'Aparições', 
            data: data.map(h => h.count), 
            backgroundColor: 'rgba(0, 255, 136, 0.8)',
            borderColor: 'rgba(0, 255, 136, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { color: '#ffffff' }, 
              grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            },
            x: { 
              ticks: { 
                color: '#ffffff',
                maxRotation: 45,
                minRotation: 0
              }, 
              grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            }
          }
        }
      })
    },

    setupMarketsChart() {
      const ctx = this.$refs.marketsChart
      if (!ctx) return
      if (this.marketsChart) this.marketsChart.destroy()
      
      const data = this.topMarkets.slice(0, 6)
      this.marketsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(m => m.name),
          datasets: [{ data: data.map(m => m.count), backgroundColor: ['#00ff88', '#ff6b35', '#f7931e', '#ffcd3c', '#ff4757', '#3742fa'] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#ffffff' } } }
        }
      })
    },

    setupTimeChart() {
      const ctx = this.$refs.timeChart
      if (!ctx) return
      if (this.timeChart) this.timeChart.destroy()
      
      const hourStats = {}
      this.filteredSurebets.forEach(item => hourStats[item.hour] = (hourStats[item.hour] || 0) + 1)
      const hours = Array.from({length: 24}, (_, i) => i)
      const counts = hours.map(hour => hourStats[hour] || 0)
      
      this.timeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: hours.map(h => `${h}:00`),
          datasets: [{ label: 'Atividade', data: counts, borderColor: '#00ff88', backgroundColor: 'rgba(0, 255, 136, 0.1)', tension: 0.4, fill: true }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
          }
        }
      })
    },

    setupSportsChart() {
      const ctx = this.$refs.sportsChart
      if (!ctx) return
      if (this.sportsChart) this.sportsChart.destroy()
      
      const sportStats = {}
      const surebetGroups = {}
      this.filteredSurebets.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
      })
      Object.values(surebetGroups).forEach(item => {
        if (!sportStats[item.sport]) sportStats[item.sport] = { profits: [] }
        sportStats[item.sport].profits.push(item.profit)
      })
      
      const sportsData = Object.entries(sportStats).map(([sport, data]) => ({
        sport,
        averageProfit: data.profits.reduce((sum, p) => sum + p, 0) / data.profits.length
      })).sort((a, b) => b.averageProfit - a.averageProfit)
      
      this.sportsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sportsData.map(s => s.sport),
          datasets: [{ label: 'Lucro Médio', data: sportsData.map(s => s.averageProfit), backgroundColor: 'rgba(255, 107, 53, 0.8)' }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { color: '#ffffff', callback: value => 'R$ ' + value.toFixed(0) }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
          }
        }
      })
    },

    updateCharts() {
      this.$nextTick(() => setTimeout(() => {
        if (this.housesChart) this.updateHousesChart()
        if (this.marketsChart) this.updateMarketsChart()
        if (this.timeChart) this.updateTimeChart()
        if (this.sportsChart) this.updateSportsChart()
      }, 100))
    },
    
    async saveDataToDatabase() {
      try {
        // Preparar dados para salvar no banco
        const statsToSave = this.surebets.map(item => ({
          surebet_id: item.surebet_id,
          house: item.house,
          market: item.market,
          match: item.match || 'Partida não especificada',
          profit: item.profit,
          date: item.date,
          hour: item.hour,
          sport: item.sport,
          period: item.period || null,
          minutes: item.minutes || null,
          anchorh1: item.anchorh1 || null,
          anchorh2: item.anchorh2 || null,
          chance: item.chance || null,
          metadata: {
            source: 'ranking_view',
            generated_at: new Date().toISOString()
          }
        }))
        
        // Salvar no banco
        const result = await this.$store.dispatch('saveSurebetStats', statsToSave)
        console.log('✅ Dados salvos no banco:', result)
        
      } catch (error) {
        console.error('❌ Erro ao salvar dados no banco:', error)
      }
    },
    
    async saveAnalyticsToDatabase(filteredData) {
      try {
        // Calcular estatísticas para salvar
        const totalSurebets = new Set(filteredData.map(s => s.surebet_id)).size
        const uniqueHouses = new Set(filteredData.map(s => s.house)).size
        const uniqueMarkets = new Set(filteredData.map(s => s.market)).size
        
        const surebetProfits = {}
        filteredData.forEach(item => {
          if (!surebetProfits[item.surebet_id]) {
            surebetProfits[item.surebet_id] = item.profit
          }
        })
        const profits = Object.values(surebetProfits)
        const averageProfit = profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) / profits.length : 0
        
        // Preparar dados de análise
        const analyticsData = {
          analysis_type: 'comprehensive',
          period_days: parseInt(this.selectedPeriod),
          sport_filter: this.selectedSport,
          analysis_data: {
            topHouses: this.topHouses,
            topHousePairs: this.topHousePairs,
            topMarkets: this.topMarkets,
            insights: {
              bestPair: this.bestPair,
              peakHour: this.peakHour,
              bestMarket: this.bestMarket,
              mostActiveSport: this.mostActiveSport
            }
          },
          total_surebets: totalSurebets,
          unique_houses: uniqueHouses,
          unique_markets: uniqueMarkets,
          average_profit: averageProfit
        }
        
        // Salvar análise no banco
        const result = await this.$store.dispatch('saveSurebetAnalytics', analyticsData)
        console.log('✅ Análise salva no banco:', result)
        
      } catch (error) {
        console.error('❌ Erro ao salvar análise no banco:', error)
      }
    },

    updateHousesChart() {
      const data = this.topHouses.slice(0, 12)
      this.housesChart.data.labels = data.map(h => h.name)
      this.housesChart.data.datasets[0].data = data.map(h => h.count)
      this.housesChart.update('none')
    },

    updateMarketsChart() {
      const data = this.topMarkets.slice(0, 6)
      this.marketsChart.data.labels = data.map(m => m.name)
      this.marketsChart.data.datasets[0].data = data.map(m => m.count)
      this.marketsChart.update('none')
    },

    updateTimeChart() {
      const hourStats = {}
      this.filteredSurebets.forEach(item => hourStats[item.hour] = (hourStats[item.hour] || 0) + 1)
      const hours = Array.from({length: 24}, (_, i) => i)
      const counts = hours.map(hour => hourStats[hour] || 0)
      this.timeChart.data.datasets[0].data = counts
      this.timeChart.update('none')
    },

    updateSportsChart() {
      const sportStats = {}
      const surebetGroups = {}
      this.filteredSurebets.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
      })
      Object.values(surebetGroups).forEach(item => {
        if (!sportStats[item.sport]) sportStats[item.sport] = { profits: [] }
        sportStats[item.sport].profits.push(item.profit)
      })
      const sportsData = Object.entries(sportStats).map(([sport, data]) => ({
        sport,
        averageProfit: data.profits.reduce((sum, p) => sum + p, 0) / data.profits.length
      })).sort((a, b) => b.averageProfit - a.averageProfit)
      
      this.sportsChart.data.labels = sportsData.map(s => s.sport)
      this.sportsChart.data.datasets[0].data = sportsData.map(s => s.averageProfit)
      this.sportsChart.update('none')
    },

    calculateVariation(values) {
      if (values.length <= 1) return 0
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      return mean > 0 ? (stdDev / mean) * 100 : 0
    },

    // Método auxiliar para selecionar casas aleatórias únicas
    getRandomHouses(houses, count) {
      const shuffled = [...houses].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },

    updateAnalysis() { this.processAnalytics() },
    forceRefresh() { 
      this.loadSurebetsData()
    },
    destroyCharts() {
      if (this.housesChart) this.housesChart.destroy()
      if (this.marketsChart) this.marketsChart.destroy()
      if (this.timeChart) this.timeChart.destroy()
      if (this.sportsChart) this.sportsChart.destroy()
    },

    formatCurrency(value) {
      if (!value || isNaN(value)) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    },
    formatPercentage(value) { return !value || isNaN(value) ? '0.0' : parseFloat(value).toFixed(1) },
    getPositionClass(position) {
      if (position === 1) return 'gold'
      if (position === 2) return 'silver'
      if (position === 3) return 'bronze'
      return 'normal'
    },
    getConsistencyClass(value) {
      if (!value || isNaN(value)) return 'low'
      if (value >= 80) return 'high'
      if (value >= 60) return 'medium'
      return 'low'
    }
  }
}
</script>

<style scoped>
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
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 200px;
  width: 100%;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

.main-content::-webkit-scrollbar { width: 8px; }
.main-content::-webkit-scrollbar-track { background: transparent; }
.main-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 4px; }
.scroll-spacer { height: 200px; flex-shrink: 0; }

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
  flex-wrap: wrap;
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
  min-width: 120px;
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
}

.stats-dashboard {
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
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover { transform: translateY(-4px); }

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  color: #cccccc;
  font-size: 14px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
}

.chart-section h3 {
  color: #ffffff;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.chart-container {
  height: 200px;
  position: relative;
}

.ranking-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.ranking-section h3 {
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
  font-size: 14px;
}

.ranking-table th {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-weight: 600;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.ranking-table td {
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.ranking-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.position-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
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

.house-name, .pair-names {
  display: flex;
  align-items: center;
  gap: 8px;
}

.house-logo {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 12px;
}

.house-tag {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #1a1a1a;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 10px;
  white-space: nowrap;
}

.pair-separator {
  color: #ffffff;
  font-weight: 700;
  font-size: 10px;
}

.consistency-score {
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 11px;
}

.consistency-score.high {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.consistency-score.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.consistency-score.low {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.positive { color: #00ff88; }
.negative { color: #ff4444; }
.neutral { color: #cccccc; }

.insights-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.insights-section h3 {
  color: #ffffff;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.inactive-houses-info {
  margin-top: 24px;
  padding: 20px;
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.inactive-houses-info h4 {
  color: #00ff88;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.inactive-houses-info p {
  color: #ffffff;
  margin: 8px 0;
  font-size: 14px;
}

.inactive-houses-info strong {
  color: #00ff88;
  font-weight: 600;
}

.insight-card {
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-icon {
  font-size: 20px;
}

.insight-header h4 {
  color: #00ff88;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.insight-content p {
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

.insight-detail {
  color: #cccccc;
  font-weight: 400;
  font-size: 12px;
}

.no-data {
  color: #888888;
  font-style: italic;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .main-content { margin-left: 0; }
  .charts-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
}

@media (max-width: 768px) {
  .main-content { padding: 16px; padding-bottom: 120px; }
  .filters-section { flex-direction: column; align-items: center; }
  .stats-dashboard { grid-template-columns: 1fr; }
  .charts-grid { grid-template-columns: 1fr; }
  .insights-grid { grid-template-columns: 1fr; }
  .ranking-table { font-size: 12px; }
  .ranking-table th, .ranking-table td { padding: 8px 4px; }
}
</style>
