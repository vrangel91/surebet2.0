<template>
  <div class="filter-overlay" :class="{ active: showFilterOverlay }">
    <div class="filter-panel">
      <div class="filter-header">
        <h3>Filtro</h3>
        <button class="close-btn" @click="$emit('toggle-filter-overlay')">×</button>
      </div>

      <div class="filter-content">
        <!-- Filtro por Faixa de Lucro -->
        <div class="filter-section">
          <div class="filter-section-header">
            <label class="filter-section-label">Faixa de Lucro</label>
            <span v-if="isUsingDefaultProfitFilters" class="default-indicator">Padrão</span>
          </div>
          <div class="profit-range">
            <input type="number" :value="minProfit" placeholder="0" class="profit-input"
              @input="$emit('update:minProfit', $event.target.value)" />
            <span class="profit-separator">-</span>
            <input type="number" :value="maxProfit" placeholder="1000" class="profit-input"
              @input="$emit('update:maxProfit', $event.target.value)" />
          </div>
        </div>

        <div class="filter-divider"></div>

        <!-- Opções de Formatação -->
        <div class="filter-section">
          <div class="filter-section-header">
            <label class="filter-section-label">Formatação de Valores</label>
          </div>
          <div class="formatting-options">
            <label class="checkbox-container">
              <input type="checkbox" :checked="roundValues"
                @change="$emit('update:roundValues', $event.target.checked)" />
              <span class="checkmark"></span>
              <span class="checkbox-label">Arredondar Valores</span>
            </label>
            <p class="formatting-description">
              Arredonda os centavos dos valores de apostas (ex: 93.55 → 94.00, 93.49 → 93.00)
            </p>
          </div>
        </div>

        <div class="filter-divider"></div>

        <!-- Filtro por Nível de Risco -->
        <div class="filter-section">
          <div class="filter-section-header">
            <label class="filter-section-label">Nível de Risco</label>
          </div>
          <div class="risk-level-filters">
            <button class="risk-filter-btn" :class="{ active: selectedRiskLevel === 'conservador' }"
              @click="$emit('set-risk-level', 'conservador')">
              <div class="risk-content">
                <span class="risk-indicator conservative"></span>
                <h4 class="risk-title">Conservador</h4>
                <span class="risk-description">≤ 30 pontos</span>
              </div>
            </button>
            <button class="risk-filter-btn" :class="{ active: selectedRiskLevel === 'moderado' }"
              @click="$emit('set-risk-level', 'moderado')">
              <div class="risk-content">
                <span class="risk-indicator moderate"></span>
                <h4 class="risk-title">Moderado</h4>
                <span class="risk-description">31-50 pontos</span>
              </div>
            </button>
            <button class="risk-filter-btn" :class="{ active: selectedRiskLevel === 'arriscado' }"
              @click="$emit('set-risk-level', 'arriscado')">
              <div class="risk-content">
                <span class="risk-indicator risky"></span>
                <h4 class="risk-title">Arriscado</h4>
                <span class="risk-description">> 50 pontos</span>
              </div>
            </button>
            <button class="risk-filter-btn" :class="{ active: selectedRiskLevel === 'todos' }"
              @click="$emit('set-risk-level', 'todos')">
              <div class="risk-content">
                <span class="risk-indicator all"></span>
                <h4 class="risk-title">Todos</h4>
                <span class="risk-description">Sem filtro</span>
              </div>
            </button>
          </div>
        </div>

        <div class="filter-divider"></div>

        <!-- Filtro por Casas de Aposta -->
        <div class="filter-section">
          <div class="filter-category-header">
            <h4>Casas de Aposta</h4>
          </div>
          <div class="filter-actions">
            <button @click="$emit('select-all-houses')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
              Selecionar Todos
            </button>
            <button @click="$emit('deselect-all-houses')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              Desmarcar Todos
            </button>
            <button @click="$emit('select-favorite-houses')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Favoritos
            </button>
          </div>

          <!-- Campo de busca para casas de apostas -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input :value="houseSearchTerm" type="text" placeholder="Buscar casas de apostas..." class="search-input"
                @input="$emit('update:houseSearchTerm', $event.target.value)" />
              <button v-if="houseSearchTerm" @click="$emit('clear-house-search')" class="clear-search-btn"
                title="Limpar pesquisa">
                <i class="icon-close"></i>
              </button>
            </div>
          </div>

          <div class="houses-grid">
            <div v-for="house in filteredHouses" :key="house" class="house-item">
              <label class="house-checkbox">
                <input type="checkbox" :checked="selectedHouses.includes(house)"
                  @change="$emit('toggle-house', house)" />
                <span class="checkmark"></span>
                <span class="checkbox-label">{{ house }}</span>
              </label>
              <button class="favorite-btn" :class="{ 'favorited': favoriteHouses.includes(house) }"
                @click.stop="$emit('toggle-favorite-house', house)"
                :title="favoriteHouses.includes(house) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
                <svg class="favorite-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Indicador de resultados da pesquisa -->
          <div v-if="houseSearchTerm" class="search-results-info">
            <span class="results-text">
              {{ filteredHouses.length }} de
              {{ filterOptions.houses.length }} casas encontradas
            </span>
          </div>
        </div>

        <div class="filter-divider"></div>

        <!-- Filtro por Esportes -->
        <div class="filter-section">
          <div class="filter-category-header">
            <h4>Esportes</h4>
          </div>
          <div class="filter-actions">
            <button @click="$emit('select-all-sports')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
              Selecionar Todos
            </button>
            <button @click="$emit('deselect-all-sports')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              Desmarcar Todos
            </button>
            <button @click="$emit('select-favorite-sports')" class="action-btn">
              <svg class="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Favoritos
            </button>
          </div>

          <!-- Pesquisa de Esportes -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input :value="sportSearchTerm" type="text" placeholder="Buscar esportes..." class="search-input"
                @input="$emit('update:sportSearchTerm', $event.target.value)" />
              <button v-if="sportSearchTerm" @click="$emit('clear-sport-search')" class="clear-search-btn"
                title="Limpar pesquisa">
                <i class="icon-close"></i>
              </button>
            </div>
          </div>

          <!-- Filtro por Esportes -->
          <div class="sports-filter-section">
            <div class="filter-section-header">
              <label class="filter-section-label">Esportes:</label>
            </div>
            <div class="sports-grid">
              <div v-for="sport in filteredSports" :key="sport.value" class="sport-item">
                <label class="sport-checkbox">
                  <input type="checkbox" :checked="selectedSports.includes(sport.value)"
                    @change="$emit('toggle-sport', sport.value)" />
                  <span class="checkmark"></span>
                  <span class="checkbox-label">{{ sport.label }}</span>
                </label>
                <button class="favorite-btn" :class="{ 'favorited': favoriteSports.includes(sport.value) }"
                  @click.stop="$emit('toggle-favorite-sport', sport.value)"
                  :title="favoriteSports.includes(sport.value) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
                  <svg class="favorite-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Indicador de resultados da pesquisa -->
            <div v-if="sportSearchTerm" class="search-results-info">
              <span class="results-text">
                {{ filteredSports.length }} de {{ filterOptions.sports.length }} esportes encontrados
              </span>
            </div>
          </div>

          <!-- Filtro por Moedas -->
          <div class="currencies-filter-section">
            <div class="filter-section-header">
              <label class="filter-section-label">Moedas:</label>
              <div class="currency-actions">
                <button @click="$emit('select-all-currencies')" class="action-btn">
                  Selecionar Todos
                </button>
                <button @click="$emit('deselect-all-currencies')" class="action-btn">
                  Desmarcar Todos
                </button>
              </div>
            </div>
            <div class="currencies-grid">
              <label v-for="currency in filterOptions.currencies" :key="currency.value" class="currency-checkbox">
                <input type="checkbox" :checked="selectedCurrencies.includes(currency.value)"
                  @change="$emit('toggle-currency', currency.value)" />
                <span class="checkmark"></span>
                <span class="checkbox-label">{{ currency.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="filter-divider"></div>
      </div>

      <div class="filter-footer">
        <button @click="$emit('clear-filters')" class="clear-btn">
          Limpar Filtros
        </button>
        <button @click="$emit('apply-filters')" class="apply-btn">Aplicar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterOverlay",
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
      default: "todos",
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
  ],
};
</script>

