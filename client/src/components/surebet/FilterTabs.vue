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
      <div class="date-input-wrapper">
        <input type="date" :value="selectedDate" class="date-filter-input" placeholder="dd/mm/aaaa"
          @change="$emit('date-change', $event.target.value)" />
        <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
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
  background: var(--bg-secondary);
  border: none;
  border-bottom: 1px solid var(--border-primary);
  border-radius: 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.filter-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 40px;
  position: relative;

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--button-primary-bg);
    color: var(--button-primary-text);
    border-color: var(--accent-primary);
    font-weight: 600;
    box-shadow: var(--shadow-button);

    &:hover {
      background: var(--button-primary-hover);
      transform: translateY(-1px);
    }
  }

  .lock-icon {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
}

.live-tab-locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-disabled);
  border-color: var(--border-disabled);
  color: var(--text-disabled);

  &:hover {
    background: var(--bg-disabled);
    border-color: var(--border-disabled);
    transform: none;
  }
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  padding: 8px 16px;
  background: var(--button-secondary-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--button-secondary-hover);
  }
}

.date-filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.date-input-wrapper {
  position: relative;
  display: inline-block;
}

.date-filter-input {
  padding: 8px 12px;
  padding-right: 40px; // Espaço para o ícone
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--accent-primary-alpha);
  }

  &:hover {
    border-color: var(--border-accent);
  }

  // Esconder ícone nativo do navegador
  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  // Para Firefox
  &::-moz-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  pointer-events: none;
  transition: all 0.2s ease;

  .date-input-wrapper:hover & {
    color: var(--accent-primary);
  }
}

.clear-date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: var(--button-danger-bg);
  color: var(--button-danger-text);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--button-danger-hover);
    transform: scale(1.05);
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
  color: var(--text-secondary);
  z-index: 1;
  transition: color 0.3s ease;
}

.unified-search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--accent-primary-alpha);

    +.search-icon {
      color: var(--accent-primary);
    }
  }

  &:hover {
    border-color: var(--border-accent);
  }

  &::placeholder {
    color: var(--text-muted);
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
    background: var(--accent-color);
    color: var(--text-inverse);
  }

  &.bookmaker {
    background: var(--warning-color);
    color: var(--text-inverse);
  }

  &.tournament {
    background: var(--info-color);
    color: var(--text-inverse);
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
