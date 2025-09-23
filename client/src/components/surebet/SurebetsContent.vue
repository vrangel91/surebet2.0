<template>
  <div>
    <!-- Header do Conteúdo -->
    <ContentHeader title="Surebets" subtitle="Encontre as melhores oportunidades de arbitragem" />

    <!-- Filtros Simples -->
    <FiltersContainer :isSearching="isSearching" :soundEnabled="soundEnabled" :loading="loading"
      :pinnedCardsCount="pinnedCards.length" :activeFilter="activeFilter" :preliveCount="preliveCount"
      :liveCount="liveCount" :selectedDate="selectedDate" :unifiedSearchTerm="unifiedSearchTerm"
      :activeSearchType="activeSearchType" :paginatedCount="paginatedSurebets.length"
      :totalCount="filteredSurebetsByMarket.length" :hasMoreItems="hasMoreItems" :remainingCount="remainingItemsCount"
      :filteredCount="filteredSurebetsByUnifiedSearch.length" :totalFilteredCount="filteredSurebets.length"
      @toggle-search="$emit('toggle-search')" @toggle-sound="$emit('toggle-sound')"
      @manual-refresh="$emit('manual-refresh')" @toggle-filter-overlay="$emit('toggle-filter-overlay')"
      @scroll-to-pinned-cards="$emit('scroll-to-pinned-cards')" @set-filter="$emit('set-filter', $event)"
      @show-live-restricted-message="$emit('show-live-restricted-message')" @date-change="$emit('date-change', $event)"
      @clear-date-filter="$emit('clear-date-filter')" @unified-search-input="$emit('unified-search-input', $event)"
      @show-search-suggestions="$emit('show-search-suggestions')"
      @hide-search-suggestions="$emit('hide-search-suggestions')" />

    <!-- Cards Fixos -->
    <PinnedCardsSection :pinnedCards="pinnedCards" :dragMode="dragMode" :draggedIndex="draggedIndex"
      :dragOverIndex="dragOverIndex" :bookmakerAccounts="bookmakerAccounts" :isLoadingAccounts="isLoadingAccounts"
      :roundValues="roundValues" @toggle-drag-mode="$emit('toggle-drag-mode')"
      @clear-all-pinned-cards="$emit('clear-all-pinned-cards')" @on-drop="$emit('on-drop', $event)"
      @on-drag-start="$emit('on-drag-start', $event)" @on-drag-end="$emit('on-drag-end', $event)"
      @on-drag-enter="$emit('on-drag-enter', $event)" @add-to-reports="$emit('add-to-reports', $event)"
      @toggle-pin="$emit('toggle-pin', $event)" @balance-debited="$emit('balance-debited', $event)"
      @refresh-accounts="$emit('refresh-accounts')" />

    <!-- Lista de Surebets -->
    <SurebetsGrid :loading="loading" :filteredSurebetsByMarket="filteredSurebetsByMarket"
      :paginatedSurebets="paginatedSurebets" :hasMoreItems="hasMoreItems" :isLoadingMore="isLoadingMore"
      :remainingItemsCount="remainingItemsCount" :lastCheckCount="lastCheckCount" :uptimeMinutes="uptimeMinutes"
      :bookmakerAccounts="bookmakerAccounts" :roundValues="roundValues" :isLoadingAccounts="isLoadingAccounts"
      @add-to-reports="$emit('add-to-reports', $event)" @toggle-pin="$emit('toggle-pin', $event)"
      @balance-debited="$emit('balance-debited', $event)" @refresh-accounts="$emit('refresh-accounts')"
      @load-more-cards="$emit('load-more-cards')" />
  </div>
</template>

<script>
import ContentHeader from "./ContentHeader.vue";
import FiltersContainer from "./FiltersContainer.vue";
import PinnedCardsSection from "./PinnedCardsSection.vue";
import SurebetsGrid from "./SurebetsGrid.vue";

export default {
  name: "SurebetsContent",
  components: {
    ContentHeader,
    FiltersContainer,
    PinnedCardsSection,
    SurebetsGrid,
  },
  props: {
    isSearching: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    pinnedCards: {
      type: Array,
      default: () => [],
    },
    dragMode: {
      type: Boolean,
      default: false,
    },
    draggedIndex: {
      type: Number,
      default: -1,
    },
    dragOverIndex: {
      type: Number,
      default: -1,
    },
    bookmakerAccounts: {
      type: Array,
      default: () => [],
    },
    isLoadingAccounts: {
      type: Boolean,
      default: false,
    },
    roundValues: {
      type: Boolean,
      default: false,
    },
    activeFilter: {
      type: String,
      default: "prelive",
    },
    preliveCount: {
      type: Number,
      default: 0,
    },
    liveCount: {
      type: Number,
      default: 0,
    },
    selectedDate: {
      type: String,
      default: "",
    },
    unifiedSearchTerm: {
      type: String,
      default: "",
    },
    activeSearchType: {
      type: String,
      default: "",
    },
    paginatedSurebets: {
      type: Array,
      default: () => [],
    },
    filteredSurebetsByMarket: {
      type: Array,
      default: () => [],
    },
    hasMoreItems: {
      type: Boolean,
      default: false,
    },
    remainingItemsCount: {
      type: Number,
      default: 0,
    },
    filteredSurebetsByUnifiedSearch: {
      type: Array,
      default: () => [],
    },
    filteredSurebets: {
      type: Array,
      default: () => [],
    },
    isLoadingMore: {
      type: Boolean,
      default: false,
    },
    lastCheckCount: {
      type: Number,
      default: 0,
    },
    uptimeMinutes: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "toggle-search",
    "toggle-sound",
    "manual-refresh",
    "toggle-filter-overlay",
    "scroll-to-pinned-cards",
    "set-filter",
    "show-live-restricted-message",
    "date-change",
    "clear-date-filter",
    "unified-search-input",
    "show-search-suggestions",
    "hide-search-suggestions",
    "toggle-drag-mode",
    "clear-all-pinned-cards",
    "on-drop",
    "on-drag-start",
    "on-drag-end",
    "on-drag-enter",
    "add-to-reports",
    "toggle-pin",
    "balance-debited",
    "refresh-accounts",
    "load-more-cards",
  ],
};
</script>

