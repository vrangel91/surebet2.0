<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header do Modal -->
      <div class="modal-header">
        <h2 class="modal-title">📚 Glossário de Mercados de Apostas</h2>
        <button class="modal-close" @click="closeModal">
          <span>✕</span>
        </button>
      </div>

      <!-- Conteúdo do Modal -->
      <div class="modal-body">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlossaryModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
            '2': 'Vitória do Time Visitante',
            '1X': 'Vitória do Time Casa ou Empate',
            '12': 'Vitória de qualquer equipe (não empata)',
            'X2': 'Vitória do Time Visitante ou Empate'
          },
          'Moneyline': {
            'ML1': 'Moneyline - Vitória Time Casa',
            'ML2': 'Moneyline - Vitória Time Visitante',
            'MLX': 'Moneyline - Empate'
          },
          'Place': {
            'Place 1': 'Time Casa termina entre os primeiros colocados',
            'Place 1-3': 'Time Casa termina entre 1º e 3º lugar',
            'Place 1-6': 'Time Casa termina entre 1º e 6º lugar',
            'Place 1-10': 'Time Casa termina entre 1º e 10º lugar'
          },
          'Head to Head': {
            'H2H': 'Confronto direto entre dois times/atletas',
            'H2H_1': 'Vitória do primeiro participante no H2H',
            'H2H_2': 'Vitória do segundo participante no H2H'
          },
          'Qualificação': {
            'ML_Qualify': 'Moneyline - Time se qualifica para próxima fase',
            'Qualify_1': 'Time Casa se qualifica',
            'Qualify_2': 'Time Visitante se qualifica'
          },
          'Round Winner': {
            'Round_1': 'Time Casa vence a rodada/mapa',
            'Round_2': 'Time Visitante vence a rodada/mapa',
            'Round_X': 'Empate na rodada/mapa'
          }
        },
        'Handicaps': {
          'Asian Handicap': {
            'AH1': 'Handicap Asiático para o Time Casa',
            'AH2': 'Handicap Asiático para o Time Visitante',
            'AH_-2.5': 'Handicap -2.5 para o Time Casa',
            'AH_-1.5': 'Handicap -1.5 para o Time Casa',
            'AH_-0.5': 'Handicap -0.5 para o Time Casa',
            'AH_+0.5': 'Handicap +0.5 para o Time Casa',
            'AH_+1.5': 'Handicap +1.5 para o Time Casa',
            'AH_+2.5': 'Handicap +2.5 para o Time Casa'
          },
          'European Handicap': {
            'EH1': 'Handicap Europeu para o Time Casa',
            'EH2': 'Handicap Europeu para o Time Visitante',
            'EH_-2': 'Handicap -2 para o Time Casa',
            'EH_-1': 'Handicap -1 para o Time Casa',
            'EH_0': 'Handicap 0 (Draw no Bet)',
            'EH_+1': 'Handicap +1 para o Time Casa',
            'EH_+2': 'Handicap +2 para o Time Casa'
          },
          'Draw no Bet': {
            'DNB': 'Draw no Bet - Sem possibilidade de empate',
            'DNB_1': 'Vitória Time Casa (empate = aposta devolvida)',
            'DNB_2': 'Vitória Time Visitante (empate = aposta devolvida)'
          },
          'E-sports Handicaps': {
            'Maps_-2.5': 'Handicap -2.5 mapas para o Time Casa',
            'Maps_-1.5': 'Handicap -1.5 mapas para o Time Casa',
            'Maps_+1.5': 'Handicap +1.5 mapas para o Time Casa',
            'Maps_+2.5': 'Handicap +2.5 mapas para o Time Casa',
            'Sets_-2.5': 'Handicap -2.5 sets para o Time Casa',
            'Sets_-1.5': 'Handicap -1.5 sets para o Time Casa',
            'Sets_+1.5': 'Handicap +1.5 sets para o Time Casa',
            'Sets_+2.5': 'Handicap +2.5 sets para o Time Casa'
          }
        },
        'Totals': {
          'Gols': {
            'TO_0.5': 'Total acima de 0.5 gols',
            'TO_1.5': 'Total acima de 1.5 gols',
            'TO_2.5': 'Total acima de 2.5 gols',
            'TO_3.5': 'Total acima de 3.5 gols',
            'TO_4.5': 'Total acima de 4.5 gols',
            'TU_0.5': 'Total abaixo de 0.5 gols',
            'TU_1.5': 'Total abaixo de 1.5 gols',
            'TU_2.5': 'Total abaixo de 2.5 gols',
            'TU_3.5': 'Total abaixo de 3.5 gols',
            'TU_4.5': 'Total abaixo de 4.5 gols'
          },
          'Time Específico': {
            'TO1_0.5': 'Total acima de 0.5 gols para o Time Casa',
            'TO1_1.5': 'Total acima de 1.5 gols para o Time Casa',
            'TO1_2.5': 'Total acima de 2.5 gols para o Time Casa',
            'TU1_0.5': 'Total abaixo de 0.5 gols para o Time Casa',
            'TU1_1.5': 'Total abaixo de 1.5 gols para o Time Casa',
            'TU1_2.5': 'Total abaixo de 2.5 gols para o Time Casa',
            'TO2_0.5': 'Total acima de 0.5 gols para o Time Visitante',
            'TO2_1.5': 'Total acima de 1.5 gols para o Time Visitante',
            'TO2_2.5': 'Total acima de 2.5 gols para o Time Visitante',
            'TU2_0.5': 'Total abaixo de 0.5 gols para o Time Visitante',
            'TU2_1.5': 'Total abaixo de 1.5 gols para o Time Visitante',
            'TU2_2.5': 'Total abaixo de 2.5 gols para o Time Visitante'
          },
          'E-sports': {
            'Maps_TO_2.5': 'Total acima de 2.5 mapas',
            'Maps_TU_2.5': 'Total abaixo de 2.5 mapas',
            'Maps_TO_3.5': 'Total acima de 3.5 mapas',
            'Maps_TU_3.5': 'Total abaixo de 3.5 mapas',
            'Sets_TO_2.5': 'Total acima de 2.5 sets',
            'Sets_TU_2.5': 'Total abaixo de 2.5 sets',
            'Sets_TO_3.5': 'Total acima de 3.5 sets',
            'Sets_TU_3.5': 'Total abaixo de 3.5 sets'
          }
        },
        'Escanteios': {
          'Handicap': {
            'EH1_-5': 'Handicap -5 escanteios para o Time Casa',
            'EH1_-4': 'Handicap -4 escanteios para o Time Casa',
            'EH1_-3': 'Handicap -3 escanteios para o Time Casa',
            'EH1_-2': 'Handicap -2 escanteios para o Time Casa',
            'EH1_-1': 'Handicap -1 escanteio para o Time Casa',
            'EH2_+1': 'Handicap +1 escanteio para o Time Visitante',
            'EH2_+2': 'Handicap +2 escanteios para o Time Visitante',
            'EH2_+3': 'Handicap +3 escanteios para o Time Visitante',
            'EH2_+4': 'Handicap +4 escanteios para o Time Visitante',
            'EH2_+5': 'Handicap +5 escanteios para o Time Visitante'
          },
          'Totais': {
            'TO_4.5': 'Total acima de 4.5 escanteios',
            'TO_5.5': 'Total acima de 5.5 escanteios',
            'TO_6.5': 'Total acima de 6.5 escanteios',
            'TO_7.5': 'Total acima de 7.5 escanteios',
            'TU_4.5': 'Total abaixo de 4.5 escanteios',
            'TU_5.5': 'Total abaixo de 5.5 escanteios',
            'TU_6.5': 'Total abaixo de 6.5 escanteios',
            'TU_7.5': 'Total abaixo de 7.5 escanteios'
          },
          'Time Específico': {
            'TO1_2.5': 'Total acima de 2.5 escanteios para o Time Casa',
            'TO1_3.5': 'Total acima de 3.5 escanteios para o Time Casa',
            'TU1_2.5': 'Total abaixo de 2.5 escanteios para o Time Casa',
            'TU1_3.5': 'Total abaixo de 3.5 escanteios para o Time Casa',
            'TO2_2.5': 'Total acima de 2.5 escanteios para o Time Visitante',
            'TO2_3.5': 'Total acima de 3.5 escanteios para o Time Visitante',
            'TU2_2.5': 'Total abaixo de 2.5 escanteios para o Time Visitante',
            'TU2_3.5': 'Total abaixo de 3.5 escanteios para o Time Visitante'
          }
        },
        'Cartões': {
          'Handicap': {
            'EH1_-2': 'Handicap -2 cartões para o Time Casa',
            'EH1_-1': 'Handicap -1 cartão para o Time Casa',
            'EH2_+1': 'Handicap +1 cartão para o Time Visitante',
            'EH2_+2': 'Handicap +2 cartões para o Time Visitante'
          },
          'Totais': {
            'TO_2.5': 'Total acima de 2.5 cartões',
            'TO_3.5': 'Total acima de 3.5 cartões',
            'TO_4.5': 'Total acima de 4.5 cartões',
            'TU_2.5': 'Total abaixo de 2.5 cartões',
            'TU_3.5': 'Total abaixo de 3.5 cartões',
            'TU_4.5': 'Total abaixo de 4.5 cartões'
          },
          'Time Específico': {
            'TO1_1.5': 'Total acima de 1.5 cartões para o Time Casa',
            'TO1_2.5': 'Total acima de 2.5 cartões para o Time Casa',
            'TU1_1.5': 'Total abaixo de 1.5 cartões para o Time Casa',
            'TU1_2.5': 'Total abaixo de 2.5 cartões para o Time Casa',
            'TO2_1.5': 'Total acima de 1.5 cartões para o Time Visitante',
            'TO2_2.5': 'Total acima de 2.5 cartões para o Time Visitante',
            'TU2_1.5': 'Total abaixo de 1.5 cartões para o Time Visitante',
            'TU2_2.5': 'Total abaixo de 2.5 cartões para o Time Visitante'
          }
        },
        'Mercados Especiais': {
          'Gols': {
            'BothToScore': 'Ambos os times marcam gols',
            'OneScoreless': 'Um time não marca gols',
            'Even': 'Total de gols par',
            'Odd': 'Total de gols ímpar',
            'FirstGoal': 'Quem marca o primeiro gol',
            'LastGoal': 'Quem marca o último gol'
          },
          'Tempos': {
            '1H_1': 'Vitória Time Casa no 1º Tempo',
            '1H_X': 'Empate no 1º Tempo',
            '1H_2': 'Vitória Time Visitante no 1º Tempo',
            '2H_1': 'Vitória Time Casa no 2º Tempo',
            '2H_X': 'Empate no 2º Tempo',
            '2H_2': 'Vitória Time Visitante no 2º Tempo',
            'IntervaloFinal': 'Resultado combinado 1H/FT'
          },
          'Resultado Exato': {
            '0-0': 'Placar exato: 0 a 0',
            '1-0': 'Placar exato: 1 a 0',
            '1-1': 'Placar exato: 1 a 1',
            '2-0': 'Placar exato: 2 a 0',
            '2-1': 'Placar exato: 2 a 1',
            '2-2': 'Placar exato: 2 a 2',
            '3-0': 'Placar exato: 3 a 0',
            '3-1': 'Placar exato: 3 a 1',
            '3-2': 'Placar exato: 3 a 2'
          }
        }
      }
    }
  },
  computed: {
    filteredCategories() {
      return Object.keys(this.marketOptions).filter(category => {
        const markets = this.marketOptions[category]
        return Object.keys(markets).some(subcategory => {
          const types = markets[subcategory]
          return Object.keys(types).some(type => {
            const description = types[type]
            
            // Filtro de busca
            let matchesSearch = !this.searchTerm || 
              type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())
            
            // Filtro de esporte
            let matchesSport = !this.selectedSport || this.matchesSportFilter(type, description)
            
            // Filtro de dificuldade
            let matchesDifficulty = this.filters.difficulty.length === 0 || 
              this.filters.difficulty.includes(this.getMarketDifficulty(type))
            
            // Filtro de popularidade
            let matchesPopularity = this.filters.popularity.length === 0 || 
              this.filters.popularity.includes(this.getMarketPopularity(type))
            
            return matchesSearch && matchesSport && matchesDifficulty && matchesPopularity
          })
        })
      })
    },
    totalResults() {
      let count = 0
      this.filteredCategories.forEach(category => {
        const markets = this.marketOptions[category]
        Object.keys(markets).forEach(subcategory => {
          const types = markets[subcategory]
          Object.keys(types).forEach(type => {
            const description = types[type]
            
            // Filtro de busca
            let matchesSearch = !this.searchTerm || 
              type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())
            
            // Filtro de esporte
            let matchesSport = !this.selectedSport || this.matchesSportFilter(type, description)
            
            // Filtro de dificuldade
            let matchesDifficulty = this.filters.difficulty.length === 0 || 
              this.filters.difficulty.includes(this.getMarketDifficulty(type))
            
            // Filtro de popularidade
            let matchesPopularity = this.filters.popularity.length === 0 || 
              this.filters.popularity.includes(this.getMarketPopularity(type))
            
            if (matchesSearch && matchesSport && matchesDifficulty && matchesPopularity) {
              count++
            }
          })
        })
      })
      return count
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      this.clearAllFilters()
    },
    getCategoryDisplayName(category) {
      const names = {
        '1X2 & ML': '1X2 & ML',
        'Handicaps': 'Handicaps',
        'Totals': 'Totals',
        'Escanteios': 'Escanteios',
        'Cartões': 'Cartões',
        'Mercados Especiais': 'Mercados Especiais'
      }
      return names[category] || category
    },
    getCategoryDescription(category) {
      const descriptions = {
        '1X2 & ML': 'Mercados de resultado final, moneyline, place, head-to-head, qualificação e rodada vencedora',
        'Handicaps': 'Mercados de handicap asiático, europeu, draw no bet e e-sports handicaps',
        'Totals': 'Mercados de gols, gols específicos por time, e-sports totals',
        'Escanteios': 'Mercados de escanteios, handicaps, totais e gols por tempo',
        'Cartões': 'Mercados de cartões, handicaps, totais e cartões por tempo',
        'Mercados Especiais': 'Mercados de gols, tempos, resultado exato e outros mercados únicos'
      }
      return descriptions[category] || ''
    },
    getFilteredMarkets(category) {
      const filtered = {}
      const markets = this.marketOptions[category]
      
      Object.keys(markets).forEach(subcategory => {
        const types = markets[subcategory]
        const filteredTypes = {}
        
        Object.keys(types).forEach(type => {
          const description = types[type]
          
          // Filtro de busca
          let matchesSearch = !this.searchTerm || 
            type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())
          
          // Filtro de esporte
          let matchesSport = !this.selectedSport || this.matchesSportFilter(type, description)
          
          // Filtro de dificuldade
          let matchesDifficulty = this.filters.difficulty.length === 0 || 
            this.filters.difficulty.includes(this.getMarketDifficulty(type))
          
          // Filtro de popularidade
          let matchesPopularity = this.filters.popularity.length === 0 || 
            this.filters.popularity.includes(this.getMarketPopularity(type))
          
          if (matchesSearch && matchesSport && matchesDifficulty && matchesPopularity) {
            filteredTypes[type] = description
          }
        })
        
        if (Object.keys(filteredTypes).length > 0) {
          filtered[subcategory] = filteredTypes
        }
      })
      
      return filtered
    },
    getSubcategoryCount(subcategory) {
      if (typeof subcategory === 'object') {
        return Object.keys(subcategory).length
      }
      return 1
    },
    getSubcategoryItems(subcategory) {
      if (typeof subcategory === 'object') {
        return subcategory
      }
      return { [subcategory]: this.marketOptions[this.selectedCategory][subcategory] }
    },
    clearSearch() {
      this.searchTerm = ''
      this.selectedCategory = '1X2 & ML'
      this.selectedSport = ''
      this.filters.difficulty = []
      this.filters.popularity = []
    },
    
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters
    },
    
    clearAllFilters() {
      this.searchTerm = ''
      this.selectedCategory = '1X2 & ML'
      this.selectedSport = ''
      this.filters.difficulty = []
      this.filters.popularity = []
    },
    
    getMarketDifficulty(marketType) {
      // Lógica para determinar dificuldade baseada no tipo de mercado
      const easyMarkets = ['1', 'X', '2', '1X', '12', 'X2', 'BothToScore', 'Even', 'Odd']
      const mediumMarkets = ['AH1', 'AH2', 'EH1', 'EH2', 'TO_2.5', 'TU_2.5', 'FirstGoal']
      const hardMarkets = ['Place 1-10', 'H2H', 'Maps_-2.5', 'Sets_TO_3.5', 'IntervaloFinal']
      
      if (easyMarkets.includes(marketType)) return 'Iniciante'
      if (mediumMarkets.includes(marketType)) return 'Intermediário'
      if (hardMarkets.includes(marketType)) return 'Avançado'
      return 'Intermediário'
    },
    
    getMarketPopularity(marketType) {
      // Lógica para determinar popularidade baseada no tipo de mercado
      const highPopularity = ['1', 'X', '2', 'TO_2.5', 'TU_2.5', 'BothToScore', 'AH1', 'AH2']
      const mediumPopularity = ['1X', '12', 'X2', 'EH1', 'EH2', 'FirstGoal', 'Even', 'Odd']
      const lowPopularity = ['Place 1-10', 'H2H', 'Maps_-2.5', 'Sets_TO_3.5']
      
      if (highPopularity.includes(marketType)) return 'Alta'
      if (mediumPopularity.includes(marketType)) return 'Média'
      if (lowPopularity.includes(marketType)) return 'Baixa'
      return 'Média'
    },
    
    matchesSportFilter(type, description) {
      if (!this.selectedSport) return true
      
      const sportKeywords = {
        'Futebol': ['gol', 'escanteio', 'cartão', 'impedimento', 'faltas', '1X2', 'handicap'],
        'Basquete': ['ponto', 'cesta', 'lance livre', 'rebote', 'assistência', 'handicap'],
        'Tênis': ['set', 'game', 'break', 'ace', 'handicap', 'total'],
        'Vôlei': ['ponto', 'set', 'bloqueio', 'saque', 'handicap', 'total'],
        'E-sports': ['mapa', 'round', 'map', 'set', 'handicap', 'total'],
        'Outros': ['handicap', 'total', 'resultado', 'vitória', 'empate']
      }
      
      const keywords = sportKeywords[this.selectedSport] || []
      const text = `${type} ${description}`.toLowerCase()
      
      return keywords.some(keyword => text.includes(keyword))
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 1400px;
  width: 95%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%);
}

