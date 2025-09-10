import { ref, computed, watch, nextTick } from 'vue'

export function useOptimizedFilters(surebets, filters) {
  // Cache para resultados filtrados
  const filteredCache = ref(new Map())
  const lastFilterHash = ref('')
  
  // Computed otimizado para filtros
  const filteredSurebets = computed(() => {
    if (!surebets.value || Object.keys(surebets.value).length === 0) {
      return []
    }
    
    // Criar hash dos filtros para cache
    const filterHash = createFilterHash(filters.value)
    
    // Verificar cache
    if (filterHash === lastFilterHash.value && filteredCache.value.has(filterHash)) {
      return filteredCache.value.get(filterHash)
    }
    
    // Processar filtros
    const result = processFilters(surebets.value, filters.value)
    
    // Atualizar cache
    filteredCache.value.set(filterHash, result)
    lastFilterHash.value = filterHash
    
    // Limitar cache (manter apenas 10 entradas)
    if (filteredCache.value.size > 10) {
      const firstKey = filteredCache.value.keys().next().value
      filteredCache.value.delete(firstKey)
    }
    
    return result
  })
  
  // Função para criar hash dos filtros
  function createFilterHash(filters) {
    return JSON.stringify({
      activeFilter: filters.activeFilter,
      selectedHouses: filters.selectedHouses?.sort(),
      selectedSports: filters.selectedSports?.sort(),
      selectedCurrencies: filters.selectedCurrencies?.sort(),
      selectedDate: filters.selectedDate,
      minProfit: filters.minProfit,
      maxProfit: filters.maxProfit
    })
  }
  
  // Função otimizada para processar filtros
  function processFilters(surebetsData, filters) {
    let surebetsArray = Object.values(surebetsData)
    
    // 1. Remoção de duplicatas (otimizada)
    surebetsArray = removeDuplicatesOptimized(surebetsArray)
    
    // 2. Filtro por status (prelive/live)
    if (filters.activeFilter) {
      surebetsArray = surebetsArray.filter(surebet => {
        const firstBet = surebet[0]
        if (!firstBet) return false
        
        switch (filters.activeFilter) {
          case 'prelive':
            return !firstBet.isLive
          case 'live':
            return firstBet.isLive === true
          default:
            return true
        }
      })
    }
    
    // 3. Filtro por data
    if (filters.selectedDate) {
      surebetsArray = surebetsArray.filter(surebet => {
        const firstBet = surebet[0]
        return firstBet?.date === filters.selectedDate
      })
    }
    
    // 4. Filtro por casas de apostas
    if (filters.selectedHouses && filters.selectedHouses.length > 0 && 
        filters.selectedHouses.length !== filters.totalHouses) {
      surebetsArray = surebetsArray.filter(surebet => {
        const surebetHouses = [...new Set(surebet.map(bet => bet.house).filter(Boolean))]
        const matchingHouses = surebetHouses.filter(house => filters.selectedHouses.includes(house))
        return matchingHouses.length >= 2
      })
    }
    
    // 5. Filtro por esportes
    if (filters.selectedSports && filters.selectedSports.length > 0 && 
        filters.selectedSports.length !== filters.totalSports) {
      surebetsArray = surebetsArray.filter(surebet => {
        const firstBet = surebet[0]
        return filters.selectedSports.includes(firstBet?.sport)
      })
    }
    
    // 6. Filtro por moedas
    if (filters.selectedCurrencies && filters.selectedCurrencies.length > 0 && 
        filters.selectedCurrencies.length !== filters.totalCurrencies) {
      surebetsArray = surebetsArray.filter(surebet => {
        const firstBet = surebet[0]
        return filters.selectedCurrencies.includes(firstBet?.currency)
      })
    }
    
    // 7. Filtro por lucro
    if (filters.minProfit || filters.maxProfit) {
      surebetsArray = surebetsArray.filter(surebet => {
        const firstBet = surebet[0]
        const profit = firstBet?.profit || 0
        
        if (filters.minProfit && profit < filters.minProfit) return false
        if (filters.maxProfit && profit > filters.maxProfit) return false
        
        return true
      })
    }
    
    return surebetsArray
  }
  
  // Função otimizada para remoção de duplicatas
  function removeDuplicatesOptimized(surebetsArray) {
    const seen = new Set()
    const unique = []
    
    for (const surebet of surebetsArray) {
      if (!surebet || !Array.isArray(surebet) || surebet.length === 0) continue
      
      // Criar chave única mais eficiente
      const key = createSurebetKey(surebet)
      
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(surebet)
      }
    }
    
    return unique
  }
  
  // Função otimizada para criar chave única
  function createSurebetKey(surebet) {
    const firstBet = surebet[0]
    if (!firstBet) return ''
    
    // Usar apenas campos essenciais para a chave
    return `${firstBet.sport}-${firstBet.match}-${firstBet.market}-${firstBet.isLive ? 'live' : 'prelive'}`
  }
  
  // Limpar cache quando necessário
  function clearCache() {
    filteredCache.value.clear()
    lastFilterHash.value = ''
  }
  
  return {
    filteredSurebets,
    clearCache
  }
}
