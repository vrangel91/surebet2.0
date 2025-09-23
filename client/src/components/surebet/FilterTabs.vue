<template>
  <div class="filter-tabs">
    <button class="filter-tab" :class="{ active: activeFilter === 'prelive' }" @click="$emit('set-filter', 'prelive')">
      Pré-live ({{ preliveCount }})
    </button>
    <button class="filter-tab live-tab-locked" :class="{ active: activeFilter === 'live' }"
      @click="$emit('show-live-restricted-message')" title="Acesso restrito - Funcionalidade em manutenção">
      <svg class="lock-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      </svg>
      Live ({{ liveCount }})
    </button>

    <!-- Filtros de Data -->
    <div class="date-filters">
      <label class="date-filter-label">Data:</label>
      <input type="date" :value="selectedDate" class="date-filter-input" placeholder="dd/mm/aaaa"
        @change="$emit('date-change', $event.target.value)" />
      <button v-if="selectedDate" class="clear-date-btn" @click="$emit('clear-date-filter')"
        title="Limpar filtro de data">
        ×
      </button>
    </div>

    <!-- Campo de busca unificado -->
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input :value="unifiedSearchTerm" type="text"
        placeholder="Pesquisar por mercado, casa de apostas ou campeonato..." class="unified-search-input"
        @input="$emit('unified-search-input', $event.target.value)" @focus="$emit('show-search-suggestions')"
        @blur="$emit('hide-search-suggestions')" />

      <!-- Indicador de tipo de busca ativa -->
      <div v-if="activeSearchType" class="search-type-indicator">
        <span class="search-type-badge" :class="activeSearchType">
          {{ getSearchTypeLabel(activeSearchType) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterTabs",
  props: {
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
  },
  emits: [
    "set-filter",
    "show-live-restricted-message",
    "date-change",
    "clear-date-filter",
    "unified-search-input",
    "show-search-suggestions",
    "hide-search-suggestions",
  ],
  methods: {
    getSearchTypeLabel(type) {
      const labels = {
        market: "Mercado",
        bookmaker: "Casa",
        tournament: "Campeonato",
      };
      return labels[type] || type;
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-tabs {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
  margin: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(42, 42, 42, 0.6);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  &.active {
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    border-color: #00ff88;
    color: #1a1a1a;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 255, 136, 0.3);

    &:hover {
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
    }
  }

  .lock-icon {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
}

.live-tab-locked {
  opacity: 0.7;
  cursor: not-allowed;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: none;
    box-shadow: none;

    &::before {
      left: -100%;
    }
  }
}

.date-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
  }
}

.date-filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
  white-space: nowrap;
}

.date-filter-input {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  background: rgba(42, 42, 42, 0.8);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  &:hover {
    border-color: #00ff88;
  }
}

.clear-date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-full);
  background: #ff4444;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #cc0000;
    transform: scale(1.1);
  }
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 400px;
  margin-left: var(--spacing-lg);
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 18px;
  height: 18px;
  color: #cccccc;
  z-index: 1;
  transition: color 0.3s ease;
}

.unified-search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  background: rgba(42, 42, 42, 0.8);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);

    +.search-icon {
      color: #00ff88;
    }
  }

  &:hover {
    border-color: #00ff88;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

.search-type-indicator {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
}

.search-type-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: fadeIn 0.3s ease;

  &.market {
    background: #00ff88;
    color: #1a1a1a;
  }

  &.bookmaker {
    background: #ffc107;
    color: #1a1a1a;
  }

  &.tournament {
    background: #0dcaf0;
    color: #1a1a1a;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .filter-tabs {
    margin: 0 var(--spacing-md) var(--spacing-lg) var(--spacing-md);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .date-filters {
    margin-left: 0;
    justify-content: space-between;
  }

  .search-input-wrapper {
    margin-left: 0;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .filter-tabs {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .filter-tab {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 13px;
  }

  .date-filter-label {
    font-size: 13px;
  }

  .date-filter-input {
    padding: var(--spacing-xs);
    font-size: 13px;
    min-width: 100px;
  }

  .unified-search-input {
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px;
    font-size: 13px;
  }

  .search-icon {
    left: var(--spacing-sm);
    width: 14px;
    height: 14px;
  }
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
