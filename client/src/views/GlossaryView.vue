<template>
  <div class="glossary-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->
      <Header />
      
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">📚 Glossário de Mercados</h2>
          <p class="page-subtitle">Compreenda todos os tipos de mercados disponíveis para suas apostas</p>
        </div>
      </header>

      <!-- Conteúdo da Página -->
      <div class="page-content">
        <!-- Barra de Pesquisa e Filtros -->
        <div class="search-container">
          <div class="search-filters-row">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Pesquisar mercados..." 
                class="search-input"
              />
            </div>
            
            <div class="filter-controls">
              <select v-model="selectedSport" class="sport-filter">
                <option value="">Todos os Esportes</option>
                <option value="Futebol">Futebol</option>
                <option value="Basquete">Basquete</option>
                <option value="Tênis">Tênis</option>
                <option value="Vôlei">Vôlei</option>
                <option value="E-sports">E-sports</option>
                <option value="Outros">Outros</option>
              </select>
              
              <button 
                @click="toggleAdvancedFilters" 
                :class="['advanced-filters-btn', { active: showAdvancedFilters }]"
              >
                <span>🔍</span>
                Filtros Avançados
              </button>
            </div>
          </div>
          
          <!-- Filtros Avançados -->
          <div v-if="showAdvancedFilters" class="advanced-filters">
            <div class="filter-group">
              <label>Dificuldade:</label>
              <div class="filter-options">
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.difficulty" value="Iniciante">
                  <span>Iniciante</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.difficulty" value="Intermediário">
                  <span>Intermediário</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.difficulty" value="Avançado">
                  <span>Avançado</span>
                </label>
              </div>
            </div>
            
            <div class="filter-group">
              <label>Popularidade:</label>
              <div class="filter-options">
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.popularity" value="Alta">
                  <span>Alta</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.popularity" value="Média">
                  <span>Média</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" v-model="filters.popularity" value="Baixa">
                  <span>Baixa</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegação por Categorias -->
        <div class="category-tabs">
          <button 
            v-for="category in filteredCategories" 
            :key="category"
            @click="selectedCategory = category"
            :class="['category-tab', { active: selectedCategory === category }]"
          >
            {{ getCategoryDisplayName(category) }}
          </button>
        </div>

        <!-- Conteúdo das Categorias -->
        <div class="category-content">
          <div 
            v-for="category in filteredCategories" 
            :key="category"
            v-show="selectedCategory === category"
            class="category-section"
          >
            <div class="category-header">
              <h3 class="category-title">{{ getCategoryDisplayName(category) }}</h3>
              <p class="category-description">{{ getCategoryDescription(category) }}</p>
            </div>
            
            <div class="markets-grid">
              <div 
                v-for="(subcategory, subKey) in getFilteredMarkets(category)" 
                :key="subKey"
                class="market-card"
              >
                <div class="market-header">
                  <h4 class="market-name">{{ subKey }}</h4>
                  <span class="market-count">{{ getSubcategoryCount(subcategory) }} tipos</span>
                </div>
                
                <div class="market-types">
                  <div 
                    v-for="(description, type) in getSubcategoryItems(subcategory)" 
                    :key="type"
                    class="market-type-item"
                  >
                    <div class="type-symbol">{{ type }}</div>
                    <div class="type-info">
                      <div class="type-description">{{ description }}</div>
                      <div class="type-metadata">
                        <span class="difficulty-badge" :class="getMarketDifficulty(type).toLowerCase()">
                          {{ getMarketDifficulty(type) }}
                        </span>
                        <span class="popularity-badge" :class="getMarketPopularity(type).toLowerCase()">
                          {{ getMarketPopularity(type) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicador de Resultados -->
        <div v-if="searchTerm && totalResults === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>Nenhum mercado encontrado para "{{ searchTerm }}"</p>
          <div class="no-results-actions">
            <button @click="clearSearch" class="clear-search-btn">Limpar Pesquisa</button>
            <button @click="clearAllFilters" class="clear-all-filters-btn">Limpar Todos os Filtros</button>
          </div>
        </div>
        
        <!-- Estatísticas de Filtros -->
        <div v-if="searchTerm || selectedSport || filters.difficulty.length > 0 || filters.popularity.length > 0" class="filter-stats">
          <div class="stats-info">
            <span class="stats-label">Filtros ativos:</span>
            <span class="stats-count">{{ totalResults }} mercados encontrados</span>
          </div>
          <button @click="clearAllFilters" class="clear-all-btn">
            <span>🗑️</span>
            Limpar Todos
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

export default {
  name: 'GlossaryView',
  components: {
    Sidebar,
    Header
  },
  data() {
    return {
      sidebarCollapsed: false,
      searchTerm: '',
      selectedCategory: '1X2 & ML',
      selectedSport: '',
      showAdvancedFilters: false,
      filters: {
        difficulty: [],
        popularity: []
      },
      marketOptions: {
        '1X2 & ML': {
          'Resultado Final': {
            '1': 'Vitória do Time Casa',
            'X': 'Empate',
            '2': 'Vitória do Time Visitante'
          },
          'Double Chance': {
            '1X': 'Time Casa ou Empate',
            '12': 'Time Casa ou Time Visitante',
            'X2': 'Empate ou Time Visitante'
          },
          'Moneyline': {
            '1': 'Vitória do Time Casa',
            '2': 'Vitória do Time Visitante'
          },
          'Place 1': {
            '1': 'Time Casa termina em 1º lugar'
          },
          'Place 1-3': {
            '1': 'Time Casa termina entre 1º e 3º lugar'
          },
          'Place 1-6': {
            '1': 'Time Casa termina entre 1º e 6º lugar'
          },
          'Place 1-10': {
            '1': 'Time Casa termina entre 1º e 10º lugar'
          },
          'Head to Head': {
            '1': 'Time Casa vence confronto direto'
          },
          'Moneyline – to qualify': {
            '1': 'Time Casa se classifica'
          },
          'Round Winner in Map 1': {
            '1': 'Time Casa vence o round no mapa 1'
          }
        },
        'Handicaps': {
          'Spread – Maps': {
            '1': 'Time Casa vence com vantagem de mapas',
            '2': 'Time Visitante vence com vantagem de mapas'
          },
          'Spread': {
            '1': 'Time Casa vence com vantagem',
            '2': 'Time Visitante vence com vantagem'
          },
          'Draw no Bet': {
            '1': 'Time Casa vence (empate anula aposta)',
            '2': 'Time Visitante vence (empate anula aposta)'
          },
          'Euro Handicap': {
            '1': 'Time Casa vence com handicap europeu',
            '2': 'Time Visitante vence com handicap europeu'
          },
          'Spread – Sets': {
            '1': 'Time Casa vence com vantagem de sets',
            '2': 'Time Visitante vence com vantagem de sets'
          }
        },
        'Totals': {
          'Total – Maps': {
            'Over': 'Total de mapas acima do valor',
            'Under': 'Total de mapas abaixo do valor'
          },
          'Total': {
            'Over': 'Total de gols/pontos acima do valor',
            'Under': 'Total de gols/pontos abaixo do valor'
          },
          'Total for Team 1': {
            'Over': 'Total do Time Casa acima do valor',
            'Under': 'Total do Time Casa abaixo do valor'
          },
          'Total for Team 2': {
            'Over': 'Total do Time Visitante acima do valor',
            'Under': 'Total do Time Visitante abaixo do valor'
          },
          'Total – Sets': {
            'Over': 'Total de sets acima do valor',
            'Under': 'Total de sets abaixo do valor'
          }
        },
        'Escanteios': {
          'Total de Escanteios': {
            'Over': 'Total de escanteios acima do valor',
            'Under': 'Total de escanteios abaixo do valor'
          },
          'Escanteios Time Casa': {
            'Over': 'Escanteios do Time Casa acima do valor',
            'Under': 'Escanteios do Time Casa abaixo do valor'
          },
          'Escanteios Time Visitante': {
            'Over': 'Escanteios do Time Visitante acima do valor',
            'Under': 'Escanteios do Time Visitante abaixo do valor'
          }
        },
        'Cartões': {
          'Total de Cartões': {
            'Over': 'Total de cartões acima do valor',
            'Under': 'Total de cartões abaixo do valor'
          },
          'Cartões Amarelos': {
            'Over': 'Total de cartões amarelos acima do valor',
            'Under': 'Total de cartões amarelos abaixo do valor'
          },
          'Cartões Vermelhos': {
            'Over': 'Total de cartões vermelhos acima do valor',
            'Under': 'Total de cartões vermelhos abaixo do valor'
          }
        },
        'Mercados Especiais': {
          'Primeiro Gol': {
            '1': 'Time Casa marca o primeiro gol',
            '2': 'Time Visitante marca o primeiro gol',
            'Nenhum': 'Nenhum gol é marcado'
          },
          'Último Gol': {
            '1': 'Time Casa marca o último gol',
            '2': 'Time Visitante marca o último gol'
          },
          'Ambos Marcam': {
            'Sim': 'Ambos os times marcam',
            'Não': 'Pelo menos um time não marca'
          },
          'Resultado HT/FT': {
            '1/1': 'Time Casa vence no 1º tempo e no final',
            '1/X': 'Time Casa vence no 1º tempo, empate no final',
            '1/2': 'Time Casa vence no 1º tempo, Time Visitante vence no final',
            'X/1': 'Empate no 1º tempo, Time Casa vence no final',
            'X/X': 'Empate no 1º tempo e no final',
            'X/2': 'Empate no 1º tempo, Time Visitante vence no final',
            '2/1': 'Time Visitante vence no 1º tempo, Time Casa vence no final',
            '2/X': 'Time Visitante vence no 1º tempo, empate no final',
            '2/2': 'Time Visitante vence no 1º tempo e no final'
          }
        }
      }
    }
  },
  computed: {
    filteredCategories() {
      if (!this.searchTerm && !this.selectedSport && this.filters.difficulty.length === 0 && this.filters.popularity.length === 0) {
        return Object.keys(this.marketOptions)
      }
      
      return Object.keys(this.marketOptions).filter(category => {
        const markets = this.getFilteredMarkets(category)
        return Object.keys(markets).length > 0
      })
    },
    
    totalResults() {
      let total = 0
      this.filteredCategories.forEach(category => {
        const markets = this.getFilteredMarkets(category)
        Object.values(markets).forEach(subcategory => {
          total += Object.keys(subcategory).length
        })
      })
      return total
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters
    },
    
    clearAllFilters() {
      this.searchTerm = ''
      this.selectedSport = ''
      this.filters.difficulty = []
      this.filters.popularity = []
    },
    
    clearSearch() {
      this.searchTerm = ''
    },
    
    getCategoryDisplayName(category) {
      const displayNames = {
        '1X2 & ML': '1X2 & Moneyline',
        'Handicaps': 'Handicaps',
        'Totals': 'Totais',
        'Escanteios': 'Escanteios',
        'Cartões': 'Cartões',
        'Mercados Especiais': 'Mercados Especiais'
      }
      return displayNames[category] || category
    },
    
    getCategoryDescription(category) {
      const descriptions = {
        '1X2 & ML': 'Mercados básicos de resultado e moneyline para apostas simples',
        'Handicaps': 'Mercados com vantagens para equilibrar apostas desiguais',
        'Totals': 'Mercados baseados no total de gols, pontos ou eventos',
        'Escanteios': 'Mercados específicos para escanteios no futebol',
        'Cartões': 'Mercados baseados em cartões amarelos e vermelhos',
        'Mercados Especiais': 'Mercados únicos e específicos para situações especiais'
      }
      return descriptions[category] || ''
    },
    
    getFilteredMarkets(category) {
      const markets = this.marketOptions[category] || {}
      const filtered = {}
      
      Object.entries(markets).forEach(([subKey, subcategory]) => {
        const filteredSubcategory = {}
        
        Object.entries(subcategory).forEach(([type, description]) => {
          // Filtro por termo de pesquisa
          if (this.searchTerm && !description.toLowerCase().includes(this.searchTerm.toLowerCase()) && 
              !type.toLowerCase().includes(this.searchTerm.toLowerCase())) {
            return
          }
          
          // Filtro por esporte
          if (this.selectedSport && !this.matchesSportFilter(type, description)) {
            return
          }
          
          // Filtro por dificuldade
          if (this.filters.difficulty.length > 0 && 
              !this.filters.difficulty.includes(this.getMarketDifficulty(type))) {
            return
          }
          
          // Filtro por popularidade
          if (this.filters.popularity.length > 0 && 
              !this.filters.popularity.includes(this.getMarketPopularity(type))) {
            return
          }
          
          filteredSubcategory[type] = description
        })
        
        if (Object.keys(filteredSubcategory).length > 0) {
          filtered[subKey] = filteredSubcategory
        }
      })
      
      return filtered
    },
    
    getSubcategoryCount(subcategory) {
      return Object.keys(subcategory).length
    },
    
    getSubcategoryItems(subcategory) {
      return subcategory
    },
    
    getMarketDifficulty(marketType) {
      const difficulties = {
        '1': 'Iniciante',
        'X': 'Iniciante',
        '2': 'Iniciante',
        '1X': 'Iniciante',
        '12': 'Iniciante',
        'X2': 'Iniciante',
        'Over': 'Intermediário',
        'Under': 'Intermediário',
        'Place 1': 'Avançado',
        'Place 1-3': 'Avançado',
        'Place 1-6': 'Avançado',
        'Place 1-10': 'Avançado',
        'Head to Head': 'Avançado',
        'Moneyline – to qualify': 'Avançado',
        'Round Winner in Map 1': 'Avançado',
        'Resultado HT/FT': 'Avançado'
      }
      return difficulties[marketType] || 'Intermediário'
    },
    
    getMarketPopularity(marketType) {
      const popularities = {
        '1': 'Alta',
        'X': 'Alta',
        '2': 'Alta',
        '1X': 'Alta',
        '12': 'Alta',
        'X2': 'Alta',
        'Over': 'Alta',
        'Under': 'Alta',
        'Ambos Marcam': 'Alta',
        'Primeiro Gol': 'Média',
        'Último Gol': 'Média',
        'Total de Escanteios': 'Média',
        'Total de Cartões': 'Média',
        'Place 1': 'Baixa',
        'Place 1-3': 'Baixa',
        'Place 1-6': 'Baixa',
        'Place 1-10': 'Baixa',
        'Head to Head': 'Baixa',
        'Moneyline – to qualify': 'Baixa',
        'Round Winner in Map 1': 'Baixa',
        'Resultado HT/FT': 'Baixa'
      }
      return popularities[marketType] || 'Média'
    },
    
    matchesSportFilter(type, description) {
      if (!this.selectedSport) return true
      
      const sportKeywords = {
        'Futebol': ['gol', 'escanteio', 'cartão', 'futebol', 'bola'],
        'Basquete': ['ponto', 'cesta', 'basquete', 'basquetebol'],
        'Tênis': ['set', 'game', 'tênis', 'tenis'],
        'Vôlei': ['set', 'ponto', 'vôlei', 'volei'],
        'E-sports': ['map', 'round', 'mapa', 'e-sports', 'esports'],
        'Outros': []
      }
      
      const keywords = sportKeywords[this.selectedSport] || []
      const text = `${type} ${description}`.toLowerCase()
      
      return keywords.some(keyword => text.includes(keyword))
    }
  }
}
</script>

<style lang="scss" scoped>
.glossary-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 20px 30px;
  
  .header-left {
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }
    
    .page-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin: 0;
      font-weight: 400;
    }
  }
}

