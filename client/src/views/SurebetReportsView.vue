<template>
  <div class="surebet-reports-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Reutilizável -->
    <Sidebar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded" />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />

      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">{{ config.texts.pageTitle }}</h2>
          <p class="page-subtitle">{{ config.texts.pageSubtitle }}</p>
        </div>
        <div class="header-right">
          <button @click="refreshReports" class="btn btn-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path
                d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
            {{ config.texts.refreshButton }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="reports-main">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ reports.length }}</h3>
              <p class="stat-label">{{ config.texts.totalReports }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ pendingReports }}</h3>
              <p class="stat-label">{{ config.texts.pendingReports }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ totalProfit }}</h3>
              <p class="stat-label">{{ config.texts.totalProfit }}</p>
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div class="reports-section">
          <div class="section-header">
            <h3 class="section-title">{{ config.texts.reportsSectionTitle }}</h3>
            <div class="section-actions">
              <select v-model="statusFilter" class="form-select">
                <option v-for="option in config.statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!Array.isArray(reports) || reports.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <h3 class="empty-title">{{ config.texts.emptyStateTitle }}</h3>
            <p class="empty-description">
              {{ config.texts.emptyStateDescription }}
            </p>
          </div>

          <!-- Reports List -->
          <div v-else class="reports-list">
            <div v-for="report in filteredReports" :key="report.id" class="report-card" :class="{
              'report-pending': report.status === 'pending',
              'report-completed': report.status === 'completed',
              'report-cancelled': report.status === 'cancelled'
            }">
              <div class="report-header">
                <div class="report-info">
                  <h4 class="report-title">{{ report.surebet[0]?.match || config.texts.gameNotIdentified }}</h4>
                  <p class="report-date">{{ formatDate(report.timestamp) }}</p>
                </div>
                <div class="report-status">
                  <span class="status-badge" :class="{
                    'status-pending': report.status === 'pending',
                    'status-completed': report.status === 'completed',
                    'status-cancelled': report.status === 'cancelled'
                  }">
                    {{ getStatusText(report.status) }}
                  </span>
                </div>
              </div>

              <div class="report-details">
                <div class="detail-item">
                  <span class="detail-label">{{ config.texts.totalInvestment }}</span>
                  <span class="detail-value">{{ formatCurrency(report.totalInvestment) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ config.texts.expectedProfit }}</span>
                  <span class="detail-value">{{ formatCurrency(report.expectedProfit) }}</span>
                </div>
                <div v-if="report.status === 'completed'" class="detail-item">
                  <span class="detail-label">{{ config.texts.actualProfit }}</span>
                  <span class="detail-value"
                    :class="{ 'profit-positive': report.actualProfit > 0, 'profit-negative': report.actualProfit < 0 }">
                    {{ formatCurrency(report.actualProfit) }}
                  </span>
                </div>
              </div>

              <!-- Apostas -->
              <div class="bets-section">
                <h5 class="bets-title">{{ config.texts.betsPerformed }}</h5>
                <div class="bets-list">
                  <div v-for="(bet, index) in report.surebet" :key="index" class="bet-item">
                    <div class="bet-info">
                      <span class="bet-house">{{ bet.house }}</span>
                      <span class="bet-market">{{ bet.market }}</span>
                      <span class="bet-odds">{{ bet.chance }}</span>
                    </div>
                    <div class="bet-amount">
                      <span class="bet-stake">{{ formatCurrency(report.stakes[index]) }}</span>
                      <span v-if="report.status === 'completed'" class="bet-result"
                        :class="{ 'result-win': report.results[index]?.result === 'win', 'result-loss': report.results[index]?.result === 'loss' }">
                        {{ report.results[index]?.result === 'win' ? 'WIN' : 'LOSS' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ações -->
              <div class="report-actions">
                <button v-if="report.status === 'pending'" @click="openResultModal(report)" class="btn btn-primary">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  {{ config.texts.confirmResult }}
                </button>
                <button v-if="report.status === 'pending'" @click="cancelReport(report)" class="btn btn-danger">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                    <path
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                  </svg>
                  {{ config.texts.cancel }}
                </button>
                <button v-if="report.status === 'completed'" @click="viewReportDetails(report)"
                  class="btn btn-secondary">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  {{ config.texts.viewDetails }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Confirmation Modal -->
      <div v-if="showResultModal" class="modal-overlay" @click="closeResultModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ config.texts.confirmResultModalTitle }}</h3>
            <button @click="closeResultModal" class="modal-close">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="result-form">
              <h4 class="form-title">{{ selectedReport?.surebet[0]?.match || config.texts.gameNotIdentified }}</h4>

              <div class="bets-results">
                <div v-for="(bet, index) in selectedReport?.surebet" :key="index" class="bet-result-item">
                  <div class="bet-info">
                    <span class="bet-house">{{ bet.house }}</span>
                    <span class="bet-market">{{ bet.market }}</span>
                    <span class="bet-odds">{{ bet.chance }}</span>
                    <span class="bet-stake">{{ formatCurrency(selectedReport?.stakes[index]) }}</span>
                  </div>
                  <div class="result-selection">
                    <button @click="setBetResult(index, 'win')" :class="{ 'active': betResults[index] === 'win' }"
                      class="result-btn result-win">
                      WIN
                    </button>
                    <button @click="setBetResult(index, 'loss')" :class="{ 'active': betResults[index] === 'loss' }"
                      class="result-btn result-loss">
                      LOSS
                    </button>
                  </div>
                </div>
              </div>

              <div class="profit-calculation">
                <h5>{{ config.texts.resultSummary }}</h5>
                <div class="calculation-item">
                  <span>{{ config.texts.totalInvestment }}</span>
                  <span>{{ formatCurrency(selectedReport?.totalInvestment) }}</span>
                </div>
                <div class="calculation-item">
                  <span>{{ config.texts.expectedReturn }}</span>
                  <span>{{ formatCurrency(calculateExpectedReturn()) }}</span>
                </div>
                <div class="calculation-item total">
                  <span>{{ config.texts.profitLoss }}</span>
                  <span
                    :class="{ 'profit-positive': calculateActualProfit() > 0, 'profit-negative': calculateActualProfit() < 0 }">
                    {{ formatCurrency(calculateActualProfit()) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeResultModal" class="btn btn-secondary">{{ config.texts.cancel }}</button>
            <button @click.prevent="confirmResult" class="btn btn-primary" :disabled="!canConfirmResult">
              {{ config.texts.confirmResult }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Header from '@/components/Navigation/Header.vue'
import Sidebar from '@/components/Navigation/Sidebar.vue'
import { http } from '@/utils/http.js'
import { surebetReportsConfig } from '@/config/surebetReportsConfig.js'
import { emitter } from '@/utils/emitter.js'

export default {
  name: 'SurebetReportsView',

  components: {
    Header,
    Sidebar
  },

  data() {
    return {
      reports: [],
      statusFilter: '',
      showResultModal: false,
      selectedReport: null,
      betResults: {},
      // Propriedades do sidebar
      sidebarCollapsed: false,
      // Configurações
      config: surebetReportsConfig
    }
  },

  computed: {
    filteredReports() {
      if (!this.statusFilter) return this.reports
      return this.reports.filter(report => report.status === this.statusFilter)
    },

    pendingReports() {
      return this.reports.filter(report => report.status === 'pending').length
    },

    totalProfit() {
      return this.reports
        .filter(report => report.status === 'completed')
        .reduce((total, report) => total + (report.actualProfit || 0), 0)
        .toFixed(2)
    }
  },

  mounted() {
    this.loadReports()
  },

  methods: {
    // Métodos do sidebar
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    handleSidebarStateLoaded(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },

    async loadReports() {
      try {
        console.log('Carregando relatórios de surebets...')

        const token = this.$store.getters.authToken
        if (!token) {
          console.error('Token de autenticação não encontrado')
          this.$toast.error(this.config.texts.sessionExpired)
          this.$router.push('/login')
          return
        }

        const response = await fetch(this.config.api.endpoints.reports, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          this.reports = Array.isArray(data.data) ? data.data : []
          console.log('Relatórios carregados:', this.reports)
        } else {
          throw new Error(data.message || 'Erro ao carregar relatórios')
        }
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error)
        const errorMessage = error?.message || error?.toString() || 'Erro desconhecido'
        this.$toast.error(this.config.texts.errorLoadingReports + errorMessage)
        this.reports = []
      }
    },

    refreshReports() {
      this.loadReports()
    },

    getStatusText(status) {
      return this.config.statusTextMap[status] || status
    },

    formatCurrency(value) {
      return new Intl.NumberFormat(this.config.formatting.currency.locale, {
        style: 'currency',
        currency: this.config.formatting.currency.currency
      }).format(value)
    },

    formatDate(date) {
      return new Intl.DateTimeFormat(this.config.formatting.date.locale, this.config.formatting.date.options).format(new Date(date))
    },

    openResultModal(report) {
      this.selectedReport = report
      this.betResults = {}
      this.showResultModal = true
    },

    closeResultModal() {
      this.showResultModal = false
      this.selectedReport = null
      this.betResults = {}
    },

    setBetResult(index, result) {
      console.log('🔍 [DEBUG] setBetResult chamado - index:', index, 'result:', result)
      // Usar Vue.set para garantir reatividade
      this.$set(this.betResults, index, result)
      console.log('🔍 [DEBUG] betResults após set:', this.betResults)
    },

    canConfirmResult() {
      const hasSelectedReport = !!this.selectedReport
      const hasAllResults = this.selectedReport && Object.keys(this.betResults).length === this.selectedReport.surebet.length
      const allResultsValid = this.selectedReport && Object.values(this.betResults).every(result => result === 'win' || result === 'loss')

      console.log('🔍 [DEBUG] canConfirmResult - hasSelectedReport:', hasSelectedReport)
      console.log('🔍 [DEBUG] canConfirmResult - hasAllResults:', hasAllResults)
      console.log('🔍 [DEBUG] canConfirmResult - allResultsValid:', allResultsValid)
      console.log('🔍 [DEBUG] canConfirmResult - betResults keys:', Object.keys(this.betResults))
      console.log('🔍 [DEBUG] canConfirmResult - surebet length:', this.selectedReport?.surebet?.length)

      return hasSelectedReport && hasAllResults && allResultsValid
    },

    calculateExpectedReturn() {
      if (!this.selectedReport) return 0

      let totalReturn = 0
      for (let i = 0; i < this.selectedReport.surebet.length; i++) {
        const bet = this.selectedReport.surebet[i]
        const stake = this.selectedReport.stakes[i]
        const result = this.betResults[i]

        if (result === 'win') {
          totalReturn += stake * parseFloat(bet.chance)
        }
      }

      return totalReturn
    },

    calculateActualProfit() {
      const expectedReturn = this.calculateExpectedReturn()
      return expectedReturn - this.selectedReport.totalInvestment
    },

    async confirmResult() {
      console.log('🔍 [DEBUG] confirmResult chamado')
      console.log('🔍 [DEBUG] canConfirmResult:', this.canConfirmResult())
      console.log('🔍 [DEBUG] selectedReport:', this.selectedReport)
      console.log('🔍 [DEBUG] betResults:', this.betResults)

      if (!this.canConfirmResult()) {
        console.log('❌ [DEBUG] Não pode confirmar resultado - validação falhou')
        return
      }

      try {
        console.log('✅ [DEBUG] Iniciando confirmação de resultado...')

        const resultData = {
          reportId: this.selectedReport.id,
          results: this.betResults,
          actualProfit: this.calculateActualProfit(),
          status: 'completed',
          surebet: this.selectedReport.surebet,
          stakes: this.selectedReport.stakes
        }

        console.log('🔍 [DEBUG] Dados enviados:', resultData)
        console.log('🔍 [DEBUG] URL da API:', this.config.api.endpoints.confirmResult(this.selectedReport.id))

        const response = await http.put(this.config.api.endpoints.confirmResult(this.selectedReport.id), resultData)

        console.log('🔍 [DEBUG] Resposta completa da API:', response)
        console.log('🔍 [DEBUG] response.data:', response.data)

        if (response && response.data && response.data.success) {
          this.$toast.success(this.config.texts.resultConfirmed)
          console.log('💰 Ajustes de saldo:', response.data.data?.balanceAdjustments)

          // Emite evento para atualizar saldos no BookmakerAccountsView
          emitter.emit('surebet-result-confirmed', {
            report: this.selectedReport,
            results: this.betResults,
            actualProfit: this.calculateActualProfit(),
            balanceAdjustments: response.data.data?.balanceAdjustments || []
          })

          this.closeResultModal()
          await this.loadReports()
        } else {
          const errorMessage = response?.data?.message || 'Resposta inválida da API'
          throw new Error(errorMessage)
        }
      } catch (error) {
        console.error('Erro ao confirmar resultado:', error)
        const errorMessage = error?.message || error?.toString() || 'Erro desconhecido'
        this.$toast.error(this.config.texts.errorConfirmingResult + errorMessage)
      }
    },

    async cancelReport(report) {
      if (confirm(this.config.texts.cancelConfirmation)) {
        try {
          const response = await http.put(this.config.api.endpoints.cancel(report.id))

          if (response.data.success) {
            this.$toast.success(this.config.texts.reportCancelled)
            await this.loadReports()
          } else {
            throw new Error(response.data.message)
          }
        } catch (error) {
          console.error('Erro ao cancelar relatório:', error)
          const errorMessage = error?.message || error?.toString() || 'Erro desconhecido'
          this.$toast.error(this.config.texts.errorCancellingReport + errorMessage)
        }
      }
    },

    viewReportDetails(report) {
      // Implementar visualização de detalhes
      console.log('Ver detalhes do relatório:', report)
    }
  }
}
</script>

<style lang="scss" scoped>
/* Estilos similares ao BookmakerAccountsView mas adaptados para relatórios */
.surebet-reports-container {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px);
  max-width: calc(100% - 280px);
  margin-left: 280px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid var(--border-primary);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.reports-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.reports-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.report-card.report-pending {
  border-left: 4px solid var(--status-pending);
}

.report-card.report-completed {
  border-left: 4px solid var(--status-completed);
}

.report-card.report-cancelled {
  border-left: 4px solid var(--status-cancelled);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.report-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.report-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: var(--status-pending-bg);
  color: var(--status-pending);
  border: 1px solid var(--status-pending-border);
}

.status-completed {
  background: var(--status-completed-bg);
  color: var(--status-completed);
  border: 1px solid var(--status-completed-border);
}

.status-cancelled {
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled);
  border: 1px solid var(--status-cancelled-border);
}

.report-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profit-positive {
  color: var(--profit-positive);
}

.profit-negative {
  color: var(--profit-negative);
}

.bets-section {
  margin-bottom: 1.5rem;
}

.bets-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.bets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-overlay);
  border-radius: 6px;
}

.bet-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bet-house {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bet-market {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.bet-odds {
  font-size: 0.8rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.bet-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.bet-stake {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bet-result {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.result-win {
  background: var(--result-win-bg);
  color: var(--result-win-color);
}

.result-loss {
  background: var(--result-loss-bg);
  color: var(--result-loss-color);
}

.report-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-button-hover);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: var(--error-hover);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.bets-results {
  margin-bottom: 1.5rem;
}

.bet-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-overlay);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.result-selection {
  display: flex;
  gap: 0.5rem;
}

.result-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-btn.active {
  color: white;
}

.result-btn.result-win.active {
  background: var(--result-win-color);
  border-color: var(--result-win-color);
}

.result-btn.result-loss.active {
  background: var(--result-loss-color);
  border-color: var(--result-loss-color);
}

.profit-calculation {
  background: var(--bg-overlay);
  padding: 1rem;
  border-radius: 6px;
}

.profit-calculation h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.calculation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.calculation-item.total {
  font-weight: 600;
  border-top: 1px solid var(--border-primary);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.form-select {
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Responsividade */
@media (max-width: 1023px) {
  .surebet-reports-container {
    margin-left: 0;
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 700px) {
  .reports-main {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .report-actions {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
