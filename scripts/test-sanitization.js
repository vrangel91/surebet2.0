const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/database.js')

// Função de sanitização (copiada do frontend)
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return str
  
  try {
    // Remover caracteres de controle e caracteres problemáticos
    let sanitized = str
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Caracteres de controle
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Manter apenas caracteres válidos
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim()
    
    // Se a string ficou vazia após sanitização, retornar valor padrão
    if (!sanitized) return 'Não especificado'
    
    return sanitized
  } catch (error) {
    console.warn('Erro ao sanitizar string:', error)
    return 'Não especificado'
  }
}

// Dados de teste com caracteres problemáticos
const testData = [
  {
    surebet_id: 'surebet_test_1',
    house: 'Bet365',
    market: 'Ekitike, Hugo - Over(1) - Player Shots on Target',
    match: 'Evento não especificado',
    profit: 11.97,
    date: '2025-08-31',
    hour: 12,
    sport: 'Futebol',
    period: null,
    minutes: 1,
    anchorh1: null,
    anchorh2: null,
    chance: null,
    metadata: {
      source: 'external_api',
      timestamp: '2025-08-31T12:30',
      selection1: null,
      selection2: null,
      selection3: null,
      odds1: null,
      odds2: null,
      odds3: null,
      stake: 100,
      status: 'active',
      processed_at: new Date().toISOString()
    }
  },
  {
    surebet_id: 'surebet_test_2',
    house: 'Betwarrior',
    market: 'Ekitike, Hugo - Under(1.5) - Player Shots on Target',
    match: 'Evento não especificado',
    profit: 11.97,
    date: '2025-08-31',
    hour: 12,
    sport: 'Futebol',
    period: null,
    minutes: 1,
    anchorh1: null,
    anchorh2: null,
    chance: null,
    metadata: {
      source: 'external_api',
      timestamp: '2025-08-31T12:30',
      selection1: null,
      selection2: null,
      selection3: null,
      odds1: null,
      odds2: null,
      odds3: null,
      stake: 100,
      status: 'active',
      processed_at: new Date().toISOString()
    }
  }
]

async function testSanitization() {
  console.log('🧪 Testando sanitização de strings...')
  
  try {
    // Testar sanitização
    testData.forEach((item, index) => {
      console.log(`\n📊 Item ${index + 1}:`)
      console.log(`Original surebet_id: "${item.surebet_id}"`)
      console.log(`Original house: "${item.house}"`)
      console.log(`Original market: "${item.market}"`)
      
      const sanitizedId = sanitizeString(item.surebet_id)
      const sanitizedHouse = sanitizeString(item.house)
      const sanitizedMarket = sanitizeString(item.market)
      
      console.log(`Sanitizado surebet_id: "${sanitizedId}"`)
      console.log(`Sanitizado house: "${sanitizedHouse}"`)
      console.log(`Sanitizado market: "${sanitizedMarket}"`)
      
      // Verificar se há diferenças
      if (sanitizedId !== item.surebet_id) {
        console.log('⚠️  surebet_id foi alterado pela sanitização')
      }
      if (sanitizedHouse !== item.house) {
        console.log('⚠️  house foi alterado pela sanitização')
      }
      if (sanitizedMarket !== item.market) {
        console.log('⚠️  market foi alterado pela sanitização')
      }
    })
    
    // Testar com strings problemáticas
    console.log('\n🧪 Testando strings problemáticas:')
    const problematicStrings = [
      'String normal',
      'String com acentos: áéíóú',
      'String com caracteres especiais: ©®™',
      'String com emojis: 🎯⚽💰',
      'String com quebras de linha:\n\r\t',
      'String com caracteres de controle: \x00\x01\x02',
      'String vazia: ',
      null,
      undefined,
      123
    ]
    
    problematicStrings.forEach((str, index) => {
      const sanitized = sanitizeString(str)
      console.log(`Teste ${index + 1}: "${str}" -> "${sanitized}"`)
    })
    
    console.log('\n✅ Teste de sanitização concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste de sanitização:', error)
  }
}

// Executar teste
testSanitization()