.page-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: var(--bg-primary);
}

.search-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: var(--shadow);
}

.search-filters-row {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  
  .search-input-wrapper {
    flex: 1;
    min-width: 300px;
    position: relative;
    
    .search-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: var(--text-tertiary);
      z-index: 2;
    }
    
    .search-input {
      width: 100%;
      padding: 15px 15px 15px 45px;
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      
      &:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
      }
      
      &::placeholder {
        color: var(--text-tertiary);
      }
    }
  }
  
  .filter-controls {
    display: flex;
    gap: 15px;
    align-items: center;
    
    .sport-filter {
      padding: 12px 20px;
      border: 2px solid var(--border-primary);
      border-radius: 10px;
      font-size: 14px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
    }
    
    .advanced-filters-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--accent-primary);
      color: var(--bg-primary);
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
        background: var(--accent-secondary);
      }
      
      &.active {
        background: var(--accent-secondary);
      }
      
      span {
        font-size: 16px;
      }
    }
  }
}

.advanced-filters {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  
  .filter-group {
    label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .filter-options {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      
      .filter-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        
        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
        }
        
        span {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  
  .category-tab {
    padding: 12px 24px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }
    
    &.active {
      background: var(--accent-primary);
      color: var(--bg-primary);
      border-color: var(--accent-primary);
      box-shadow: var(--shadow);
    }
  }
}

.category-content {
  .category-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: var(--shadow);
    
    .category-header {
      text-align: center;
      margin-bottom: 25px;
      
      .category-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 12px 0;
      }
      
      .category-description {
        font-size: 1rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
      }
    }
  }
}

