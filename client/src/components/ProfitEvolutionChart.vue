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
      this.forceChartBackground()
      this.forceChartColors()
      
      // Observar mudanças de tema
      this.observeThemeChanges()
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
    
    // Limpar observer de tema
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
    
    // Limpar intervalo de verificação
    if (this.backgroundCheckInterval) {
      clearInterval(this.backgroundCheckInterval)
    }
  },
  methods: {
    // Método para obter cor do tema atual
    getThemeColor(cssVariable, fallback) {
      try {
        const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariable)
        return value || fallback
      } catch (error) {
        return fallback
      }
    },

    // Método para destruir gráfico de forma segura
    destroyChartSafely() {
      try {
        if (this.chart) {
          // Verificar se o gráfico ainda está ativo e tem método destroy
          if (typeof this.chart.destroy === 'function') {
            // Verificar se o canvas ainda existe e está no DOM
            if (this.chart.canvas && this.chart.canvas.parentNode) {
              this.chart.destroy()
              console.log('✅ Gráfico de evolução de lucro destruído com sucesso')
            } else {
              console.log('⚠️ Canvas não encontrado, forçando limpeza')
            }
          }
          this.chart = null
        }
      } catch (error) {
        console.warn('⚠️ Erro ao destruir gráfico de evolução de lucro:', error.message)
        // Forçar limpeza mesmo com erro
        this.chart = null
      }
    },
    
    // Método para forçar o fundo do gráfico
    forceChartBackground() {
      if (!this.chart) return
      
      const canvas = this.chart.canvas
      
      // Aplicar fundo via CSS inline com !important
      canvas.style.setProperty('background-color', this.getThemeColor('--bg-tertiary', '#2d2d2d'), 'important')
      canvas.style.setProperty('background', this.getThemeColor('--bg-tertiary', '#2d2d2d'), 'important')
      
      // Forçar redraw do gráfico
      this.chart.update('none')
      
      // Aplicar fundo diretamente no contexto 2D após um delay
      setTimeout(() => {
        if (this.chart && this.chart.ctx) {
          const chartCtx = this.chart.ctx
          const chartArea = this.chart.chartArea
          
          if (chartArea) {
            chartCtx.save()
            chartCtx.globalCompositeOperation = 'destination-over'
            chartCtx.fillStyle = this.getThemeColor('--bg-tertiary', '#2d2d2d')
            chartCtx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top)
            chartCtx.restore()
          }
        }
      }, 200)
    },
    
    // Método para forçar atualização das cores
    forceChartColors() {
      if (!this.chart) return
      
      // Atualizar cores dos elementos
      this.chart.options.elements.point.backgroundColor = this.getThemeColor('--accent-primary', '#00ff88')
      this.chart.options.elements.point.borderColor = this.getThemeColor('--accent-primary', '#00ff88')
      this.chart.options.elements.line.borderColor = this.getThemeColor('--accent-primary', '#00ff88')
      this.chart.options.elements.line.backgroundColor = this.getThemeColor('--accent-light', 'rgba(0, 255, 136, 0.1)')
      
      // Atualizar cores dos eixos
      this.chart.options.scales.x.grid.color = this.getThemeColor('--border-primary', '#404040')
      this.chart.options.scales.x.ticks.color = this.getThemeColor('--text-primary', '#ffffff')
      this.chart.options.scales.y.grid.color = this.getThemeColor('--border-primary', '#404040')
      this.chart.options.scales.y.ticks.color = this.getThemeColor('--text-primary', '#ffffff')
      
      // Atualizar cores dos tooltips
      this.chart.options.plugins.tooltip.backgroundColor = this.getThemeColor('--accent-primary', '#00ff88')
      this.chart.options.plugins.tooltip.titleColor = this.getThemeColor('--text-primary', '#ffffff')
      this.chart.options.plugins.tooltip.bodyColor = this.getThemeColor('--text-primary', '#ffffff')
      this.chart.options.plugins.tooltip.borderColor = this.getThemeColor('--accent-secondary', '#00cc6a')
      
      // Forçar redraw
      this.chart.update('none')
    },
    
    // Observar mudanças de tema
    observeThemeChanges() {
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
              console.log('🎨 Tema mudou detectado! Aplicando novas cores...')
              // Aguardar um pouco para o tema ser aplicado
              setTimeout(() => {
                this.forceChartBackground()
                this.forceChartColors()
              }, 100)
            }
          })
        })
        
        // Observar mudanças no atributo data-theme do html
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme']
        })
        
        // Guardar referência para limpeza
        this.themeObserver = observer
      }
      
      // Usar MutationObserver em vez de timer para detectar mudanças de tema
      this.setupThemeObserver()
      
      // Verificar tema atual e aplicar cores
      this.checkAndApplyTheme()
    },
    
    // Configurar observer para mudanças de tema
    setupThemeObserver() {
      if (this.themeObserver) {
        this.themeObserver.disconnect()
      }
      
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'data-theme' || 
               mutation.attributeName === 'class')) {
            console.log('🎨 [ProfitEvolutionChart] Mudança de tema detectada')
            this.checkAndApplyTheme()
          }
        })
      })
      
      // Observar mudanças no elemento html
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      })
    },

    // Verificar e aplicar tema atual
    checkAndApplyTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark'
      console.log(`🎯 Tema atual detectado: ${currentTheme}`)
      
      // Aplicar cores baseadas no tema atual
      if (this.chart) {
        this.forceChartColors()
      }
    },
    
    // Método público para forçar atualização de tema
    forceThemeUpdate() {
      console.log('🔄 Forçando atualização de tema...')
      this.forceChartBackground()
      this.forceChartColors()
    },
    
    createChart() {
      const ctx = this.$refs.chartCanvas
      if (!ctx) return
      
      // Destruir gráfico existente de forma segura
      this.destroyChartSafely()
      
      // Aguardar um pouco para garantir que o canvas esteja limpo
      setTimeout(() => {
        if (!this.$refs.chartCanvas) return
        
        this.chart = new Chart(ctx, {
        type: 'line',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // Configuração do fundo do gráfico
          backgroundColor: this.getThemeColor('--bg-tertiary', '#2d2d2d'),
          plugins: {
            // Plugin personalizado para fundo do canvas
            customCanvasBackgroundColor: {
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart) => {
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                
                // Forçar fundo da área de plotagem
                if (chartArea) {
                  ctx.save();
                  ctx.globalCompositeOperation = 'destination-over';
                  ctx.fillStyle = this.getThemeColor('--bg-tertiary', '#2d2d2d');
                  ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                  ctx.restore();
                }
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: this.getThemeColor('--accent-primary', '#00ff88'),
              titleColor: this.getThemeColor('--text-primary', '#ffffff'),
              bodyColor: this.getThemeColor('--text-primary', '#ffffff'),
              borderColor: this.getThemeColor('--accent-secondary', '#00cc6a'),
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
                color: this.getThemeColor('--border-primary', '#404040')
              },
              ticks: {
                color: this.getThemeColor('--text-primary', '#ffffff'),
                maxTicksLimit: 8
              }
            },
            y: {
              grid: {
                color: this.getThemeColor('--border-primary', '#404040')
              },
              ticks: {
                color: this.getThemeColor('--text-primary', '#ffffff'),
                callback: (value) => {
                  return `R$ ${value.toFixed(2)}`
                }
              }
            }
          },
          elements: {
            point: {
              backgroundColor: this.getThemeColor('--accent-primary', '#00ff88'),
              borderColor: this.getThemeColor('--accent-primary', '#00ff88'),
              borderWidth: 2,
              radius: 4,
              hoverRadius: 6
            },
            line: {
              borderColor: this.getThemeColor('--accent-primary', '#00ff88'),
              borderWidth: 3,
              backgroundColor: this.getThemeColor('--accent-light', 'rgba(0, 255, 136, 0.1)'),
              fill: true
            }
          }
        }
      })
      
      // Aplicar fundo e cores após criação
      setTimeout(() => {
        this.forceChartBackground()
        this.forceChartColors()
      }, 100)
      
      }, 50) // Pequeno delay para garantir limpeza do canvas
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
      if (this.chart && typeof this.chart.update === 'function') {
        try {
          this.chart.data = this.getChartData()
          this.chart.update('active')
          
          // Forçar fundo após atualização
          setTimeout(() => {
            this.forceChartBackground()
          }, 100)
        } catch (error) {
          console.warn('⚠️ Erro ao atualizar gráfico, recriando:', error.message)
          this.destroyChartSafely()
          this.$nextTick(() => {
            this.createChart()
          })
        }
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
  min-height: 200px;
  max-height: 100%;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}

/* Forçar fundo do gráfico via CSS */
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

/* Regras adicionais para forçar o fundo */
.chart-container canvas[style*="background"] {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}

/* Forçar fundo em todos os elementos do gráfico */
.chart-container * {
  background-color: var(--bg-tertiary) !important;
}

/* Regra específica para o canvas do Chart.js */
.chart-container canvas[width][height] {
  background-color: var(--bg-tertiary) !important;
  background: var(--bg-tertiary) !important;
}
</style>
