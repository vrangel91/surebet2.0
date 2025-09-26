<template>
  <div class="roi-bar-chart">
    <div class="chart-header">
      <h3>ROI por Período</h3>
      <div class="chart-controls">
        <button @click="refreshChart" :disabled="isLoading" class="btn-refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas 
        ref="chartCanvas" 
        :key="chartKey"
        class="chart-canvas"
      ></canvas>
    </div>
    
    <div v-if="isLoading" class="chart-loading">
      <div class="spinner"></div>
      <p>Carregando dados...</p>
    </div>
    
    <div v-if="error" class="chart-error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="refreshChart" class="btn-retry">Tentar Novamente</button>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'ROIBarChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null,
      chartKey: 0,
      error: null,
      chartInstance: null
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    isLoading(newVal) {
      if (!newVal && this.data.length > 0) {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.initializeChart()
  },
  beforeUnmount() {
    this.destroyChart()
  },
  methods: {
    initializeChart() {
      try {
        this.destroyChart()
        this.chartKey++
        this.$nextTick(() => {
          this.createChart()
        })
      } catch (error) {
        console.error('Erro ao inicializar gráfico ROI:', error)
        this.error = 'Erro ao inicializar gráfico'
      }
    },
    
    createChart() {
      const ctx = this.$refs.chartCanvas
      if (!ctx) return
      
      try {
        // Destruir gráfico existente
        this.destroyChart()
        
        // Aguardar um frame para garantir que o canvas esteja limpo
        requestAnimationFrame(() => {
          if (!this.$refs.chartCanvas) return
          
          const chartData = this.prepareChartData()
          
          this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 800,
                easing: 'easeInOutQuad'
              },
              plugins: {
                title: {
                  display: true,
                  text: 'ROI por Período',
                  color: this.getThemeColor('text-primary'),
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                },
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    color: this.getThemeColor('text-primary'),
                    usePointStyle: true,
                    padding: 20,
                    generateLabels: (chart) => {
                      const datasets = chart.data.datasets;
                      return datasets.map((dataset, i) => ({
                        text: dataset.label || `Dataset ${i + 1}`,
                        fillStyle: dataset.backgroundColor,
                        strokeStyle: dataset.borderColor,
                        lineWidth: dataset.borderWidth || 1,
                        pointStyle: dataset.pointStyle || 'circle',
                        hidden: !chart.isDatasetVisible(i),
                        datasetIndex: i
                      }));
                    }
                  }
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#00ff88',
                  borderColor: '#00ff88',
                  borderWidth: 1,
                  displayColors: true,
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Período',
                    color: this.getThemeColor('text-secondary')
                  },
                  ticks: {
                    color: this.getThemeColor('text-secondary')
                  },
                  grid: {
                    color: this.getThemeColor('border-primary'),
                    drawBorder: false
                  }
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: 'ROI (%)',
                    color: this.getThemeColor('text-secondary')
                  },
                  ticks: {
                    color: this.getThemeColor('text-secondary')
                  },
                  grid: {
                    color: this.getThemeColor('border-primary'),
                    drawBorder: false
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }
          })
          
          console.log('✅ Gráfico de ROI criado com sucesso')
        })
      } catch (error) {
        console.error('Erro ao criar gráfico ROI:', error)
        this.error = 'Erro ao criar gráfico'
      }
    },
    
    updateChart() {
      if (!this.chartInstance) {
        this.createChart()
        return
      }
      
      try {
        const chartData = this.prepareChartData()
        this.chartInstance.data = chartData
        this.chartInstance.update('none')
        console.log('✅ Gráfico de ROI atualizado')
      } catch (error) {
        console.error('Erro ao atualizar gráfico ROI:', error)
        this.error = 'Erro ao atualizar gráfico'
      }
    },
    
    prepareChartData() {
      if (!this.data || this.data.length === 0) {
        return {
          labels: [],
          datasets: [{
            label: 'ROI',
            data: [],
            backgroundColor: this.getThemeColor('accent-light'),
            borderColor: this.getThemeColor('accent-primary'),
            borderWidth: 1
          }]
        }
      }
      
      const labels = this.data.map(item => item.period || 'Período')
      const roiData = this.data.map(item => item.roi || 0)
      
      return {
        labels,
        datasets: [{
          label: 'ROI (%)',
          data: roiData,
          backgroundColor: this.getThemeColor('accent-light'),
          borderColor: this.getThemeColor('accent-primary'),
          borderWidth: 1
        }]
      }
    },
    
    destroyChart() {
      try {
        if (this.chartInstance) {
          this.chartInstance.destroy()
          this.chartInstance = null
          console.log('✅ Gráfico de ROI destruído')
        }
      } catch (error) {
        console.warn('⚠️ Erro ao destruir gráfico ROI:', error)
        this.chartInstance = null
      }
    },
    
    refreshChart() {
      this.error = null
      this.initializeChart()
    },
    
    getThemeColor(colorName) {
      // Função para obter cores do tema atual
      const computedStyle = getComputedStyle(document.documentElement)
      return computedStyle.getPropertyValue(`--${colorName}`).trim() || this.getFallbackColor(colorName)
    },
    
    getFallbackColor(colorName) {
      // Cores de fallback caso as variáveis CSS não estejam disponíveis
      const fallbackColors = {
        'accent-primary': '#00ff88',
        'accent-light': 'rgba(0, 255, 136, 0.1)',
        'text-primary': '#ffffff',
        'text-secondary': '#cccccc',
        'border-primary': '#404040'
      }
      return fallbackColors[colorName] || '#00ff88'
    }
  }
}
</script>

<style scoped>
/* Importação removida para evitar conflitos de build */

.roi-bar-chart {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow);
  position: relative;
  border: 1px solid var(--border-primary);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2em;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.btn-refresh {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.btn-refresh:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 10px;
}

.chart-canvas {
  max-width: 100%;
  max-height: 100%;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  border: 3px solid var(--border-primary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chart-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--error);
}

.chart-error i {
  font-size: 2em;
  margin-bottom: 10px;
}

.btn-retry {
  background: var(--error);
  color: var(--bg-primary);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-retry:hover {
  background: var(--error-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}
</style>