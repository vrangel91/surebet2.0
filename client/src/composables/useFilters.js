import { ref, computed, watch } from 'vue';
import { filterOptions } from '../config/filters.js';

export function useFilters() {
  // Estados de filtros
  const selectedHouses = ref([...filterOptions.houses]);
  const selectedSports = ref(filterOptions.sports.map(sport => sport.value));
  const selectedCurrencies = ref(filterOptions.currencies.map(currency => currency.code));
  const selectedRiskLevel = ref("todos");
  const minProfit = ref(0);
  const maxProfit = ref(1000);
  const selectedDate = ref("");
  const activeFilter = ref("prelive");
  
  // Estados de pesquisa
  const houseSearchTerm = ref("");
  const sportSearchTerm = ref("");
  const marketSearchTerm = ref("");
  const unifiedSearchTerm = ref("");
  const activeSearchType = ref(null);
  
  // Estados de favoritos
  const favoriteSports = ref([]);
  const favoriteHouses = ref([]);
  
  // Cache de favoritos (persistente)
  const favoritesCache = ref({
    houses: [],
    sports: []
  });
  
  // Estados de UI
  const showFilterOverlay = ref(false);
  const searchSuggestions = ref([]);
  const showSearchSuggestions = ref(false);
  const selectedSuggestionIndex = ref(-1);
  
  // Cache de filtros
  const filtersCache = ref({
    selectedHouses: [],
    selectedSports: [],
    selectedCurrencies: [],
    selectedDate: "",
    activeFilter: "prelive",
    minProfit: 0,
    maxProfit: 1000,
    selectedRiskLevel: "todos",
    houseSearchTerm: "",
    marketSearchTerm: "",
  });
  
  const lastDeselectAllTime = ref(0);
  
  // Computed properties
  const filteredHouses = computed(() => {
    if (!houseSearchTerm.value.trim()) {
      return filterOptions.houses;
    }
    const searchTerm = houseSearchTerm.value.toLowerCase().trim();
    return filterOptions.houses.filter(house =>
      house.toLowerCase().includes(searchTerm)
    );
  });
  
  const filteredSports = computed(() => {
    if (!sportSearchTerm.value.trim()) {
      return filterOptions.sports;
    }
    const searchTerm = sportSearchTerm.value.toLowerCase().trim();
    return filterOptions.sports.filter(sport =>
      sport.label.toLowerCase().includes(searchTerm)
    );
  });
  
  const isUsingDefaultProfitFilters = computed(() => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.defaultFilters) {
          const defaultMin = settings.defaultFilters.minProfit !== undefined
            ? Number(settings.defaultFilters.minProfit) : 0;
          const defaultMax = settings.defaultFilters.maxProfit !== undefined
            ? Number(settings.defaultFilters.maxProfit) : 1000;
          return minProfit.value === defaultMin && maxProfit.value === defaultMax;
        }
      }
    } catch (error) {
      console.warn("Erro ao verificar filtros padrão:", error);
    }
    return minProfit.value === 0 && maxProfit.value === 1000;
  });
  
  // Métodos
  const setFilter = (filter) => {
    activeFilter.value = filter;
    saveFiltersToSettings();
    updateFiltersCache();
  };
  
  const setRiskLevel = (level) => {
    selectedRiskLevel.value = level;
    saveFiltersToSettings();
    updateFiltersCache();
  };
  
  const toggleFilterOverlay = () => {
    showFilterOverlay.value = !showFilterOverlay.value;
  };
  
  const clearFilters = () => {
    selectedHouses.value = [...filterOptions.houses];
    selectedSports.value = filterOptions.sports.map(sport => sport.value);
    selectedCurrencies.value = filterOptions.currencies.map(currency => currency.code);
    selectedDate.value = "";
    selectedRiskLevel.value = "todos";
    minProfit.value = 0;
    maxProfit.value = 1000;
    activeFilter.value = "prelive";
    houseSearchTerm.value = "";
    marketSearchTerm.value = "";
    unifiedSearchTerm.value = "";
    activeSearchType.value = null;
    searchSuggestions.value = [];
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
    saveFiltersToSettings();
  };
  
  const applyFilters = () => {
    saveFiltersToSettings();
    toggleFilterOverlay();
  };
  
  const onDateChange = (date) => {
    selectedDate.value = date;
    saveFiltersToSettings();
  };
  
  const clearDateFilter = () => {
    selectedDate.value = "";
    saveFiltersToSettings();
  };
  
  const onUnifiedSearchInput = (term) => {
    unifiedSearchTerm.value = term;
    generateSearchSuggestions();
    detectSearchType();
  };
  
  const clearUnifiedSearch = () => {
    unifiedSearchTerm.value = "";
    activeSearchType.value = null;
    searchSuggestions.value = [];
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
  };
  
  const selectAllHouses = () => {
    selectedHouses.value = [...filterOptions.houses];
    saveFiltersToSettings();
  };
  
  const deselectAllHouses = () => {
    selectedHouses.value = [];
    lastDeselectAllTime.value = Date.now();
    saveFiltersToSettings();
  };
  
  const selectAllSports = () => {
    selectedSports.value = filterOptions.sports.map(sport => sport.value);
    saveFiltersToSettings();
  };
  
  const deselectAllSports = () => {
    selectedSports.value = [];
    lastDeselectAllTime.value = Date.now();
    saveFiltersToSettings();
  };
  
  const selectAllCurrencies = () => {
    selectedCurrencies.value = filterOptions.currencies.map(currency => currency.code);
    saveFiltersToSettings();
  };
  
  const deselectAllCurrencies = () => {
    selectedCurrencies.value = [];
    lastDeselectAllTime.value = Date.now();
    saveFiltersToSettings();
  };
  
  const toggleHouse = (house) => {
    const index = selectedHouses.value.indexOf(house);
    if (index > -1) {
      selectedHouses.value.splice(index, 1);
    } else {
      selectedHouses.value.push(house);
    }
    saveFiltersToSettings();
  };
  
  const toggleSport = (sport) => {
    const index = selectedSports.value.indexOf(sport);
    if (index > -1) {
      selectedSports.value.splice(index, 1);
    } else {
      selectedSports.value.push(sport);
    }
    saveFiltersToSettings();
  };
  
  const toggleCurrency = (currency) => {
    const index = selectedCurrencies.value.indexOf(currency);
    if (index > -1) {
      selectedCurrencies.value.splice(index, 1);
    } else {
      selectedCurrencies.value.push(currency);
    }
    saveFiltersToSettings();
  };
  
  // Funções de favoritos com cache
  const selectFavoriteHouses = () => {
    // Seleciona apenas as casas que estão no cache de favoritos
    selectedHouses.value = favoritesCache.value.houses.filter(house => 
      filterOptions.houses.includes(house)
    );
    saveFiltersToSettings();
  };
  
  const selectFavoriteSports = () => {
    // Seleciona apenas os esportes que estão no cache de favoritos
    selectedSports.value = favoritesCache.value.sports.filter(sport => 
      filterOptions.sports.some(s => s.value === sport)
    );
    saveFiltersToSettings();
  };
  
  // Funções de toggle de favoritos individuais com cache
  const toggleFavoriteHouse = (house) => {
    // Verifica se o item já está no cache de favoritos
    const cacheIndex = favoritesCache.value.houses.indexOf(house);
    
    if (cacheIndex > -1) {
      // Remove do cache se já estiver marcado
      favoritesCache.value.houses.splice(cacheIndex, 1);
    } else {
      // Adiciona ao cache se não estiver marcado
      favoritesCache.value.houses.push(house);
    }
    
    // Atualiza o estado visual (para exibir a estrela)
    const visualIndex = favoriteHouses.value.indexOf(house);
    if (visualIndex > -1) {
      favoriteHouses.value.splice(visualIndex, 1);
    } else {
      favoriteHouses.value.push(house);
    }
    
    // Salva o cache de favoritos
    saveFavoritesCache();
    saveFiltersToSettings();
  };
  
  const toggleFavoriteSport = (sport) => {
    // Verifica se o item já está no cache de favoritos
    const cacheIndex = favoritesCache.value.sports.indexOf(sport);
    
    if (cacheIndex > -1) {
      // Remove do cache se já estiver marcado
      favoritesCache.value.sports.splice(cacheIndex, 1);
    } else {
      // Adiciona ao cache se não estiver marcado
      favoritesCache.value.sports.push(sport);
    }
    
    // Atualiza o estado visual (para exibir a estrela)
    const visualIndex = favoriteSports.value.indexOf(sport);
    if (visualIndex > -1) {
      favoriteSports.value.splice(visualIndex, 1);
    } else {
      favoriteSports.value.push(sport);
    }
    
    // Salva o cache de favoritos
    saveFavoritesCache();
    saveFiltersToSettings();
  };
  
  const clearHouseSearch = () => {
    houseSearchTerm.value = "";
  };
  
  const clearSportSearch = () => {
    sportSearchTerm.value = "";
  };
  
  const clearMarketSearch = () => {
    marketSearchTerm.value = "";
  };
  
  const generateSearchSuggestions = () => {
    if (!unifiedSearchTerm.value.trim()) {
      searchSuggestions.value = [];
      return;
    }
    
    const searchTerm = unifiedSearchTerm.value.toLowerCase().trim();
    const suggestions = [];
    
    // Sugestões de mercados
    const marketTranslations = getMarketTranslations();
    Object.entries(marketTranslations).forEach(([original, translated]) => {
      if (original.toLowerCase().includes(searchTerm) || 
          translated.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: "Mercado",
          text: translated,
          original: original,
          category: "market",
        });
      }
    });
    
    // Sugestões de esportes
    filterOptions.sports.forEach(sport => {
      if (sport.label && sport.label.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: "Esporte",
          text: sport.label,
          original: sport.value,
          category: "sport",
        });
      }
    });
    
    searchSuggestions.value = suggestions.slice(0, 10);
  };
  
  const detectSearchType = () => {
    if (!unifiedSearchTerm.value.trim()) {
      activeSearchType.value = null;
      return;
    }
    
    if (searchSuggestions.value.some(s => s.category === "market")) {
      activeSearchType.value = "market";
    } else if (searchSuggestions.value.some(s => s.category === "tournament")) {
      activeSearchType.value = "tournament";
    } else if (searchSuggestions.value.some(s => s.category === "sport")) {
      activeSearchType.value = "sport";
    } else {
      activeSearchType.value = "general";
    }
  };
  
  const selectSuggestion = (suggestion) => {
    unifiedSearchTerm.value = suggestion.text;
    activeSearchType.value = suggestion.category;
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
  };
  
  const hideSearchSuggestions = () => {
    setTimeout(() => {
      showSearchSuggestions.value = false;
      selectedSuggestionIndex.value = -1;
    }, 200);
  };
  
  const getMarketTranslations = () => {
    return {
      "Over/Under": "Mais de/Menos de",
      "Handicap": "Handicap",
      "1X2": "Resultado Final",
      "Both Teams to Score": "Ambos os times marcam",
    };
  };
  
  // Função para salvar cache de favoritos
  const saveFavoritesCache = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      let settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      if (!settings.favoritesCache) {
        settings.favoritesCache = {};
      }
      
      settings.favoritesCache.houses = [...favoritesCache.value.houses];
      settings.favoritesCache.sports = [...favoritesCache.value.sports];
      
      localStorage.setItem("app_settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Erro ao salvar cache de favoritos:", error);
    }
  };
  
  // Função para carregar cache de favoritos
  const loadFavoritesCache = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.favoritesCache) {
          if (settings.favoritesCache.houses && Array.isArray(settings.favoritesCache.houses)) {
            favoritesCache.value.houses = [...settings.favoritesCache.houses];
          }
          if (settings.favoritesCache.sports && Array.isArray(settings.favoritesCache.sports)) {
            favoritesCache.value.sports = [...settings.favoritesCache.sports];
          }
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar cache de favoritos:", error);
    }
  };

  const saveFiltersToSettings = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      let settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      if (!settings.filters) {
        settings.filters = {};
      }
      
      settings.filters.selectedHouses = selectedHouses.value;
      settings.filters.selectedSports = selectedSports.value;
      settings.filters.selectedCurrencies = selectedCurrencies.value;
      settings.filters.selectedDate = selectedDate.value;
      settings.filters.activeFilter = activeFilter.value;
      settings.filters.houseSearchTerm = houseSearchTerm.value;
      settings.filters.marketSearchTerm = marketSearchTerm.value;
      settings.filters.favoriteHouses = favoriteHouses.value;
      settings.filters.favoriteSports = favoriteSports.value;
      
      localStorage.setItem("app_settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Erro ao salvar filtros nas configurações:", error);
    }
  };
  
  const loadFiltersFromSettings = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.filters) {
          if (settings.filters.selectedHouses && settings.filters.selectedHouses.length > 0) {
            selectedHouses.value = settings.filters.selectedHouses;
          }
          if (settings.filters.selectedSports && settings.filters.selectedSports.length > 0) {
            selectedSports.value = settings.filters.selectedSports;
          }
          if (settings.filters.selectedCurrencies && settings.filters.selectedCurrencies.length > 0) {
            selectedCurrencies.value = settings.filters.selectedCurrencies;
          }
          if (settings.filters.selectedDate) {
            selectedDate.value = settings.filters.selectedDate;
          }
          if (settings.filters.activeFilter) {
            activeFilter.value = settings.filters.activeFilter;
          }
          if (settings.filters.houseSearchTerm) {
            houseSearchTerm.value = settings.filters.houseSearchTerm;
          }
          if (settings.filters.marketSearchTerm) {
            marketSearchTerm.value = settings.filters.marketSearchTerm;
          }
          if (settings.filters.favoriteHouses && Array.isArray(settings.filters.favoriteHouses)) {
            favoriteHouses.value = settings.filters.favoriteHouses;
          }
          if (settings.filters.favoriteSports && Array.isArray(settings.filters.favoriteSports)) {
            favoriteSports.value = settings.filters.favoriteSports;
          }
        }
      }
      
      // Carrega o cache de favoritos e sincroniza com o estado visual
      loadFavoritesCache();
      syncFavoritesVisualState();
      
    } catch (error) {
      console.warn("Erro ao carregar filtros das configurações:", error);
    }
  };
  
  const updateFiltersCache = () => {
    filtersCache.value = {
      selectedHouses: [...selectedHouses.value],
      selectedSports: [...selectedSports.value],
      selectedCurrencies: [...selectedCurrencies.value],
      selectedDate: selectedDate.value,
      activeFilter: activeFilter.value,
      minProfit: minProfit.value,
      maxProfit: maxProfit.value,
      selectedRiskLevel: selectedRiskLevel.value,
      houseSearchTerm: houseSearchTerm.value,
      marketSearchTerm: marketSearchTerm.value,
    };
  };
  
  const restoreFiltersFromCache = () => {
    if (checkIfUserExplicitlyDeselectedAll()) {
      return;
    }
    
    if (filtersCache.value.selectedHouses.length > 0) {
      selectedHouses.value = [...filtersCache.value.selectedHouses];
    }
    if (filtersCache.value.selectedSports.length > 0) {
      selectedSports.value = [...filtersCache.value.selectedSports];
    }
    if (filtersCache.value.selectedCurrencies.length > 0) {
      selectedCurrencies.value = [...filtersCache.value.selectedCurrencies];
    }
    if (filtersCache.value.selectedDate) {
      selectedDate.value = filtersCache.value.selectedDate;
    }
    if (filtersCache.value.activeFilter) {
      activeFilter.value = filtersCache.value.activeFilter;
    }
  };
  
  const checkIfUserExplicitlyDeselectedAll = () => {
    const now = Date.now();
    const lastDeselectTime = lastDeselectAllTime.value || 0;
    return now - lastDeselectTime < 5000;
  };
  
  // Função para sincronizar estado visual dos favoritos com o cache
  const syncFavoritesVisualState = () => {
    // Sincroniza casas de apostas
    favoriteHouses.value = [...favoritesCache.value.houses];
    
    // Sincroniza esportes
    favoriteSports.value = [...favoritesCache.value.sports];
  };

  const loadDefaultFilters = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.defaultFilters) {
          if (settings.defaultFilters.minProfit !== undefined && 
              !isNaN(Number(settings.defaultFilters.minProfit))) {
            minProfit.value = Math.max(0, Number(settings.defaultFilters.minProfit));
          }
          if (settings.defaultFilters.maxProfit !== undefined && 
              !isNaN(Number(settings.defaultFilters.maxProfit))) {
            maxProfit.value = Math.max(minProfit.value + 1, Number(settings.defaultFilters.maxProfit));
          }
          if (settings.defaultFilters.activeFilter) {
            activeFilter.value = settings.defaultFilters.activeFilter;
          }
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar filtros padrão:", error);
    }
  };
  
  // Watchers
  watch(selectedHouses, () => {
    saveFiltersToSettings();
  });
  
  watch(selectedSports, () => {
    saveFiltersToSettings();
  });
  
  watch(selectedCurrencies, () => {
    saveFiltersToSettings();
  });
  
  watch(selectedDate, () => {
    saveFiltersToSettings();
  });
  
  watch(activeFilter, () => {
    saveFiltersToSettings();
  });
  
  return {
    // Estados
    selectedHouses,
    selectedSports,
    selectedCurrencies,
    selectedRiskLevel,
    minProfit,
    maxProfit,
    selectedDate,
    activeFilter,
    houseSearchTerm,
    sportSearchTerm,
    marketSearchTerm,
    unifiedSearchTerm,
    activeSearchType,
    favoriteSports,
    favoriteHouses,
    favoritesCache,
    showFilterOverlay,
    searchSuggestions,
    showSearchSuggestions,
    selectedSuggestionIndex,
    filtersCache,
    lastDeselectAllTime,
    
    // Computed
    filteredHouses,
    filteredSports,
    isUsingDefaultProfitFilters,
    
    // Métodos
    setFilter,
    setRiskLevel,
    toggleFilterOverlay,
    clearFilters,
    applyFilters,
    onDateChange,
    clearDateFilter,
    onUnifiedSearchInput,
    clearUnifiedSearch,
    selectAllHouses,
    deselectAllHouses,
    selectAllSports,
    deselectAllSports,
    selectAllCurrencies,
    deselectAllCurrencies,
    toggleHouse,
    toggleSport,
    toggleCurrency,
    selectFavoriteHouses,
    selectFavoriteSports,
    toggleFavoriteHouse,
    toggleFavoriteSport,
    clearHouseSearch,
    clearSportSearch,
    clearMarketSearch,
    generateSearchSuggestions,
    detectSearchType,
    selectSuggestion,
    hideSearchSuggestions,
    getMarketTranslations,
    saveFiltersToSettings,
    loadFiltersFromSettings,
    saveFavoritesCache,
    loadFavoritesCache,
    syncFavoritesVisualState,
    updateFiltersCache,
    restoreFiltersFromCache,
    checkIfUserExplicitlyDeselectedAll,
    loadDefaultFilters,
  };
}

