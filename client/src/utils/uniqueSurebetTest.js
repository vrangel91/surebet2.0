/**
 * Teste para verificar a lógica de identificação única de surebets
 * e contagem correta de bookmakers
 */

// Função para gerar ID único (copiada do RankingView.vue)
function generateUniqueSurebetId(surebet) {
  const fields = [
    surebet.bookmaker1,
    surebet.bookmaker2,
    surebet.sport,
    surebet.event,
    surebet.market,
    surebet.odds1,
    surebet.odds2,
    surebet.createdAt
  ].filter(Boolean).join('|')
  
  let hash = 0
  for (let i = 0; i < fields.length; i++) {
    const char = fields.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return `surebet_${Math.abs(hash)}`
}

// Dados de teste com surebets duplicadas
const testSurebets = [
  // Surebet 1 - Bet365 + William Hill
  {
    id: 'surebet_001',
    bookmaker1: 'Bet365',
    bookmaker2: 'William Hill',
    profit: 15.50,
    roi: 3.2,
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'Resultado Final',
    odds1: 2.10,
    odds2: 1.85,
    createdAt: '2024-01-15T10:00:00Z'
  },
  // Surebet 2 - MESMA surebet (duplicada)
  {
    id: 'surebet_001_copy',
    bookmaker1: 'Bet365',
    bookmaker2: 'William Hill',
    profit: 15.50,
    roi: 3.2,
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'Resultado Final',
    odds1: 2.10,
    odds2: 1.85,
    createdAt: '2024-01-15T10:00:00Z'
  },
  // Surebet 3 - Bet365 + Unibet (diferente)
  {
    id: 'surebet_002',
    bookmaker1: 'Bet365',
    bookmaker2: 'Unibet',
    profit: 12.80,
    roi: 2.8,
    sport: 'Futebol',
    event: 'Manchester United vs Liverpool',
    market: 'Resultado Final',
    odds1: 1.95,
    odds2: 2.05,
    createdAt: '2024-01-14T15:30:00Z'
  },
  // Surebet 4 - William Hill + Betfair
  {
    id: 'surebet_003',
    bookmaker1: 'William Hill',
    bookmaker2: 'Betfair',
    profit: 18.20,
    roi: 4.1,
    sport: 'Futebol',
    event: 'Real Madrid vs Barcelona',
    market: 'Resultado Final',
    odds1: 2.20,
    odds2: 1.75,
    createdAt: '2024-01-13T09:15:00Z'
  },
  // Surebet 5 - Bet365 + Bet365 (mesmo bookmaker - deve ser ignorado)
  {
    id: 'surebet_004',
    bookmaker1: 'Bet365',
    bookmaker2: 'Bet365',
    profit: 10.00,
    roi: 2.0,
    sport: 'Futebol',
    event: 'Bayern vs Dortmund',
    market: 'Resultado Final',
    odds1: 1.80,
    odds2: 2.10,
    createdAt: '2024-01-12T14:20:00Z'
  }
]

// Função para processar estatísticas (simulando a lógica do RankingView.vue)
function processBookmakerStats(surebets) {
  const bookmakerStats = {}
  const processedUniqueSurebets = new Set()
  
  console.log('🔄 Processando', surebets.length, 'surebets...')
  
  surebets.forEach((surebet, index) => {
    // Gerar ID único para a surebet
    const uniqueSurebetId = generateUniqueSurebetId(surebet)
    
    // Verificar se já processamos esta surebet única
    if (processedUniqueSurebets.has(uniqueSurebetId)) {
      console.log(`⚠️ Surebet ${index + 1} duplicada ignorada (ID único):`, uniqueSurebetId)
      return
    }
    processedUniqueSurebets.add(uniqueSurebetId)
    
    console.log(`🔍 Processando surebet ${index + 1} única:`, uniqueSurebetId, 'com bookmakers:', surebet.bookmaker1, surebet.bookmaker2)
    
    // Set para evitar duplicatas de bookmakers dentro da mesma surebet
    const bookmakersInThisSurebet = new Set()
    
    // Processar bookmaker1
    if (surebet.bookmaker1) {
      const bookmaker = surebet.bookmaker1.trim()
      if (bookmaker && !bookmakersInThisSurebet.has(bookmaker)) {
        bookmakersInThisSurebet.add(bookmaker)
        
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        bookmakerStats[bookmaker].totalProfit += surebet.profit || 0
        bookmakerStats[bookmaker].totalROI += surebet.roi || 0
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        console.log(`✅ ${bookmaker} +1 (total: ${bookmakerStats[bookmaker].count})`)
      }
    }
    
    // Processar bookmaker2 se existir e for diferente
    if (surebet.bookmaker2 && surebet.bookmaker2.trim()) {
      const bookmaker = surebet.bookmaker2.trim()
      if (bookmaker && !bookmakersInThisSurebet.has(bookmaker)) {
        bookmakersInThisSurebet.add(bookmaker)
        
        if (!bookmakerStats[bookmaker]) {
          bookmakerStats[bookmaker] = {
            name: bookmaker,
            count: 0,
            totalProfit: 0,
            totalROI: 0,
            surebets: []
          }
        }
        
        bookmakerStats[bookmaker].count++
        bookmakerStats[bookmaker].totalProfit += surebet.profit || 0
        bookmakerStats[bookmaker].totalROI += surebet.roi || 0
        bookmakerStats[bookmaker].surebets.push(surebet)
        
        console.log(`✅ ${bookmaker} +1 (total: ${bookmakerStats[bookmaker].count})`)
      }
    }
  })
  
  return {
    bookmakerStats,
    processedUniqueSurebets: processedUniqueSurebets.size,
    totalSurebetsOriginal: surebets.length
  }
}

// Função para executar os testes
export function runUniqueSurebetTests() {
  console.log('🧪 Iniciando testes de identificação única de surebets...')
  console.log('=' .repeat(60))
  
  // Teste 1: Verificar IDs únicos
  console.log('📋 Teste 1: Verificação de IDs únicos')
  testSurebets.forEach((surebet, index) => {
    const uniqueId = generateUniqueSurebetId(surebet)
    console.log(`Surebet ${index + 1}: ${uniqueId}`)
  })
  
  console.log('=' .repeat(60))
  
  // Teste 2: Processar estatísticas
  console.log('📊 Teste 2: Processamento de estatísticas')
  const result = processBookmakerStats(testSurebets)
  
  console.log('=' .repeat(60))
  
  // Teste 3: Verificar resultados
  console.log('✅ Teste 3: Verificação dos resultados')
  console.log('📈 Resumo:')
  console.log(`- Surebets originais: ${result.totalSurebetsOriginal}`)
  console.log(`- Surebets únicas processadas: ${result.processedUniqueSurebets}`)
  console.log(`- Bookmakers únicos: ${Object.keys(result.bookmakerStats).length}`)
  
  console.log('\n📊 Contagem por bookmaker:')
  Object.entries(result.bookmakerStats)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([name, stats]) => {
      console.log(`- ${name}: ${stats.count} surebets (ROI médio: ${(stats.totalROI / stats.count).toFixed(2)}%)`)
    })
  
  // Teste 4: Verificar se a lógica está correta
  console.log('\n🔍 Teste 4: Verificação da lógica')
  const expectedResults = {
    'Bet365': 3, // 3 surebets únicas (1, 3, 5)
    'William Hill': 2, // 2 surebets únicas (1, 4)
    'Unibet': 1, // 1 surebet única (3)
    'Betfair': 1 // 1 surebet única (4)
  }
  
  let allCorrect = true
  Object.entries(expectedResults).forEach(([bookmaker, expectedCount]) => {
    const actualCount = result.bookmakerStats[bookmaker]?.count || 0
    const status = actualCount === expectedCount ? '✅' : '❌'
    console.log(`${status} ${bookmaker}: esperado ${expectedCount}, obtido ${actualCount}`)
    if (actualCount !== expectedCount) allCorrect = false
  })
  
  console.log('\n' + '=' .repeat(60))
  console.log(allCorrect ? '🎉 TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM!')
  console.log('=' .repeat(60))
  
  return {
    success: allCorrect,
    results: result,
    expectedResults
  }
}

