import { ref, computed } from 'vue';
import { getTranslationsByCategory } from '../services/tournamentTranslationService.js';

export function useSearchAndPagination() {
  // Estados de busca
  const isSearching = ref(true);
  const soundEnabled = ref(true);
  const loading = ref(true);
  
  // Estados de paginação
  const itemsPerPage = ref(100);
  const currentPage = ref(1);
  const isLoadingMore = ref(false);
  
  // Estados de busca automática
  const autoUpdateInterval = ref(300000); // 5 minutos
  const backgroundSearch = ref(true);
  const updateInterval = ref(null);
  
  // Estados de debounce
  const debounceTimer = ref(null);
  
  // Computed properties
  const hasMoreItems = computed(() => {
    // Esta propriedade será calculada baseada nos dados filtrados
    return false; // Será sobrescrita pelo composable principal
  });
  
  const remainingItemsCount = computed(() => {
    // Esta propriedade será calculada baseada nos dados filtrados
    return 0; // Será sobrescrita pelo composable principal
  });
  
  // Métodos
  const toggleSearch = () => {
    isSearching.value = !isSearching.value;
    saveSearchStateToSettings();
  };
  
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
  };
  
  const manualRefresh = async (fetchFunction) => {
    if (loading.value) return;
    
    console.log("🔄 Refresh manual iniciado");
    loading.value = true;
    
    try {
      resetPagination();
      if (fetchFunction) {
        await fetchFunction();
      }
      console.log("✅ Refresh manual concluído");
    } catch (error) {
      console.error("❌ Erro no refresh manual:", error);
    } finally {
      loading.value = false;
    }
  };
  
  const loadMoreCards = async () => {
    if (isLoadingMore.value) return;
    
    isLoadingMore.value = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      currentPage.value++;
      console.log(`📄 Carregando página ${currentPage.value}`);
    } catch (error) {
      console.error("Erro ao carregar mais cards:", error);
    } finally {
      isLoadingMore.value = false;
    }
  };
  
  const resetPagination = () => {
    currentPage.value = 1;
    console.log("🔄 Paginação resetada");
  };
  
  const debouncedFetch = (fetchFunction, delay = 1000) => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }
    
    debounceTimer.value = setTimeout(() => {
      if (fetchFunction) {
        fetchFunction();
      }
    }, delay);
  };
  
  const startAutoUpdate = (fetchFunction) => {
    stopAutoUpdate();
    
    const adaptiveInterval = Math.max(autoUpdateInterval.value, 60000);
    autoUpdateInterval.value = adaptiveInterval;
    
    updateInterval.value = setInterval(() => {
      if (isSearching.value) {
        debouncedFetch(fetchFunction);
      }
    }, autoUpdateInterval.value);
    
    console.log(`🔍 Busca automática iniciada com intervalo de ${autoUpdateInterval.value / 1000} segundos`);
  };
  
  const stopAutoUpdate = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value);
      updateInterval.value = null;
    }
  };
  
  const loadAutoSearchSettings = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.autoSearch) {
          if (settings.autoSearch.enabled !== undefined) {
            isSearching.value = settings.autoSearch.enabled;
          }
          if (settings.autoSearch.interval && !isNaN(Number(settings.autoSearch.interval))) {
            autoUpdateInterval.value = Number(settings.autoSearch.interval) * 1000;
          }
          if (settings.autoSearch.background !== undefined) {
            backgroundSearch.value = settings.autoSearch.background;
          }
        }
      }
    } catch (error) {
      console.log("Erro ao carregar configurações de busca automática:", error);
      autoUpdateInterval.value = 300000;
      backgroundSearch.value = true;
    }
  };
  
  const saveSearchStateToSettings = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      let settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      if (!settings.autoSearch) {
        settings.autoSearch = {};
      }
      
      settings.autoSearch.enabled = isSearching.value;
      localStorage.setItem("app_settings", JSON.stringify(settings));
    } catch (error) {
      console.log("Erro ao salvar estado da busca nas configurações:", error);
    }
  };
  
  const loadSoundSettings = () => {
    try {
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.soundEnabled !== undefined) {
          soundEnabled.value = settings.soundEnabled;
        }
      }
    } catch (error) {
      console.log("Erro ao carregar configurações de som:", error);
    }
  };
  
  const applyBackgroundSearchSettings = () => {
    if (backgroundSearch.value) {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          console.log("🔄 Aba não está ativa, mas busca em segundo plano está habilitada");
        } else {
          console.log("👁️ Aba ativa novamente, busca automática funcionando normalmente");
        }
      });
    }
  };
  
  const clearAllTimers = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value);
      updateInterval.value = null;
    }
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
    console.log("🧹 Todos os timers limpos");
  };
  
  const setLoading = (value) => {
    loading.value = value;
  };
  
  return {
    // Estados
    isSearching,
    soundEnabled,
    loading,
    itemsPerPage,
    currentPage,
    isLoadingMore,
    autoUpdateInterval,
    backgroundSearch,
    updateInterval,
    debounceTimer,
    
    // Computed
    hasMoreItems,
    remainingItemsCount,
    
    // Métodos
    toggleSearch,
    toggleSound,
    manualRefresh,
    loadMoreCards,
    resetPagination,
    debouncedFetch,
    startAutoUpdate,
    stopAutoUpdate,
    loadAutoSearchSettings,
    saveSearchStateToSettings,
    loadSoundSettings,
    applyBackgroundSearchSettings,
    clearAllTimers,
    setLoading,
  };
}

