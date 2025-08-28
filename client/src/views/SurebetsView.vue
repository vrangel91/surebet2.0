<template>
  <div class="surebets-container">
    <!-- Sidebar Reutilizável -->
    <Sidebar 
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
      @open-glossary="openGlossary"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Surebets</h2>
          <p class="page-subtitle">Encontre as melhores oportunidades de arbitragem</p>
        </div>
        
                 <div class="header-right">
           <!-- Controles de Busca -->
           <div class="search-controls">
             <button 
               class="control-btn" 
               :class="{ active: isSearching }"
               @click="toggleSearch"
             >
               <span class="control-text">{{ isSearching ? 'Pausar' : 'Retomar' }}</span>
             </button>
             
             <button 
               class="control-btn" 
               :class="{ active: soundEnabled }"
               @click="toggleSound"
             >
               <span class="control-text">{{ soundEnabled ? 'Som On' : 'Som Off' }}</span>
             </button>
             
             <button 
               class="control-btn filter-toggle-btn"
               @click="toggleFilterOverlay"
             >
               <span class="control-text">Filtros</span>
               <span v-if="hasActiveFilters" class="filter-badge">{{ activeFiltersCount }}</span>
             </button>
             
             <button 
               v-if="pinnedCards.length > 0"
               class="control-btn pinned-indicator"
               @click="scrollToPinnedCards"
               title="Ir para cards fixos"
             >
               <MapPin class="control-icon" size="16" />
               <span class="control-text">{{ pinnedCards.length }}</span>
             </button>
             

           </div>
                  </div>
       </header>

       
             

                     <!-- Filtros Simples -->
        <div class="filters">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'prelive' }"
              @click="setFilter('prelive')"
            >
              Pré-live ({{ preliveCount }})
            </button>
            <button 
              class="filter-tab disabled-tab" 
              :class="{ active: activeFilter === 'live' }"
              @click="setFilter('live')"
              disabled
              title="Funcionalidade em breve"
            >
              Live ({{ liveCount }})
              <span class="coming-soon-badge">EM BREVE</span>
            </button>
          </div>
          
          <!-- Filtros de Data -->
          <div class="date-filters">
            <label class="date-filter-label">Filtrar por data:</label>
            <input 
              type="date" 
              v-model="selectedDate"
              class="date-filter-input"
              @change="onDateChange"
            />
            <button 
              v-if="selectedDate"
              class="clear-date-btn"
              @click="clearDateFilter"
              title="Limpar filtro de data"
            >
              ×
            </button>
          </div>
          
          <!-- Total de jogos encontrados -->
          <div class="games-found-info">
            <div v-if="activeFilter === 'prelive'" class="games-count">
              Total de jogos encontrados: {{ preliveCount }}
            </div>
            <div v-else-if="activeFilter === 'live'" class="games-count">
              Total de jogos encontrados: {{ liveCount }}
            </div>
            

          </div>
        </div>

              <!-- Cards Fixos -->
    <div v-if="pinnedCards.length > 0" class="pinned-cards-section">
      <div class="pinned-header">
        <h3 class="pinned-title" :class="{ 'limit-reached': pinnedCards.length >= 3 }">
          <MapPin class="pin-icon" size="18" />
          Cards Fixos ({{ pinnedCards.length }}/3)
          <span v-if="pinnedCards.length >= 3" class="limit-indicator" title="Limite máximo atingido">⚠️</span>
        </h3>
        <div class="pinned-controls">
          <button 
            class="control-btn drag-mode-btn"
            :class="{ active: dragMode }"
            @click="toggleDragMode"
            title="Modo de arrastar"
          >
            <span class="control-text">{{ dragMode ? '🔒' : '✋' }}</span>
            <span v-if="dragMode" class="drag-hint">Arraste para reorganizar</span>
          </button>
          <button 
            class="clear-pinned-btn" 
            @click="clearAllPinnedCards"
            title="Limpar todos os cards fixos"
          >
            <Trash2 class="clear-icon" size="16" />
            Limpar Todos
          </button>
        </div>
      </div>
      <div 
        class="pinned-cards-grid"
        :class="{ 'drag-mode': dragMode }"
        @dragover.prevent
        @drop="onDrop"
      >
        <div
          v-for="(surebet, index) in pinnedCards" 
          :key="`pinned-${index}`"
          class="pinned-card-wrapper"
          :class="{ 
            'dragging': draggedIndex === index,
            'drag-over': dragOverIndex === index && draggedIndex !== index
          }"
          :draggable="dragMode"
          :data-index="index"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
          @dragenter="onDragEnter"
          @dragover.prevent
          @drop="onDrop"
        >
          <div v-if="dragMode" class="drag-indicator">
            <span class="drag-icon">↕️</span>
          </div>
          <SurebetCard 
            :surebet="surebet"
            :isPinned="true"
            :isDragging="dragMode"
            @add-to-reports="addSurebetToReports"
            @toggle-pin="togglePinCard"
          />
        </div>
      </div>
    </div>

    <!-- Lista de Surebets -->
        <div class="surebets-list">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Carregando surebets...</p>
        </div>
        
        <div v-else-if="filteredSurebets.length === 0" class="empty-state">
          <div class="animated-container">
            <!-- Mensagem principal animada -->
            <div class="main-message">
              <h2 class="animated-text">Nenhum Surebet Disponível</h2>
              <div class="pulse-dot"></div>
            </div>
            
            <!-- Submensagem com efeito de digitação -->
            <p class="typing-text">Aguardando novas oportunidades de arbitragem...</p>
            
            <!-- Estatísticas animadas -->
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-number" :data-target="lastCheckCount">{{ lastCheckCount }}</div>
                <div class="stat-label">Verificações</div>
              </div>
              <div class="stat-item">
                <div class="stat-number" :data-target="uptimeMinutes">{{ uptimeMinutes }}</div>
                <div class="stat-label">Minutos Online</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="surebets-grid">
          <SurebetCard 
            v-for="(surebet, index) in filteredSurebets" 
            :key="index"
            :surebet="surebet"
            :isPinned="isPinned(surebet)"
            @add-to-reports="addSurebetToReports"
            @toggle-pin="togglePinCard"
          />
        </div>
      </div>
    </main>

         <!-- Áudio para Notificações -->
     <audio ref="notificationSound" preload="auto" crossorigin="anonymous">
       <source src="https://zerolossbet.com/static/bbfiles/new.mp3" type="audio/mpeg">
     </audio>
     
     <!-- Overlay de Filtros -->
     <div class="filter-overlay" :class="{ active: showFilterOverlay }">
       <div class="filter-panel">
         <div class="filter-header">
           <h3>Filtro</h3>
           <button class="close-btn" @click="toggleFilterOverlay">×</button>
         </div>
         
         <div class="filter-content">
           <!-- Filtro por Faixa de Lucro -->
           <div class="filter-section">
             <div class="filter-section-header">
               <label class="filter-section-label">Faixa de Lucro</label>
               <span v-if="isUsingDefaultProfitFilters" class="default-indicator">Padrão</span>
             </div>
             <div class="profit-range">
               <input 
                 type="number" 
                 v-model="minProfit" 
                 placeholder="0" 
                 class="profit-input"
               />
               <span class="profit-separator">-</span>
               <input 
                 type="number" 
                 v-model="maxProfit" 
                 placeholder="1000" 
                 class="profit-input"
               />
             </div>
           </div>
           
           <div class="filter-divider"></div>
           
           <!-- Categoria: Casas de Aposta -->
           <div class="filter-category">
             <div class="filter-category-header">
               <h4>Casas de Aposta</h4>
               <div class="filter-actions">
                 <button @click="selectAllHouses" class="action-btn">Marcar Todos</button>
                 <button @click="deselectAllHouses" class="action-btn">Desmarcar Todos</button>
               </div>
             </div>
             
             <!-- Campo de busca para casas de apostas -->
             <div class="search-field-container">
               <input 
                 type="text" 
                 v-model="houseSearchTerm"
                 placeholder="Pesquisar casa de aposta..."
                 class="house-search-input"
                 @input="onHouseSearchInput"
               />
               <button 
                 v-if="houseSearchTerm"
                 @click="clearHouseSearch"
                 class="clear-search-btn"
                 title="Limpar pesquisa"
               >
                 ×
               </button>
             </div>
             
             <div class="houses-grid">
               <label 
                 v-for="house in filteredHouses" 
                 :key="house" 
                 class="checkbox-item"
               >
                 <input 
                   type="checkbox" 
                   :value="house" 
                   v-model="selectedHouses"
                   class="filter-checkbox"
                 />
                 <span class="checkbox-label">{{ house }}</span>
               </label>
             </div>
             
             <!-- Indicador de resultados da pesquisa -->
             <div v-if="houseSearchTerm" class="search-results-info">
               <span class="search-results-text">
                 {{ filteredHouses.length }} de {{ filterOptions.houses.length }} casas encontradas
               </span>
             </div>
           </div>
           
           <div class="filter-divider"></div>
           
           <!-- Categoria: Futebol -->
           <div class="filter-category">
             <div class="filter-category-header">
               <h4>Futebol</h4>
               <div class="filter-actions">
                 <button @click="selectAllSports" class="action-btn">Marcar Todos</button>
                 <button @click="deselectAllSports" class="action-btn">Desmarcar Todos</button>
               </div>
             </div>
             
             <!-- Filtro por Esportes -->
             <div class="filter-section">
               <div class="filter-section-header">
                 <label class="filter-section-label">Esportes:</label>
               </div>
               <div class="sports-grid">
                 <label 
                   v-for="sport in filterOptions.sports" 
                   :key="sport.value" 
                   class="checkbox-item"
                 >
                   <input 
                     type="checkbox" 
                     :value="sport.value" 
                     v-model="selectedSports"
                     class="filter-checkbox"
                   />
                   <span class="checkbox-label">{{ sport.label }}</span>
                 </label>
               </div>
             </div>
             
             <!-- Filtro por Moedas -->
             <div class="filter-section">
               <div class="filter-section-header">
                 <label class="filter-section-label">Moedas:</label>
                 <div class="filter-actions">
                   <button @click="selectAllCurrencies" class="action-btn">Marcar Todos</button>
                   <button @click="deselectAllCurrencies" class="action-btn">Desmarcar Todos</button>
                 </div>
               </div>
               <div class="currencies-grid">
                 <label 
                   v-for="currency in filterOptions.currencies" 
                   :key="currency.code" 
                   class="checkbox-item"
                 >
                   <input 
                     type="checkbox" 
                     :value="currency.code" 
                     v-model="selectedCurrencies"
                     class="filter-checkbox"
                   />
                   <span class="checkbox-label">{{ currency.label }}</span>
                 </label>
               </div>
             </div>
           </div>
           
           <div class="filter-divider"></div>
           
           <!-- Categoria: Mercado -->
           <div class="filter-category">
             <div class="filter-category-header">
               <h4>Mercado</h4>
               <div class="filter-actions">
                 <button @click="selectAllMarkets" class="action-btn">Marcar Todos</button>
                 <button @click="deselectAllMarkets" class="action-btn">Desmarcar Todos</button>
               </div>
             </div>
             
             <!-- Filtro por Tipos de Mercado -->
             <div class="filter-section">
               <div class="filter-section-header">
                 <label class="filter-section-label">Tipos de Mercado:</label>
               </div>
               <div class="markets-direct-grid">
                 <label 
                   v-for="market in flattenedMarketOptions" 
                   :key="market.value"
                   class="checkbox-item market-option"
                 >
                   <input 
                     type="checkbox" 
                     :value="market.value"
                     v-model="selectedMarkets"
                     class="filter-checkbox"
                   />
                   <span class="checkbox-label">{{ market.label }}</span>
                 </label>
               </div>
             </div>
           </div>
         </div>
         
         <div class="filter-footer">
           <button @click="clearFilters" class="clear-btn">Limpar Filtros</button>
           <button @click="applyFilters" class="apply-btn">Aplicar</button>
         </div>
       </div>
     </div>
     
           <!-- Modal do Glossário -->
      <GlossaryModal 
        :isVisible="showGlossaryModal" 
        @close="closeGlossary"
      />
      
                    <!-- Modal para Salvar Filtro -->
        <div v-if="showSaveFilterModal && false" class="modal-overlay" @click="closeSaveFilterModal()">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Salvar Filtro</h3>
            <button class="close-btn" @click="closeSaveFilterModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nome do Filtro:</label>
              <input 
                v-model="currentFilterName" 
                type="text" 
                placeholder="Ex: Filtro Futebol BRL"
                class="filter-name-input"
                @keyup.enter="saveFilter"
              />
            </div>
            <div class="filter-preview">
              <h4>Configuração Atual:</h4>
              <div class="preview-item">
                <strong>Casas:</strong> {{ selectedHouses.length }} selecionadas
              </div>
              <div class="preview-item">
                <strong>Esportes:</strong> {{ selectedSports.length }} selecionados
              </div>
              <div class="preview-item">
                <strong>Moedas:</strong> {{ selectedCurrencies.length }} selecionadas
              </div>
              <div class="preview-item">
                <strong>Mercados:</strong> {{ selectedMarkets.length }} selecionados
              </div>
              <div class="preview-item">
                <strong>Lucro:</strong> {{ minProfit }}% - {{ maxProfit }}%
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeSaveFilterModal()" class="cancel-btn">Cancelar</button>
            <button @click="saveFilter()" class="save-btn" :disabled="!currentFilterName.trim()">Salvar</button>
          </div>
        </div>
      </div>
      
      <!-- Modal para Listar Filtros Salvos -->
      <div v-if="showSavedFiltersModal" class="modal-overlay" @click="closeSavedFiltersModal()">
        <div class="modal-content saved-filters-modal" @click.stop>
          <div class="modal-header">
            <h3>Filtros Salvos</h3>
            <button class="close-btn" @click="closeSavedFiltersModal()">×</button>
          </div>
          <div class="modal-body">
            <div v-if="savedFilters.length === 0" class="empty-filters">
              <p>Nenhum filtro salvo ainda.</p>
              <p>Salve seus filtros favoritos para reutilizá-los rapidamente!</p>
            </div>
            <div v-else class="saved-filters-list">
              <div 
                v-for="(filter, index) in savedFilters" 
                :key="index"
                class="saved-filter-item"
              >
                <div class="filter-info">
                  <h4>{{ filter.name }}</h4>
                  <div class="filter-details">
                    <span class="detail-item">🏠 {{ filter.houses.length }} casas</span>
                    <span class="detail-item">⚽ {{ filter.sports.length }} esportes</span>
                    <span class="detail-item">💰 {{ filter.currencies.length }} moedas</span>
                                         <span class="detail-item">🎯 {{ filter.markets ? filter.markets.length : 0 }} mercados</span>

                  </div>
                </div>
                <div class="filter-actions">
                  <button @click="loadFilter(filter)" class="load-btn">Carregar</button>
                  <button @click="deleteFilter(index)" class="delete-btn">Excluir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
   </div>
 </template>

