import { ref } from 'vue';

export function useSavedFilters() {
  const savedFilters = ref([]);
  const showSaveFilterModal = ref(false);
  const showSavedFiltersModal = ref(false);
  const currentFilterName = ref("");
  
  const loadSavedFilters = (currentUser) => {
    try {
      const userId = currentUser?.id || "anonymous";
      const key = `saved_filters_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        savedFilters.value = JSON.parse(saved);
      }
      
      // Forçar o valor para false se estiver true
      if (showSaveFilterModal.value) {
        showSaveFilterModal.value = false;
      }
    } catch (error) {
      console.warn("Erro ao carregar filtros salvos:", error);
      savedFilters.value = [];
    }
  };
  
  const saveSavedFilters = (currentUser) => {
    try {
      const userId = currentUser?.id || "anonymous";
      const key = `saved_filters_${userId}`;
      localStorage.setItem(key, JSON.stringify(savedFilters.value));
    } catch (error) {
      console.error("Erro ao salvar filtros:", error);
    }
  };
  
  const openSaveFilterModal = () => {
    currentFilterName.value = "";
    showSaveFilterModal.value = true;
  };
  
  const closeSaveFilterModal = () => {
    showSaveFilterModal.value = false;
    currentFilterName.value = "";
  };
  
  const saveFilter = (filterData, showNotification) => {
    if (!currentFilterName.value.trim()) return;
    
    const newFilter = {
      id: Date.now(),
      name: currentFilterName.value.trim(),
      houses: [...filterData.selectedHouses],
      sports: [...filterData.selectedSports],
      currencies: [...filterData.selectedCurrencies],
      selectedDate: filterData.selectedDate,
      minProfit: filterData.minProfit,
      maxProfit: filterData.maxProfit,
      activeFilter: filterData.activeFilter,
      createdAt: new Date().toISOString(),
    };
    
    savedFilters.value.push(newFilter);
    closeSaveFilterModal();
    if (showNotification) {
      showNotification("Filtro salvo com sucesso!");
    }
  };
  
  const showSavedFiltersList = () => {
    showSavedFiltersModal.value = true;
  };
  
  const closeSavedFiltersModal = () => {
    showSavedFiltersModal.value = false;
  };
  
  const loadFilter = (filter, filterData, showNotification) => {
    if (filterData.checkIfUserExplicitlyDeselectedAll()) {
      if (showNotification) {
        showNotification(
          "Não é possível carregar filtro enquanto todos os filtros estão desmarcados!",
          "warning"
        );
      }
      return;
    }
    
    filterData.selectedHouses = filter.houses ? filter.houses : [];
    filterData.selectedSports = [...filter.sports];
    filterData.selectedCurrencies = [...filter.currencies];
    filterData.selectedDate = filter.selectedDate || "";
    filterData.minProfit = filter.minProfit;
    filterData.maxProfit = filter.maxProfit;
    filterData.activeFilter = filter.activeFilter;
    
    filterData.saveFiltersToSettings();
    closeSavedFiltersModal();
    if (showNotification) {
      showNotification(`Filtro "${filter.name}" carregado!`);
    }
  };
  
  const deleteFilter = (index, showNotification) => {
    const filterName = savedFilters.value[index].name;
    savedFilters.value.splice(index, 1);
    if (showNotification) {
      showNotification(`Filtro "${filterName}" excluído!`);
    }
  };
  
  const clearModalState = () => {
    showSaveFilterModal.value = false;
    showSavedFiltersModal.value = false;
    currentFilterName.value = "";
    
    try {
      localStorage.removeItem("showSaveFilterModal");
      localStorage.removeItem("showSavedFiltersModal");
      
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("modal") || key.includes("filter"))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Erro ao limpar localStorage dos modais:", error);
    }
  };
  
  return {
    savedFilters,
    showSaveFilterModal,
    showSavedFiltersModal,
    currentFilterName,
    loadSavedFilters,
    saveSavedFilters,
    openSaveFilterModal,
    closeSaveFilterModal,
    saveFilter,
    showSavedFiltersList,
    closeSavedFiltersModal,
    loadFilter,
    deleteFilter,
    clearModalState,
  };
}

