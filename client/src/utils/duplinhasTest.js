// Teste para a funcionalidade das Duplinhas (pares de bookmakers)
// Testa a nova lógica de agrupamento por surebet_id

// Dados de teste simulando a estrutura real da API
const testSurebets = [
  // Surebet 1: Bet365 + Kto
  {
    surebet_id: 'surebet_record_3BLO1tNqcD6B',
    house: 'Bet365',
    profit: 6.33,
    stake: 100,
    createdAt: '2025-01-20T11:00:00Z'
  },
  {
    surebet_id: 'surebet_record_3BLO1tNqcD6B',
    house: 'Kto',
    profit: 5.00,
    stake: 100,
    createdAt: '2025-01-20T11:00:00Z'
  },
  
  // Surebet 2: Bet365 + Superbet
  {
    surebet_id: 'surebet_record_ABC123',
    house: 'Bet365',
    profit: 8.50,
    stake: 150,
    createdAt: '2025-01-20T12:00:00Z'
  },
  {
    surebet_id: 'surebet_record_ABC123',
    house: 'Superbet',
    profit: 7.20,
    stake: 150,
    createdAt: '2025-01-20T12:00:00Z'
  },
  
  // Surebet 3: Bet365 + Kto (repetição da primeira dupla)
  {
    surebet_id: 'surebet_record_DEF456',
    house: 'Bet365',
    profit: 4.20,
    stake: 80,
    createdAt: '2025-01-20T13:00:00Z'
  },
  {
    surebet_id: 'surebet_record_DEF456',
    house: 'Kto',
    profit: 3.80,
    stake: 80,
    createdAt: '2025-01-20T13:00:00Z'
  },
  
  // Surebet 4: Kto + Superbet
  {
    surebet_id: 'surebet_record_GHI789',
    house: 'Kto',
    profit: 9.10,
    stake: 200,
    createdAt: '2025-01-20T14:00:00Z'
  },
  {
    surebet_id: 'surebet_record_GHI789',
    house: 'Superbet',
    profit: 8.90,
    stake: 200,
    createdAt: '2025-01-20T14:00:00Z'
  },
  
  // Surebet 5: Bet365 + Kto + Superbet (3 casas)
  {
    surebet_id: 'surebet_record_JKL012',
    house: 'Bet365',
    profit: 12.00,
    stake: 300,
    createdAt: '2025-01-20T15:00:00Z'
  },
  {
    surebet_id: 'surebet_record_JKL012',
    house: 'Kto',
    profit: 11.50,
    stake: 300,
    createdAt: '2025-01-20T15:00:00Z'
  },
  {
    surebet_id: 'surebet_record_JKL012',
    house: 'Superbet',
    profit: 11.80,
    stake: 300,
    createdAt: '2025-01-20T15:00:00Z'
  }
]

