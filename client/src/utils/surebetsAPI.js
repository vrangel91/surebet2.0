/**
 * API de Surebets - Exemplo de implementação
 * 
 * Este arquivo demonstra como estruturar a API para evitar duplicatas
 * e fornecer dados para a página de ranking
 */

import { API_CONFIG, buildApiUrl } from './apiConfig.js'

// Função para verificar se a resposta é JSON de forma segura
async function safeJsonResponse(response) {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  } else {
    // Se não for JSON, retornar o texto da resposta
    const text = await response.text()
    console.error('Resposta não-JSON recebida:', text.substring(0, 200) + '...')
    return { error: 'Resposta inválida do servidor', details: text.substring(0, 200) }
  }
}

// Estrutura de uma surebet com ID único
const surebetExample = {
  id: 'surebet_2024_001', // ID único para evitar duplicatas
  bookmaker1: 'Bet365',
  bookmaker2: 'William Hill',
  sport: 'Futebol',
  event: 'Brasil vs Argentina',
  market: 'Resultado Final',
  selection1: 'Brasil',
  selection2: 'Empate',
  selection3: 'Argentina',
  odds1: 2.10,
  odds2: 3.40,
  odds3: 3.80,
  profit: 15.50,
  roi: 3.2,
  stake: 100,
  createdAt: '2024-01-15T10:00:00Z',
  expiresAt: '2024-01-15T22:00:00Z',
  status: 'active', // active, expired, completed
  tags: ['futebol', 'brasileirao', 'alta-liquidez']
}

/**
 * Buscar surebets da API real
 * @param {Object} filters - Filtros para a busca
 * @returns {Promise<Array>} Lista de surebets
 */
async function fetchSurebets(filters = {}) {
  try {
    console.log('🌐 Buscando dados da API real...')
    
    // Fazer chamada real à API com headers apropriados
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
    }
    
    const apiData = await safeJsonResponse(response)
    console.log('📡 Dados recebidos da API:', apiData)
    
    // Verificar se os dados têm a estrutura esperada
    if (!apiData || typeof apiData !== 'object') {
      throw new Error('Estrutura de dados inválida da API')
    }
    
    // Processar dados da API real
    const processedSurebets = processRealAPIData(apiData)
    console.log('✅ Dados processados:', processedSurebets.length, 'surebets únicos')
    
    // Salvar no banco local para cache
    try {
      await saveToLocalDatabase(processedSurebets, filters)
      console.log('💾 Dados salvos no banco local')
    } catch (saveError) {
      console.error('Erro ao salvar no banco local:', saveError)
    }
    
    return processedSurebets
    
  } catch (error) {
    console.error('❌ Erro ao buscar da API real:', error)
    
    // Tentar carregar do banco local
    try {
      const localData = await loadFromLocalDatabase(filters)
      if (localData && localData.length > 0) {
        console.log('📊 Carregando dados do banco local:', localData.length, 'registros')
        return localData
      }
    } catch (localError) {
      console.error('Erro ao carregar do banco local:', localError)
    }
    
    // Retornar dados de exemplo se não conseguir carregar do banco local
    console.log('📊 Retornando dados de exemplo para demonstração')
    return getExampleData()
  }
}

/**
 * Função para buscar estatísticas de bookmakers
 * @param {Object} filters - Filtros de período e ordenação
 * @returns {Promise<Object>} Estatísticas dos bookmakers
 */
async function fetchBookmakerStats(filters = {}) {
  try {
    const response = await fetch('/api/bookmakers/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(filters)
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas')
    }

    const data = await safeJsonResponse(response)
    return data.stats
  } catch (error) {
    console.error('Erro na API de estatísticas:', error)
    throw error
  }
}

/**
 * Função para buscar ranking de bookmakers
 * @param {Object} filters - Filtros de período e ordenação
 * @returns {Promise<Array>} Ranking dos bookmakers
 */
async function fetchBookmakerRanking(filters = {}) {
  try {
    const response = await fetch('/api/bookmakers/ranking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(filters)
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar ranking')
    }

    const data = await safeJsonResponse(response)
    return data.ranking
  } catch (error) {
    console.error('Erro na API de ranking:', error)
    throw error
  }
}

