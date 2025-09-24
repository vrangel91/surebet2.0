<template>
  <div class="glossary-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
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
                    <div class="type-symbol-container">
                      <div class="type-symbol" :class="getSymbolClass(type)">
                        {{ getSymbolText(type) }}
                      </div>
                      <div class="type-code">{{ type }}</div>
                    </div>
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
      selectedCategory: 'Resultados',
      selectedSport: '',
      showAdvancedFilters: false,
      filters: {
        difficulty: [],
        popularity: []
      },
      marketOptions: {
        'Resultados': {
          'Resultado Final': {
            '1': 'Vitória Time 1',
            '2': 'Vitória Time 2',
            '1X2': 'Resultado Final'
          },
          'Double Chance': {
            '1X': 'Empate ou Vitória Time 1',
            'X2': 'Empate ou Vitória Time 2',
            '12': 'Time 1 ou Time 2'
          },
          'Draw no Bet': {
            'DNB': 'Draw no Bet'
          },
          'Resultado Exato': {
            'Score': 'Resultado exato'
          },
          'Sets Exato': {
            'Exact': 'Sets Exato'
          }
        },
        'Handicaps': {
          'Handicap Asiático': {
            'AH1': 'Handicap Asiático - Time 1',
            'AH2': 'Handicap Asiático - Time 2',
            'AH1(-1)': 'Handicap Asiático - Time 1 (-1)',
            'AH1(-2)': 'Handicap Asiático - Time 1 (-2)',
            'AH1(-3)': 'Handicap Asiático - Time 1 (-3)',
            'AH1(+1)': 'Handicap Asiático - Time 1 (+1)',
            'AH1(+2)': 'Handicap Asiático - Time 1 (+2)',
            'AH1(+3)': 'Handicap Asiático - Time 1 (+3)',
            'AH2(-1)': 'Handicap Asiático - Time 2 (-1)',
            'AH2(-2)': 'Handicap Asiático - Time 2 (-2)',
            'AH2(-3)': 'Handicap Asiático - Time 2 (-3)',
            'AH2(+1)': 'Handicap Asiático - Time 2 (+1)',
            'AH2(+2)': 'Handicap Asiático - Time 2 (+2)',
            'AH2(+3)': 'Handicap Asiático - Time 2 (+3)'
          },
          'Handicap Europeu': {
            'EH1': 'Handicap Europeu - Time 1',
            'EH2': 'Handicap Europeu - Time 2'
          }
        },
        'Totais (Over/Under)': {
          'Total de Gols': {
            'TO(0.5)': 'Mais de 0.5 Gols',
            'TO(1.5)': 'Mais de 1.5 Gols',
            'TO(2.5)': 'Mais de 2.5 Gols',
            'TO(3.5)': 'Mais de 3.5 Gols',
            'TO(4.5)': 'Mais de 4.5 Gols',
            'TU(0.5)': 'Menos de 0.5 Gols',
            'TU(1.5)': 'Menos de 1.5 Gols',
            'TU(2.5)': 'Menos de 2.5 Gols',
            'TU(3.5)': 'Menos de 3.5 Gols',
            'TU(4.5)': 'Menos de 4.5 Gols'
          },
          'Handicap Asiático de Gols': {
            'TO(0.25)': 'Mais de 0.25 Gols',
            'TO(0.75)': 'Mais de 0.75 Gols',
            'TO(1.25)': 'Mais de 1.25 Gols',
            'TO(1.75)': 'Mais de 1.75 Gols',
            'TO(2.25)': 'Mais de 2.25 Gols',
            'TO(2.75)': 'Mais de 2.75 Gols',
            'TO(3.25)': 'Mais de 3.25 Gols',
            'TO(3.75)': 'Mais de 3.75 Gols',
            'TO(4.25)': 'Mais de 4.25 Gols',
            'TO(4.75)': 'Mais de 4.75 Gols',
            'TU(0.25)': 'Menos de 0.25 Gols',
            'TU(0.75)': 'Menos de 0.75 Gols',
            'TU(1.25)': 'Menos de 1.25 Gols',
            'TU(1.75)': 'Menos de 1.75 Gols',
            'TU(2.25)': 'Menos de 2.25 Gols',
            'TU(2.75)': 'Menos de 2.75 Gols',
            'TU(3.25)': 'Menos de 3.25 Gols',
            'TU(3.75)': 'Menos de 3.75 Gols',
            'TU(4.25)': 'Menos de 4.25 Gols',
            'TU(4.75)': 'Menos de 4.75 Gols'
          },
          'Total de Sets': {
            'TO(0.5) - Sets': 'Mais de 0.5 Sets',
            'TO(1.5) - Sets': 'Mais de 1.5 Sets',
            'TO(2.5) - Sets': 'Mais de 2.5 Sets',
            'TU(0.5) - Sets': 'Menos de 0.5 Sets',
            'TU(1.5) - Sets': 'Menos de 1.5 Sets',
            'TU(2.5) - Sets': 'Menos de 2.5 Sets'
          }
        },
        'Escanteios': {
          'Total de Escanteios': {
            'TO(0.5) - Corners': 'Mais de 0.5 escanteios',
            'TO(1.5) - Corners': 'Mais de 1.5 escanteios',
            'TO(2.5) - Corners': 'Mais de 2.5 escanteios',
            'TO(3.5) - Corners': 'Mais de 3.5 escanteios',
            'TU(0.5) - Corners': 'Menos de 0.5 escanteios',
            'TU(1.5) - Corners': 'Menos de 1.5 escanteios',
            'TU(2.5) - Corners': 'Menos de 2.5 escanteios',
            'TU(3.5) - Corners': 'Menos de 3.5 escanteios'
          },
          'Escanteios por Time': {
            'TO(0.5) for Team1 - Corners': 'Mais de 0.5 escanteios para o Time 1',
            'TO(1.5) for Team1 - Corners': 'Mais de 1.5 escanteios para o Time 1',
            'TO(2.5) for Team1 - Corners': 'Mais de 2.5 escanteios para o Time 1',
            'TO(0.5) for Team2 - Corners': 'Mais de 0.5 escanteios para o Time 2',
            'TO(1.5) for Team2 - Corners': 'Mais de 1.5 escanteios para o Time 2',
            'TO(2.5) for Team2 - Corners': 'Mais de 2.5 escanteios para o Time 2',
            'TU(0.5) for Team1 - Corners': 'Menos de 0.5 escanteios para o Time 1',
            'TU(1.5) for Team1 - Corners': 'Menos de 1.5 escanteios para o Time 1',
            'TU(2.5) for Team1 - Corners': 'Menos de 2.5 escanteios para o Time 1',
            'TU(0.5) for Team2 - Corners': 'Menos de 0.5 escanteios para o Time 2',
            'TU(1.5) for Team2 - Corners': 'Menos de 1.5 escanteios para o Time 2',
            'TU(2.5) for Team2 - Corners': 'Menos de 2.5 escanteios para o Time 2'
          }
        },
        'Estatísticas': {
          'Faltas': {
            'TO(8.5) for Team1 - Fouls': 'Mais de 8.5 faltas para o Time 1',
            'TO(10.5) for Team1 - Fouls': 'Mais de 10.5 faltas para o Time 1',
            'TU(8.5) for Team1 - Fouls': 'Menos de 8.5 faltas para o Time 1',
            'TU(10.5) for Team1 - Fouls': 'Menos de 10.5 faltas para o Time 1'
          },
          'Chutes ao Gol': {
            'Shots on goal': 'Chutes ao gol'
          },
          'Gols de Campo': {
            'Field Goals': 'Gols de campo'
          },
          'Impedimentos': {
            'TO(3.5) - Offsides': 'Mais de 3.5 impedimentos',
            'TU(3.5) - Offsides': 'Menos de 3.5 impedimentos'
          }
        },
        'Mercados Especiais': {
          'Ambos Marcam': {
            'BothToScore': 'Ambos os Times Marcam: Sim',
            'OneScoreless': 'Ambos os Times Marcam: Não'
          },
          'Primeiro e Último Gol': {
            'FirstGoal': 'Quem marca o primeiro gol',
            'LastGoal': 'Quem marca o último gol'
          },
          'Total Par/Ímpar': {
            'Even': 'Total de gols par',
            'Odd': 'Total de gols ímpar'
          },
          'Jogador para Marcar': {
            'Player to Score': 'Jogador para marcar'
          }
        },
        'Períodos': {
          'Primeiro Tempo': {
            'HT': 'Primeiro Tempo'
          },
          'Tempo Completo': {
            'FT': 'Tempo Completo'
          }
        },
        'Resultados Exatos por Time': {
          'Exato Time 1': {
            'Exact (0) for Team1': 'Exato (0) para o Time 1',
            'Exact (1) for Team1': 'Exato (1) para o Time 1',
            'Exact (2) for Team1': 'Exato (2) para o Time 1',
            'Exact (3) for Team1': 'Exato (3) para o Time 1',
            'Exact (4) for Team1': 'Exato (4) para o Time 1',
            'Exact (5) for Team1': 'Exato (5) para o Time 1'
          },
          'Exato Time 2': {
            'Exact (0) for Team2': 'Exato (0) para o Time 2',
            'Exact (1) for Team2': 'Exato (1) para o Time 2',
            'Exact (2) for Team2': 'Exato (2) para o Time 2',
            'Exact (3) for Team2': 'Exato (3) para o Time 2',
            'Exact (4) for Team2': 'Exato (4) para o Time 2',
            'Exact (5) for Team2': 'Exato (5) para o Time 2'
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
        'Resultados': 'Resultados',
        'Handicaps': 'Handicaps',
        'Totais (Over/Under)': 'Totais (Over/Under)',
        'Escanteios': 'Escanteios',
        'Estatísticas': 'Estatísticas',
        'Mercados Especiais': 'Mercados Especiais',
        'Períodos': 'Períodos',
        'Resultados Exatos por Time': 'Resultados Exatos por Time'
      }
      return displayNames[category] || category
    },
    
    getCategoryDescription(category) {
      const descriptions = {
        'Resultados': 'Mercados básicos de resultado final, double chance e draw no bet',
        'Handicaps': 'Mercados com vantagens asiáticas e europeias para equilibrar apostas desiguais',
        'Totais (Over/Under)': 'Mercados baseados no total de gols, sets e outros eventos',
        'Escanteios': 'Mercados específicos para escanteios no futebol',
        'Estatísticas': 'Mercados baseados em estatísticas do jogo como faltas, chutes e impedimentos',
        'Mercados Especiais': 'Mercados únicos como ambos marcam, primeiro gol e totais par/ímpar',
        'Períodos': 'Mercados específicos para primeiro tempo e tempo completo',
        'Resultados Exatos por Time': 'Mercados de resultado exato para cada time individualmente'
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
        // Resultados básicos - Iniciante
        '1': 'Iniciante',
        '2': 'Iniciante',
        '1X2': 'Iniciante',
        '1X': 'Iniciante',
        'X2': 'Iniciante',
        '12': 'Iniciante',
        'DNB': 'Iniciante',
        'Score': 'Iniciante',
        'Exact': 'Iniciante',
        
        // Handicaps - Intermediário
        'AH1': 'Intermediário',
        'AH2': 'Intermediário',
        'EH1': 'Intermediário',
        'EH2': 'Intermediário',
        
        // Totais básicos - Intermediário
        'TO(0.5)': 'Intermediário',
        'TO(1.5)': 'Intermediário',
        'TO(2.5)': 'Intermediário',
        'TU(0.5)': 'Intermediário',
        'TU(1.5)': 'Intermediário',
        'TU(2.5)': 'Intermediário',
        
        // Handicaps asiáticos de gols - Avançado
        'TO(0.25)': 'Avançado',
        'TO(0.75)': 'Avançado',
        'TO(1.25)': 'Avançado',
        'TO(1.75)': 'Avançado',
        'TO(2.25)': 'Avançado',
        'TO(2.75)': 'Avançado',
        'TO(3.25)': 'Avançado',
        'TO(3.75)': 'Avançado',
        'TO(4.25)': 'Avançado',
        'TO(4.75)': 'Avançado',
        'TU(0.25)': 'Avançado',
        'TU(0.75)': 'Avançado',
        'TU(1.25)': 'Avançado',
        'TU(1.75)': 'Avançado',
        'TU(2.25)': 'Avançado',
        'TU(2.75)': 'Avançado',
        'TU(3.25)': 'Avançado',
        'TU(3.75)': 'Avançado',
        'TU(4.25)': 'Avançado',
        'TU(4.75)': 'Avançado',
        
        // Mercados especiais - Avançado
        'BothToScore': 'Avançado',
        'OneScoreless': 'Avançado',
        'FirstGoal': 'Avançado',
        'LastGoal': 'Avançado',
        'Even': 'Avançado',
        'Odd': 'Avançado',
        'Player to Score': 'Avançado',
        
        // Resultados exatos - Avançado
        'Exact (0) for Team1': 'Avançado',
        'Exact (1) for Team1': 'Avançado',
        'Exact (2) for Team1': 'Avançado',
        'Exact (0) for Team2': 'Avançado',
        'Exact (1) for Team2': 'Avançado',
        'Exact (2) for Team2': 'Avançado'
      }
      return difficulties[marketType] || 'Intermediário'
    },
    
    getMarketPopularity(marketType) {
      const popularities = {
        // Resultados básicos - Alta popularidade
        '1': 'Alta',
        '2': 'Alta',
        '1X2': 'Alta',
        '1X': 'Alta',
        'X2': 'Alta',
        '12': 'Alta',
        'DNB': 'Alta',
        
        // Totais básicos - Alta popularidade
        'TO(0.5)': 'Alta',
        'TO(1.5)': 'Alta',
        'TO(2.5)': 'Alta',
        'TU(0.5)': 'Alta',
        'TU(1.5)': 'Alta',
        'TU(2.5)': 'Alta',
        
        // Handicaps asiáticos de gols - Média popularidade
        'TO(0.25)': 'Média',
        'TO(0.75)': 'Média',
        'TO(1.25)': 'Média',
        'TO(1.75)': 'Média',
        'TO(2.25)': 'Média',
        'TO(2.75)': 'Média',
        'TO(3.25)': 'Média',
        'TO(3.75)': 'Média',
        'TO(4.25)': 'Média',
        'TO(4.75)': 'Média',
        'TU(0.25)': 'Média',
        'TU(0.75)': 'Média',
        'TU(1.25)': 'Média',
        'TU(1.75)': 'Média',
        'TU(2.25)': 'Média',
        'TU(2.75)': 'Média',
        'TU(3.25)': 'Média',
        'TU(3.75)': 'Média',
        'TU(4.25)': 'Média',
        'TU(4.75)': 'Média',
        
        // Handicaps - Média popularidade
        'AH1': 'Média',
        'AH2': 'Média',
        'EH1': 'Média',
        'EH2': 'Média',
        
        // Mercados especiais - Média popularidade
        'BothToScore': 'Média',
        'OneScoreless': 'Média',
        'FirstGoal': 'Média',
        'LastGoal': 'Média',
        'Even': 'Média',
        'Odd': 'Média',
        
        // Escanteios - Média popularidade
        'TO(0.5) - Corners': 'Média',
        'TO(1.5) - Corners': 'Média',
        'TO(2.5) - Corners': 'Média',
        'TU(0.5) - Corners': 'Média',
        'TU(1.5) - Corners': 'Média',
        'TU(2.5) - Corners': 'Média',
        
        // Estatísticas - Baixa popularidade
        'TO(8.5) for Team1 - Fouls': 'Baixa',
        'TU(8.5) for Team1 - Fouls': 'Baixa',
        'Shots on goal': 'Baixa',
        'Field Goals': 'Baixa',
        'TO(3.5) - Offsides': 'Baixa',
        'TU(3.5) - Offsides': 'Baixa',
        
        // Resultados exatos - Baixa popularidade
        'Exact (0) for Team1': 'Baixa',
        'Exact (1) for Team1': 'Baixa',
        'Exact (2) for Team1': 'Baixa',
        'Exact (0) for Team2': 'Baixa',
        'Exact (1) for Team2': 'Baixa',
        'Exact (2) for Team2': 'Baixa',
        
        // Períodos - Baixa popularidade
        'HT': 'Baixa',
        'FT': 'Baixa',
        
        // Jogador específico - Baixa popularidade
        'Player to Score': 'Baixa'
      }
      return popularities[marketType] || 'Média'
    },
    
    matchesSportFilter(type, description) {
      if (!this.selectedSport) return true
      
      const sportKeywords = {
        'Futebol': ['gol', 'escanteio', 'cartão', 'futebol', 'bola', 'corners', 'fouls', 'offsides', 'shots on goal', 'field goals'],
        'Basquete': ['ponto', 'cesta', 'basquete', 'basquetebol', 'rebounds', 'field goals'],
        'Tênis': ['set', 'game', 'tênis', 'tenis', 'sets'],
        'Vôlei': ['set', 'ponto', 'vôlei', 'volei', 'sets'],
        'E-sports': ['map', 'round', 'mapa', 'e-sports', 'esports'],
        'Outros': ['touchdowns', 'player to score', 'player rebounds']
      }
      
      const keywords = sportKeywords[this.selectedSport] || []
      const text = `${type} ${description}`.toLowerCase()
      
      return keywords.some(keyword => text.includes(keyword))
    },
    
    getSymbolText(type) {
      // Retorna um símbolo ou abreviação para o círculo
      if (type.startsWith('TO(')) {
        // Símbolos especiais para handicaps asiáticos
        if (type.includes('0.25') || type.includes('0.75') || type.includes('1.25') || 
            type.includes('1.75') || type.includes('2.25') || type.includes('2.75') ||
            type.includes('3.25') || type.includes('3.75') || type.includes('4.25') || 
            type.includes('4.75')) {
          return '↗A' // Over Asiático
        }
        return '↗'
      }
      if (type.startsWith('TU(')) {
        // Símbolos especiais para handicaps asiáticos
        if (type.includes('0.25') || type.includes('0.75') || type.includes('1.25') || 
            type.includes('1.75') || type.includes('2.25') || type.includes('2.75') ||
            type.includes('3.25') || type.includes('3.75') || type.includes('4.25') || 
            type.includes('4.75')) {
          return '↘A' // Under Asiático
        }
        return '↘'
      }
      if (type.startsWith('AH')) return 'H'
      if (type.startsWith('EH')) return 'E'
      if (type === '1') return '1'
      if (type === '2') return '2'
      if (type === '1X2') return '1X2'
      if (type === '1X') return '1X'
      if (type === 'X2') return 'X2'
      if (type === '12') return '12'
      if (type === 'DNB') return 'DNB'
      if (type === 'Score') return 'S'
      if (type === 'Exact') return 'E'
      if (type === 'BothToScore') return 'B'
      if (type === 'OneScoreless') return 'N'
      if (type === 'FirstGoal') return 'F'
      if (type === 'LastGoal') return 'L'
      if (type === 'Even') return 'P'
      if (type === 'Odd') return 'I'
      if (type === 'HT') return 'HT'
      if (type === 'FT') return 'FT'
      if (type.startsWith('Exact')) return 'E'
      if (type.includes('Corners')) return 'C'
      if (type.includes('Fouls')) return 'F'
      if (type.includes('Offsides')) return 'O'
      if (type.includes('Shots')) return 'S'
      if (type.includes('Field Goals')) return 'G'
      if (type.includes('Player')) return 'P'
      
      // Fallback: primeira letra do tipo
      return type.charAt(0).toUpperCase()
    },
    
    getSymbolClass(type) {
      // Retorna classes CSS baseadas no tipo de mercado
      if (type.startsWith('TO(')) {
        // Classe especial para handicaps asiáticos
        if (type.includes('0.25') || type.includes('0.75') || type.includes('1.25') || 
            type.includes('1.75') || type.includes('2.25') || type.includes('2.75') ||
            type.includes('3.25') || type.includes('3.75') || type.includes('4.25') || 
            type.includes('4.75')) {
          return 'over-asia-symbol'
        }
        return 'over-symbol'
      }
      if (type.startsWith('TU(')) {
        // Classe especial para handicaps asiáticos
        if (type.includes('0.25') || type.includes('0.75') || type.includes('1.25') || 
            type.includes('1.75') || type.includes('2.25') || type.includes('2.75') ||
            type.includes('3.25') || type.includes('3.75') || type.includes('4.25') || 
            type.includes('4.75')) {
          return 'under-asia-symbol'
        }
        return 'under-symbol'
      }
      if (type.startsWith('AH')) return 'handicap-asia-symbol'
      if (type.startsWith('EH')) return 'handicap-euro-symbol'
      if (['1', '2', '1X2', '1X', 'X2', '12', 'DNB'].includes(type)) return 'result-symbol'
      if (['BothToScore', 'OneScoreless', 'FirstGoal', 'LastGoal'].includes(type)) return 'special-symbol'
      if (['Even', 'Odd'].includes(type)) return 'parity-symbol'
      if (['HT', 'FT'].includes(type)) return 'period-symbol'
      if (type.startsWith('Exact')) return 'exact-symbol'
      if (type.includes('Corners')) return 'corners-symbol'
      if (type.includes('Fouls')) return 'fouls-symbol'
      if (type.includes('Offsides')) return 'offsides-symbol'
      if (type.includes('Shots')) return 'shots-symbol'
      if (type.includes('Field Goals')) return 'goals-symbol'
      if (type.includes('Player')) return 'player-symbol'
      
      return 'default-symbol'
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
  width: calc(100% - 280px); /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px; /* Espaço para o sidebar fixo */
  transition: margin-left 0.3s ease;
  box-sizing: border-box;
  
  &.sidebar-collapsed {
    margin-left: 80px; /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px); /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }
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
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      width: 100%;
      justify-content: space-between;
    }
    
    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    
    .sport-filter {
      padding: 12px 20px;
      border: 2px solid var(--border-primary);
      border-radius: 10px;
      font-size: 14px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      
      @media (max-width: 640px) {
        width: 100%;
        text-align: center;
        padding: 10px 15px;
        font-size: 13px;
      }
      
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
      
      @media (max-width: 640px) {
        width: 100%;
        justify-content: center;
        padding: 10px 15px;
        font-size: 13px;
      }
      
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
        
        @media (max-width: 640px) {
          font-size: 14px;
        }
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 25px;
  }
  
  @media (max-width: 640px) {
    gap: 20px;
  }
  
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
  overflow-x: auto;
  padding-bottom: 5px;
  
  // Scrollbar personalizada para webkit
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-secondary);
  }
  
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
  
  // Melhor responsividade para o grid
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  
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
        gap: 20px;
        padding: 16px 0;
        border-bottom: 1px solid var(--border-secondary);
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(0, 255, 136, 0.02);
          border-radius: 8px;
          padding: 16px 12px;
          margin: 0 -12px;
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .type-symbol-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          min-width: 60px;
        }
        
        .type-symbol {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          
          // Cores específicas por tipo de símbolo
          &.over-symbol {
            background: var(--accent-gradient);
            color: var(--text-inverse);
            box-shadow: var(--shadow-accent);
          }
          
          &.under-symbol {
            background: var(--error-gradient);
            color: var(--text-inverse);
            box-shadow: var(--shadow-error);
          }
          
          &.over-asia-symbol {
            background: var(--accent-gradient);
            color: var(--text-inverse);
            box-shadow: var(--shadow-accent-hover);
            border: 2px solid var(--accent-color);
            position: relative;
            
            &::after {
              content: 'A';
              position: absolute;
              bottom: -2px;
              right: -2px;
              background: #ff6b6b;
              color: white;
              border-radius: 50%;
              width: 12px;
              height: 12px;
              font-size: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
            }
          }
          
          &.under-asia-symbol {
            background: linear-gradient(135deg, #ff6b6b, #e55353);
            color: white;
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
            border: 2px solid #ff6b6b;
            position: relative;
            
            &::after {
              content: 'A';
              position: absolute;
              bottom: -2px;
              right: -2px;
              background: #00ff88;
              color: white;
              border-radius: 50%;
              width: 12px;
              height: 12px;
              font-size: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
            }
          }
          
          &.handicap-asia-symbol {
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
            color: white;
            box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
          }
          
          &.handicap-euro-symbol {
            background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
            color: #2c3e50;
            box-shadow: 0 2px 8px rgba(168, 230, 207, 0.3);
          }
          
          &.result-symbol {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          
          &.special-symbol {
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
            box-shadow: 0 2px 8px rgba(240, 147, 251, 0.3);
          }
          
          &.parity-symbol {
            background: linear-gradient(135deg, #ffecd2, #fcb69f);
            color: #8b4513;
            box-shadow: 0 2px 8px rgba(255, 236, 210, 0.3);
          }
          
          &.period-symbol {
            background: linear-gradient(135deg, #a8edea, #fed6e3);
            color: #2c3e50;
            box-shadow: 0 2px 8px rgba(168, 237, 234, 0.3);
          }
          
          &.exact-symbol {
            background: linear-gradient(135deg, #d299c2, #fef9d7);
            color: #2c3e50;
            box-shadow: 0 2px 8px rgba(210, 153, 194, 0.3);
          }
          
          &.corners-symbol {
            background: linear-gradient(135deg, #ff9a9e, #fecfef);
            color: #8b4513;
            box-shadow: 0 2px 8px rgba(255, 154, 158, 0.3);
          }
          
          &.fouls-symbol {
            background: linear-gradient(135deg, #ffecd2, #fcb69f);
            color: #8b4513;
            box-shadow: 0 2px 8px rgba(255, 236, 210, 0.3);
          }
          
          &.offsides-symbol {
            background: linear-gradient(135deg, #a8edea, #fed6e3);
            color: #2c3e50;
            box-shadow: 0 2px 8px rgba(168, 237, 234, 0.3);
          }
          
          &.shots-symbol {
            background: linear-gradient(135deg, #d299c2, #fef9d7);
            color: #2c3e50;
            box-shadow: 0 2px 8px rgba(210, 153, 194, 0.3);
          }
          
          &.goals-symbol {
            background: linear-gradient(135deg, #ff9a9e, #fecfef);
            color: #8b4513;
            box-shadow: 0 2px 8px rgba(255, 154, 158, 0.3);
          }
          
          &.player-symbol {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          
          &.default-symbol {
            background: var(--accent-primary);
            color: var(--bg-primary);
            box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
          }
        }
        
        .type-code {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-align: center;
          line-height: 1.2;
          max-width: 60px;
          word-break: break-all;
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

// Responsividade - Breakpoints otimizados
@media (max-width: 1200px) {
  .glossary-container {
    width: calc(100% - 80px);
    max-width: calc(100% - 80px);
    margin-left: 80px;
    
    &.sidebar-collapsed {
      width: calc(100% - 80px);
      max-width: calc(100% - 80px);
      margin-left: 80px;
    }
  }
  
  .markets-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 1024px) {
  .glossary-container {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    
    &.sidebar-collapsed {
      width: 100%;
      max-width: 100%;
      margin-left: 0;
    }
  }
  
  .markets-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

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
      flex-wrap: wrap;
      gap: 10px;
    }
  }
  
  .advanced-filters {
    flex-direction: column;
    gap: 25px;
  }
  
  .category-tabs {
    justify-content: center;
    overflow-x: auto;
    padding-bottom: 5px;
    
    .category-tab {
      padding: 10px 20px;
      font-size: 13px;
      white-space: nowrap;
      flex-shrink: 0;
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
  
  .filter-stats {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .content-header {
    padding: 12px 15px;
    
    .header-left {
      .page-title {
        font-size: 1.6rem;
      }
      
      .page-subtitle {
        font-size: 0.9rem;
      }
    }
  }
  
  .page-content {
    padding: 15px;
  }
  
  .search-container {
    padding: 15px;
  }
  
  .search-filters-row {
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
      
      .sport-filter,
      .advanced-filters-btn {
        width: 100%;
        text-align: center;
      }
    }
  }
  
  .advanced-filters {
    .filter-group {
      .filter-options {
        justify-content: center;
        gap: 12px;
      }
    }
  }
  
  .category-tabs {
    .category-tab {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
  
  .markets-grid {
    .market-card {
      padding: 15px;
      
      .market-header {
        .market-name {
          font-size: 1.1rem;
        }
        
        .market-count {
          font-size: 11px;
          padding: 4px 8px;
        }
      }
      
      .market-type-item {
        flex-direction: column;
        gap: 15px;
        text-align: center;
        padding: 12px 0;
        
        .type-symbol-container {
          align-self: center;
          min-width: 50px;
          
          .type-symbol {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
          
          .type-code {
            font-size: 9px;
            max-width: 50px;
          }
        }
        
        .type-info {
          .type-description {
            font-size: 13px;
          }
          
          .type-metadata {
            justify-content: center;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .content-header {
    padding: 10px 12px;
    
    .header-left {
      .page-title {
        font-size: 1.4rem;
      }
      
      .page-subtitle {
        font-size: 0.85rem;
      }
    }
  }
  
  .page-content {
    padding: 12px;
  }
  
  .search-container {
    padding: 12px;
  }
  
  .search-filters-row {
    .search-input-wrapper {
      .search-input {
        font-size: 14px;
        padding: 12px 12px 12px 40px;
      }
    }
  }
  
  .category-tabs {
    .category-tab {
      padding: 6px 12px;
      font-size: 11px;
    }
  }
  
  .markets-grid {
    .market-card {
      padding: 12px;
      
      .market-header {
        .market-name {
          font-size: 1rem;
        }
      }
      
      .market-type-item {
        padding: 10px 0;
        
        .type-symbol-container {
          min-width: 45px;
          
          .type-symbol {
            width: 30px;
            height: 30px;
            font-size: 12px;
          }
          
          .type-code {
            font-size: 8px;
            max-width: 45px;
          }
        }
        
        .type-info {
          .type-description {
            font-size: 12px;
          }
          
          .type-metadata {
            .difficulty-badge,
            .popularity-badge {
              font-size: 9px;
              padding: 3px 6px;
            }
          }
        }
      }
    }
  }
  
  .no-results {
    padding: 30px 15px;
    
    .no-results-icon {
      font-size: 2.5rem;
    }
    
    p {
      font-size: 1rem;
    }
    
    .no-results-actions {
      flex-direction: column;
      align-items: center;
      
      .clear-search-btn,
      .clear-all-filters-btn {
        width: 100%;
        max-width: 200px;
        padding: 10px 20px;
        font-size: 13px;
      }
    }
  }
  
  .filter-stats {
    padding: 15px;
    
    .stats-info {
      .stats-label {
        font-size: 13px;
      }
      
      .stats-count {
        font-size: 14px;
      }
    }
    
    .clear-all-btn {
      padding: 8px 16px;
      font-size: 13px;
    }
  }
}

@media (max-width: 360px) {
  .content-header {
    .header-left {
      .page-title {
        font-size: 1.2rem;
      }
      
      .page-subtitle {
        font-size: 0.8rem;
      }
    }
  }
  
  .search-container {
    padding: 10px;
  }
  
  .category-tabs {
    .category-tab {
      padding: 5px 10px;
      font-size: 10px;
    }
  }
  
  .markets-grid {
    .market-card {
      padding: 10px;
      
      .market-header {
        .market-name {
          font-size: 0.9rem;
        }
      }
    }
  }
}

// Suporte para orientação landscape em dispositivos móveis
@media (max-height: 500px) and (orientation: landscape) {
  .content-header {
    padding: 10px 20px;
    
    .header-left {
      .page-title {
        font-size: 1.4rem;
        margin-bottom: 4px;
      }
      
      .page-subtitle {
        font-size: 0.9rem;
      }
    }
  }
  
  .page-content {
    padding: 15px;
  }
  
  .search-container {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .category-tabs {
    margin-bottom: 15px;
    
    .category-tab {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
  
  .markets-grid {
    gap: 15px;
    
    .market-card {
      padding: 15px;
      
      .market-header {
        margin-bottom: 12px;
        padding-bottom: 8px;
        
        .market-name {
          font-size: 1.1rem;
        }
      }
      
      .market-type-item {
        padding: 8px 0;
        
        .type-symbol {
          width: 28px;
          height: 28px;
          font-size: 11px;
        }
        
        .type-info {
          .type-description {
            font-size: 12px;
            margin-bottom: 6px;
          }
        }
      }
    }
  }
}

// Melhorias para telas muito largas
@media (min-width: 1920px) {
  .glossary-container {
    max-width: 1800px;
    margin: 0 auto;
    margin-left: 280px;
    
    &.sidebar-collapsed {
      margin-left: 80px;
    }
  }
  
  .markets-grid {
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 25px;
  }
}
</style>