// Função para processar estatísticas das duplinhas (nova lógica)
function processDuplinhasStats(surebets) {
  console.log('🔄 Processando estatísticas das duplinhas...')
  
  if (!surebets || !Array.isArray(surebets)) {
    console.log('⚠️ Surebets não é um array válido para duplinhas:', surebets)
    return []
  }
  
  // Objeto para armazenar estatísticas das duplinhas
  const duplinhasStats = {}
  
  // Agrupar surebets por surebet_id
  const surebetsByGroup = {}
  
  surebets.forEach(surebet => {
    // Usar surebet_id ou id como chave de agrupamento
    const surebetId = surebet.surebet_id || surebet.id
    
    if (!surebetId) {
      console.log('⚠️ Surebet sem ID válido:', surebet)
      return
    }
    
    if (!surebetsByGroup[surebetId]) {
      surebetsByGroup[surebetId] = []
    }
    
    surebetsByGroup[surebetId].push(surebet)
  })
  
  console.log('📊 Surebets agrupadas por ID:', Object.keys(surebetsByGroup).length, 'grupos únicos')
  
  // Processar cada grupo de surebet
  Object.entries(surebetsByGroup).forEach(([surebetId, surebetGroup]) => {
    console.log(`🔍 Processando surebet ${surebetId} com ${surebetGroup.length} apostas`)
    
    // Extrair casas únicas deste grupo
    const houses = new Set()
    let totalProfit = 0
    let totalInvestment = 0
    let lastAppearance = null
    
    surebetGroup.forEach(surebet => {
      // Adicionar casa (pode ser house, bookmaker1, ou bookmaker)
      const house = surebet.house || surebet.bookmaker1 || surebet.bookmaker
      if (house) {
        houses.add(house.trim())
      }
      
      // Acumular lucro (somar apenas uma vez por surebet)
      const validProfit = isNaN(surebet.profit) || surebet.profit === null || surebet.profit === undefined ? 0 : parseFloat(surebet.profit)
      totalProfit += validProfit
      
      // Acumular investimento (somar apenas uma vez por surebet)
      const validStake = isNaN(surebet.stake) || surebet.stake === null || surebet.stake === undefined ? 100 : parseFloat(surebet.stake)
      totalInvestment += validStake
      
      // Atualizar última aparição
      const surebetDate = new Date(surebet.createdAt || surebet.created_at || Date.now())
      if (!lastAppearance || surebetDate > lastAppearance) {
        lastAppearance = surebetDate
      }
    })
    
    // Converter para array e ordenar alfabeticamente
    const housesArray = Array.from(houses).sort()
    
    // Se temos pelo menos 2 casas, formar duplas
    if (housesArray.length >= 2) {
      // Para 2 casas: formar uma dupla
      if (housesArray.length === 2) {
        const duplaKey = housesArray.join('|')
        
        if (!duplinhasStats[duplaKey]) {
          duplinhasStats[duplaKey] = {
            id: duplaKey.toLowerCase().replace(/\s+/g, '-').replace(/\|/g, '-'),
            bookmaker1: housesArray[0],
            bookmaker2: housesArray[1],
            count: 0,
            totalProfit: 0,
            totalInvestment: 0,
            surebets: [],
            lastAppearance: null
          }
        }
        
        // Incrementar contador (uma vez por surebet)
        duplinhasStats[duplaKey].count++
        
        // Acumular valores (uma vez por surebet)
        duplinhasStats[duplaKey].totalProfit += totalProfit
        duplinhasStats[duplaKey].totalInvestment += totalInvestment
        duplinhasStats[duplaKey].surebets.push({
          id: surebetId,
          houses: housesArray,
          profit: totalProfit,
          investment: totalInvestment,
          createdAt: lastAppearance
        })
        
        // Atualizar última aparição
        if (!duplinhasStats[duplaKey].lastAppearance || lastAppearance > duplinhasStats[duplaKey].lastAppearance) {
          duplinhasStats[duplaKey].lastAppearance = lastAppearance
        }
        
        console.log(`✅ Dupla ${housesArray[0]} + ${housesArray[1]}: +1 (total: ${duplinhasStats[duplaKey].count})`)
      } else {
        // Para 3+ casas: formar todas as combinações possíveis de pares
        for (let i = 0; i < housesArray.length; i++) {
          for (let j = i + 1; j < housesArray.length; j++) {
            const duplaKey = [housesArray[i], housesArray[j]].join('|')
            
            if (!duplinhasStats[duplaKey]) {
              duplinhasStats[duplaKey] = {
                id: duplaKey.toLowerCase().replace(/\s+/g, '-').replace(/\|/g, '-'),
                bookmaker1: housesArray[i],
                bookmaker2: housesArray[j],
                count: 0,
                totalProfit: 0,
                totalInvestment: 0,
                surebets: [],
                lastAppearance: null
              }
            }
            
            // Incrementar contador (uma vez por surebet)
            duplinhasStats[duplaKey].count++
            
            // Acumular valores (uma vez por surebet)
            duplinhasStats[duplaKey].totalProfit += totalProfit
            duplinhasStats[duplaKey].totalInvestment += totalInvestment
            duplinhasStats[duplaKey].surebets.push({
              id: surebetId,
              houses: [housesArray[i], housesArray[j]],
              profit: totalProfit,
              investment: totalInvestment,
              createdAt: lastAppearance
            })
            
            // Atualizar última aparição
            if (!duplinhasStats[duplaKey].lastAppearance || lastAppearance > duplinhasStats[duplaKey].lastAppearance) {
              duplinhasStats[duplaKey].lastAppearance = lastAppearance
            }
            
            console.log(`✅ Dupla ${housesArray[i]} + ${housesArray[j]}: +1 (total: ${duplinhasStats[duplaKey].count})`)
          }
        }
      }
    } else {
      console.log(`⚠️ Surebet ${surebetId} com menos de 2 casas: ${housesArray.length} casas`)
    }
  })
  
  // Calcular médias e porcentagens para cada dupla
  const totalDuplinhasCount = Object.values(duplinhasStats).reduce((sum, stats) => sum + stats.count, 0)
  
  Object.values(duplinhasStats).forEach(stats => {
    // Calcular ROI médio ponderado
    if (stats.totalInvestment > 0) {
      stats.averageROI = (stats.totalProfit / stats.totalInvestment) * 100
    } else {
      stats.averageROI = 0
    }
    
    // Verificar se o ROI é válido
    if (isNaN(stats.averageROI) || stats.averageROI === Infinity || stats.averageROI === -Infinity) {
      console.warn(`⚠️ averageROI inválido para dupla ${stats.bookmaker1} + ${stats.bookmaker2}: ${stats.averageROI}, resetando para 0`)
      stats.averageROI = 0
    }
    
    // Calcular porcentagem
    stats.percentage = totalDuplinhasCount > 0 ? (stats.count / totalDuplinhasCount) * 100 : 0
    
    console.log(`📊 Dupla ${stats.bookmaker1} + ${stats.bookmaker2}: count=${stats.count}, totalProfit=${stats.totalProfit}, averageROI=${stats.averageROI}%`)
  })
  
  // Converter para array e ordenar por frequência
  const result = Object.values(duplinhasStats)
    .sort((a, b) => b.count - a.count)
  
  console.log('📊 Duplinhas processadas:', result.length, 'duplas únicas')
  console.log('🏆 Top 3 duplinhas:', result.slice(0, 3).map(d => `${d.bookmaker1} + ${d.bookmaker2}: ${d.count} surebets`))
  
  return result
}

