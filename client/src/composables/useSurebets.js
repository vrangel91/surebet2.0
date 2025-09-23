import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useFilters } from './useFilters.js';
import { useSearchAndPagination } from './useSearchAndPagination.js';
import { useNotifications } from './useNotifications.js';
import { useSavedFilters } from './useSavedFilters.js';
import { useSurebetsData } from './useSurebetsData.js';
import { usePinnedCards } from './usePinnedCards.js';
import { useBookmakerAccounts } from './useBookmakerAccounts.js';
import { useSidebar } from './useSidebar.js';
import { useSurebetsSSE } from './useSurebetsSSE.js';
import { useTheme } from './useTheme.js';

export function useSurebets() {
  // Composables
  const filters = useFilters();
  const searchAndPagination = useSearchAndPagination();
  const notifications = useNotifications();
  const savedFilters = useSavedFilters();
  const surebetsData = useSurebetsData(filters);
  const pinnedCards = usePinnedCards();
  const bookmakerAccounts = useBookmakerAccounts();
  const sidebar = useSidebar();
  const theme = useTheme();
  
  // Função para atualizar dados quando chegarem via SSE
  const handleSSEDataUpdate = (data) => {
    console.log('🔄 Atualizando dados de surebets via SSE:', data);
    surebetsData.surebets.value = data;
    surebetsData.updateAvailableBookmakers(data);
    surebetsData.updateStats();
    
    // Parar o loading quando os dados chegarem
    searchAndPagination.setLoading(false);
  };
  
  // Conectar filtros com dados
  const applyFiltersToData = () => {
    // Esta função será chamada quando os filtros mudarem
    console.log('🔍 Aplicando filtros aos dados...');
    // Resetar paginação quando filtros mudarem
    surebetsData.resetPagination();
  };
  
  // Watcher para resetar paginação quando filtros mudarem
  watch([
    () => filters.activeFilter,
    () => filters.selectedHouses,
    () => filters.selectedSports,
    () => filters.selectedCurrencies,
    () => filters.selectedDate,
    () => filters.minProfit,
    () => filters.maxProfit,
    () => filters.selectedRiskLevel,
    () => filters.unifiedSearchTerm
  ], () => {
    applyFiltersToData();
  }, { deep: true });
  
  const sse = useSurebetsSSE(handleSSEDataUpdate);
  
  // Estados específicos da view
  const roundValues = ref(false);
  const showSearchSuggestions = ref(false);
  
  // Computed properties que dependem de múltiplos composables
  const hasMoreItems = computed(() => {
    return surebetsData.hasMoreItems.value;
  });
  
  const remainingItemsCount = computed(() => {
    return surebetsData.remainingItemsCount.value;
  });
  
  // Métodos que coordenam múltiplos composables
  const loadMoreCards = async () => {
    surebetsData.loadMoreItems();
  };
  
  const manualRefresh = async () => {
    await searchAndPagination.manualRefresh(fetchSurebets);
  };
  
  const toggleSearch = () => {
    searchAndPagination.toggleSearch();
  };
  
  const toggleSound = () => {
    searchAndPagination.toggleSound();
  };
  
  const toggleFilterOverlay = () => {
    filters.toggleFilterOverlay();
  };
  
  const setFilter = (filter) => {
    filters.setFilter(filter);
  };
  
  const onDateChange = (date) => {
    filters.onDateChange(date);
  };
  
  const clearDateFilter = () => {
    filters.clearDateFilter();
  };
  
  const onUnifiedSearchInput = (term) => {
    filters.onUnifiedSearchInput(term);
  };
  
  const hideSearchSuggestions = () => {
    showSearchSuggestions.value = false;
  };
  
  const scrollToPinnedCards = () => {
    pinnedCards.scrollToPinnedCards();
  };
  
  const toggleDragMode = () => {
    pinnedCards.toggleDragMode();
  };
  
  const clearAllPinnedCards = () => {
    pinnedCards.clearAllPinnedCards();
  };
  
  const onDrop = (event) => {
    pinnedCards.onDrop(event);
  };
  
  const onDragStart = (event) => {
    pinnedCards.onDragStart(event);
  };
  
  const onDragEnd = (event) => {
    pinnedCards.onDragEnd(event);
  };
  
  const onDragEnter = (event) => {
    pinnedCards.onDragEnter(event);
  };
  
  const addSurebetToReports = (surebet) => {
    bookmakerAccounts.addSurebetToReports(surebet);
  };
  
  const togglePinCard = (surebet) => {
    pinnedCards.togglePinCard(surebet);
  };
  
  const handleBalanceDebited = (data) => {
    bookmakerAccounts.handleBalanceDebited(data);
  };
  
  const refreshAccounts = () => {
    bookmakerAccounts.refreshAccounts();
  };
  
  const setRiskLevel = (level) => {
    filters.setRiskLevel(level);
  };
  
  const selectAllHouses = () => {
    filters.selectAllHouses();
  };
  
  const deselectAllHouses = () => {
    filters.deselectAllHouses();
  };
  
  const selectFavoriteHouses = () => {
    filters.selectFavoriteHouses();
  };
  
  const toggleHouse = (house) => {
    filters.toggleHouse(house);
  };
  
  const selectAllSports = () => {
    filters.selectAllSports();
  };
  
  const deselectAllSports = () => {
    filters.deselectAllSports();
  };
  
  const selectFavoriteSports = () => {
    filters.selectFavoriteSports();
  };
  
  const toggleFavoriteHouse = (house) => {
    filters.toggleFavoriteHouse(house);
  };
  
  const toggleFavoriteSport = (sport) => {
    filters.toggleFavoriteSport(sport);
  };
  
  const toggleSport = (sport) => {
    filters.toggleSport(sport);
  };
  
  const selectAllCurrencies = () => {
    filters.selectAllCurrencies();
  };
  
  const deselectAllCurrencies = () => {
    filters.deselectAllCurrencies();
  };
  
  const toggleCurrency = (currency) => {
    filters.toggleCurrency(currency);
  };
  
  const clearFilters = () => {
    filters.clearFilters();
  };
  
  const applyFilters = () => {
    filters.applyFilters();
  };
  
  const closeSaveFilterModal = () => {
    savedFilters.closeSaveFilterModal();
  };
  
  const saveFilter = () => {
    savedFilters.saveFilter(filters, notifications.showNotification);
  };
  
  const closeSavedFiltersModal = () => {
    savedFilters.closeSavedFiltersModal();
  };
  
  const loadFilter = (filter) => {
    savedFilters.loadFilter(filter, filters, notifications.showNotification);
  };
  
  const deleteFilter = (index) => {
    savedFilters.deleteFilter(index, notifications.showNotification);
  };
  
  const showLiveRestrictedMessage = () => {
    notifications.showLiveRestrictedMessage();
  };
  
  const handleSidebarToggle = () => {
    sidebar.handleSidebarToggle();
  };
  
  const handleSidebarStateLoaded = (state) => {
    sidebar.handleSidebarStateLoaded(state);
  };
  
  // Método para buscar surebets (será implementado pelo SSE)
  const fetchSurebets = async () => {
    // Esta função será implementada pelo composable de SSE
    console.log("Fetching surebets...");
  };
  
  // Inicialização
  onMounted(() => {
    // Carregar dados iniciais
    pinnedCards.loadPinnedCards();
    bookmakerAccounts.loadBookmakerAccounts();
    sidebar.loadSidebarState();
    
    // Carregar configurações
    filters.loadDefaultFilters();
    filters.loadFiltersFromSettings();
    searchAndPagination.loadAutoSearchSettings();
    searchAndPagination.loadSoundSettings();
    
    // Carregar filtros salvos
    savedFilters.loadSavedFilters();
    
    // Aplicar configurações
    searchAndPagination.applyBackgroundSearchSettings();
    
    // Limpar estado dos modais
    savedFilters.clearModalState();
    
    // Carregar preferência de arredondamento
    const savedRoundValues = localStorage.getItem('roundValues');
    if (savedRoundValues !== null) {
      roundValues.value = savedRoundValues === 'true';
    }
  });

  onUnmounted(() => {
    // Limpar timers
    searchAndPagination.clearAllTimers();
    sse.disconnect();
  });
  
  // Retornar todos os estados e métodos necessários
  return {
    // Estados dos composables
    ...filters,
    ...searchAndPagination,
    ...notifications,
    ...savedFilters,
    ...surebetsData,
    ...pinnedCards,
    ...bookmakerAccounts,
    ...sidebar,
    ...sse,
    ...theme,
    
    // Estados específicos da view
    roundValues,
    showSearchSuggestions,
    
    // Computed properties
    hasMoreItems,
    remainingItemsCount,
    
    // Métodos coordenados
    loadMoreCards,
    manualRefresh,
    toggleSearch,
    toggleSound,
    toggleFilterOverlay,
    setFilter,
    onDateChange,
    clearDateFilter,
    onUnifiedSearchInput,
    hideSearchSuggestions,
    scrollToPinnedCards,
    toggleDragMode,
    clearAllPinnedCards,
    onDrop,
    onDragStart,
    onDragEnd,
    onDragEnter,
    addSurebetToReports,
    togglePinCard,
    handleBalanceDebited,
    refreshAccounts,
    setRiskLevel,
    selectAllHouses,
    deselectAllHouses,
    selectFavoriteHouses,
    toggleHouse,
    selectAllSports,
    deselectAllSports,
    selectFavoriteSports,
    toggleFavoriteHouse,
    toggleFavoriteSport,
    toggleSport,
    selectAllCurrencies,
    deselectAllCurrencies,
    toggleCurrency,
    clearFilters,
    applyFilters,
    closeSaveFilterModal,
    saveFilter,
    closeSavedFiltersModal,
    loadFilter,
    deleteFilter,
    showLiveRestrictedMessage,
    handleSidebarToggle,
    handleSidebarStateLoaded,
    fetchSurebets,
  };
}