<script>
import SurebetCard from '../components/SurebetCard.vue'
import Sidebar from '../components/Sidebar.vue'
import GlossaryModal from '../components/GlossaryModal.vue'
import CreditStatus from '../components/CreditStatus.vue'
import { filterOptions } from '../config/filters.js'
import { getBookmakerUrl, addBookmakerUrl } from '../config/bookmakerUrls.js'
import { MapPin, Trash2 } from 'lucide-vue-next'
import { formatMarketForDisplay } from '../utils/market-translations.js'


export default {
  name: 'SurebetsView',
     components: {
     SurebetCard,
     Sidebar,
     GlossaryModal,
     CreditStatus,
     MapPin,
     Trash2
   },
  data() {
    return {
      surebets: {},
      isSearching: true,
      soundEnabled: true,
      activeFilter: 'prelive',
      loading: true,
      ws: null,
      sidebarCollapsed: false,
      updateInterval: null,
      selectedHouses: [...filterOptions.houses], // Inicia com todas as casas selecionadas
      selectedSports: filterOptions.sports.map(sport => sport.value), // Inicia com todos os esportes selecionados
      selectedCurrencies: filterOptions.currencies.map(currency => currency.code), // Inicia com todas as moedas selecionadas
      filterOptions: filterOptions,
      availableBookmakers: [], // Casas de apostas disponíveis da API
      bookmakerUrls: {}, // URLs das casas de apostas
                         showFilterOverlay: false,
      selectedDate: '',
      minProfit: 0,
      maxProfit: 1000,
       lastCheckCount: 0,
       startTime: Date.now(),
       uptimeMinutes: 0,
       showGlossaryModal: false,
       websocketConnected: false,
       websocketRetryCount: 0,
       pollingInterval: null,
             savedFilters: [], // Lista de filtros salvos do usuário
             showSavedFiltersModal: false,
       showSaveFilterModal: false,
       currentFilterName: '',
       // Cache para preservar filtros durante atualizações da API
       filtersCache: {
                   selectedHouses: [],
          selectedSports: [],
          selectedCurrencies: [],
          selectedMarkets: [],
         selectedDate: '',
         activeFilter: 'prelive',
         minProfit: 0,
         maxProfit: 1000,
         houseSearchTerm: ''
       },
       // Termo de pesquisa para casas de apostas
       houseSearchTerm: '',
       // Novas variáveis para filtros de mercado
       marketOptions: {
         "Handicap Asiático (AH)": {
           "AH1": {
             "-2.5": "Handicap -2.5 Gols Time Casa",
             "-2.0": "Handicap -2 Gols Time Casa",
             "-1.5": "Handicap -1.5 Gols Time Casa",
             "-1.0": "Handicap -1 Gols Time Casa",
             "-0.5": "Handicap -0.5 Gols Time Casa",
             "0.0/DNB": "Handicap 0 Gols Time Casa (Sem Empate)",
             "+0.5": "Handicap +0.5 Gols Time Casa",
             "+1.0": "Handicap +1 Gols Time Casa",
             "+1.5": "Handicap +1.5 Gols Time Casa",
             "+2.0": "Handicap +2 Gols Time Casa"
           },
           "AH2": {
             "-2.5": "Handicap -2.5 Gols Time Visitante",
             "-2.0": "Handicap -2 Gols Time Visitante",
             "-1.5": "Handicap -1.5 Gols Time Visitante",
             "-1.0": "Handicap -1 Gols Time Visitante",
             "-0.5": "Handicap -0.5 Gols Time Visitante",
             "0.0/DNB": "Handicap 0 Gols Time Visitante (Sem Empate)",
             "+0.5": "Handicap +0.5 Gols Time Visitante",
             "+1.0": "Handicap +1 Gols Time Visitante",
             "+1.5": "Handicap +1.5 Gols Time Visitante",
             "+2.0": "Handicap +2 Gols Time Visitante"
           }
         },
         "Handicap de Gols": {
           "EH1": {
             "-5": "Handicap -5 Gols Time Casa",
             "-4": "Handicap -4 Gols Time Casa",
             "-3": "Handicap -3 Gols Time Casa",
             "-2": "Handicap -2 Gols Time Casa",
             "-1": "Handicap -1 Gol Time Casa"
           },
           "EH2": {
             "+1": "Handicap +1 Gol Time Visitante",
             "+2": "Handicap +2 Gols Time Visitante",
             "+3": "Handicap +3 Gols Time Visitante",
             "+4": "Handicap +4 Gols Time Visitante",
             "+5": "Handicap +5 Gols Time Visitante"
           },
           "Totais": {
             "TO": "Over - Total acima de x Gols",
             "TU": "Under - Total abaixo de x Gols",
             "TO_TimeCasa": "Over - Total acima de x Gols Time Casa",
             "TU_TimeCasa": "Under - Total abaixo de x Gols Time Casa",
             "TO_TimeVisitante": "Over - Total acima de x Gols Time Visitante",
             "TU_TimeVisitante": "Under - Total abaixo de x Gols Time Visitante"
           }
         },
         "Gols": {
           "BothToScore": "Ambos os times marcam",
           "OneScoreless": "Uma equipe não marca gols",
           "Even": "Total de gols par",
           "Odd": "Total de gols ímpar",
           "TO": "Over - Total acima de x Gols",
           "TU": "Under - Total abaixo de x Gols",
           "TO_TimeCasa": "Over - Total acima de x Gols Time Casa",
           "TU_TimeCasa": "Under - Total abaixo de x Gols Time Casa",
           "TO_TimeVisitante": "Over - Total acima de x Gols Time Visitante",
           "TU_TimeVisitante": "Under - Total abaixo de x Gols Time Visitante",
           "GolsPorTempo": {
             "TO_1H": "Over - Total acima de x Gols 1º Tempo",
             "TU_1H": "Under - Total abaixo de x Gols 1º Tempo",
             "TO_2H": "Over - Total acima de x Gols 2º Tempo",
             "TU_2H": "Under - Total abaixo de x Gols 2º Tempo"
           }
         },
         "Cartões": {
           "TO": "Over - Total acima de x Cartões",
           "TU": "Under - Total abaixo de x Cartões",
           "TO_TimeCasa": "Over - Total acima de x Cartões Time Casa",
           "TU_TimeCasa": "Under - Total abaixo de x Cartões Time Casa",
           "TO_TimeVisitante": "Over - Total acima de x Cartões Time Visitante",
           "TU_TimeVisitante": "Under - Total abaixo de x Cartões Time Visitante"
         },
         "Resultado Final": {
           "Team1Win": "Vitória Time Casa",
           "Team2Win": "Vitória Time Visitante",
           "Draw": "Empate",
           "Team1Win_1H": "Vitória Time Casa 1º Tempo",
           "Team2Win_1H": "Vitória Time Visitante 1º Tempo",
           "Draw_1H": "Empate 1º Tempo",
           "Team1Win_2H": "Vitória Time Casa 2º Tempo",
           "Team2Win_2H": "Vitória Time Visitante 2º Tempo",
           "Draw_2H": "Empate 2º Tempo"
         },
         "Dupla Chance": {
           "1X": "Vitória Time Casa ou Empate",
           "12": "Vitória de qualquer equipe (não empata)",
           "X2": "Vitória Time Visitante ou Empate"
         },
         "Resultado Exato": {
           "0-0": "0 a 0",
           "1-0": "1 a 0",
           "2-0": "2 a 0",
           "2-1": "2 a 1",
           "1-1": "1 a 1",
           "3-0": "3 a 0",
           "3-1": "3 a 1",
           "3-2": "3 a 2",
           "0-1": "0 a 1",
           "0-2": "0 a 2",
           "1-2": "1 a 2",
           "2-2": "2 a 2"
         },
         "Outros Mercados": {
           "PrimeiroGol": "Quem marca primeiro",
           "ÚltimoGol": "Quem marca por último",
           "IntervaloFinal": "Resultado combinado 1H/FT",
           "HandicapEscanteios": "Mesma lógica do AH, mas para escanteios",
           "GolsPorJogador": "Marcação de gols por jogador específico",
           "CartõesPorJogador": "Recebimento de cartões por jogador específico",
           "OddEvenEscanteios": "Número par ou ímpar de escanteios",
           "OddEvenCartões": "Número par ou ímpar de cartões"
         },
         "Impedimentos": {
           "TO(0.5) for Team1": "Over(0.5) for Team1 - Impedimentos",
           "TU(0.5) for Team1": "Under(0.5) for Team1 - Impedimentos",
           "TO(0.5) for Team2": "Over(0.5) for Team2 - Impedimentos",
           "TU(0.5) for Team2": "Under(0.5) for Team2 - Impedimentos"
         }
       },
       selectedMarkets: [],
       pinnedCards: [], // Array de cards fixos
       pinnedCardKeys: new Set(), // Set para verificar se um card está fixo
       // Propriedades para drag and drop
       dragMode: false, // Modo de arrastar ativo/inativo
       draggedIndex: null, // Índice do card sendo arrastado
       dragOverIndex: null, // Índice onde o card está sendo arrastado sobre

    }
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    // Casas de apostas filtradas pela pesquisa
    filteredHouses() {
      if (!this.houseSearchTerm.trim()) {
        return this.filterOptions.houses
      }
      
      const searchTerm = this.houseSearchTerm.toLowerCase().trim()
      return this.filterOptions.houses.filter(house => 
        house.toLowerCase().includes(searchTerm)
      )
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    // Opções de mercado achatadas para exibição direta
    flattenedMarketOptions() {
      const options = []
      
      Object.entries(this.marketOptions).forEach(([category, subcategories]) => {
        Object.entries(subcategories).forEach(([subcategory, description]) => {
          if (typeof description === 'string') {
            // Subcategoria simples
            options.push({
              value: `${category}|${subcategory}`,
              label: description
            })
          } else if (typeof description === 'object') {
            // Subcategoria com sub-opções
            Object.entries(description).forEach(([option, optionDescription]) => {
              options.push({
                value: `${category}|${subcategory}|${option}`,
                label: optionDescription
              })
            })
          }
        })
      })
      
      return options
    },
    totalSurebets() {
      return Object.keys(this.surebets).length
    },
    preliveCount() {
      return Object.values(this.surebets).filter(surebet => {
        const firstBet = surebet[0]
        // Pre-match: isLive = false (ignora campo minutes)
        return !firstBet?.isLive
      }).length
    },
    liveCount() {
      return Object.values(this.surebets).filter(surebet => {
        const firstBet = surebet[0]
        // Live: isLive = true (ignora campo minutes)
        return firstBet?.isLive === true
      }).length
    },
    filteredSurebets() {
      let surebetsArray = Object.values(this.surebets)
      console.log('🔍 DEBUG FILTROS:')
      console.log('Total surebets inicial:', surebetsArray.length)
      console.log('Selected houses:', this.selectedHouses.length, '/', this.filterOptions.houses.length)
      console.log('Selected sports:', this.selectedSports.length, '/', this.filterOptions.sports.length)
      console.log('Selected currencies:', this.selectedCurrencies.length, '/', this.filterOptions.currencies.length)
      
      // Log de um surebet de exemplo para ver estrutura
      if (surebetsArray.length > 0) {
        console.log('Exemplo de surebet:', surebetsArray[0])
      }
      
      // REMOÇÃO DE DUPLICATAS - Remove surebets com dados 100% idênticos
      const uniqueSurebets = []
      const seenKeys = new Set()
      let duplicatesRemoved = 0
      
      surebetsArray.forEach(surebet => {
        if (!surebet || surebet.length === 0) return
        
        // Cria uma chave única baseada em campos que identificam o surebet
        const key = this.createSurebetKey(surebet)
        
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          uniqueSurebets.push(surebet)
        } else {
          duplicatesRemoved++
          console.log('🔄 Surebet duplicado removido:', key)
        }
      })
      
      surebetsArray = uniqueSurebets
      
       if (duplicatesRemoved > 0) {
         console.log(`✅ Removidos ${duplicatesRemoved} surebet(s) duplicado(s)`)
         console.log(`📊 Total: ${surebetsArray.length} surebet(s) únicos`)
       }
      
      // Filtro por status (prelive/live) - usar APENAS o campo isLive
      switch (this.activeFilter) {
        case 'prelive':
          surebetsArray = surebetsArray.filter(surebet => {
            const firstBet = surebet[0]
            // Pre-match: isLive = false (ignora campo minutes)
            return !firstBet?.isLive
          })
          break
        case 'live':
          surebetsArray = surebetsArray.filter(surebet => {
            const firstBet = surebet[0]
            // Live: isLive = true (ignora campo minutes)
            return firstBet?.isLive === true
          })
          break
      }
      console.log('Após filtro status:', surebetsArray.length)
      
      // Filtro por data específica
      if (this.selectedDate) {
        console.log('📅 Aplicando filtro de data:', this.selectedDate)
        const beforeFilter = surebetsArray.length
        
        surebetsArray = surebetsArray.filter(surebet => {
          const firstBet = surebet[0]
          if (!firstBet?.date) return false
          
          // Compara a data do surebet com a data selecionada
          const surebetDate = firstBet.date // Formato: "2025-08-23"
          return surebetDate === this.selectedDate
        })
        
        console.log(`Filtro data: ${beforeFilter} -> ${surebetsArray.length}`)
      }

      
      // Filtro por casas de aposta (vinculado ao campo "house" da API)
       if (this.selectedHouses.length !== this.filterOptions.houses.length) {
         console.log('🏠 Aplicando filtro de casas...')
         console.log('Casas selecionadas:', this.selectedHouses)
         
         const beforeFilter = surebetsArray.length
         surebetsArray = surebetsArray.filter(surebet => {
           // Extrai todas as casas únicas do surebet
           const surebetHouses = [...new Set(surebet.map(bet => bet.house).filter(Boolean))]
           
           // Se não há casas selecionadas, não exibe nenhum surebet
           if (this.selectedHouses.length === 0) {
             console.log('❌ Surebet rejeitado - nenhuma casa selecionada')
             return false
           }
           
           // Conta quantas casas do surebet coincidem com as selecionadas
           const matchingHouses = surebetHouses.filter(house => this.selectedHouses.includes(house))
           
           // Só exibe se pelo menos 2 casas coincidem
           const match = matchingHouses.length >= 2
           
           if (!match) {
             console.log('❌ Surebet rejeitado - casas do surebet:', surebetHouses, 'casas coincidentes:', matchingHouses.length)
           } else {
             console.log('✅ Surebet aceito - casas do surebet:', surebetHouses, 'casas coincidentes:', matchingHouses)
           }
           
           return match
         })
         console.log(`Filtro casas: ${beforeFilter} -> ${surebetsArray.length}`)
       }
      
             // Filtro por esportes (vinculado ao campo "sport" da API)
       if (this.selectedSports.length !== this.filterOptions.sports.length) {
         console.log('⚽ Aplicando filtro de esportes...')
         console.log('Esportes selecionados:', this.selectedSports)
         
         const beforeFilter = surebetsArray.length
         surebetsArray = surebetsArray.filter(surebet => {
           const surebetSport = surebet[0]?.sport
           
           // Se não há esportes selecionados, não exibe nenhum surebet
           if (this.selectedSports.length === 0) {
             console.log('❌ Surebet rejeitado - nenhum esporte selecionado')
             return false
           }
           
           // Verifica se o esporte do surebet está na lista selecionada
           const match = surebetSport && this.selectedSports.includes(surebetSport)
           
           if (!match) {
             console.log('❌ Surebet rejeitado - esporte:', surebetSport)
           } else {
             console.log('✅ Surebet aceito - esporte:', surebetSport)
           }
           
           return match
         })
         console.log(`Filtro esportes: ${beforeFilter} -> ${surebetsArray.length}`)
       }
      
             // Filtro por moedas (vinculado ao campo "currency" da API)
       if (this.selectedCurrencies.length !== this.filterOptions.currencies.length) {
         console.log('💰 Aplicando filtro de moedas...')
         console.log('Moedas selecionadas:', this.selectedCurrencies)
         
         const beforeFilter = surebetsArray.length
         surebetsArray = surebetsArray.filter(surebet => {
           const surebetCurrency = surebet[0]?.currency
           
           // Se não há moedas selecionadas, não exibe nenhum surebet
           if (this.selectedCurrencies.length === 0) {
             console.log('❌ Surebet rejeitado - nenhuma moeda selecionada')
             return false
           }
           
           // Verifica se a moeda do surebet está na lista selecionada
           const match = surebetCurrency && this.selectedCurrencies.includes(surebetCurrency)
           
           if (!match) {
             console.log('❌ Surebet rejeitado - moeda:', surebetCurrency)
           } else {
             console.log('✅ Surebet aceito - moeda:', surebetCurrency)
           }
           
           return match
         })
         console.log(`Filtro moedas: ${beforeFilter} -> ${surebetsArray.length}`)
       }
      
      // Filtro por mercado (vinculado ao campo "market" da API)
      if (this.selectedMarkets.length > 0) {
        console.log('🎯 Aplicando filtro de mercados...')
        console.log('Mercados selecionados:', this.selectedMarkets)
        
        const beforeFilter = surebetsArray.length
        surebetsArray = surebetsArray.filter(surebet => {
          // Extrai o mercado do primeiro bet do surebet
          const surebetMarket = surebet[0]?.market
          
          if (!surebetMarket) {
            console.log('❌ Surebet rejeitado - mercado não especificado')
            return false
          }
          
          // Verifica se o mercado do surebet está na lista selecionada
          const match = this.selectedMarkets.some(selectedMarket => {
            const [category, subcategory, option] = selectedMarket.split('|')
            
            // Se tem opção específica, verifica se corresponde exatamente
            if (option) {
              return surebetMarket === `${category}|${subcategory}|${option}`
            }
            
            // Se não tem opção, verifica se o mercado começa com a categoria e subcategoria
            return surebetMarket.startsWith(`${category}|${subcategory}`)
          })
          
          if (!match) {
            console.log('❌ Surebet rejeitado - mercado:', surebetMarket)
          } else {
            console.log('✅ Surebet aceito - mercado:', surebetMarket)
          }
          
          return match
        })
        console.log(`Filtro mercados: ${beforeFilter} -> ${surebetsArray.length}`)
      }
      


      // Filtro por faixa de lucro
      if (this.minProfit > 0 || this.maxProfit < 1000) {
        const beforeFilter = surebetsArray.length
        surebetsArray = surebetsArray.filter(surebet => {
          const profit = surebet[0]?.profit || 0
          return profit >= this.minProfit && profit <= this.maxProfit
        })
        console.log(`Filtro lucro: ${beforeFilter} -> ${surebetsArray.length}`)
      }
      
      console.log('✅ Total final:', surebetsArray.length)
      console.log('---')
      return surebetsArray
    },
    
    hasActiveFilters() {
      const allHousesSelected = this.selectedHouses.length === this.filterOptions.houses.length
      const allSportsSelected = this.selectedSports.length === this.filterOptions.sports.length
      const allCurrenciesSelected = this.selectedCurrencies.length === this.filterOptions.currencies.length
      const allMarketsSelected = this.selectedMarkets.length === 0 // Se não há mercados selecionados, considera como "todos selecionados"
      const profitDefault = this.minProfit === 0 && this.maxProfit === 1000
      const dateDefault = !this.selectedDate
      return (!allHousesSelected) || (!allSportsSelected) || (!allCurrenciesSelected) || (!allMarketsSelected) || this.activeFilter !== 'prelive' || !profitDefault || !dateDefault
    },
    
    activeFiltersCount() {
      let count = 0
      if (this.selectedHouses.length !== this.filterOptions.houses.length) count++
      if (this.selectedSports.length !== this.filterOptions.sports.length) count++
      if (this.selectedCurrencies.length !== this.filterOptions.currencies.length) count++
      if (this.selectedMarkets.length > 0) count++
      if (this.activeFilter !== 'prelive') count++
      if (!(this.minProfit === 0 && this.maxProfit === 1000)) count++
      if (this.selectedDate) count++
      return count
    },
    
    isUsingDefaultProfitFilters() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.defaultFilters) {
            const defaultMin = settings.defaultFilters.minProfit !== undefined ? Number(settings.defaultFilters.minProfit) : 0
            const defaultMax = settings.defaultFilters.maxProfit !== undefined ? Number(settings.defaultFilters.maxProfit) : 1000
            return this.minProfit === defaultMin && this.maxProfit === defaultMax
          }
        }
      } catch (error) {
        console.warn('Erro ao verificar filtros padrão:', error)
      }
      return this.minProfit === 0 && this.maxProfit === 1000
    }
  },
  watch: {
    // Monitorar mudanças nas configurações do localStorage
    '$store.state.settings': {
      handler() {
        this.loadDefaultFilters()
      },
      deep: true
    },
    
    // Salvar filtros automaticamente quando mudarem
    selectedHouses() {
      this.saveFiltersToSettings()
    },
    
    selectedSports() {
      this.saveFiltersToSettings()
    },
    
    selectedCurrencies() {
      this.saveFiltersToSettings()
    },
    
    selectedDate() {
      this.saveFiltersToSettings()
    },

    

    
    selectedMarkets() {
      this.saveFiltersToSettings()
    },
    
    activeFilter() {
      this.saveFiltersToSettings()
    }
  },
               mounted() {
        // DEBUG: Verificar estado inicial
        console.log('🚀 MOUNTED: showSaveFilterModal inicial =', this.showSaveFilterModal)
        
        // Limpar estado dos modais
        this.clearModalState()
        
        // Carregar filtros padrão das configurações
        this.loadDefaultFilters()
        
        // Carregar filtros salvos das configurações
        this.loadFiltersFromSettings()
        
        // Inicializar filtros de mercado se não houver filtros salvos
        if (this.selectedMarkets.length === 0) {
          this.selectedMarkets = this.flattenedMarketOptions.map(option => option.value)
        }
        
        // Inicializar o cache dos filtros após carregar as configurações
        this.updateFiltersCache()
        console.log('📦 Cache de filtros inicializado')
        
        // Carregar filtros salvos do usuário
        this.loadSavedFilters()
        
        // Carregar cards fixos
        this.loadPinnedCards()
        
        // DEBUG: Verificar estado após carregar filtros
        console.log('🔍 MOUNTED: showSaveFilterModal após carregar filtros =', this.showSaveFilterModal)
        
        // Forçar o modal para false se estiver true
        if (this.showSaveFilterModal) {
          console.log('⚠️ MOUNTED: Forçando showSaveFilterModal para false')
          this.showSaveFilterModal = false
        }
        
        // TESTE: Adicionar dados de teste para debug
        this.addTestData()
        
        // Verificar se o servidor está disponível antes de tentar WebSocket
        this.checkServerAvailability()
        this.fetchSurebets()
        this.startAutoUpdate()
        
        // Atualiza estatísticas a cada minuto
        setInterval(() => {
          this.updateStats()
        }, 60000)
        
        // Monitorar mudanças no localStorage para configurações
        window.addEventListener('storage', (event) => {
          if (event.key === 'app_settings') {
            this.loadDefaultFilters()
            this.loadFiltersFromSettings()
            this.updateFiltersCache() // Atualiza cache quando configurações mudam
          }
        })
        
        // DEBUG: Verificar estado final
        console.log('✅ MOUNTED: showSaveFilterModal final =', this.showSaveFilterModal)
        
        // Garantir que o modal esteja fechado após o próximo tick
        this.$nextTick(() => {
          if (this.showSaveFilterModal) {
            console.log('⚠️ NEXT_TICK: Forçando showSaveFilterModal para false')
            this.showSaveFilterModal = false
          }
        })
        
        // Verificação adicional após 1 segundo
        setTimeout(() => {
          if (this.showSaveFilterModal) {
            console.log('⚠️ TIMEOUT: Forçando showSaveFilterModal para false')
            this.showSaveFilterModal = false
          }
        }, 1000)
      },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
    this.stopAutoUpdate()
    this.stopHttpPolling()
  },
     methods: {

     // Métodos para pesquisa de casas de apostas
     onHouseSearchInput() {
       // Método chamado quando o usuário digita no campo de pesquisa
       // A filtragem é feita automaticamente pela propriedade computada filteredHouses
       console.log('🔍 Pesquisando casas:', this.houseSearchTerm)
     },
     
     clearHouseSearch() {
       this.houseSearchTerm = ''
       console.log('🧹 Pesquisa de casas limpa')
     },
     
     // Carrega filtros das configurações (não atualiza automaticamente com dados)
     loadFiltersFromSettings() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.filters) {
            console.log('🔄 Carregando filtros salvos...')
            
            // Carrega filtros salvos das configurações
            if (settings.filters.selectedHouses) {
              // Filtra apenas as casas que estão disponíveis na API
              const availableHouses = this.availableBookmakers.length > 0 
                ? this.availableBookmakers 
                : filterOptions.houses
              
              const validHouses = settings.filters.selectedHouses.filter(house => 
                availableHouses.includes(house)
              )
              
              // Se há casas válidas salvas, usa elas
              if (validHouses.length > 0) {
                this.selectedHouses = validHouses
                console.log('✅ Casas carregadas:', validHouses)
              } else {
                // Se não há casas válidas, seleciona todas as disponíveis
                this.selectedHouses = [...availableHouses]
                console.log('🔄 Nenhuma casa válida encontrada, selecionando todas:', availableHouses)
              }
            }
            
            // Carrega outros filtros apenas se não foram carregados antes
            if (settings.filters.selectedSports && this.selectedSports.length === 0) {
              this.selectedSports = settings.filters.selectedSports
              console.log('✅ Esportes carregados:', this.selectedSports)
            }
            
            if (settings.filters.selectedCurrencies && this.selectedCurrencies.length === 0) {
              this.selectedCurrencies = settings.filters.selectedCurrencies
              console.log('✅ Moedas carregadas:', this.selectedCurrencies)
            }
            
            if (settings.filters.selectedMarkets && this.selectedMarkets.length === 0) {
              this.selectedMarkets = settings.filters.selectedMarkets
              console.log('✅ Mercados carregados:', this.selectedMarkets)
            }
            
            if (settings.filters.selectedDate) {
              this.selectedDate = settings.filters.selectedDate
              console.log('✅ Data carregada:', this.selectedDate)
            }
            
            if (settings.filters.activeFilter) {
              this.activeFilter = settings.filters.activeFilter
              console.log('✅ Filtro ativo carregado:', this.activeFilter)
            }
            
            // Salva as configurações atualizadas
            localStorage.setItem('app_settings', JSON.stringify(settings))
            console.log('💾 Filtros salvos no localStorage')
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar filtros das configurações:', error)
      }
    },
    
    // Salva filtros nas configurações
    saveFiltersToSettings() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        let settings = savedSettings ? JSON.parse(savedSettings) : {}
        
        if (!settings.filters) {
          settings.filters = {}
        }
        
        // Atualiza o cache local
        this.updateFiltersCache()
        
        settings.filters.selectedHouses = this.selectedHouses
        settings.filters.selectedSports = this.selectedSports
        settings.filters.selectedCurrencies = this.selectedCurrencies
        settings.filters.selectedMarkets = this.selectedMarkets
        settings.filters.selectedDate = this.selectedDate
        settings.filters.activeFilter = this.activeFilter
        
        localStorage.setItem('app_settings', JSON.stringify(settings))
        console.log('💾 Filtros salvos no localStorage e cache atualizado')
      } catch (error) {
        console.error('Erro ao salvar filtros nas configurações:', error)
      }
    },
    
    // Atualiza o cache dos filtros
    updateFiltersCache() {
      this.filtersCache = {
        selectedHouses: [...this.selectedHouses],
        selectedSports: [...this.selectedSports],
        selectedCurrencies: [...this.selectedCurrencies],
        selectedMarkets: [...this.selectedMarkets],
        selectedDate: this.selectedDate,
        activeFilter: this.activeFilter,
        minProfit: this.minProfit,
        maxProfit: this.maxProfit,
        houseSearchTerm: this.houseSearchTerm
      }
      console.log('📦 Cache de filtros atualizado')
    },
    
    // Restaura filtros do cache
    restoreFiltersFromCache() {
      let restoredCount = 0
      let changesDetected = false
      
      // Verifica se houve mudanças nos filtros
      if (this.filtersCache.selectedHouses.length > 0) {
        const currentHouses = [...this.selectedHouses].sort()
        const cachedHouses = [...this.filtersCache.selectedHouses].sort()
        
        if (JSON.stringify(currentHouses) !== JSON.stringify(cachedHouses)) {
          this.selectedHouses = [...this.filtersCache.selectedHouses]
          console.log('🔄 Restaurando casas do cache:', this.selectedHouses)
          restoredCount++
          changesDetected = true
        }
      }
      
      if (this.filtersCache.selectedSports.length > 0) {
        const currentSports = [...this.selectedSports].sort()
        const cachedSports = [...this.filtersCache.selectedSports].sort()
        
        if (JSON.stringify(currentSports) !== JSON.stringify(cachedSports)) {
          this.selectedSports = [...this.filtersCache.selectedSports]
          console.log('🔄 Restaurando esportes do cache:', this.selectedSports)
          restoredCount++
          changesDetected = true
        }
      }
      
      if (this.filtersCache.selectedCurrencies.length > 0) {
        const currentCurrencies = [...this.selectedCurrencies].sort()
        const cachedCurrencies = [...this.filtersCache.selectedCurrencies].sort()
        
        if (JSON.stringify(currentCurrencies) !== JSON.stringify(cachedCurrencies)) {
          this.selectedCurrencies = [...this.filtersCache.selectedCurrencies]
          console.log('🔄 Restaurando moedas do cache:', this.selectedCurrencies)
          restoredCount++
          changesDetected = true
        }
      }
      
      if (this.filtersCache.selectedMarkets.length > 0) {
        const currentMarkets = [...this.selectedMarkets].sort()
        const cachedMarkets = [...this.filtersCache.selectedMarkets].sort()
        
        if (JSON.stringify(currentMarkets) !== JSON.stringify(cachedMarkets)) {
          this.selectedMarkets = [...this.filtersCache.selectedMarkets]
          console.log('🔄 Restaurando mercados do cache:', this.selectedMarkets)
          restoredCount++
          changesDetected = true
        }
      }
      
      if (this.filtersCache.selectedDate && this.selectedDate !== this.filtersCache.selectedDate) {
        this.selectedDate = this.filtersCache.selectedDate
        console.log('🔄 Restaurando data do cache:', this.selectedDate)
        restoredCount++
        changesDetected = true
      }
      
      if (this.filtersCache.activeFilter && this.activeFilter !== this.filtersCache.activeFilter) {
        this.activeFilter = this.filtersCache.activeFilter
        console.log('🔄 Restaurando filtro ativo do cache:', this.activeFilter)
        restoredCount++
        changesDetected = true
      }
      
      if (this.filtersCache.minProfit !== undefined && this.minProfit !== this.filtersCache.minProfit) {
        this.minProfit = this.filtersCache.minProfit
        console.log('🔄 Restaurando lucro mínimo do cache:', this.minProfit)
        restoredCount++
        changesDetected = true
      }
      
      if (this.filtersCache.maxProfit !== undefined && this.maxProfit !== this.filtersCache.maxProfit) {
        this.maxProfit = this.filtersCache.maxProfit
        console.log('🔄 Restaurando lucro máximo do cache:', this.maxProfit)
        restoredCount++
        changesDetected = true
      }
      
      if (this.filtersCache.houseSearchTerm !== undefined && this.houseSearchTerm !== this.filtersCache.houseSearchTerm) {
        this.houseSearchTerm = this.filtersCache.houseSearchTerm
        console.log('🔄 Restaurando termo de pesquisa de casas do cache:', this.houseSearchTerm)
        restoredCount++
        changesDetected = true
      }
      
      if (restoredCount > 0) {
        console.log(`✅ ${restoredCount} filtro(s) restaurado(s) do cache`)
        
        // Mostra notificação apenas se houve mudanças significativas
        if (changesDetected && restoredCount > 2) {
          this.showNotification(`Filtros preservados após atualização da API`, 'info')
        }
      }
    },
    
    // MÉTODO DE TESTE - REMOVER DEPOIS
    addTestData() {
      this.surebets = {
        'test1': [
          {
            house: 'Bet365',
            sport: 'Futebol',
            currency: 'BRL',
            match: 'Time A vs Time B',
            market: 'Resultado Final',
            chance: 2.10,
            profit: 5.2,
            minutes: 0,
            timestamp: new Date().toISOString()
          },
          {
            house: 'Betano',
            sport: 'Futebol',
            currency: 'BRL',
            match: 'Time A vs Time B',
            market: 'Resultado Final',
            chance: 1.95,
            profit: 5.2,
            minutes: 0,
            timestamp: new Date().toISOString()
          }
        ],
        'test2': [
          {
            house: 'Pixbet',
            sport: 'Tênis',
            currency: 'USD',
            match: 'Jogador 1 vs Jogador 2',
            market: 'Vencedor',
            chance: 1.80,
            profit: 3.1,
            minutes: 15,
            timestamp: new Date().toISOString()
          },
          {
            house: 'Rivalo',
            sport: 'Tênis',
            currency: 'USD',
            match: 'Jogador 1 vs Jogador 2',
            market: 'Vencedor',
            chance: 2.25,
            profit: 3.1,
            minutes: 15,
            timestamp: new Date().toISOString()
          }
        ],
        'test3': [
          {
            house: 'Sportingbet',
            sport: 'Basquete',
            currency: 'EUR',
            match: 'Lakers vs Warriors',
            market: 'Handicap',
            chance: 1.92,
            profit: 7.8,
            minutes: 0,
            timestamp: new Date().toISOString()
          },
          {
            house: 'Betway',
            sport: 'Basquete',
            currency: 'EUR',
            match: 'Lakers vs Warriors',
            market: 'Handicap',
            chance: 2.05,
            profit: 7.8,
            minutes: 0,
            timestamp: new Date().toISOString()
          }
        ]
      }
      this.loading = false
      console.log('📊 Dados de teste adicionados:', this.surebets)
    },
    

    initWebSocket() {
      // Verificar se WebSocket está disponível
      if (typeof WebSocket === 'undefined') {
        console.warn('WebSocket não suportado neste navegador. Usando fallback HTTP.')
        this.startHttpPolling()
        return
      }

      // Se já tentou 3 vezes, usar HTTP polling diretamente
      if (this.websocketRetryCount >= 3) {
        console.log('Usando HTTP polling (WebSocket indisponível)')
        this.startHttpPolling()
        return
      }

      try {
        // Configurar timeout para WebSocket
        const wsTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.log('Timeout na conexão WebSocket. Usando fallback HTTP.')
            this.ws.close()
            this.websocketRetryCount++
            this.startHttpPolling()
          }
        }, 3000) // 3 segundos de timeout

        this.ws = new WebSocket('ws://localhost:3002')
        
        this.ws.onopen = () => {
          clearTimeout(wsTimeout)
          console.log('WebSocket conectado')
          this.websocketConnected = true
          this.websocketRetryCount = 0
          this.stopHttpPolling() // Para polling se WebSocket conectar
        }
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'initial_state':
              this.surebets = data.surebets
              this.isSearching = data.isSearching
              this.soundEnabled = data.soundEnabled
              this.loading = false
              // Não toca som no estado inicial
              break
              
            case 'new_surebet':
              // Verifica se há novos dados antes de tocar o som
              const currentKeys = Object.keys(this.surebets)
              const newKeys = Object.keys(data.surebets)
              const hasNewData = newKeys.length > currentKeys.length || 
                                newKeys.some(key => !currentKeys.includes(key))
              
              this.surebets = data.surebets
              
              // Toca som apenas se há novos dados e o som está habilitado
              if (this.soundEnabled && hasNewData) {
                this.playNotificationSound()
              }
              break
              
            case 'search_state_changed':
              // Atualiza o estado de busca baseado na mensagem do servidor
              this.isSearching = data.isSearching
              console.log(`Estado de busca atualizado via WebSocket: ${this.isSearching ? 'Ativo' : 'Pausado'}`)
              
              // Atualiza a busca automática baseado no novo estado
              if (this.isSearching) {
                this.startAutoUpdate()
              } else {
                this.stopAutoUpdate()
              }
              break
          }
        }
        
        this.ws.onerror = (error) => {
          clearTimeout(wsTimeout)
          // Não logar erro específico para evitar spam no console
          this.websocketConnected = false
        }
        
        this.ws.onclose = (event) => {
          clearTimeout(wsTimeout)
          this.websocketConnected = false
          
          // Tentar reconectar apenas se não foi um fechamento intencional
          if (!event.wasClean && this.websocketRetryCount < 3) {
            this.websocketRetryCount++
            console.log(`Tentativa ${this.websocketRetryCount}/3: WebSocket indisponível, tentando novamente em ${2 * this.websocketRetryCount}s...`)
            
            setTimeout(() => {
              this.initWebSocket()
            }, 2000 * this.websocketRetryCount) // Delay progressivo
          } else if (this.websocketRetryCount >= 3) {
            console.log('WebSocket indisponível. Usando HTTP polling.')
            this.startHttpPolling()
          }
        }
        
      } catch (error) {
        console.log('WebSocket não disponível. Usando HTTP polling.')
        this.startHttpPolling()
      }
    },

    startHttpPolling() {
      // Evitar iniciar múltiplos intervals
      if (this.pollingInterval) {
        return
      }
      
      console.log('Usando HTTP polling para atualizações')
      
      // Fazer primeira busca imediatamente
      this.fetchSurebets()
      
      // Configurar polling a cada 5 segundos
      this.pollingInterval = setInterval(() => {
        this.fetchSurebets()
      }, 5000)
    },

    stopHttpPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },

    loadDefaultFilters() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          
          // Aplicar filtros padrão se existirem
          if (settings.defaultFilters) {
            // Aplicar lucro mínimo e máximo
            if (settings.defaultFilters.minProfit !== undefined) {
              this.minProfit = Number(settings.defaultFilters.minProfit)
            }
            if (settings.defaultFilters.maxProfit !== undefined) {
              this.maxProfit = Number(settings.defaultFilters.maxProfit)
            }
            
            // Aplicar filtro ativo padrão
            if (settings.defaultFilters.activeFilter) {
              this.activeFilter = settings.defaultFilters.activeFilter
            }

          }
        }
      } catch (error) {
        console.warn('Erro ao carregar filtros padrão:', error)
      }
    },

    saveCurrentFiltersAsDefault() {
      try {
        const savedSettings = localStorage.getItem('app_settings')
        let settings = savedSettings ? JSON.parse(savedSettings) : {}
        
        // Inicializar defaultFilters se não existir
        if (!settings.defaultFilters) {
          settings.defaultFilters = {}
        }
        
        // Salvar filtros atuais como padrão
        settings.defaultFilters.minProfit = this.minProfit
        settings.defaultFilters.maxProfit = this.maxProfit
        settings.defaultFilters.activeFilter = this.activeFilter
        
        localStorage.setItem('app_settings', JSON.stringify(settings))
        
        this.showNotification('Filtros salvos como padrão!')
      } catch (error) {
        console.error('Erro ao salvar filtros como padrão:', error)
        this.showNotification('Erro ao salvar filtros como padrão!', 'error')
      }
    },

    async checkServerAvailability() {
      try {
        // Tentar conectar ao WebSocket com timeout
        const wsTest = new WebSocket('ws://localhost:3002')
        
        const wsPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 2000)
          
          wsTest.onopen = () => {
            clearTimeout(timeout)
            wsTest.close()
            resolve(true)
          }
          
          wsTest.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('WebSocket não disponível'))
          }
        })
        
        await wsPromise
        // Se chegou aqui, WebSocket está disponível
        this.initWebSocket()
        
      } catch (error) {
        // WebSocket não disponível, usar HTTP polling diretamente
        console.log('Servidor WebSocket não disponível. Usando HTTP polling.')
        this.startHttpPolling()
      }
    },
    
             async fetchSurebets() {
      try {
        // Preserva os filtros atuais antes da atualização
        this.updateFiltersCache()
        
        const response = await fetch('/api/surebets')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        
        // Verifica se há novos dados comparando com os dados atuais
        const currentKeys = Object.keys(this.surebets)
        const newKeys = Object.keys(data)
        const hasNewData = newKeys.length > currentKeys.length || 
                          newKeys.some(key => !currentKeys.includes(key))
        
        this.surebets = data
        this.loading = false
        this.updateStats() // Atualiza estatísticas
        
        // Atualiza as casas de apostas disponíveis baseado nos dados da API
        this.updateAvailableBookmakers(data)
        
        // Restaura os filtros do cache após a atualização
        this.restoreFiltersFromCache()
        
        // Atualiza cards fixos com dados mais recentes
        this.updatePinnedCards(data)
        
        // Toca som apenas se há novos dados e o som está habilitado
        if (this.soundEnabled && hasNewData) {
          this.playNotificationSound()
        }
        
        console.log('✅ Dados da API atualizados e filtros preservados')
      } catch (error) {
        // Log silencioso para evitar spam no console
        this.loading = false
        this.updateStats() // Atualiza estatísticas mesmo em caso de erro
        
        // Restaura filtros do cache mesmo em caso de erro
        this.restoreFiltersFromCache()
      }
    },
    
    updateAvailableBookmakers(surebetsData) {
      try {
        // Extrai todas as casas de apostas únicas dos dados
        const uniqueBookmakers = new Set()
        const dynamicUrls = {}
        
        // Processa cada surebet para extrair casas de apostas
        Object.values(surebetsData).forEach(surebet => {
          if (Array.isArray(surebet) && surebet.length > 0) {
            surebet.forEach(bet => {
              if (bet.house) {
                uniqueBookmakers.add(bet.house)
                
                // Extrai URL específica da API se disponível
                if (bet.anchorh1 || bet.anchorh2) {
                  const apiUrl = bet.anchorh1 || bet.anchorh2
                  if (apiUrl && apiUrl.includes('http')) {
                    dynamicUrls[bet.house] = apiUrl
                    
                    // Adiciona URL dinamicamente ao mapeamento se não existir
                    const mappedUrl = getBookmakerUrl(bet.house, bet.isLive)
                    if (mappedUrl.includes('google.com/search')) {
                      // Se não encontrou URL mapeada, adiciona a URL da API
                      addBookmakerUrl(bet.house, this.extractBaseUrl(apiUrl), bet.isLive)
                      console.log(`🆕 Nova casa adicionada: ${bet.house} -> ${apiUrl}`)
                    }
                  }
                }
              }
            })
          }
        })
        
        // Converte para array e ordena alfabeticamente
        const sortedBookmakers = Array.from(uniqueBookmakers).sort()
        
        // Atualiza as propriedades
        this.availableBookmakers = sortedBookmakers
        this.bookmakerUrls = this.buildBookmakerUrlsMap(sortedBookmakers)
        
        // Atualiza os filtros de casas se necessário
        this.updateHouseFilters(sortedBookmakers)
        
        console.log('🏠 Casas de apostas atualizadas:', sortedBookmakers.length, 'casas encontradas')
        console.log('🔗 URLs mapeadas:', Object.keys(this.bookmakerUrls).length, 'URLs disponíveis')
        
      } catch (error) {
        console.error('Erro ao atualizar casas de apostas:', error)
      }
    },
    
    // Constrói mapa de URLs para as casas disponíveis
    buildBookmakerUrlsMap(bookmakers) {
      const urlsMap = {}
      bookmakers.forEach(house => {
        urlsMap[house] = {
          prematch: getBookmakerUrl(house, false),
          live: getBookmakerUrl(house, true)
        }
      })
      return urlsMap
    },
    
    // Extrai URL base de uma URL completa
    extractBaseUrl(fullUrl) {
      try {
        const url = new URL(fullUrl)
        return `${url.protocol}//${url.hostname}/`
      } catch (error) {
        console.warn('Erro ao extrair URL base:', error)
        return fullUrl
      }
    },
    
    updateHouseFilters(availableBookmakers) {
      // Se não há casas disponíveis, mantém as padrão
      if (!availableBookmakers || availableBookmakers.length === 0) {
        return
      }
      
      // Atualiza as opções de filtro de casas
      this.filterOptions.houses = availableBookmakers
      
      // Preserva as seleções do usuário de forma mais inteligente
      const currentSelected = [...this.selectedHouses]
      
      // Filtra apenas as casas que ainda estão disponíveis
      const validSelectedHouses = currentSelected.filter(house => 
        availableBookmakers.includes(house)
      )
      
      // Se o usuário tinha casas selecionadas e algumas ainda estão disponíveis, mantém apenas as válidas
      if (validSelectedHouses.length > 0) {
        this.selectedHouses = validSelectedHouses
        console.log('🔒 Preservando seleções do usuário:', validSelectedHouses)
      } else {
        // Se nenhuma casa selecionada está disponível, seleciona todas as disponíveis
        this.selectedHouses = [...availableBookmakers]
        console.log('🔄 Nenhuma casa selecionada disponível, selecionando todas:', availableBookmakers)
      }
      
      // Salva as configurações atualizadas
      this.saveFiltersToSettings()
    },
    
         toggleSearch() {
      this.isSearching = !this.isSearching
      this.sendWebSocketMessage('toggle_search', { isSearching: this.isSearching })
      
      if (this.isSearching) {
        this.startAutoUpdate()
      } else {
        this.stopAutoUpdate()
      }
    },
    
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.sendWebSocketMessage('toggle_sound', { soundEnabled: this.soundEnabled })
    },
    
    setFilter(filter) {
      // Previne a seleção do filtro "live" que está desabilitado
      if (filter === 'live') {
        return
      }
      this.activeFilter = filter
      this.saveFiltersToSettings()
    },
    

    
    applyFilters() {
      // Os filtros são aplicados automaticamente através do computed filteredSurebets
      this.saveFiltersToSettings()
      this.toggleFilterOverlay()
    },

    onDateChange() {
      console.log('Data selecionada:', this.selectedDate)
      this.saveFiltersToSettings()
    },

    clearDateFilter() {
      this.selectedDate = ''
      this.saveFiltersToSettings()
    },
    
    clearFilters() {
      // Limpa filtros mas mantém tudo selecionado por padrão
      // Usa as casas disponíveis da API ou as padrão se não houver dados
      const housesToSelect = this.availableBookmakers.length > 0 
        ? [...this.availableBookmakers] 
        : [...filterOptions.houses]
      
      this.selectedHouses = housesToSelect
      this.selectedSports = this.filterOptions.sports.map(sport => sport.value)
      this.selectedCurrencies = this.filterOptions.currencies.map(currency => currency.code)
      this.selectedMarkets = this.flattenedMarketOptions.map(option => option.value)
      this.selectedDate = ''
      this.minProfit = 0
      this.maxProfit = 1000
      this.activeFilter = 'prelive'
      
      // Salvar filtros nas configurações
      this.saveFiltersToSettings()
      
      // Mostrar notificação
      this.showNotification('Filtros limpos!')
    },
    
    toggleFilterOverlay() {
      this.showFilterOverlay = !this.showFilterOverlay
    },
    
    selectAllHouses() {
      this.selectedHouses = [...this.filterOptions.houses]
      this.saveFiltersToSettings()
    },
    
    deselectAllHouses() {
      this.selectedHouses = []
      this.saveFiltersToSettings()
    },
    
    selectAllSports() {
      // filterOptions.sports sempre tem estrutura de objetos {value, label}
      this.selectedSports = this.filterOptions.sports.map(sport => sport.value)
      this.saveFiltersToSettings()
    },
    
    deselectAllSports() {
      this.selectedSports = []
      this.saveFiltersToSettings()
    },
    
    selectAllCurrencies() {
      // filterOptions.currencies sempre tem estrutura de objetos {code, label}
      this.selectedCurrencies = this.filterOptions.currencies.map(currency => currency.code)
      this.saveFiltersToSettings()
    },
    
    deselectAllCurrencies() {
      this.selectedCurrencies = []
      this.saveFiltersToSettings()
    },
    
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    sendWebSocketMessage(type, data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, ...data }))
      }
    },
    
    playNotificationSound() {
      const audio = this.$refs.notificationSound
      if (!audio) return
      try {
        audio.pause()
        audio.currentTime = 0
        const playPromise = audio.play()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(err => { console.log('Erro ao tocar som:', err) })
        }
      } catch (error) {
        console.log('Erro ao tocar som:', error)
      }
    },
    
    startAutoUpdate() {
      this.stopAutoUpdate() // Limpa qualquer intervalo existente
      this.updateInterval = setInterval(() => {
        if (this.isSearching) {
          this.fetchSurebets()
        }
      }, 5000) // Atualiza a cada 5 segundos
    },
    
    updateStats() {
      // Atualiza contador de verificações
      this.lastCheckCount++
      
      // Atualiza tempo online
      const now = Date.now()
      const uptimeMs = now - this.startTime
      this.uptimeMinutes = Math.floor(uptimeMs / (1000 * 60))
    },
    
         stopAutoUpdate() {
       if (this.updateInterval) {
         clearInterval(this.updateInterval)
         this.updateInterval = null
       }
     },
     
     // Adiciona surebet aos relatórios
     addSurebetToReports(surebet) {
       // Encontra o ID do surebet no objeto surebets
       const surebetId = Object.keys(this.surebets).find(key => 
         this.surebets[key] === surebet
       )
       
       if (surebetId) {
         // Salva no localStorage para a página de relatórios
         const storedBets = JSON.parse(localStorage.getItem('reports_bets') || '[]')
         
         const firstBet = surebet[0]
         const houses = surebet.map(bet => bet.house).filter(Boolean)
         
         const newBet = {
           id: Date.now() + Math.random(),
           match: firstBet.match || 'Partida não especificada',
           sport: firstBet.sport || 'Esporte não especificado',
           houses: houses,
           market: formatMarketForDisplay(firstBet.market) || 'Mercado não especificado',
           odds: surebet.map(bet => bet.chance || bet.odds).join(' / '),
           stake: 100.00,
           investment: 100.00,
           status: 'Em andamento',
           profit: firstBet.profit || 0,
           roi: firstBet.profit || 0,
           date: new Date().toISOString(),
           surebetId: surebetId
         }
         
         storedBets.unshift(newBet)
         localStorage.setItem('reports_bets', JSON.stringify(storedBets))
         
         // Mostra notificação
         this.showNotification('Surebet adicionado aos relatórios!')
       }
     },
     
     // Cria uma chave única para identificar surebets duplicados
     createSurebetKey(surebet) {
       if (!surebet || surebet.length === 0) return ''
       
       const firstBet = surebet[0]
       
       // Campos principais que identificam um surebet único
       const keyFields = [
         firstBet.match || '',           // Nome da partida
         firstBet.sport || '',           // Esporte
         firstBet.tournament || '',      // Torneio
         firstBet.date || '',            // Data
         firstBet.hour || '',            // Hora
         firstBet.profit || '0',         // Lucro
         firstBet.currency || ''         // Moeda
       ]
       
       // Adiciona informações das casas de apostas e odds
       const betDetails = surebet.map(bet => 
         `${bet.house || ''}-${bet.chance || ''}-${bet.market || ''}`
       ).sort().join('|')
       
       // Combina todos os campos para criar uma chave única
       const key = keyFields.join('|') + '|' + betDetails
       
       return key
     },
     
           // Mostra notificação
      showNotification(message, type = 'success') {
        const notification = document.createElement('div')
        notification.className = 'notification'
        notification.textContent = message
        
        let backgroundColor = '#00ff88'
        let textColor = '#1a1a1a'
        
        if (type === 'error') {
          backgroundColor = '#ff6b6b'
          textColor = '#ffffff'
        } else if (type === 'warning') {
          backgroundColor = '#ffc107'
          textColor = '#1a1a1a'
        }
        
        notification.style.cssText = `
           position: fixed;
           top: 100px;
           right: 20px;
           background: ${backgroundColor};
           color: ${textColor};
           padding: 12px 20px;
           border-radius: 8px;
           font-weight: 600;
           z-index: 10000;
           animation: slideIn 0.3s ease;
         `
       
       document.body.appendChild(notification)
       
       setTimeout(() => {
         notification.style.animation = 'slideOut 0.3s ease'
         setTimeout(() => {
           if (notification.parentNode) {
             notification.parentNode.removeChild(notification)
           }
         }, 300)
                }, 3000)
       },
       
               // Métodos do Glossário
        openGlossary() {
          this.showGlossaryModal = true
        },
        
        closeGlossary() {
          this.showGlossaryModal = false
        },
        
                 // Método de Logout
         logout() {
           this.$store.dispatch('logout')
           this.$router.push('/login')
         },
         
         // Métodos para Filtros Salvos
         loadSavedFilters() {
           try {
             const userId = this.currentUser?.id || 'anonymous'
             const key = `saved_filters_${userId}`
             const saved = localStorage.getItem(key)
             if (saved) {
               this.savedFilters = JSON.parse(saved)
             }
             
             // DEBUG: Verificar se há algum problema com showSaveFilterModal
             console.log('🔍 DEBUG: showSaveFilterModal =', this.showSaveFilterModal)
             
             // Forçar o valor para false se estiver true
             if (this.showSaveFilterModal) {
               console.log('⚠️ WARNING: showSaveFilterModal estava true, forçando para false')
               this.showSaveFilterModal = false
             }
           } catch (error) {
             console.warn('Erro ao carregar filtros salvos:', error)
             this.savedFilters = []
           }
         },
         
                   // Método para limpar localStorage e forçar reset dos modais
          clearModalState() {
            console.log('🧹 Limpando estado dos modais...')
            this.showSaveFilterModal = false
            this.showSavedFiltersModal = false
            this.currentFilterName = ''
            
            // Limpar localStorage relacionado aos modais (se existir)
            try {
              localStorage.removeItem('showSaveFilterModal')
              localStorage.removeItem('showSavedFiltersModal')
              
              // Limpar TODOS os itens do localStorage que possam estar relacionados
              const keysToRemove = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.includes('modal') || key.includes('filter'))) {
                  keysToRemove.push(key)
                }
              }
              
              keysToRemove.forEach(key => {
                localStorage.removeItem(key)
                console.log('🗑️ Removido do localStorage:', key)
              })
            } catch (error) {
              console.warn('Erro ao limpar localStorage dos modais:', error)
            }
            
            // Forçar o estado para false após um pequeno delay
            setTimeout(() => {
              this.showSaveFilterModal = false
              this.showSavedFiltersModal = false
              console.log('✅ Estado dos modais forçado para false')
            }, 100)
          },
         
         saveSavedFilters() {
           try {
             const userId = this.currentUser?.id || 'anonymous'
             const key = `saved_filters_${userId}`
             localStorage.setItem(key, JSON.stringify(this.savedFilters))
           } catch (error) {
             console.error('Erro ao salvar filtros:', error)
           }
         },
         
         showSaveFilterModal() {
           this.currentFilterName = ''
           this.showSaveFilterModal = true
         },
         
         closeSaveFilterModal() {
           this.showSaveFilterModal = false
           this.currentFilterName = ''
         },
         
         saveFilter() {
           if (!this.currentFilterName.trim()) return
           
           const newFilter = {
             id: Date.now(),
             name: this.currentFilterName.trim(),
             houses: [...this.selectedHouses],
             sports: [...this.selectedSports],
             currencies: [...this.selectedCurrencies],
             markets: [...this.selectedMarkets],
             selectedDate: this.selectedDate,
             minProfit: this.minProfit,
             maxProfit: this.maxProfit,
             activeFilter: this.activeFilter,
             createdAt: new Date().toISOString()
           }
           
           this.savedFilters.push(newFilter)
           this.saveSavedFilters()
           this.closeSaveFilterModal()
           this.showNotification('Filtro salvo com sucesso!')
         },
         
         showSavedFiltersList() {
           this.showSavedFiltersModal = true
         },
         
         closeSavedFiltersModal() {
           this.showSavedFiltersModal = false
         },
         
         loadFilter(filter) {
           // Filtra apenas as casas que estão disponíveis na API
           const availableHouses = this.availableBookmakers.length > 0 
             ? this.availableBookmakers 
             : filterOptions.houses
           
           this.selectedHouses = filter.houses 
             ? filter.houses.filter(house => availableHouses.includes(house))
             : []
           
           // Se não há casas selecionadas válidas, seleciona todas as disponíveis
           if (this.selectedHouses.length === 0) {
             this.selectedHouses = [...availableHouses]
           }
           
           this.selectedSports = [...filter.sports]
           this.selectedCurrencies = [...filter.currencies]
           this.selectedMarkets = filter.markets ? [...filter.markets] : []
           this.selectedDate = filter.selectedDate || ''
           this.minProfit = filter.minProfit
           this.maxProfit = filter.maxProfit
           this.activeFilter = filter.activeFilter
           
           this.saveFiltersToSettings()
           this.closeSavedFiltersModal()
           this.showNotification(`Filtro "${filter.name}" carregado!`)
         },
         
         deleteFilter(index) {
           const filterName = this.savedFilters[index].name
           this.savedFilters.splice(index, 1)
           this.saveSavedFilters()
           this.showNotification(`Filtro "${filterName}" excluído!`)
         },
         
         // Métodos para filtros de mercado
         selectAllMarkets() {
           // Seleciona todas as opções de mercado
           this.selectedMarkets = this.flattenedMarketOptions.map(option => option.value)
           this.saveFiltersToSettings()
         },
         
         deselectAllMarkets() {
           this.selectedMarkets = []
           this.saveFiltersToSettings()
         },
         
         // Métodos para gerenciar cards fixos
         togglePinCard(surebet) {
           const cardKey = this.createSurebetKey(surebet)
           
           if (this.pinnedCardKeys.has(cardKey)) {
             // Remove o card fixo
             this.pinnedCardKeys.delete(cardKey)
             this.pinnedCards = this.pinnedCards.filter(card => 
               this.createSurebetKey(card) !== cardKey
             )
             this.showNotification('Card desafixado!')
           } else {
             // Verifica se já atingiu o limite de 3 cards fixos
             if (this.pinnedCards.length >= 3) {
               this.showNotification('Limite máximo de 3 cards fixos atingido!', 'warning')
               return
             }
             
             // Adiciona o card fixo
             this.pinnedCardKeys.add(cardKey)
             this.pinnedCards.push(surebet)
             this.showNotification('Card fixado!')
           }
           
           this.savePinnedCards()
         },
         
         isPinned(surebet) {
           const cardKey = this.createSurebetKey(surebet)
           return this.pinnedCardKeys.has(cardKey)
         },
         
         clearAllPinnedCards() {
           this.pinnedCards = []
           this.pinnedCardKeys.clear()
           this.savePinnedCards()
           this.showNotification('Todos os cards fixos foram removidos!')
         },
         
         savePinnedCards() {
           try {
             const userId = this.currentUser?.id || 'anonymous'
             const key = `pinned_cards_${userId}`
             const pinnedData = {
               cardKeys: Array.from(this.pinnedCardKeys),
               cards: this.pinnedCards
             }
             localStorage.setItem(key, JSON.stringify(pinnedData))
           } catch (error) {
             console.error('Erro ao salvar cards fixos:', error)
           }
         },
         
         loadPinnedCards() {
           try {
             const userId = this.currentUser?.id || 'anonymous'
             const key = `pinned_cards_${userId}`
             const saved = localStorage.getItem(key)
             
             if (saved) {
               const pinnedData = JSON.parse(saved)
               this.pinnedCardKeys = new Set(pinnedData.cardKeys || [])
               this.pinnedCards = pinnedData.cards || []
             }
           } catch (error) {
             console.warn('Erro ao carregar cards fixos:', error)
             this.pinnedCards = []
             this.pinnedCardKeys = new Set()
           }
         },
         
         updatePinnedCards(newData) {
           // Atualiza os cards fixos com dados mais recentes da API
           const updatedPinnedCards = []
           
           this.pinnedCards.forEach(pinnedCard => {
             const pinnedKey = this.createSurebetKey(pinnedCard)
             
             // Procura por dados atualizados na nova resposta da API
             const updatedCard = Object.values(newData).find(surebet => {
               const surebetKey = this.createSurebetKey(surebet)
               return surebetKey === pinnedKey
             })
             
             if (updatedCard) {
               updatedPinnedCards.push(updatedCard)
             } else {
               // Se não encontrou dados atualizados, mantém o card antigo
               updatedPinnedCards.push(pinnedCard)
             }
           })
           
           this.pinnedCards = updatedPinnedCards
         },
         
         scrollToPinnedCards() {
           const pinnedSection = document.querySelector('.pinned-cards-section')
           if (pinnedSection) {
             pinnedSection.scrollIntoView({ 
               behavior: 'smooth', 
               block: 'start' 
             })
           }
         },
         
         // Métodos para drag and drop
         toggleDragMode() {
           this.dragMode = !this.dragMode
           if (!this.dragMode) {
             // Limpa estados de drag quando desativa o modo
             this.draggedIndex = null
             this.dragOverIndex = null
           }
           this.showNotification(this.dragMode ? 'Modo de arrastar ativado!' : 'Modo de arrastar desativado!')
         },
         
         onDragStart(event) {
           if (!this.dragMode) return
           
           const index = parseInt(event.target.dataset.index)
           this.draggedIndex = index
           event.dataTransfer.effectAllowed = 'move'
           event.dataTransfer.setData('text/html', event.target.outerHTML)
           
           // Adiciona classe visual ao card sendo arrastado
           event.target.style.opacity = '0.5'
         },
         
         onDragEnd(event) {
           if (!this.dragMode) return
           
           // Remove classe visual
           event.target.style.opacity = '1'
           this.draggedIndex = null
           this.dragOverIndex = null
         },
         
         onDragEnter(event) {
           if (!this.dragMode || this.draggedIndex === null) return
           
           const dragTarget = event.target.closest('.pinned-card-wrapper')
           if (!dragTarget) return
           
           const index = parseInt(dragTarget.dataset.index)
           if (index !== this.draggedIndex && !isNaN(index)) {
             this.dragOverIndex = index
           }
         },
         
         onDrop(event) {
           if (!this.dragMode || this.draggedIndex === null) return
           
           event.preventDefault()
           
           const dropTarget = event.target.closest('.pinned-card-wrapper')
           if (!dropTarget) return
           
           const dropIndex = parseInt(dropTarget.dataset.index)
           
           if (dropIndex !== this.draggedIndex && dropIndex !== undefined && !isNaN(dropIndex)) {
             // Reorganiza os cards
             const draggedCard = this.pinnedCards[this.draggedIndex]
             
             // Remove o card da posição original
             this.pinnedCards.splice(this.draggedIndex, 1)
             
             // Insere o card na nova posição
             this.pinnedCards.splice(dropIndex, 0, draggedCard)
             
             // Salva a nova ordem
             this.savePinnedCards()
             
             this.showNotification('Card reorganizado!')
           }
           
           this.draggedIndex = null
           this.dragOverIndex = null
         }
  }
}
</script>