<style lang="scss" scoped>
/* Overlay de Filtros */
.filter-overlay {
  position: fixed;
  top: 0;
  right: -440px;
  width: 440px;
  height: 100vh;
  background: var(--bg-overlay);
  backdrop-filter: blur(10px);
  border-left: 1px solid var(--border-primary);
  box-shadow: var(--shadow-overlay);
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;

  &.active {
    right: 0;
  }
}

.filter-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--accent-color);
    }
  }
}

.filter-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.default-indicator {
  font-size: 12px;
  color: var(--text-inverse);
  background: var(--accent-color);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.profit-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);
  }

  &:hover {
    border-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.profit-separator {
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-divider {
  height: 1px;
  background: var(--border-primary);
  margin: 20px 0;
}

.formatting-options {
  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .formatting-description {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
}

.risk-level-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.risk-filter-btn {
  padding: 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-color-alpha);
    border-color: var(--accent-color);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--accent-color);
    background: var(--accent-gradient);
    box-shadow: var(--shadow-accent);
  }
}

.risk-content {
  text-align: center;
}

.risk-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-bottom: 4px;

  &.conservative {
    background: var(--accent-color);
  }

  &.moderate {
    background: var(--warning-color);
  }

  &.risky {
    background: var(--error-color);
  }

  &.all {
    background: var(--text-secondary);
  }
}

