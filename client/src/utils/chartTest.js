// Teste para verificar se os gráficos estão funcionando
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// Dados de teste para os gráficos
const testBookmakersData = [
  { name: 'Bet365', count: 10 },
  { name: 'Betsson', count: 8 },
  { name: 'Betfair', count: 6 },
  { name: 'Pinnacle', count: 6 },
  { name: 'Kto', count: 5 },
  { name: 'Bet7k', count: 4 },
  { name: 'Betano', count: 3 },
  { name: 'Vbet', count: 3 },
  { name: 'Blaze', count: 2 },
  { name: 'Superbet', count: 2 }
]

const testTimelineData = [
  { date: '2024-01-15', count: 5 },
  { date: '2024-01-16', count: 8 },
  { date: '2024-01-17', count: 12 },
  { date: '2024-01-18', count: 6 },
  { date: '2024-01-19', count: 9 },
  { date: '2024-01-20', count: 15 },
  { date: '2024-01-21', count: 11 }
]

// Função para testar criação de gráfico de frequência
export function testFrequencyChart(canvasElement) {
  try {
    console.log('🧪 Testando criação do gráfico de frequência...')
    
    if (!canvasElement) {
      console.error('❌ Elemento canvas não fornecido')
      return false
    }
    
    const ctx = canvasElement.getContext('2d')
    if (!ctx) {
      console.error('❌ Não foi possível obter o contexto 2D do canvas')
      return false
    }
    
    const labels = testBookmakersData.map(b => b.name)
    const data = testBookmakersData.map(b => b.count)
    
    console.log('📊 Dados de teste:', { labels, data })
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Frequência',
          data: data,
          backgroundColor: 'rgba(0, 255, 136, 0.8)',
          borderColor: '#00ff88',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#00ff88'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              },
              maxRotation: 45
            }
          }
        }
      }
    })
    
    console.log('✅ Gráfico de frequência criado com sucesso:', chart)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao criar gráfico de frequência:', error)
    return false
  }
}

// Função para testar criação de gráfico de timeline
export function testTimelineChart(canvasElement) {
  try {
    console.log('🧪 Testando criação do gráfico de timeline...')
    
    if (!canvasElement) {
      console.error('❌ Elemento canvas não fornecido')
      return false
    }
    
    const ctx = canvasElement.getContext('2d')
    if (!ctx) {
      console.error('❌ Não foi possível obter o contexto 2D do canvas')
      return false
    }
    
    const labels = testTimelineData.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    const data = testTimelineData.map(d => d.count)
    
    console.log('📊 Dados de timeline de teste:', { labels, data })
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Surebets por Dia',
          data: data,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#00ff88',
          pointBorderColor: '#ffffff',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#00ff88'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              },
              maxRotation: 45
            }
          }
        }
      }
    })
    
    console.log('✅ Gráfico de timeline criado com sucesso:', chart)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao criar gráfico de timeline:', error)
    return false
  }
}

// Função para executar todos os testes
export function runChartTests() {
  console.log('🧪 Iniciando testes dos gráficos...')
  
  // Testar se Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js não está disponível')
    return false
  }
  
  console.log('✅ Chart.js está disponível')
  
  // Testar se os registros estão funcionando
  try {
    const testChart = new Chart(document.createElement('canvas'), {
      type: 'bar',
      data: { labels: [], datasets: [] }
    })
    testChart.destroy()
    console.log('✅ Chart.js está funcionando corretamente')
  } catch (error) {
    console.error('❌ Erro ao testar Chart.js:', error)
    return false
  }
  
  return true
}

// Função para verificar se o canvas está funcionando
export function testCanvas(canvasElement) {
  try {
    console.log('🧪 Testando canvas...')
    
    if (!canvasElement) {
      console.error('❌ Elemento canvas não fornecido')
      return false
    }
    
    const ctx = canvasElement.getContext('2d')
    if (!ctx) {
      console.error('❌ Não foi possível obter o contexto 2D')
      return false
    }
    
    // Testar desenho básico
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(0, 0, 10, 10)
    
    console.log('✅ Canvas está funcionando corretamente')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao testar canvas:', error)
    return false
  }
}
