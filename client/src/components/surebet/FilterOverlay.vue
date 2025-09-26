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
    "clear-filters",
    "apply-filters",
    "toggle-favorite-house",
    "toggle-favorite-sport",
  ],
};
</script>

<style lang="scss" scoped>
/* Overlay de Filtros Profissional */
.filter-overlay {
  position: fixed;
  top: 0;
  right: -460px;
  width: 460px;
  height: 100vh;
  background: var(--bg-modal);
  backdrop-filter: blur(12px);
  border-left: 1px solid var(--border-primary);
  box-shadow: var(--shadow-xl);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: 24px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--accent-primary);
    letter-spacing: -0.02em;
  }

  .close-btn {
    background: var(--button-secondary-bg);
    border: 1px solid var(--border-primary);
    font-size: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--button-secondary-hover);
      border-color: var(--border-accent);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }
  }
}

.filter-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 32px;
}

.filter-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-section-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.default-indicator {
  font-size: 12px;
  color: var(--button-primary-text);
  background: var(--button-primary-bg);
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  border: 1px solid var(--accent-primary);
}

.profit-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profit-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--accent-primary-alpha);
  }

  &:hover {
    border-color: var(--border-accent);
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
  gap: 12px;
}

.risk-filter-btn {
  padding: 16px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--button-secondary-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--accent-primary);
    background: var(--button-primary-bg);
    box-shadow: var(--shadow-button);
  }
}

.risk-content {
  text-align: center;
}

.risk-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-bottom: 6px;
  border: 2px solid var(--bg-primary);

  &.conservative {
    background: var(--accent-primary);
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
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.risk-description {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-category-header {
  margin-bottom: 20px;

  h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--accent-primary);
    letter-spacing: -0.01em;
  }
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  flex: 1;
  justify-content: center;

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
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
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
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

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: var(--button-danger-bg);
  border: none;
  color: var(--button-danger-text);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--button-danger-hover);
    transform: scale(1.05);
  }
}

.houses-grid,
.sports-grid {
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
.sport-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  border: 1px solid transparent;

  &:hover {
    background: var(--accent-primary-alpha);
    border-color: var(--border-accent);
    transform: translateX(2px);
  }
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--button-secondary-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
    transform: scale(1.05);
  }

  .favorite-icon {
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  &.favorited {
    background: var(--button-warning-bg);
    border-color: var(--warning-color);

    .favorite-icon {
      color: var(--button-warning-text);
    }

    &:hover {
      background: var(--button-warning-hover);
      border-color: var(--warning-color);
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
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

input[type="checkbox"]:checked+.checkmark {
  background: var(--button-primary-bg);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-button);
}

input[type="checkbox"]:checked+.checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--button-primary-text);
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.search-results-info {
  margin-top: 8px;
  text-align: center;
}

.results-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sports-filter-section {
  margin-top: 16px;
}

.filter-footer {
  display: flex;
  gap: 16px;
  padding: 24px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.clear-btn,
.apply-btn {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn {
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);

  &:hover {
    background: var(--button-secondary-hover);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }
}

.apply-btn {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border-color: var(--accent-primary);

  &:hover {
    background: var(--button-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
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
