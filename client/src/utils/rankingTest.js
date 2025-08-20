/**
 * Testes para o sistema de ranking
 * Este arquivo contém funções de teste para verificar o funcionamento correto
 * do cálculo de ROI e lucro médio
 */

// Dados de teste com valores conhecidos
export const testSurebets = [
  {
    id: 'test_001',
    bookmaker1: 'Bet365',
    bookmaker2: 'William Hill',
    profit: 15.50,
    roi: 3.2,
    createdAt: '2024-01-15T10:00:00Z',
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'Resultado Final',
    status: 'active'
  },
  {
    id: 'test_002',
    bookmaker1: 'Bet365',
    bookmaker2: 'Unibet',
    profit: 12.80,
    roi: 2.8,
    createdAt: '2024-01-14T15:30:00Z',
    sport: 'Futebol',
    event: 'Manchester United vs Liverpool',
    market: 'Resultado Final',
    status: 'active'
  },
  {
    id: 'test_003',
    bookmaker1: 'William Hill',
    bookmaker2: 'Betfair',
    profit: 18.20,
    roi: 4.1,
    createdAt: '2024-01-13T09:15:00Z',
    sport: 'Futebol',
    event: 'Real Madrid vs Barcelona',
    market: 'Resultado Final',
    status: 'active'
  },
  {
    id: 'test_004',
    bookmaker1: 'Betfair',
    bookmaker2: 'Unibet',
    profit: 22.10,
    roi: 4.8,
    createdAt: '2024-01-12T14:20:00Z',
    sport: 'Futebol',
    event: 'Bayern Munich vs Borussia Dortmund',
    market: 'Resultado Final',
    status: 'active'
  },
  {
    id: 'test_005',
    bookmaker1: 'Bet365',
    bookmaker2: 'Betfair',
    profit: 16.75,
    roi: 3.5,
    createdAt: '2024-01-11T09:45:00Z',
    sport: 'Futebol',
    event: 'PSG vs Marseille',
    market: 'Resultado Final',
    status: 'active'
  }
]

// Função para testar o cálculo de estatísticas dos bookmakers
export function testBookmakerStatsCalculation(surebets) {
  console.log('🧪 Iniciando teste de cálculo de estatísticas...')
  
  const bookmakerStats = {}
  
  // Processar cada surebet
  surebets.forEach(surebet => {
    console.log(`🔍 Processando surebet: ${surebet.id}`)
    console.log(`   Bookmaker1: ${surebet.bookmaker1}, ROI: ${surebet.roi}, Profit: ${surebet.profit}`)
    
    // Processar bookmaker1
    if (surebet.bookmaker1) {
      const bookmaker = surebet.bookmaker1.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        
        // Garantir que os valores são números válidos
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        
        console.log(`   Valores válidos - Profit: ${validProfit}, ROI: ${validROI}`)
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        // Calcular médias
        bookmakerStats[bookmaker].averageProfit = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalProfit / bookmakerStats[bookmaker].count : 0
        bookmakerStats[bookmaker].averageROI = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalROI / bookmakerStats[bookmaker].count : 0
        
        console.log(`   Estatísticas atualizadas para ${bookmaker}:`)
        console.log(`     Count: ${bookmakerStats[bookmaker].count}`)
        console.log(`     Total Profit: ${bookmakerStats[bookmaker].totalProfit}`)
        console.log(`     Total ROI: ${bookmakerStats[bookmaker].totalROI}`)
        console.log(`     Average Profit: ${bookmakerStats[bookmaker].averageProfit}`)
        console.log(`     Average ROI: ${bookmakerStats[bookmaker].averageROI}`)
      }
    }
    
    // Processar bookmaker2 se existir
    if (surebet.bookmaker2 && surebet.bookmaker2.trim()) {
      const bookmaker = surebet.bookmaker2.trim()
      if (bookmaker) {
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            id: bookmaker.toLowerCase().replace(/\s+/g, '-'),
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        
        // Garantir que os valores são números válidos
        const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
        const validROI = isNaN(surebet.roi) || surebet.roi === null || surebet.roi === undefined ? 0 : parseFloat(surebet.roi)
        
        console.log(`   Valores válidos para ${bookmaker} - Profit: ${validProfit}, ROI: ${validROI}`)
        
        bookmakerStats[bookmaker].totalProfit += validProfit
        bookmakerStats[bookmaker].totalROI += validROI
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        // Calcular médias
        bookmakerStats[bookmaker].averageProfit = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalProfit / bookmakerStats[bookmaker].count : 0
        bookmakerStats[bookmaker].averageROI = bookmakerStats[bookmaker].count > 0 ? bookmakerStats[bookmaker].totalROI / bookmakerStats[bookmaker].count : 0
        
        console.log(`   Estatísticas atualizadas para ${bookmaker}:`)
        console.log(`     Count: ${bookmakerStats[bookmaker].count}`)
        console.log(`     Total Profit: ${bookmakerStats[bookmaker].totalProfit}`)
        console.log(`     Total ROI: ${bookmakerStats[bookmaker].totalROI}`)
        console.log(`     Average Profit: ${bookmakerStats[bookmaker].averageProfit}`)
        console.log(`     Average ROI: ${bookmakerStats[bookmaker].averageROI}`)
      }
    }
  })
  
  // Calcular porcentagens
  const totalCount = Object.values(bookmakerStats).reduce((sum, stats) => sum + stats.count, 0)
  Object.values(bookmakerStats).forEach(stats => {
    stats.percentage = totalCount > 0 ? (stats.count / totalCount) * 100 : 0
  })
  
  console.log('📊 Resultados finais dos testes:')
  Object.values(bookmakerStats).forEach(stats => {
    console.log(`🏆 ${stats.name}:`)
    console.log(`   Count: ${stats.count}`)
    console.log(`   Total Profit: ${stats.totalProfit}`)
    console.log(`   Total ROI: ${stats.totalROI}`)
    console.log(`   Average Profit: ${stats.averageProfit}`)
    console.log(`   Average ROI: ${stats.averageROI}`)
    console.log(`   Percentage: ${stats.percentage.toFixed(1)}%`)
    console.log('')
  })
  
  return bookmakerStats
}