.risk-title {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.risk-description {
  font-size: 10px;
  color: var(--text-secondary);
}

.filter-category-header {
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-color-alpha);
    border-color: var(--accent-color);
    transform: translateY(-1px);
  }
}

.action-icon {
  flex-shrink: 0;
  color: currentColor;
}

.search-container {
  margin-bottom: 16px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  z-index: 1;
  transition: color 0.3s ease;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);

    +.search-icon {
      color: var(--accent-color);
    }
  }

  &:hover {
    border-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--error-color);
  }
}

.houses-grid,
.sports-grid,
.currencies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 4px;
}

.house-item,
.sport-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.house-checkbox,
.sport-checkbox,
.currency-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;

  &:hover {
    background: var(--accent-color-alpha);
    transform: translateX(2px);
  }
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--bg-tertiary);
    transform: scale(1.1);
  }

  .favorite-icon {
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  &.favorited {
    .favorite-icon {
      color: var(--warning-color);
      filter: drop-shadow(0 0 8px var(--warning-color-alpha));
    }

    &:hover {
      background: var(--warning-color-alpha);
    }
  }
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-secondary);
  border-radius: 3px;
  position: relative;
  transition: all 0.3s ease;
}

input[type="checkbox"]:checked+.checkmark {
  background: var(--accent-color);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-accent);
}

input[type="checkbox"]:checked+.checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-inverse);
  font-size: 10px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
}

.search-results-info {
  margin-top: 8px;
  text-align: center;
}

.results-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sports-filter-section,
.currencies-filter-section {
  margin-top: 16px;
}

.currency-actions {
  display: flex;
  gap: 4px;
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-primary);
}

.clear-btn,
.apply-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);

  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
  }
}

.apply-btn {
  background: var(--accent-gradient);
  color: var(--text-inverse);
  font-weight: 600;

  &:hover {
    background: var(--accent-gradient);
    transform: translateY(-1px);
    box-shadow: var(--shadow-accent-hover);
  }
}

/* Responsividade para overlay de filtros */
@media (max-width: 768px) {
  .filter-overlay {
    width: 100vw;
    right: -100vw;
    border-left: none;
    border-top: 1px solid var(--border-primary);
  }
}

@media (max-width: 480px) {
  .filter-overlay {
    width: 100vw;
    right: -100vw;
  }
}
</style>
