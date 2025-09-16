import { ref, computed, watch } from 'vue'

export function useOptimizedDataProcessing() {
  // Cache para dados processados
  const processedDataCache = ref(new Map())
  const lastDataHash = ref('')
  
  // Processamento otimizado de surebets
  const processSurebetsData = (rawData) => {
    if (!rawData) return { surebets: [], stats: {} }
    
    // Criar hash dos dados para cache
    const dataHash = createDataHash(rawData)
    
    // Verificar cache
    if (dataHash === lastDataHash.value && processedDataCache.value.has(dataHash)) {
      return processedDataCache.value.get(dataHash)
    }
    
    const startTime = performance.now()
    
    // Processar dados
    const processed = {
      surebets: processSurebets(rawData),
      stats: calculateStats(rawData),
      bookmakers: extractBookmakers(rawData),
      sports: extractSports(rawData),
      currencies: extractCurrencies(rawData)
    }
    
    const processingTime = performance.now() - startTime
    console.log(`⚡ Dados processados em ${processingTime.toFixed(2)}ms`)
    
    // Atualizar cache
    processedDataCache.value.set(dataHash, processed)
    lastDataHash.value = dataHash
    
    // Limitar cache
    if (processedDataCache.value.size > 5) {
      const firstKey = processedDataCache.value.keys().next().value
      processedDataCache.value.delete(firstKey)
    }
    
    return processed
  }
  
  // Função para criar hash dos dados
  function createDataHash(data) {
    if (typeof data === 'object') {
      return JSON.stringify({
        keys: Object.keys(data).sort(),
        length: Object.keys(data).length,
        timestamp: Date.now() - (Date.now() % 1000) // Arredondar para segundo
      })
    }
    return String(data)
  }
  
  // Processamento otimizado de surebets
  function processSurebets(rawData) {
    const surebets = []
    const seen = new Set()
    
    for (const [key, surebet] of Object.entries(rawData)) {
      if (!surebet || !Array.isArray(surebet) || surebet.length === 0) continue
      
      // Validação rápida
      const firstBet = surebet[0]
      if (!firstBet || !firstBet.sport || !firstBet.match) continue
      
      // Chave única otimizada
      const uniqueKey = `${firstBet.sport}-${firstBet.match}-${firstBet.market || 'default'}`
      
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey)
        surebets.push(surebet)
      }
    }
    
    return surebets
  }
  
  // Cálculo otimizado de estatísticas
  function calculateStats(rawData) {
    const stats = {
      total: 0,
      prelive: 0,
      live: 0,
      totalProfit: 0,
      avgProfit: 0,
      maxProfit: 0,
      minProfit: Infinity
    }
    
    for (const surebet of Object.values(rawData)) {
      if (!surebet || !Array.isArray(surebet) || surebet.length === 0) continue
      
      const firstBet = surebet[0]
      if (!firstBet) continue
      
      stats.total++
      
      if (firstBet.isLive) {
        stats.live++
      } else {
        stats.prelive++
      }
      
      const profit = parseFloat(firstBet.profit) || 0
      stats.totalProfit += profit
      stats.maxProfit = Math.max(stats.maxProfit, profit)
      stats.minProfit = Math.min(stats.minProfit, profit)
    }
    
    stats.avgProfit = stats.total > 0 ? stats.totalProfit / stats.total : 0
    stats.minProfit = stats.minProfit === Infinity ? 0 : stats.minProfit
    
    return stats
  }
  
  // Extração otimizada de casas de apostas
  function extractBookmakers(rawData) {
    const bookmakers = new Set()
    
    for (const surebet of Object.values(rawData)) {
      if (!surebet || !Array.isArray(surebet)) continue
      
      for (const bet of surebet) {
        if (bet.house) {
          bookmakers.add(bet.house)
        }
      }
    }
    
    return Array.from(bookmakers).sort()
  }
  
  // Extração otimizada de esportes
  function extractSports(rawData) {
    const sports = new Set()
    
    for (const surebet of Object.values(rawData)) {
      if (!surebet || !Array.isArray(surebet) || surebet.length === 0) continue
      
      const firstBet = surebet[0]
      if (firstBet?.sport) {
        sports.add(firstBet.sport)
      }
    }
    
    return Array.from(sports).sort()
  }
  
  // Extração otimizada de moedas
  function extractCurrencies(rawData) {
    const currencies = new Set()
    
    for (const surebet of Object.values(rawData)) {
      if (!surebet || !Array.isArray(surebet) || surebet.length === 0) continue
      
      const firstBet = surebet[0]
      if (firstBet?.currency) {
        currencies.add(firstBet.currency)
      }
    }
    
    return Array.from(currencies).sort()
  }
  
  // Limpar cache
  function clearCache() {
    processedDataCache.value.clear()
    lastDataHash.value = ''
  }
  
  return {
    processSurebetsData,
    clearCache
  }
}
