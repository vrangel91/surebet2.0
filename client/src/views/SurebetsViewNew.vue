<template>
  <MainLayout :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleSidebarToggle"
    @sidebar-state-loaded="handleSidebarStateLoaded">

    <!-- Conteúdo Específico de Surebets -->
    <SurebetsContent :isSearching="isSearching" :soundEnabled="soundEnabled" :loading="loading"
      :pinnedCards="pinnedCards" :dragMode="dragMode" :draggedIndex="draggedIndex" :dragOverIndex="dragOverIndex"
      :bookmakerAccounts="bookmakerAccounts" :isLoadingAccounts="isLoadingAccounts" :roundValues="roundValues"
      :activeFilter="activeFilter" :preliveCount="preliveCount" :liveCount="liveCount" :selectedDate="selectedDate"
      :unifiedSearchTerm="unifiedSearchTerm" :activeSearchType="activeSearchType" :paginatedSurebets="paginatedSurebets"
      :filteredSurebetsByMarket="filteredSurebetsByMarket" :hasMoreItems="hasMoreItems"
      :remainingItemsCount="remainingItemsCount" :filteredSurebetsByUnifiedSearch="filteredSurebetsByUnifiedSearch"
      :filteredSurebets="filteredSurebets" :isLoadingMore="isLoadingMore" :lastCheckCount="lastCheckCount"
      :uptimeMinutes="uptimeMinutes" @toggle-search="toggleSearch" @toggle-sound="toggleSound"
      @manual-refresh="manualRefresh" @toggle-filter-overlay="toggleFilterOverlay"
      @scroll-to-pinned-cards="scrollToPinnedCards" @set-filter="setFilter"
      @show-live-restricted-message="showLiveRestrictedMessage" @date-change="onDateChange"
      @clear-date-filter="clearDateFilter" @unified-search-input="onUnifiedSearchInput"
      @show-search-suggestions="showSearchSuggestions = true" @hide-search-suggestions="hideSearchSuggestions"
      @toggle-drag-mode="toggleDragMode" @clear-all-pinned-cards="clearAllPinnedCards" @on-drop="onDrop"
      @on-drag-start="onDragStart" @on-drag-end="onDragEnd" @on-drag-enter="onDragEnter"
      @add-to-reports="addSurebetToReports" @toggle-pin="togglePinCard" @balance-debited="handleBalanceDebited"
      @refresh-accounts="refreshAccounts" @load-more-cards="loadMoreCards" />

    <!-- Áudio para Notificações -->
    <NotificationAudio ref="notificationAudio" />

    <!-- Modais -->
    <SurebetsModals :showFilterOverlay="showFilterOverlay" :minProfit="minProfit" :maxProfit="maxProfit"
      :isUsingDefaultProfitFilters="isUsingDefaultProfitFilters" :roundValues="roundValues"
      :selectedRiskLevel="selectedRiskLevel" :houseSearchTerm="houseSearchTerm" :sportSearchTerm="sportSearchTerm"
      :selectedHouses="selectedHouses" :selectedSports="selectedSports" :selectedCurrencies="selectedCurrencies"
      :filteredHouses="filteredHouses" :filteredSports="filteredSports" :filterOptions="filterOptions"
      :favoriteHouses="favoriteHouses" :favoriteSports="favoriteSports" :showSaveFilterModal="showSaveFilterModal"
      :currentFilterName="currentFilterName" :showSavedFiltersModal="showSavedFiltersModal" :savedFilters="savedFilters"
      @toggle-filter-overlay="toggleFilterOverlay" @update:minProfit="minProfit = $event"
      @update:maxProfit="maxProfit = $event" @update:roundValues="roundValues = $event" @set-risk-level="setRiskLevel"
      @select-all-houses="selectAllHouses" @deselect-all-houses="deselectAllHouses"
      @select-favorite-houses="selectFavoriteHouses" @update:houseSearchTerm="houseSearchTerm = $event"
      @clear-house-search="houseSearchTerm = ''" @toggle-house="toggleHouse" @select-all-sports="selectAllSports"
      @deselect-all-sports="deselectAllSports" @select-favorite-sports="selectFavoriteSports"
      @update:sportSearchTerm="sportSearchTerm = $event" @clear-sport-search="sportSearchTerm = ''"
      @toggle-sport="toggleSport" @select-all-currencies="selectAllCurrencies"
      @deselect-all-currencies="deselectAllCurrencies" @toggle-currency="toggleCurrency" @clear-filters="clearFilters"
      @apply-filters="applyFilters" @close-save-filter-modal="closeSaveFilterModal"
      @update:currentFilterName="currentFilterName = $event" @save-filter="saveFilter"
      @close-saved-filters-modal="closeSavedFiltersModal" @load-filter="loadFilter" @delete-filter="deleteFilter"
      @toggle-favorite-house="toggleFavoriteHouse" @toggle-favorite-sport="toggleFavoriteSport" />
  </MainLayout>
</template>

<script>
import { onMounted, ref } from 'vue';
import MainLayout from "../components/surebet/MainLayout.vue";
import SurebetsContent from "../components/surebet/SurebetsContent.vue";
import SurebetsModals from "../components/surebet/SurebetsModals.vue";
import NotificationAudio from "../components/surebet/NotificationAudio.vue";

import { useSurebetsData } from "../composables/useSurebetsData.js";
import { useSurebetsSSE } from "../composables/useSurebetsSSE.js";
import { usePinnedCards } from "../composables/usePinnedCards.js";
import { useBookmakerAccounts } from "../composables/useBookmakerAccounts.js";
import { useSidebar } from "../composables/useSidebar.js";

import { filterOptions } from "../config/filters.js";
import { getBookmakerUrl, addBookmakerUrl } from "../config/bookmakerUrls.js";
import marketTranslations from "../config/marketTranslations.json";
import { MapPin, Trash2 } from "lucide-vue-next";

// Silenciar console.log para produção
const silentLog = () => { };
console.log = silentLog;

export default {
  name: "SurebetsView",
  components: {
    MainLayout,
    SurebetsContent,
    SurebetsModals,
    NotificationAudio,

    MapPin,
    Trash2,
  },
  setup() {
    // Composables
    const surebetsData = useSurebetsData();
    const websocket = useSurebetsSSE();
    const pinnedCards = usePinnedCards();
    const bookmakerAccounts = useBookmakerAccounts();
    const sidebar = useSidebar();

    // Estados adicionais específicos da view
    const showSearchSuggestions = ref(false);
    const roundValues = ref(false);

    // Carregar dados iniciais
    onMounted(() => {
      pinnedCards.loadPinnedCards();
      bookmakerAccounts.loadBookmakerAccounts();
    });

    // Métodos específicos da view
    const showLiveRestrictedMessage = () => {
      // Lógica para mostrar mensagem de restrição ao vivo
      console.log('Mostrando mensagem de restrição ao vivo');
    };

    const hideSearchSuggestions = () => {
      showSearchSuggestions.value = false;
    };

    return {
      // Dados de surebets
      ...surebetsData,

      // WebSocket e polling
      ...websocket,

      // Cards fixos
      ...pinnedCards,

      // Contas de bookmaker
      ...bookmakerAccounts,

      // Sidebar
      ...sidebar,

      // Estados específicos da view
      showSearchSuggestions,
      roundValues,

      // Métodos específicos da view
      showLiveRestrictedMessage,
      hideSearchSuggestions,

      // Configurações
      filterOptions,
      getBookmakerUrl,
      addBookmakerUrl,
      marketTranslations,
    };
  },
};
</script>