<style lang="scss" scoped>


.surebets-container {
  display: flex;
  height: 100vh; /* Altura fixa para garantir scroll */
  overflow-y: auto; /* Habilita scroll vertical na página */
  overflow-x: hidden; /* Previne overflow horizontal */
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  width: 100%; /* Garante que o container ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Scrollbar personalizada para o container principal */
.surebets-container::-webkit-scrollbar {
  width: 8px;
}

.surebets-container::-webkit-scrollbar-track {
  background: transparent;
}

.surebets-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.surebets-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Removido estilos globais que causavam conflito */

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: visible; /* Permite overflow para o scroll funcionar */
  
  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  
  .sidebar.collapsed & {
    justify-content: center;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .logo-icon {
    font-size: 24px;
  }
  
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-overlay);
  border: none;
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  flex-shrink: 0;
  
  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.user-profile {
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  
  .sidebar.collapsed & {
    padding: 20px 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &:hover {
    background: var(--accent-primary);
    color: var(--bg-primary);
    justify-content: center;
    align-items: center;
    display: flex;
  }
  
  .sidebar.collapsed & {
    margin: 0 auto;
  }
}

.user-details {
  flex: 1;
}

.user-greeting {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  .sidebar.collapsed & {
    justify-content: center;
    padding: 12px 10px;
  }
}

.nav-item.active .nav-link {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.glossary-btn,
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

.logout-btn {
  margin-top: 20px;
  
  &:hover {
    background: rgba(255, 68, 68, 0.1);
    color: #ff4444;
  }
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* Previne apenas overflow horizontal */
  width: 100%; /* Garante que o conteúdo ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  min-height: 0; /* Permite que o conteúdo cresça além da altura do container */
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
  width: 100%; /* Garante que o header ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  overflow: visible; /* Permite overflow para o scroll funcionar */
}

.header-left {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.search-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: rgba(45, 45, 45, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  min-height: 36px;
  min-width: 100px;
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 1px solid #404040;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
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
    background: linear-gradient(135deg, #404040 0%, #2d2d2d 100%);
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 255, 136, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &.active {
    background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
    color: #1a1a1a;
    border-color: #00ff88;
    box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(0, 255, 136, 0.4);
    }
  }
  
  &.pinned-indicator {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
    color: #ffffff;
    border-color: #ff6b6b;
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    animation: pinGlow 2s ease-in-out infinite;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &:hover {
      background: linear-gradient(135deg, #ff4757 0%, #ff6b6b 100%);
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(255, 107, 107, 0.4);
    }
    
    .control-icon {
      color: #ffffff;
      stroke-width: 2;
    }
  }
}



.control-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.search-indicator {
  font-size: 14px;
  animation: spin 2s linear infinite;
  margin-left: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 255, 136, 0.3));
}



.filter-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  margin-left: 8px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  animation: bounce 1s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.filter-toggle-btn {
  position: relative;
}

.filters {
  padding: 20px 32px;
  border-bottom: 1px solid #404040;
  width: 100%; /* Garante que os filtros ocupem toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  overflow: hidden; /* Previne overflow */
}

 .filter-tabs {
   display: flex;
   gap: 8px;
   margin-bottom: 12px;
 }
 
 .games-found-info {
   margin-bottom: 20px;
 }
 
 .games-count {
   font-size: 14px;
   color: #b0b0b0;
   font-weight: 500;
   padding: 8px 0;
   border-bottom: 1px solid #404040;
 }



.advanced-filters {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
}

.filter-select-container {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
  }
  
  option {
    background: #2d2d2d;
    color: #ffffff;
    padding: 8px;
    
    &:checked {
      background: #00ff88;
      color: #1a1a1a;
    }
  }
}

.clear-filters-btn {
  padding: 8px 16px;
  background: #404040;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: #505050;
  }
}

.filter-tab {
  padding: 8px 16px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #b0b0b0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: #404040;
    color: #ffffff;
  }
  
  &.active {
    background: #00ff88;
    color: #1a1a1a;
    border-color: #00ff88;
  }
  
  &.disabled-tab {
    cursor: not-allowed;
    opacity: 0.6;
    background: #1a1a1a;
    border-color: #333;
    color: #666;
    
    &:hover {
      background: #1a1a1a;
      color: #666;
    }
    
    .coming-soon-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff6b35;
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.surebets-list {
  flex: 1;
  padding: 24px 32px;
  overflow: visible; /* Permite que o conteúdo cresça */
  width: 100%; /* Garante que o container ocupe toda a largura disponível */
  min-height: 0; /* Permite que o conteúdo cresça além da altura do container */
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #b0b0b0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #404040;
  border-top: 3px solid #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #b0b0b0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.animated-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  padding: 40px 20px;
}



/* Mensagem principal */
.main-message {
  position: relative;
  margin-bottom: 30px;
  z-index: 2;
}

.animated-text {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(45deg, #00ff88, #00cc6a, #00ff88);
  background-size: 200% 200%;
  -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    background-clip: text;
  }

.pulse-dot {
  position: absolute;
  top: 50%;
  right: -30px;
  width: 12px;
  height: 12px;
  background: #00ff88;
  border-radius: 50%;
  transform: translateY(-50%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
  50% { opacity: 0.5; transform: translateY(-50%) scale(1.2); }
}

/* Texto com efeito de digitação */
.typing-text {
  font-size: 18px;
  color: #b0b0b0;
  margin: 20px 0;
  position: relative;
  z-index: 2;
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #00ff88; }
}

/* Indicador de busca */
.search-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 30px 0;
  z-index: 2;
  position: relative;
  
  .search-text {
    font-size: 14px;
    color: #808080;
    font-weight: 500;
    animation: none !important; /* Força a remoção de qualquer animação */
  }
}

.search-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}



/* Estatísticas */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  z-index: 2;
  position: relative;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(45, 45, 45, 0.8);
  border-radius: 12px;
  border: 1px solid #404040;
  min-width: 120px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #00ff88;
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.2);
  }
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 8px;
  animation: numberCount 2s ease-out;
}

