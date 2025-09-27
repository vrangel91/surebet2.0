<template>
  <div class="reports-container flex-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

    <!-- Conteúdo Principal -->
    <main class="main-content flex-column flex-1 min-h-0">
      <!-- Header Global -->
      <Header />

      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Relatórios</h2>
          <p class="page-subtitle">Análise detalhada de performance e ganhos</p>
        </div>

        <div class="header-controls">
          <button class="control-btn refresh-btn" @click="refreshData" title="Atualizar dados">
            <svg class="refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Cards de Performance -->
      <div class="performance-cards">
        <!-- Card de Resumo do Usuário -->
        <div class="user-summary-card">
          <div class="card-header">
            <button class="visibility-toggle" @click="toggleDataVisibility">
              <span class="visibility-icon">{{ showData ? '👁️' : '🙈' }}</span>
            </button>
            <h3>Olá, {{ getUserDisplayName() }}</h3>
          </div>
          <p class="card-subtitle">Veja abaixo sua performance de ganhos detalhados.</p>

          <div class="add-bet-container">
            <button class="add-bet-btn">
              <span class="add-bet-icon">+</span>
              <span class="add-bet-text">Adicionar aposta</span>
            </button>
          </div>

          <div class="earnings-grid">
            <div class="earning-item">
              <div class="earning-indicator"></div>
              <div class="earning-content">
                <span class="earning-label">Ganhos de hoje:</span>
                <span class="earning-value">{{ showData ? formatCurrency(todayEarnings) : '***' }}</span>
              </div>
            </div>
            <div class="earning-item">
              <div class="earning-indicator"></div>
              <div class="earning-content">
                <span class="earning-label">Ganhos da semana:</span>
                <span class="earning-value">{{ showData ? formatCurrency(weekEarnings) : '***' }}</span>
              </div>
            </div>
            <div class="earning-item">
              <div class="earning-indicator"></div>
              <div class="earning-content">
                <span class="earning-label">Ganhos do mês:</span>
                <span class="earning-value">{{ showData ? formatCurrency(monthEarnings) : '***' }}</span>
              </div>
            </div>
            <div class="earning-item">
              <div class="earning-indicator"></div>
              <div class="earning-content">
                <span class="earning-label">Ganhos totais:</span>
                <span class="earning-value">{{ showData ? formatCurrency(totalEarnings) : '***' }}</span>
              </div>
            </div>
          </div>

          <div class="stats-section">
            <div class="stats-icon">📊</div>
            <div class="stats-content">
              <div class="stat-item">
                <span class="stat-label">Total de apostas:</span>
                <span class="stat-value">{{ showData ? bets.length : '***' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">ROI médio:</span>
                <span class="stat-value">{{ showData ? averageROI + '%' : '***' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Evolução do Lucro -->
        <div class="chart-container">
          <h3>Evolução do Lucro Acumulado</h3>
          <ProfitEvolutionChart ref="profitChart" :data="chartData" :isLoading="isLoadingCharts" />
        </div>
      </div>

      <!-- Gráficos de ROI -->
      <div class="roi-charts-grid">
        <!-- Gráfico de ROI por Aposta -->
        <div class="roi-chart-container">
          <h3>ROI por Aposta (Últimas 10)</h3>
          <ROIBarChart ref="roiChart" :data="roiChartData" :isLoading="isLoadingCharts" />
        </div>

        <!-- Gráfico de ROI por Período -->
        <div class="roi-period-container">
          <h3>ROI por Período</h3>
          <ROIBarChart ref="roiPeriodChart" :data="roiPeriodData" :isLoading="isLoadingCharts" />
        </div>
      </div>

      <!-- Tabela de Apostas -->
      <div class="bets-table-section">
        <div class="table-controls">
          <div class="pagination-control">
            <label>Registros por página:</label>
            <select v-model="recordsPerPage" class="records-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="search-control">
            <input type="text" v-model="searchTerm" placeholder="Buscar..." class="search-input" />
          </div>
        </div>

        <div class="table-container">
          <table class="bets-table">
            <thead>
              <tr>
                <th @click="sortBy('roi')" class="sortable">
                  ROI - PARTIDA
                  <span class="sort-icon">{{ getSortIcon('roi') }}</span>
                </th>
                <th @click="sortBy('sport')" class="sortable">
                  ESPORTE
                  <span class="sort-icon">{{ getSortIcon('sport') }}</span>
                </th>
                <th @click="sortBy('houses')" class="sortable">
                  CASAS
                  <span class="sort-icon">{{ getSortIcon('houses') }}</span>
                </th>
                <th @click="sortBy('market')" class="sortable">
                  MERCADO
                  <span class="sort-icon">{{ getSortIcon('market') }}</span>
                </th>
                <th @click="sortBy('odds')" class="sortable">
                  ODDS
                  <span class="sort-icon">{{ getSortIcon('odds') }}</span>
                </th>
                <th @click="sortBy('stake')" class="sortable">
                  STAKE
                  <span class="sort-icon">{{ getSortIcon('stake') }}</span>
                </th>
                <th @click="sortBy('investment')" class="sortable">
                  APORTE
                  <span class="sort-icon">{{ getSortIcon('investment') }}</span>
                </th>
                <th @click="sortBy('status')" class="sortable">
                  STATUS
                  <span class="sort-icon">{{ getSortIcon('status') }}</span>
                </th>
                <th @click="sortBy('profit')" class="sortable">
                  LUCRO
                  <span class="sort-icon">{{ getSortIcon('profit') }}</span>
                </th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBets.length === 0">
                <td colspan="10" class="no-records">Sem registros</td>
              </tr>
              <tr v-for="bet in paginatedBets" :key="bet.id" class="bet-row">
                <td>{{ bet.roi }}%</td>
                <td>{{ bet.sport }}</td>
                <td>{{ bet.houses.join(', ') }}</td>
                <td>{{ bet.market }}</td>
                <td>{{ bet.odds }}</td>
                <td>{{ formatCurrency(bet.stake) }}</td>
                <td>{{ formatCurrency(bet.investment) }}</td>
                <td>
                  <span :class="['status-badge', bet.status]">{{ bet.status }}</span>
                </td>
                <td :class="bet.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                  {{ formatCurrency(bet.profit) }}
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view-btn" @click="viewBetDetails(bet)" title="Ver detalhes">
                      <span class="action-icon">👁️</span>
                    </button>
                    <button class="action-btn delete-btn" @click="deleteBet(bet)" title="Excluir aposta">
                      <span class="action-icon">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resumo da página / totais -->
        <div class="table-summary" v-if="filteredBets.length > 0">
          <div class="left">
            Mostrando {{ pageStartIndex + 1 }}–{{ pageEndIndex }} de {{ filteredBets.length }} registros
          </div>
          <div class="right">
            <div class="summary-item">
              <span class="label">Stake (página):</span>
              <span class="value">{{ formatCurrency(pageTotals.stake) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Aporte (página):</span>
              <span class="value">{{ formatCurrency(pageTotals.investment) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Lucro (página):</span>
              <span :class="['value', pageTotals.profit >= 0 ? 'profit-positive' : 'profit-negative']">{{
                formatCurrency(pageTotals.profit) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">ROI médio (página):</span>
              <span class="value">{{ pageAverageRoi.toFixed(2) }}%</span>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div class="pagination" v-if="filteredBets.length > 0">
          <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">
            Anterior
          </button>
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            Próximo
          </button>
        </div>
      </div>

      <!-- Espaço extra para scroll -->
      <div class="scroll-spacer"></div>
    </main>

    <!-- Modal de Detalhes da Aposta -->
    <div v-if="showBetModal" class="modal-overlay" @click="closeBetModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalhes da Aposta</h3>
          <button class="modal-close" @click="closeBetModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedBet">
          <div class="bet-details">
            <div class="detail-row">
              <span class="detail-label">Partida:</span>
              <span class="detail-value">{{ selectedBet.match }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Esporte:</span>
              <span class="detail-value">{{ selectedBet.sport }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Casas:</span>
              <span class="detail-value">{{ selectedBet.houses.join(', ') }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Mercado:</span>
              <span class="detail-value">{{ selectedBet.market }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Odds:</span>
              <span class="detail-value">{{ selectedBet.odds }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stake:</span>
              <span class="detail-value">{{ formatCurrency(selectedBet.stake) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Aporte:</span>
              <span class="detail-value">{{ formatCurrency(selectedBet.investment) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="['status-badge', selectedBet.status]">{{ selectedBet.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lucro:</span>
              <span :class="['detail-value', selectedBet.profit >= 0 ? 'profit-positive' : 'profit-negative']">
                {{ formatCurrency(selectedBet.profit) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ROI:</span>
              <span class="detail-value">{{ selectedBet.roi }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal do Glossário -->


    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <button class="modal-close" @click="closeDeleteModal">×</button>
        </div>
        <div class="modal-body" v-if="betToDelete">
          <div class="delete-warning">
            <div class="warning-icon">⚠️</div>
            <p class="warning-text">
              Tem certeza que deseja excluir a aposta <strong>"{{ betToDelete.match }}"</strong>?
            </p>
            <p class="warning-details">
              Esta ação não pode ser desfeita e removerá permanentemente esta aposta dos seus relatórios.
            </p>
          </div>
          <div class="bet-summary">
            <div class="summary-item">
              <span class="label">Esporte:</span>
              <span class="value">{{ betToDelete.sport }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Lucro:</span>
              <span :class="['value', betToDelete.profit >= 0 ? 'profit-positive' : 'profit-negative']">
                {{ formatCurrency(betToDelete.profit) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">ROI:</span>
              <span class="value">{{ betToDelete.roi }}%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">
            Cancelar
          </button>
          <button class="btn-delete" @click="confirmDelete">
            Excluir Aposta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfitEvolutionChart from '../components/Charts/ProfitEvolutionChart.vue'
import ROIBarChart from '../components/Charts/ROIBarChart.vue'
import Sidebar from '../components/Navigation/Sidebar.vue'
import Header from '../components/Navigation/Header.vue'
import { emitter } from '../utils/emitter.js'



export default {
  name: 'ReportsView',
  components: {
    ProfitEvolutionChart,
    ROIBarChart,
    Sidebar,
    Header
  },
  data() {
    return {
      sidebarCollapsed: false,

      isDarkTheme: true,
      showData: true,
      recordsPerPage: 10,
      searchTerm: '',
      currentPage: 1,
      sortField: 'date',
      sortDirection: 'desc',
      showBetModal: false,
      selectedBet: null,
      showDeleteModal: false,
      betToDelete: null,
      // Dados dos surebets da API
      surebets: {},
      // Dados das apostas processadas para relatórios
      bets: [],
      // Timer para verificar status das apostas
      statusCheckTimer: null,
      // Estado de loading dos gráficos
      isLoadingCharts: false
    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    // Calcula ganhos de hoje
    todayEarnings() {
      const today = new Date().toDateString()
      return this.bets
        .filter(bet => new Date(bet.date).toDateString() === today)
        .reduce((sum, bet) => sum + bet.profit, 0)
    },
    // Calcula ganhos da semana
    weekEarnings() {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return this.bets
        .filter(bet => new Date(bet.date) >= weekAgo)
        .reduce((sum, bet) => sum + bet.profit, 0)
    },
    // Calcula ganhos do mês
    monthEarnings() {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return this.bets
        .filter(bet => new Date(bet.date) >= monthAgo)
        .reduce((sum, bet) => sum + bet.profit, 0)
    },
    // Calcula ganhos totais
    totalEarnings() {
      return this.bets.reduce((sum, bet) => sum + bet.profit, 0)
    },
    // Calcula ROI médio
    averageROI() {
      if (this.bets.length === 0) return '0.00'
      const totalROI = this.bets.reduce((sum, bet) => sum + bet.roi, 0)
      return (totalROI / this.bets.length).toFixed(2)
    },
    filteredBets() {
      if (!this.searchTerm) return this.bets

      const term = this.searchTerm.toLowerCase()
      return this.bets.filter(bet =>
        bet.match.toLowerCase().includes(term) ||
        bet.sport.toLowerCase().includes(term) ||
        bet.houses.some(house => house.toLowerCase().includes(term)) ||
        bet.market.toLowerCase().includes(term) ||
        bet.status.toLowerCase().includes(term)
      )
    },
    sortedBets() {
      const sorted = [...this.filteredBets].sort((a, b) => {
        let aValue = a[this.sortField]
        let bValue = b[this.sortField]

        if (this.sortField === 'houses') {
          aValue = aValue.join(', ')
          bValue = bValue.join(', ')
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })

      return sorted
    },
    paginatedBets() {
      const start = (this.currentPage - 1) * this.recordsPerPage
      const end = start + this.recordsPerPage
      return this.sortedBets.slice(start, end)
    },
    pageStartIndex() {
      const start = (this.currentPage - 1) * this.recordsPerPage
      if (this.filteredBets.length === 0) return 0
      return Math.min(start, this.filteredBets.length - 1)
    },
    pageEndIndex() {
      const end = Math.min(this.currentPage * this.recordsPerPage, this.filteredBets.length)
      return end
    },
    pageTotals() {
      return this.paginatedBets.reduce((acc, bet) => {
        acc.stake += bet.stake || 0
        acc.investment += bet.investment || 0
        acc.profit += bet.profit || 0
        acc.roiSum += bet.roi || 0
        acc.count += 1
        return acc
      }, { stake: 0, investment: 0, profit: 0, roiSum: 0, count: 0 })
    },
    pageAverageRoi() {
      return this.pageTotals.count > 0 ? this.pageTotals.roiSum / this.pageTotals.count : 0
    },
    totalPages() {
      return Math.ceil(this.filteredBets.length / this.recordsPerPage)
    },
    // Dados para o gráfico de evolução de lucro
    chartData() {
      if (!this.bets || this.bets.length === 0) return []

      // Ordenar por data e calcular lucro acumulado
      const sortedBets = [...this.bets].sort((a, b) => new Date(a.date) - new Date(b.date))
      let cumulativeProfit = 0

      return sortedBets.map(bet => {
        cumulativeProfit += bet.profit || 0
        return {
          date: bet.date,
          profit: cumulativeProfit
        }
      })
    },
    // Dados para o gráfico de ROI
    roiChartData() {
      if (!this.bets || this.bets.length === 0) return []

      // Pegar as últimas 10 apostas
      const lastBets = [...this.bets]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .reverse()

      return lastBets.map((bet, index) => ({
        period: `Aposta ${index + 1}`,
        roi: bet.roi || 0
      }))
    },
    // Dados para o gráfico de ROI por período
    roiPeriodData() {
      if (!this.bets || this.bets.length === 0) return []

      // Agrupar apostas por período (hoje, semana, mês)
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const todayBets = this.bets.filter(bet => {
        const betDate = new Date(bet.date)
        return betDate.toDateString() === today.toDateString()
      })

      const weekBets = this.bets.filter(bet => {
        const betDate = new Date(bet.date)
        return betDate >= weekAgo
      })

      const monthBets = this.bets.filter(bet => {
        const betDate = new Date(bet.date)
        return betDate >= monthAgo
      })

      // Calcular ROI médio para cada período
      const calculateAverageROI = (bets) => {
        if (bets.length === 0) return 0
        const totalROI = bets.reduce((sum, bet) => sum + (bet.roi || 0), 0)
        return totalROI / bets.length
      }

      return [
        {
          period: 'Hoje',
          roi: calculateAverageROI(todayBets)
        },
        {
          period: 'Semana',
          roi: calculateAverageROI(weekBets)
        },
        {
          period: 'Mês',
          roi: calculateAverageROI(monthBets)
        }
      ]
    }
  },
  mounted() {
    this.fetchSurebets()
    this.loadStoredBets()
    this.startStatusCheckTimer() // Inicia verificação automática de status das apostas

    // Escuta eventos de apostas adicionadas aos relatórios
    emitter.on('bet-added-to-reports', this.handleBetAddedToReports)
  },
  beforeUnmount() {
    this.stopStatusCheckTimer() // Limpa o timer ao destruir o componente
    // Remove listener de eventos
    emitter.off('bet-added-to-reports', this.handleBetAddedToReports)
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
    },
    toggleDataVisibility() {
      this.showData = !this.showData
    },
    getUserDisplayName() {
      if (!this.currentUser) {
        return 'Usuário'
      }

      // Prioridade 1: Nome completo (first_name + last_name)
      if (this.currentUser.first_name && this.currentUser.last_name) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`
      }

      // Prioridade 2: Nome simples
      if (this.currentUser.name) {
        return this.currentUser.name
      }

      // Prioridade 3: Primeiro nome apenas
      if (this.currentUser.first_name) {
        return this.currentUser.first_name
      }

      // Prioridade 4: Username
      if (this.currentUser.username) {
        return this.currentUser.username
      }

      // Fallback: Primeira parte do email
      if (this.currentUser.email) {
        return this.currentUser.email.split('@')[0]
      }

      return 'Usuário'
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
    },
    getSortIcon(field) {
      if (this.sortField !== field) return '↕️'
      return this.sortDirection === 'asc' ? '↑' : '↓'
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    viewBetDetails(bet) {
      this.selectedBet = bet
      this.showBetModal = true
    },
    closeBetModal() {
      this.showBetModal = false
      this.selectedBet = null
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },


    // Traduzir campo market (fallback se a importação falhar)
    translateMarketField(marketText) {
      if (!marketText) return marketText

      const translations = {
        'AH1': 'Handicap Asiático - Casa',
        'AH2': 'Handicap Asiático - Visitante',
        'EH1': 'Handicap Europeu - Casa',
        'EH2': 'Handicap Europeu - Visitante',
        'TO': 'Over',
        'TU': 'Under',
        '1X2': 'Resultado Final',
        'DC': 'Dupla Chance',
        'BTS': 'Ambas Marcam',
        'CS': 'Placar Exato',
        'HT': 'Primeiro Tempo',
        'FT': 'Tempo Completo',
        'Even': 'Total de Gols – Par',
        'Odd': 'Total de Gols – Ímpar',
        'for Team1': 'Casa',
        'for Team2': 'Visitante',
        'Corners': 'Escanteios',
        'YC': 'Cartão Amarelo',
        'RC': 'Cartão Vermelho',
        'FOULS': 'Faltas',
        'OFFSIDES': 'Impedimentos',
        'SHOTS': 'Chutes',
        'POSSESSION': 'Posse de Bola'
      }

      let translatedText = marketText

      // Aplicar todas as substituições do dicionário
      Object.entries(translations).forEach(([original, translation]) => {
        // Usar regex para substituir apenas quando for uma palavra completa
        const regex = new RegExp(`\\b${original}\\b`, 'g')
        translatedText = translatedText.replace(regex, translation)
      })

      return translatedText
    },
    // Busca surebets da API
    async fetchSurebets() {
      try {
        // Obter token de autenticação
        const authToken = this.$store.getters.authToken
        if (!authToken) {
          throw new Error('Token de autenticação não encontrado. Faça login novamente.')
        }

        const response = await fetch('/api/surebets', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        this.surebets = data
      } catch (error) {
        console.error('Erro ao buscar surebets:', error)
      }
    },
    // Carrega apostas armazenadas no localStorage
    loadStoredBets() {
      const storedBets = localStorage.getItem('reports_bets')
      if (storedBets) {
        this.bets = JSON.parse(storedBets)
      } else {
        // Inicializa com array vazio se não há dados armazenados
        this.bets = []
      }
    },
    // Salva apostas no localStorage
    saveBets() {
      localStorage.setItem('reports_bets', JSON.stringify(this.bets))
    },
    // Adiciona um surebet aos relatórios
    addSurebetToReports(surebetId) {
      const surebet = this.surebets[surebetId]
      if (!surebet || surebet.length === 0) return

      const firstBet = surebet[0]
      const houses = surebet.map(bet => bet.house).filter(Boolean)

      // Extrai a data e hora da partida do surebet
      const matchDate = firstBet.date || new Date().toISOString().split('T')[0]
      const matchHour = firstBet.hour || '00:00'

      // Cria a data completa da partida
      const matchDateTime = new Date(`${matchDate}T${matchHour}`)

      const newBet = {
        id: Date.now() + Math.random(), // ID único
        match: firstBet.match || 'Partida não especificada',
        sport: firstBet.sport || 'Esporte não especificado',
        houses: houses,
        market: firstBet.market || 'Mercado não especificado',
        odds: surebet.map(bet => bet.odds).join(' / '),
        stake: 100.00, // Valor padrão
        investment: 100.00, // Valor padrão
        status: 'Em andamento',
        profit: firstBet.profit || 0,
        roi: firstBet.profit || 0,
        date: matchDateTime.toISOString(), // Data e hora de início da partida
        surebetId: surebetId, // Referência ao surebet original
        statusUpdated: false // Flag para controlar notificações
      }

      this.bets.unshift(newBet) // Adiciona no início
      this.saveBets()

      // Mostra notificação
      this.showNotification('Surebet adicionado aos relatórios!')
    },
    // Mostra notificação
    showNotification(message) {
      // Cria elemento de notificação
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      notification.style.cssText = `
         position: fixed;
         top: 100px;
         right: 20px;
         background: var(--accent-primary);
color: var(--text-primary);
         padding: 12px 20px;
         border-radius: 8px;
         font-weight: 600;
         z-index: 10000;
         animation: slideIn 0.3s ease;
       `

      document.body.appendChild(notification)

      // Remove após 3 segundos
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }, 3000)
    },
    // Remove uma aposta dos relatórios
    removeBetFromReports(betId) {
      this.bets = this.bets.filter(bet => bet.id !== betId)
      this.saveBets()
      this.showNotification('Aposta removida dos relatórios!')
    },

    // Excluir aposta com confirmação
    deleteBet(bet) {
      this.betToDelete = bet
      this.showDeleteModal = true
    },

    // Confirmar exclusão
    confirmDelete() {
      if (this.betToDelete) {
        this.bets = this.bets.filter(b => b.id !== this.betToDelete.id)
        this.saveBets()
        this.showNotification('Aposta excluída com sucesso!')

        // Se a página atual ficou vazia, volta para a página anterior
        if (this.paginatedBets.length === 0 && this.currentPage > 1) {
          this.currentPage--
        }
      }
      this.closeDeleteModal()
    },

    // Fechar modal de exclusão
    closeDeleteModal() {
      this.showDeleteModal = false
      this.betToDelete = null
    },

    // Atualizar dados da página
    async refreshData() {
      try {
        console.log('🔄 Atualizando dados...')

        // Mostrar indicador de loading
        const refreshBtn = document.querySelector('.refresh-btn')
        if (refreshBtn) {
          refreshBtn.classList.add('refreshing')
          refreshBtn.disabled = true
        }

        // Ativar loading dos gráficos
        this.isLoadingCharts = true

        // Atualizar surebets da API
        await this.fetchSurebets()

        // Recarregar apostas armazenadas
        this.loadStoredBets()

        // Simular um pequeno delay para mostrar o loading
        await new Promise(resolve => setTimeout(resolve, 500))

        // Resetar paginação
        this.currentPage = 1

        // Mostrar notificação de sucesso
        this.showNotification('✅ Dados atualizados com sucesso!')

        console.log('✅ Dados atualizados com sucesso')

      } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error)
        this.showNotification('❌ Erro ao atualizar dados. Tente novamente.')
      } finally {
        // Desativar loading dos gráficos
        this.isLoadingCharts = false

        // Remover indicador de loading
        const refreshBtn = document.querySelector('.refresh-btn')
        if (refreshBtn) {
          refreshBtn.classList.remove('refreshing')
          refreshBtn.disabled = false
        }
      }
    },
    // Inicia o timer para verificar o status das apostas
    startStatusCheckTimer() {
      this.stopStatusCheckTimer() // Garante que não haja múltiplos timers
      this.statusCheckTimer = setInterval(this.checkBetStatuses, 300000) // Aumentado para 5 minutos (era 60 segundos)
    },
    // Para o timer de status das apostas
    stopStatusCheckTimer() {
      if (this.statusCheckTimer) {
        clearInterval(this.statusCheckTimer)
        this.statusCheckTimer = null
      }
    },

    // Método para verificar o status das apostas e atualizar automaticamente após 3 horas
    checkBetStatuses() {
      const now = new Date()
      const threeHoursInMs = 3 * 60 * 60 * 1000 // 3 horas em milissegundos

      let hasChanges = false

      for (let i = 0; i < this.bets.length; i++) {
        const bet = this.bets[i]

        if (bet.status === 'Em andamento') {
          try {
            // Verifica se a partida já começou há mais de 3 horas
            const matchStartTime = new Date(bet.date)
            const timeSinceMatchStart = now.getTime() - matchStartTime.getTime()

            if (timeSinceMatchStart >= threeHoursInMs) {
              // Atualiza o status para "Finalizado" automaticamente
              this.bets[i] = {
                ...bet,
                status: 'Finalizado',
                profit: bet.profit || 0, // Mantém o lucro atual ou define como 0
                roi: bet.roi || 0 // Mantém o ROI atual ou define como 0
              }

              hasChanges = true

              // Mostra notificação apenas uma vez por aposta
              if (!bet.statusUpdated) {
                this.showNotification(`✅ Partida "${bet.match}" finalizada automaticamente após 3 horas.`)
                this.bets[i].statusUpdated = true
              }
            }
          } catch (error) {
            console.error(`Erro ao verificar status da aposta ${bet.id}:`, error)
          }
        }
      }

      // Salva as mudanças apenas se houve atualizações
      if (hasChanges) {
        this.saveBets()
      }
    },

    // Manipula eventos de apostas adicionadas aos relatórios
    handleBetAddedToReports(newBet) {
      try {
        console.log('📊 Nova aposta adicionada aos relatórios:', newBet)

        // Recarrega as apostas armazenadas para incluir a nova
        this.loadStoredBets()

        // Mostra notificação de sucesso
        this.showNotification(`✅ Aposta "${newBet.match}" adicionada aos relatórios!`)

        // Reset paginação para mostrar a nova aposta
        this.currentPage = 1

      } catch (error) {
        console.error('❌ Erro ao processar nova aposta nos relatórios:', error)
      }
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    recordsPerPage() {
      this.currentPage = 1
    }
  }
}
</script>

<style lang="scss" scoped>
/* Importação removida para evitar conflitos de build */

.reports-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  min-height: 100vh;
  /* Garante altura mínima */
  width: calc(100% - 280px);
  /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px;
  /* Espaço para o sidebar fixo */
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px;
    /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px);
    /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }

  /* Melhorias para responsividade */
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 100%;
    margin-left: 0;

    &.sidebar-collapsed {
      width: 100%;
      max-width: 100%;
      margin-left: 0;
    }
  }
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
  transition: width 0.3s ease;

  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);

  .sidebar.collapsed & {
    justify-content: center;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;

  .logo-icon {
    font-size: 24px;
  }

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }
}

.user-profile {
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);

  .sidebar.collapsed & {
    padding: 20px 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-details {
  flex: 1;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .sidebar.collapsed & {
    justify-content: center;
    padding: 12px 10px;
  }
}

.nav-item.active .nav-link {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* Habilita scroll vertical */
  overflow-x: hidden;
  /* Evita scroll horizontal */
  min-width: 0;
  /* Importante para evitar overflow */
  -webkit-overflow-scrolling: touch;
  /* Scroll suave no iOS */

  /* Melhorias para responsividade */
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  /* Evita que o header encolha */
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-overlay);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.refreshing {
    .refresh-icon {
      animation: spin 1s linear infinite;
    }
  }
}

.refresh-btn {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: var(--bg-primary);

  &:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accent-shadow);
  }

  &.refreshing {
    background: var(--bg-tertiary);
    border-color: var(--border-primary);
    color: var(--text-secondary);
    cursor: not-allowed;

    &:hover {
      background: var(--bg-tertiary);
      transform: none;
    }
  }
}

.control-icon {
  font-size: 16px;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
}

.performance-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px 32px;
  flex-shrink: 0;
  /* Evita que os cards encolham */
}

.user-summary-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 0;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    flex: 1;
  }
}

.visibility-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--bg-hover);
  }
}

.card-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.add-bet-container {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.add-bet-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-primary);
  border: none;
  border-radius: 8px;
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--accent-shadow);

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--accent-shadow);
  }

  &:active {
    transform: translateY(0);
  }
}

.add-bet-icon {
  font-size: 16px;
  font-weight: 700;
}

.add-bet-text {
  font-size: 14px;
  font-weight: 600;
}

.earnings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0;
}

.earning-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
}

.earning-indicator {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.earning-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.earning-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.earning-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-top: auto;
}

.stats-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
  /* Mesma altura da user-summary-card */
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.roi-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0 32px 24px;
  flex-shrink: 0;
  /* Evita que a seção encolha */
  position: relative;
  z-index: 2;
  clear: both;
}

.roi-chart-container,
.roi-period-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
  /* Mesma altura da user-summary-card */
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}


.bets-table-section {
  padding: 0 32px 24px;
  display: flex;
  flex-direction: column;
}

.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
  /* Evita que os controles encolham */
}

.pagination-control {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.records-select {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.search-control {
  .search-input {
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
    width: 200px;

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}

.table-container {
  overflow: auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  min-height: 300px;
  /* Altura mínima para a tabela */
  max-height: 400px;
  /* Altura máxima para a tabela */
  -webkit-overflow-scrolling: touch;
  /* Scroll suave no iOS */

  /* Melhorias para responsividade */
  @media (max-width: 768px) {
    max-height: 350px;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 480px) {
    max-height: 300px;
    min-height: 250px;
  }

  @media (max-width: 320px) {
    max-height: 250px;
    min-height: 200px;
  }
}

.table-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-top: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  flex-shrink: 0;
  /* Evita que o resumo encolha */
}

.table-summary .right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.table-summary .summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-summary .label {
  color: var(--text-secondary);
}

.table-summary .value {
  color: var(--text-primary);
  font-weight: 600;
}

.bets-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  /* Largura mínima para evitar compressão excessiva */

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-primary);
    white-space: nowrap;
    /* Evita quebra de linha */
  }

  th {
    background: var(--bg-primary);
    font-weight: 600;
    color: var(--text-primary);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  td {
    color: var(--text-primary);
  }
}

.sortable {
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--bg-overlay);
  }
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
}

.no-records {
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 40px;
}

.bet-row {
  &:hover {
    background: var(--bg-hover);
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.Finalizado {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }

  &.Em andamento {
    background: var(--warning);
    color: var(--bg-primary);
  }

  &.Cancelado {
    background: var(--error);
    color: var(--text-primary);
  }
}

.profit-positive {
  color: var(--accent-primary);
  font-weight: 600;
}

.profit-negative {
  color: var(--error);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.view-btn {
    color: var(--accent-primary);

    &:hover {
      background: var(--accent-hover);
      transform: scale(1.1);
    }
  }

  &.delete-btn {
    color: var(--error);

    &:hover {
      background: var(--error-hover-bg);
      transform: scale(1.1);
    }
  }
}

.action-icon {
  font-size: 16px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  flex-shrink: 0;
  /* Evita que a paginação encolha */
}

.pagination-btn {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--bg-overlay);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.scroll-spacer {
  height: 50px;
  /* Espaço extra no final para scroll */
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-primary);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: var(--bg-overlay);
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.bet-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-primary);

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
}

/* Modal de Exclusão */
.delete-modal {
  max-width: 500px;
}

.delete-warning {
  text-align: center;
  margin-bottom: 24px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-text {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.warning-details {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.bet-summary {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.bet-summary .summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-primary);

  &:last-child {
    border-bottom: none;
  }
}

.bet-summary .label {
  font-weight: 600;
  color: var(--text-secondary);
}

.bet-summary .value {
  color: var(--text-primary);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--border-primary);
}

.btn-cancel {
  padding: 10px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: var(--bg-overlay);
  }
}

.btn-delete {
  padding: 10px 20px;
  background: var(--error);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: var(--error-hover);
    transform: translateY(-1px);
  }
}

/* Animações para notificações */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Animação de rotação para o botão refresh */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Media queries para telas muito grandes */
@media (min-width: 1400px) {
  .reports-container {
    width: calc(100% - 280px);
    max-width: calc(100% - 280px);
  }

  .content-header {
    padding: 32px 40px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 18px;
  }

  .performance-cards {
    padding: 32px 40px;
    gap: 32px;
  }

  .user-summary-card,
  .chart-container {
    padding: 32px;
  }

  .roi-charts-grid {
    padding: 0 40px 32px;
  }

  .roi-chart-container,
  .roi-period-container {
    padding: 32px;
  }

  .bets-table-section {
    padding: 0 40px 32px;
  }

  .chart-container {
    min-height: 450px;
  }

  .roi-chart-container,
  .roi-period-container {
    min-height: 450px;
  }
}

/* Media queries para telas médias */
@media (min-width: 1200px) and (max-width: 1399px) {
  .content-header {
    padding: 28px 32px;
  }

  .page-title {
    font-size: 32px;
  }

  .performance-cards {
    padding: 28px 32px;
    gap: 24px;
  }

  .roi-charts-section {
    padding: 0 32px 28px;
  }

  .bets-table-section {
    padding: 0 32px 28px;
  }
}

/* Media queries para laptops */
@media (min-width: 1024px) and (max-width: 1199px) {
  .content-header {
    padding: 24px 28px;
  }

  .page-title {
    font-size: 28px;
  }

  .performance-cards {
    padding: 24px 28px;
    gap: 20px;
  }

  .roi-charts-section {
    padding: 0 28px 24px;
  }

  .bets-table-section {
    padding: 0 28px 24px;
  }

  .chart-container {
    min-height: 380px;
  }

  .roi-chart-container,
  .roi-period-container {
    min-height: 380px;
  }
}

/* Media queries para tablets em landscape */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .performance-cards {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .earnings-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Media queries para tablets em portrait */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .performance-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .earnings-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Responsividade melhorada */
@media (max-width: 1023px) {
  .reports-container {
    margin-left: 0;
    /* Remove margem em mobile/tablet */
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 1200px) {
  .performance-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .roi-charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .earnings-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stats-content {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .content-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left .page-title {
    font-size: 24px;
  }

  .header-left .page-subtitle {
    font-size: 14px;
  }

  .header-controls {
    width: 100%;
    justify-content: flex-end;
  }

  .control-btn {
    width: 36px;
    height: 36px;
  }

  .performance-cards {
    padding: 16px 20px;
    gap: 16px;
  }

  .user-summary-card,
  .chart-container {
    padding: 20px;
  }

  .card-header h3 {
    font-size: 16px;
  }

  .card-subtitle {
    font-size: 13px;
  }

  .earnings-grid {
    gap: 12px;
    margin-bottom: 16px;
  }

  .earning-item {
    padding: 10px;
    gap: 10px;
  }

  .earning-indicator {
    width: 6px;
    height: 6px;
  }

  .earning-label {
    font-size: 11px;
  }

  .earning-value {
    font-size: 14px;
  }

  .stats-section {
    padding: 12px;
    gap: 10px;
  }

  .stats-icon {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 14px;
  }

  .add-bet-btn {
    padding: 10px 20px;
    font-size: 13px;
  }

  .add-bet-icon {
    font-size: 14px;
  }

  .chart-container h3,
  .roi-chart-container h3,
  .roi-period-container h3 {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .chart-container {
    min-height: 300px;
  }

  .roi-charts-grid {
    padding: 0 20px 16px;
  }

  .roi-chart-container,
  .roi-period-container {
    padding: 20px;
    min-height: 300px;
  }

  .bets-table-section {
    padding: 0 20px 16px;
  }

  .table-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-control .search-input {
    width: 100%;
  }

  .bets-table {
    font-size: 12px;
    min-width: 800px;
    /* Largura mínima menor para mobile */

    th,
    td {
      padding: 8px 12px;
    }
  }

  .table-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .table-summary .right {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }

  .table-summary .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .modal-content {
    width: 95%;
    max-width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .content-header {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .header-controls {
    gap: 8px;
  }

  .control-btn {
    width: 32px;
    height: 32px;
  }

  .performance-cards {
    padding: 12px 16px;
    gap: 12px;
  }

  .user-summary-card,
  .chart-container {
    padding: 16px;
  }

  .card-header h3 {
    font-size: 14px;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .earnings-grid {
    gap: 8px;
    margin-bottom: 12px;
  }

  .earning-item {
    padding: 8px;
    gap: 8px;
  }

  .earning-indicator {
    width: 5px;
    height: 5px;
  }

  .earning-label {
    font-size: 10px;
  }

  .earning-value {
    font-size: 12px;
  }

  .stats-section {
    padding: 10px;
    gap: 8px;
  }

  .stats-icon {
    font-size: 16px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-value {
    font-size: 12px;
  }

  .add-bet-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .add-bet-icon {
    font-size: 12px;
  }

  .chart-container h3,
  .roi-chart-container h3,
  .roi-period-container h3 {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .chart-container {
    min-height: 250px;
  }

  .roi-charts-grid {
    padding: 0 16px 12px;
  }

  .roi-chart-container,
  .roi-period-container {
    padding: 16px;
    min-height: 250px;
  }

  .bets-table-section {
    padding: 0 16px 12px;
  }

  .table-controls {
    gap: 12px;
  }

  .pagination-control label {
    font-size: 12px;
  }

  .records-select {
    padding: 6px 8px;
    font-size: 12px;
  }

  .search-input {
    padding: 6px 8px;
    font-size: 12px;
  }

  .bets-table {
    min-width: 600px;
    /* Largura mínima ainda menor para telas muito pequenas */
    font-size: 10px;

    th,
    td {
      padding: 4px 6px;
    }
  }

  .table-summary {
    padding: 8px 12px;
    font-size: 12px;
  }

  .table-summary .summary-item {
    gap: 2px;
  }

  .pagination {
    gap: 8px;
  }

  .pagination-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .page-info {
    font-size: 12px;
  }

  .modal-content {
    width: 98%;
    max-width: 98%;
    margin: 5px;
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-header h3 {
    font-size: 14px;
  }

  .modal-body {
    padding: 16px;
  }

  .detail-row {
    padding: 8px 0;
  }

  .detail-label {
    font-size: 12px;
  }

  .detail-value {
    font-size: 12px;
  }

  .action-btn {
    padding: 4px;
  }

  .action-icon {
    font-size: 14px;
  }

  .status-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .btn-cancel,
  .btn-delete {
    padding: 8px 16px;
    font-size: 12px;
  }
}

/* Media queries para telas muito pequenas */
@media (max-width: 320px) {
  .content-header {
    padding: 8px 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .performance-cards {
    padding: 8px 12px;
    gap: 8px;
  }

  .user-summary-card,
  .chart-container {
    padding: 12px;
  }

  .card-header h3 {
    font-size: 13px;
  }

  .card-subtitle {
    font-size: 11px;
  }

  .earnings-grid {
    gap: 6px;
    margin-bottom: 8px;
  }

  .earning-label {
    font-size: 9px;
  }

  .earning-value {
    font-size: 11px;
  }

  .stats-grid {
    gap: 6px;
  }

  .stat-label {
    font-size: 9px;
  }

  .stat-value {
    font-size: 11px;
  }

  .chart-container h3,
  .roi-chart-container h3,
  .roi-period-container h3 {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .chart-container {
    min-height: 220px;
  }

  .roi-charts-grid {
    padding: 0 12px 8px;
  }

  .roi-chart-container,
  .roi-period-container {
    padding: 12px;
    min-height: 220px;
  }

  .bets-table-section {
    padding: 0 12px 8px;
  }

  .bets-table {
    min-width: 500px;
    font-size: 9px;

    th,
    td {
      padding: 3px 4px;
    }
  }

  .table-summary {
    padding: 6px 8px;
    font-size: 11px;
  }

  .pagination-btn {
    padding: 6px 12px;
    font-size: 11px;
  }

  .page-info {
    font-size: 11px;
  }

  .modal-content {
    width: 99%;
    max-width: 99%;
    margin: 2px;
  }

  .modal-header {
    padding: 8px 12px;
  }

  .modal-header h3 {
    font-size: 13px;
  }

  .modal-body {
    padding: 12px;
  }

  .detail-row {
    padding: 6px 0;
  }

  .detail-label {
    font-size: 11px;
  }

  .detail-value {
    font-size: 11px;
  }

  .action-btn {
    padding: 3px;
  }

  .action-icon {
    font-size: 12px;
  }

  .status-badge {
    font-size: 9px;
    padding: 1px 4px;
  }

  .btn-cancel,
  .btn-delete {
    padding: 6px 12px;
    font-size: 11px;
  }
}

/* Estilos específicos para o modo light */
[data-theme="light"] .reports-container {
  background: var(--bg-primary);
  color: var(--text-primary);
}

[data-theme="light"] .page-title {
  color: var(--accent-primary);
}

[data-theme="light"] .page-subtitle {
  color: var(--text-secondary);
}

[data-theme="light"] .content-header {
  background: var(--bg-primary);
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .control-btn {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="light"] .control-btn:hover {
  background: var(--bg-overlay);
}

[data-theme="light"] .refresh-btn {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

[data-theme="light"] .refresh-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

[data-theme="light"] .refresh-btn:focus {
  box-shadow: 0 0 0 2px var(--accent-shadow);
}

[data-theme="light"] .refresh-btn.refreshing {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

[data-theme="light"] .performance-cards {
  background: var(--bg-primary);
}

[data-theme="light"] .user-summary-card,
[data-theme="light"] .chart-container,
[data-theme="light"] .roi-chart-container,
[data-theme="light"] .roi-period-container {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="light"] .add-bet-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);
  box-shadow: 0 2px 8px var(--accent-shadow);
}

[data-theme="light"] .add-bet-btn:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px var(--accent-shadow);
}

[data-theme="light"] .earning-item {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
}

[data-theme="light"] .earning-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

[data-theme="light"] .earning-indicator {
  background: var(--accent-primary);
}

[data-theme="light"] .stats-section {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
}

[data-theme="light"] .card-header h3 {
  color: var(--text-primary);
}

[data-theme="light"] .card-subtitle {
  color: var(--text-secondary);
}

[data-theme="light"] .earning-label,
[data-theme="light"] .stat-label {
  color: var(--text-secondary);
}

[data-theme="light"] .earning-value {
  color: var(--accent-primary);
}

[data-theme="light"] .stat-value {
  color: var(--text-primary);
}

[data-theme="light"] .chart-container h3,
[data-theme="light"] .roi-chart-container h3,
[data-theme="light"] .roi-period-container h3 {
  color: var(--text-primary);
}

[data-theme="light"] .table-controls {
  background: var(--bg-primary);
}

[data-theme="light"] .records-select {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="light"] .records-select:focus {
  border-color: var(--accent-primary);
}

[data-theme="light"] .search-input {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="light"] .search-input:focus {
  border-color: var(--accent-primary);
}

[data-theme="light"] .search-input::placeholder {
  color: var(--text-tertiary);
}

[data-theme="light"] .table-container {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="light"] .bets-table th {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .bets-table td {
  color: var(--text-primary);
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .sortable:hover {
  background: var(--bg-overlay);
}

[data-theme="light"] .no-records {
  color: var(--text-tertiary);
}

[data-theme="light"] .bet-row:hover {
  background: var(--bg-hover);
}

[data-theme="light"] .status-badge.Finalizado {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

[data-theme="light"] .status-badge.Em\ andamento {
  background: var(--warning-color);
  color: var(--bg-primary);
}

[data-theme="light"] .status-badge.Cancelado {
  background: var(--error-color);
  color: var(--bg-primary);
}

[data-theme="light"] .profit-positive {
  color: var(--accent-primary);
}

[data-theme="light"] .profit-negative {
  color: var(--error-color);
}

[data-theme="light"] .action-btn.view-btn {
  color: var(--accent-primary);
}

[data-theme="light"] .action-btn.view-btn:hover {
  background: var(--accent-hover-bg);
}

[data-theme="light"] .action-btn.delete-btn {
  color: var(--error-color);
}

[data-theme="light"] .action-btn.delete-btn:hover {
  background: var(--error-hover-bg);
}

[data-theme="light"] .action-btn.delete-btn {
  &:hover {
    background: var(--error-hover-bg);
  }
}

[data-theme="light"] .pagination-btn {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="light"] .pagination-btn:hover:not(:disabled) {
  background: var(--bg-overlay);
}

[data-theme="light"] .page-info {
  color: var(--text-secondary);
}

[data-theme="light"] .table-summary {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

[data-theme="light"] .table-summary .label {
  color: var(--text-secondary);
}

[data-theme="light"] .table-summary .value {
  color: var(--text-primary);
}

[data-theme="light"] .modal-content {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="light"] .modal-header {
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .modal-header h3 {
  color: var(--text-primary);
}

[data-theme="light"] .modal-close {
  color: var(--text-primary);
}

[data-theme="light"] .modal-close:hover {
  background: var(--bg-overlay);
}

[data-theme="light"] .detail-row {
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .detail-label {
  color: var(--text-secondary);
}

[data-theme="light"] .detail-value {
  color: var(--text-primary);
}

[data-theme="light"] .bet-summary {
  background: var(--bg-tertiary);
}

[data-theme="light"] .bet-summary .summary-item {
  border-bottom-color: var(--border-primary);
}

[data-theme="light"] .bet-summary .label {
  color: var(--text-secondary);
}

[data-theme="light"] .bet-summary .value {
  color: var(--text-primary);
}

[data-theme="light"] .modal-footer {
  border-top-color: var(--border-primary);
}

[data-theme="light"] .btn-cancel {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="light"] .btn-cancel:hover {
  background: var(--bg-overlay);
}

[data-theme="light"] .btn-delete {
  background: var(--error-color);
  color: var(--bg-primary);
}

[data-theme="light"] .btn-delete:hover {
  background: var(--error-hover);
}

/* Melhorias adicionais para o modo light */
[data-theme="light"] .visibility-toggle {
  color: var(--text-primary);
}

[data-theme="light"] .visibility-toggle:hover {
  background: var(--bg-overlay);
}

[data-theme="light"] .pagination-control label {
  color: var(--text-secondary);
}

[data-theme="light"] .search-control {
  background: var(--bg-primary);
}

[data-theme="light"] .table-summary .left {
  color: var(--text-secondary);
}

[data-theme="light"] .table-summary .right {
  background: var(--bg-primary);
}

[data-theme="light"] .modal-overlay {
  background: var(--modal-overlay);
}

[data-theme="light"] .warning-text strong {
  color: var(--text-primary);
}

[data-theme="light"] .warning-details {
  color: var(--text-secondary);
}

[data-theme="light"] .earning-item,
[data-theme="light"] .stat-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 12px;
}

[data-theme="light"] .earning-item:hover,
[data-theme="light"] .stat-item:hover {
  background: var(--bg-overlay);
  border-color: var(--accent-primary);
}

[data-theme="light"] .chart-container,
[data-theme="light"] .roi-chart-container,
[data-theme="light"] .roi-period-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
}

[data-theme="light"] .action-buttons {
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 4px;
}

[data-theme="light"] .action-btn {
  border-radius: 6px;
}

[data-theme="light"] .action-btn:hover {
  transform: scale(1.1);
  transition: all 0.2s ease;
}

[data-theme="light"] .sort-icon {
  color: var(--text-secondary);
}

[data-theme="light"] .sortable:hover .sort-icon {
  color: var(--accent-primary);
}

[data-theme="light"] .scroll-spacer {
  background: var(--bg-primary);
}

/* Melhorias para responsividade no modo light */
@media (max-width: 768px) {
  [data-theme="light"] .performance-cards {
    background: var(--bg-primary);
  }

  [data-theme="light"] .roi-chart-section {
    background: var(--bg-primary);
  }

  [data-theme="light"] .bets-table-section {
    background: var(--bg-primary);
  }
}

@media (max-width: 480px) {
  [data-theme="light"] .content-header {
    background: var(--bg-primary);
  }

  [data-theme="light"] .table-controls {
    background: var(--bg-primary);
  }
}

/* Melhorias adicionais para elementos específicos no modo light */
[data-theme="light"] .status-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
}

[data-theme="light"] .status-badge.Finalizado {
  box-shadow: 0 2px 4px var(--accent-shadow);
}

[data-theme="light"] .status-badge.Em\ andamento {
  box-shadow: 0 2px 4px var(--warning-shadow);
}

[data-theme="light"] .status-badge.Cancelado {
  box-shadow: 0 2px 4px var(--error-shadow);
}

/* Melhorias para botões de ação específicos no modo light */
[data-theme="light"] .action-btn.view-btn:hover {
  background: var(--accent-hover-bg);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 8px var(--accent-shadow);
}

[data-theme="light"] .action-btn.delete-btn:hover {
  background: var(--error-hover-bg);
  border-color: var(--error-color);
  box-shadow: 0 2px 8px var(--error-shadow);
}

/* Melhorias para paginação no modo light */
[data-theme="light"] .pagination-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 8px var(--accent-shadow);
}

[data-theme="light"] .pagination-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  border-color: var(--border-primary);
  cursor: not-allowed;
}

/* Melhorias para campos de entrada no modo light */
[data-theme="light"] .search-input:hover,
[data-theme="light"] .records-select:hover {
  border-color: var(--accent-primary);
  background: var(--bg-primary);
}

/* Melhorias para o botão de refresh no modo light */
[data-theme="light"] .refresh-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  box-shadow: 0 4px 12px var(--accent-shadow);
  transform: translateY(-2px);
}

[data-theme="light"] .refresh-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Melhorias para o toggle de visibilidade no modo light */
[data-theme="light"] .visibility-toggle {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

[data-theme="light"] .visibility-toggle:hover {
  background: var(--accent-hover-bg);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

/* Melhorias para o resumo da tabela no modo light */
[data-theme="light"] .table-summary {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border: 1px solid var(--border-primary);
}

[data-theme="light"] .table-summary .summary-item {
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

[data-theme="light"] .table-summary .summary-item:hover {
  background: var(--accent-hover-bg);
  transform: translateX(4px);
}

/* Melhorias para modais no modo light */
[data-theme="light"] .modal-overlay {
  backdrop-filter: blur(8px);
}

[data-theme="light"] .modal-content {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

[data-theme="light"] .modal-header {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
}

[data-theme="light"] .modal-close:hover {
  background: var(--error-hover-bg);
  border-color: var(--error-color);
  color: var(--error-color);
}

/* Melhorias para botões de modal no modo light */
[data-theme="light"] .btn-delete:hover {
  background: var(--error-hover);
  box-shadow: 0 4px 12px var(--error-shadow);
  transform: translateY(-2px);
}

[data-theme="light"] .btn-delete:active {
  transform: translateY(0) scale(0.95);
}

[data-theme="light"] .btn-cancel:hover {
  background: var(--bg-overlay);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Melhorias para acessibilidade no modo light */
[data-theme="light"] .sortable:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  background: var(--accent-hover-bg);
}

[data-theme="light"] .sortable:hover {
  background: var(--accent-hover-bg);
}

/* Melhorias para o estado de loading no modo light */
[data-theme="light"] .refresh-btn.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Melhorias para notificações no modo light */
[data-theme="light"] .notification {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--bg-primary);
  box-shadow: 0 8px 25px var(--accent-shadow);
  border: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
}

/* Melhorias para estados de hover mais refinados no modo light */
[data-theme="light"] .user-summary-card:hover,
[data-theme="light"] .chart-container:hover,
[data-theme="light"] .roi-chart-container:hover,
[data-theme="light"] .roi-period-container:hover {
  box-shadow: 0 8px 25px var(--shadow-color);
  transform: translateY(-3px);
  border-color: var(--accent-primary);
}

[data-theme="light"] .table-container:hover {
  box-shadow: 0 8px 25px var(--shadow-color);
  border-color: var(--accent-primary);
}

[data-theme="light"] .bet-row:hover {
  background: var(--accent-hover-bg);
  border-left: 3px solid var(--accent-primary);
}

/* Melhorias para contraste e legibilidade no modo light */
[data-theme="light"] .page-title {
  text-shadow: 0 1px 2px var(--text-shadow);
}

[data-theme="light"] .earning-value {
  text-shadow: 0 1px 2px var(--accent-shadow);
}

[data-theme="light"] .stat-value {
  text-shadow: 0 1px 2px var(--text-shadow);
}

[data-theme="light"] .profit-positive {
  text-shadow: 0 1px 2px var(--accent-shadow);
}

[data-theme="light"] .profit-negative {
  text-shadow: 0 1px 2px var(--error-shadow);
}
</style>
