import { ref, computed, watch } from 'vue';
import { filterOptions } from '../config/filters.js';
import { getBookmakerUrl, addBookmakerUrl } from '../config/bookmakerUrls.js';
import marketTranslations from '../config/marketTranslations.json';
import { fetchSurebets } from '../utils/surebetsAPI.js';

export function useSurebetsData(filters = null) {
  // Estados principais
  const surebets = ref({});
  const availableBookmakers = ref([]);
  const bookmakerUrls = ref({});
  
  // Estados de contagem
  const lastCheckCount = ref(0);
  const startTime = ref(Date.now());
  const uptimeMinutes = ref(0);
  
  // Função auxiliar para filtrar surebets
  const filterSurebets = (surebetsData) => {
    const extractSurebetsData = (surebets) => {
      if (!surebets || typeof surebets !== "object") {
        return [];
      }
      
      if (Array.isArray(surebets)) {
        return surebets;
      }
      
      try {
        const values = Object.values(surebets);
        if (values.length > 0) {
          return values;
        }
      } catch (error) {
        console.warn("Erro ao extrair valores do objeto surebets:", error);
      }
      
      try {
        const normalObject = JSON.parse(JSON.stringify(surebets));
        if (normalObject && typeof normalObject === "object") {
          const values = Object.values(normalObject);
          if (values.length > 0) {
            return values;
          }
        }
      } catch (error) {
        console.warn("Erro ao converter surebets para objeto normal:", error);
      }
      
      return [];
    };
    
    let surebetsArray = extractSurebetsData(surebetsData);
    
    if (surebetsArray.length === 0 && surebetsData) {
      console.warn("⚠️ AVISO: Nenhum dado de surebets encontrado");
    }
    
    // Remoção de duplicatas
    const uniqueSurebets = [];
    const seenKeys = new Set();
    let duplicatesRemoved = 0;
    
    surebetsArray.forEach((surebet) => {
      if (!surebet || surebet.length === 0) return;
      
      if (!Array.isArray(surebet)) {
        console.warn("⚠️ Surebet não é um array:", surebet);
        return;
      }
      
      const key = createSurebetKey(surebet);
      
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueSurebets.push(surebet);
      } else {
        duplicatesRemoved++;
      }
    });
    
    surebetsArray = uniqueSurebets;
    
    if (duplicatesRemoved > 0) {
      console.log(`✅ Removidos ${duplicatesRemoved} surebet(s) duplicado(s)`);
    }
    
    return surebetsArray;
  };
  
  // Função auxiliar para criar chave única
  const createSurebetKey = (surebet) => {
    if (!surebet || surebet.length === 0) return "";
    
    const firstBet = surebet[0];
    if (!firstBet || typeof firstBet !== "object") return "";
    
    const keyFields = [
      firstBet.match || "",
      firstBet.sport || "",
      firstBet.tournament || "",
      firstBet.date || "",
      firstBet.hour || "",
      firstBet.profit || "0",
      firstBet.currency || "",
    ];
    
    const betDetails = surebet
      .map((bet) => `${bet.house || ""}-${bet.chance || ""}-${bet.market || ""}`)
      .sort()
      .join("|");
    
    const key = keyFields.join("|") + "|" + betDetails;
    return key;
  };
  
  // Computed properties
  const totalSurebets = computed(() => {
    return surebets.value ? Object.keys(surebets.value).length : 0;
  });
  
  const preliveCount = computed(() => {
    return surebets.value
      ? Object.values(surebets.value).filter((surebet) => {
          const firstBet = surebet[0];
          return !firstBet?.isLive;
        }).length
      : 0;
  });
  
  const liveCount = computed(() => {
    return surebets.value
      ? Object.values(surebets.value).filter((surebet) => {
          const firstBet = surebet[0];
          return firstBet?.isLive === true;
        }).length
      : 0;
  });
  
  const filteredSurebets = computed(() => {
    const baseData = filterSurebets(surebets.value);
    return applyFilters(baseData);
  });
  
  const filteredSurebetsByMarket = computed(() => {
    return filteredSurebets.value;
  });
  
  const filteredSurebetsByUnifiedSearch = computed(() => {
    return filteredSurebets.value;
  });
  
  // Estados de paginação
  const currentPage = ref(1);
  const itemsPerPage = ref(100);
  
  const paginatedSurebets = computed(() => {
    const allFiltered = filteredSurebetsByUnifiedSearch.value;
    const startIndex = 0;
    const endIndex = currentPage.value * itemsPerPage.value;
    return allFiltered.slice(startIndex, endIndex);
  });
  
  const hasMoreItems = computed(() => {
    const allFiltered = filteredSurebetsByUnifiedSearch.value;
    return paginatedSurebets.value.length < allFiltered.length;
  });
  
  const remainingItemsCount = computed(() => {
    const allFiltered = filteredSurebetsByUnifiedSearch.value;
    return Math.max(0, allFiltered.length - paginatedSurebets.value.length);
  });
  
  const loadMoreItems = () => {
    if (hasMoreItems.value) {
      currentPage.value++;
    }
  };
  
  const resetPagination = () => {
    currentPage.value = 1;
  };
  
  // Métodos
  
  const applyFilters = (surebetsArray) => {
    if (!filters) return surebetsArray;
    
    // Filtro por status (prelive/live)
    switch (filters.activeFilter?.value || 'prelive') {
      case "prelive":
        surebetsArray = surebetsArray.filter((surebet) => {
          const firstBet = surebet[0];
          return !firstBet?.isLive;
        });
        break;
      case "live":
        surebetsArray = surebetsArray.filter((surebet) => {
          const firstBet = surebet[0];
          return firstBet?.isLive === true;
        });
        break;
    }
    
    // Filtro por data específica
    if (filters.selectedDate?.value) {
      surebetsArray = surebetsArray.filter((surebet) => {
        const firstBet = surebet[0];
        if (!firstBet?.date) return false;
        const surebetDate = firstBet.date;
        return surebetDate === filters.selectedDate.value;
      });
    }
    
    // Filtro por casas de aposta
    if (filters.selectedHouses?.value && filters.selectedHouses.value.length !== filterOptions.houses.length) {
      surebetsArray = surebetsArray.filter((surebet) => {
        const surebetHouses = [
          ...new Set(surebet.map((bet) => bet.house).filter(Boolean)),
        ];
        
        if (filters.selectedHouses.value.length === 0) {
          return false;
        }
        
        const matchingHouses = surebetHouses.filter((house) =>
          filters.selectedHouses.value.includes(house)
        );
        
        return matchingHouses.length >= 2;
      });
    }
    
    // Filtro por esportes
    if (filters.selectedSports?.value && filters.selectedSports.value.length !== filterOptions.sports.length) {
      surebetsArray = surebetsArray.filter((surebet) => {
        const surebetSport = surebet[0]?.sport;
        
        if (filters.selectedSports.value.length === 0) {
          return false;
        }
        
        return surebetSport && filters.selectedSports.value.includes(surebetSport);
      });
    }
    
    // Filtro por moedas
    if (filters.selectedCurrencies?.value && filters.selectedCurrencies.value.length !== filterOptions.currencies.length) {
      surebetsArray = surebetsArray.filter((surebet) => {
        const surebetCurrency = surebet[0]?.currency;
        
        if (filters.selectedCurrencies.value.length === 0) {
          return false;
        }
        
        return surebetCurrency && filters.selectedCurrencies.value.includes(surebetCurrency);
      });
    }
    
    // Filtro por faixa de lucro
    if (filters.minProfit?.value > 0 || filters.maxProfit?.value < 1000) {
      surebetsArray = surebetsArray.filter((surebet) => {
        const profit = surebet[0]?.profit || 0;
        return profit >= (filters.minProfit?.value || 0) && profit <= (filters.maxProfit?.value || 1000);
      });
    }
    
    // Filtro por nível de risco
    if (filters.selectedRiskLevel?.value && filters.selectedRiskLevel.value !== "todos") {
      surebetsArray = surebetsArray.filter((surebet) => {
        const riskLevel = calculateRiskLevel(surebet);
        return riskLevel === filters.selectedRiskLevel.value;
      });
    }
    
    return surebetsArray;
  };
  
  const calculateRiskLevel = (surebet) => {
    if (!surebet || surebet.length < 2) return "conservador";
    
    const odds = surebet
      .map((bet) => parseFloat(bet.chance || bet.odds || 0))
      .filter((odd) => odd > 0);
    
    if (odds.length < 2) return "conservador";
    
    const maxOdd = Math.max(...odds);
    const minOdd = Math.min(...odds);
    const difference = maxOdd - minOdd;
    const points = Math.round(difference * 100);
    
    if (points <= 30) return "conservador";
    if (points <= 50) return "moderado";
    return "arriscado";
  };
  
  const getMarketTranslation = (marketCode) => {
    try {
      if (marketTranslations.translations && marketTranslations.translations[marketCode]) {
        return marketTranslations.translations[marketCode];
      }
      
      const patterns = [
        /^(TO\([0-9.]+\))\s+for\s+(Team[12])\s+-\s+(.+)$/,
        /^(TU\([0-9.]+\))\s+for\s+(Team[12])\s+-\s+(.+)$/,
        /^(TO\([0-9.]+\))\s+-\s+(.+)$/,
        /^(TU\([0-9.]+\))\s+-\s+(.+)$/,
        /^(Exact\s+\([0-9]+\))\s+for\s+(Team[12])$/,
      ];
      
      for (const pattern of patterns) {
        const match = marketCode.match(pattern);
        if (match) {
          const fullKey = marketCode;
          if (marketTranslations.translations && marketTranslations.translations[fullKey]) {
            return marketTranslations.translations[fullKey];
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn("Erro ao buscar tradução do mercado:", marketCode, error);
      return null;
    }
  };
  
  const updateAvailableBookmakers = (surebetsData) => {
    try {
      const uniqueBookmakers = new Set();
      const dynamicUrls = {};
      
      if (surebetsData) {
        Object.values(surebetsData).forEach((surebet) => {
          if (Array.isArray(surebet) && surebet.length > 0) {
            surebet.forEach((bet) => {
              if (bet.house) {
                uniqueBookmakers.add(bet.house);
                
                if (bet.anchorh1 || bet.anchorh2) {
                  const apiUrl = bet.anchorh1 || bet.anchorh2;
                  if (apiUrl && apiUrl.includes("http")) {
                    dynamicUrls[bet.house] = apiUrl;
                    
                    const mappedUrl = getBookmakerUrl(bet.house, bet.isLive, bet.anchorh1, bet.anchorh2, bet.anchorh1_original, bet.anchorh2_original, bet.house1, bet.house2);
                    if (mappedUrl.includes("google.com/search")) {
                      addBookmakerUrl(bet.house, extractBaseUrl(apiUrl), bet.isLive);
                    }
                  }
                }
              }
            });
          }
        });
      }
      
      const sortedBookmakers = Array.from(uniqueBookmakers).sort();
      availableBookmakers.value = sortedBookmakers;
      bookmakerUrls.value = buildBookmakerUrlsMap(sortedBookmakers);
      
      console.log(`🏠 Casas de apostas atualizadas: ${sortedBookmakers.length} casas encontradas`);
    } catch (error) {
      console.error("Erro ao atualizar casas de apostas:", error);
    }
  };
  
  const buildBookmakerUrlsMap = (bookmakers) => {
    const urlsMap = {};
    bookmakers.forEach((house) => {
      urlsMap[house] = {
        prematch: getBookmakerUrl(house, false),
        live: getBookmakerUrl(house, true),
      };
    });
    return urlsMap;
  };
  
  const extractBaseUrl = (fullUrl) => {
    try {
      const url = new URL(fullUrl);
      return `${url.protocol}//${url.hostname}/`;
    } catch (error) {
      console.warn("Erro ao extrair URL base:", error);
      return fullUrl;
    }
  };
  
  const updateStats = () => {
    lastCheckCount.value++;
    updateUptime();
  };
  
  const updateUptime = () => {
    const now = Date.now();
    const uptimeMs = now - startTime.value;
    uptimeMinutes.value = Math.floor(uptimeMs / (1000 * 60));
  };
  
  return {
    // Estados
    surebets,
    availableBookmakers,
    bookmakerUrls,
    preliveCount,
    liveCount,
    lastCheckCount,
    startTime,
    uptimeMinutes,
    
    // Computed
    totalSurebets,
    filteredSurebets,
    filteredSurebetsByMarket,
    filteredSurebetsByUnifiedSearch,
    paginatedSurebets,
    hasMoreItems,
    remainingItemsCount,
    
    // Métodos
    filterSurebets,
    applyFilters,
    calculateRiskLevel,
    createSurebetKey,
    getMarketTranslation,
    updateAvailableBookmakers,
    buildBookmakerUrlsMap,
    extractBaseUrl,
    updateStats,
    updateUptime,
    loadMoreItems,
    resetPagination,
  };
}