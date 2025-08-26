<template>
  <div class="betting-profiles-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">
            <svg class="title-icon" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215z"/>
            </svg>
            Perfis de Aposta
          </h2>
          <p class="page-subtitle">Simule a evolução da sua banca em 30 dias com diferentes perfis de apostador</p>
        </div>
      </header>

    <!-- Formulário de Entrada -->
    <div class="input-section">
      <div class="form-card">
        <h2 class="form-title">Configurações do Perfil</h2>
        
        <div class="form-grid">
          <!-- Perfil do Apostador -->
          <div class="form-group">
            <label for="profile" class="form-label">Perfil do Apostador</label>
            <select id="profile" v-model="formData.profile" class="form-select">
              <option value="conservador">Conservador</option>
              <option value="balanceado">Balanceado</option>
              <option value="agressivo">Agressivo</option>
              <option value="camuflado">Camuflado</option>
            </select>
          </div>

          <!-- Banca Inicial -->
          <div class="form-group">
            <label for="initialBank" class="form-label">Banca Inicial (R$)</label>
            <input 
              id="initialBank" 
              v-model.number="formData.initialBank" 
              type="number" 
              class="form-input"
              min="100"
              step="100"
            >
          </div>

          <!-- Turnover Diário -->
          <div class="form-group">
            <label for="dailyTurnover" class="form-label">Turnover Diário Médio (R$)</label>
            <input 
              id="dailyTurnover" 
              v-model.number="formData.dailyTurnover" 
              type="number" 
              class="form-input"
              min="100"
              step="100"
            >
          </div>

          <!-- Meta de Lucro Diário -->
          <div class="form-group">
            <label for="dailyProfitTarget" class="form-label">Meta de Lucro Diário (R$)</label>
            <input 
              id="dailyProfitTarget" 
              v-model.number="formData.dailyProfitTarget" 
              type="number" 
              class="form-input"
              min="10"
              step="10"
            >
          </div>

          <!-- Quantidade de Múltiplas -->
          <div class="form-group">
            <label for="dailyMultiples" class="form-label">Quantidade de Múltiplas Diárias</label>
            <input 
              id="dailyMultiples" 
              v-model.number="formData.dailyMultiples" 
              type="number" 
              class="form-input"
              min="0"
              max="10"
            >
          </div>

          <!-- Valor das Múltiplas -->
          <div class="form-group">
            <label for="multipleValue" class="form-label">Valor das Múltiplas (R$)</label>
            <input 
              id="multipleValue" 
              v-model.number="formData.multipleValue" 
              type="number" 
              class="form-input"
              min="1"
              step="1"
            >
          </div>

          <!-- Variação Percentual -->
          <div class="form-group">
            <label for="variationPercent" class="form-label">Variação Percentual Diária (%)</label>
            <input 
              id="variationPercent" 
              v-model.number="formData.variationPercent" 
              type="number" 
              class="form-input"
              min="0"
              max="50"
              step="1"
            >
          </div>
        </div>

        <div class="form-actions">
          <button @click="calculateEvolution" class="btn btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 8 3z"/>
              <path d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8z"/>
              <path d="M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM17.3 5.3a.5.5 0 0 1 0 .7l-.915.915a.5.5 0 0 1-.7-.7l.914-.915a.5.5 0 0 1 .7 0zM3 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H4.5v1.5a.5.5 0 0 1-1 0V10zm10 0a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0V10.5H13a.5.5 0 0 1 0-1h2z"/>
            </svg>
            Calcular Evolução
          </button>
          <button @click="resetForm" class="btn btn-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="evolutionData.length > 0" class="results-section">
      <!-- Resumo Final -->
      <div class="summary-card">
        <h2 class="summary-title">Resumo Final (30 dias)</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Banca Final</div>
            <div class="summary-value">R$ {{ formatCurrency(finalSummary.finalBank) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Lucro Total</div>
            <div class="summary-value" :class="{ 'positive': finalSummary.totalProfit > 0, 'negative': finalSummary.totalProfit < 0 }">
              R$ {{ formatCurrency(finalSummary.totalProfit) }}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">ROI Médio Diário</div>
            <div class="summary-value">{{ finalSummary.averageROI.toFixed(2) }}%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Custo Múltiplas (% do lucro)</div>
            <div class="summary-value">{{ finalSummary.multiplesCostPercentage.toFixed(1) }}%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Metas Atingidas</div>
            <div class="summary-value">{{ finalSummary.goalsAchieved }}/30 dias</div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Evolução -->
      <div class="chart-card">
        <h2 class="chart-title">Evolução da Banca</h2>
        <div class="chart-container">
          <canvas ref="evolutionChart"></canvas>
        </div>
      </div>

      <!-- Tabela de Evolução Diária -->
      <div class="table-card">
        <h2 class="table-title">Evolução Diária Detalhada</h2>
        <div class="table-container">
          <table class="evolution-table">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Lucro Esperado</th>
                <th>Lucro Real</th>
                <th>Custo Múltiplas</th>
                <th>Lucro Líquido</th>
                <th>Banca Acumulada</th>
                <th>Meta Atingida</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in evolutionData" :key="day.day" :class="{ 'goal-achieved': day.goalAchieved }">
                <td>{{ day.day }}</td>
                <td>R$ {{ formatCurrency(day.expectedProfit) }}</td>
                <td :class="{ 'positive': day.realProfit > 0, 'negative': day.realProfit < 0 }">
                  R$ {{ formatCurrency(day.realProfit) }}
                </td>
                <td>R$ {{ formatCurrency(day.multiplesCost) }}</td>
                <td :class="{ 'positive': day.netProfit > 0, 'negative': day.netProfit < 0 }">
                  R$ {{ formatCurrency(day.netProfit) }}
                </td>
                <td>R$ {{ formatCurrency(day.accumulatedBank) }}</td>
                <td>
                  <span v-if="day.goalAchieved" class="goal-badge achieved">✓</span>
                  <span v-else class="goal-badge missed">✗</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
             </div>
     </div>
    </main>

    <!-- Modal do Glossário -->
    <GlossaryModal ref="glossaryModal" />
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
Chart.register(...registerables)

export default {
  name: 'BettingProfilesView',
  components: {
    Sidebar,
    GlossaryModal
  },
  data() {
    return {
      sidebarCollapsed: false,
      formData: {
        profile: 'balanceado',
        initialBank: 1000,
        dailyTurnover: 500,
        dailyProfitTarget: 50,
        dailyMultiples: 3,
        multipleValue: 5,
        variationPercent: 10
      },
      evolutionData: [],
      finalSummary: {},
      evolutionChart: null
    }
  },
  computed: {
    profileConfig() {
      const configs = {
        conservador: {
          profitPercentage: 0.02, // 2%
          description: 'Perfil com baixo risco e lucros modestos'
        },
        balanceado: {
          profitPercentage: 0.035, // 3.5%
          description: 'Equilíbrio entre risco e retorno'
        },
        agressivo: {
          profitPercentage: 0.05, // 5%
          description: 'Alto risco com potencial de grandes lucros'
        },
        camuflado: {
          profitPercentage: 0.025, // 2.5%
          description: 'Perfil discreto para evitar detecção'
        }
      }
      return configs[this.formData.profile]
    }
  },
  methods: {
    calculateEvolution() {
      const { profileConfig, formData } = this
      const evolution = []
      let currentBank = formData.initialBank
      let totalProfit = 0
      let goalsAchieved = 0
      let totalMultiplesCost = 0

      for (let day = 1; day <= 30; day++) {
        // Lucro esperado baseado no perfil
        const expectedProfit = formData.dailyTurnover * profileConfig.profitPercentage

        // Aplicar variação diária
        const variation = (Math.random() - 0.5) * 2 * (formData.variationPercent / 100)
        const realProfit = expectedProfit * (1 + variation)

        // Custo das múltiplas
        const multiplesCost = formData.dailyMultiples * formData.multipleValue

        // Lucro líquido
        const netProfit = realProfit - multiplesCost

        // Atualizar banca
        currentBank += netProfit
        totalProfit += netProfit
        totalMultiplesCost += multiplesCost

        // Verificar meta
        const goalAchieved = netProfit >= formData.dailyProfitTarget
        if (goalAchieved) goalsAchieved++

        evolution.push({
          day,
          expectedProfit,
          realProfit,
          multiplesCost,
          netProfit,
          accumulatedBank: currentBank,
          goalAchieved
        })
      }

      this.evolutionData = evolution
      this.calculateFinalSummary(totalProfit, totalMultiplesCost, goalsAchieved)
      this.$nextTick(() => {
        this.createChart()
      })
    },

    calculateFinalSummary(totalProfit, totalMultiplesCost, goalsAchieved) {
      const totalExpectedProfit = this.formData.dailyTurnover * this.profileConfig.profitPercentage * 30
      const averageROI = (totalProfit / this.formData.initialBank) * 100
      const multiplesCostPercentage = totalExpectedProfit > 0 ? (totalMultiplesCost / totalExpectedProfit) * 100 : 0

      this.finalSummary = {
        finalBank: this.evolutionData[this.evolutionData.length - 1].accumulatedBank,
        totalProfit,
        averageROI,
        multiplesCostPercentage,
        goalsAchieved
      }
    },

    createChart() {
      const ctx = this.$refs.evolutionChart
      if (this.evolutionChart) {
        this.evolutionChart.destroy()
      }

      this.evolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.evolutionData.map(day => `Dia ${day.day}`),
          datasets: [
            {
              label: 'Banca Acumulada',
              data: this.evolutionData.map(day => day.accumulatedBank),
              borderColor: 'var(--accent-primary)',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Lucro Líquido Diário',
              data: this.evolutionData.map(day => day.netProfit),
              borderColor: 'var(--accent-secondary)',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Dias',
                color: 'var(--text-primary)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'var(--border-primary)',
                borderColor: 'var(--border-primary)'
              },
              ticks: {
                color: 'var(--text-secondary)',
                font: {
                  size: 12
                }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Banca (R$)',
                color: 'var(--text-primary)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'var(--border-primary)',
                borderColor: 'var(--border-primary)'
              },
              ticks: {
                color: 'var(--text-secondary)',
                font: {
                  size: 12
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Lucro Diário (R$)',
                color: 'var(--text-primary)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                drawOnChartArea: false,
                color: 'var(--border-primary)',
                borderColor: 'var(--border-primary)'
              },
              ticks: {
                color: 'var(--text-secondary)',
                font: {
                  size: 12
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'var(--text-primary)',
                font: {
                  size: 14,
                  weight: 'bold'
                },
                usePointStyle: true,
                padding: 20
              }
            },
            title: {
              display: true,
              text: 'Evolução da Banca em 30 Dias',
              color: 'var(--text-primary)',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            tooltip: {
              backgroundColor: 'var(--bg-secondary)',
              titleColor: 'var(--text-primary)',
              bodyColor: 'var(--text-primary)',
              borderColor: 'var(--border-primary)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true
            }
          }
        }
      })
    },

    resetForm() {
      this.formData = {
        profile: 'balanceado',
        initialBank: 1000,
        dailyTurnover: 500,
        dailyProfitTarget: 50,
        dailyMultiples: 3,
        multipleValue: 5,
        variationPercent: 10
      }
      this.evolutionData = []
      this.finalSummary = {}
      if (this.evolutionChart) {
        this.evolutionChart.destroy()
        this.evolutionChart = null
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },

    // Métodos do Sidebar
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },

    openGlossary() {
      this.$refs.glossaryModal?.open()
    }
  }
}
</script>

<style scoped>
.betting-profiles-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: var(--bg-primary);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.title-icon {
  color: var(--accent-primary);
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.title-icon {
  color: var(--primary-color);
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.input-section {
  margin-bottom: 3rem;
}

.form-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-primary);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card,
.chart-card,
.table-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-primary);
}

.summary-title,
.chart-title,
.table-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.positive {
  color: var(--success);
}

.summary-value.negative {
  color: var(--error);
}

.chart-container {
  position: relative;
  height: 500px;
  width: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.evolution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.evolution-table th,
.evolution-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--border-primary);
}

.evolution-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.evolution-table tr:hover {
  background: var(--bg-secondary);
}

.evolution-table tr.goal-achieved {
  background: rgba(76, 175, 80, 0.05);
}

.positive {
  color: var(--success);
  font-weight: 600;
}

.negative {
  color: var(--error);
  font-weight: 600;
}

.goal-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.8rem;
}

.goal-badge.achieved {
  background: var(--success);
  color: white;
}

.goal-badge.missed {
  background: var(--error);
  color: white;
}

.table-container {
  overflow-x: auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .chart-container {
    height: 350px;
    min-height: 300px;
  }
  
  .evolution-table {
    font-size: 0.8rem;
  }
  
  .evolution-table th,
  .evolution-table td {
    padding: 0.5rem 0.25rem;
  }
}
</style>
