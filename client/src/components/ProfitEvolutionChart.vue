<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'ProfitEvolutionChart',
  props: {
    bets: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    bets: {
      handler: 'updateChart',
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.createChart()
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas
      if (!ctx) return
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#2a2a2a',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#404040',
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  return `Lucro: R$ ${context.parsed.y.toFixed(2)}`
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#b0b0b0',
                maxTicksLimit: 8
              }
            },
            y: {
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#b0b0b0',
                callback: (value) => {
                  return `R$ ${value.toFixed(2)}`
                }
              }
            }
          },
          elements: {
            point: {
              backgroundColor: '#00ff88',
              borderColor: '#00ff88',
              borderWidth: 2,
              radius: 4,
              hoverRadius: 6
            },
            line: {
              borderColor: '#00ff88',
              borderWidth: 3,
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              fill: true
            }
          }
        }
      })
    },
    
    getChartData() {
      if (!this.bets || this.bets.length === 0) {
        return {
          labels: ['Sem dados'],
          datasets: [{
            data: [0],
            label: 'Lucro Acumulado'
          }]
        }
      }

      // Ordena as apostas por data
      const sortedBets = [...this.bets].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // Calcula lucro acumulado
      let accumulatedProfit = 0
      const labels = []
      const data = []
      
      sortedBets.forEach((bet, index) => {
        accumulatedProfit += bet.profit || 0
        labels.push(this.formatDate(bet.date))
        data.push(accumulatedProfit)
      })
      
      return {
        labels,
        datasets: [{
          data,
          label: 'Lucro Acumulado'
        }]
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    updateChart() {
      if (this.chart) {
        this.chart.data = this.getChartData()
        this.chart.update('active')
      } else {
        this.$nextTick(() => {
          this.createChart()
        })
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