/**
 * Função para buscar evolução temporal das surebets
 * @param {Object} filters - Filtros de período
 * @returns {Promise<Object>} Dados temporais
 */
async function fetchTemporalData(filters = {}) {
  try {
    const response = await fetch('/api/surebets/temporal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(filters)
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar dados temporais')
    }

    const data = await safeJsonResponse(response)
    return data.temporal
  } catch (error) {
    console.error('Erro na API de dados temporais:', error)
    throw error
  }
}

/**
 * Função para verificar se uma surebet já existe
 * @param {Object} surebetData - Dados da surebet
 * @returns {Promise<boolean>} True se já existe
 */
async function checkSurebetExists(surebetData) {
  try {
    const response = await fetch('/api/surebets/check-duplicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(surebetData)
    })

    if (!response.ok) {
      throw new Error('Erro ao verificar duplicata')
    }

    const data = await safeJsonResponse(response)
    return data.exists
  } catch (error) {
    console.error('Erro ao verificar duplicata:', error)
    throw error
  }
}

/**
 * Função para criar uma nova surebet
 * @param {Object} surebetData - Dados da surebet
 * @returns {Promise<Object>} Surebet criada
 */
async function createSurebet(surebetData) {
  try {
    // Gerar ID único baseado em timestamp e dados
    const uniqueId = `surebet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const surebetWithId = {
      ...surebetData,
      id: uniqueId,
      createdAt: new Date().toISOString()
    }

    const response = await fetch('/api/surebets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(surebetWithId)
    })

    if (!response.ok) {
      throw new Error('Erro ao criar surebet')
    }

    const data = await safeJsonResponse(response)
    return data.surebet
  } catch (error) {
    console.error('Erro ao criar surebet:', error)
    throw error
  }
}

/**
 * Função para atualizar uma surebet existente
 * @param {string} id - ID da surebet
 * @param {Object} updateData - Dados para atualizar
 * @returns {Promise<Object>} Surebet atualizada
 */
async function updateSurebet(id, updateData) {
  try {
    const response = await fetch(`/api/surebets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar surebet')
    }

    const data = await safeJsonResponse(response)
    return data.surebet
  } catch (error) {
    console.error('Erro ao atualizar surebet:', error)
    throw error
  }
}

/**
 * Função para deletar uma surebet
 * @param {string} id - ID da surebet
 * @returns {Promise<boolean>} True se deletada com sucesso
 */