@keyframes numberCount {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-label {
  font-size: 12px;
  color: #b0b0b0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.surebets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px; /* Aumentado gap para melhor espaçamento entre os cards */
  max-width: 100%;
  width: 100%; /* Garante que o grid ocupe toda a largura disponível */
  overflow: hidden; /* Previne overflow */
  
  /* Adiciona margin-top aos primeiros cards para evitar que o efeito hover seja cortado */
  > *:nth-child(-n+4) {
    margin-top: 8px;
  }
}

/* Seção de Cards Fixos */
.pinned-cards-section {
  margin-top: 24px; /* Adiciona margin-top para evitar sobreposição com outras informações */
  padding: 24px 32px;
  padding-top: 40px; /* Aumentado padding-top para dar mais espaço */
  padding-bottom: 32px; /* Adicionado padding-bottom para melhor espaçamento */
  border-bottom: 2px solid #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 107, 107, 0.02) 100%);
  position: relative;
  width: 100%; /* Garante que a seção ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  overflow: visible; /* Mudado para visible para permitir efeitos hover */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
          height: 2px;
      background: linear-gradient(90deg, #ff6b6b, #ff4757, #ff6b6b);
    }
  }

.pinned-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px; /* Aumentado margin-bottom para mais espaço */
  padding: 20px 24px; /* Aumentado padding para mais espaço interno */
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.1); /* Adicionado sombra sutil */
}

