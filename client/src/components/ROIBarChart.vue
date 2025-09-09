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
              console.log('✅ Gráfico de ROI destruído com sucesso')
            } else {
              console.log('⚠️ Canvas não encontrado, forçando limpeza')
            }
          }
          this.chart = null
        }
      } catch (error) {
        console.warn('⚠️ Erro ao destruir gráfico de ROI:', error.message)
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
            console.log('🎨 [ROIBarChart] Mudança de tema detectada')
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
        type: 'bar',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
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
                color: this.getThemeColor('--border-primary', '#404040')
              },
              ticks: {
                color: this.getThemeColor('--text-primary', '#ffffff'),
                callback: (value) => {
                  return `${value.toFixed(1)}%`
                }
              }
            },
            y: {
              grid: {
                color: this.getThemeColor('--border-primary', '#404040')
              },
              ticks: {
                color: this.getThemeColor('--text-primary', '#ffffff'),
                maxTicksLimit: 10
              }
            }
          },
          elements: {
            bar: {
              backgroundColor: (context) => {
                const value = context.parsed.x
                if (value >= 0) {
                  return this.getThemeColor('--accent-primary', '#00ff88')
                } else {
                  return this.getThemeColor('--error-color', '#ff4444')
                }
              },
              borderColor: (context) => {
                const value = context.parsed.x
                if (value >= 0) {
                  return this.getThemeColor('--accent-secondary', '#00cc6a')
                } else {
                  return this.getThemeColor('--error-hover', '#ff6666')
                }
              },
              borderWidth: 1
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
      if (this.chart && typeof this.chart.update === 'function') {
        try {
          this.chart.data = this.getChartData()
          this.chart.update('active')
          
          // Forçar fundo após atualização
          setTimeout(() => {
            this.forceChartBackground()
          }, 100)
        } catch (error) {
          console.warn('⚠️ Erro ao atualizar gráfico de ROI, recriando:', error.message)
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
