<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'ROIBarChart',
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
        type: 'bar',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
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
                title: (context) => {
                  return context[0].label
                },
                label: (context) => {
                  return `ROI: ${context.parsed.x.toFixed(2)}%`
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
                callback: (value) => {
                  return `${value.toFixed(1)}%`
                }
              }
            },
            y: {
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#b0b0b0',
                maxTicksLimit: 10
              }
            }
          },
          elements: {
            bar: {
              backgroundColor: (context) => {
                const value = context.parsed.x
                if (value >= 0) {
                  return '#00ff88'
                } else {
                  return '#ff4444'
                }
              },
              borderColor: (context) => {
                const value = context.parsed.x
                if (value >= 0) {
                  return '#00cc6a'
                } else {
                  return '#cc3333'
                }
              },
              borderWidth: 1
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
            label: 'ROI por Aposta'
          }]
        }
      }

      // Pega as últimas 10 apostas para o gráfico
      const recentBets = [...this.bets]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .reverse()
      
      const labels = recentBets.map(bet => {
        const matchName = bet.match && bet.match.length > 20 
          ? bet.match.substring(0, 20) + '...' 
          : bet.match || 'Partida'
        return `${matchName} (${bet.sport || 'Esporte'})`
      })
      
      const data = recentBets.map(bet => bet.roi || 0)
      
      return {
        labels,
        datasets: [{
          data,
          label: 'ROI por Aposta'
        }]
      }
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
