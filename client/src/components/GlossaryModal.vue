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
        <!-- Barra de Pesquisa -->
        <div class="search-container">
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
                    <div class="type-description">{{ description }}</div>
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
          <button @click="clearSearch" class="clear-search-btn">Limpar Pesquisa</button>
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
      selectedCategory: 'Handicap Asiático (AH)',
      marketOptions: {
        'Handicap Asiático (AH)': {
          'AH1': {
            '-2.5': 'Handicap -2.5 Gols Time Casa',
            '-2.0': 'Handicap -2 Gols Time Casa',
            '-1.5': 'Handicap -1.5 Gols Time Casa',
            '-1.0': 'Handicap -1 Gols Time Casa',
            '-0.5': 'Handicap -0.5 Gols Time Casa',
            '0.0/DNB': 'Handicap 0 Gols Time Casa (Sem Empate)',
            '+0.5': 'Handicap +0.5 Gols Time Casa',
            '+1.0': 'Handicap +1 Gols Time Casa',
            '+1.5': 'Handicap +1.5 Gols Time Casa',
            '+2.0': 'Handicap +2 Gols Time Casa'
          },
          'AH2': {
            '-2.5': 'Handicap -2.5 Gols Time Visitante',
            '-2.0': 'Handicap -2 Gols Time Visitante',
            '-1.5': 'Handicap -1.5 Gols Time Visitante',
            '-1.0': 'Handicap -1 Gols Time Visitante',
            '-0.5': 'Handicap -0.5 Gols Time Visitante',
            '0.0/DNB': 'Handicap 0 Gols Time Visitante (Sem Empate)',
            '+0.5': 'Handicap +0.5 Gols Time Visitante',
            '+1.0': 'Handicap +1 Gols Time Visitante',
            '+1.5': 'Handicap +1.5 Gols Time Visitante',
            '+2.0': 'Handicap +2 Gols Time Visitante'
          }
        },
        'Escanteios (EH)': {
          'EH1': {
            '-5': 'Handicap -5 Escanteios Time Casa',
            '-4': 'Handicap -4 Escanteios Time Casa',
            '-3': 'Handicap -3 Escanteios Time Casa',
            '-2': 'Handicap -2 Escanteios Time Casa',
            '-1': 'Handicap -1 Escanteio Time Casa'
          },
          'EH2': {
            '+1': 'Handicap +1 Escanteio Time Visitante',
            '+2': 'Handicap +2 Escanteios Time Visitante',
            '+3': 'Handicap +3 Escanteios Time Visitante',
            '+4': 'Handicap +4 Escanteios Time Visitante',
            '+5': 'Handicap +5 Escanteios Time Visitante'
          },
          'Totais': {
            'TO': 'Total acima de x Escanteios',
            'TU': 'Total abaixo de x Escanteios',
            'TO_TimeCasa': 'Total acima de x Escanteios Time Casa',
            'TU_TimeCasa': 'Total abaixo de x Escanteios Time Casa',
            'TO_TimeVisitante': 'Total acima de x Escanteios Time Visitante',
            'TU_TimeVisitante': 'Total abaixo de x Escanteios Time Visitante'
          }
        },
        'Gols': {
          'BothToScore': 'Ambos os times marcam gols',
          'OneScoreless': 'Uma time não marca gols',
          'Even': 'Total de gols par',
          'Odd': 'Total de gols ímpar',
          'TO': 'Total acima de x Gols',
          'TU': 'Total abaixo de x Gols',
          'TO_TimeCasa': 'Total acima de x Gols Time Casa',
          'TU_TimeCasa': 'Total abaixo de x Gols Time Casa',
          'TO_TimeVisitante': 'Total acima de x Gols Time Visitante',
          'TU_TimeVisitante': 'Total abaixo de x Gols Time Visitante',
          'GolsPorTempo': {
            'TO_1H': 'Total acima de x Gols 1º Tempo',
            'TU_1H': 'Total abaixo de x Gols 1º Tempo',
            'TO_2H': 'Total acima de x Gols 2º Tempo',
            'TU_2H': 'Total abaixo de x Gols 2º Tempo'
          }
        },
        'Cartões': {
          'TO': 'Total acima de x Cartões',
          'TU': 'Total abaixo de x Cartões',
          'TO_TimeCasa': 'Total acima de x Cartões Time Casa',
          'TU_TimeCasa': 'Total abaixo de x Cartões Time Casa',
          'TO_TimeVisitante': 'Total acima de x Cartões Time Visitante',
          'TU_TimeVisitante': 'Total abaixo de x Cartões Time Visitante'
        },
        'Resultado Final': {
          'Team1Win': 'Vitória Time Casa',
          'Team2Win': 'Vitória Time Visitante',
          'Draw': 'Empate',
          'Team1Win_1H': 'Vitória Time Casa 1º Tempo',
          'Team2Win_1H': 'Vitória Time Visitante 1º Tempo',
          'Draw_1H': 'Empate 1º Tempo',
          'Team1Win_2H': 'Vitória Time Casa 2º Tempo',
          'Team2Win_2H': 'Vitória Time Visitante 2º Tempo',
          'Draw_2H': 'Empate 2º Tempo'
        },
        'Dupla Chance': {
          '1X': 'Vitória Time Casa ou Empate',
          '12': 'Vitória de qualquer equipe (não empata)',
          'X2': 'Vitória Time Visitante ou Empate'
        },
        'Resultado Exato': {
          '0-0': '0 a 0',
          '1-0': '1 a 0',
          '2-0': '2 a 0',
          '2-1': '2 a 1',
          '1-1': '1 a 1',
          '3-0': '3 a 0',
          '3-1': '3 a 1',
          '3-2': '3 a 2',
          '0-1': '0 a 1',
          '0-2': '0 a 2',
          '1-2': '1 a 2',
          '2-2': '2 a 2'
        },
        'Outros Mercados': {
          'PrimeiroGol': 'Quem marca primeiro',
          'ÚltimoGol': 'Quem marca por último',
          'IntervaloFinal': 'Resultado combinado 1H/FT',
          'HandicapEscanteios': 'Mesma lógica do AH, mas para escanteios',
          'GolsPorJogador': 'Marcação de gols por jogador específico',
          'CartõesPorJogador': 'Recebimento de cartões por jogador específico',
          'OddEvenEscanteios': 'Número par ou ímpar de escanteios',
          'OddEvenCartões': 'Número par ou ímpar de cartões'
        }
      }
    }
  },
  computed: {
    filteredCategories() {
      if (!this.searchTerm) {
        return Object.keys(this.marketOptions)
      }
      
      return Object.keys(this.marketOptions).filter(category => {
        const markets = this.marketOptions[category]
        return Object.keys(markets).some(subcategory => {
          const types = markets[subcategory]
          return Object.keys(types).some(type => {
            const description = types[type]
            return type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                   description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                   subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())
          })
        })
      })
    },
    totalResults() {
      if (!this.searchTerm) return 0
      
      let count = 0
      this.filteredCategories.forEach(category => {
        const markets = this.marketOptions[category]
        Object.keys(markets).forEach(subcategory => {
          const types = markets[subcategory]
          Object.keys(types).forEach(type => {
            const description = types[type]
            if (type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())) {
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
      this.searchTerm = ''
      this.selectedCategory = 'Handicap Asiático (AH)'
    },
    getCategoryDisplayName(category) {
      const names = {
        'Handicap Asiático (AH)': '📊 Handicap Asiático (AH)',
        'Escanteios (EH)': '⚽ Escanteios (EH)',
        'Gols': '🎯 Gols',
        'Cartões': '🟨 Cartões',
        'Resultado Final': '🏆 Resultado Final',
        'Dupla Chance': '🔄 Dupla Chance',
        'Resultado Exato': '📝 Resultado Exato',
        'Outros Mercados': '⭐ Outros Mercados'
      }
      return names[category] || category
    },
    getCategoryDescription(category) {
      const descriptions = {
        'Handicap Asiático (AH)': 'Sistema de handicap que equilibra as probabilidades entre times, aplicado aos gols',
        'Escanteios (EH)': 'Mercados relacionados a escanteios com handicap e totais',
        'Gols': 'Mercados baseados na quantidade e características dos gols marcados',
        'Cartões': 'Mercados relacionados ao total de cartões amarelos e vermelhos',
        'Resultado Final': 'Mercados sobre o resultado da partida, por tempo e final',
        'Dupla Chance': 'Mercados que combinam duas possibilidades de resultado',
        'Resultado Exato': 'Mercados sobre o placar exato da partida',
        'Outros Mercados': 'Mercados especiais e únicos para situações específicas'
      }
      return descriptions[category] || ''
    },
    getFilteredMarkets(category) {
      if (!this.searchTerm) {
        return this.marketOptions[category]
      }
      
      const filtered = {}
      const markets = this.marketOptions[category]
      
      Object.keys(markets).forEach(subcategory => {
        const types = markets[subcategory]
        const filteredTypes = {}
        
        Object.keys(types).forEach(type => {
          const description = types[type]
          if (type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              subcategory.toLowerCase().includes(this.searchTerm.toLowerCase())) {
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
      this.selectedCategory = 'Handicap Asiático (AH)'
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

/* Barra de Pesquisa */
.search-container {
  padding: 24px 28px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
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

.type-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  flex: 1;
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
