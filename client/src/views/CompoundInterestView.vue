<template>
  <RouteGuard :requiresVIP="true">
    <div class="compound-interest-container">
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @sidebar-state-loaded="handleSidebarStateLoaded"
    />
    
    <main class="main-content">
      <!-- Header Global -->
      <Header />
      
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Calculadora de Juros Compostos</h2>
          <p class="page-subtitle">Calcule o crescimento do seu investimento com juros compostos</p>
        </div>
      </header>

             <div class="content-main">
         <div class="main-layout">
           <!-- Formulário de Cálculo -->
           <div class="calculator-section">
             <div class="calculator-card">
               <h2>📊 Parâmetros do Investimento</h2>
               
               <div class="calculator-form">
                 <div class="form-row">
                   <div class="form-group">
                     <label for="initialValue">Valor Inicial (Capital)</label>
                     <div class="input-wrapper">
                       <span class="currency-symbol">R$</span>
                       <input 
                         id="initialValue"
                         v-model.number="formData.initialValue" 
                         type="number" 
                         step="0.01" 
                         min="0"
                         placeholder="0,00"
                       />
                     </div>
                   </div>
                   
                   <div class="form-group">
                     <label for="interestRate">Taxa de Juros (%)</label>
                     <div class="input-wrapper">
                       <input 
                         id="interestRate"
                         v-model.number="formData.interestRate" 
                         type="number" 
                         step="0.01" 
                         min="0"
                         placeholder="0,00"
                       />
                       <span class="percentage-symbol">%</span>
                     </div>
                   </div>
                 </div>

                 <div class="form-row">
                   <div class="form-group">
                     <label for="period">Período</label>
                     <div class="period-input-wrapper">
                       <input 
                         id="period"
                         v-model.number="formData.period" 
                         type="number" 
                         min="1"
                         placeholder="30"
                       />
                       <select v-model="formData.periodType" class="period-select">
                         <option value="days">Dias</option>
                         <option value="weeks">Semanas</option>
                         <option value="months">Meses</option>
                         <option value="years">Anos</option>
                       </select>
                     </div>
                   </div>
                   
                   <div class="form-group">
                     <label for="capitalizationType">Tipo de Capitalização</label>
                     <select 
                       id="capitalizationType"
                       v-model="formData.capitalizationType" 
                       class="capitalization-select"
                     >
                       <option value="daily">Diária</option>
                       <option value="weekly">Semanal</option>
                       <option value="monthly">Mensal</option>
                       <option value="yearly">Anual</option>
                     </select>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <!-- Resultados -->
           <div class="results-section">
             <div class="results-card">
               <h2>💰 Resultados do Investimento</h2>
               
               <div class="results-grid">
                 <div class="result-item">
                   <div class="result-label">Valor Final</div>
                   <div class="result-value final-value">{{ formatCurrency(results?.finalValue || 0) }}</div>
                 </div>
                 
                 <div class="result-item">
                   <div class="result-label">Juros Totais</div>
                   <div class="result-value interest-value">{{ formatCurrency(results?.totalInterest || 0) }}</div>
                 </div>
                 
                 <div class="result-item">
                   <div class="result-label">Capital Inicial</div>
                   <div class="result-value initial-value">{{ formatCurrency(results?.initialValue || 0) }}</div>
                 </div>
                   
                 <div class="result-item">
                   <div class="result-label">Rentabilidade</div>
                   <div class="result-value profit-value">{{ formatPercentage(results?.profitPercentage || 0) }}</div>
                 </div>
               </div>
             </div>
           </div>
         </div>

        <!-- Tabela de Evolução -->
        <div v-if="results && evolutionTable.length > 0" class="evolution-section">
          <div class="evolution-card">
            <h2>📈 Evolução do Investimento</h2>
            
            <div class="table-container">
              <table class="evolution-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Capital</th>
                    <th>Juros do Período</th>
                    <th>Total Acumulado</th>
                    <th>Rentabilidade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in evolutionTable" :key="index" :class="{ 'highlight': index % 10 === 0 }">
                    <td>{{ row.period }}</td>
                    <td>{{ formatCurrency(row.capital) }}</td>
                    <td>{{ formatCurrency(row.periodInterest) }}</td>
                    <td>{{ formatCurrency(row.total) }}</td>
                    <td>{{ formatPercentage(row.profitPercentage) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

                 <!-- Gráfico -->
         <div v-if="results" class="chart-section">
           <div class="chart-card">
             <h2>📊 Gráfico de Crescimento</h2>
             <div class="chart-container">
               <canvas ref="chartCanvas" :id="'compound-chart-' + Date.now()"></canvas>
             </div>
           </div>
         </div>
      </div>
    </main>

    <!-- Modal do Glossário -->
    
  </div>
    </RouteGuard>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

import RouteGuard from '../components/RouteGuard.vue'
import Chart from 'chart.js/auto'

export default {
  name: 'CompoundInterestView',
  components: {
    Sidebar,
    Header,

    RouteGuard
  },
  data() {
    return {
      sidebarCollapsed: false,

      formData: {
        initialValue: 1000,
        interestRate: 1,
        period: 30,
        periodType: 'days',
        capitalizationType: 'daily'
      },
      results: null,
      evolutionTable: [],
      chartData: null,
      chart: null,
      debounceTimer: null
    }
  },
  computed: {

  },
  watch: {
    formData: {
      handler() {
        this.debouncedCalculate()
      },
      deep: true,
      immediate: false
    }
  },
  
  // Watcher para mudanças no tema
  mounted() {
    // Observar mudanças no atributo data-theme
    const observer = new MutationObserver(() => {
      this.updateChartBackground()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    // Calcular automaticamente com valores padrão
    this.calculateInterest()
  },
  methods: {
    // Método para obter cores do tema atual
    getThemeColor(cssVariable, fallback) {
      return getComputedStyle(document.documentElement).getPropertyValue(cssVariable) || fallback
    },
    
    // Método para atualizar o fundo do gráfico quando o tema mudar
    updateChartBackground() {
      if (this.chart) {
        // Apenas atualizar as cores do gráfico
        this.chart.update('none');
      }
    },

    // Método para destruir gráfico de forma segura
    destroyChartSafely() {
      try {
        if (this.chart && typeof this.chart.destroy === 'function') {
          // Verificar se o gráfico ainda está ativo
          if (this.chart.canvas && this.chart.canvas.parentNode) {
            this.chart.destroy()
            console.log('✅ Gráfico de juros compostos destruído com sucesso')
          }
          this.chart = null
        }
      } catch (error) {
        console.warn('⚠️ Erro ao destruir gráfico de juros compostos:', error.message)
        // Forçar limpeza mesmo com erro
        this.chart = null
      }
    },

    showNotification(message, type = 'info') {
      const notification = document.createElement('div')
      notification.className = 'notification'
      notification.textContent = message
      
      let backgroundColor = 'var(--accent-primary)'
      let textColor = 'var(--bg-primary)'
      
      if (type === 'error') {
        backgroundColor = 'var(--error-color)'
        textColor = 'var(--text-primary)'
      } else if (type === 'warning') {
        backgroundColor = 'var(--warning-color)'
        textColor = 'var(--bg-primary)'
      }
      
      notification.style.cssText = `
         position: fixed;
         top: 100px;
         right: 20px;
         background: ${backgroundColor};
         color: ${textColor};
         padding: 12px 20px;
         border-radius: 8px;
         font-weight: 600;
         z-index: 10000;
         animation: slideIn 0.3s ease;
       `
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }, 3000)
    },

    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    

    


    debouncedCalculate() {
      // Limpar timer anterior se existir
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      // Definir novo timer com delay de 300ms
      this.debounceTimer = setTimeout(() => {
        this.calculateInterest()
      }, 300)
    },

    calculateInterest() {
      const { initialValue, interestRate, period, periodType, capitalizationType } = this.formData
      
      // Validar se todos os valores são válidos
      if (!initialValue || !interestRate || !period || initialValue <= 0 || interestRate <= 0 || period <= 0) {
        this.results = null
        this.evolutionTable = []
        this.chartData = null
        if (this.chart) {
          this.chart.destroy()
          this.chart = null
        }
        return
      }
      
      // Converter taxa para decimal
      const rate = interestRate / 100
      
      // Calcular número de períodos de capitalização
      const periodsPerYear = this.getPeriodsPerYear(capitalizationType)
      const totalPeriods = this.convertPeriodToDays(period, periodType) * periodsPerYear / 365
      
      // Fórmula dos juros compostos: M = C * (1 + i)^n
      const finalValue = initialValue * Math.pow(1 + rate, totalPeriods)
      const totalInterest = finalValue - initialValue
      const profitPercentage = ((finalValue - initialValue) / initialValue) * 100
      
      this.results = {
        initialValue,
        finalValue,
        totalInterest,
        profitPercentage
      }
      
      this.generateEvolutionTable()
      this.generateChartData()
      
      // Renderizar gráfico de forma assíncrona
      this.$nextTick(async () => {
        await this.renderChart()
      })
    },

    getPeriodsPerYear(capitalizationType) {
      const periods = {
        daily: 365,
        weekly: 52,
        monthly: 12,
        yearly: 1
      }
      return periods[capitalizationType] || 365
    },

    convertPeriodToDays(period, periodType) {
      const conversions = {
        days: 1,
        weeks: 7,
        months: 30,
        years: 365
      }
      return period * (conversions[periodType] || 1)
    },

    generateEvolutionTable() {
      const { initialValue, interestRate, period, periodType, capitalizationType } = this.formData
      const rate = interestRate / 100
      const periodsPerYear = this.getPeriodsPerYear(capitalizationType)
      const totalDays = this.convertPeriodToDays(period, periodType)
      
      this.evolutionTable = []
      let currentCapital = initialValue
      
      for (let day = 1; day <= totalDays; day++) {
        const periodsElapsed = day * periodsPerYear / 365
        const newTotal = initialValue * Math.pow(1 + rate, periodsElapsed)
        const periodInterest = newTotal - currentCapital
        
        this.evolutionTable.push({
          period: `${day}º dia`,
          capital: currentCapital,
          periodInterest,
          total: newTotal,
          profitPercentage: ((newTotal - initialValue) / initialValue) * 100
        })
        
        currentCapital = newTotal
      }
    },

    generateChartData() {
      if (!this.evolutionTable || this.evolutionTable.length === 0) {
        this.chartData = null
        return
      }
      
      this.chartData = {
        labels: this.evolutionTable.map(row => row.period),
        datasets: [
          {
            label: 'Capital Total',
            data: this.evolutionTable.map(row => row.total),
            borderColor: this.getThemeColor('--accent-primary', '#00ff88'),
            backgroundColor: this.getThemeColor('--accent-primary', '#00ff88') + '15',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            // Configurações para área preenchida mais bonita
            fillColor: this.getThemeColor('--accent-primary', '#00ff88') + '10',
            // Gradiente personalizado para a área
            fillGradient: {
              type: 'linear',
              colors: [
                this.getThemeColor('--accent-primary', '#00ff88') + '20',
                this.getThemeColor('--accent-primary', '#00ff88') + '08',
                this.getThemeColor('--accent-primary', '#00ff88') + '05'
              ]
            }
          },
          {
            label: 'Capital Inicial',
            data: this.evolutionTable.map(() => this.formData.initialValue),
            borderColor: this.getThemeColor('--error-color', '#ff4444'),
            backgroundColor: this.getThemeColor('--error-color', '#ff4444') + '15',
            borderDash: [5, 5],
            fill: true,
            fillColor: this.getThemeColor('--error-color', '#ff4444') + '08',
            borderWidth: 2
          }
        ]
      }
    },

    async renderChart() {
      // Aguardar um pouco para garantir que o DOM foi atualizado
      await this.$nextTick()
      
      // Verificar se temos dados válidos
      if (!this.chartData || !this.chartData.labels || this.chartData.labels.length === 0) {
        return
      }
      
      const ctx = this.$refs.chartCanvas
      if (!ctx) {
        console.warn('Canvas element not found')
        return
      }
      
      // Destruir gráfico anterior de forma mais segura
      if (this.chart) {
        try {
          this.chart.destroy()
        } catch (error) {
          console.warn('Error destroying previous chart:', error)
        }
        this.chart = null
      }
      
      // Destruir gráfico existente de forma segura
      this.destroyChartSafely()
      
      try {
        // Criar novo gráfico
        this.chart = new Chart(ctx, {
          type: 'line',
          data: JSON.parse(JSON.stringify(this.chartData)), // Deep copy dos dados
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 500
            },
            plugins: {
              legend: {
                labels: {
                  color: this.getThemeColor('--text-primary', '#ffffff'),
                  font: {
                    size: 12,
                    weight: '500'
                  },
                  usePointStyle: true,
                  padding: 20
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: this.getThemeColor('--text-primary', '#ffffff'),
                  maxTicksLimit: 10,
                  font: {
                    size: 11
                  }
                },
                grid: {
                  color: this.getThemeColor('--border-primary', '#666666') + '20',
                  drawBorder: false
                },
                border: {
                  color: this.getThemeColor('--border-primary', '#666666') + '40'
                },
                // Fundo do eixo X
                backgroundColor: this.getThemeColor('--bg-tertiary', '#2a2a2a')
              },
              y: {
                ticks: {
                  color: this.getThemeColor('--text-primary', '#ffffff'),
                  maxTicksLimit: 10,
                  font: {
                    size: 11
                  },
                  callback: function(value) {
                    return new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                },
                grid: {
                  color: this.getThemeColor('--border-primary', '#666666') + '20',
                  drawBorder: false
                },
                border: {
                  color: this.getThemeColor('--border-primary', '#666666') + '40'
                },
                // Fundo do eixo Y
                backgroundColor: this.getThemeColor('--bg-tertiary', '#2a2a2a')
              }
            },
            elements: {
              point: {
                radius: 0,
                hoverRadius: 4,
                hoverBackgroundColor: this.getThemeColor('--bg-primary', '#ffffff')
              }
            },
            // Configuração do fundo da área de plotagem
            layout: {
              padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
              }
            }
          }
        })
        
      } catch (error) {
        console.error('Error creating chart:', error)
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },

    formatPercentage(value) {
      return `${value.toFixed(2)}%`
    }
  },


  
  beforeUnmount() {
    // Limpar timer se existir
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    
    // Limpar gráfico quando componente for destruído
    if (this.chart) {
      try {
        this.chart.destroy()
      } catch (error) {
        console.warn('Error destroying chart on unmount:', error)
      }
      this.chart = null
    }
  }
}
</script>

<style lang="scss" scoped>
/* Importação removida para evitar conflitos de build */
.compound-interest-container {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
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
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

      .content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 32px;
        border-bottom: 1px solid var(--border-primary);
        margin-bottom: 32px;
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
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 32px 32px;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.calculator-section,
.results-section {
  width: 100%;
}

.evolution-section,
.chart-section {
  width: 100%;
}

.calculator-card,
.results-card,
.evolution-card,
.chart-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  height: fit-content;
  
  &:hover {
    border-color: var(--accent-primary);
  }
}

.calculator-card {
  min-height: 400px;
}

.results-card {
  min-height: 400px;
}

.calculator-card h2,
.results-card h2,
.evolution-card h2,
.chart-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.calculator-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol,
.percentage-symbol {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  z-index: 1;
}

.percentage-symbol {
  left: auto;
  right: 12px;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px;
  padding-left: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
}

.input-wrapper input[id="interestRate"] {
  padding-left: 16px;
  padding-right: 32px;
}

.period-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.period-input-wrapper input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
}