// Função para testar as funções de formatação
export function testFormattingFunctions() {
  console.log('🧪 Testando funções de formatação...')
  
  // Teste da função formatROI
  const testROIValues = [3.2, 2.8, 4.1, 4.8, 3.5, null, undefined, 'invalid', 0, -1.5]
  
  console.log('📊 Testando formatROI:')
  testROIValues.forEach(value => {
    const formatted = formatROI(value)
    console.log(`   Input: ${value} (${typeof value}) -> Output: ${formatted}`)
  })
  
  // Teste da função formatCurrency
  const testProfitValues = [15.50, 12.80, 18.20, 22.10, 16.75, null, undefined, 'invalid', 0, -5.25]
  
  console.log('💰 Testando formatCurrency:')
  testProfitValues.forEach(value => {
    const formatted = formatCurrency(value)
    console.log(`   Input: ${value} (${typeof value}) -> Output: ${formatted}`)
  })
  
  // Teste da função formatPercentage
  const testPercentageValues = [25.5, 12.3, 8.7, 45.2, 33.1, null, undefined, 'invalid', 0, -10.5]
  
  console.log('📈 Testando formatPercentage:')
  testPercentageValues.forEach(value => {
    const formatted = formatPercentage(value)
    console.log(`   Input: ${value} (${typeof value}) -> Output: ${formatted}`)
  })
}

// Função para testar as funções de classe CSS
export function testCSSClassFunctions() {
  console.log('🧪 Testando funções de classe CSS...')
  
  // Teste da função getROIClass
  const testROIClassValues = [3.2, 2.8, 4.1, 4.8, 3.5, 0, -1.5, null, undefined, 'invalid']
  
  console.log('🎨 Testando getROIClass:')
  testROIClassValues.forEach(value => {
    const cssClass = getROIClass(value)
    console.log(`   Input: ${value} (${typeof value}) -> CSS Class: ${cssClass}`)
  })
  
  // Teste da função getProfitClass
  const testProfitClassValues = [15.50, 12.80, 18.20, 22.10, 16.75, 0, -5.25, null, undefined, 'invalid']
  
  console.log('💵 Testando getProfitClass:')
  testProfitClassValues.forEach(value => {
    const cssClass = getProfitClass(value)
    console.log(`   Input: ${value} (${typeof value}) -> CSS Class: ${cssClass}`)
  })
}

// Funções de formatação para teste (simulando as do componente)
function formatROI(value) {
  // Verificar se o valor é válido
  if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
    return '0.00'
  }
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Verificar novamente se é um número válido
  if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
    return '0.00'
  }
  
  return numValue.toFixed(2)
}

function formatCurrency(value) {
  // Verificar se o valor é válido
  if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
    return 'R$ 0,00'
  }
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Verificar novamente se é um número válido
  if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue)
}

function formatPercentage(value) {
  // Verificar se o valor é válido
  if (value === null || value === undefined || isNaN(value) || value === Infinity || value === -Infinity) {
    return '0.0'
  }
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  // Verificar novamente se é um número válido
  if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
    return '0.0'
  }
  
  return numValue.toFixed(1)
}

function getROIClass(roi) {
  // Garantir que o valor é um número válido
  const validROI = isNaN(roi) || roi === null || roi === undefined ? 0 : parseFloat(roi)
  return validROI > 0 ? 'positive' : validROI < 0 ? 'negative' : 'neutral'
}

function getProfitClass(profit) {
  // Garantir que o valor é um número válido
  const validProfit = isNaN(profit) || profit === null || profit === undefined ? 0 : parseFloat(profit)
  return validProfit > 0 ? 'positive' : validProfit < 0 ? 'negative' : 'neutral'
}

// Função principal para executar todos os testes
export function runAllTests() {
  console.log('🚀 Iniciando todos os testes do sistema de ranking...')
  console.log('=' .repeat(60))
  
  // Teste 1: Cálculo de estatísticas
  console.log('🧪 TESTE 1: Cálculo de estatísticas dos bookmakers')
  console.log('-' .repeat(40))
  const stats = testBookmakerStatsCalculation(testSurebets)
  
  console.log('=' .repeat(60))
  
  // Teste 2: Funções de formatação
  console.log('🧪 TESTE 2: Funções de formatação')
  console.log('-' .repeat(40))
  testFormattingFunctions()
  
  console.log('=' .repeat(60))
  
  // Teste 3: Funções de classe CSS
  console.log('🧪 TESTE 3: Funções de classe CSS')
  console.log('-' .repeat(40))
  testCSSClassFunctions()
  
  console.log('=' .repeat(60))
  console.log('✅ Todos os testes concluídos!')
  
  return stats
}

// Exportar para uso em outros arquivos
export default {
  testSurebets,
  testBookmakerStatsCalculation,
  testFormattingFunctions,
  testCSSClassFunctions,
  runAllTests
}
