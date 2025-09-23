<template>
  <div class="filters">
    <!-- Controles de Busca -->
    <SearchControls :isSearching="isSearching" :soundEnabled="soundEnabled" :loading="loading"
      :pinnedCardsCount="pinnedCardsCount" @toggle-search="$emit('toggle-search')" @toggle-sound="$emit('toggle-sound')"
      @manual-refresh="$emit('manual-refresh')" @toggle-filter-overlay="$emit('toggle-filter-overlay')"
      @scroll-to-pinned-cards="$emit('scroll-to-pinned-cards')" />

    <FilterTabs :activeFilter="activeFilter" :preliveCount="preliveCount" :liveCount="liveCount"
      :selectedDate="selectedDate" :unifiedSearchTerm="unifiedSearchTerm" :activeSearchType="activeSearchType"
      @set-filter="$emit('set-filter', $event)" @show-live-restricted-message="$emit('show-live-restricted-message')"
      @date-change="$emit('date-change', $event)" @clear-date-filter="$emit('clear-date-filter')"
      @unified-search-input="$emit('unified-search-input', $event)"
      @show-search-suggestions="$emit('show-search-suggestions')"
      @hide-search-suggestions="$emit('hide-search-suggestions')" />

    <GamesInfo :paginatedCount="paginatedCount" :totalCount="totalCount" :hasMoreItems="hasMoreItems"
      :remainingCount="remainingCount" :searchTerm="unifiedSearchTerm" :filteredCount="filteredCount"
      :totalFilteredCount="totalFilteredCount" :activeSearchType="activeSearchType" />
  </div>
</template>

<script>
import SearchControls from "./SearchControls.vue";
import FilterTabs from "./FilterTabs.vue";
import GamesInfo from "./GamesInfo.vue";

export default {
  name: "FiltersContainer",
  components: {
    SearchControls,
    FilterTabs,
    GamesInfo,
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
    pinnedCardsCount: {
      type: Number,
      default: 0,
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
    paginatedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    hasMoreItems: {
      type: Boolean,
      default: false,
    },
    remainingCount: {
      type: Number,
      default: 0,
    },
    filteredCount: {
      type: Number,
      default: 0,
    },
    totalFilteredCount: {
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
  ],
};
</script>

<style lang="scss" scoped>
.filters {
  margin-bottom: 20px;
}
</style>

