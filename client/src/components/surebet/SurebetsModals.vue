<template>
  <div>
    <!-- Overlay de Filtros -->
    <FilterOverlay :showFilterOverlay="showFilterOverlay" :minProfit="minProfit" :maxProfit="maxProfit"
      :isUsingDefaultProfitFilters="isUsingDefaultProfitFilters" :roundValues="roundValues"
      :selectedRiskLevel="selectedRiskLevel" :houseSearchTerm="houseSearchTerm" :sportSearchTerm="sportSearchTerm"
      :selectedHouses="selectedHouses" :selectedSports="selectedSports" :selectedCurrencies="selectedCurrencies"
      :filteredHouses="filteredHouses" :filteredSports="filteredSports" :filterOptions="filterOptions"
      :favoriteHouses="favoriteHouses" :favoriteSports="favoriteSports"
      @toggle-filter-overlay="$emit('toggle-filter-overlay')" @update:minProfit="$emit('update:minProfit', $event)"
      @update:maxProfit="$emit('update:maxProfit', $event)" @update:roundValues="$emit('update:roundValues', $event)"
      @set-risk-level="$emit('set-risk-level', $event)" @select-all-houses="$emit('select-all-houses')"
      @deselect-all-houses="$emit('deselect-all-houses')" @select-favorite-houses="$emit('select-favorite-houses')"
      @update:houseSearchTerm="$emit('update:houseSearchTerm', $event)"
      @clear-house-search="$emit('clear-house-search')" @toggle-house="$emit('toggle-house', $event)"
      @select-all-sports="$emit('select-all-sports')" @deselect-all-sports="$emit('deselect-all-sports')"
      @select-favorite-sports="$emit('select-favorite-sports')"
      @update:sportSearchTerm="$emit('update:sportSearchTerm', $event)"
      @clear-sport-search="$emit('clear-sport-search')" @toggle-sport="$emit('toggle-sport', $event)"
      @select-all-currencies="$emit('select-all-currencies')"
      @deselect-all-currencies="$emit('deselect-all-currencies')" @toggle-currency="$emit('toggle-currency', $event)"
      @clear-filters="$emit('clear-filters')" @apply-filters="$emit('apply-filters')"
      @toggle-favorite-house="$emit('toggle-favorite-house', $event)"
      @toggle-favorite-sport="$emit('toggle-favorite-sport', $event)" />

    <!-- Modal para Salvar Filtro -->
    <SaveFilterModal :showModal="showSaveFilterModal && false" :filterName="currentFilterName"
      :selectedHousesCount="selectedHouses.length" :selectedSportsCount="selectedSports.length"
      :selectedCurrenciesCount="selectedCurrencies.length" :minProfit="minProfit" :maxProfit="maxProfit"
      @close-modal="$emit('close-save-filter-modal')" @update:filterName="$emit('update:currentFilterName', $event)"
      @save-filter="$emit('save-filter')" />

    <!-- Modal para Listar Filtros Salvos -->
    <SavedFiltersModal :showModal="showSavedFiltersModal" :savedFilters="savedFilters"
      @close-modal="$emit('close-saved-filters-modal')" @load-filter="$emit('load-filter', $event)"
      @delete-filter="$emit('delete-filter', $event)" />
  </div>
</template>

<script>
import FilterOverlay from "./FilterOverlay.vue";
import SaveFilterModal from "./SaveFilterModal.vue";
import SavedFiltersModal from "./SavedFiltersModal.vue";

export default {
  name: "SurebetsModals",
  components: {
    FilterOverlay,
    SaveFilterModal,
    SavedFiltersModal,
  },
  props: {
    showFilterOverlay: {
      type: Boolean,
      default: false,
    },
    minProfit: {
      type: [Number, String],
      default: 0,
    },
    maxProfit: {
      type: [Number, String],
      default: 1000,
    },
    isUsingDefaultProfitFilters: {
      type: Boolean,
      default: true,
    },
    roundValues: {
      type: Boolean,
      default: false,
    },
    selectedRiskLevel: {
      type: String,
      default: "all",
    },
    houseSearchTerm: {
      type: String,
      default: "",
    },
    sportSearchTerm: {
      type: String,
      default: "",
    },
    selectedHouses: {
      type: Array,
      default: () => [],
    },
    selectedSports: {
      type: Array,
      default: () => [],
    },
    selectedCurrencies: {
      type: Array,
      default: () => [],
    },
    filteredHouses: {
      type: Array,
      default: () => [],
    },
    filteredSports: {
      type: Array,
      default: () => [],
    },
    filterOptions: {
      type: Object,
      default: () => ({}),
    },
    showSaveFilterModal: {
      type: Boolean,
      default: false,
    },
    currentFilterName: {
      type: String,
      default: "",
    },
    showSavedFiltersModal: {
      type: Boolean,
      default: false,
    },
    savedFilters: {
      type: Array,
      default: () => [],
    },
    favoriteHouses: {
      type: Array,
      default: () => [],
    },
    favoriteSports: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "toggle-filter-overlay",
    "update:minProfit",
    "update:maxProfit",
    "update:roundValues",
    "set-risk-level",
    "select-all-houses",
    "deselect-all-houses",
    "select-favorite-houses",
    "update:houseSearchTerm",
    "clear-house-search",
    "toggle-house",
    "select-all-sports",
    "deselect-all-sports",
    "select-favorite-sports",
    "update:sportSearchTerm",
    "clear-sport-search",
    "toggle-sport",
    "select-all-currencies",
    "deselect-all-currencies",
    "toggle-currency",
    "clear-filters",
    "apply-filters",
    "toggle-favorite-house",
    "toggle-favorite-sport",
    "close-save-filter-modal",
    "update:currentFilterName",
    "save-filter",
    "close-saved-filters-modal",
    "load-filter",
    "delete-filter",
  ],
};
</script>