.period-select,
.capitalization-select {
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}



.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.result-item {
  text-align: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.result-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  
  &.final-value {
    color: var(--accent-primary);
  }
  
  &.interest-value {
    color: var(--info-color);
  }
  
  &.initial-value {
    color: var(--text-primary);
  }
  
  &.profit-value {
    color: var(--warning-color);
  }
}

.table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.evolution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.evolution-table th,
.evolution-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary);
}

.evolution-table th {
  background: var(--bg-primary);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.evolution-table td {
  color: var(--text-secondary);
}

.evolution-table tr.highlight {
  background: rgba(var(--accent-primary-rgb), 0.05);
}

.evolution-table tr:hover {
  background: var(--bg-overlay);
}

.chart-container {
  height: 400px;
  position: relative;
}

/* Forçar fundo do gráfico via CSS - VERSÃO SUPER AGRESSIVA */
.chart-container canvas {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Estilos específicos para modo dark */
[data-theme="dark"] .chart-container canvas {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Estilos específicos para modo light */
[data-theme="light"] .chart-container canvas {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Forçar fundo também no container */
.chart-container {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Estilos específicos para modo dark no container */
[data-theme="dark"] .chart-container {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Estilos específicos para modo light no container */
[data-theme="light"] .chart-container {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .content-main {
    padding: 0 20px 20px;
  }
  
  .calculator-card,
  .results-card,
  .evolution-card,
  .chart-card {
    padding: 16px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .evolution-table {
    font-size: 12px;
  }
  
  .evolution-table th,
  .evolution-table td {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
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
</style>