.pinned-title {
  display: flex;
  align-items: center;
  gap: 14px; /* Aumentado gap para mais espaço entre ícone e texto */
  font-size: 22px; /* Aumentado tamanho da fonte */
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  transition: all 0.3s ease;
  
  .pin-icon {
    color: #ff6b6b;
    stroke-width: 2;
    animation: pinFloat 2s ease-in-out infinite;
    flex-shrink: 0; /* Previne que o ícone seja comprimido */
  }
  
  &.limit-reached {
    color: #ff6b6b;
    
    .pin-icon {
      color: #ff4757;
      animation: pinGlow 1.5s ease-in-out infinite;
    }
  }
  
  .limit-indicator {
    font-size: 16px;
    margin-left: 8px;
    animation: pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }
}

@keyframes pinFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes pinGlow {
  0%, 100% { 
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
  }
  50% { 
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.6);
  }
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.clear-pinned-btn {
  display: flex;
  align-items: center;
  gap: 10px; /* Aumentado gap para mais espaço */
  padding: 10px 18px; /* Aumentado padding para botão maior */
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 8px;
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
    transform: translateY(-2px); /* Aumentado efeito hover */
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3); /* Adicionado sombra no hover */
  }
  
  .clear-icon {
    font-size: 16px;
    flex-shrink: 0; /* Previne que o ícone seja comprimido */
  }
}

