const fetch = require('node-fetch')

// Configurações
const API_BASE = 'http://localhost:3002'
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTczNTQ5NzIwMCwiZXhwIjoxNzM1NTgzNjAwfQ.test' // Token de teste

// Dados de teste
const testData = [
  {
    surebet_id: 'api_test_1',
    house: 'Bet365',
    market: 'Over/Under 2.5',
    match: 'Teste API Cache 1',
    profit: 18.75,
    date: new Date().toISOString().split('T')[0],
    hour: 16,
    sport: 'Futebol',
    period: '90min',
    minutes: 0,
    anchorh1: null,
    anchorh2: null,
    chance: 82.3,
    status: 'active',
    metadata: {
      source: 'api_test',
      cache_type: 'daily',
      created_at: new Date().toISOString()
    }
  },
  {
    surebet_id: 'api_test_2',
    house: 'Betwarrior',
    market: 'Resultado Final',
    match: 'Teste API Cache 2',
    profit: 25.60,
    date: new Date().toISOString().split('T')[0],
    hour: 17,
    sport: 'Futebol',
    period: '90min',
    minutes: 0,
    anchorh1: null,
    anchorh2: null,
    chance: 76.8,
    status: 'active',
    metadata: {
      source: 'api_test',
      cache_type: 'daily',
      created_at: new Date().toISOString()
    }
  }
]

async function testDailyCacheAPI() {
  console.log('🧪 Testando API de cache diário...')
  
  try {
    // 1. Testar endpoint de cache diário
    console.log('\n📡 Testando POST /api/surebet-stats/daily-cache...')
    
    const cacheResponse = await fetch(`${API_BASE}/api/surebet-stats/daily-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        stats: testData
      })
    })
    
    if (!cacheResponse.ok) {
      throw new Error(`Erro HTTP: ${cacheResponse.status} - ${cacheResponse.statusText}`)
    }
    
    const cacheResult = await cacheResponse.json()
    console.log('✅ Cache diário criado:', cacheResult.message)
    console.log('📊 Detalhes:', cacheResult.details)
    
    // 2. Testar busca dos dados inseridos
    console.log('\n🔍 Testando GET /api/surebet-stats (com filtro de data)...')
    
    const today = new Date().toISOString().split('T')[0]
    const searchResponse = await fetch(`${API_BASE}/api/surebet-stats?date=${today}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    })
    
    if (!searchResponse.ok) {
      throw new Error(`Erro HTTP: ${searchResponse.status} - ${searchResponse.statusText}`)
    }
    
    const searchResult = await searchResponse.json()
    console.log(`✅ Busca realizada: ${searchResult.count} registros encontrados`)
    
    if (searchResult.data && searchResult.data.length > 0) {
      console.log('📋 Dados encontrados:')
      searchResult.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.house} - ${item.market} - R$ ${item.profit}`)
      })
    }
    
    // 3. Testar atualização de cache (substituir dados)
    console.log('\n🔄 Testando atualização de cache...')
    
    const updatedData = testData.map(item => ({
      ...item,
      surebet_id: item.surebet_id + '_updated',
      profit: item.profit + 10, // Aumentar lucro
      metadata: {
        ...item.metadata,
        updated_at: new Date().toISOString(),
        version: '2.0'
      }
    }))
    
    const updateResponse = await fetch(`${API_BASE}/api/surebet-stats/daily-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        date: today,
        stats: updatedData
      })
    })
    
    if (!updateResponse.ok) {
      throw new Error(`Erro HTTP: ${updateResponse.status} - ${updateResponse.statusText}`)
    }
    
    const updateResult = await updateResponse.json()
    console.log('✅ Cache atualizado:', updateResult.message)
    console.log('📊 Detalhes da atualização:', updateResult.details)
    
    // 4. Verificar dados atualizados
    console.log('\n🔍 Verificando dados atualizados...')
    const finalSearchResponse = await fetch(`${API_BASE}/api/surebet-stats?date=${today}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    })
    
    const finalSearchResult = await finalSearchResponse.json()
    console.log(`✅ Dados finais: ${finalSearchResult.count} registros`)
    
    if (finalSearchResult.data && finalSearchResult.data.length > 0) {
      console.log('📋 Dados finais:')
      finalSearchResult.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.house} - ${item.market} - R$ ${item.profit} (${item.surebet_id})`)
      })
    }
    
    console.log('\n🎉 Teste da API de cache diário concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste da API:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Certifique-se de que o servidor backend está rodando na porta 3002')
    }
  }
}

// Executar teste
testDailyCacheAPI()

