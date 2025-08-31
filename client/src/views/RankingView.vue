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
        
        <!-- Indicador de status dos dados -->
        <div class="data-status-indicator" v-if="dataSource">
          <span class="status-icon" :class="dataSource === 'cache' ? 'cache' : 'api'">
            {{ dataSource === 'cache' ? '💾' : '🌐' }}
          </span>
          <span class="status-text">
            {{ dataSource === 'cache' ? 'Dados do cache' : 'Dados da API' }}
          </span>
          <span class="status-time" v-if="lastDataUpdate">
            • Atualizado: {{ formatDateTime(lastDataUpdate) }}
          </span>
        </div>
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
      </div>

      <!-- Status da busca automática - OCULTO -->
      <div class="auto-refresh-status" style="display: none;">
        <div class="status-indicator">
          <span class="status-dot" :class="{ active: autoRefreshInterval }"></span>
          <span class="status-text">
            {{ autoRefreshInterval ? '🔄 Busca automática ativa' : '⏹️ Busca automática pausada' }}
          </span>
        </div>
        <div class="update-info" v-if="lastDataUpdate">
          <span class="update-text">
            Última atualização: {{ formatDateTime(lastDataUpdate) }}
          </span>
          <span class="update-count" v-if="dataUpdateCount > 0">
            ({{ dataUpdateCount }} atualizações)
          </span>
        </div>
        <button 
          @click="toggleAutoRefresh" 
          class="toggle-auto-refresh-btn"
          :class="{ active: autoRefreshInterval }"
        >
          {{ autoRefreshInterval ? '⏸️ Pausar' : '▶️ Retomar' }}
        </button>
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
           <p class="chart-description">
             Distribuição das surebets pelas principais casas de apostas.
           </p>
                       <div class="chart-stats">
              <div class="stat-item">
                <span class="stat-label">🏢 Total de Casas:</span>
                <span class="stat-value">{{ getTotalHouses() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">⭐ Casa Mais Frequente:</span>
                <span class="stat-value">{{ getMostFrequentHouse() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🎯 Total de Surebets:</span>
                <span class="stat-value">{{ totalSurebets }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">📊 Média por Casa:</span>
                <span class="stat-value">{{ getAverageSurebetsPerHouse() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">💰 Casa Mais Lucrativa:</span>
                <span class="stat-value">{{ getHouseWithHighestProfit() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">📉 Casa Menos Lucrativa:</span>
                <span class="stat-value">{{ getHouseWithLowestProfit() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">💵 Lucro Total:</span>
                <span class="stat-value">{{ formatCurrency(getTotalProfit()) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">📈 Faixa de Lucro:</span>
                <span class="stat-value">{{ getProfitRange() }}</span>
              </div>
            </div>
           <div class="chart-container">
             <canvas ref="housesChart"></canvas>
           </div>
         </div>
                 <div class="chart-section">
           <h3>📈 Análise de Lucro vs Frequência</h3>
           <p class="chart-description">
             Relação entre frequência de aparições e lucro médio por mercado. 
             <span class="legend-item"><span class="legend-color green"></span> Top 33% lucro</span>
             <span class="legend-item"><span class="legend-color yellow"></span> Médio 33% lucro</span>
             <span class="legend-item"><span class="legend-color orange"></span> Bottom 33% lucro</span>
             <br><small>💡 Tamanho dos pontos = frequência de aparições | 🔍 Use scroll para zoom | 🖱️ Arraste para navegar</small>
           </p>
           
           <!-- Estatísticas adicionais do gráfico -->
           <div class="chart-stats" v-if="filteredSurebets.length > 0">
             <div class="stat-item">
               <span class="stat-label">Total de Mercados:</span>
               <span class="stat-value">{{ uniqueMarkets }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">Mercado Mais Frequente:</span>
               <span class="stat-value">{{ getMostFrequentMarket() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">Lucro Máximo:</span>
               <span class="stat-value">{{ formatCurrency(getMaxProfit()) }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">Lucro Mínimo:</span>
               <span class="stat-value">{{ formatCurrency(getMinProfit()) }}</span>
             </div>
           </div>
          <div class="chart-container">
            <canvas ref="profitFrequencyChart"></canvas>
          </div>
        </div>
                 <div class="chart-section">
           <h3>⏰ Atividade por Hora</h3>
           <p class="chart-description">
             Padrão de atividade das surebets ao longo do dia.
           </p>
           <div class="chart-stats">
             <div class="stat-item">
               <span class="stat-label">🎯 Total de Surebets:</span>
               <span class="stat-value">{{ totalSurebets }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">🔥 Hora de Pico:</span>
               <span class="stat-value">{{ getPeakHour() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">⚡ Hora Mais Ativa:</span>
               <span class="stat-value">{{ getMostActiveHour() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">😴 Hora Menos Ativa:</span>
               <span class="stat-value">{{ getLeastActiveHour() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">💰 Lucro Médio por Hora:</span>
               <span class="stat-value">{{ formatCurrency(getAverageProfitPerHour()) }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">🌅 Período Ativo:</span>
               <span class="stat-value">{{ getActivePeriod() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">🌙 Período Inativo:</span>
               <span class="stat-value">{{ getInactivePeriod() }}</span>
             </div>
           </div>
           <div class="chart-container">
             <canvas ref="timeChart"></canvas>
           </div>
         </div>
                 <div class="chart-section">
           <h3>⚽ Esportes</h3>
           <p class="chart-description">
             Lucro médio por esporte nas surebets analisadas.
           </p>
           <div class="chart-stats">
             <div class="stat-item">
               <span class="stat-label">⚽ Total de Esportes:</span>
               <span class="stat-value">{{ getTotalSports() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">💎 Esporte Mais Lucrativo:</span>
               <span class="stat-value">{{ getMostProfitableSport() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">📉 Esporte Menos Lucrativo:</span>
               <span class="stat-value">{{ getLeastProfitableSport() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">💰 Lucro Médio Geral:</span>
               <span class="stat-value">{{ formatCurrency(getAverageProfitPerSport()) }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">🔥 Esporte Mais Ativo:</span>
               <span class="stat-value">{{ getMostActiveSport() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">😴 Esporte Menos Ativo:</span>
               <span class="stat-value">{{ getLeastActiveSport() }}</span>
             </div>
             <div class="stat-item">
               <span class="stat-label">🌈 Diversidade Esportiva:</span>
               <span class="stat-value">{{ getSportDiversity() }}</span>
             </div>
           </div>
           <div class="chart-container">
             <canvas ref="sportsChart"></canvas>
           </div>
         </div>
      </div>

      <!-- 📈 Análise de Mercados Redesenhada -->
      <div class="markets-analysis-section">
        <div class="section-header">
          <h3>📈 Análise de Mercados</h3>
          <p>Performance detalhada por tipo de mercado</p>
        </div>
        
        <!-- Resumo Estatístico -->
        <div class="markets-summary">
          <div class="summary-card">
            <div class="summary-icon">🎯</div>
            <div class="summary-content">
              <span class="summary-value">{{ uniqueMarkets }}</span>
              <span class="summary-label">Tipos de Mercado</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">📊</div>
            <div class="summary-content">
              <span class="summary-value">{{ Object.keys(groupedMarkets).length }}</span>
              <span class="summary-label">Categorias</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">🏆</div>
            <div class="summary-content">
              <span class="summary-value">{{ getDominantMarket() }}</span>
              <span class="summary-label">Mercado Dominante</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">💰</div>
            <div class="summary-content">
              <span class="summary-value">{{ formatCurrency(getAverageMarketProfit()) }}</span>
              <span class="summary-label">Lucro Médio</span>
            </div>
          </div>
        </div>

        <!-- Layout Principal -->
        <div class="markets-main-layout">
          <!-- Gráfico Compacto -->
          <div class="markets-chart-section">
            <div class="chart-header">
              <h4>📊 Distribuição por Categoria</h4>
              <div class="chart-controls">
                <button 
                  @click="toggleMarketsChartViewMode" 
                  class="control-btn"
                  :class="{ active: marketsChartViewMode === 'percentage' }"
                  title="Alternar entre percentual e contagem"
                >
                  {{ marketsChartViewMode === 'percentage' ? '%' : '#' }}
                </button>
                <button 
                  @click="toggleMarketsChartDetails" 
                  class="control-btn"
                  :class="{ active: marketsChartShowDetails }"
                  title="Mostrar detalhes por subcategoria"
                >
                  {{ marketsChartShowDetails ? '📋' : '📊' }}
                </button>
              </div>
            </div>
            
            <div class="chart-container-compact">
              <canvas ref="marketsChart"></canvas>
            </div>
            
            <div class="chart-filters" v-if="!marketsChartShowDetails">
              <div class="filter-group">
                <label>Filtro Mínimo:</label>
                <select v-model="marketsChartFilters.minCount" @change="updateMarketsChartFilters" class="filter-select">
                  <option value="1">1 aparição</option>
                  <option value="2">2 aparições</option>
                  <option value="3">3 aparições</option>
                  <option value="5">5 aparições</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Ranking Compacto -->
          <div class="markets-ranking-compact">
            <div class="ranking-header">
              <h4>🏆 Top Mercados</h4>
              <div class="ranking-filters">
                <select v-model="selectedMarketGroup" class="filter-select" @change="filterMarketsTable">
                  <option value="">Todas as categorias</option>
                  <option v-for="(group, key) in groupedMarkets" :key="key" :value="group.name">
                    {{ group.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="ranking-list">
              <div 
                v-for="(market, index) in filteredTopMarkets.slice(0, 8)" 
                :key="market.name" 
                class="ranking-item"
                :class="{ 
                  'highlighted': selectedMarketGroup && market.categoryName === selectedMarketGroup,
                  'category-filtered': selectedMarketGroup && market.categoryName !== selectedMarketGroup
                }"
                @click="selectMarket(market)"
              >
                <div class="ranking-position">{{ index + 1 }}</div>
                <div class="ranking-content">
                  <div class="market-name">{{ market.name || 'N/A' }}</div>
                  <div class="market-category">
                    <span 
                      class="category-badge" 
                      :style="{ backgroundColor: getGroupColor(market.categoryName) }"
                    >
                      {{ market.categoryName }}
                    </span>
                  </div>
                </div>
                <div class="ranking-stats">
                  <div class="stat-count">{{ market.count }}x</div>
                  <div class="stat-profit">{{ formatCurrency(market.averageProfit) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela Detalhada (Expandível) -->
        <div class="markets-detail-section" v-if="showDetailedTable">
          <div class="detail-header">
            <h4>📋 Detalhamento Completo</h4>
            <button @click="showDetailedTable = false" class="close-btn">✕</button>
          </div>
          <div class="detail-table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Mercado</th>
                  <th>Categoria</th>
                  <th>Count</th>
                  <th>Lucro Médio</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(market, index) in filteredTopMarkets" 
                  :key="market.name" 
                  class="detail-row"
                  :class="{ 
                    'highlighted': selectedMarketGroup && market.categoryName === selectedMarketGroup,
                    'category-filtered': selectedMarketGroup && market.categoryName !== selectedMarketGroup
                  }"
                >
                  <td class="position">{{ index + 1 }}</td>
                  <td class="market-name-cell">
                    <div class="market-name-wrapper">
                      <span class="market-icon">🎯</span>
                      <span class="market-name-text">{{ market.name || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="category-cell">
                    <span 
                      class="category-badge-compact" 
                      :style="{ backgroundColor: getGroupColor(market.categoryName) }"
                    >
                      {{ market.categoryName }}
                    </span>
                  </td>
                  <td class="count">{{ market.count }}</td>
                  <td class="profit">{{ formatCurrency(market.averageProfit) }}</td>
                  <td class="score">{{ (market.score || 0).toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Botão para expandir tabela -->
        <div class="expand-section" v-if="!showDetailedTable">
          <button @click="showDetailedTable = true" class="expand-btn">
            📋 Ver Tabela Completa
          </button>
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
                   <span class="house-logo">{{ house.name ? house.name.charAt(0) : '?' }}</span>
                   {{ house.name || 'Nome não informado' }}
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
import { 
  groupMarketsByCategory, 
  filterMarketsByRelevance, 
  createChartData,
  categorizeMarket 
} from '../config/marketGroups.js'
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
        profitFrequencyChart: null,
        isLoading: false,
        availableSports: [],
        // Novas propriedades para busca contínua
        autoRefreshInterval: null,
        lastDataUpdate: null,
        dataUpdateCount: 0,
        dataSource: null, // 'cache' ou 'api'
        
        // Propriedades para o gráfico de mercados melhorado
        groupedMarkets: {},
        marketsChartViewMode: 'percentage', // 'percentage' ou 'count'
        marketsChartShowDetails: false,
        selectedMarketGroup: null,
        marketsChartFilters: {
          minCount: 2,
          minPercentage: 1
        },
        showDetailedTable: false
    }
  },
  
  computed: {
    ...mapGetters(['isAdmin', 'isAuthenticated', 'currentUser']),
    
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
    },

    // Mercados filtrados por categoria
    filteredTopMarkets() {
      if (!this.selectedMarketGroup) {
        return this.topMarkets
      }
      return this.topMarkets.filter(market => market.categoryName === this.selectedMarketGroup)
    }
  },
  
  async mounted() {
    await this.loadSurebetsData()
    this.$nextTick(() => {
      setTimeout(() => {
        this.setupCharts()
      }, 1000)
    })
    
    // Iniciar busca automática de novos dados
    this.startAutoRefresh()
  },
  
  beforeUnmount() {
    this.destroyCharts()
    this.stopAutoRefresh()
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
        
        // Buscar dados da API externa
        const apiData = await this.fetchFromExternalAPI()
        
        if (apiData && apiData.length > 0) {
          console.log(`✅ Carregados ${apiData.length} registros da API externa`)
          this.surebets = apiData
          
          // Salvar dados no banco local para cache (com tratamento de erro)
          try {
            await this.saveDataToDatabase()
          } catch (saveError) {
            console.warn('⚠️ Erro ao salvar dados no banco (não crítico):', saveError)
            // Continuar mesmo se falhar ao salvar
          }
        } else {
          console.log('📊 Nenhum dado encontrado na API externa, tentando carregar do banco local')
          
          // Tentar carregar dados do banco local
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
              console.log('📊 Nenhum dado encontrado, usando dados de exemplo')
              this.surebets = this.generateSampleData()
            }
          } catch (dbError) {
            console.warn('⚠️ Erro ao carregar do banco, usando dados de exemplo:', dbError)
            this.surebets = this.generateSampleData()
          }
        }
        
        this.processAnalytics()
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error)
        // Fallback para dados de exemplo
        this.surebets = this.generateSampleData()
        this.processAnalytics()
      } finally {
        this.isLoading = false
      }
    },

    async fetchFromExternalAPI() {
      try {
        console.log('🌐 Buscando dados da API externa...')
        
        // Buscar dados da API externa via servidor
        const response = await fetch('/api/surebets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
        }
        
        const apiData = await response.json()
        console.log('📡 Dados recebidos da API externa:', apiData)
        
        // Verificar se os dados têm a estrutura esperada
        if (!apiData || typeof apiData !== 'object') {
          throw new Error('Estrutura de dados inválida da API')
        }
        
        // Processar dados da API externa
        const processedData = this.processExternalAPIData(apiData)
        console.log('✅ Dados processados:', processedData.length, 'registros únicos')
        
        return processedData
        
      } catch (error) {
        console.error('❌ Erro ao buscar da API externa:', error)
        throw error
      }
    },

    processExternalAPIData(apiData) {
      const processedData = []
      const processedIds = new Set()
      
      // Iterar sobre cada surebet_id na resposta da API
      Object.entries(apiData).forEach(([surebetId, surebetParts]) => {
        // Verificar se já processamos este surebet_id
        if (processedIds.has(surebetId)) {
          console.log(`⚠️ Surebet ID duplicado ignorado: ${surebetId}`)
          return
        }
        
        // Marcar como processado
        processedIds.add(surebetId)
        
        // Processar cada parte do surebet
        if (Array.isArray(surebetParts)) {
          surebetParts.forEach((part, index) => {
            try {
              // Extrair informações da parte
              const {
                house,
                profit,
                roi,
                timestamp,
                sport,
                event,
                market,
                selection1,
                selection2,
                selection3,
                odds1,
                odds2,
                odds3,
                stake = 100,
                status = 'active'
              } = part
              
              // Criar data e hora a partir do timestamp
              const dateObj = timestamp ? new Date(timestamp) : new Date()
              const date = dateObj.toISOString().split('T')[0]
              const hour = dateObj.getHours()
              
              // Determinar se é Live ou Pre Live baseado na URL e campo minutes
              let isLive = false
              let minutes = part.minutes || 0
              
              // Extrair o parâmetro is_live da URL (anchorh1 ou anchorh2)
              const anchorUrl = part.anchorh1 || part.anchorh2 || ''
              
              let isLiveParam = null
              
              // Tentar extrair is_live da URL
              if (anchorUrl && anchorUrl.includes('is_live=')) {
                const match = anchorUrl.match(/is_live=([01])/)
                if (match) {
                  isLiveParam = match[1]
                }
              }
              
              // Determinar status baseado no parâmetro oficial is_live
              if (isLiveParam === '1') {
                isLive = true
                // Manter os minutos originais da API
              } else if (isLiveParam === '0') {
                isLive = false
                // Manter os minutos originais da API (pode ter minutos mesmo sendo pre-match)
              } else {
                // Fallback: usar campo minutes se não conseguir extrair is_live
                if (minutes && minutes > 0) {
                  isLive = true
                } else {
                  isLive = false
                }
              }
              
              // Criar objeto surebet processado
              const processedSurebet = {
                surebet_id: surebetId,
                house: house || 'Casa não especificada',
                market: market || 'Mercado não especificado',
                match: event || 'Evento não especificado',
                profit: parseFloat(profit) || 0,
                date: date,
                hour: hour,
                sport: sport || 'Futebol',
                period: part.period || null,
                minutes: minutes,
                anchorh1: null,
                anchorh2: null,
                chance: parseFloat(roi) || null,
                isLive: isLive,
                metadata: {
                  source: 'external_api',
                  timestamp: timestamp,
                  selection1: selection1 || null,
                  selection2: selection2 || null,
                  selection3: selection3 || null,
                  odds1: parseFloat(odds1) || null,
                  odds2: parseFloat(odds2) || null,
                  odds3: parseFloat(odds3) || null,
                  stake: parseFloat(stake) || 100,
                  status: status || 'active',
                  processed_at: new Date().toISOString()
                }
              }
              
              processedData.push(processedSurebet)
              
            } catch (partError) {
              console.error(`Erro ao processar parte ${index + 1} do surebet ${surebetId}:`, partError)
            }
          })
        } else {
          console.warn(`Formato inválido para surebet ${surebetId}:`, surebetParts)
        }
      })
      
      console.log(`🎯 Processados ${processedData.length} registros únicos de ${processedIds.size} IDs únicos`)
      return processedData
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
      
      // Verificar se data é válido
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ Dados de mercados inválidos ou vazios')
        this.topMarkets = []
        this.groupedMarkets = {}
        return
      }
      
      data.forEach(item => {
        if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
      })
      
      Object.values(surebetGroups).forEach(item => {
        // Verificar se item.market existe
        const marketName = item.market || 'Mercado Desconhecido'
        if (!marketStats[marketName]) {
          marketStats[marketName] = { name: marketName, count: 0, profits: [], totalProfit: 0 }
        }
        marketStats[marketName].count++
        marketStats[marketName].profits.push(item.profit || 0)
        marketStats[marketName].totalProfit += item.profit || 0
      })
      
      // Verificar se há dados de mercados
      const marketsArray = Object.values(marketStats)
      if (marketsArray.length === 0) {
        console.warn('⚠️ Nenhum mercado encontrado nos dados')
        this.topMarkets = []
        this.groupedMarkets = {}
        return
      }
      
      // Filtrar mercados por relevância
      const relevantMarkets = filterMarketsByRelevance(
        marketsArray, 
        this.marketsChartFilters.minCount, 
        this.marketsChartFilters.minPercentage
      )
      
      // Agrupar mercados por categoria
      this.groupedMarkets = groupMarketsByCategory(relevantMarkets)
      
      const totalMarkets = marketsArray.reduce((sum, market) => sum + (market.count || 0), 0)
      
      this.topMarkets = Object.values(marketStats).map(market => {
        // Verificar se market.profits existe e é um array válido
        const profits = Array.isArray(market.profits) ? market.profits : []
        const averageProfit = profits.length > 0 ? profits.reduce((sum, p) => sum + (p || 0), 0) / profits.length : 0
        const maxProfit = profits.length > 0 ? Math.max(...profits) : 0
        const variability = this.calculateVariation(profits)
        const consistency = 100 - variability
        const percentage = totalMarkets > 0 ? (market.count / totalMarkets) * 100 : 0
        const score = (market.count * 0.3) + (averageProfit * 0.4) + (consistency * 0.3)
        
        // Adicionar informações de categoria
        const category = categorizeMarket(market.name)
        
        return { 
          ...market, 
          averageProfit, 
          maxProfit,
          variability, 
          consistency,
          percentage,
          score,
          category: category.group,
          categoryName: category.groupName,
          subcategory: category.subcategory?.name || 'Diversos'
        }
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
        this.setupProfitFrequencyChart()
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
      
      // Criar dados do gráfico usando o novo sistema de agrupamento
      const { chartData, colors, labels } = createChartData(
        this.groupedMarkets, 
        this.marketsChartShowDetails, 
        this.marketsChartViewMode
      )
      
      this.marketsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ 
            data: chartData, 
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.8', '1')),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'bottom', 
              labels: { 
                color: '#ffffff',
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              },
              onClick: (event, legendItem, legend) => {
                // Implementar filtro por categoria
                this.toggleMarketCategoryFilter(legendItem.text)
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 2,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  const label = context.label || ''
                  const value = context.parsed
                  const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
                  const percentage = ((value / total) * 100).toFixed(1)
                  
                  if (this.marketsChartViewMode === 'percentage') {
                    return `${label}: ${value.toFixed(1)}%`
                  } else {
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index
              const label = labels[index]
              this.handleMarketChartClick(label, index)
            }
          }
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

    setupProfitFrequencyChart() {
      const ctx = this.$refs.profitFrequencyChart
      if (!ctx) return
      if (this.profitFrequencyChart) this.profitFrequencyChart.destroy()
      
      // Agrupar dados por mercado para calcular frequência e lucro médio
      const marketStats = {}
      this.filteredSurebets.forEach(item => {
        if (!marketStats[item.market]) {
          marketStats[item.market] = { count: 0, profits: [], totalProfit: 0 }
        }
        marketStats[item.market].count++
        marketStats[item.market].profits.push(item.profit)
        marketStats[item.market].totalProfit += item.profit
      })
      
      // Filtrar mercados com pelo menos 2 aparições para evitar ruído
      const filteredMarkets = Object.entries(marketStats).filter(([market, stats]) => stats.count >= 2)
      
      if (filteredMarkets.length === 0) {
        console.warn('⚠️ Nenhum mercado com dados suficientes para o gráfico')
        return
      }
      
      // Preparar dados para o gráfico de dispersão
      const chartData = filteredMarkets.map(([market, stats]) => ({
        x: stats.count, // Frequência (eixo X)
        y: stats.totalProfit / stats.count, // Lucro médio (eixo Y)
        market: market,
        count: stats.count,
        totalProfit: stats.totalProfit,
        averageProfit: stats.totalProfit / stats.count
      }))
      
      // Calcular estatísticas para melhor distribuição visual
      const frequencies = chartData.map(item => item.x)
      const profits = chartData.map(item => item.y)
      
      const freqStats = this.calculateStats(frequencies)
      const profitStats = this.calculateStats(profits)
      
      // Calcular percentis para melhor distribuição de cores
      const sortedProfits = profits.sort((a, b) => a - b)
      const p33 = sortedProfits[Math.floor(sortedProfits.length * 0.33)]
      const p66 = sortedProfits[Math.floor(sortedProfits.length * 0.66)]
      
      // Definir cores baseadas em percentis para melhor distribuição
      const colors = chartData.map(item => {
        if (item.y >= p66) return 'rgba(0, 255, 136, 0.9)' // Verde para top 33%
        if (item.y >= p33) return 'rgba(255, 193, 7, 0.9)' // Amarelo para médio 33%
        return 'rgba(255, 107, 53, 0.9)' // Laranja para bottom 33%
      })
      
      // Calcular tamanhos dos pontos baseados na frequência (logarítmico para melhor distribuição)
      const maxCount = Math.max(...frequencies)
      const pointSizes = chartData.map(item => {
        // Usar escala logarítmica para melhor distribuição visual
        const logSize = Math.log(item.x + 1) / Math.log(maxCount + 1)
        const normalizedSize = logSize * 0.8 + 0.2 // Entre 0.2 e 0.1
        return Math.max(4, Math.min(10, normalizedSize * 12.5)) // Entre 4 e 10 pixels (50% menor)
      })
      
      this.profitFrequencyChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Mercados',
            data: chartData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.9', '1')),
            borderWidth: 2,
            pointRadius: pointSizes,
            pointHoverRadius: pointSizes.map(size => size + 6)
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 2,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const data = context.raw
                  return [
                    `Mercado: ${data.market}`,
                    `Frequência: ${data.count} aparições`,
                    `Lucro Médio: R$ ${data.averageProfit.toFixed(2)}`,
                    `Lucro Total: R$ ${data.totalProfit.toFixed(2)}`
                  ]
                }
              }
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy'
              },
              zoom: {
                wheel: {
                  enabled: true
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy'
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Frequência de Aparições',
                color: '#ffffff',
                font: { size: 14, weight: '600' }
              },
              ticks: { 
                color: '#ffffff',
                font: { size: 12 },
                callback: function(value) {
                  // Formatação inteligente dos ticks
                  if (value >= 1000) return (value / 1000).toFixed(1) + 'k'
                  if (value >= 100) return (value / 100).toFixed(1) + 'h'
                  return value
                }
              },
              grid: { 
                color: 'rgba(255, 255, 255, 0.15)',
                drawBorder: false
              },
              // Escala inteligente baseada nos dados
              min: Math.max(0, freqStats.q1 - (freqStats.q3 - freqStats.q1) * 0.5),
              max: freqStats.q3 + (freqStats.q3 - freqStats.q1) * 1.5
            },
            y: {
              title: {
                display: true,
                text: 'Lucro Médio (R$)',
                color: '#ffffff',
                font: { size: 14, weight: '600' }
              },
              ticks: { 
                color: '#ffffff',
                font: { size: 12 },
                callback: value => 'R$ ' + value.toFixed(0)
              },
              grid: { 
                color: 'rgba(255, 255, 255, 0.15)',
                drawBorder: false
              },
              // Escala inteligente baseada nos dados
              min: Math.max(0, profitStats.q1 - (profitStats.q3 - profitStats.q1) * 0.5),
              max: profitStats.q3 + (profitStats.q3 - profitStats.q1) * 1.5
            }
          },
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          // Adicionar área de seleção para zoom
          onHover: (event, elements) => {
            const canvas = event.native.target
            canvas.style.cursor = elements.length ? 'pointer' : 'default'
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
        if (this.profitFrequencyChart) this.updateProfitFrequencyChart()
      }, 100))
    },
    
    async saveDataToDatabase() {
      try {
        if (!this.surebets || this.surebets.length === 0) {
          console.log('📊 Nenhum dado para salvar')
          return
        }
        
        if (!this.currentUser?.id) {
          console.error('❌ Usuário não autenticado ou ID não encontrado')
          throw new Error('Usuário não autenticado')
        }
        
        console.log(`💾 Salvando ${this.surebets.length} registros no banco para usuário ${this.currentUser.id}...`)
        
        // Verificar se o token de autenticação existe
        if (!this.$store.state.authToken) {
          console.error('❌ Token de autenticação não encontrado')
          throw new Error('Token de autenticação não encontrado')
        }
        
        // Salvar registros individualmente (mais seguro)
        let savedCount = 0
        const maxRecords = Math.min(this.surebets.length, 50) // Limitar a 50 registros
        
        for (let i = 0; i < maxRecords; i++) {
          try {
            const item = this.surebets[i]
            
            // Verificar se o item tem dados válidos
            if (!item.surebet_id || !item.house || !item.market) {
              console.warn(`⚠️ Item ${i} com dados inválidos, pulando...`)
              continue
            }
            
            await this.saveIndividualRecord(item)
            savedCount++
            
            // Pequena pausa para não sobrecarregar o servidor
            if (i % 10 === 0 && i > 0) {
              await new Promise(resolve => setTimeout(resolve, 100))
            }
            
          } catch (itemError) {
            console.error(`❌ Erro ao salvar item ${i}:`, itemError)
            // Continuar com o próximo item
          }
        }
        
        console.log(`✅ ${savedCount} registros salvos com sucesso`)
        
        // Salvar análise também
        if (this.filteredSurebets && this.filteredSurebets.length > 0) {
          await this.saveAnalyticsToDatabase(this.filteredSurebets)
        }
        
      } catch (error) {
        console.error('❌ Erro ao salvar dados no banco:', error)
        throw error
      }
    },
    
    async saveIndividualRecord(item) {
      try {
        // Verificações de segurança
        if (!this.currentUser?.id) {
          console.error('❌ Usuário não autenticado ou ID não encontrado')
          throw new Error('Usuário não autenticado')
        }
        
        if (!this.$store.state.authToken) {
          console.error('❌ Token de autenticação não encontrado')
          throw new Error('Token de autenticação não encontrado')
        }
        
        // Validar dados obrigatórios com fallbacks inteligentes
        const missingFields = []
        if (!item.surebet_id && !item.id) missingFields.push('surebet_id')
        if (!item.house && !item.house_name) missingFields.push('house')
        if (!item.market && !item.market_name) missingFields.push('market')
        
        if (missingFields.length > 0) {
          console.warn(`⚠️ Item ${item.surebet_id || item.id || 'sem ID'} com campos ausentes:`, missingFields)
          console.warn('📋 Dados do item:', item)
          
          // Em vez de falhar, vamos usar valores padrão
          console.log('🔄 Aplicando valores padrão para campos ausentes...')
        }
        
        // Preparar dados com validação robusta e fallbacks
        const recordData = {
          user_id: this.currentUser.id,
          surebet_id: item.surebet_id || item.id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          house: item.house || item.house_name || item.bookmaker || 'Casa não especificada',
          market: item.market || item.market_name || item.bet_type || 'Mercado não especificado',
          match: item.match || item.match_name || item.game || item.event || 'Partida não especificada',
          profit: typeof item.profit === 'number' ? item.profit : parseFloat(item.profit) || parseFloat(item.return) || 0,
          date: item.date || item.match_date || item.event_date || new Date().toISOString().split('T')[0],
          hour: typeof item.hour === 'number' ? item.hour : parseInt(item.hour) || parseInt(item.time) || 0,
          sport: item.sport || item.sport_name || item.category || 'Esporte não especificado',
          period: item.period || item.time_period || item.period_name || null,
          minutes: item.minutes || item.match_minutes || item.duration || null,
          anchorh1: item.anchorh1 || item.anchor_h1 || item.anchor1 || null,
          anchorh2: item.anchorh2 || item.anchor_h2 || item.anchor2 || null,
          chance: item.chance || item.odds || item.probability || null,
          metadata: {
            source: 'ranking_view',
            generated_at: new Date().toISOString(),
            original_data: item,
            has_fallbacks: missingFields.length > 0,
            missing_fields: missingFields,
            ...(item.metadata || {})
          }
        }
        
        const response = await fetch('/api/surebet-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.authToken}`
          },
          body: JSON.stringify(recordData)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
        }
        
        const result = await response.json()
        const recordId = recordData.surebet_id
        const hasFallbacks = missingFields.length > 0
        
        if (hasFallbacks) {
          console.log(`✅ Registro ${recordId} salvo com sucesso (com fallbacks para: ${missingFields.join(', ')})`)
        } else {
          console.log(`✅ Registro ${recordId} salvo com sucesso`)
        }
        
        return result
        
      } catch (error) {
        console.error(`❌ Erro ao salvar registro ${item.surebet_id}:`, error)
        throw error
      }
    },
    
    async saveAnalyticsToDatabase(filteredData) {
      try {
        // Verificar se há dados para analisar
        if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
          console.log('📊 Nenhum dado para análise')
          return
        }
        
        // Verificar se o usuário está autenticado
        if (!this.currentUser?.id) {
          console.error('❌ Usuário não autenticado para salvar análise')
          return
        }
        
        // Calcular estatísticas para salvar com validação
        const validData = filteredData.filter(item => item && item.surebet_id)
        const totalSurebets = new Set(validData.map(s => s.surebet_id)).size
        const uniqueHouses = new Set(validData.map(s => s.house || 'Desconhecida')).size
        const uniqueMarkets = new Set(validData.map(s => s.market || 'Desconhecido')).size
        
        const surebetProfits = {}
        validData.forEach(item => {
          if (!surebetProfits[item.surebet_id]) {
            surebetProfits[item.surebet_id] = parseFloat(item.profit) || 0
          }
        })
        const profits = Object.values(surebetProfits)
        const averageProfit = profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) / profits.length : 0
        
        // Preparar dados de análise com validação
        const analyticsData = {
          user_id: this.currentUser.id,
          analysis_type: 'comprehensive',
          period_days: parseInt(this.selectedPeriod) || 30,
          sport_filter: this.selectedSport || 'all',
          analysis_data: {
            topHouses: this.topHouses || [],
            topHousePairs: this.topHousePairs || [],
            topMarkets: this.topMarkets || [],
            insights: {
              bestPair: this.bestPair || null,
              peakHour: this.peakHour || null,
              bestMarket: this.bestMarket || null,
              mostActiveSport: this.mostActiveSport || null
            }
          },
          total_surebets: totalSurebets,
          unique_houses: uniqueHouses,
          unique_markets: uniqueMarkets,
          average_profit: averageProfit,
          generated_at: new Date().toISOString()
        }
        
        // Salvar análise no banco
        const result = await this.$store.dispatch('saveSurebetAnalytics', analyticsData)
        console.log('✅ Análise salva no banco:', result)
        
      } catch (error) {
        console.error('❌ Erro ao salvar análise no banco:', error)
        // Não re-throw para não interromper o fluxo principal
      }
    },

    updateHousesChart() {
      const data = this.topHouses.slice(0, 12)
      this.housesChart.data.labels = data.map(h => h.name)
      this.housesChart.data.datasets[0].data = data.map(h => h.count)
      this.housesChart.update('none')
    },

    updateMarketsChart() {
      if (!this.marketsChart) return
      
      const { chartData, colors, labels } = createChartData(
        this.groupedMarkets, 
        this.marketsChartShowDetails, 
        this.marketsChartViewMode
      )
      
      this.marketsChart.data.labels = labels
      this.marketsChart.data.datasets[0].data = chartData
      this.marketsChart.data.datasets[0].backgroundColor = colors
      this.marketsChart.data.datasets[0].borderColor = colors.map(color => color.replace('0.8', '1'))
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

    updateProfitFrequencyChart() {
      if (!this.profitFrequencyChart) return
      
      // Recalcular dados para o gráfico
      const marketStats = {}
      this.filteredSurebets.forEach(item => {
        if (!marketStats[item.market]) {
          marketStats[item.market] = { count: 0, profits: [], totalProfit: 0 }
        }
        marketStats[item.market].count++
        marketStats[item.market].profits.push(item.profit)
        marketStats[item.market].totalProfit += item.profit
      })
      
      // Filtrar mercados com pelo menos 2 aparições para evitar ruído
      const filteredMarkets = Object.entries(marketStats).filter(([market, stats]) => stats.count >= 2)
      
      const chartData = filteredMarkets.map(([market, stats]) => ({
        x: stats.count,
        y: stats.totalProfit / stats.count,
        market: market,
        count: stats.count,
        totalProfit: stats.totalProfit,
        averageProfit: stats.totalProfit / stats.count
      }))
      
      // Calcular estatísticas para melhor distribuição visual
      const frequencies = chartData.map(item => item.x)
      const profits = chartData.map(item => item.y)
      
      const freqStats = this.calculateStats(frequencies)
      const profitStats = this.calculateStats(profits)
      
      // Calcular percentis para melhor distribuição de cores
      const sortedProfits = profits.sort((a, b) => a - b)
      const p33 = sortedProfits[Math.floor(sortedProfits.length * 0.33)]
      const p66 = sortedProfits[Math.floor(sortedProfits.length * 0.66)]
      
      // Atualizar cores baseadas em percentis para melhor distribuição
      const colors = chartData.map(item => {
        if (item.y >= p66) return 'rgba(0, 255, 136, 0.9)' // Verde para top 33%
        if (item.y >= p33) return 'rgba(255, 193, 7, 0.9)' // Amarelo para médio 33%
        return 'rgba(255, 107, 53, 0.9)' // Laranja para bottom 33%
      })
      
      // Calcular tamanhos dos pontos baseados na frequência (logarítmico para melhor distribuição)
      const maxCount = Math.max(...frequencies)
      const pointSizes = chartData.map(item => {
        // Usar escala logarítmica para melhor distribuição visual
        const logSize = Math.log(item.x + 1) / Math.log(maxCount + 1)
        const normalizedSize = logSize * 0.8 + 0.2 // Entre 0.2 e 1.0
        return Math.max(4, Math.min(10, normalizedSize * 12.5)) // Entre 4 e 10 pixels (50% menor)
      })
      
      this.profitFrequencyChart.data.datasets[0].data = chartData
      this.profitFrequencyChart.data.datasets[0].backgroundColor = colors
      this.profitFrequencyChart.data.datasets[0].borderColor = colors.map(color => color.replace('0.9', '1'))
      this.profitFrequencyChart.data.datasets[0].pointRadius = pointSizes
      this.profitFrequencyChart.data.datasets[0].pointHoverRadius = pointSizes.map(size => size + 6)
      
      // Atualizar escalas para melhor distribuição
      this.profitFrequencyChart.options.scales.x.min = Math.max(0, freqStats.q1 - (freqStats.q3 - freqStats.q1) * 0.5)
      this.profitFrequencyChart.options.scales.x.max = freqStats.q3 + (freqStats.q3 - freqStats.q1) * 1.5
      this.profitFrequencyChart.options.scales.y.min = Math.max(0, profitStats.q1 - (profitStats.q3 - profitStats.q1) * 0.5)
      this.profitFrequencyChart.options.scales.y.max = profitStats.q3 + (profitStats.q3 - profitStats.q1) * 1.5
      
      this.profitFrequencyChart.update('none')
    },



    calculateVariation(values) {
      // Verificar se values é um array válido
      if (!Array.isArray(values) || values.length <= 1) return 0
      
      // Filtrar valores válidos (números)
      const validValues = values.filter(val => typeof val === 'number' && !isNaN(val))
      if (validValues.length <= 1) return 0
      
      const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
      const stdDev = Math.sqrt(variance)
      return mean > 0 ? (stdDev / mean) * 100 : 0
    },

    calculateStats(values) {
      if (values.length === 0) return { q1: 0, q3: 0, median: 0, mean: 0 }
      
      const sorted = [...values].sort((a, b) => a - b)
      const n = sorted.length
      
      const q1 = sorted[Math.floor(n * 0.25)]
      const median = sorted[Math.floor(n * 0.5)]
      const q3 = sorted[Math.floor(n * 0.75)]
      const mean = values.reduce((sum, val) => sum + val, 0) / n
      
      return { q1, q3, median, mean }
    },

    // Método auxiliar para selecionar casas aleatórias únicas
    getRandomHouses(houses, count) {
      const shuffled = [...houses].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },

    updateAnalysis() { this.processAnalytics() },
    
    // Métodos para busca automática de dados
    startAutoRefresh() {
      // Parar intervalo existente se houver
      this.stopAutoRefresh()
      
      // Iniciar novo intervalo (buscar a cada 2 minutos)
      this.autoRefreshInterval = setInterval(async () => {
        try {
          console.log('🔄 Busca automática de novos dados...')
          await this.checkForNewData()
        } catch (error) {
          console.error('❌ Erro na busca automática:', error)
        }
      }, 2 * 60 * 1000) // 2 minutos
      
      console.log('✅ Busca automática iniciada (intervalo: 2 minutos)')
    },
    
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
        this.autoRefreshInterval = null
        console.log('⏹️ Busca automática parada')
      }
    },

    toggleAutoRefresh() {
      if (this.autoRefreshInterval) {
        this.stopAutoRefresh()
      } else {
        this.startAutoRefresh()
      }
    },
    
    async checkForNewData() {
      try {
        // Buscar dados da API externa
        const apiData = await this.fetchFromExternalAPI()
        
        if (apiData && apiData.length > 0) {
          // Verificar se há novos dados
          const currentCount = this.surebets.length
          const newCount = apiData.length
          
          if (newCount > currentCount || this.hasNewSurebets(apiData)) {
            console.log(`🆕 Novos dados encontrados! Atual: ${currentCount}, Novo: ${newCount}`)
            
            // Atualizar dados
            this.surebets = apiData
            this.dataUpdateCount++
            this.lastDataUpdate = new Date()
            
            // Reprocessar análises
            this.processAnalytics()
            
            // Salvar no banco (com tratamento de erro)
            try {
              await this.saveDataToDatabase()
            } catch (saveError) {
              console.warn('⚠️ Erro ao salvar dados no banco (não crítico):', saveError)
              // Continuar mesmo se falhar ao salvar
            }
            
            // Atualizar gráficos
            this.updateCharts()
            
            console.log('✅ Dados atualizados com sucesso')
          } else {
            console.log('📊 Nenhum novo dado encontrado')
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar novos dados:', error)
      }
    },
    
    hasNewSurebets(newData) {
      // Verificar se há surebets com IDs que não existem nos dados atuais
      const currentIds = new Set(this.surebets.map(s => s.surebet_id))
      const newIds = new Set(newData.map(s => s.surebet_id))
      
      for (const newId of newIds) {
        if (!currentIds.has(newId)) {
          return true
        }
      }
      
      return false
    },

    destroyCharts() {
      if (this.housesChart) this.housesChart.destroy()
      if (this.marketsChart) this.marketsChart.destroy()
      if (this.timeChart) this.timeChart.destroy()
      if (this.sportsChart) this.sportsChart.destroy()
      if (this.profitFrequencyChart) this.profitFrequencyChart.destroy()
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
    },
         formatDateTime(date) {
       const options = { 
         year: 'numeric', 
         month: '2-digit', 
         day: '2-digit', 
         hour: '2-digit', 
         minute: '2-digit' 
       };
       return new Date(date).toLocaleDateString('pt-BR', options);
     },
     
     // Métodos para estatísticas adicionais do gráfico
     getMostFrequentMarket() {
       if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
       
       const marketCounts = {}
       this.filteredSurebets.forEach(item => {
         marketCounts[item.market] = (marketCounts[item.market] || 0) + 1
       })
       
       const mostFrequent = Object.entries(marketCounts).sort((a, b) => b[1] - a[1])[0]
       return mostFrequent ? `${mostFrequent[0]} (${mostFrequent[1]}x)` : 'N/A'
     },
     
     getMaxProfit() {
       if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
       return Math.max(...this.filteredSurebets.map(item => item.profit))
     },
     
           getMinProfit() {
        if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
        return Math.min(...this.filteredSurebets.map(item => item.profit))
      },
      
      // Métodos para estatísticas dos outros gráficos
      getTotalHouses() {
        if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
        return new Set(this.filteredSurebets.map(item => item.house)).size
      },
      
      getMostFrequentHouse() {
        if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
        
        const houseCounts = {}
        this.filteredSurebets.forEach(item => {
          houseCounts[item.house] = (houseCounts[item.house] || 0) + 1
        })
        
        const mostFrequent = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0]
        return mostFrequent ? `${mostFrequent[0]} (${mostFrequent[1]}x)` : 'N/A'
      },
      
      getPeakHour() {
        if (!this.peakHour) return 'N/A'
        return `${this.peakHour.hour}:00h (${this.peakHour.count} surebets)`
      },
      
      getTotalSports() {
        if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
        return new Set(this.filteredSurebets.map(item => item.sport)).size
      },
      
      getMostProfitableSport() {
        if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
        
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
        
        const mostProfitable = sportsData[0]
                 return mostProfitable ? `${mostProfitable.sport} (R$ ${mostProfitable.averageProfit.toFixed(2)})` : 'N/A'
       },
       
       getDominantMarket() {
         if (!this.topMarkets || this.topMarkets.length === 0) return 'N/A'
         const dominant = this.topMarkets[0]
         return `${dominant.name} (${dominant.count} surebets)`
       },

       // Funções para interatividade do gráfico de mercados
       toggleMarketCategoryFilter(categoryName) {
         if (this.selectedMarketGroup === categoryName) {
           this.selectedMarketGroup = null
         } else {
           this.selectedMarketGroup = categoryName
         }
         this.updateMarketsChart()
       },

       handleMarketChartClick(label, index) {
         // Destacar mercados relacionados no ranking
         this.selectedMarketGroup = label
         this.$nextTick(() => {
           // Scroll para a tabela de mercados
           const marketsTable = document.querySelector('.markets-table')
           if (marketsTable) {
             marketsTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
           }
         })
       },

       toggleMarketsChartViewMode() {
         this.marketsChartViewMode = this.marketsChartViewMode === 'percentage' ? 'count' : 'percentage'
         this.updateMarketsChart()
       },

       toggleMarketsChartDetails() {
         this.marketsChartShowDetails = !this.marketsChartShowDetails
         this.updateMarketsChart()
       },

       updateMarketsChartFilters() {
         // Recalcular dados com novos filtros
         this.processMarketsRanking(this.filteredSurebets)
         this.updateMarketsChart()
       },

       getAverageMarketProfit() {
         if (!this.topMarkets || this.topMarkets.length === 0) return 0
         const totalProfit = this.topMarkets.reduce((sum, market) => sum + market.averageProfit, 0)
         return totalProfit / this.topMarkets.length
       },

       selectMarket(market) {
         // Destacar mercado selecionado
         this.selectedMarketGroup = market.categoryName
         this.$nextTick(() => {
           // Scroll para a seção de detalhes se estiver visível
           if (this.showDetailedTable) {
             const detailSection = document.querySelector('.markets-detail-section')
             if (detailSection) {
               detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
             }
           }
         })
       },

       getGroupColor(groupName) {
         // Encontrar a cor do grupo baseado no nome
         for (const [key, group] of Object.entries(this.groupedMarkets)) {
           if (group.name === groupName) {
             return group.color
           }
           // Verificar subcategorias
           for (const [subKey, subcategory] of Object.entries(group.subcategories)) {
             if (subcategory.name === groupName || `${group.name} - ${subcategory.name}` === groupName) {
               return subcategory.color
             }
           }
         }
         return '#95A5A6' // Cor padrão cinza
       },

       filterMarketsTable() {
         // A função é chamada quando o filtro de categoria é alterado
         // A lógica é implementada na computed property filteredTopMarkets
         this.$nextTick(() => {
           // Scroll para a tabela se houver filtro ativo
           if (this.selectedMarketGroup) {
             const marketsTable = document.querySelector('.markets-table')
             if (marketsTable) {
               marketsTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
             }
           }
         })
       },
       
       getAverageSurebetsPerHouse() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
         const uniqueHouses = new Set(this.filteredSurebets.map(item => item.house)).size
         return uniqueHouses > 0 ? (this.filteredSurebets.length / uniqueHouses).toFixed(1) : 0
       },
       
       // Métodos adicionais para estatísticas dos gráficos
       getAverageProfitPerHour() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
         const totalProfit = this.filteredSurebets.reduce((sum, item) => sum + item.profit, 0)
         return totalProfit / this.filteredSurebets.length
       },
       
       getMostActiveHour() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
         const hourStats = {}
         this.filteredSurebets.forEach(item => {
           hourStats[item.hour] = (hourStats[item.hour] || 0) + 1
         })
         const mostActive = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0]
         return mostActive ? `${mostActive[0]}:00h (${mostActive[1]}x)` : 'N/A'
       },
       
       getLeastActiveHour() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
         const hourStats = {}
         this.filteredSurebets.forEach(item => {
           hourStats[item.hour] = (hourStats[item.hour] || 0) + 1
         })
         const leastActive = Object.entries(hourStats).sort((a, b) => a[1] - b[1])[0]
         return leastActive ? `${leastActive[0]}:00h (${leastActive[1]}x)` : 'N/A'
       },
       
       getAverageProfitPerSport() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
         const sportStats = {}
         const surebetGroups = {}
         
         this.filteredSurebets.forEach(item => {
           if (!surebetGroups[item.surebet_id]) surebetGroups[item.surebet_id] = item
         })
         
         Object.values(surebetGroups).forEach(item => {
           if (!sportStats[item.sport]) sportStats[item.sport] = { profits: [] }
           sportStats[item.sport].profits.push(item.profit)
         })
         
         const allProfits = Object.values(sportStats).flatMap(data => data.profits)
         return allProfits.length > 0 ? (allProfits.reduce((sum, p) => sum + p, 0) / allProfits.length).toFixed(2) : 0
       },
       
       getLeastProfitableSport() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
         
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
         })).sort((a, b) => a.averageProfit - b.averageProfit)
         
         const leastProfitable = sportsData[0]
         return leastProfitable ? `${leastProfitable.sport} (R$ ${leastProfitable.averageProfit.toFixed(2)})` : 'N/A'
       },
       
       getHouseWithHighestProfit() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
         
         const houseStats = {}
         this.filteredSurebets.forEach(item => {
           if (!houseStats[item.house]) houseStats[item.house] = { profits: [] }
           houseStats[item.house].profits.push(item.profit)
         })
         
         const housesData = Object.entries(houseStats).map(([house, data]) => ({
           house,
           averageProfit: data.profits.reduce((sum, p) => sum + p, 0) / data.profits.length,
           maxProfit: Math.max(...data.profits)
         })).sort((a, b) => b.averageProfit - a.averageProfit)
         
         const bestHouse = housesData[0]
         return bestHouse ? `${bestHouse.house} (R$ ${bestHouse.averageProfit.toFixed(2)})` : 'N/A'
       },
       
       getHouseWithLowestProfit() {
         if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
         
         const houseStats = {}
         this.filteredSurebets.forEach(item => {
           if (!houseStats[item.house]) houseStats[item.house] = { profits: [] }
           houseStats[item.house].profits.push(item.profit)
         })
         
         const housesData = Object.entries(houseStats).map(([house, data]) => ({
           house,
           averageProfit: data.profits.reduce((sum, p) => sum + p, 0) / data.profits.length
         })).sort((a, b) => a.averageProfit - b.averageProfit)
         
         const worstHouse = housesData[0]
         return worstHouse ? `${worstHouse.house} (R$ ${worstHouse.averageProfit.toFixed(2)})` : 'N/A'
       },
       
                getTotalProfit() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 0
           return this.filteredSurebets.reduce((sum, item) => sum + item.profit, 0)
         },
       
                getProfitRange() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           const maxProfit = Math.max(...this.filteredSurebets.map(item => item.profit))
           const minProfit = Math.min(...this.filteredSurebets.map(item => item.profit))
           return `R$ ${minProfit.toFixed(2)} - R$ ${maxProfit.toFixed(2)}`
         },
         
         getActivePeriod() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           const hourStats = {}
           this.filteredSurebets.forEach(item => {
             hourStats[item.hour] = (hourStats[item.hour] || 0) + 1
           })
           
           const activeHours = Object.entries(hourStats)
             .filter(([hour, count]) => count > 0)
             .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
           
           if (activeHours.length === 0) return 'N/A'
           
           const startHour = activeHours[0][0]
           const endHour = activeHours[activeHours.length - 1][0]
           return `${startHour}:00h - ${endHour}:00h`
         },
         
         getInactivePeriod() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           const hourStats = {}
           this.filteredSurebets.forEach(item => {
             hourStats[item.hour] = (hourStats[item.hour] || 0) + 1
           })
           
           const inactiveHours = []
           for (let i = 0; i < 24; i++) {
             if (!hourStats[i] || hourStats[i] === 0) {
               inactiveHours.push(i)
             }
           }
           
           if (inactiveHours.length === 0) return 'Nenhum'
           
           const startHour = inactiveHours[0]
           const endHour = inactiveHours[inactiveHours.length - 1]
           return `${startHour}:00h - ${endHour}:00h`
         },
         
         getMostActiveSport() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           
           const sportCounts = {}
           this.filteredSurebets.forEach(item => {
             sportCounts[item.sport] = (sportCounts[item.sport] || 0) + 1
           })
           
           const mostActive = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]
           return mostActive ? `${mostActive[0]} (${mostActive[1]}x)` : 'N/A'
         },
         
         getLeastActiveSport() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           
           const sportCounts = {}
           this.filteredSurebets.forEach(item => {
             sportCounts[item.sport] = (sportCounts[item.sport] || 0) + 1
           })
           
           const leastActive = Object.entries(sportCounts).sort((a, b) => a[1] - b[1])[0]
           return leastActive ? `${leastActive[0]} (${leastActive[1]}x)` : 'N/A'
         },
         
         getSportDiversity() {
           if (!this.filteredSurebets || this.filteredSurebets.length === 0) return 'N/A'
           
           const uniqueSports = new Set(this.filteredSurebets.map(item => item.sport)).size
           const totalSurebets = this.filteredSurebets.length
           
           if (totalSurebets === 0) return 'N/A'
           
           const diversity = (uniqueSports / totalSurebets * 100).toFixed(1)
           return `${uniqueSports} esportes (${diversity}% do total)`
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
   margin-bottom: 16px;
 }

 .data-status-indicator {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   padding: 8px 16px;
   background: rgba(26, 26, 26, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 20px;
   font-size: 14px;
   color: #ffffff;
   backdrop-filter: blur(10px);
 }

 .status-icon {
   font-size: 16px;
 }

 .status-icon.cache {
   color: #00ff88;
 }

 .status-icon.api {
   color: #ff6b35;
 }

 .status-text {
   font-weight: 600;
 }

 .status-time {
   color: #cccccc;
   font-size: 12px;
   font-weight: 400;
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
   grid-template-columns: repeat(4, 1fr);
   gap: 24px;
   margin-bottom: 32px;
 }

.chart-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  min-height: 550px;
  height: auto;
  display: flex;
  flex-direction: column;
}

 .chart-section h3 {
   color: #ffffff;
   margin: 0 0 12px 0;
   font-size: 18px;
   font-weight: 600;
 }

 .chart-description {
   color: #cccccc;
   font-size: 13px;
   margin: 0 0 16px 0;
   line-height: 1.4;
 }

 .legend-item {
   display: inline-block;
   margin-right: 16px;
   margin-left: 8px;
   font-size: 12px;
 }

 .legend-color {
   display: inline-block;
   width: 12px;
   height: 12px;
   border-radius: 50%;
   margin-right: 6px;
   vertical-align: middle;
 }

 .legend-color.green {
   background-color: rgba(0, 255, 136, 0.8);
 }

 .legend-color.yellow {
   background-color: rgba(255, 193, 7, 0.8);
 }

 .legend-color.orange {
   background-color: rgba(255, 107, 53, 0.8);
 }

 .chart-container {
   height: 300px;
   min-height: 300px;
   position: relative;
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
 }



 .chart-stats {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
   gap: 12px;
   margin-bottom: 16px;
   padding: 16px;
   background: rgba(26, 26, 26, 0.8);
   border-radius: 12px;
   border: 1px solid rgba(255, 255, 255, 0.15);
   backdrop-filter: blur(10px);
   height: auto;
   overflow: visible;
   flex-shrink: 0;
 }

 /* Scrollbars removidos - conteúdo exibido completamente */

 .stat-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10px 14px;
   background: rgba(0, 0, 0, 0.3);
   border-radius: 8px;
   border: 1px solid rgba(255, 255, 255, 0.1);
   transition: all 0.2s ease;
 }

 .stat-item:hover {
   background: rgba(0, 0, 0, 0.4);
   border-color: rgba(255, 255, 255, 0.2);
   transform: translateY(-1px);
 }

 .stat-label {
   color: #cccccc;
   font-size: 13px;
   font-weight: 500;
   flex: 1;
   margin-right: 8px;
 }

 .stat-value {
   color: #00ff88;
   font-size: 13px;
   font-weight: 600;
   text-align: right;
   min-width: fit-content;
   background: rgba(0, 255, 136, 0.1);
   padding: 4px 8px;
   border-radius: 4px;
   border: 1px solid rgba(0, 255, 136, 0.2);
 }

.chart-container {
  height: 100px;
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

.auto-refresh-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px 15px;
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ff4444; /* Red for inactive */
  transition: background-color 0.3s ease;
}

.status-dot.active {
  background-color: #00ff88; /* Green for active */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.update-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.update-text {
  color: #cccccc;
}

.update-count {
  color: #00ff88;
  font-weight: 700;
}

.toggle-auto-refresh-btn {
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

.toggle-auto-refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.toggle-auto-refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-auto-refresh-btn.active {
  background: linear-gradient(135deg, #ff4444, #dc3545);
  color: #ffffff;
}

/* 📊 Estilos para a seção melhorada de Mercados */
.markets-improved-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
}

.section-header h3 {
  color: #ffffff;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.section-header p {
  color: #cccccc;
  margin: 0;
  font-size: 14px;
}

 .markets-layout {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 24px;
   align-items: stretch;
   min-height: 600px;
 }

 .chart-wrapper {
   background: rgba(26, 26, 26, 0.6);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 24px;
   text-align: center;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   min-height: 500px;
   height: auto;
 }
 
 .chart-wrapper h4 {
   color: #ffffff;
   margin: 0 0 12px 0;
   font-size: 18px;
   font-weight: 600;
 }

   .chart-wrapper .chart-container {
    height: 300px;
    min-height: 300px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.control-btn.active {
  background: #00ff88;
  color: #000000;
  border-color: #00ff88;
}

.chart-filters {
  margin: 16px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-legend {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item.selected {
  background: rgba(0, 255, 136, 0.1);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.legend-text {
  color: #ffffff;
  font-weight: 600;
  flex: 1;
}

.clear-filter-btn {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 4px;
  color: #ff6b35;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  transition: all 0.3s ease;
}

 .clear-filter-btn:hover {
   background: rgba(255, 107, 53, 0.3);
   border-color: rgba(255, 107, 53, 0.5);
 }

/* Melhorias para responsividade dos gráficos */
.chart-container canvas {
  max-width: 100%;
  height: auto !important;
}

.chart-wrapper {
  overflow: hidden;
}

.chart-stats {
  margin: 16px 0;
  flex-shrink: 0;
}

.chart-description {
  margin: 12px 0;
  flex-shrink: 0;
}

/* Garantir que os gráficos tenham espaço suficiente */
.chart-wrapper > * {
  flex-shrink: 0;
}

.chart-wrapper .chart-container {
  flex: 1;
  flex-shrink: 1;
}

 /* Estilos para a nova seção de análise de mercados */
 .markets-analysis-section {
   background: rgba(26, 26, 26, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 16px;
   padding: 24px;
   margin-bottom: 32px;
   backdrop-filter: blur(10px);
   overflow: visible;
   height: auto;
 }

 .markets-summary {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
   gap: 16px;
   margin-bottom: 24px;
 }

 .summary-card {
   background: rgba(42, 42, 42, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 20px;
   display: flex;
   align-items: center;
   gap: 16px;
   transition: all 0.3s ease;
 }

 .summary-card:hover {
   background: rgba(42, 42, 42, 0.9);
   border-color: rgba(255, 255, 255, 0.2);
   transform: translateY(-2px);
 }

 .summary-icon {
   font-size: 24px;
   width: 48px;
   height: 48px;
   display: flex;
   align-items: center;
   justify-content: center;
   background: rgba(0, 255, 136, 0.1);
   border-radius: 12px;
   border: 1px solid rgba(0, 255, 136, 0.2);
 }

 .summary-content {
   display: flex;
   flex-direction: column;
   flex: 1;
 }

 .summary-value {
   color: #00ff88;
   font-size: 18px;
   font-weight: 700;
   margin-bottom: 4px;
 }

 .summary-label {
   color: #cccccc;
   font-size: 13px;
   font-weight: 500;
 }

 .markets-main-layout {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 24px;
   margin-bottom: 24px;
   align-items: stretch;
 }

 .markets-chart-section {
   background: rgba(42, 42, 42, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 20px;
   display: flex;
   flex-direction: column;
   height: 100%;
   min-height: 400px;
 }

 .chart-container-compact {
   height: 250px;
   min-height: 250px;
   position: relative;
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   margin: 16px 0;
   max-height: calc(100% - 120px);
 }

 .markets-ranking-compact {
   background: rgba(42, 42, 42, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 20px;
   display: flex;
   flex-direction: column;
   height: 100%;
   min-height: 400px;
 }

 .ranking-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;
   padding-bottom: 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
 }

 .ranking-header h4 {
   color: #ffffff;
   margin: 0;
   font-size: 18px;
   font-weight: 600;
 }

 .ranking-list {
   flex: 1;
   overflow: visible;
   height: auto;
   max-height: calc(100% - 80px);
   display: flex;
   flex-direction: column;
   gap: 8px;
 }

 .ranking-item {
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 12px;
   margin-bottom: 8px;
   background: linear-gradient(135deg, rgba(42, 42, 42, 0.9), rgba(26, 26, 26, 0.9));
   border-radius: 8px;
   border: 1px solid rgba(255, 255, 255, 0.15);
   cursor: pointer;
   transition: all 0.3s ease;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
 }

 .ranking-item:hover {
   background: linear-gradient(135deg, rgba(52, 52, 52, 0.95), rgba(36, 36, 36, 0.95));
   border-color: rgba(0, 255, 136, 0.3);
   transform: translateX(4px);
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 255, 136, 0.1);
 }

 .ranking-item.highlighted {
   background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 106, 0.15));
   border-color: rgba(0, 255, 136, 0.4);
   box-shadow: 0 2px 8px rgba(0, 255, 136, 0.2), 0 0 0 1px rgba(0, 255, 136, 0.2);
 }

 .ranking-item.category-filtered {
   opacity: 0.3;
 }

 .ranking-position {
   background: linear-gradient(135deg, #00ff88, #00cc6a);
   color: #000000;
   font-weight: 800;
   font-size: 14px;
   width: 32px;
   height: 32px;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 50%;
   flex-shrink: 0;
   box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
   border: 2px solid rgba(255, 255, 255, 0.1);
 }

 .ranking-content {
   flex: 1;
   min-width: 0;
 }

 .market-name {
   color: #ffffff;
   font-weight: 700;
   font-size: 14px;
   margin-bottom: 4px;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .market-category {
   display: flex;
   align-items: center;
   gap: 8px;
 }

 .ranking-stats {
   display: flex;
   flex-direction: column;
   align-items: flex-end;
   gap: 4px;
   flex-shrink: 0;
 }

 .stat-count {
   color: #cccccc;
   font-size: 12px;
   font-weight: 500;
 }

 .stat-profit {
   color: #00ff88;
   font-size: 13px;
   font-weight: 700;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .markets-detail-section {
   background: rgba(42, 42, 42, 0.8);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 20px;
   margin-top: 24px;
 }

 .detail-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;
   padding-bottom: 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
 }

 .detail-header h4 {
   color: #ffffff;
   margin: 0;
   font-size: 20px;
   font-weight: 700;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .close-btn {
   background: rgba(255, 107, 53, 0.2);
   border: 1px solid rgba(255, 107, 53, 0.3);
   border-radius: 6px;
   color: #ff6b35;
   cursor: pointer;
   padding: 8px 12px;
   font-size: 14px;
   transition: all 0.3s ease;
 }

 .close-btn:hover {
   background: rgba(255, 107, 53, 0.3);
   border-color: rgba(255, 107, 53, 0.5);
 }

 .detail-table-wrapper {
   overflow-x: auto;
   background: rgba(26, 26, 26, 0.8);
   border-radius: 12px;
   padding: 20px;
   margin-top: 16px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
   border: 1px solid rgba(255, 255, 255, 0.1);
 }

 .detail-table {
   width: 100%;
   border-collapse: collapse;
   font-size: 14px;
   background: rgba(26, 26, 26, 0.8);
   border-radius: 12px;
   overflow: hidden;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
 }

 .detail-table th {
   background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
   color: #ffffff;
   font-weight: 700;
   padding: 16px 12px;
   border-bottom: 2px solid rgba(0, 255, 136, 0.3);
   text-align: left;
   font-size: 15px;
   text-transform: uppercase;
   letter-spacing: 0.5px;
 }

 .detail-table td {
   padding: 16px 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.08);
   color: #ffffff;
   vertical-align: middle;
 }

 .detail-row:hover {
   background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.05));
   transform: translateX(2px);
   transition: all 0.3s ease;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
 }

 .detail-row.highlighted {
   background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 106, 0.15));
   border-left: 4px solid #00ff88;
   box-shadow: 0 2px 8px rgba(0, 255, 136, 0.2);
 }

 /* Estilos para colunas de dados */
 .detail-table .position {
   font-weight: 700;
   color: #00ff88;
   text-align: center;
   width: 60px;
   font-size: 16px;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .detail-table .count {
   color: #00ff88;
   font-weight: 700;
   text-align: center;
   width: 80px;
   font-size: 15px;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .detail-table .profit {
   color: #00ff88;
   font-weight: 700;
   text-align: right;
   width: 120px;
   font-size: 15px;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .detail-table .score {
   color: #000000;
   font-weight: 700;
   text-align: center;
   background: linear-gradient(135deg, #00ff88, #00cc6a);
   border-radius: 8px;
   padding: 6px 12px;
   width: 80px;
   font-size: 14px;
   box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
   border: 1px solid rgba(255, 255, 255, 0.1);
 }

 .detail-row.category-filtered {
   opacity: 0.3;
 }

 /* Estilos para células da tabela detalhada */
 .market-name-cell {
   min-width: 200px;
 }

 .market-name-wrapper {
   display: flex;
   align-items: center;
   gap: 8px;
 }

 .market-icon {
   font-size: 16px;
   flex-shrink: 0;
 }

 .market-name-text {
   font-weight: 600;
   color: #ffffff;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .category-cell {
   min-width: 120px;
 }

 .category-badge-compact {
   display: inline-block;
   padding: 4px 8px;
   border-radius: 6px;
   font-size: 11px;
   font-weight: 700;
   color: #ffffff;
   text-transform: uppercase;
   letter-spacing: 0.5px;
   box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
   border: 1px solid rgba(255, 255, 255, 0.1);
 }

 .expand-section {
   text-align: center;
   margin-top: 16px;
 }

 .expand-btn {
   background: rgba(0, 255, 136, 0.1);
   border: 1px solid rgba(0, 255, 136, 0.3);
   border-radius: 8px;
   color: #00ff88;
   cursor: pointer;
   padding: 12px 24px;
   font-size: 14px;
   font-weight: 600;
   transition: all 0.3s ease;
 }

 .expand-btn:hover {
   background: rgba(0, 255, 136, 0.2);
   border-color: rgba(0, 255, 136, 0.5);
   transform: translateY(-1px);
 }

 .markets-ranking {
   background: rgba(26, 26, 26, 0.6);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   padding: 24px;
   display: flex;
   flex-direction: column;
   min-height: 500px;
   height: auto;
 }

 .markets-ranking h4 {
   color: #ffffff;
   margin: 0 0 20px 0;
   font-size: 20px;
   font-weight: 600;
   text-align: center;
   padding-bottom: 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
 }

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-header h4 {
  margin: 0;
  padding: 0;
  border: none;
  text-align: left;
}

.table-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.filter-select:focus {
  outline: none;
  border-color: #00ff88;
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.category {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 4px rgba(74, 144, 226, 0.3);
}

.subcategory {
  font-size: 11px;
  color: #cccccc;
  font-style: italic;
}

.data-row.highlighted {
  background: rgba(0, 255, 136, 0.1);
  border-left: 4px solid #00ff88;
}

.data-row.category-filtered {
  opacity: 0.3;
  background: rgba(255, 255, 255, 0.02);
}

.data-row.category-filtered:hover {
  opacity: 0.6;
}

 .table-wrapper {
   overflow-x: auto;
   flex: 1;
   display: flex;
   flex-direction: column;
 }

 .modern-table {
   width: 100%;
   border-collapse: collapse;
   font-size: 14px;
   height: 100%;
   flex: 1;
 }

 .modern-table th {
   background: rgba(0, 0, 0, 0.3);
   color: #ffffff;
   font-weight: 600;
   padding: 16px 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
   text-align: left;
   font-size: 15px;
 }

 .modern-table td {
   padding: 16px 12px;
   border-bottom: 1px solid rgba(255, 255, 255, 0.05);
   color: #ffffff;
   font-size: 14px;
 }

.data-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

 .position {
   font-weight: 700;
   color: #00ff88;
   text-align: center;
   width: 60px;
   font-size: 16px;
 }

 .market-info {
   display: flex;
   align-items: center;
   gap: 8px;
   flex: 1;
   min-width: 0;
 }

 .market-info .icon {
   font-size: 20px;
   flex-shrink: 0;
 }

 .count {
   color: #00ff88;
   font-weight: 700;
   text-align: center;
   width: 80px;
   font-size: 15px;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .profit {
   color: #00ff88;
   font-weight: 700;
   text-align: right;
   width: 120px;
   font-size: 15px;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

 .score {
   color: #000000;
   font-weight: 700;
   text-align: center;
   background: linear-gradient(135deg, #00ff88, #00cc6a);
   border-radius: 8px;
   padding: 6px 12px;
   width: 80px;
   font-size: 14px;
   box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
   border: 1px solid rgba(255, 255, 255, 0.1);
 }



@media (max-width: 1200px) {
  .main-content { margin-left: 0; }
  .charts-grid { grid-template-columns: repeat(2, 1fr); }
  .markets-layout { grid-template-columns: 1fr; gap: 16px; }
  .chart-wrapper .chart-container { 
    height: 280px; 
    min-height: 280px;
  }
  .chart-section {
    min-height: 500px;
  }
  .chart-container {
    height: 270px;
    min-height: 270px;
  }
  .markets-main-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .markets-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .markets-ranking-compact {
    min-height: 380px;
    height: 100%;
  }
  .markets-chart-section {
    min-height: 380px;
    height: 100%;
  }
}

 @media (max-width: 768px) {
   .main-content { padding: 16px; padding-bottom: 120px; }
   .filters-section { flex-direction: column; align-items: center; }
   .stats-dashboard { grid-template-columns: 1fr; }
   .charts-grid { grid-template-columns: repeat(2, 1fr); }
   .insights-grid { grid-template-columns: 1fr; }
   .ranking-table { font-size: 12px; }
   .ranking-table th, .ranking-table td { padding: 8px 4px; }
   .markets-improved-section { padding: 16px; }
   .section-header h3 { font-size: 20px; }
   .modern-table { font-size: 12px; }
   .modern-table th, .modern-table td { padding: 8px 6px; }
   .markets-layout { grid-template-columns: 1fr; gap: 16px; }
        .chart-wrapper, .markets-ranking { 
     min-height: 350px; 
     height: auto;
   }
   .chart-wrapper .chart-container { 
     height: 250px; 
     min-height: 250px;
   }
   .chart-section {
     min-height: 450px;
   }
   .chart-container {
     height: 250px;
     min-height: 250px;
   }
   .markets-summary {
     grid-template-columns: 1fr;
   }
   .chart-container-compact {
     height: 200px;
     min-height: 200px;
   }
   .markets-ranking-compact {
     min-height: 350px;
     height: 100%;
   }
   .markets-chart-section {
     min-height: 350px;
     height: 100%;
   }
   .chart-stats { 
     grid-template-columns: 1fr; 
     gap: 8px; 
     padding: 16px;
     height: auto;
     max-height: none;
   }
   
   /* Responsividade para tabela detalhada */
   .detail-table {
     font-size: 12px;
   }
   
   .detail-table th,
   .detail-table td {
     padding: 12px 8px;
   }
   
   .market-name-cell {
     min-width: 150px;
   }
   
   .category-cell {
     min-width: 100px;
   }
   
   .detail-table .position {
     width: 50px;
     font-size: 14px;
   }
   
   .detail-table .count {
     width: 60px;
     font-size: 13px;
   }
   
   .detail-table .profit {
     width: 100px;
     font-size: 13px;
   }
   
   .detail-table .score {
     width: 70px;
     font-size: 12px;
     padding: 4px 8px;
   }
   .stat-item { 
     padding: 8px 10px; 
     flex-direction: column;
     align-items: flex-start;
     gap: 4px;
   }
   .stat-label, .stat-value { 
     font-size: 12px; 
     width: 100%;
     text-align: left;
   }
   .stat-value {
     background: rgba(0, 255, 136, 0.15);
     padding: 6px 10px;
     border-radius: 6px;
     text-align: center;
     font-weight: 700;
   }
   .chart-wrapper h4 { font-size: 16px; }
 .chart-wrapper .chart-container { 
   height: 250px; 
   min-height: 250px;
 }
   .chart-description { font-size: 12px; }
 }

@media (max-width: 600px) {
  .charts-grid { 
    grid-template-columns: 1fr; 
    gap: 16px;
  }
  .chart-section {
    min-height: 400px;
  }
  .chart-container {
    height: 220px;
    min-height: 220px;
  }
}
</style>
