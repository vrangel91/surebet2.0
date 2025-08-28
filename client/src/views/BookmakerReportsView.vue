<template>
  <div class="reports-container">
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
      <div class="reports-header">
        <h1 class="reports-title">
          <svg class="reports-icon" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1h1.5V1.5a.5.5 0 0 1 1 0V7H15a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5H1V1.5a.5.5 0 0 1 1 0V7h1.5a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 0 8V.5a.5.5 0 0 1 .222-.415zM4.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM9 1.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM9.5 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM9 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM9.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM9 9.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
          </svg>
          Relatórios de Contas
        </h1>
        <p class="reports-subtitle">Acompanhe o histórico de suas contas de casas de apostas</p>
      </div>

      <!-- Estatísticas Gerais -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-number">{{ reports.length }}</span>
          <span class="stat-label">Total de Relatórios</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ formatCurrency(totalAmount) }}</span>
          <span class="stat-label">Valor Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ activeReports }}</span>
          <span class="stat-label">Relatórios Ativos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ uniqueBookmakers }}</span>
          <span class="stat-label">Casas Únicas</span>
        </div>
      </div>

      <!-- Filtros e Busca -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar por casa de apostas..."
            class="search-input"
          >
        </div>
        <div class="filter-options">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <select v-model="currencyFilter" class="filter-select">
            <option value="">Todas as Moedas</option>
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <!-- Lista de Relatórios -->
      <div class="reports-section">
        <h3>Relatórios de Contas</h3>
        
        <div v-if="filteredReports.length === 0" class="no-reports">
          <p>Nenhum relatório encontrado.</p>
          <p>Adicione contas aos relatórios na página de Gerenciamento de Contas.</p>
        </div>
        
        <div v-else class="reports-grid">
          <div 
            v-for="report in filteredReports" 
            :key="report.id" 
            class="report-card"
            :class="{ inactive: report.status !== 'active' }"
          >
            <div class="report-header">
              <div class="report-info">
                <h4 class="bookmaker-name">{{ report.bookmaker_name }}</h4>
                <span class="report-status" :class="report.status">
                  {{ getStatusText(report.status) }}
                </span>
              </div>
              <div class="report-actions">
                <button @click="viewReportDetails(report)" class="action-btn view" title="Ver detalhes">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                </button>
                <button @click="deleteReport(report)" class="action-btn delete" title="Excluir relatório">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="report-amount">
              <span class="amount-label">Valor:</span>
              <span class="amount-value">{{ formatCurrency(report.amount) }}</span>
            </div>
            
            <div class="report-details">
              <div class="detail-item">
                <span class="detail-label">Moeda:</span>
                <span class="detail-value">{{ report.currency }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Data:</span>
                <span class="detail-value">{{ formatDate(report.date) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">{{ getTypeText(report.type) }}</span>
              </div>
            </div>
            
            <div class="report-description" v-if="report.description">
              <span class="description-label">Descrição:</span>
              <p class="description-text">{{ report.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Detalhes -->
      <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Detalhes do Relatório - {{ selectedReport?.bookmaker_name }}</h3>
            <button @click="closeDetailsModal" class="close-btn">×</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Casa de Apostas:</span>
              <span class="detail-value">{{ selectedReport?.bookmaker_name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Valor:</span>
              <span class="detail-value amount">{{ formatCurrency(selectedReport?.amount) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Moeda:</span>
              <span class="detail-value">{{ selectedReport?.currency }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data:</span>
              <span class="detail-value">{{ formatDateTime(selectedReport?.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status" :class="selectedReport?.status">
                {{ getStatusText(selectedReport?.status) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">{{ getTypeText(selectedReport?.type) }}</span>
            </div>
            <div class="detail-row" v-if="selectedReport?.description">
              <span class="detail-label">Descrição:</span>
              <span class="detail-value">{{ selectedReport?.description }}</span>
            </div>
            <div class="detail-row" v-if="selectedReport?.balance_before !== undefined">
              <span class="detail-label">Saldo Anterior:</span>
              <span class="detail-value">{{ formatCurrency(selectedReport?.balance_before) }}</span>
            </div>
            <div class="detail-row" v-if="selectedReport?.balance_after !== undefined">
              <span class="detail-label">Saldo Posterior:</span>
              <span class="detail-value">{{ formatCurrency(selectedReport?.balance_after) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Sidebar from '../components/Sidebar.vue'

export default {
  name: 'BookmakerReportsView',
  components: {
    Sidebar
  },
  
  data() {
    return {
      sidebarCollapsed: false,
      reports: [],
      searchTerm: '',
      statusFilter: '',
      currencyFilter: '',
      showDetailsModal: false,
      selectedReport: null
    }
  },
  
  computed: {
    ...mapGetters([
      'isAdmin',
      'userCredits',
      'canUseSystem'
    ]),
    
    filteredReports() {
      let filtered = this.reports
      
      // Filtro por busca
      if (this.searchTerm) {
        filtered = filtered.filter(report => 
          report.bookmaker_name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      // Filtro por status
      if (this.statusFilter) {
        filtered = filtered.filter(report => report.status === this.statusFilter)
      }
      
      // Filtro por moeda
      if (this.currencyFilter) {
        filtered = filtered.filter(report => report.currency === this.currencyFilter)
      }
      
      return filtered
    },
    
    totalAmount() {
      return this.reports.reduce((total, report) => {
        return total + parseFloat(report.amount || 0)
      }, 0)
    },
    
    activeReports() {
      return this.reports.filter(report => report.status === 'active').length
    },
    
    uniqueBookmakers() {
      const bookmakers = new Set(this.reports.map(report => report.bookmaker_name))
      return bookmakers.size
    }
  },
  
  mounted() {
    this.loadReports()
  },
  
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    openGlossary() {
      // Implementar se necessário
    },
    
    loadReports() {
      try {
        const storedReports = localStorage.getItem('bookmaker_accounts_reports')
        if (storedReports) {
          this.reports = JSON.parse(storedReports)
        }
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error)
        this.reports = []
      }
    },
    
    viewReportDetails(report) {
      this.selectedReport = report
      this.showDetailsModal = true
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedReport = null
    },
    
    deleteReport(report) {
      if (confirm('Tem certeza que deseja excluir este relatório?')) {
        const index = this.reports.findIndex(r => r.id === report.id)
        if (index !== -1) {
          this.reports.splice(index, 1)
          localStorage.setItem('bookmaker_accounts_reports', JSON.stringify(this.reports))
        }
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        active: 'Ativo',
        inactive: 'Inativo'
      }
      return statusMap[status] || status
    },
    
    getTypeText(type) {
      const typeMap = {
        report_addition: 'Adição aos Relatórios',
        manual_adjustment: 'Ajuste Manual'
      }
      return typeMap[type] || type
    },
    
    formatCurrency(value) {
      if (!value && value !== 0) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleDateString('pt-BR')
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'Nunca'
      return new Date(dateString).toLocaleString('pt-BR')
    }
  }
}
</script>

<style scoped>
.reports-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: visible;
  position: relative;
  width: 100%;
  align-items: stretch;
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: 0;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.reports-header {
  text-align: center;
  margin-bottom: 32px;
}

.reports-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.reports-icon {
  width: 36px;
  height: 36px;
  color: #007bff;
  filter: drop-shadow(0 0 10px rgba(0, 123, 255, 0.5));
}

.reports-subtitle {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
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
  color: #007bff;
  margin-bottom: 8px;
}

.stat-label {
  color: #cccccc;
  font-size: 14px;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
}

.filter-options {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  min-width: 120px;
}

.reports-section {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
}

.reports-section h3 {
  color: #ffffff;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
}

.no-reports {
  text-align: center;
  padding: 40px;
  color: #cccccc;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 123, 255, 0.3);
}

.report-card.inactive {
  opacity: 0.6;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.report-info {
  flex: 1;
  min-width: 0;
}

.bookmaker-name {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.report-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.report-status.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.report-status.inactive {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.action-btn.view {
  color: #007bff;
}

.action-btn.view:hover {
  background: rgba(0, 123, 255, 0.2);
}

.action-btn.delete {
  color: #ff4757;
}

.action-btn.delete:hover {
  background: rgba(255, 71, 87, 0.2);
}

.report-amount {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-label {
  color: #cccccc;
  font-size: 14px;
}

.amount-value {
  color: #007bff;
  font-size: 24px;
  font-weight: 700;
}

.report-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #cccccc;
  font-size: 14px;
}

.detail-value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.report-description {
  margin-bottom: 16px;
}

.description-label {
  color: #cccccc;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.description-text {
  color: #ffffff;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

/* Modal Styles */
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
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-row .detail-label {
  color: #cccccc;
  font-weight: 500;
}

.detail-row .detail-value {
  color: #ffffff;
  font-weight: 600;
  text-align: right;
}

.detail-row .detail-value.amount {
  color: #007bff;
}

.detail-row .detail-value.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.detail-row .detail-value.status.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.detail-row .detail-value.status.inactive {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-options {
    justify-content: space-between;
  }
  
  .reports-title {
    font-size: 24px;
    flex-direction: column;
    gap: 8px;
  }
  
  .reports-icon {
    width: 28px;
    height: 28px;
  }
}
</style>