// Função para executar os testes
export function runDuplinhasTests() {
  console.log('🏆 === TESTE DAS DUPLINHAS ===')
  console.log('📊 Dados de teste:', testSurebets.length, 'registros')
  
  // Mostrar estrutura dos dados
  console.log('🔍 Estrutura dos dados de teste:')
  testSurebets.forEach((surebet, index) => {
    console.log(`  ${index + 1}. surebet_id: ${surebet.surebet_id}, house: ${surebet.house}, profit: ${surebet.profit}`)
  })
  
  // Processar duplinhas
  const duplinhas = processDuplinhasStats(testSurebets)
  
  // Exibir resultados
  console.log('\n📊 === RESULTADOS DAS DUPLINHAS ===')
  duplinhas.forEach((dupla, index) => {
    console.log(`${index + 1}. ${dupla.bookmaker1} + ${dupla.bookmaker2}`)
    console.log(`   Frequência: ${dupla.count}`)
    console.log(`   Lucro Total: R$ ${dupla.totalProfit.toFixed(2)}`)
    console.log(`   Investimento Total: R$ ${dupla.totalInvestment.toFixed(2)}`)
    console.log(`   ROI Médio: ${dupla.averageROI.toFixed(2)}%`)
    console.log(`   % do Total: ${dupla.percentage.toFixed(1)}%`)
    console.log(`   Última Aparição: ${dupla.lastAppearance.toLocaleString()}`)
    console.log('')
  })
  
  // Validações
  console.log('✅ === VALIDAÇÕES ===')
  
  // Verificar se Bet365 + Kto aparece 3 vezes (2 surebets de 2 casas + 1 surebet de 3 casas)
  const bet365Kto = duplinhas.find(d => 
    (d.bookmaker1 === 'Bet365' && d.bookmaker2 === 'Kto') || 
    (d.bookmaker1 === 'Kto' && d.bookmaker2 === 'Bet365')
  )
  console.log(`✅ Bet365 + Kto: ${bet365Kto ? bet365Kto.count : 0} vezes (esperado: 3)`)
  
  // Verificar se Bet365 + Superbet aparece 2 vezes (1 surebet de 2 casas + 1 surebet de 3 casas)
  const bet365Superbet = duplinhas.find(d => 
    (d.bookmaker1 === 'Bet365' && d.bookmaker2 === 'Superbet') || 
    (d.bookmaker1 === 'Superbet' && d.bookmaker2 === 'Bet365')
  )
  console.log(`✅ Bet365 + Superbet: ${bet365Superbet ? bet365Superbet.count : 0} vezes (esperado: 2)`)
  
  // Verificar se Kto + Superbet aparece 2 vezes (1 surebet de 2 casas + 1 surebet de 3 casas)
  const ktoSuperbet = duplinhas.find(d => 
    (d.bookmaker1 === 'Kto' && d.bookmaker2 === 'Superbet') || 
    (d.bookmaker1 === 'Superbet' && d.bookmaker2 === 'Kto')
  )
  console.log(`✅ Kto + Superbet: ${ktoSuperbet ? ktoSuperbet.count : 0} vezes (esperado: 2)`)
  
  console.log('\n🎯 Teste das Duplinhas concluído!')
}