.pinned-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px; /* Reduzido gap para dar mais espaço ao conteúdo dos cards */
  max-width: 100%;
  width: 100%; /* Garante que o grid ocupe toda a largura disponível */
  overflow: hidden; /* Previne overflow */
  padding: 8px 16px; /* Adiciona padding vertical e horizontal para evitar corte dos efeitos hover e informações */
}

/* Responsividade para diferentes tamanhos de tela */
@media (max-width: 1400px) {
  .surebets-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .pinned-cards-grid {
    grid-template-columns: repeat(3, 1fr); /* Mantém 3 colunas para cards fixos */
  }
}

@media (max-width: 1100px) {
  .surebets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pinned-cards-grid {
    grid-template-columns: repeat(2, 1fr); /* Reduz para 2 colunas para evitar corte de informações */
    gap: 16px; /* Reduzido gap para dar mais espaço ao conteúdo */
  }
}

/* Ajuste específico para quando a sidebar está expandida */
.sidebar:not(.collapsed) ~ .main-content .surebets-grid {
  grid-template-columns: repeat(3, 1fr); /* Reduz para 3 colunas quando sidebar está expandida */
}

@media (max-width: 1200px) {
  .sidebar:not(.collapsed) ~ .main-content .surebets-grid {
    grid-template-columns: repeat(2, 1fr); /* Reduz para 2 colunas em telas menores com sidebar expandida */
  }
}