// Função para testar apenas a geração de IDs únicos
export function testUniqueIdGeneration() {
  console.log('🔍 Testando geração de IDs únicos...')
  
  const testCases = [
    {
      name: 'Surebet idêntica',
      surebet1: {
        bookmaker1: 'Bet365',
        bookmaker2: 'William Hill',
        sport: 'Futebol',
        event: 'Brasil vs Argentina',
        market: 'Resultado Final',
        odds1: 2.10,
        odds2: 1.85,
        createdAt: '2024-01-15T10:00:00Z'
      },
      surebet2: {
        bookmaker1: 'Bet365',
        bookmaker2: 'William Hill',
        sport: 'Futebol',
        event: 'Brasil vs Argentina',
        market: 'Resultado Final',
        odds1: 2.10,
        odds2: 1.85,
        createdAt: '2024-01-15T10:00:00Z'
      },
      shouldBeEqual: true
    },
    {
      name: 'Surebet diferente (bookmaker)',
      surebet1: {
        bookmaker1: 'Bet365',
        bookmaker2: 'William Hill',
        sport: 'Futebol',
        event: 'Brasil vs Argentina',
        market: 'Resultado Final',
        odds1: 2.10,
        odds2: 1.85,
        createdAt: '2024-01-15T10:00:00Z'
      },
      surebet2: {
        bookmaker1: 'Bet365',
        bookmaker2: 'Unibet', // Diferente
        sport: 'Futebol',
        event: 'Brasil vs Argentina',
        market: 'Resultado Final',
        odds1: 2.10,
        odds2: 1.85,
        createdAt: '2024-01-15T10:00:00Z'
      },
      shouldBeEqual: false
    }
  ]
  
  testCases.forEach((testCase, index) => {
    const id1 = generateUniqueSurebetId(testCase.surebet1)
    const id2 = generateUniqueSurebetId(testCase.surebet2)
    const areEqual = id1 === id2
    const status = areEqual === testCase.shouldBeEqual ? '✅' : '❌'
    
    console.log(`${status} Teste ${index + 1}: ${testCase.name}`)
    console.log(`   ID1: ${id1}`)
    console.log(`   ID2: ${id2}`)
    console.log(`   Iguais: ${areEqual} (esperado: ${testCase.shouldBeEqual})`)
    console.log('')
  })
}
