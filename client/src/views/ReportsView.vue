<template>
  <div class="reports-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo e Header -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">👑</span>
          <h1 v-show="!sidebarCollapsed">SureStake</h1>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span v-if="sidebarCollapsed">☰</span>
          <span v-else>☰</span>
        </button>
      </div>

      <!-- Perfil do Usuário -->
      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details" v-show="!sidebarCollapsed">
            <p class="user-greeting">Olá, viniciius@live.com</p>
            <div class="user-status"> 
              <span class="status-dot"></span>
              <span class="status-text">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu de Navegação -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: $route.path === '/' }">
            <router-link to="/" class="nav-link" :title="sidebarCollapsed ? 'Dashboard' : ''">
              <span class="nav-icon">🏠</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/reports' }">
            <router-link to="/reports" class="nav-link" :title="sidebarCollapsed ? 'Relatórios' : ''">
              <span class="nav-icon">📊</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Relatórios</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/settings' }">
            <router-link to="/settings" class="nav-link" :title="sidebarCollapsed ? 'Configurações' : ''">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Configurações</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Relatórios</h2>
          <p class="page-subtitle">Análise detalhada de performance e ganhos</p>
        </div>
        
        <div class="header-right">
          <div class="header-controls">
            <button class="control-btn" @click="toggleTheme">
              <span class="control-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
            </button>
            <button class="control-btn">
              <span class="control-icon">🌐</span>
            </button>
          </div>
        </div>
      </header>

             <!-- Cards de Performance -->
       <div class="performance-cards">
         <!-- Card de Resumo do Usuário -->
         <div class="user-summary-card">
           <div class="card-header">
             <h3>Olá, viniciius@live.com</h3>
             <button class="visibility-toggle" @click="toggleDataVisibility">
               <span class="visibility-icon">{{ showData ? '👁️' : '🙈' }}</span>
             </button>
           </div>
           <p class="card-subtitle">Veja abaixo sua performance de ganhos detalhados.</p>
           
           <div class="earnings-grid">
             <div class="earning-item">
               <span class="earning-label">Ganhos de hoje:</span>
               <span class="earning-value">{{ showData ? formatCurrency(todayEarnings) : '***' }}</span>
             </div>
             <div class="earning-item">
               <span class="earning-label">Ganhos da semana:</span>
               <span class="earning-value">{{ showData ? formatCurrency(weekEarnings) : '***' }}</span>
             </div>
             <div class="earning-item">
               <span class="earning-label">Ganhos do mês:</span>
               <span class="earning-value">{{ showData ? formatCurrency(monthEarnings) : '***' }}</span>
             </div>
             <div class="earning-item">
               <span class="earning-label">Ganhos totais:</span>
               <span class="earning-value">{{ showData ? formatCurrency(totalEarnings) : '***' }}</span>
             </div>
           </div>
           
           <div class="stats-grid">
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

         <!-- Card do Gráfico Principal -->
         <div class="chart-card">
           <h3>Evolução do Lucro Acumulado</h3>
           <div class="chart-container">
             <ProfitEvolutionChart :bets="bets" />
           </div>
         </div>
       </div>

       <!-- Gráfico de ROI por Aposta -->
       <div class="roi-chart-section">
         <div class="roi-chart-card">
           <h3>ROI por Aposta (Últimas 10)</h3>
           <div class="roi-chart-container">
             <ROIBarChart :bets="bets" />
           </div>
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
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Buscar..." 
              class="search-input"
            />
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
                  <button class="action-btn" @click="viewBetDetails(bet)">
                    <span class="action-icon">👁️</span>
                  </button>
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
              <span :class="['value', pageTotals.profit >= 0 ? 'profit-positive' : 'profit-negative']">{{ formatCurrency(pageTotals.profit) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">ROI médio (página):</span>
              <span class="value">{{ pageAverageRoi.toFixed(2) }}%</span>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div class="pagination" v-if="filteredBets.length > 0">
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Anterior
          </button>
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Próximo
          </button>
        </div>
      </div>
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
  </div>
</template>

<script>
import ProfitEvolutionChart from '../components/ProfitEvolutionChart.vue'
import ROIBarChart from '../components/ROIBarChart.vue'

export default {
  name: 'ReportsView',
  components: {
    ProfitEvolutionChart,
    ROIBarChart
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
      // Dados dos surebets da API
      surebets: {},
      // Dados das apostas processadas para relatórios
      bets: []
    }
  },
  computed: {
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
    }
  },
  mounted() {
    this.fetchSurebets()
    this.loadStoredBets()
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
    },
    toggleDataVisibility() {
      this.showData = !this.showData
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
    // Busca surebets da API
    async fetchSurebets() {
      try {
        const response = await fetch('/api/surebets')
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
       }
       
       // Se não há dados, adiciona alguns dados de teste para demonstrar os gráficos
       if (this.bets.length === 0) {
         this.bets = [
           {
             id: 1,
             match: 'Flamengo vs Palmeiras',
             sport: 'Futebol',
             houses: ['Bet365', 'Pinnacle'],
             market: 'Resultado Final',
             odds: '2.15 / 3.40',
             stake: 100.00,
             investment: 100.00,
             status: 'Finalizado',
             profit: 15.00,
             roi: 15.0,
             date: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
           },
           {
             id: 2,
             match: 'São Paulo vs Santos',
             sport: 'Futebol',
             houses: ['Betfair', 'Betway'],
             market: 'Over/Under 2.5',
             odds: '1.85 / 2.05',
             stake: 50.00,
             investment: 50.00,
             status: 'Em andamento',
             profit: -10.00,
             roi: -20.0,
             date: new Date(Date.now() - 43200000).toISOString() // 12 horas atrás
           },
           {
             id: 3,
             match: 'Corinthians vs Vasco',
             sport: 'Futebol',
             houses: ['Bet365', 'Betfair'],
             market: 'Ambas Marcam',
             odds: '1.95 / 1.85',
             stake: 75.00,
             investment: 75.00,
             status: 'Finalizado',
             profit: 25.00,
             roi: 33.3,
             date: new Date().toISOString() // Agora
           }
         ]
         this.saveBets()
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
        date: new Date().toISOString(),
        surebetId: surebetId // Referência ao surebet original
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
         background: #00ff88;
         color: #1a1a1a;
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
.reports-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
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
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }
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
}

.control-icon {
  font-size: 16px;
}

.performance-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px 32px;
}

.user-summary-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
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
  
  &:hover {
    background: var(--bg-hover);
  }
}

.card-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.earnings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.earning-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.earning-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.earning-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px 0;
  }
}

 .chart-container {
   height: 300px;
 }

 .roi-chart-section {
   padding: 0 32px 24px;
 }

 .roi-chart-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px 0;
  }
}

 .roi-chart-container {
   height: 400px;
 }

.bets-table-section {
  flex: 1;
  padding: 0 32px 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
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
  flex: 1;
  overflow: auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
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
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-primary);
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

.action-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: var(--accent-hover);
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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
  color: #ffffff;
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
    background: #404040;
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
  border-bottom: 1px solid #404040;
  
  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-weight: 600;
  color: #b0b0b0;
}

.detail-value {
  color: #ffffff;
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

@media (max-width: 768px) {
  .performance-cards {
    grid-template-columns: 1fr;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-control .search-input {
    width: 100%;
  }
  
  .bets-table {
    font-size: 12px;
    
    th, td {
      padding: 8px 12px;
    }
  }
}
</style>