/* Ajuste específico para quando a sidebar está colapsada - permite 4 colunas */
.sidebar.collapsed ~ .main-content .surebets-grid {
  grid-template-columns: repeat(4, 1fr); /* Mantém 4 colunas quando sidebar está colapsada */
}

@media (max-width: 900px) {
  .pinned-cards-grid {
    grid-template-columns: repeat(2, 1fr); /* Mantém 2 colunas em telas médias */
    gap: 14px; /* Reduzido gap para dar mais espaço ao conteúdo */
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.open {
      left: 0;
    }
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .surebets-grid {
    grid-template-columns: 1fr;
    gap: 16px; /* Reduzido gap em mobile */
  }
  .pinned-cards-grid {
    grid-template-columns: 1fr; /* Reduz para 1 coluna em mobile para evitar corte de informações */
    gap: 16px; /* Aumentado gap em mobile para melhor espaçamento */
  }
  
  .pinned-cards-section {
    margin-top: 16px; /* Adiciona margin-top para mobile */
    padding: 16px 20px;
    padding-top: 24px; /* Reduzido padding-top em mobile */
    padding-bottom: 24px; /* Reduzido padding-bottom em mobile */
  }
  
  .pinned-cards-grid {
    padding: 8px 12px; /* Reduzido padding horizontal em mobile */
  }
  
  .pinned-header {
    flex-direction: column;
    gap: 16px; /* Aumentado gap em mobile */
    align-items: flex-start;
    padding: 16px 20px; /* Reduzido padding em mobile */
  }
  
  .pinned-title {
    font-size: 20px; /* Reduzido tamanho da fonte em mobile */
    gap: 12px; /* Reduzido gap em mobile */
    
    .limit-indicator {
      font-size: 14px; /* Reduzido tamanho em mobile */
      margin-left: 6px; /* Reduzido margin em mobile */
    }
  }
  
  .pinned-controls {
    gap: 12px; /* Reduzido gap em mobile */
  }
  
  .clear-pinned-btn {
    padding: 8px 14px; /* Reduzido padding em mobile */
    font-size: 13px; /* Reduzido tamanho da fonte em mobile */
  }
  
  .drag-mode-btn {
    padding: 8px 12px; /* Reduzido padding em mobile */
    font-size: 13px; /* Reduzido tamanho da fonte em mobile */
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .search-controls {
    width: 100%;
    justify-content: space-between;
  }
}

/* Overlay de Filtros */
.filter-overlay {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: #2a2a2a;
  border-left: 1px solid #404040;
  z-index: 1000;
  transition: right 0.3s ease;
  overflow: hidden; /* Remove scroll horizontal */
  
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
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #404040;
  }
}

.filter-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* Adiciona scroll único para todo o conteúdo */
  overflow-x: hidden; /* Remove scroll horizontal */
  position: relative;
  z-index: 1;
}

