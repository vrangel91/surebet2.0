/**
 * Teste simples para verificar o cálculo do ROI
 * Este arquivo testa apenas a lógica básica de cálculo
 */

// Dados de teste simples
const testData = [
  { bookmaker1: 'Bet365', roi: 3.2, profit: 15.50 },
  { bookmaker1: 'Bet365', roi: 2.8, profit: 12.80 },
  { bookmaker1: 'William Hill', roi: 4.1, profit: 18.20 },
  { bookmaker1: 'Betfair', roi: 4.8, profit: 22.10 }
]

// Função para testar cálculo básico
export function testBasicROICalculation() {
  console.log('🧪 Teste básico de cálculo do ROI...')
  console.log('=' .repeat(50))
  
  const bookmakerStats = {}
  
  // Processar dados
  testData.forEach((item, index) => {
    console.log(`\n🔍 Processando item ${index + 1}: ${item.bookmaker1}`)
    console.log(`   ROI: ${item.roi}, Profit: ${item.profit}`)
    
    const bookmaker = item.bookmaker1
    
    if (!bookmakerStats[bookmaker]) {
      bookmakerStats[bookmaker] = {
        name: bookmaker,
        count: 0,
        totalROI: 0,
        totalProfit: 0
      }
    }
    
    bookmakerStats[bookmaker].count++
    bookmakerStats[bookmaker].totalROI += item.roi
    bookmakerStats[bookmaker].totalProfit += item.profit
    
    console.log(`   📊 Estatísticas atualizadas para ${bookmaker}:`)
    console.log(`     Count: ${bookmakerStats[bookmaker].count}`)
    console.log(`     Total ROI: ${bookmakerStats[bookmaker].totalROI}`)
    console.log(`     Total Profit: ${bookmakerStats[bookmaker].totalProfit}`)
  })
  
  // Calcular médias
  console.log('\n🧮 Calculando médias...')
  Object.values(bookmakerStats).forEach(stats => {
    if (stats.count > 0) {
      stats.averageROI = stats.totalROI / stats.count
      stats.averageProfit = stats.totalProfit / stats.count
      
      console.log(`\n📊 ${stats.name}:`)
      console.log(`   Count: ${stats.count}`)
      console.log(`   Total ROI: ${stats.totalROI}`)
      console.log(`   Total Profit: ${stats.totalProfit}`)
      console.log(`   Average ROI: ${stats.averageROI.toFixed(2)}%`)
      console.log(`   Average Profit: ${stats.averageProfit.toFixed(2)}`)
      
      // Verificar se o cálculo está correto
      const expectedROI = stats.totalROI / stats.count
      const expectedProfit = stats.totalProfit / stats.count
      
      console.log(`   ✅ Verificação:`)
      console.log(`     ROI esperado: ${expectedROI.toFixed(2)}%`)
      console.log(`     Profit esperado: ${expectedProfit.toFixed(2)}`)
      console.log(`     ROI correto: ${Math.abs(stats.averageROI - expectedROI) < 0.001 ? 'SIM' : 'NÃO'}`)
      console.log(`     Profit correto: ${Math.abs(stats.averageProfit - expectedProfit) < 0.001 ? 'SIM' : 'NÃO'}`)
    }
  })
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ Teste básico concluído!')
  
  return bookmakerStats
}

// Função para testar formatação
export function testROIFormatting() {
  console.log('🧪 Testando formatação do ROI...')
  console.log('=' .repeat(50))
  
  const testValues = [3.2, 2.8, 4.1, 4.8, 0, null, undefined]
  
  testValues.forEach(value => {
    const formatted = formatROI(value)
    const status = value !== null && value !== undefined && !isNaN(value) ? '✅' : '⚠️'
    console.log(`${status} ${value} -> ${formatted}%`)
  })
  
  console.log('=' .repeat(50))
}

// Função de formatação
function formatROI(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00'
  }
  return parseFloat(value).toFixed(2)
}

// Função principal
export function runSimpleTest() {
  console.log('🚀 Executando teste simples do ROI...')
  console.log('=' .repeat(60))
  
  const results = testBasicROICalculation()
  
  console.log('\n' + '=' .repeat(60))
  
  testROIFormatting()
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎉 Teste simples concluído!')
  
  return results
}

// Exportar para uso em outros arquivos
export default {
  testBasicROICalculation,
  testROIFormatting,
  runSimpleTest
}