async function deleteSurebet(id) {
  try {
    const response = await fetch(`/api/surebets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao deletar surebet')
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar surebet:', error)
    throw error
  }
}

/**
 * Função para buscar surebets por período
 * @param {string} period - Período (7d, 30d, 90d, all)
 * @returns {Promise<Array>} Lista de surebets do período
 */
async function fetchSurebetsByPeriod(period) {
  const filters = {}
  
  if (period !== 'all') {
    const days = parseInt(period)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filters.startDate = cutoffDate.toISOString()
  }
  
  return await fetchSurebets(filters)
}

/**
 * Função para buscar top bookmakers por critério
 * @param {string} criteria - Critério (frequency, profit, roi)
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Top bookmakers
 */
async function fetchTopBookmakers(criteria = 'frequency', limit = 10) {
  const filters = {
    sortBy: criteria,
    limit: limit
  }
  
  return await fetchBookmakerRanking(filters)
}

// Exportar exemplo para referência

/**
 * Dados de exemplo para demonstração
 * @returns {Array} Lista de surebets de exemplo
 */
function getExampleData() {
  return [
    {
      id: 'surebet_2024_001',
      bookmaker1: 'Bet365',
      bookmaker2: 'William Hill',
      sport: 'Futebol',
      event: 'Brasil vs Argentina',
      market: 'Resultado Final',
      selection1: 'Brasil',
      selection2: 'Empate',
      selection3: 'Argentina',
      odds1: 2.10,
      odds2: 3.40,
      odds3: 3.80,
      profit: 15.50,
      roi: 3.2,
      stake: 100,
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-15T22:00:00Z',
      status: 'active',
      tags: ['futebol', 'brasileirao', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_002',
      bookmaker1: 'Bet365',
      bookmaker2: 'Unibet',
      sport: 'Futebol',
      event: 'Manchester United vs Liverpool',
      market: 'Resultado Final',
      selection1: 'Manchester United',
      selection2: 'Empate',
      selection3: 'Liverpool',
      odds1: 2.80,
      odds2: 3.20,
      odds3: 2.60,
      profit: 12.80,
      roi: 2.8,
      stake: 100,
      createdAt: '2024-01-14T15:30:00Z',
      expiresAt: '2024-01-14T21:00:00Z',
      status: 'active',
      tags: ['futebol', 'premier-league', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_003',
      bookmaker1: 'William Hill',
      bookmaker2: 'Betfair',
      sport: 'Futebol',
      event: 'Real Madrid vs Barcelona',
      market: 'Resultado Final',
      selection1: 'Real Madrid',
      selection2: 'Empate',
      selection3: 'Barcelona',
      odds1: 2.40,
      odds2: 3.50,
      odds3: 2.90,
      profit: 18.20,
      roi: 4.1,
      stake: 100,
      createdAt: '2024-01-13T09:15:00Z',
      expiresAt: '2024-01-13T20:00:00Z',
      status: 'active',
      tags: ['futebol', 'la-liga', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_004',
      bookmaker1: 'Betfair',
      bookmaker2: 'Unibet',
      sport: 'Futebol',
      event: 'Bayern Munich vs Borussia Dortmund',
      market: 'Resultado Final',
      selection1: 'Bayern Munich',
      selection2: 'Empate',
      selection3: 'Borussia Dortmund',
      odds1: 1.90,
      odds2: 3.80,
      odds3: 3.60,
      profit: 22.10,
      roi: 4.8,
      stake: 100,
      createdAt: '2024-01-12T14:20:00Z',
      expiresAt: '2024-01-12T19:00:00Z',
      status: 'active',
      tags: ['futebol', 'bundesliga', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_005',
      bookmaker1: 'Bet365',
      bookmaker2: 'Betfair',
      sport: 'Futebol',
      event: 'PSG vs Marseille',
      market: 'Resultado Final',
      selection1: 'PSG',
      selection2: 'Empate',
      selection3: 'Marseille',
      odds1: 1.70,
      odds2: 4.20,
      odds3: 4.50,
      profit: 16.75,
      roi: 3.5,
      stake: 100,
      createdAt: '2024-01-11T09:45:00Z',
      expiresAt: '2024-01-11T18:00:00Z',
      status: 'active',
      tags: ['futebol', 'ligue-1', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_006',
      bookmaker1: 'William Hill',
      bookmaker2: 'Unibet',
      sport: 'Futebol',
      event: 'Juventus vs Inter',
      market: 'Resultado Final',
      selection1: 'Juventus',
      selection2: 'Empate',
      selection3: 'Inter',
      odds1: 2.60,
      odds2: 3.30,
      odds3: 2.70,
      profit: 14.30,
      roi: 3.8,
      stake: 100,
      createdAt: '2024-01-10T16:00:00Z',
      expiresAt: '2024-01-10T21:30:00Z',
      status: 'active',
      tags: ['futebol', 'serie-a', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_007',
      bookmaker1: 'Betfair',
      bookmaker2: 'Bet365',
      sport: 'Futebol',
      event: 'Ajax vs PSV',
      market: 'Resultado Final',
      selection1: 'Ajax',
      selection2: 'Empate',
      selection3: 'PSV',
      odds1: 2.20,
      odds2: 3.60,
      odds3: 3.10,
      profit: 19.80,
      roi: 4.3,
      stake: 100,
      createdAt: '2024-01-09T11:30:00Z',
      expiresAt: '2024-01-09T20:00:00Z',
      status: 'active',
      tags: ['futebol', 'eredivisie', 'alta-liquidez']
    },
    {
      id: 'surebet_2024_008',
      bookmaker1: 'Unibet',
      bookmaker2: 'William Hill',
      sport: 'Futebol',
      event: 'Porto vs Benfica',
      market: 'Resultado Final',
      selection1: 'Porto',
      selection2: 'Empate',
      selection3: 'Benfica',
      odds1: 2.50,
      odds2: 3.40,
      odds3: 2.80,
      profit: 13.90,
      roi: 3.1,
      stake: 100,
      createdAt: '2024-01-08T13:45:00Z',
      expiresAt: '2024-01-08T22:00:00Z',
      status: 'active',
      tags: ['futebol', 'primeira-liga', 'alta-liquidez']
    }
  ]
}

/**
 * Processar dados da API real
 * @param {Object} apiData - Dados brutos da API
 * @returns {Array} Lista de surebets processados
 */
function processRealAPIData(apiData) {
  const processedSurebets = []
  const processedIds = new Set()
  
  // Iterar sobre cada surebet_id na resposta da API
  Object.entries(apiData).forEach(([surebetId, surebetParts]) => {
    // Verificar se já processamos este surebet_id
    if (processedIds.has(surebetId)) {
      console.log(`⚠️ Surebet ID duplicado ignorado: ${surebetId}`)
      return
    }
    
    // Marcar como processado
    processedIds.add(surebetId)
    
    // Processar cada parte do surebet
    if (Array.isArray(surebetParts)) {
      surebetParts.forEach((part, index) => {
        try {
          // Extrair informações da parte
          const {
            house,
            profit,
            roi,
            timestamp,
            sport,
            event,
            market,
            selection1,
            selection2,
            selection3,
            odds1,
            odds2,
            odds3,
            stake = 100,
            status = 'active'
          } = part
          
          // Criar objeto surebet processado
          const processedSurebet = {
            id: `${surebetId}_part_${index + 1}`,
            surebet_id: surebetId,
            bookmaker1: house, // Usar 'house' como bookmaker
            bookmaker2: '', // Será preenchido se houver múltiplas casas
            sport: sport || 'Futebol',
            event: event || 'Evento não especificado',
            market: market || 'Mercado não especificado',
            selection1: selection1 || '',
            selection2: selection2 || '',
            selection3: selection3 || '',
            odds1: parseFloat(odds1) || 0,
            odds2: parseFloat(odds2) || 0,
            odds3: parseFloat(odds3) || 0,
            profit: parseFloat(profit) || 0,
            roi: parseFloat(roi) || 0,
            stake: parseFloat(stake) || 100,
            createdAt: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
            expiresAt: timestamp ? new Date(new Date(timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: status || 'active',
            tags: [sport?.toLowerCase() || 'futebol', 'api-real']
          }
          
          processedSurebets.push(processedSurebet)
          
        } catch (partError) {
          console.error(`Erro ao processar parte ${index + 1} do surebet ${surebetId}:`, partError)
        }
      })
    } else {
      console.warn(`Formato inválido para surebet ${surebetId}:`, surebetParts)
    }
  })
  
  console.log(`🎯 Processados ${processedSurebets.length} surebets únicos de ${processedIds.size} IDs únicos`)
  return processedSurebets
}

// Funções de banco de dados local (IndexedDB)
let db = null

/**
 * Inicializar banco de dados local
 */
async function initLocalDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SurebetsDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Criar store para surebets
      if (!db.objectStoreNames.contains('surebets')) {
        const surebetsStore = db.createObjectStore('surebets', { keyPath: 'id' })
        surebetsStore.createIndex('createdAt', 'createdAt', { unique: false })
        surebetsStore.createIndex('bookmaker1', 'bookmaker1', { unique: false })
        surebetsStore.createIndex('bookmaker2', 'bookmaker2', { unique: false })
      }
      
      // Criar store para estatísticas
      if (!db.objectStoreNames.contains('stats')) {
        const statsStore = db.createObjectStore('stats', { keyPath: 'id' })
        statsStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

/**
 * Salvar surebets no banco local
 */
async function saveToLocalDatabase(surebets, filters = {}) {
  if (!db) await initLocalDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surebets'], 'readwrite')
    const store = transaction.objectStore('surebets')
    
    // Limpar dados antigos
    const clearRequest = store.clear()
    
    clearRequest.onsuccess = () => {
      // Inserir novos dados
      let completed = 0
      let errors = 0
      
      surebets.forEach(surebet => {
        const request = store.add(surebet)
        
        request.onsuccess = () => {
          completed++
          if (completed + errors === surebets.length) {
            resolve()
          }
        }
        
        request.onerror = () => {
          errors++
          console.error('Erro ao salvar surebet:', surebet.id)
          if (completed + errors === surebets.length) {
            resolve()
          }
        }
      })
    }
    
    clearRequest.onerror = () => reject(clearRequest.error)
  })
}

/**
 * Carregar surebets do banco local
 */
async function loadFromLocalDatabase(filters = {}) {
  if (!db) await initLocalDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surebets'], 'readonly')
    const store = transaction.objectStore('surebets')
    const request = store.getAll()
    
    request.onsuccess = () => {
      let surebets = request.result
      
      // Aplicar filtros
      if (filters.period && filters.period !== 'all') {
        const days = parseInt(filters.period)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        surebets = surebets.filter(surebet => 
          new Date(surebet.createdAt) >= cutoffDate
        )
      }
      
      // Aplicar ordenação
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'createdAt':
            surebets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            break
          case 'profit':
            surebets.sort((a, b) => b.profit - a.profit)
            break
          case 'roi':
            surebets.sort((a, b) => b.roi - a.roi)
            break
        }
      }
      
      resolve(surebets)
    }
    
    request.onerror = () => reject(request.error)
  })
}

/**
 * Salvar estatísticas no banco local
 */
async function saveStatsToLocalDatabase(stats) {
  if (!db) await initLocalDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['stats'], 'readwrite')
    const store = transaction.objectStore('stats')
    
    const statsData = {
      id: 'current_stats',
      data: stats,
      timestamp: Date.now()
    }
    
    const request = store.put(statsData)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Carregar estatísticas do banco local
 */
async function loadStatsFromLocalDatabase() {
  if (!db) await initLocalDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['stats'], 'readonly')
    const store = transaction.objectStore('stats')
    const request = store.get('current_stats')
    
    request.onsuccess = () => {
      const result = request.result
      if (result && Date.now() - result.timestamp < 5 * 60 * 1000) {
        resolve(result.data)
      } else {
        resolve(null)
      }
    }
    
    request.onerror = () => reject(request.error)
  })
}

/**
 * Limpar completamente o banco de dados local
 */
async function clearLocalDatabase() {
  if (!db) await initLocalDatabase()
  
  return new Promise((resolve, reject) => {
    try {
      // Limpar store de surebets
      const surebetsTransaction = db.transaction(['surebets'], 'readwrite')
      const surebetsStore = surebetsTransaction.objectStore('surebets')
      const surebetsRequest = surebetsStore.clear()
      
      surebetsRequest.onsuccess = () => {
        console.log('🗄️ Store de surebets limpo')
        
        // Limpar store de estatísticas
        const statsTransaction = db.transaction(['stats'], 'readwrite')
        const statsStore = statsTransaction.objectStore('stats')
        const statsRequest = statsStore.clear()
        
        statsRequest.onsuccess = () => {
          console.log('🗄️ Store de estatísticas limpo')
          resolve()
        }
        
        statsRequest.onerror = () => {
          console.error('❌ Erro ao limpar estatísticas:', statsRequest.error)
          reject(statsRequest.error)
        }
      }
      
      surebetsRequest.onerror = () => {
        console.error('❌ Erro ao limpar surebets:', surebetsRequest.error)
        reject(surebetsRequest.error)
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar banco:', error)
      reject(error)
    }
  })
}

// Exportar funções individuais
export {
  fetchSurebets,
  fetchBookmakerStats,
  fetchBookmakerRanking,
  fetchTemporalData,
  checkSurebetExists,
  createSurebet,
  updateSurebet,
  deleteSurebet,
  fetchSurebetsByPeriod,
  fetchTopBookmakers,
  surebetExample,
  // Funções de banco local
  initLocalDatabase,
  saveToLocalDatabase,
  loadFromLocalDatabase,
  saveStatsToLocalDatabase,
  loadStatsFromLocalDatabase,
  clearLocalDatabase
}