.markets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  
  .market-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
      border-color: var(--accent-primary);
    }
    
    .market-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border-secondary);
      
      .market-name {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }
      
      .market-count {
        background: var(--accent-primary);
        color: var(--bg-primary);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
    }
    
    .market-types {
      .market-type-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-secondary);
        
        &:last-child {
          border-bottom: none;
        }
        
        .type-symbol {
          background: var(--accent-primary);
          color: var(--bg-primary);
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .type-info {
          flex: 1;
          
          .type-description {
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: 8px;
            line-height: 1.5;
          }
          
          .type-metadata {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            
            .difficulty-badge,
            .popularity-badge {
              padding: 4px 8px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .difficulty-badge {
              &.iniciante {
                background: rgba(0, 255, 136, 0.1);
                color: var(--success);
              }
              
              &.intermediário {
                background: rgba(255, 170, 0, 0.1);
                color: var(--warning);
              }
              
              &.avançado {
                background: rgba(255, 68, 68, 0.1);
                color: var(--error);
              }
            }
            
            .popularity-badge {
              &.alta {
                background: rgba(0, 102, 255, 0.1);
                color: var(--info);
              }
              
              &.média {
                background: rgba(123, 31, 162, 0.1);
                color: #9c27b0;
              }
              
              &.baixa {
                background: rgba(194, 24, 91, 0.1);
                color: #e91e63;
              }
            }
          }
        }
      }
    }
  }
}

