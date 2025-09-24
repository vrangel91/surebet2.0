<template>
  <div class="games-info">
    <!-- Card principal de informações -->
    <div class="info-card">
      <div class="info-header">
        <div class="info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 11h6" />
          </svg>
        </div>
        <h3 class="info-title">Resultados</h3>
      </div>

      <div class="info-content">
        <div class="surebets-count">
          <span class="count-label">Mostrando</span>
          <span class="count-value">{{ paginatedCount }}</span>
          <span class="count-separator">de</span>
          <span class="count-total">{{ totalCount }}</span>
          <span class="count-unit">surebets</span>
        </div>

        <div v-if="hasMoreItems" class="more-available">
          <div class="more-indicator">
            <div class="more-dot"></div>
            <span class="more-text">{{ remainingCount }} restantes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de resultados da pesquisa -->
    <div v-if="searchTerm" class="search-results-card">
      <div class="search-results-header">
        <div class="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <span class="search-title">Pesquisa Ativa</span>
      </div>

      <div class="search-results-content">
        <div class="search-results-text">
          <span class="filtered-count">{{ filteredCount }}</span>
          <span class="filtered-separator">de</span>
          <span class="total-filtered">{{ totalFilteredCount }}</span>
          <span class="filtered-unit">surebets encontradas</span>
        </div>

        <div v-if="activeSearchType" class="search-type-info">
          <span class="search-type-label">Filtrado por:</span>
          <span class="search-type-value">{{ searchTypeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GamesInfo",
  props: {
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
    searchTerm: {
      type: String,
      default: "",
    },
    filteredCount: {
      type: Number,
      default: 0,
    },
    totalFilteredCount: {
      type: Number,
      default: 0,
    },
    activeSearchType: {
      type: String,
      default: "",
    },
  },
  computed: {
    searchTypeLabel() {
      const labels = {
        market: "mercado",
        bookmaker: "casa",
        tournament: "campeonato",
      };
      return labels[this.activeSearchType] || this.activeSearchType;
    },
  },
};
</script>

<style lang="scss" scoped>
.games-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0 var(--spacing-lg) var(--spacing-xl) var(--spacing-lg);
}

.info-card {
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-gradient);
    animation: shimmer 2s infinite;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.info-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent-color);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  filter: drop-shadow(0 0 10px var(--accent-color-alpha));
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.surebets-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  flex-wrap: wrap;
}

.count-label {
  color: var(--text-secondary);
}

.count-value {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 16px;
}

.count-separator {
  color: var(--text-secondary);
}

.count-total {
  font-weight: 600;
  color: var(--text-primary);
}

.count-unit {
  color: var(--text-secondary);
  font-size: 13px;
}

.more-available {
  margin-top: var(--spacing-xs);
}

.more-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--accent-color-alpha);
  border: 1px solid var(--accent-color);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-color);
}

.more-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.search-results-card {
  background: var(--accent-color-alpha);
  border: 2px solid var(--accent-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-accent);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-gradient);
    animation: shimmer 2s infinite;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-accent-hover);
  }
}

.search-results-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  border-radius: var(--radius-sm);
  color: var(--text-inverse);
  filter: drop-shadow(0 0 10px var(--accent-color-alpha));
}

.search-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-color);
  margin: 0;
}

.search-results-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-results-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
  flex-wrap: wrap;
}

.filtered-count {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 16px;
}

.filtered-separator {
  color: var(--text-secondary);
}

.total-filtered {
  font-weight: 600;
  color: var(--text-primary);
}

.filtered-unit {
  color: var(--text-secondary);
  font-size: 13px;
}

.search-type-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-overlay);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
}

.search-type-label {
  color: var(--text-secondary);
  font-style: italic;
}

.search-type-value {
  color: var(--accent-color);
  font-weight: 600;
}

/* Responsividade */
@media (max-width: 768px) {
  .games-info {
    margin: 0 var(--spacing-md) var(--spacing-xl) var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .info-card,
  .search-results-card {
    padding: var(--spacing-md);
  }

  .surebets-count,
  .search-results-text {
    font-size: 13px;
  }

  .count-value,
  .filtered-count {
    font-size: 14px;
  }
}

@media (max-width: 480px) {

  .info-header,
  .search-results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .surebets-count,
  .search-results-text {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

/* Animações */
@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