.modal-title {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--accent-primary) 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: initial;
}

.modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  backdrop-filter: blur(10px);
}

.modal-close:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff4444;
  color: #ff4444;
  transform: scale(1.1);
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

/* Barra de Pesquisa e Filtros */
.search-container {
  padding: 24px 28px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.search-filters-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sport-filter {
  padding: 10px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sport-filter:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.advanced-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.advanced-filters-btn:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.advanced-filters-btn.active {
  border-color: var(--accent-primary);
  background: rgba(0, 255, 136, 0.1);
  color: var(--accent-primary);
}

.advanced-filters {
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.filter-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.filter-option:hover {
  color: var(--text-primary);
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Navegação por Categorias */
.category-tabs {
  display: flex;
  gap: 8px;
  padding: 0 28px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 500;
  font-size: 0.9rem;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.category-tab.active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, #00d4ff 100%);
  border-color: var(--accent-primary);
  color: #000;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

/* Conteúdo das Categorias */
.category-content {
  padding: 28px;
}

.category-section {
  animation: fadeIn 0.3s ease-in-out;
}

.category-header {
  margin-bottom: 32px;
  text-align: center;
}

.category-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  /* background: linear-gradient(135deg, var(--accent-primary) 0%, #00d4ff 100%); */
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: initial;
}

.category-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Grid de Mercados */
.markets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.market-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.market-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary) 0%, #00d4ff 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.market-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--accent-primary);
}

.market-card:hover::before {
  transform: scaleX(1);
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-primary);
}

.market-name {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.market-count {
  background: var(--accent-primary);
  color: #000;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Tipos de Mercado */
.market-types {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.market-type-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.market-type-item:hover {
  border-color: var(--accent-primary);
  background: rgba(0, 255, 136, 0.05);
}

.type-symbol {
  background: linear-gradient(135deg, var(--accent-primary) 0%, #00d4ff 100%);
  color: #000;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.type-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.type-metadata {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.difficulty-badge,
.popularity-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-badge.iniciante {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.difficulty-badge.intermediário {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.difficulty-badge.avançado {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.popularity-badge.alta {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.popularity-badge.média {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.popularity-badge.baixa {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Sem Resultados */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results p {
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.clear-search-btn {
  background: var(--accent-primary);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #00d4ff;
  transform: translateY(-2px);
}

.no-results-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-all-filters-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid var(--border-primary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-filters-btn:hover {
  background: var(--accent-primary);
  color: #000;
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  border-top: 1px solid var(--border-primary);
}

.stats-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stats-count {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 1rem;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-1px);
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px 24px;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .search-container,
  .category-tabs,
  .category-content {
    padding-left: 24px;
    padding-right: 24px;
  }
  
  .search-filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .advanced-filters {
    padding: 16px;
  }
  
  .filter-options {
    justify-content: center;
  }
  
  .filter-stats {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .markets-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .market-card {
    padding: 20px;
  }
  
  .category-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .search-container,
  .category-tabs,
  .category-content {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .search-filters-row {
    gap: 12px;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .sport-filter,
  .advanced-filters-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .advanced-filters {
    padding: 12px;
  }
  
  .filter-options {
    gap: 12px;
  }
  
  .type-metadata {
    justify-content: center;
  }
  
  .category-tabs {
    gap: 6px;
  }
  
  .category-tab {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
  
  .market-card {
    padding: 16px;
  }
  
  .market-type-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .type-symbol {
    min-width: auto;
  }
}
</style>