// Função para testar cenários específicos
export function testSpecificDuplinhasScenarios() {
  console.log('🔬 === TESTE DE CENÁRIOS ESPECÍFICOS ===')
  
  // Cenário 1: Surebet com apenas 1 casa (deve ser ignorada)
  const singleHouseSurebet = [
    {
      surebet_id: 'single_house_test',
      house: 'Bet365',
      profit: 10.00,
      stake: 100,
      createdAt: '2025-01-20T10:00:00Z'
    }
  ]
  
  console.log('🔍 Teste 1: Surebet com apenas 1 casa')
  const result1 = processDuplinhasStats(singleHouseSurebet)
  console.log(`Resultado: ${result1.length} duplas (esperado: 0)`)
  
  // Cenário 2: Surebet com 3 casas (deve gerar 3 duplas)
  const threeHouseSurebet = [
    {
      surebet_id: 'three_house_test',
      house: 'Bet365',
      profit: 15.00,
      stake: 150,
      createdAt: '2025-01-20T11:00:00Z'
    },
    {
      surebet_id: 'three_house_test',
      house: 'Kto',
      profit: 14.00,
      stake: 150,
      createdAt: '2025-01-20T11:00:00Z'
    },
    {
      surebet_id: 'three_house_test',
      house: 'Superbet',
      profit: 14.50,
      stake: 150,
      createdAt: '2025-01-20T11:00:00Z'
    }
  ]
  
  console.log('🔍 Teste 2: Surebet com 3 casas')
  const result2 = processDuplinhasStats(threeHouseSurebet)
  console.log(`Resultado: ${result2.length} duplas (esperado: 3)`)
  result2.forEach((dupla, index) => {
    console.log(`  ${index + 1}. ${dupla.bookmaker1} + ${dupla.bookmaker2}: ${dupla.count} vez`)
  })
  
  console.log('\n🎯 Teste de Cenários Específicos concluído!')
}