.no-results {
  text-align: center;
  padding: 50px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 15px;
  margin: 25px 0;
  
  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 18px;
  }
  
  p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 25px;
  }
  
  .no-results-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    
    .clear-search-btn,
    .clear-all-filters-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .clear-search-btn {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 2px solid var(--border-primary);
      
      &:hover {
        background: var(--bg-quaternary);
        border-color: var(--border-secondary);
      }
    }
    
    .clear-all-filters-btn {
      background: var(--error);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
      }
    }
  }
}

.filter-stats {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  box-shadow: var(--shadow);
  
  .stats-info {
    .stats-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-right: 10px;
    }
    
    .stats-count {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }
  }
  
  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--error);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }
    
    span {
      font-size: 16px;
    }
  }
}

// Responsividade
@media (max-width: 768px) {
  .page-content {
    padding: 20px;
  }
  
  .content-header {
    padding: 15px 20px;
    
    .header-left {
      .page-title {
        font-size: 1.8rem;
      }
      
      .page-subtitle {
        font-size: 1rem;
      }
    }
  }
  
  .search-container {
    padding: 20px;
  }
  
  .search-filters-row {
    flex-direction: column;
    gap: 15px;
    
    .search-input-wrapper {
      min-width: 100%;
    }
    
    .filter-controls {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .advanced-filters {
    flex-direction: column;
    gap: 25px;
  }
  
  .category-tabs {
    justify-content: center;
    
    .category-tab {
      padding: 10px 20px;
      font-size: 13px;
    }
  }
  
  .markets-grid {
    grid-template-columns: 1fr;
    gap: 18px;
    
    .market-card {
      padding: 18px;
      
      .market-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }
  }
}

@media (max-width: 480px) {
  .content-header {
    padding: 12px 15px;
    
    .header-left {
      .page-title {
        font-size: 1.6rem;
      }
    }
  }
  
  .page-content {
    padding: 15px;
  }
  
  .search-container {
    padding: 15px;
  }
  
  .category-tabs {
    .category-tab {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
  
  .market-card {
    padding: 15px;
    
    .market-type-item {
      flex-direction: column;
      gap: 10px;
      text-align: center;
      
      .type-symbol {
        align-self: center;
      }
    }
  }
}
</style>