.filter-category {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.filter-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #404040;
  
  h4 {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.filter-section {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.filter-divider {
  height: 1px;
  background: #404040;
  margin: 20px 0;
  opacity: 0.6;
  position: relative;
  z-index: 1;
}

.filter-section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.filter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.default-indicator {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  color: #00ff88;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 136, 0.1);
  }
}



/* Filtro de Data */
.date-filter {
  .date-select {
    width: 100%;
    padding: 10px 12px;
    background: #2d2d2d;
    border: 1px solid #404040;
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #00ff88;
    }
    
    option {
      background: #2d2d2d;
      color: #ffffff;
    }
  }
  
  .date-help {
    font-size: 12px;
    color: #808080;
    margin-top: 6px;
    margin-bottom: 0;
  }
}

/* Filtro de Lucro */
.profit-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profit-input {
  flex: 1;
  padding: 10px 12px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
  }
  
  &::placeholder {
    color: #808080;
  }
}

.profit-separator {
  color: #808080;
  font-size: 14px;
}

/* Campo de pesquisa para casas de apostas */
.search-field-container {
  position: relative;
  margin-bottom: 12px;
}

.house-search-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #404040;
  border-radius: 6px;
  background: #2a2a2a;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #808080;
  }
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    background: #333333;
  }
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #808080;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.search-results-info {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 4px;
  border-left: 3px solid #00ff88;
}

.search-results-text {
  font-size: 12px;
  color: #00ff88;
  font-weight: 500;
}

/* Grids de Checkboxes */
.houses-grid,
.sports-grid,
.currencies-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: none; /* Remove altura máxima para permitir scroll único */
  overflow: visible; /* Remove scroll interno para evitar conflito */
  overflow-x: hidden; /* Remove scroll horizontal */
  padding-right: 8px;
  position: relative;
  z-index: 1;
  margin-bottom: 10px; /* Espaçamento adicional */
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #00ff88;
  cursor: pointer;
}

.checkbox-label {
  font-size: 13px;
  color: #ffffff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer dos Filtros */
.filter-footer {
  padding: 20px;
  border-top: 1px solid #404040;
  display: flex;
  gap: 12px;
}

 .clear-btn,
 .apply-btn {
   flex: 1;
   padding: 12px 16px;
   border: none;
   border-radius: 6px;
   font-size: 14px;
   font-weight: 500;
   cursor: pointer;
   transition: all 0.3s ease;
 }

.clear-btn {
  background: #404040;
  color: #ffffff;
  
  &:hover {
    background: #505050;
  }
}

 .apply-btn {
   background: #00ff88;
   color: #1a1a1a;
   
   &:hover {
     background: #00cc6a;
   }
 }
 
 /* Modais */
 .modal-overlay {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.8);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 10000;
   backdrop-filter: blur(5px);
 }
 
 .modal-content {
   background: #2a2a2a;
   border-radius: 12px;
   border: 1px solid #404040;
   max-width: 500px;
   width: 90%;
   max-height: 80vh;
   overflow: hidden;
   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
 }
 
 .saved-filters-modal {
   max-width: 600px;
 }
 
 .modal-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 20px;
   border-bottom: 1px solid #404040;
   
   h3 {
     font-size: 18px;
     font-weight: 700;
     color: #ffffff;
     margin: 0;
   }
 }
 
 .modal-body {
  padding: 20px;
  max-height: 400px;
  overflow: visible; /* Remove scroll interno para evitar conflito */
}
 
 .modal-footer {
   display: flex;
   gap: 12px;
   padding: 20px;
   border-top: 1px solid #404040;
 }
 
 .form-group {
   margin-bottom: 20px;
   
   label {
     display: block;
     font-size: 14px;
     font-weight: 500;
     color: #b0b0b0;
     margin-bottom: 8px;
   }
 }
 
 .filter-name-input {
   width: 100%;
   padding: 12px;
   background: #2d2d2d;
   border: 1px solid #404040;
   border-radius: 6px;
   color: #ffffff;
   font-size: 14px;
   
   &:focus {
     outline: none;
     border-color: #00ff88;
   }
   
   &::placeholder {
     color: #808080;
   }
 }
 
 .filter-preview {
   background: rgba(45, 45, 45, 0.5);
   border: 1px solid #404040;
   border-radius: 8px;
   padding: 16px;
   
   h4 {
     font-size: 14px;
     font-weight: 600;
     color: #ffffff;
     margin: 0 0 12px 0;
   }
 }
 
 .preview-item {
   font-size: 13px;
   color: #b0b0b0;
   margin-bottom: 6px;
   
   strong {
     color: #ffffff;
   }
 }
 
 .cancel-btn,
 .save-btn {
   flex: 1;
   padding: 12px 16px;
   border: none;
   border-radius: 6px;
   font-size: 14px;
   font-weight: 500;
   cursor: pointer;
   transition: all 0.3s ease;
 }
 
 .cancel-btn {
   background: #404040;
   color: #ffffff;
   
   &:hover {
     background: #505050;
   }
 }
 
 .save-btn {
   background: #00ff88;
   color: #1a1a1a;
   
   &:hover {
     background: #00cc6a;
   }
   
   &:disabled {
     background: #404040;
     color: #808080;
     cursor: not-allowed;
   }
 }
 
 .empty-filters {
   text-align: center;
   color: #b0b0b0;
   
   p {
     margin: 8px 0;
     font-size: 14px;
   }
 }
 
 .saved-filters-list {
   display: flex;
   flex-direction: column;
   gap: 12px;
 }
 
 .saved-filter-item {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 16px;
   background: rgba(45, 45, 45, 0.5);
   border: 1px solid #404040;
   border-radius: 8px;
   transition: all 0.3s ease;
   
   &:hover {
     border-color: #00ff88;
     background: rgba(45, 45, 45, 0.8);
   }
 }
 
 .filter-info {
   flex: 1;
   
   h4 {
     font-size: 16px;
     font-weight: 600;
     color: #ffffff;
     margin: 0 0 8px 0;
   }
 }
 
 .filter-details {
   display: flex;
   flex-wrap: wrap;
   gap: 8px;
 }
 
 .detail-item {
   font-size: 12px;
   color: #b0b0b0;
   background: rgba(255, 255, 255, 0.1);
   padding: 4px 8px;
   border-radius: 12px;
 }
 
 .filter-actions {
   display: flex;
   gap: 12px;
 }
 
 .load-btn,
 .delete-btn {
   padding: 8px 12px;
   border: none;
   border-radius: 4px;
   font-size: 12px;
   font-weight: 500;
   cursor: pointer;
   transition: all 0.3s ease;
 }
 
 .load-btn {
   background: #00ff88;
   color: #1a1a1a;
   
   &:hover {
     background: #00cc6a;
   }
 }
 
 .delete-btn {
   background: #dc3545;
   color: #ffffff;
   
   &:hover {
     background: #c82333;
   }
 }



/* Connection Status Bar */
.connection-status-bar {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  padding: 8px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  
  &.connected {
    background: rgba(0, 255, 136, 0.1);
    border-color: rgba(0, 255, 136, 0.3);
  }
  
  &.polling {
    background: rgba(255, 193, 7, 0.1);
    border-color: rgba(255, 193, 7, 0.3);
  }
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff6b6b;
  animation: pulse 2s infinite;
  
  .status-item.connected & {
    background: #00ff88;
  }
  
  .status-item.polling & {
    background: #ffc107;
  }
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  
  .status-item.connected & {
    color: #00ff88;
  }
  
  .status-item.polling & {
    color: #ffc107;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Grid de Mercados Direto */
.markets-direct-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: none; /* Remove altura máxima para permitir scroll único */
  overflow: visible; /* Remove scroll interno para permitir scroll único */
  overflow-x: hidden;
  padding-right: 8px;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}

.market-option {
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(45, 45, 45, 0.2);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.market-option:hover {
  background: rgba(45, 45, 45, 0.4);
  border-color: #404040;
}

.market-option .checkbox-label {
  font-size: 12px;
  line-height: 1.3;
}

/* Filtros de Data */
.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.date-filter-label {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.date-filter-input {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 0.9em;
  min-width: 150px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  &:hover {
    border-color: var(--accent-primary);
  }

  // Estilizar o calendário no Chrome/Safari
  &::-webkit-calendar-picker-indicator {
    background-color: var(--accent-primary);
    border-radius: 3px;
    cursor: pointer;
    filter: invert(1);
  }
}

.clear-date-btn {
  padding: 6px 10px;
  border: 2px solid #ff4757;
  background: transparent;
  color: #ff4757;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  font-weight: bold;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ff4757;
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Estilos para Drag and Drop */
.pinned-controls {
  display: flex;
  align-items: center;
  gap: 16px; /* Aumentado gap entre os controles */
}

  .drag-mode-btn {
    padding: 10px 14px; /* Aumentado padding para botão maior */
    border: 2px solid var(--accent-primary);
    background: transparent;
    color: var(--accent-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    position: relative;
    
    &:hover {
      background: var(--accent-primary);
      color: var(--bg-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    }
    
    &.active {
      background: var(--accent-primary);
      color: var(--bg-primary);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    .drag-hint {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      animation: fadeInHint 0.5s ease forwards;
      pointer-events: none;
      
      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.8);
      }
    }
  }

.pinned-cards-grid.drag-mode {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.pinned-card-wrapper {
  transition: all 0.3s ease;
  cursor: default;
  margin: 8px 0; /* Adiciona margin vertical para evitar corte dos efeitos */
  padding: 4px; /* Adiciona padding interno para dar espaço aos efeitos hover */
  
  &.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
    z-index: 1000;
  }
  
  &.drag-over {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
  }
}

  .pinned-card-wrapper[draggable="true"] {
    cursor: grab;
    position: relative;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      cursor: grabbing;
    }
    
    .drag-indicator {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--accent-primary);
      color: var(--bg-primary);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 10;
      animation: pulseDrag 2s ease-in-out infinite;
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
    }
  }

/* Animações para indicadores de drag */
@keyframes fadeInHint {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulseDrag {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

</style>

