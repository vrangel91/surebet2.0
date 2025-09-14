<template>
  <div
    class="surebets-container"
    :class="{ 'sidebar-collapsed': sidebarCollapsed }"
  >
    <!-- Sidebar Reutilizável -->
    <Sidebar
      :sidebarCollapsed="sidebarCollapsed"
      @toggle-sidebar="handleSidebarToggle"
      @sidebar-state-loaded="handleSidebarStateLoaded"
    />

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header Global -->

      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Surebets</h2>
          <p class="page-subtitle">
            Encontre as melhores oportunidades de arbitragem
          </p>
        </div>
      </header>

      <!-- Filtros Simples -->
      <div class="filters">
        <!-- Controles de Busca -->
        <div class="search-controls">
          <button
            class="control-btn"
            :class="{ active: isSearching }"
            @click="toggleSearch"
          >
            <span class="control-text">{{
              isSearching ? "Pausar" : "Retomar"
            }}</span>
          </button>

          <button
            class="control-btn"
            :class="{ active: soundEnabled }"
            @click="toggleSound"
          >
            <span class="control-text">{{
              soundEnabled ? "Som On" : "Som Off"
            }}</span>
          </button>

          <button
            class="control-btn refresh-btn"
            @click="manualRefresh"
            :disabled="loading"
          >
            <span class="control-text">
              <span v-if="!loading">Atualizar</span>
              <span v-else>⏳ Carregando...</span>
            </span>
          </button>

          <button
            class="control-btn filter-toggle-btn"
            @click="toggleFilterOverlay"
          >
            <span class="control-text">Filtros</span>
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

        <div class="filter-tabs">
          <button
            class="filter-tab"
            :class="{ active: activeFilter === 'prelive' }"
            @click="setFilter('prelive')"
          >
            Pré-live ({{ preliveCount }})
          </button>
          <button
            class="filter-tab live-tab-locked"
            :class="{ active: activeFilter === 'live' }"
            @click="showLiveRestrictedMessage"
            title="Acesso restrito - Funcionalidade em manutenção"
          >
            <svg
              class="lock-icon"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
              />
            </svg>
            Live ({{ liveCount }})
          </button>

          <!-- Filtros de Data -->
          <div class="date-filters">
            <label class="date-filter-label">Data:</label>
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

          <!-- Campo de busca unificado -->
          <div class="search-input-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="unifiedSearchTerm"
              type="text"
              placeholder="Pesquisar por mercado, casa de apostas ou campeonato..."
              class="unified-search-input"
              @input="onUnifiedSearchInput"
              @focus="showSearchSuggestions = true"
              @blur="hideSearchSuggestions"
            />

            <!-- Indicador de tipo de busca ativa -->
            <div v-if="activeSearchType" class="search-type-indicator">
              <span class="search-type-badge" :class="activeSearchType">
                {{ getSearchTypeLabel(activeSearchType) }}
              </span>
            </div>

            <!-- Sugestões de busca -->
            <div
              v-if="showSearchSuggestions && searchSuggestions.length > 0"
              class="search-suggestions"
            >
              <div
                v-for="(suggestion, index) in searchSuggestions.slice(0, 8)"
                :key="index"
                class="suggestion-item"
                :class="{ active: selectedSuggestionIndex === index }"
                @click="selectSuggestion(suggestion)"
                @mouseenter="selectedSuggestionIndex = index"
              >
                <span class="suggestion-type">{{ suggestion.type }}</span>
                <span class="suggestion-text">{{ suggestion.text }}</span>
              </div>
            </div>

            <button
              v-if="unifiedSearchTerm"
              @click="clearUnifiedSearch"
              class="clear-search-btn"
              title="Limpar pesquisa"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Total de surebets encontrados -->
        <div class="games-found-info">
          <div class="surebets-count">
            Mostrando {{ paginatedSurebets.length }} de
            {{ filteredSurebetsByMarket.length }} surebets
            <span v-if="hasMoreItems" class="more-available">
              ({{ remainingItemsCount }} restantes)
            </span>
          </div>
        </div>

        <!-- Indicador de resultados da pesquisa unificada -->
        <div v-if="unifiedSearchTerm" class="unified-search-results-info">
          <span class="search-results-text">
            {{ filteredSurebetsByUnifiedSearch.length }} de
            {{ filteredSurebets.length }} surebets encontradas
            <span v-if="activeSearchType" class="search-type-info">
              (filtrado por
              {{ getSearchTypeLabel(activeSearchType).toLowerCase() }})
            </span>
          </span>
        </div>
      </div>

      <!-- Cards Fixos -->
      <div v-if="pinnedCards.length > 0" class="pinned-cards-section">
        <div class="pinned-header">
          <h3
            class="pinned-title"
            :class="{ 'limit-reached': pinnedCards.length >= 3 }"
          >
            <MapPin class="pin-icon" size="18" />
            Cards Fixos ({{ pinnedCards.length }}/3)
            <span
              v-if="pinnedCards.length >= 3"
              class="limit-indicator"
              title="Limite máximo atingido"
              >⚠️</span
            >
          </h3>
          <div class="pinned-controls">
            <button
              class="control-btn drag-mode-btn"
              :class="{ active: dragMode }"
              @click="toggleDragMode"
              title="Modo de arrastar"
            >
              <span class="control-text">{{ dragMode ? "🔒" : "✋" }}</span>
              <span v-if="dragMode" class="drag-hint"
                >Arraste para reorganizar</span
              >
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
              dragging: draggedIndex === index,
              'drag-over': dragOverIndex === index && draggedIndex !== index,
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
              :bookmaker-accounts="bookmakerAccounts"
              :is-loading-accounts="isLoadingAccounts"
              @add-to-reports="addSurebetToReports"
              @toggle-pin="togglePinCard"
              @balance-debited="handleBalanceDebited"
              @refresh-accounts="loadBookmakerAccounts"
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

        <div
          v-else-if="filteredSurebetsByMarket.length === 0"
          class="empty-state"
        >
          <div class="animated-container">
            <!-- Mensagem principal animada -->
            <div class="main-message">
              <h2 class="animated-text">Nenhum Surebet Disponível</h2>
              <div class="pulse-dot"></div>
            </div>

            <!-- Submensagem com efeito de digitação -->
            <p class="typing-text">
              Aguardando novas oportunidades de arbitragem...
            </p>

            <!-- Estatísticas animadas -->
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-number" :data-target="lastCheckCount">
                  {{ lastCheckCount }}
                </div>
                <div class="stat-label">Verificações</div>
              </div>
              <div class="stat-item">
                <div class="stat-number" :data-target="uptimeMinutes">
                  {{ uptimeMinutes }}
                </div>
                <div class="stat-label">Minutos Online</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="surebets-grid">
          <SurebetCard
            v-for="(surebet, index) in paginatedSurebets"
            :key="index"
            :surebet="surebet"
            :isPinned="isPinned(surebet)"
            :bookmaker-accounts="bookmakerAccounts"
            :is-loading-accounts="isLoadingAccounts"
            @add-to-reports="addSurebetToReports"
            @toggle-pin="togglePinCard"
            @balance-debited="handleBalanceDebited"
            @refresh-accounts="loadBookmakerAccounts"
          />
        </div>

        <!-- Botão "Ver mais" para paginação -->
        <div v-if="hasMoreItems" class="load-more-container">
          <button
            @click="loadMoreCards"
            :disabled="isLoadingMore"
            class="load-more-btn"
            :class="{ loading: isLoadingMore }"
          >
            <span v-if="!isLoadingMore">
              Ver mais ({{ remainingItemsCount }} restantes)
            </span>
            <span v-else class="loading-content">
              <div class="spinner"></div>
              Carregando...
            </span>
          </button>
        </div>
      </div>
    </main>

    <!-- Áudio para Notificações -->
    <audio ref="notificationSound" preload="auto" crossorigin="anonymous">
      <source
        src="https://zerolossbet.com/static/bbfiles/new.mp3"
        type="audio/mpeg"
      />
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
              <span v-if="isUsingDefaultProfitFilters" class="default-indicator"
                >Padrão</span
              >
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

          <!-- Filtro por Nível de Risco -->
          <div class="filter-section">
            <div class="filter-section-header">
              <label class="filter-section-label">Nível de Risco</label>
            </div>
            <div class="risk-level-filters">
              <button
                class="risk-filter-btn"
                :class="{ active: selectedRiskLevel === 'conservador' }"
                @click="setRiskLevel('conservador')"
              >
                <div class="risk-content">
                  <span class="risk-indicator conservative"></span>
                  <h4 class="risk-title">Conservador</h4>
                  <span class="risk-description">≤ 30 pontos</span>
                </div>
              </button>
              <button
                class="risk-filter-btn"
                :class="{ active: selectedRiskLevel === 'moderado' }"
                @click="setRiskLevel('moderado')"
              >
                <div class="risk-content">
                  <span class="risk-indicator moderate"></span>
                  <h4 class="risk-title">Moderado</h4>
                  <span class="risk-description">31-50 pontos</span>
                </div>
              </button>
              <button
                class="risk-filter-btn"
                :class="{ active: selectedRiskLevel === 'arriscado' }"
                @click="setRiskLevel('arriscado')"
              >
                <div class="risk-content">
                  <span class="risk-indicator risky"></span>
                  <h4 class="risk-title">Arriscado</h4>
                  <span class="risk-description">> 50 pontos</span>
                </div>
              </button>
              <button
                class="risk-filter-btn"
                :class="{ active: selectedRiskLevel === 'todos' }"
                @click="setRiskLevel('todos')"
              >
                <div class="risk-content">
                  <span class="risk-indicator all"></span>
                  <h4 class="risk-title">Todos</h4>
                  <span class="risk-description">Sem filtro</span>
                </div>
              </button>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- Categoria: Casas de Aposta -->
          <div class="filter-category">
            <div class="filter-category-header">
              <h4>Casas de Aposta</h4>
              <div class="filter-actions">
                <button @click="selectAllHouses" class="action-btn">
                  Marcar Todos
                </button>
                <button @click="deselectAllHouses" class="action-btn">
                  Desmarcar Todos
                </button>
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
                {{ filteredHouses.length }} de
                {{ filterOptions.houses.length }} casas encontradas
              </span>
            </div>
          </div>

          <div class="filter-divider"></div>

          <!-- Categoria: Futebol -->
          <div class="filter-category">
            <div class="filter-category-header">
              <h4>Futebol</h4>
              <div class="filter-actions">
                <button @click="selectAllSports" class="action-btn">
                  Marcar Todos
                </button>
                <button @click="deselectAllSports" class="action-btn">
                  Desmarcar Todos
                </button>
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
                  <button @click="selectAllCurrencies" class="action-btn">
                    Marcar Todos
                  </button>
                  <button @click="deselectAllCurrencies" class="action-btn">
                    Desmarcar Todos
                  </button>
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
        </div>

        <div class="filter-footer">
          <button @click="clearFilters" class="clear-btn">
            Limpar Filtros
          </button>
          <button @click="applyFilters" class="apply-btn">Aplicar</button>
        </div>
      </div>
    </div>

    <!-- Modal para Salvar Filtro -->
    <div
      v-if="showSaveFilterModal && false"
      class="modal-overlay"
      @click="closeSaveFilterModal()"
    >
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
              <strong>Esportes:</strong>
              {{ selectedSports.length }} selecionados
            </div>
            <div class="preview-item">
              <strong>Moedas:</strong>
              {{ selectedCurrencies.length }} selecionadas
            </div>

            <div class="preview-item">
              <strong>Lucro:</strong> {{ minProfit }}% - {{ maxProfit }}%
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSaveFilterModal()" class="cancel-btn">
            Cancelar
          </button>
          <button
            @click="saveFilter()"
            class="save-btn"
            :disabled="!currentFilterName.trim()"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Listar Filtros Salvos -->
    <div
      v-if="showSavedFiltersModal"
      class="modal-overlay"
      @click="closeSavedFiltersModal()"
    >
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
                  <span class="detail-item"
                    >🏠 {{ filter.houses.length }} casas</span
                  >
                  <span class="detail-item"
                    >⚽ {{ filter.sports.length }} esportes</span
                  >
                  <span class="detail-item"
                    >💰 {{ filter.currencies.length }} moedas</span
                  >
                  <span class="detail-item"
                    >🎯
                    {{ filter.markets ? filter.markets.length : 0 }}
                    mercados</span
                  >
                </div>
              </div>
              <div class="filter-actions">
                <button @click="loadFilter(filter)" class="load-btn">
                  Carregar
                </button>
                <button @click="deleteFilter(index)" class="delete-btn">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SurebetCard from "../components/SurebetCard.vue";
import Sidebar from "../components/Sidebar.vue";

import { filterOptions } from "../config/filters.js";
import { getBookmakerUrl, addBookmakerUrl } from "../config/bookmakerUrls.js";
import marketTranslations from "../config/marketTranslations.json";
import { MapPin, Trash2 } from "lucide-vue-next";
import { http } from "../utils/http.js";
import { useAdaptivePolling } from "../utils/adaptivePolling.js";
import { useSmartCache } from "../utils/smartCache.js";
import { useRateLimiter } from "../utils/rateLimiter.js";
import { getTranslationsByCategory } from "../services/tournamentTranslationService.js";

// Desativar console.logs de forma silenciosa
const silentLog = () => {};
console.log = silentLog;

export default {
  name: "SurebetsView",
  components: {
    SurebetCard,
    Sidebar,

    MapPin,
    Trash2,
  },
  data() {
    return {
      surebets: {},
      isSearching: true,
      soundEnabled: true,
      activeFilter: "prelive",
      loading: true,
      ws: null,
      sidebarCollapsed: false,
      updateInterval: null,
      autoUpdateInterval: 300000, // Intervalo de atualização em milissegundos (padrão: 5 minutos)
      backgroundSearch: true, // Busca em segundo plano habilitada por padrão
      // Paginação
      itemsPerPage: 52, // Cards por página
      currentPage: 1, // Página atual
      isLoadingMore: false, // Estado de carregamento do "Ver mais"
      selectedHouses: [...filterOptions.houses], // Inicia com todas as casas selecionadas
      selectedSports: filterOptions.sports.map((sport) => sport.value), // Inicia com todos os esportes selecionados
      selectedCurrencies: filterOptions.currencies.map(
        (currency) => currency.code
      ), // Inicia com todas as moedas selecionadas
      selectedRiskLevel: "todos", // Filtro de nível de risco
      filterOptions: filterOptions,
      availableBookmakers: [], // Casas de apostas disponíveis da API
      bookmakerUrls: {}, // URLs das casas de apostas
      bookmakerAccounts: [], // Contas de Bookmaker Accounts
      isLoadingAccounts: false,
      showFilterOverlay: false,

      // Sistemas de otimização
      adaptivePolling: useAdaptivePolling(),
      smartCache: useSmartCache(),
      rateLimiter: useRateLimiter(),
      lastRequestTime: 0,
      requestLatency: 0,
      selectedDate: "",
      minProfit: 0,
      maxProfit: 1000,
      lastCheckCount: 0,
      startTime: Date.now(),
      uptimeMinutes: 0,

      websocketConnected: false,
      websocketRetryCount: 0,
      pollingInterval: null,

      // Debounce para evitar chamadas excessivas
      debounceTimer: null,

      savedFilters: [], // Lista de filtros salvos do usuário
      showSavedFiltersModal: false,
      showSaveFilterModal: false,
      currentFilterName: "",
      // Cache para preservar filtros durante atualizações da API
      filtersCache: {
        selectedHouses: [],
        selectedSports: [],
        selectedCurrencies: [],
        selectedDate: "",
        activeFilter: "prelive",
        minProfit: 0,
        maxProfit: 1000,
        selectedRiskLevel: "todos",
        houseSearchTerm: "",
        marketSearchTerm: "",
      },
      // Termo de pesquisa para casas de apostas
      houseSearchTerm: "",
      // Termo de pesquisa para tipos de mercado
      marketSearchTerm: "",
      // Termo de pesquisa unificado
      unifiedSearchTerm: "",
      // Tipo de busca ativa
      activeSearchType: null,
      // Sugestões de busca
      searchSuggestions: [],
      showSearchSuggestions: false,
      selectedSuggestionIndex: -1,
      // Timestamp da última vez que o usuário desmarcou todos os filtros
      lastDeselectAllTime: 0,

      pinnedCards: [], // Array de cards fixos
      pinnedCardKeys: new Set(), // Set para verificar se um card está fixo
      // Propriedades para drag and drop
      dragMode: false, // Modo de arrastar ativo/inativo
      draggedIndex: null, // Índice do card sendo arrastado
      dragOverIndex: null, // Índice onde o card está sendo arrastado sobre
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser;
    },
    // Casas de apostas filtradas pela pesquisa
    filteredHouses() {
      if (!this.houseSearchTerm.trim()) {
        return this.filterOptions.houses;
      }

      const searchTerm = this.houseSearchTerm.toLowerCase().trim();
      return this.filterOptions.houses.filter((house) =>
        house.toLowerCase().includes(searchTerm)
      );
    },
    isAdmin() {
      return this.$store.getters.isAdmin;
    },

    totalSurebets() {
      return this.surebets ? Object.keys(this.surebets).length : 0;
    },
    preliveCount() {
      return this.surebets
        ? Object.values(this.surebets).filter((surebet) => {
            const firstBet = surebet[0];
            // Pre-match: isLive = false (ignora campo minutes)
            return !firstBet?.isLive;
          }).length
        : 0;
    },
    liveCount() {
      return this.surebets
        ? Object.values(this.surebets).filter((surebet) => {
            const firstBet = surebet[0];
            // Live: isLive = true
            return firstBet?.isLive === true;
          }).length
        : 0;
    },
    filteredSurebets() {
      // Função robusta para extrair dados de surebets
      const extractSurebetsData = (surebets) => {
        if (!surebets || typeof surebets !== "object") {
          return [];
        }

        // Se já é um array, retornar diretamente
        if (Array.isArray(surebets)) {
          return surebets;
        }

        // Tentar extrair valores do objeto
        try {
          const values = Object.values(surebets);
          if (values.length > 0) {
            return values;
          }
        } catch (error) {
          console.warn("Erro ao extrair valores do objeto surebets:", error);
        }

        // Tentar converter para objeto normal se for um Proxy
        try {
          const normalObject = JSON.parse(JSON.stringify(surebets));
          if (normalObject && typeof normalObject === "object") {
            const values = Object.values(normalObject);
            if (values.length > 0) {
              console.log("✅ Dados extraídos via conversão JSON");
              return values;
            }
          }
        } catch (error) {
          console.warn("Erro ao converter surebets para objeto normal:", error);
        }

        // Se chegou até aqui, retornar array vazio
        return [];
      };

      let surebetsArray = extractSurebetsData(this.surebets);

      // Log apenas se houver problema
      if (surebetsArray.length === 0 && this.surebets) {
        console.warn("⚠️ AVISO: Nenhum dado de surebets encontrado");
      }

      // REMOÇÃO DE DUPLICATAS - Remove surebets com dados 100% idênticos
      const uniqueSurebets = [];
      const seenKeys = new Set();
      let duplicatesRemoved = 0;

      surebetsArray.forEach((surebet) => {
        if (!surebet || surebet.length === 0) return;

        // Validação adicional para evitar erros
        if (!Array.isArray(surebet)) {
          console.warn("⚠️ Surebet não é um array:", surebet);
          return;
        }

        // Cria uma chave única baseada em campos que identificam o surebet
        const key = this.createSurebetKey(surebet);

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueSurebets.push(surebet);
        } else {
          duplicatesRemoved++;
          console.log("🔄 Surebet duplicado removido:", key);
        }
      });

      surebetsArray = uniqueSurebets;

      if (duplicatesRemoved > 0) {
        console.log(
          `✅ Removidos ${duplicatesRemoved} surebet(s) duplicado(s)`
        );
        console.log(`📊 Total: ${surebetsArray.length} surebet(s) únicos`);
      }

      // Filtro por status (prelive/live) - usar APENAS o campo isLive
      switch (this.activeFilter) {
        case "prelive":
          surebetsArray = surebetsArray.filter((surebet) => {
            const firstBet = surebet[0];
            // Pre-match: isLive = false (ignora campo minutes)
            return !firstBet?.isLive;
          });
          break;
        case "live":
          surebetsArray = surebetsArray.filter((surebet) => {
            const firstBet = surebet[0];
            // Live: isLive = true
            return firstBet?.isLive === true;
          });
          break;
      }
      console.log("Após filtro status:", surebetsArray.length);

      // Filtro por data específica
      if (this.selectedDate) {
        console.log("📅 Aplicando filtro de data:", this.selectedDate);
        const beforeFilter = surebetsArray.length;

        surebetsArray = surebetsArray.filter((surebet) => {
          const firstBet = surebet[0];
          if (!firstBet?.date) return false;

          // Compara a data do surebet com a data selecionada
          const surebetDate = firstBet.date; // Formato: "2025-08-23"
          return surebetDate === this.selectedDate;
        });

        console.log(`Filtro data: ${beforeFilter} -> ${surebetsArray.length}`);
      }

      // Filtro por casas de aposta (vinculado ao campo "house" da API)
      if (this.selectedHouses.length !== this.filterOptions.houses.length) {
        console.log("🏠 Aplicando filtro de casas...");
        console.log("Casas selecionadas:", this.selectedHouses);

        const beforeFilter = surebetsArray.length;
        surebetsArray = surebetsArray.filter((surebet) => {
          // Extrai todas as casas únicas do surebet
          const surebetHouses = [
            ...new Set(surebet.map((bet) => bet.house).filter(Boolean)),
          ];

          // Se não há casas selecionadas, não exibe nenhum surebet
          if (this.selectedHouses.length === 0) {
            console.log("❌ Surebet rejeitado - nenhuma casa selecionada");
            return false;
          }

          // Conta quantas casas do surebet coincidem com as selecionadas
          const matchingHouses = surebetHouses.filter((house) =>
            this.selectedHouses.includes(house)
          );

          // Só exibe se pelo menos 2 casas coincidem
          const match = matchingHouses.length >= 2;

          if (!match) {
            console.log(
              "❌ Surebet rejeitado - casas do surebet:",
              surebetHouses,
              "casas coincidentes:",
              matchingHouses.length
            );
          } else {
            console.log(
              "✅ Surebet aceito - casas do surebet:",
              surebetHouses,
              "casas coincidentes:",
              matchingHouses
            );
          }

          return match;
        });
        console.log(`Filtro casas: ${beforeFilter} -> ${surebetsArray.length}`);
      }

      // Filtro por esportes (vinculado ao campo "sport" da API)
      if (this.selectedSports.length !== this.filterOptions.sports.length) {
        console.log("⚽ Aplicando filtro de esportes...");
        console.log("Esportes selecionados:", this.selectedSports);

        const beforeFilter = surebetsArray.length;
        surebetsArray = surebetsArray.filter((surebet) => {
          const surebetSport = surebet[0]?.sport;

          // Se não há esportes selecionados, não exibe nenhum surebet
          if (this.selectedSports.length === 0) {
            console.log("❌ Surebet rejeitado - nenhum esporte selecionado");
            return false;
          }

          // Verifica se o esporte do surebet está na lista selecionada
          const match =
            surebetSport && this.selectedSports.includes(surebetSport);

          if (!match) {
            console.log("❌ Surebet rejeitado - esporte:", surebetSport);
          } else {
            console.log("✅ Surebet aceito - esporte:", surebetSport);
          }

          return match;
        });
        console.log(
          `Filtro esportes: ${beforeFilter} -> ${surebetsArray.length}`
        );
      }

      // Filtro por moedas (vinculado ao campo "currency" da API)
      if (
        this.selectedCurrencies.length !== this.filterOptions.currencies.length
      ) {
        console.log("💰 Aplicando filtro de moedas...");
        console.log("Moedas selecionadas:", this.selectedCurrencies);

        const beforeFilter = surebetsArray.length;
        surebetsArray = surebetsArray.filter((surebet) => {
          const surebetCurrency = surebet[0]?.currency;

          // Se não há moedas selecionadas, não exibe nenhum surebet
          if (this.selectedCurrencies.length === 0) {
            console.log("❌ Surebet rejeitado - nenhuma moeda selecionada");
            return false;
          }

          // Verifica se a moeda do surebet está na lista selecionada
          const match =
            surebetCurrency &&
            this.selectedCurrencies.includes(surebetCurrency);

          if (!match) {
            console.log("❌ Surebet rejeitado - moeda:", surebetCurrency);
          } else {
            console.log("✅ Surebet aceito - moeda:", surebetCurrency);
          }

          return match;
        });
        console.log(
          `Filtro moedas: ${beforeFilter} -> ${surebetsArray.length}`
        );
      }

      // Filtro por faixa de lucro
      if (this.minProfit > 0 || this.maxProfit < 1000) {
        const beforeFilter = surebetsArray.length;
        surebetsArray = surebetsArray.filter((surebet) => {
          const profit = surebet[0]?.profit || 0;
          return profit >= this.minProfit && profit <= this.maxProfit;
        });
        console.log(`Filtro lucro: ${beforeFilter} -> ${surebetsArray.length}`);
      }

      // Filtro por nível de risco
      if (this.selectedRiskLevel !== "todos") {
        const beforeFilter = surebetsArray.length;
        surebetsArray = surebetsArray.filter((surebet) => {
          const riskLevel = this.calculateRiskLevel(surebet);
          return riskLevel === this.selectedRiskLevel;
        });
        console.log(
          `Filtro risco (${this.selectedRiskLevel}): ${beforeFilter} -> ${surebetsArray.length}`
        );
      }

      console.log("✅ Total final:", surebetsArray.length);
      console.log("---");
      return surebetsArray;
    },

    // Surebets filtradas por tipo de mercado
    filteredSurebetsByMarket() {
      if (!this.marketSearchTerm.trim()) {
        console.log(
          `🔍 filteredSurebetsByMarket: sem busca, retornando ${this.filteredSurebets.length} surebets`
        );
        return this.filteredSurebets;
      }

      const searchTerm = this.marketSearchTerm.toLowerCase().trim();
      const filtered = this.filteredSurebets.filter((surebet) => {
        if (!surebet || surebet.length === 0) return false;

        // Buscar no campo market de todas as apostas do surebet
        return surebet.some((bet) => {
          const market = bet.market || "";

          // Buscar no texto original
          if (market.toLowerCase().includes(searchTerm)) {
            return true;
          }

          // Buscar na tradução do mercado
          const translatedMarket = this.getMarketTranslation(market);
          if (
            translatedMarket &&
            translatedMarket.toLowerCase().includes(searchTerm)
          ) {
            return true;
          }

          return false;
        });
      });
      console.log(
        `🔍 filteredSurebetsByMarket: com busca "${searchTerm}", retornando ${filtered.length} de ${this.filteredSurebets.length} surebets`
      );
      return filtered;
    },

    // Surebets filtradas por busca unificada
    filteredSurebetsByUnifiedSearch() {
      if (!this.unifiedSearchTerm.trim()) {
        return this.filteredSurebets;
      }

      const searchTerm = this.unifiedSearchTerm.toLowerCase().trim();

      const filtered = this.filteredSurebets.filter((surebet) => {
        if (!surebet || surebet.length === 0) return false;

        return surebet.some((bet) => {
          // Buscar por mercado
          const market = bet.market || "";
          if (market.toLowerCase().includes(searchTerm)) return true;

          const translatedMarket = this.getMarketTranslation(market);
          if (
            translatedMarket &&
            translatedMarket.toLowerCase().includes(searchTerm)
          )
            return true;

          // Filtro por casa de aposta removido (não estava funcionando)

          // Buscar por campeonato
          const tournament = bet.tournament || "";
          if (tournament.toLowerCase().includes(searchTerm)) return true;

          // Buscar por esporte
          const sport = bet.sport || "";
          if (sport.toLowerCase().includes(searchTerm)) return true;

          return false;
        });
      });

      console.log(
        `🔍 filteredSurebetsByUnifiedSearch: com busca "${searchTerm}", retornando ${filtered.length} de ${this.filteredSurebets.length} surebets`
      );
      return filtered;
    },

    // Surebets paginadas para exibição
    paginatedSurebets() {
      const startIndex = 0;
      const endIndex = this.currentPage * this.itemsPerPage;
      const paginated = this.filteredSurebetsByUnifiedSearch.slice(
        startIndex,
        endIndex
      );
      console.log(
        `📄 Paginação: página ${this.currentPage}, mostrando ${paginated.length} de ${this.filteredSurebetsByUnifiedSearch.length} total`
      );
      return paginated;
    },

    // Verifica se há mais itens para carregar
    hasMoreItems() {
      return (
        this.paginatedSurebets.length <
        this.filteredSurebetsByUnifiedSearch.length
      );
    },

    // Contador de itens restantes
    remainingItemsCount() {
      return (
        this.filteredSurebetsByUnifiedSearch.length -
        this.paginatedSurebets.length
      );
    },

    isUsingDefaultProfitFilters() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.defaultFilters) {
            const defaultMin =
              settings.defaultFilters.minProfit !== undefined
                ? Number(settings.defaultFilters.minProfit)
                : 0;
            const defaultMax =
              settings.defaultFilters.maxProfit !== undefined
                ? Number(settings.defaultFilters.maxProfit)
                : 1000;
            return (
              this.minProfit === defaultMin && this.maxProfit === defaultMax
            );
          }
        }
      } catch (error) {
        console.warn("Erro ao verificar filtros padrão:", error);
      }
      return this.minProfit === 0 && this.maxProfit === 1000;
    },

    // Computed property para calcular o grid - sempre 3 cards por linha
    gridColumns() {
      // Sempre 3 cards por linha horizontal
      const baseColumns = 3;

      // Log para debug
      console.log("🎨 gridColumns computado:", {
        baseColumns: baseColumns,
        sidebarCollapsed: this.sidebarCollapsed,
      });

      // Retorna sempre 3 colunas para garantir layout consistente
      return baseColumns;
    },
  },
  watch: {
    // Reset paginação apenas quando necessário (removido para evitar desaparecimento dos cards)
    // selectedHouses() {
    //   this.resetPagination()
    // },
    // selectedSports() {
    //   this.resetPagination()
    // },
    // selectedCurrencies() {
    //   this.resetPagination()
    // },
    // marketSearchTerm() {
    //   this.resetPagination()
    // },
    // filteredSurebets() {
    //   this.resetPagination()
    // },

    // Monitorar mudanças nas configurações do localStorage
    "$store.state.settings": {
      handler() {
        this.loadDefaultFilters();
      },
      deep: true,
    },

    // Salvar filtros automaticamente quando mudarem
    selectedHouses() {
      this.saveFiltersToSettings();
    },

    selectedSports() {
      this.saveFiltersToSettings();
    },

    selectedCurrencies() {
      this.saveFiltersToSettings();
    },

    selectedDate() {
      this.saveFiltersToSettings();
    },

    activeFilter() {
      this.saveFiltersToSettings();
    },

    // Monitorar mudanças no gridColumns para atualizar variáveis CSS
    gridColumns() {
      this.updateGridCSSVariables();
    },

    // Monitorar mudanças no estado da sidebar para atualizar variáveis CSS
    sidebarCollapsed() {
      this.updateGridCSSVariables();
    },

    // Tocar som quando novos surebets chegam
    surebets: {
      handler(newSurebets, oldSurebets) {
        // Verificar se houve mudança nos dados e se não é a primeira carga
        if (oldSurebets && newSurebets && Object.keys(newSurebets).length > 0) {
          const oldCount = Object.keys(oldSurebets).length;
          const newCount = Object.keys(newSurebets).length;

          // Tocar som apenas se houve aumento no número de surebets ou mudança significativa
          if (
            newCount > oldCount ||
            this.hasSignificantDataChange(oldSurebets, newSurebets)
          ) {
            console.log("🔊 Novos surebets detectados - tocando som");
            this.playNotificationSound();
          }
        }
      },
      deep: true,
    },
  },

  mounted() {
    // DEBUG: Verificar estado inicial
    console.log(
      "🚀 MOUNTED: showSaveFilterModal inicial =",
      this.showSaveFilterModal
    );

    // Limpar estado dos modais
    this.clearModalState();

    // Carregar filtros padrão das configurações
    this.loadDefaultFilters();

    // Carregar configurações de busca automática
    this.loadAutoSearchSettings();

    // Carregar configurações de som
    this.loadSoundSettings();

    // Carregar contas de Bookmaker Accounts
    this.loadBookmakerAccounts();

    // Aplicar configurações de busca em segundo plano
    this.applyBackgroundSearchSettings();

    // Atualizar variáveis CSS do grid
    this.updateGridCSSVariables();

    // Inicializar adaptivePolling se não existir
    if (!this.adaptivePolling) {
      this.adaptivePolling = {
        retryCount: 0,
        maxRetries: 5,
        baseInterval: 30000,
        incrementRetryCount: function () {
          this.retryCount++;
        },
        resetRetryCount: function () {
          this.retryCount = 0;
        },
        getCurrentInterval: function () {
          return this.baseInterval + this.retryCount * 10000;
        },
        updateConnectionQuality: function () {
          // Implementação básica
        },
        getStats: function () {
          return {
            retryCount: this.retryCount,
            currentInterval: this.getCurrentInterval(),
          };
        },
      };
    }

    // Carregar filtros salvos das configurações (inicializa com todas as opções marcadas por padrão)
    this.loadFiltersFromSettings();

    console.log("🔍 Estado inicial da busca automática:");
    console.log("  - isSearching:", this.isSearching);
    console.log(
      "  - autoUpdateInterval:",
      this.autoUpdateInterval / 1000,
      "segundos"
    );
    console.log("  - backgroundSearch:", this.backgroundSearch);

    // Inicializar o cache dos filtros após carregar as configurações
    this.updateFiltersCache();
    console.log("📦 Cache de filtros inicializado");

    // DEBUG: Verificar estado dos filtros após inicialização
    console.log("🔍 DEBUG Estado dos filtros após inicialização:");
    console.log(
      "  - selectedHouses:",
      this.selectedHouses.length,
      "/",
      this.filterOptions.houses.length
    );
    console.log(
      "  - selectedSports:",
      this.selectedSports.length,
      "/",
      this.filterOptions.sports.length
    );
    console.log(
      "  - selectedCurrencies:",
      this.selectedCurrencies.length,
      "/",
      this.filterOptions.currencies.length
    );

    // Carregar filtros salvos do usuário
    this.loadSavedFilters();

    // VALIDAÇÃO FINAL: Garantir que os valores de lucro sejam sempre válidos
    if (isNaN(this.minProfit) || this.minProfit < 0) {
      console.warn(
        "⚠️ Valor de lucro mínimo inválido, corrigindo para 0:",
        this.minProfit
      );
      this.minProfit = 0;
    }

    if (isNaN(this.maxProfit) || this.maxProfit <= this.minProfit) {
      console.warn(
        "⚠️ Valor de lucro máximo inválido, corrigindo para 1000:",
        this.maxProfit
      );
      this.maxProfit = Math.max(1000, this.minProfit + 1);
    }

    console.log(
      "✅ Valores de lucro validados:",
      this.minProfit,
      "-",
      this.maxProfit
    );

    // Carregar cards fixos
    this.loadPinnedCards();

    // DEBUG: Verificar estado após carregar filtros
    console.log(
      "🔍 MOUNTED: showSaveFilterModal após carregar filtros =",
      this.showSaveFilterModal
    );

    // Forçar o modal para false se estiver true
    if (this.showSaveFilterModal) {
      console.log("⚠️ MOUNTED: Forçando showSaveFilterModal para false");
      this.showSaveFilterModal = false;
    }

    // TESTE: Adicionar dados de teste para debug (DESABILITADO)
    // this.addTestData() // Comentado para evitar sobrescrever dados reais

    // Verificar se o servidor está disponível antes de tentar WebSocket
    this.checkServerAvailability();
    this.debouncedFetchSurebets();

    // Busca automática desabilitada para melhor performance
    // if (this.isSearching) {
    //   this.startAutoUpdate()
    //   console.log('🚀 Busca automática iniciada no mounted')
    // } else {
    //   console.log('⏸️ Busca automática não iniciada (desabilitada nas configurações)')
    // }
    console.log("⏸️ Busca automática desabilitada para melhor performance");

    // Timer de estatísticas removido para melhor performance

    console.log("🔍 Resumo das configurações de busca automática aplicadas:");
    console.log("  - Busca habilitada:", this.isSearching);
    console.log(
      "  - Intervalo configurado:",
      this.autoUpdateInterval / 1000,
      "segundos"
    );
    console.log("  - Busca em segundo plano:", this.backgroundSearch);
    console.log("  - Intervalo ativo:", this.updateInterval ? "Sim" : "Não");

    // Monitorar mudanças no localStorage para configurações
    window.addEventListener("storage", (event) => {
      if (event.key === "app_settings") {
        // Verifica se o usuário explicitamente desmarcou todos os filtros
        // Se sim, NÃO recarrega as configurações para evitar interferência
        const userExplicitlyDeselectedAll =
          this.checkIfUserExplicitlyDeselectedAll();

        if (userExplicitlyDeselectedAll) {
          console.log(
            "🔒 Evento storage: Usuário explicitamente desmarcou todos os filtros - não recarregando configurações"
          );
          return;
        }

        this.loadDefaultFilters();
        this.loadAutoSearchSettings(); // Recarrega configurações de busca automática

        this.applyBackgroundSearchSettings(); // Reaplica configurações de busca em segundo plano
        this.loadFiltersFromSettings();

        // Atualizar variáveis CSS do grid
        this.updateGridCSSVariables();
        this.updateFiltersCache(); // Atualiza cache quando configurações mudam

        // Busca automática desabilitada para melhor performance
        // if (this.isSearching && !this.updateInterval) {
        //   this.startAutoUpdate()
        //   console.log('🔄 Busca automática reiniciada após mudança nas configurações')
        // }
      }
    });

    // DEBUG: Verificar estado final
    console.log(
      "✅ MOUNTED: showSaveFilterModal final =",
      this.showSaveFilterModal
    );

    // Garantir que o modal esteja fechado após o próximo tick
    this.$nextTick(() => {
      if (this.showSaveFilterModal) {
        console.log("⚠️ NEXT_TICK: Forçando showSaveFilterModal para false");
        this.showSaveFilterModal = false;
      }
    });

    // Verificação adicional após 1 segundo
    setTimeout(() => {
      if (this.showSaveFilterModal) {
        console.log("⚠️ TIMEOUT: Forçando showSaveFilterModal para false");
        this.showSaveFilterModal = false;
      }
    }, 1000);
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
    this.clearAllTimers();
  },
  methods: {
    // Debounce para evitar chamadas excessivas
    debouncedFetchSurebets() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.fetchSurebets();
      }, 1000); // 1 segundo de debounce
    },

    // Carrega mais cards para paginação
    async loadMoreCards() {
      if (this.isLoadingMore) return;

      this.isLoadingMore = true;

      try {
        // Simular um pequeno delay para melhor UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Incrementar página atual
        this.currentPage++;

        console.log(
          `📄 Carregando página ${this.currentPage}, mostrando ${this.paginatedSurebets.length} cards (52 por página)`
        );
      } catch (error) {
        console.error("Erro ao carregar mais cards:", error);
      } finally {
        this.isLoadingMore = false;
      }
    },

    // Reset paginação apenas quando necessário
    resetPagination() {
      this.currentPage = 1;
      console.log("🔄 Paginação resetada");
    },

    // Refresh manual dos dados
    async manualRefresh() {
      if (this.loading) return;

      console.log("🔄 Refresh manual iniciado");
      this.loading = true;

      try {
        // Reset paginação para mostrar novos dados
        this.resetPagination();

        // Buscar novos dados
        await this.fetchSurebets();

        console.log("✅ Refresh manual concluído");
      } catch (error) {
        console.error("❌ Erro no refresh manual:", error);
      } finally {
        this.loading = false;
      }
    },

    // Limpar todos os filtros
    clearAllFilters() {
      this.selectedHouses = [...this.filterOptions.houses];
      this.selectedSports = this.filterOptions.sports.map(
        (sport) => sport.value
      );
      this.selectedCurrencies = this.filterOptions.currencies.map(
        (currency) => currency.code
      );
      this.selectedDate = "";
      this.marketSearchTerm = "";
      this.unifiedSearchTerm = "";
      this.activeSearchType = null;
      this.searchSuggestions = [];
      this.showSearchSuggestions = false;
      this.selectedSuggestionIndex = -1;
      this.resetPagination();
      console.log("🗑️ Todos os filtros foram limpos");
    },

    // Carrega contas de Bookmaker Accounts
    async loadBookmakerAccounts() {
      try {
        // Verificar cache primeiro
        const cachedAccounts = this.smartCache.getBookmakerAccounts();
        if (cachedAccounts) {
          console.log("📦 Usando contas do cache");
          this.bookmakerAccounts = cachedAccounts;
          return;
        }

        // Verificar rate limiting
        if (!this.rateLimiter.canMakeRequest("/api/bookmaker-accounts")) {
          console.log("⏳ Rate limit atingido para contas de bookmaker");
          return;
        }

        this.isLoadingAccounts = true;
        const response = await http.get("/api/bookmaker-accounts");

        if (response.data.success) {
          this.bookmakerAccounts = response.data.data.accounts || [];

          // Armazenar no cache
          this.smartCache.setBookmakerAccounts(this.bookmakerAccounts);

          console.log(
            "📊 Contas de Bookmaker carregadas:",
            this.bookmakerAccounts.length
          );
        }
      } catch (error) {
        console.error("❌ Erro ao carregar contas de Bookmaker:", error);
        this.bookmakerAccounts = [];
        this.rateLimiter.applyBackoff("/api/bookmaker-accounts");
      } finally {
        this.isLoadingAccounts = false;
      }
    },

    // Métodos para pesquisa de casas de apostas
    onHouseSearchInput() {
      // Método chamado quando o usuário digita no campo de pesquisa
      // A filtragem é feita automaticamente pela propriedade computada filteredHouses
      console.log("🔍 Pesquisando casas:", this.houseSearchTerm);
    },

    clearHouseSearch() {
      this.houseSearchTerm = "";
      console.log("🧹 Pesquisa de casas limpa");
    },

    // Métodos para pesquisa de tipos de mercado
    onMarketSearchInput() {
      // Método chamado quando o usuário digita no campo de pesquisa de mercado
      // A filtragem é feita automaticamente pela propriedade computada filteredSurebetsByMarket
      console.log("🔍 Pesquisando mercados:", this.marketSearchTerm);
    },

    clearMarketSearch() {
      this.marketSearchTerm = "";
      console.log("🧹 Pesquisa de mercados limpa");
    },

    // Métodos para pesquisa unificada
    onUnifiedSearchInput() {
      this.generateSearchSuggestions();
      this.detectSearchType();
      console.log("🔍 Pesquisa unificada:", this.unifiedSearchTerm);
    },

    clearUnifiedSearch() {
      this.unifiedSearchTerm = "";
      this.activeSearchType = null;
      this.searchSuggestions = [];
      this.showSearchSuggestions = false;
      this.selectedSuggestionIndex = -1;
      console.log("🧹 Pesquisa unificada limpa");
    },

    generateSearchSuggestions() {
      if (!this.unifiedSearchTerm.trim()) {
        this.searchSuggestions = [];
        return;
      }

      const searchTerm = this.unifiedSearchTerm.toLowerCase().trim();
      const suggestions = [];

      // Sugestões de mercados
      const marketTranslations = this.getMarketTranslations();
      Object.entries(marketTranslations).forEach(([original, translated]) => {
        if (
          original.toLowerCase().includes(searchTerm) ||
          translated.toLowerCase().includes(searchTerm)
        ) {
          suggestions.push({
            type: "Mercado",
            text: translated,
            original: original,
            category: "market",
          });
        }
      });

      // Sugestões de casas de apostas removidas (não estava funcionando)

      // Sugestões de campeonatos usando o serviço de tradução
      const sportCategories = [
        "futebol",
        "basquete",
        "tenis",
        "futebol_americano",
        "volei",
        "automobilismo",
      ];

      sportCategories.forEach((category) => {
        const tournamentTranslations = getTranslationsByCategory(category);
        tournamentTranslations.forEach(({ original, translation }) => {
          if (
            original.toLowerCase().includes(searchTerm) ||
            translation.toLowerCase().includes(searchTerm)
          ) {
            suggestions.push({
              type: "Campeonato",
              text: translation,
              original: original,
              category: "tournament",
            });
          }
        });
      });

      // Sugestões de esportes
      const sports = this.filterOptions.sports || [];
      sports.forEach((sport) => {
        if (sport.label && sport.label.toLowerCase().includes(searchTerm)) {
          suggestions.push({
            type: "Esporte",
            text: sport.label,
            original: sport.value,
            category: "sport",
          });
        }
      });

      this.searchSuggestions = suggestions.slice(0, 10);
    },

    detectSearchType() {
      if (!this.unifiedSearchTerm.trim()) {
        this.activeSearchType = null;
        return;
      }

      // Detectar tipo baseado no termo de busca
      if (this.searchSuggestions.some((s) => s.category === "market")) {
        this.activeSearchType = "market";
      } else if (
        this.searchSuggestions.some((s) => s.category === "tournament")
      ) {
        this.activeSearchType = "tournament";
      } else if (this.searchSuggestions.some((s) => s.category === "sport")) {
        this.activeSearchType = "sport";
      } else {
        this.activeSearchType = "general";
      }
    },

    getSearchTypeLabel(type) {
      const labels = {
        market: "Mercado",
        tournament: "Campeonato",
        sport: "Esporte",
        general: "Geral",
      };
      return labels[type] || "Geral";
    },

    selectSuggestion(suggestion) {
      this.unifiedSearchTerm = suggestion.text;
      this.activeSearchType = suggestion.category;
      this.showSearchSuggestions = false;
      this.selectedSuggestionIndex = -1;
      console.log("✅ Sugestão selecionada:", suggestion);
    },

    hideSearchSuggestions() {
      // Delay para permitir clique nas sugestões
      setTimeout(() => {
        this.showSearchSuggestions = false;
        this.selectedSuggestionIndex = -1;
      }, 200);
    },

    getMarketTranslations() {
      // Retornar traduções de mercados (implementar conforme necessário)
      return {
        "Over/Under": "Mais de/Menos de",
        Handicap: "Handicap",
        "1X2": "Resultado Final",
        "Both Teams to Score": "Ambos os times marcam",
      };
    },

    // Carrega filtros das configurações (não atualiza automaticamente com dados)
    loadFiltersFromSettings() {
      try {
        // Verifica se o usuário explicitamente desmarcou todos os filtros
        // Se sim, NÃO carrega filtros para evitar interferência
        const userExplicitlyDeselectedAll =
          this.checkIfUserExplicitlyDeselectedAll();

        if (userExplicitlyDeselectedAll) {
          console.log(
            "🔒 loadFiltersFromSettings: Usuário explicitamente desmarcou todos os filtros - não carregando filtros"
          );
          return;
        }

        const savedSettings = localStorage.getItem("app_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.filters) {
            console.log("🔄 Carregando filtros salvos...");
          } else {
            console.log(
              "🔄 Nenhum filtro salvo encontrado, inicializando com padrões..."
            );
          }
        } else {
          console.log(
            "🔄 Nenhuma configuração salva encontrada, inicializando com padrões..."
          );
        }

        // Sempre inicializar filtros, mesmo se não houver configurações salvas
        if (!savedSettings || !JSON.parse(savedSettings).filters) {
          // Verifica se o usuário explicitamente desmarcou todos os filtros
          // Se sim, NÃO inicializa com padrões para evitar interferência
          if (this.checkIfUserExplicitlyDeselectedAll()) {
            console.log(
              "🔒 Inicialização de filtros bloqueada - usuário explicitamente desmarcou todos os filtros"
            );
            return;
          }

          // Inicializar com todas as opções marcadas por padrão
          const availableHouses =
            this.availableBookmakers.length > 0
              ? this.availableBookmakers
              : filterOptions.houses;

          this.selectedHouses = [...availableHouses];
          this.selectedSports = this.filterOptions.sports.map(
            (sport) => sport.value
          );
          this.selectedCurrencies = this.filterOptions.currencies.map(
            (currency) => currency.code
          );

          console.log(
            "✅ Filtros inicializados com todas as opções marcadas por padrão:"
          );
          console.log("  - Casas:", this.selectedHouses.length, "opções");
          console.log("  - Esportes:", this.selectedSports.length, "opções");
          console.log("  - Moedas:", this.selectedCurrencies.length, "opções");

          // Salvar as configurações iniciais
          this.saveFiltersToSettings();
        }

        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.filters) {
            // Carrega filtros salvos das configurações
            if (
              settings.filters.selectedHouses &&
              settings.filters.selectedHouses.length > 0
            ) {
              // Filtra apenas as casas que estão disponíveis na API
              const availableHouses =
                this.availableBookmakers.length > 0
                  ? this.availableBookmakers
                  : filterOptions.houses;

              const validHouses = settings.filters.selectedHouses.filter(
                (house) => availableHouses.includes(house)
              );

              // Se há casas válidas salvas, usa elas
              if (validHouses.length > 0) {
                this.selectedHouses = validHouses;
                console.log("✅ Casas carregadas:", validHouses);
              } else {
                // Se não há casas válidas, seleciona todas as disponíveis
                // MAS verifica se o usuário explicitamente desmarcou todos os filtros
                if (!this.checkIfUserExplicitlyDeselectedAll()) {
                  this.selectedHouses = [...availableHouses];
                  console.log(
                    "🔄 Nenhuma casa válida encontrada, selecionando todas:",
                    availableHouses
                  );
                } else {
                  console.log(
                    "🔒 Casas não re-selecionadas - usuário explicitamente desmarcou todos os filtros"
                  );
                }
              }
            } else {
              // Se não há casas salvas ou estão vazias, seleciona todas por padrão
              // MAS verifica se o usuário explicitamente desmarcou todos os filtros
              if (!this.checkIfUserExplicitlyDeselectedAll()) {
                const availableHouses =
                  this.availableBookmakers.length > 0
                    ? this.availableBookmakers
                    : filterOptions.houses;
                this.selectedHouses = [...availableHouses];
                console.log(
                  "✅ Casas inicializadas com todas as opções por padrão:",
                  this.selectedHouses.length,
                  "casas"
                );
              } else {
                console.log(
                  "🔒 Casas não inicializadas - usuário explicitamente desmarcou todos os filtros"
                );
              }
            }

            // Carrega outros filtros apenas se não foram carregados antes
            if (
              settings.filters.selectedSports &&
              settings.filters.selectedSports.length > 0
            ) {
              this.selectedSports = settings.filters.selectedSports;
              console.log("✅ Esportes carregados:", this.selectedSports);
            } else {
              // Se não há esportes salvos ou estão vazios, seleciona todos por padrão
              // MAS verifica se o usuário explicitamente desmarcou todos os filtros
              if (!this.checkIfUserExplicitlyDeselectedAll()) {
                this.selectedSports = this.filterOptions.sports.map(
                  (sport) => sport.value
                );
                console.log(
                  "✅ Esportes inicializados com todas as opções por padrão:",
                  this.selectedSports.length,
                  "esportes"
                );
              } else {
                console.log(
                  "🔒 Esportes não inicializados - usuário explicitamente desmarcou todos os filtros"
                );
              }
            }

            if (
              settings.filters.selectedCurrencies &&
              settings.filters.selectedCurrencies.length > 0
            ) {
              this.selectedCurrencies = settings.filters.selectedCurrencies;
              console.log("✅ Moedas carregadas:", this.selectedCurrencies);
            } else {
              // Se não há moedas salvas ou estão vazias, seleciona todas por padrão
              // MAS verifica se o usuário explicitamente desmarcou todos os filtros
              if (!this.checkIfUserExplicitlyDeselectedAll()) {
                this.selectedCurrencies = this.filterOptions.currencies.map(
                  (currency) => currency.code
                );
                console.log(
                  "✅ Moedas inicializadas com todas as opções por padrão:",
                  this.selectedCurrencies.length,
                  "moedas"
                );
              } else {
                console.log(
                  "🔒 Moedas não inicializadas - usuário explicitamente desmarcou todos os filtros"
                );
              }
            }

            if (settings.filters.selectedDate) {
              this.selectedDate = settings.filters.selectedDate;
              console.log("✅ Data carregada:", this.selectedDate);
            }

            if (settings.filters.activeFilter) {
              this.activeFilter = settings.filters.activeFilter;
              console.log("✅ Filtro ativo carregado:", this.activeFilter);
            }

            // Carrega termos de busca salvos
            if (settings.filters.houseSearchTerm) {
              this.houseSearchTerm = settings.filters.houseSearchTerm;
              console.log(
                "✅ Termo de busca de casas carregado:",
                this.houseSearchTerm
              );
            }

            if (settings.filters.marketSearchTerm) {
              this.marketSearchTerm = settings.filters.marketSearchTerm;
              console.log(
                "✅ Termo de busca de mercados carregado:",
                this.marketSearchTerm
              );
            }

            // Salva as configurações atualizadas
            localStorage.setItem("app_settings", JSON.stringify(settings));
            console.log("💾 Filtros salvos no localStorage");
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar filtros das configurações:", error);
      }
    },

    // Salva filtros nas configurações
    saveFiltersToSettings() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        let settings = savedSettings ? JSON.parse(savedSettings) : {};

        if (!settings.filters) {
          settings.filters = {};
        }

        // Verifica se o usuário explicitamente desmarcou todos os filtros
        // Se sim, NÃO atualiza o cache para evitar interferência
        const userExplicitlyDeselectedAll =
          this.checkIfUserExplicitlyDeselectedAll();

        if (!userExplicitlyDeselectedAll) {
          // Atualiza o cache local apenas se não for desmarcação explícita
          this.updateFiltersCache();
        } else {
          console.log(
            "🔒 Cache não atualizado - usuário explicitamente desmarcou todos os filtros"
          );
        }

        settings.filters.selectedHouses = this.selectedHouses;
        settings.filters.selectedSports = this.selectedSports;
        settings.filters.selectedCurrencies = this.selectedCurrencies;
        settings.filters.selectedDate = this.selectedDate;
        settings.filters.activeFilter = this.activeFilter;
        settings.filters.houseSearchTerm = this.houseSearchTerm;
        settings.filters.marketSearchTerm = this.marketSearchTerm;

        localStorage.setItem("app_settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Erro ao salvar filtros nas configurações:", error);
      }
    },

    // Atualiza o cache dos filtros
    updateFiltersCache() {
      // Verifica se o usuário explicitamente desmarcou todos os filtros
      // Se sim, NÃO atualiza o cache para evitar interferência
      const userExplicitlyDeselectedAll =
        this.checkIfUserExplicitlyDeselectedAll();

      if (userExplicitlyDeselectedAll) {
        console.log(
          "🔒 Cache não atualizado - usuário explicitamente desmarcou todos os filtros"
        );
        return;
      }

      this.filtersCache = {
        selectedHouses: [...this.selectedHouses],
        selectedSports: [...this.selectedSports],
        selectedCurrencies: [...this.selectedCurrencies],
        selectedDate: this.selectedDate,
        activeFilter: this.activeFilter,
        minProfit: this.minProfit,
        maxProfit: this.maxProfit,
        selectedRiskLevel: this.selectedRiskLevel,
        houseSearchTerm: this.houseSearchTerm,
        marketSearchTerm: this.marketSearchTerm,
      };
    },

    // Restaura filtros do cache
    restoreFiltersFromCache() {
      // Verifica se o usuário explicitamente desmarcou todos os filtros
      // Se sim, NÃO restaura do cache para evitar interferência
      const userExplicitlyDeselectedAll =
        this.checkIfUserExplicitlyDeselectedAll();

      if (userExplicitlyDeselectedAll) {
        console.log(
          "🔒 Restauração do cache bloqueada - usuário explicitamente desmarcou todos os filtros"
        );
        return;
      }

      let restoredCount = 0;
      let changesDetected = false;

      // Verifica se houve mudanças nos filtros
      if (this.filtersCache.selectedHouses.length > 0) {
        const currentHouses = [...this.selectedHouses].sort();
        const cachedHouses = [...this.filtersCache.selectedHouses].sort();

        if (JSON.stringify(currentHouses) !== JSON.stringify(cachedHouses)) {
          this.selectedHouses = [...this.filtersCache.selectedHouses];
          console.log("🔄 Restaurando casas do cache:", this.selectedHouses);
          restoredCount++;
          changesDetected = true;
        }
      }

      if (this.filtersCache.selectedSports.length > 0) {
        const currentSports = [...this.selectedSports].sort();
        const cachedSports = [...this.filtersCache.selectedSports].sort();

        if (JSON.stringify(currentSports) !== JSON.stringify(cachedSports)) {
          this.selectedSports = [...this.filtersCache.selectedSports];
          console.log("🔄 Restaurando esportes do cache:", this.selectedSports);
          restoredCount++;
          changesDetected = true;
        }
      }

      if (this.filtersCache.selectedCurrencies.length > 0) {
        const currentCurrencies = [...this.selectedCurrencies].sort();
        const cachedCurrencies = [
          ...this.filtersCache.selectedCurrencies,
        ].sort();

        if (
          JSON.stringify(currentCurrencies) !== JSON.stringify(cachedCurrencies)
        ) {
          this.selectedCurrencies = [...this.filtersCache.selectedCurrencies];
          console.log(
            "🔄 Restaurando moedas do cache:",
            this.selectedCurrencies
          );
          restoredCount++;
          changesDetected = true;
        }
      }

      if (
        this.filtersCache.selectedDate &&
        this.selectedDate !== this.filtersCache.selectedDate
      ) {
        this.selectedDate = this.filtersCache.selectedDate;
        console.log("🔄 Restaurando data do cache:", this.selectedDate);
        restoredCount++;
        changesDetected = true;
      }

      if (
        this.filtersCache.activeFilter &&
        this.activeFilter !== this.filtersCache.activeFilter
      ) {
        this.activeFilter = this.filtersCache.activeFilter;
        console.log("🔄 Restaurando filtro ativo do cache:", this.activeFilter);
        restoredCount++;
        changesDetected = true;
      }

      if (
        this.filtersCache.minProfit !== undefined &&
        this.minProfit !== this.filtersCache.minProfit
      ) {
        // Garantir que o valor mínimo seja válido e >= 0
        const minProfit = Number(this.filtersCache.minProfit);
        if (!isNaN(minProfit) && minProfit >= 0) {
          this.minProfit = minProfit;
          console.log("🔄 Restaurando lucro mínimo do cache:", this.minProfit);
          restoredCount++;
          changesDetected = true;
        } else {
          console.warn(
            "⚠️ Valor de lucro mínimo inválido no cache, usando padrão:",
            this.filtersCache.minProfit
          );
          this.minProfit = 0;
        }
      }

      if (
        this.filtersCache.maxProfit !== undefined &&
        this.maxProfit !== this.filtersCache.maxProfit
      ) {
        // Garantir que o valor máximo seja válido e > minProfit
        const maxProfit = Number(this.filtersCache.maxProfit);
        if (!isNaN(maxProfit) && maxProfit > this.minProfit) {
          this.maxProfit = maxProfit;
          console.log("🔄 Restaurando lucro máximo do cache:", this.maxProfit);
          restoredCount++;
          changesDetected = true;
        } else {
          console.warn(
            "⚠️ Valor de lucro máximo inválido no cache, usando padrão:",
            this.filtersCache.maxProfit
          );
          this.maxProfit = Math.max(1000, this.minProfit + 1);
        }
      }

      if (
        this.filtersCache.selectedRiskLevel !== undefined &&
        this.selectedRiskLevel !== this.filtersCache.selectedRiskLevel
      ) {
        this.selectedRiskLevel = this.filtersCache.selectedRiskLevel;
        console.log(
          "🔄 Restaurando nível de risco do cache:",
          this.selectedRiskLevel
        );
        restoredCount++;
        changesDetected = true;
      }

      if (
        this.filtersCache.houseSearchTerm !== undefined &&
        this.houseSearchTerm !== this.filtersCache.houseSearchTerm
      ) {
        this.houseSearchTerm = this.filtersCache.houseSearchTerm;
        console.log(
          "🔄 Restaurando termo de pesquisa de casas do cache:",
          this.houseSearchTerm
        );
        restoredCount++;
        changesDetected = true;
      }

      if (
        this.filtersCache.marketSearchTerm !== undefined &&
        this.marketSearchTerm !== this.filtersCache.marketSearchTerm
      ) {
        this.marketSearchTerm = this.filtersCache.marketSearchTerm;
        console.log(
          "🔄 Restaurando termo de pesquisa de mercados do cache:",
          this.marketSearchTerm
        );
        restoredCount++;
        changesDetected = true;
      }

      if (restoredCount > 0) {
        console.log(`✅ ${restoredCount} filtro(s) restaurado(s) do cache`);

        // Mostra notificação apenas se houve mudanças significativas
        if (changesDetected && restoredCount > 2) {
          this.showNotification(
            `Filtros preservados após atualização da API`,
            "info"
          );
        }
      }
    },

    // MÉTODO DE TESTE - REMOVER DEPOIS
    addTestData() {
      this.surebets = {
        test1: [
          {
            house: "Bet365",
            sport: "Futebol",
            currency: "BRL",
            match: "Time A vs Time B",
            market: "Resultado Final",
            chance: 2.1,
            profit: 5.2,
            minutes: 0,
            timestamp: new Date().toISOString(),
          },
          {
            house: "Betano",
            sport: "Futebol",
            currency: "BRL",
            match: "Time A vs Time B",
            market: "Resultado Final",
            chance: 1.95,
            profit: 5.2,
            minutes: 0,
            timestamp: new Date().toISOString(),
          },
        ],
        test2: [
          {
            house: "Pixbet",
            sport: "Tênis",
            currency: "USD",
            match: "Jogador 1 vs Jogador 2",
            market: "Vencedor",
            chance: 1.8,
            profit: 3.1,
            minutes: 15,
            timestamp: new Date().toISOString(),
          },
          {
            house: "Rivalo",
            sport: "Tênis",
            currency: "USD",
            match: "Jogador 1 vs Jogador 2",
            market: "Vencedor",
            chance: 2.25,
            profit: 3.1,
            minutes: 15,
            timestamp: new Date().toISOString(),
          },
        ],
        test3: [
          {
            house: "Sportingbet",
            sport: "Basquete",
            currency: "EUR",
            match: "Lakers vs Warriors",
            market: "Handicap",
            chance: 1.92,
            profit: 7.8,
            minutes: 0,
            timestamp: new Date().toISOString(),
          },
          {
            house: "Betway",
            sport: "Basquete",
            currency: "EUR",
            match: "Lakers vs Warriors",
            market: "Handicap",
            chance: 2.05,
            profit: 7.8,
            minutes: 0,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      this.loading = false;
      console.log("📊 Dados de teste adicionados:", this.surebets);
    },

    initWebSocket() {
      // Verificar se WebSocket está disponível
      if (typeof WebSocket === "undefined") {
        console.warn(
          "WebSocket não suportado neste navegador. Usando fallback HTTP."
        );
        this.startHttpPolling();
        return;
      }

      // Se já tentou 3 vezes, usar HTTP polling diretamente
      if (this.websocketRetryCount >= 3) {
        console.log("Usando HTTP polling (WebSocket indisponível)");
        this.startHttpPolling();
        return;
      }

      try {
        // Configurar timeout para WebSocket
        const wsTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.log("Timeout na conexão WebSocket. Usando fallback HTTP.");
            this.ws.close();
            this.websocketRetryCount++;
            this.startHttpPolling();
          }
        }, 3000); // 3 segundos de timeout

        // Usar configuração centralizada
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const hostname = window.location.hostname;
        const wsUrl = `${protocol}//${hostname}/ws`;

        console.log("🔌 [WEBSOCKET] Conectando ao WebSocket:", wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          clearTimeout(wsTimeout);
          console.log("WebSocket conectado");
          this.websocketConnected = true;
          this.websocketRetryCount = 0;
          this.stopHttpPolling(); // Para polling se WebSocket conectar
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "initial_state": {
              // Processar dados de forma robusta
              const processSurebetsData = (surebetsData) => {
                if (!surebetsData || typeof surebetsData !== "object") {
                  return {};
                }

                // Se já é um objeto válido, retornar
                if (Object.keys(surebetsData).length > 0) {
                  return surebetsData;
                }

                // Se é um array, converter para objeto
                if (Array.isArray(surebetsData)) {
                  const obj = {};
                  surebetsData.forEach((item, index) => {
                    if (item && typeof item === "object") {
                      obj[`surebet_${index}`] = item;
                    }
                  });
                  return obj;
                }

                return {};
              };

              this.surebets = processSurebetsData(data.surebets);
              this.isSearching = data.isSearching || false;
              this.soundEnabled = data.soundEnabled || false;
              this.loading = false;
              // Não toca som no estado inicial
              break;
            }

            case "new_surebet": {
              // Processar dados de forma robusta
              const processNewSurebetsData = (surebetsData) => {
                if (!surebetsData || typeof surebetsData !== "object") {
                  return this.surebets || {};
                }

                // Se já é um objeto válido, retornar
                if (Object.keys(surebetsData).length > 0) {
                  return surebetsData;
                }

                // Se é um array, converter para objeto
                if (Array.isArray(surebetsData)) {
                  const obj = {};
                  surebetsData.forEach((item, index) => {
                    if (item && typeof item === "object") {
                      obj[`surebet_${index}`] = item;
                    }
                  });
                  return obj;
                }

                return this.surebets || {};
              };

              // Verifica se há novos dados antes de tocar o som
              const currentKeys = this.surebets
                ? Object.keys(this.surebets)
                : [];
              const newSurebetsData = processNewSurebetsData(data.surebets);
              const newKeys = Object.keys(newSurebetsData);
              const hasNewData =
                newKeys.length > currentKeys.length ||
                newKeys.some((key) => !currentKeys.includes(key));

              this.surebets = newSurebetsData;

              // Toca som apenas se há novos dados e o som está habilitado
              if (this.soundEnabled && hasNewData) {
                this.playNotificationSound();
              }
              break;
            }

            case "surebets_update": {
              // Processar dados de forma robusta
              const processUpdateSurebetsData = (surebetsData) => {
                if (!surebetsData || typeof surebetsData !== "object") {
                  return this.surebets || {};
                }

                // Se já é um objeto válido, retornar
                if (Object.keys(surebetsData).length > 0) {
                  return surebetsData;
                }

                // Se é um array, converter para objeto
                if (Array.isArray(surebetsData)) {
                  const obj = {};
                  surebetsData.forEach((item, index) => {
                    if (item && typeof item === "object") {
                      obj[`surebet_${index}`] = item;
                    }
                  });
                  return obj;
                }

                return this.surebets || {};
              };

              this.surebets = processUpdateSurebetsData(data.surebets);
              break;
            }

            case "search_state_changed": {
              // Atualiza o estado de busca baseado na mensagem do servidor
              this.isSearching = data.isSearching;
              console.log(
                `Estado de busca atualizado via WebSocket: ${
                  this.isSearching ? "Ativo" : "Pausado"
                }`
              );

              // Busca automática desabilitada para melhor performance
              // if (this.isSearching) {
              //   this.startAutoUpdate()
              // } else {
              //   this.stopAutoUpdate()
              // }
              break;
            }
          }
        };

        this.ws.onerror = () => {
          clearTimeout(wsTimeout);
          // Não logar erro específico para evitar spam no console
          this.websocketConnected = false;
        };

        this.ws.onclose = (event) => {
          clearTimeout(wsTimeout);
          this.websocketConnected = false;

          // Tentar reconectar apenas se não foi um fechamento intencional
          if (!event.wasClean && this.websocketRetryCount < 3) {
            this.websocketRetryCount++;
            console.log(
              `Tentativa ${
                this.websocketRetryCount
              }/3: WebSocket indisponível, tentando novamente em ${
                2 * this.websocketRetryCount
              }s...`
            );

            setTimeout(() => {
              this.initWebSocket();
            }, 2000 * this.websocketRetryCount); // Delay progressivo
          } else if (this.websocketRetryCount >= 3) {
            console.log("WebSocket indisponível. Usando HTTP polling.");
            this.startHttpPolling();
          }
        };
      } catch (error) {
        console.log("WebSocket não disponível. Usando HTTP polling.");
        this.startHttpPolling();
      }
    },

    startHttpPolling() {
      // Evitar iniciar múltiplos intervals
      if (this.pollingInterval) {
        return;
      }

      console.log("Usando HTTP polling para atualizações");

      // Fazer primeira busca imediatamente
      this.fetchSurebets();

      // Configurar polling usando o intervalo configurável
      this.pollingInterval = setInterval(() => {
        this.debouncedFetchSurebets();
      }, this.autoUpdateInterval);

      console.log(
        "🔄 HTTP polling iniciado com intervalo de",
        this.autoUpdateInterval / 1000,
        "segundos"
      );
    },

    stopHttpPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    loadDefaultFilters() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);

          // Aplicar filtros padrão se existirem
          if (settings.defaultFilters) {
            // Aplicar lucro mínimo e máximo - GARANTIR que sejam números válidos
            if (
              settings.defaultFilters.minProfit !== undefined &&
              !isNaN(Number(settings.defaultFilters.minProfit))
            ) {
              const minProfit = Number(settings.defaultFilters.minProfit);
              // Garantir que o valor mínimo seja >= 0
              this.minProfit = Math.max(0, minProfit);
            } else {
              this.minProfit = 0; // Valor padrão se não for válido
              console.warn(
                "⚠️ Valor de lucro mínimo inválido nas configurações, usando padrão: 0"
              );
            }

            if (
              settings.defaultFilters.maxProfit !== undefined &&
              !isNaN(Number(settings.defaultFilters.maxProfit))
            ) {
              const maxProfit = Number(settings.defaultFilters.maxProfit);
              // Garantir que o valor máximo seja > 0 e >= minProfit
              this.maxProfit = Math.max(this.minProfit + 1, maxProfit);
            } else {
              this.maxProfit = 1000; // Valor padrão se não for válido
              console.warn(
                "⚠️ Valor de lucro máximo inválido nas configurações, usando padrão: 1000"
              );
            }

            // Aplicar filtro ativo padrão
            if (settings.defaultFilters.activeFilter) {
              this.activeFilter = settings.defaultFilters.activeFilter;
            }

            // Aplicar termos de busca padrão
            if (settings.defaultFilters.houseSearchTerm) {
              this.houseSearchTerm = settings.defaultFilters.houseSearchTerm;
            }

            if (settings.defaultFilters.marketSearchTerm) {
              this.marketSearchTerm = settings.defaultFilters.marketSearchTerm;
            }

            // CORREÇÃO: Se os valores ainda estiverem inválidos, forçar valores padrão
            if (this.minProfit < 0 || this.maxProfit <= this.minProfit) {
              console.warn(
                "⚠️ Valores de lucro ainda inválidos após correção, forçando valores padrão"
              );
              this.minProfit = 0;
              this.maxProfit = 1000;

              // Corrigir as configurações salvas
              settings.defaultFilters.minProfit = 0;
              settings.defaultFilters.maxProfit = 1000;
              localStorage.setItem("app_settings", JSON.stringify(settings));
              console.log(
                "✅ Configurações de lucro corrigidas no localStorage"
              );
            }
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar filtros padrão:", error);
      }
    },

    saveCurrentFiltersAsDefault() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        let settings = savedSettings ? JSON.parse(savedSettings) : {};

        // Inicializar defaultFilters se não existir
        if (!settings.defaultFilters) {
          settings.defaultFilters = {};
        }

        // Salvar filtros atuais como padrão
        settings.defaultFilters.minProfit = this.minProfit;
        settings.defaultFilters.maxProfit = this.maxProfit;
        settings.defaultFilters.activeFilter = this.activeFilter;
        settings.defaultFilters.houseSearchTerm = this.houseSearchTerm;
        settings.defaultFilters.marketSearchTerm = this.marketSearchTerm;

        localStorage.setItem("app_settings", JSON.stringify(settings));

        this.showNotification("Filtros salvos como padrão!");
      } catch (error) {
        console.error("Erro ao salvar filtros como padrão:", error);
        this.showNotification("Erro ao salvar filtros como padrão!", "error");
      }
    },

    async checkServerAvailability() {
      try {
        // Tentar conectar ao WebSocket com timeout
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const hostname = window.location.hostname;
        const wsTestUrl = `${protocol}//${hostname}/ws`;
        const wsTest = new WebSocket(wsTestUrl);

        const wsPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout"));
          }, 2000);

          wsTest.onopen = () => {
            clearTimeout(timeout);
            wsTest.close();
            resolve(true);
          };

          wsTest.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("WebSocket não disponível"));
          };
        });

        await wsPromise;
        // Se chegou aqui, WebSocket está disponível
        this.initWebSocket();
      } catch (error) {
        // WebSocket não disponível, usar HTTP polling diretamente
        console.log("Servidor WebSocket não disponível. Usando HTTP polling.");
        this.startHttpPolling();
      }
    },

    async fetchSurebets() {
      console.log("🚀 INICIANDO fetchSurebets...");
      console.log("📊 Estado atual antes da requisição:", {
        surebets: this.surebets ? Object.keys(this.surebets).length : "N/A",
        loading: this.loading,
        isSearching: this.isSearching,
      });

      try {
        // Verificar rate limiting
        if (!this.rateLimiter.canMakeRequest("/api/surebets")) {
          const waitTime = this.rateLimiter.getWaitTime("/api/surebets");
          console.log(`⏳ Rate limit atingido. Aguardando ${waitTime}ms`);
          return;
        }

        // Verificar cache local primeiro (desabilitado temporariamente para debug)
        const cachedData = this.smartCache.getSurebets();
        if (cachedData && this.smartCache.has("surebets_data")) {
          // Desabilitado para debug
          console.log("📦 Usando dados do cache local");
          this.surebets = cachedData;
          this.loading = false;
          return;
        }

        console.log(
          "🔄 Ignorando cache local para buscar dados frescos da API"
        );

        // Preserva os filtros atuais antes da atualização
        this.updateFiltersCache();

        const startTime = Date.now();
        // Usar a nova API otimizada que serve dados do cache do servidor
        console.log("🌐 Fazendo requisição para /api/surebets...");

        // Obter token de autenticação
        const authToken = this.$store.getters.authToken;
        if (!authToken) {
          throw new Error(
            "Token de autenticação não encontrado. Faça login novamente."
          );
        }

        const response = await fetch("https://surestake.com.br/api/surebets", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Resposta recebida:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 Dados JSON recebidos:", {
          success: data.success,
          hasData: !!data.data,
          dataType: typeof data.data,
          dataKeys: data.data ? Object.keys(data.data).length : 0,
          fullData: data,
        });

        // Calcular latência
        this.requestLatency = Date.now() - startTime;
        this.lastRequestTime = Date.now();

        // Atualizar sistemas de otimização
        this.rateLimiter.recordRequest("/api/surebets");
        if (
          this.adaptivePolling &&
          typeof this.adaptivePolling.updateConnectionQuality === "function"
        ) {
          this.adaptivePolling.updateConnectionQuality(this.requestLatency);
        }
        if (
          this.adaptivePolling &&
          typeof this.adaptivePolling.resetRetryCount === "function"
        ) {
          this.adaptivePolling.resetRetryCount();
        }

        // Usar dados da resposta da API (sistema otimizado)
        if (data.success && data.data) {
          console.log("🔍 DEBUG: Dados da API recebidos:", {
            success: data.success,
            dataType: typeof data.data,
            dataKeys: Object.keys(data.data || {}),
            dataLength: Object.keys(data.data || {}).length,
            source: data.source,
            timestamp: data.timestamp,
          });
          this.surebets = data.data;
          console.log("✅ this.surebets definido com sucesso:", {
            type: typeof this.surebets,
            keys: Object.keys(this.surebets).length,
            isObject: this.surebets instanceof Object,
          });
        } else {
          console.warn(
            "⚠️ DEBUG: Formato de dados inesperado, usando fallback:",
            data
          );
          // Fallback para sistema original se a resposta não tiver o formato esperado
          this.surebets = data;
          console.log("⚠️ this.surebets definido com fallback:", {
            type: typeof this.surebets,
            keys: Object.keys(this.surebets).length,
            isObject: this.surebets instanceof Object,
          });
        }

        // Verifica se há novos dados comparando com os dados atuais
        const currentKeys = this.surebets ? Object.keys(this.surebets) : [];
        const newKeys = this.surebets ? Object.keys(this.surebets) : [];
        const hasNewData =
          newKeys.length > currentKeys.length ||
          newKeys.some((key) => !currentKeys.includes(key));

        // Armazenar no cache local
        this.smartCache.setSurebets(this.surebets, {
          hasNewData,
          latency: this.requestLatency,
          timestamp: Date.now(),
        });

        this.loading = false;
        this.updateStats(); // Atualiza estatísticas

        // Atualiza as casas de apostas disponíveis baseado nos dados da API
        this.updateAvailableBookmakers(data);

        // Restaura os filtros do cache após a atualização
        this.restoreFiltersFromCache();

        // Atualiza cards fixos com dados mais recentes
        this.updatePinnedCards(data);

        // Toca som apenas se há novos dados e o som está habilitado
        if (this.soundEnabled && hasNewData) {
          this.playNotificationSound();
        }

        console.log(
          `✅ Dados atualizados: ${Object.keys(data).length} surebets (${
            this.requestLatency
          }ms)`
        );
      } catch (error) {
        console.error("❌ ERRO no fetchSurebets:", error);
        console.error("❌ Tipo do erro:", typeof error);
        console.error("❌ Mensagem do erro:", error.message);
        console.error("❌ Stack do erro:", error.stack);

        // NÃO limpar os dados em caso de erro - manter dados existentes
        // this.surebets = {} // REMOVIDO - causa "aparecer e sumir"
        console.log("⚠️ Mantendo dados existentes após erro:", {
          surebetsCount: this.surebets ? Object.keys(this.surebets).length : 0,
        });

        this.loading = false;
        this.updateStats(); // Atualiza estatísticas mesmo em caso de erro

        // Incrementar contador de erros para polling adaptativo
        if (
          this.adaptivePolling &&
          typeof this.adaptivePolling.incrementRetryCount === "function"
        ) {
          this.adaptivePolling.incrementRetryCount();
        }

        // Restaura filtros do cache mesmo em caso de erro
        this.restoreFiltersFromCache();
      }
    },

    updateAvailableBookmakers(surebetsData) {
      try {
        // Extrai todas as casas de apostas únicas dos dados
        const uniqueBookmakers = new Set();
        const dynamicUrls = {};

        // Processa cada surebet para extrair casas de apostas
        if (surebetsData) {
          Object.values(surebetsData).forEach((surebet) => {
            if (Array.isArray(surebet) && surebet.length > 0) {
              surebet.forEach((bet) => {
                if (bet.house) {
                  uniqueBookmakers.add(bet.house);

                  // Extrai URL específica da API se disponível
                  if (bet.anchorh1 || bet.anchorh2) {
                    const apiUrl = bet.anchorh1 || bet.anchorh2;
                    if (apiUrl && apiUrl.includes("http")) {
                      dynamicUrls[bet.house] = apiUrl;

                      // Adiciona URL dinamicamente ao mapeamento se não existir
                      const mappedUrl = getBookmakerUrl(bet.house, bet.isLive);
                      if (mappedUrl.includes("google.com/search")) {
                        // Se não encontrou URL mapeada, adiciona a URL da API
                        addBookmakerUrl(
                          bet.house,
                          this.extractBaseUrl(apiUrl),
                          bet.isLive
                        );
                        console.log(
                          `🆕 Nova casa adicionada: ${bet.house} -> ${apiUrl}`
                        );
                      }
                    }
                  }
                }
              });
            }
          });
        }

        // Converte para array e ordena alfabeticamente
        const sortedBookmakers = Array.from(uniqueBookmakers).sort();

        // Atualiza as propriedades
        this.availableBookmakers = sortedBookmakers;
        this.bookmakerUrls = this.buildBookmakerUrlsMap(sortedBookmakers);

        // Atualiza os filtros de casas se necessário
        this.updateHouseFilters(sortedBookmakers);

        console.log(
          "🏠 Casas de apostas atualizadas:",
          sortedBookmakers.length,
          "casas encontradas"
        );
        console.log(
          "🔗 URLs mapeadas:",
          Object.keys(this.bookmakerUrls).length,
          "URLs disponíveis"
        );
      } catch (error) {
        console.error("Erro ao atualizar casas de apostas:", error);
      }
    },

    // Constrói mapa de URLs para as casas disponíveis
    buildBookmakerUrlsMap(bookmakers) {
      const urlsMap = {};
      bookmakers.forEach((house) => {
        urlsMap[house] = {
          prematch: getBookmakerUrl(house, false),
          live: getBookmakerUrl(house, true),
        };
      });
      return urlsMap;
    },

    // Extrai URL base de uma URL completa
    extractBaseUrl(fullUrl) {
      try {
        const url = new URL(fullUrl);
        return `${url.protocol}//${url.hostname}/`;
      } catch (error) {
        console.warn("Erro ao extrair URL base:", error);
        return fullUrl;
      }
    },

    updateHouseFilters(availableBookmakers) {
      // Se não há casas disponíveis, mantém as padrão
      if (!availableBookmakers || availableBookmakers.length === 0) {
        return;
      }

      // Verifica se o usuário explicitamente desmarcou todos os filtros
      // Se sim, NÃO interfere com a seleção atual
      const userExplicitlyDeselectedAll =
        this.checkIfUserExplicitlyDeselectedAll();

      if (userExplicitlyDeselectedAll) {
        console.log(
          "🔒 updateHouseFilters: Usuário explicitamente desmarcou todos os filtros - não interferindo"
        );
        // Apenas atualiza as opções disponíveis sem modificar a seleção
        this.filterOptions.houses = availableBookmakers;
        return;
      }

      // Atualiza as opções de filtro de casas
      this.filterOptions.houses = availableBookmakers;

      // Preserva as seleções do usuário de forma mais inteligente
      const currentSelected = [...this.selectedHouses];

      // Filtra apenas as casas que ainda estão disponíveis
      const validSelectedHouses = currentSelected.filter((house) =>
        availableBookmakers.includes(house)
      );

      // Se o usuário tinha casas selecionadas e algumas ainda estão disponíveis, mantém apenas as válidas
      if (validSelectedHouses.length > 0) {
        this.selectedHouses = validSelectedHouses;
        console.log("🔒 Preservando seleções do usuário:", validSelectedHouses);
      } else {
        // Se nenhuma casa selecionada está disponível, seleciona todas as disponíveis
        // MAS verifica se o usuário explicitamente desmarcou todos os filtros
        if (!this.checkIfUserExplicitlyDeselectedAll()) {
          this.selectedHouses = [...availableBookmakers];
          console.log(
            "🔄 Nenhuma casa selecionada disponível, selecionando todas:",
            availableBookmakers
          );
        } else {
          console.log(
            "🔒 Casas não re-selecionadas - usuário explicitamente desmarcou todos os filtros"
          );
        }
      }

      // Salva as configurações atualizadas
      this.saveFiltersToSettings();
    },

    toggleSearch() {
      this.isSearching = !this.isSearching;
      this.sendWebSocketMessage("toggle_search", {
        isSearching: this.isSearching,
      });

      // Busca automática desabilitada para melhor performance
      // if (this.isSearching) {
      //   this.startAutoUpdate()
      //   console.log('🔍 Busca automática iniciada com intervalo de', this.autoUpdateInterval / 1000, 'segundos')
      // } else {
      //   this.stopAutoUpdate()
      //   console.log('⏸️ Busca automática pausada')
      // }
      console.log(
        "⏸️ Busca automática desabilitada - use refresh manual se necessário"
      );

      // Salvar o estado da busca nas configurações
      this.saveSearchStateToSettings();
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.sendWebSocketMessage("toggle_sound", {
        soundEnabled: this.soundEnabled,
      });
    },

    setFilter(filter) {
      this.activeFilter = filter;
      this.saveFiltersToSettings();
      this.updateFiltersCache();
    },

    setRiskLevel(level) {
      this.selectedRiskLevel = level;
      this.currentPage = 1; // Reset para primeira página ao trocar filtro
      this.saveFiltersToSettings();
      this.updateFiltersCache();
      console.log("🔄 Nível de risco alterado para:", level);
    },

    // Calcula o nível de risco de uma surebet baseado na diferença entre as odds
    calculateRiskLevel(surebet) {
      if (!surebet || surebet.length < 2) return "conservador";

      // Extrai as odds (chance) de todas as apostas da surebet
      const odds = surebet
        .map((bet) => parseFloat(bet.chance || bet.odds || 0))
        .filter((odd) => odd > 0);

      if (odds.length < 2) return "conservador";

      // Encontra a maior e menor odd
      const maxOdd = Math.max(...odds);
      const minOdd = Math.min(...odds);

      // Calcula a diferença
      const difference = maxOdd - minOdd;

      // Converte para pontos (cada 0.01 = 1 ponto)
      const points = Math.round(difference * 100);

      // Classifica o nível de risco
      if (points <= 30) return "conservador";
      if (points <= 50) return "moderado";
      return "arriscado";
    },

    showLiveRestrictedMessage() {
      this.showNotification(
        "A aba Live está temporariamente indisponível para manutenção",
        "warning"
      );
    },

    applyFilters() {
      // Os filtros são aplicados automaticamente através do computed filteredSurebets
      this.saveFiltersToSettings();
      this.toggleFilterOverlay();
    },

    onDateChange() {
      console.log("Data selecionada:", this.selectedDate);
      this.saveFiltersToSettings();
    },

    clearDateFilter() {
      this.selectedDate = "";
      this.saveFiltersToSettings();
    },

    clearFilters() {
      // Limpa filtros mas mantém tudo selecionado por padrão
      // Usa as casas disponíveis da API ou as padrão se não houver dados
      const housesToSelect =
        this.availableBookmakers.length > 0
          ? [...this.availableBookmakers]
          : [...filterOptions.houses];

      this.selectedHouses = housesToSelect;
      this.selectedSports = this.filterOptions.sports.map(
        (sport) => sport.value
      );
      this.selectedCurrencies = this.filterOptions.currencies.map(
        (currency) => currency.code
      );
      this.selectedDate = "";
      this.minProfit = 0;
      this.maxProfit = 1000;
      this.activeFilter = "prelive";
      this.houseSearchTerm = "";
      this.marketSearchTerm = "";

      // Salvar filtros nas configurações
      this.saveFiltersToSettings();

      // Mostrar notificação
      this.showNotification("Filtros limpos!");
    },

    toggleFilterOverlay() {
      this.showFilterOverlay = !this.showFilterOverlay;
    },

    selectAllHouses() {
      this.selectedHouses = [...this.filterOptions.houses];
      this.saveFiltersToSettings();
    },

    deselectAllHouses() {
      this.selectedHouses = [];
      this.lastDeselectAllTime = Date.now();
      this.saveFiltersToSettings();
      console.log("❌ Todas as casas desmarcadas - timestamp registrado");
    },

    selectAllSports() {
      // filterOptions.sports sempre tem estrutura de objetos {value, label}
      this.selectedSports = this.filterOptions.sports.map(
        (sport) => sport.value
      );
      this.saveFiltersToSettings();
    },

    deselectAllSports() {
      this.selectedSports = [];
      this.lastDeselectAllTime = Date.now();
      this.saveFiltersToSettings();
      console.log("❌ Todos os esportes desmarcados - timestamp registrado");
    },

    selectAllCurrencies() {
      // filterOptions.currencies sempre tem estrutura de objetos {code, label}
      this.selectedCurrencies = this.filterOptions.currencies.map(
        (currency) => currency.code
      );
      this.saveFiltersToSettings();
    },

    deselectAllCurrencies() {
      this.selectedCurrencies = [];
      this.lastDeselectAllTime = Date.now();
      this.saveFiltersToSettings();
      console.log("❌ Todas as moedas desmarcadas - timestamp registrado");
    },

    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed;
    },

    handleSidebarStateLoaded(collapsed) {
      this.sidebarCollapsed = collapsed;
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    sendWebSocketMessage(type, data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, ...data }));
      }
    },

    playNotificationSound() {
      if (!this.soundEnabled) return;

      const audio = this.$refs.notificationSound;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.log("Erro ao tocar som:", err);
          });
        }
      } catch (error) {
        console.log("Erro ao tocar som:", error);
      }
    },

    hasSignificantDataChange(oldSurebets, newSurebets) {
      if (!oldSurebets || !newSurebets) return false;

      // Comparar chaves (IDs dos surebets)
      const oldKeys = Object.keys(oldSurebets);
      const newKeys = Object.keys(newSurebets);

      // Se há novas chaves, é uma mudança significativa
      const hasNewKeys = newKeys.some((key) => !oldKeys.includes(key));
      if (hasNewKeys) return true;

      // Verificar se algum surebet foi removido (opcional - pode não querer som para remoções)
      // const hasRemovedKeys = oldKeys.some(key => !newKeys.includes(key))
      // if (hasRemovedKeys) return true

      // Verificar mudanças nos valores dos surebets (odds, profit, etc)
      for (const key of newKeys) {
        if (oldSurebets[key] && newSurebets[key]) {
          const oldData = JSON.stringify(oldSurebets[key]);
          const newData = JSON.stringify(newSurebets[key]);
          if (oldData !== newData) {
            // Verificar se a mudança é significativa (profit, odds)
            const oldProfit = oldSurebets[key][0]?.profit || 0;
            const newProfit = newSurebets[key][0]?.profit || 0;

            // Tocar som se o profit mudou significativamente (mais de 0.1%)
            if (Math.abs(newProfit - oldProfit) > 0.1) {
              return true;
            }
          }
        }
      }

      return false;
    },

    getMarketTranslation(marketCode) {
      try {
        // Buscar tradução direta
        if (
          marketTranslations.translations &&
          marketTranslations.translations[marketCode]
        ) {
          return marketTranslations.translations[marketCode];
        }

        // Buscar tradução com padrões mais complexos
        // Ex: "TO(1.5) for Team1 - Corners" -> "Mais de (1.5) escanteios para o Time 1"
        const patterns = [
          // Padrão TO(X.X) for Team1/Team2 - Category
          /^(TO\([0-9.]+\))\s+for\s+(Team[12])\s+-\s+(.+)$/,
          // Padrão TU(X.X) for Team1/Team2 - Category
          /^(TU\([0-9.]+\))\s+for\s+(Team[12])\s+-\s+(.+)$/,
          // Padrão TO(X.X) - Category
          /^(TO\([0-9.]+\))\s+-\s+(.+)$/,
          // Padrão TU(X.X) - Category
          /^(TU\([0-9.]+\))\s+-\s+(.+)$/,
          // Padrão Exact(X) for Team1/Team2
          /^(Exact\s+\([0-9]+\))\s+for\s+(Team[12])$/,
        ];

        for (const pattern of patterns) {
          const match = marketCode.match(pattern);
          if (match) {
            const fullKey = marketCode;
            if (
              marketTranslations.translations &&
              marketTranslations.translations[fullKey]
            ) {
              return marketTranslations.translations[fullKey];
            }
          }
        }

        return null;
      } catch (error) {
        console.warn("Erro ao buscar tradução do mercado:", marketCode, error);
        return null;
      }
    },

    loadSoundSettings() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.soundEnabled !== undefined) {
            this.soundEnabled = settings.soundEnabled;
            console.log(
              "🔊 Configuração de som carregada:",
              this.soundEnabled ? "Habilitado" : "Desabilitado"
            );
          }
        }
      } catch (error) {
        console.log("Erro ao carregar configurações de som:", error);
      }
    },

    startAutoUpdate() {
      this.stopAutoUpdate(); // Limpa qualquer intervalo existente

      // Usar polling adaptativo com intervalo mínimo maior
      const adaptiveInterval =
        this.adaptivePolling &&
        typeof this.adaptivePolling.getCurrentInterval === "function"
          ? Math.max(this.adaptivePolling.getCurrentInterval(), 60000) // Mínimo 60 segundos
          : 60000; // Fallback para 60 segundos (dobrou o intervalo)
      this.autoUpdateInterval = adaptiveInterval;

      this.updateInterval = setInterval(() => {
        if (this.isSearching) {
          // Atualizar intervalo adaptativo antes de cada requisição
          if (
            this.adaptivePolling &&
            typeof this.adaptivePolling.getCurrentInterval === "function"
          ) {
            const newInterval = this.adaptivePolling.getCurrentInterval();
            if (newInterval !== this.autoUpdateInterval) {
              this.autoUpdateInterval = newInterval;
              console.log(
                `🔄 Intervalo adaptativo ajustado para ${
                  this.autoUpdateInterval / 1000
                }s`
              );
            }
          }

          this.debouncedFetchSurebets();
        }
      }, this.autoUpdateInterval);

      console.log(
        "🔍 Busca automática iniciada com intervalo adaptativo de",
        this.autoUpdateInterval / 1000,
        "segundos"
      );
    },

    updateStats() {
      // Atualiza contador de verificações
      this.lastCheckCount++;

      // Atualiza tempo online
      this.updateUptime();

      // Log de estatísticas de performance a cada 10 verificações
      if (this.lastCheckCount % 10 === 0) {
        this.logPerformanceStats();
      }
    },

    // Log de estatísticas de performance
    logPerformanceStats() {
      const pollingStats =
        this.adaptivePolling &&
        typeof this.adaptivePolling.getStats === "function"
          ? this.adaptivePolling.getStats()
          : {};
      const cacheStats = this.smartCache.getStats();
      const rateLimitStats = this.rateLimiter.getStats();

      console.log("📊 === ESTATÍSTICAS DE PERFORMANCE ===");
      console.log("🔄 Polling Adaptativo:", {
        intervalo: `${pollingStats.currentInterval / 1000}s`,
        usuarioAtivo: pollingStats.isUserActive,
        qualidadeConexao: pollingStats.connectionQuality,
        cargaServidor: pollingStats.serverLoad,
      });
      console.log("💾 Cache Inteligente:", {
        entradasValidas: cacheStats.validEntries,
        entradasExpiradas: cacheStats.expiredEntries,
        subscribers: cacheStats.subscribers,
      });
      console.log("⏳ Rate Limiting:", rateLimitStats);
      console.log(
        "🌐 Latência da Última Requisição:",
        `${this.requestLatency}ms`
      );
      console.log("=====================================");
    },

    // Atualiza tempo online
    updateUptime() {
      const now = Date.now();
      const uptimeMs = now - this.startTime;
      this.uptimeMinutes = Math.floor(uptimeMs / (1000 * 60));
    },

    // Gerenciamento de timers
    clearAllTimers() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      console.log("🧹 Todos os timers limpos");
    },

    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },

    // Salva o estado da busca nas configurações
    saveSearchStateToSettings() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        let settings = savedSettings ? JSON.parse(savedSettings) : {};

        // Inicializar autoSearch se não existir
        if (!settings.autoSearch) {
          settings.autoSearch = {};
        }

        // Salvar estado atual da busca
        settings.autoSearch.enabled = this.isSearching;

        localStorage.setItem("app_settings", JSON.stringify(settings));
        console.log(
          "💾 Estado da busca salvo nas configurações:",
          this.isSearching ? "Habilitada" : "Desabilitada"
        );
      } catch (error) {
        console.log("Erro ao salvar estado da busca nas configurações:", error);
      }
    },

    // Aplica configurações de busca em segundo plano
    applyBackgroundSearchSettings() {
      if (this.backgroundSearch) {
        // Adicionar listener para detectar quando a aba não está ativa
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            console.log(
              "🔄 Aba não está ativa, mas busca em segundo plano está habilitada"
            );
            // A busca continua mesmo com a aba inativa
          } else {
            console.log(
              "👁️ Aba ativa novamente, busca automática funcionando normalmente"
            );
          }
        });
        console.log("🔄 Configurações de busca em segundo plano aplicadas");
      } else {
        console.log("⏸️ Busca em segundo plano desabilitada");
      }
    },

    // Adiciona surebet aos relatórios
    addSurebetToReports(surebet) {
      // Encontra o ID do surebet no objeto surebets
      const surebetId = this.surebets
        ? Object.keys(this.surebets).find(
            (key) => this.surebets[key] === surebet
          )
        : null;

      if (surebetId) {
        // Salva no localStorage para a página de relatórios
        const storedBets = JSON.parse(
          localStorage.getItem("reports_bets") || "[]"
        );

        const firstBet = surebet[0];
        const houses = surebet.map((bet) => bet.house).filter(Boolean);

        const newBet = {
          id: Date.now() + Math.random(),
          match: firstBet.match || "Partida não especificada",
          sport: firstBet.sport || "Esporte não especificado",
          houses: houses,
          market: firstBet.market || "Mercado não especificado",
          odds: surebet.map((bet) => bet.chance || bet.odds).join(" / "),
          stake: 100.0,
          investment: 100.0,
          status: "Em andamento",
          profit: firstBet.profit || 0,
          roi: firstBet.profit || 0,
          date: new Date().toISOString(),
          surebetId: surebetId,
        };

        storedBets.unshift(newBet);
        localStorage.setItem("reports_bets", JSON.stringify(storedBets));

        // Mostra notificação
        this.showNotification("Surebet adicionado aos relatórios!");
      }
    },

    // Manipula evento de débito do saldo
    handleBalanceDebited(data) {
      console.log("💰 Débito processado:", data);

      // Atualiza a interface se necessário
      // Por exemplo, pode atualizar contadores de saldo ou notificações
      this.showNotification(
        `Débito de ${this.formatCurrency(
          data.amount
        )} processado com sucesso em ${data.account.bookmaker_name}`,
        "success"
      );
    },

    // Formata valor monetário
    formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },

    // Cria uma chave única para identificar surebets duplicados
    createSurebetKey(surebet) {
      if (!surebet || surebet.length === 0) return "";

      const firstBet = surebet[0];
      if (!firstBet || typeof firstBet !== "object") return "";

      // Campos principais que identificam um surebet único
      const keyFields = [
        firstBet.match || "", // Nome da partida
        firstBet.sport || "", // Esporte
        firstBet.tournament || "", // Torneio
        firstBet.date || "", // Data
        firstBet.hour || "", // Hora
        firstBet.profit || "0", // Lucro
        firstBet.currency || "", // Moeda
      ];

      // Adiciona informações das casas de apostas e odds
      const betDetails = surebet
        .map(
          (bet) => `${bet.house || ""}-${bet.chance || ""}-${bet.market || ""}`
        )
        .sort()
        .join("|");

      // Combina todos os campos para criar uma chave única
      const key = keyFields.join("|") + "|" + betDetails;

      return key;
    },

    // Mostra notificação
    showNotification(message, type = "success") {
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.textContent = message;

      let backgroundColor = "var(--accent-primary)";
      let textColor = "var(--bg-primary)";

      if (type === "error") {
        backgroundColor = "var(--error-color)";
        textColor = "var(--text-primary)";
      } else if (type === "warning") {
        backgroundColor = "var(--warning-color)";
        textColor = "var(--bg-primary)";
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
           `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },

    // Método de Logout
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },

    // Métodos para Filtros Salvos
    loadSavedFilters() {
      try {
        const userId = this.currentUser?.id || "anonymous";
        const key = `saved_filters_${userId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          this.savedFilters = JSON.parse(saved);
        }

        // DEBUG: Verificar se há algum problema com showSaveFilterModal
        console.log(
          "🔍 DEBUG: showSaveFilterModal =",
          this.showSaveFilterModal
        );

        // Forçar o valor para false se estiver true
        if (this.showSaveFilterModal) {
          console.log(
            "⚠️ WARNING: showSaveFilterModal estava true, forçando para false"
          );
          this.showSaveFilterModal = false;
        }
      } catch (error) {
        console.warn("Erro ao carregar filtros salvos:", error);
        this.savedFilters = [];
      }
    },

    // Método para limpar localStorage e forçar reset dos modais
    clearModalState() {
      console.log("🧹 Limpando estado dos modais...");
      this.showSaveFilterModal = false;
      this.showSavedFiltersModal = false;
      this.currentFilterName = "";

      // Limpar localStorage relacionado aos modais (se existir)
      try {
        localStorage.removeItem("showSaveFilterModal");
        localStorage.removeItem("showSavedFiltersModal");

        // Limpar TODOS os itens do localStorage que possam estar relacionados
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes("modal") || key.includes("filter"))) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
          console.log("🗑️ Removido do localStorage:", key);
        });
      } catch (error) {
        console.warn("Erro ao limpar localStorage dos modais:", error);
      }

      // Forçar o estado para false após um pequeno delay
      setTimeout(() => {
        this.showSaveFilterModal = false;
        this.showSavedFiltersModal = false;
        console.log("✅ Estado dos modais forçado para false");
      }, 100);
    },

    saveSavedFilters() {
      try {
        const userId = this.currentUser?.id || "anonymous";
        const key = `saved_filters_${userId}`;
        localStorage.setItem(key, JSON.stringify(this.savedFilters));
      } catch (error) {
        console.error("Erro ao salvar filtros:", error);
      }
    },

    openSaveFilterModal() {
      this.currentFilterName = "";
      this.showSaveFilterModal = true;
    },

    closeSaveFilterModal() {
      this.showSaveFilterModal = false;
      this.currentFilterName = "";
    },

    saveFilter() {
      if (!this.currentFilterName.trim()) return;

      const newFilter = {
        id: Date.now(),
        name: this.currentFilterName.trim(),
        houses: [...this.selectedHouses],
        sports: [...this.selectedSports],
        currencies: [...this.selectedCurrencies],
        selectedDate: this.selectedDate,
        minProfit: this.minProfit,
        maxProfit: this.maxProfit,
        activeFilter: this.activeFilter,
        createdAt: new Date().toISOString(),
      };

      this.savedFilters.push(newFilter);
      this.saveSavedFilters();
      this.closeSaveFilterModal();
      this.showNotification("Filtro salvo com sucesso!");
    },

    showSavedFiltersList() {
      this.showSavedFiltersModal = true;
    },

    closeSavedFiltersModal() {
      this.showSavedFiltersModal = false;
    },

    loadFilter(filter) {
      // Verifica se o usuário explicitamente desmarcou todos os filtros
      // Se sim, NÃO carrega o filtro para evitar interferência
      const userExplicitlyDeselectedAll =
        this.checkIfUserExplicitlyDeselectedAll();

      if (userExplicitlyDeselectedAll) {
        console.log(
          "🔒 loadFilter: Usuário explicitamente desmarcou todos os filtros - não carregando filtro salvo"
        );
        this.showNotification(
          "Não é possível carregar filtro enquanto todos os filtros estão desmarcados!",
          "warning"
        );
        return;
      }

      // Filtra apenas as casas que estão disponíveis na API
      const availableHouses =
        this.availableBookmakers.length > 0
          ? this.availableBookmakers
          : filterOptions.houses;

      this.selectedHouses = filter.houses
        ? filter.houses.filter((house) => availableHouses.includes(house))
        : [];

      // Se não há casas selecionadas válidas, seleciona todas as disponíveis
      if (this.selectedHouses.length === 0) {
        this.selectedHouses = [...availableHouses];
      }

      this.selectedSports = [...filter.sports];
      this.selectedCurrencies = [...filter.currencies];
      this.selectedDate = filter.selectedDate || "";
      this.minProfit = filter.minProfit;
      this.maxProfit = filter.maxProfit;
      this.activeFilter = filter.activeFilter;

      this.saveFiltersToSettings();
      this.closeSavedFiltersModal();
      this.showNotification(`Filtro "${filter.name}" carregado!`);
    },

    deleteFilter(index) {
      const filterName = this.savedFilters[index].name;
      this.savedFilters.splice(index, 1);
      this.saveSavedFilters();
      this.showNotification(`Filtro "${filterName}" excluído!`);
    },

    // Métodos para gerenciar cards fixos
    togglePinCard(surebet) {
      const cardKey = this.createSurebetKey(surebet);

      if (this.pinnedCardKeys.has(cardKey)) {
        // Remove o card fixo
        this.pinnedCardKeys.delete(cardKey);
        this.pinnedCards = this.pinnedCards.filter(
          (card) => this.createSurebetKey(card) !== cardKey
        );
        this.showNotification("Card desafixado!");
      } else {
        // Verifica se já atingiu o limite de 3 cards fixos
        if (this.pinnedCards.length >= 3) {
          this.showNotification(
            "Limite máximo de 3 cards fixos atingido!",
            "warning"
          );
          return;
        }

        // Adiciona o card fixo
        this.pinnedCardKeys.add(cardKey);
        this.pinnedCards.push(surebet);
        this.showNotification("Card fixado!");
      }

      this.savePinnedCards();
    },

    isPinned(surebet) {
      const cardKey = this.createSurebetKey(surebet);
      return this.pinnedCardKeys.has(cardKey);
    },

    clearAllPinnedCards() {
      this.pinnedCards = [];
      this.pinnedCardKeys.clear();
      this.savePinnedCards();
      this.showNotification("Todos os cards fixos foram removidos!");
    },

    savePinnedCards() {
      try {
        const userId = this.currentUser?.id || "anonymous";
        const key = `pinned_cards_${userId}`;
        const pinnedData = {
          cardKeys: Array.from(this.pinnedCardKeys),
          cards: this.pinnedCards,
        };
        localStorage.setItem(key, JSON.stringify(pinnedData));
      } catch (error) {
        console.error("Erro ao salvar cards fixos:", error);
      }
    },

    loadPinnedCards() {
      try {
        const userId = this.currentUser?.id || "anonymous";
        const key = `pinned_cards_${userId}`;
        const saved = localStorage.getItem(key);

        if (saved) {
          const pinnedData = JSON.parse(saved);
          this.pinnedCardKeys = new Set(pinnedData.cardKeys || []);
          this.pinnedCards = pinnedData.cards || [];
        }
      } catch (error) {
        console.warn("Erro ao carregar cards fixos:", error);
        this.pinnedCards = [];
        this.pinnedCardKeys = new Set();
      }
    },

    updatePinnedCards(newData) {
      // Atualiza os cards fixos com dados mais recentes da API
      const updatedPinnedCards = [];

      this.pinnedCards.forEach((pinnedCard) => {
        const pinnedKey = this.createSurebetKey(pinnedCard);

        // Procura por dados atualizados na nova resposta da API
        const updatedCard = newData
          ? Object.values(newData).find((surebet) => {
              const surebetKey = this.createSurebetKey(surebet);
              return surebetKey === pinnedKey;
            })
          : null;

        if (updatedCard) {
          updatedPinnedCards.push(updatedCard);
        } else {
          // Se não encontrou dados atualizados, mantém o card antigo
          updatedPinnedCards.push(pinnedCard);
        }
      });

      this.pinnedCards = updatedPinnedCards;
    },

    scrollToPinnedCards() {
      const pinnedSection = document.querySelector(".pinned-cards-section");
      if (pinnedSection) {
        pinnedSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },

    // Métodos para drag and drop
    toggleDragMode() {
      this.dragMode = !this.dragMode;
      if (!this.dragMode) {
        // Limpa estados de drag quando desativa o modo
        this.draggedIndex = null;
        this.dragOverIndex = null;
      }
      this.showNotification(
        this.dragMode
          ? "Modo de arrastar ativado!"
          : "Modo de arrastar desativado!"
      );
    },

    onDragStart(event) {
      if (!this.dragMode) return;

      const index = parseInt(event.target.dataset.index);
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", event.target.outerHTML);

      // Adiciona classe visual ao card sendo arrastado
      event.target.style.opacity = "0.5";
    },

    onDragEnd(event) {
      if (!this.dragMode) return;

      // Remove classe visual
      event.target.style.opacity = "1";
      this.draggedIndex = null;
      this.dragOverIndex = null;
    },

    onDragEnter(event) {
      if (!this.dragMode || this.draggedIndex === null) return;

      const dragTarget = event.target.closest(".pinned-card-wrapper");
      if (!dragTarget) return;

      const index = parseInt(dragTarget.dataset.index);
      if (index !== this.draggedIndex && !isNaN(index)) {
        this.dragOverIndex = index;
      }
    },

    onDrop(event) {
      if (!this.dragMode || this.draggedIndex === null) return;

      event.preventDefault();

      const dropTarget = event.target.closest(".pinned-card-wrapper");
      if (!dropTarget) return;

      const dropIndex = parseInt(dropTarget.dataset.index);

      if (
        dropIndex !== this.draggedIndex &&
        dropIndex !== undefined &&
        !isNaN(dropIndex)
      ) {
        // Reorganiza os cards
        const draggedCard = this.pinnedCards[this.draggedIndex];

        // Remove o card da posição original
        this.pinnedCards.splice(this.draggedIndex, 1);

        // Insere o card na nova posição
        this.pinnedCards.splice(dropIndex, 0, draggedCard);

        // Salva a nova ordem
        this.savePinnedCards();

        this.showNotification("Card reorganizado!");
      }

      this.draggedIndex = null;
      this.dragOverIndex = null;
    },

    // Novo método: Reforça o estado dos filtros se necessário
    reinforceFilterState() {
      // Verifica se algum filtro está vazio e reforça se necessário
      // MAS não interfere se o usuário explicitamente desmarcou todos
      let needsReinforcement = false;

      // Verifica se o usuário explicitamente desmarcou todos os filtros
      // Se sim, não força a re-seleção automática
      const userExplicitlyDeselectedAll =
        this.checkIfUserExplicitlyDeselectedAll();

      if (userExplicitlyDeselectedAll) {
        console.log(
          "🔒 Usuário explicitamente desmarcou todos os filtros - não interferindo"
        );
        return false;
      }

      if (!this.selectedHouses || this.selectedHouses.length === 0) {
        const availableHouses =
          this.availableBookmakers.length > 0
            ? this.availableBookmakers
            : filterOptions.houses;
        this.selectedHouses = [...availableHouses];
        needsReinforcement = true;
      }

      if (!this.selectedSports || this.selectedSports.length === 0) {
        this.selectedSports = this.filterOptions.sports.map(
          (sport) => sport.value
        );
        needsReinforcement = true;
      }

      if (!this.selectedCurrencies || this.selectedCurrencies.length === 0) {
        this.selectedCurrencies = this.filterOptions.currencies.map(
          (currency) => currency.code
        );
        needsReinforcement = true;
      }

      if (needsReinforcement) {
        console.log("🔧 Estado dos filtros reforçado");
        this.saveFiltersToSettings();
        this.updateFiltersCache();
      }

      return needsReinforcement;
    },

    // Novo método: Verifica se o usuário explicitamente desmarcou todos os filtros
    checkIfUserExplicitlyDeselectedAll() {
      // Verifica se isso aconteceu recentemente (últimos 5 segundos)
      const now = Date.now();
      const lastDeselectTime = this.lastDeselectAllTime || 0;

      if (now - lastDeselectTime < 5000) {
        console.log(
          "🔒 Detectado desmarcação explícita recente - não interferindo"
        );
        return true;
      }

      return false;
    },
    // Carrega configurações de busca automática das configurações salvas
    loadAutoSearchSettings() {
      try {
        const savedSettings = localStorage.getItem("app_settings");
        console.log(
          "🔍 DEBUG: Conteúdo completo do localStorage:",
          savedSettings
        );

        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log("🔍 DEBUG: Configurações parseadas:", settings);
          console.log(
            "🔍 DEBUG: Configurações autoSearch:",
            settings.autoSearch
          );

          if (settings.autoSearch) {
            // Aplicar configuração de busca automática habilitada/desabilitada
            if (settings.autoSearch.enabled !== undefined) {
              this.isSearching = settings.autoSearch.enabled;
              console.log(
                "🔍 Configuração de busca automática carregada:",
                this.isSearching ? "Habilitada" : "Desabilitada"
              );
            }

            // Aplicar intervalo de atualização
            if (
              settings.autoSearch.interval &&
              !isNaN(Number(settings.autoSearch.interval))
            ) {
              this.autoUpdateInterval =
                Number(settings.autoSearch.interval) * 1000; // Converter para milissegundos
              console.log(
                "⏱️ Intervalo de atualização carregado:",
                this.autoUpdateInterval / 1000,
                "segundos"
              );
            } else {
              this.autoUpdateInterval = 300000; // Valor padrão: 5 minutos
              console.log("⏱️ Usando intervalo padrão de 5 minutos");
            }

            // Aplicar configuração de busca em segundo plano
            if (settings.autoSearch.background !== undefined) {
              this.backgroundSearch = settings.autoSearch.background;
              console.log(
                "🔄 Busca em segundo plano:",
                this.backgroundSearch ? "Habilitada" : "Desabilitada"
              );
            }
          } else {
            console.log(
              "⚠️ Nenhuma configuração de busca automática encontrada, usando valores padrão"
            );
            this.autoUpdateInterval = 300000;
            this.backgroundSearch = true;
          }
        } else {
          console.log(
            "⚠️ Nenhuma configuração salva encontrada, usando valores padrão"
          );
          this.autoUpdateInterval = 300000;
          this.backgroundSearch = true;
        }

        // Log final das configurações aplicadas
        console.log("✅ Configurações de busca automática aplicadas:");
        console.log("  - Busca habilitada:", this.isSearching);
        console.log(
          "  - Intervalo:",
          this.autoUpdateInterval / 1000,
          "segundos"
        );
        console.log("  - Busca em segundo plano:", this.backgroundSearch);
      } catch (error) {
        console.log(
          "Erro ao carregar configurações de busca automática:",
          error
        );
        // Usar valores padrão em caso de erro
        this.autoUpdateInterval = 300000;
        this.backgroundSearch = true;
      }
    },

    // Atualiza as variáveis CSS para o grid - sempre 3 colunas
    updateGridCSSVariables() {
      const root = document.documentElement;

      // Sempre 3 colunas para o grid principal
      root.style.setProperty("--grid-columns", "3");

      // Configurações responsivas simplificadas
      root.style.setProperty("--grid-columns-mobile", "1");
      root.style.setProperty("--grid-columns-tablet", "2");
      root.style.setProperty("--grid-columns-medium", "2");

      // Configurações específicas para sidebar - sempre 3 colunas
      root.style.setProperty("--grid-columns-sidebar-collapsed", "3");
      root.style.setProperty("--grid-columns-sidebar-expanded", "3");
      root.style.setProperty("--grid-columns-sidebar-expanded-small", "2");

      // Forçar re-render do grid
      this.$nextTick(() => {
        // Verificar se as variáveis CSS foram aplicadas
        const computedStyle = getComputedStyle(document.documentElement);
        const gridColumnsValue =
          computedStyle.getPropertyValue("--grid-columns");

        console.log("🎨 Variáveis CSS do grid atualizadas:", {
          gridColumns: this.gridColumns,
          sidebarCollapsed: this.sidebarCollapsed,
          cssVariable: gridColumnsValue,
          cssApplied: gridColumnsValue === "3",
        });

        // Se as variáveis CSS não foram aplicadas, tentar novamente
        if (gridColumnsValue !== "3") {
          console.warn(
            "⚠️ Variáveis CSS não aplicadas corretamente, tentando novamente..."
          );
          setTimeout(() => this.updateGridCSSVariables(), 100);
        }
      });
    },

    formatSelectedDate() {
      // ... existing code ...
    },
    // ... existing code ...
  },
};
</script>

<style lang="scss" scoped>
/* Importação removida para evitar conflitos de build */

.surebets-container {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden; /* Apenas esconder overflow horizontal */
  overflow-y: auto; /* Permitir scroll vertical */
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, margin-left 0.3s ease;
  width: calc(100% - 280px); /* Largura ajustada para evitar barra horizontal */
  max-width: calc(100% - 280px);
  margin-left: 280px; /* Espaço para o sidebar fixo */
  box-sizing: border-box;

  &.sidebar-collapsed {
    margin-left: 80px; /* Espaço reduzido quando sidebar colapsado */
    width: calc(100% - 80px); /* Largura ajustada quando colapsado */
    max-width: calc(100% - 80px);
  }
}

/* Scrollbar personalizada para o main-content */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
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
  overflow: hidden; /* Remove overflow do sidebar */

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
    background: rgba(var(--error-color-rgb), 0.1);
    color: var(--error-color);
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
  overflow-y: auto; /* Habilita scroll vertical apenas no main-content */
  overflow-x: hidden; /* Previne overflow horizontal */
  width: 100%; /* Garante que o conteúdo ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  min-height: 0; /* Permite que o conteúdo cresça além da altura do container */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.search-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: var(--bg-overlay);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-card);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  min-height: 36px;
  min-width: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }

  &.pinned-indicator {
    background: var(--error-color);
    color: var(--text-primary);
    border-color: var(--error-color);
    display: flex;
    align-items: center;
    gap: 6px;

    .control-icon {
      color: var(--text-primary);
      stroke-width: 2;
    }
  }
}

.control-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.search-indicator {
  font-size: 14px;
  animation: spin 2s linear infinite;
  margin-left: 8px;
  filter: drop-shadow(0 2px 4px rgba(var(--accent-primary-rgb), 0.3));
}

.filter-toggle-btn {
  position: relative;
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-primary) !important;
  color: var(--text-primary) !important;

  &:hover {
    background: var(--bg-hover) !important;
    border-color: var(--accent-primary) !important;
  }
}

.filters {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border-primary);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: space-between;
}

.filter-tabs .filter-tab {
  flex-shrink: 0;
}

.games-found-info {
  margin-bottom: 20px;
}

.surebets-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-primary);
}

.more-available {
  color: var(--primary-color);
  font-weight: 600;
}

.games-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-primary);
}

/* Campo de busca por tipo de mercado */
.market-search-section {
  margin-bottom: 20px;
}

.market-search-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.market-search-container .search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
}

.market-search-container .search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  z-index: 2;
}

.market-search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
  }

  &:hover {
    border-color: var(--border-hover);
  }
}

.market-search-container .clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: var(--error-color);
  color: var(--text-primary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: var(--error-hover);
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
}

.market-search-results-info {
  padding: 8px 12px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border: 1px solid rgba(var(--accent-primary-rgb), 0.3);
  border-radius: 6px;
  font-size: 13px;
  color: var(--accent-primary);
}

.search-results-text {
  font-weight: 500;
  color: var(--accent-primary);
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
  min-width: 680px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-select-container {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 8px;

    &:checked {
      background: var(--accent-primary);
      color: var(--bg-primary);
    }
  }
}

.clear-filters-btn {
  padding: 8px 16px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: var(--bg-hover);
  }
}

.filter-tab {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-color: var(--accent-primary);
  }
}

.refresh-btn {
  color: white;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--primary-hover),
    var(--primary-color)
  );
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, var(--text-muted), var(--text-muted));
}

.surebets-list {
  flex: 1;
  padding: 24px 32px;
  overflow: visible;
  width: 100%;
  min-height: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes lockPulse {
  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 5px var(--warning-color));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px var(--warning-color));
  }
}

@keyframes lockGlow {
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 5px var(--warning-color);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 10px var(--warning-color);
  }
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
  color: var(--text-secondary);
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
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(
    45deg,
    var(--accent-primary),
    var(--accent-secondary),
    var(--accent-primary)
  );
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
  background: var(--accent-primary);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-50%) scale(1.2);
  }
}

/* Texto com efeito de digitação */
.typing-text {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 20px 0;
  position: relative;
  z-index: 2;
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: var(--accent-primary);
  }
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
    color: var(--text-muted);
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
  background: var(--accent-primary);
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite both;

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
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
  background: rgba(var(--bg-secondary-rgb), 0.8);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  min-width: 120px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: var(--accent-primary);
    box-shadow: 0 10px 20px rgba(var(--accent-primary-rgb), 0.2);
  }
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 8px;
  animation: numberCount 2s ease-out;
}

@keyframes numberCount {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.surebets-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(320px, 1fr)
  ); /* Grid responsivo automático */
  gap: 16px; /* Aumentado gap para melhor espaçamento entre os cards */
  max-width: 100%;
  width: 100%; /* Garante que o grid ocupe toda a largura disponível */
  overflow: hidden; /* Previne overflow */

  /* Adiciona margin-top aos primeiros cards para evitar que o efeito hover seja cortado */
  > *:nth-child(-n + 3) {
    margin-top: 8px;
  }
}

/* Estilos para o botão "Ver mais" */
.load-more-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  padding: 0 16px;
}

.load-more-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #000000;
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  min-width: 160px;
  max-width: 180px;
  position: relative;
  overflow: hidden;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
}

.load-more-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, #047857, #065f46);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border-color: #6b7280;
  color: #9ca3af;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.load-more-btn.loading {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border-color: #6b7280;
  color: #9ca3af;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Seção de Cards Fixos */
.pinned-cards-section {
  margin-top: 24px; /* Adiciona margin-top para evitar sobreposição com outras informações */
  padding: 24px 32px;
  padding-top: 40px; /* Aumentado padding-top para dar mais espaço */
  padding-bottom: 32px; /* Adicionado padding-bottom para melhor espaçamento */
  border-bottom: 2px solid var(--error-color);
  background: linear-gradient(
    135deg,
    rgba(var(--error-color-rgb), 0.05) 0%,
    rgba(var(--error-color-rgb), 0.02) 100%
  );
  position: relative;
  width: 100%; /* Garante que a seção ocupe toda a largura disponível */
  max-width: 100%; /* Previne overflow horizontal */
  overflow: visible; /* Mudado para visible para permitir efeitos hover */

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--error-color),
      var(--error-hover),
      var(--error-color)
    );
  }
}

.pinned-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px; /* Aumentado margin-bottom para mais espaço */
  padding: 20px 24px; /* Aumentado padding para mais espaço interno */
  background: rgba(var(--error-color-rgb), 0.1);
  border: 1px solid rgba(var(--error-color-rgb), 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(var(--error-color-rgb), 0.1); /* Adicionado sombra sutil */
}

.pinned-title {
  display: flex;
  align-items: center;
  gap: 14px; /* Aumentado gap para mais espaço entre ícone e texto */
  font-size: 22px; /* Aumentado tamanho da fonte */
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  transition: all 0.3s ease;

  .pin-icon {
    color: var(--error-color);
    stroke-width: 2;
    animation: pinFloat 2s ease-in-out infinite;
    flex-shrink: 0; /* Previne que o ícone seja comprimido */
  }

  &.limit-reached {
    color: var(--error-color);

    .pin-icon {
      color: var(--error-hover);
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes pinGlow {
  0%,
  100% {
    box-shadow: 0 8px 20px rgba(var(--error-color-rgb), 0.3);
  }
  50% {
    box-shadow: 0 8px 20px rgba(var(--error-color-rgb), 0.6);
  }
}

@keyframes pulse {
  0%,
  100% {
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
  background: rgba(var(--error-color-rgb), 0.2);
  border: 1px solid rgba(var(--error-color-rgb), 0.5);
  border-radius: 8px;
  color: var(--error-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: rgba(var(--error-color-rgb), 0.3);
    border-color: var(--error-color);
    transform: translateY(-2px); /* Aumentado efeito hover */
    box-shadow: 0 4px 12px rgba(var(--error-color-rgb), 0.3); /* Adicionado sombra no hover */
  }

  .clear-icon {
    font-size: 16px;
    flex-shrink: 0; /* Previne que o ícone seja comprimido */
  }
}

.pinned-cards-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(320px, 1fr)
  ); /* Grid responsivo automático */
  gap: 20px; /* Reduzido gap para dar mais espaço ao conteúdo dos cards */
  max-width: 100%;
  width: 100%; /* Garante que o grid ocupe toda a largura disponível */
  overflow: hidden; /* Previne overflow */
  padding: 8px 16px; /* Adiciona padding vertical e horizontal para evitar corte dos efeitos hover e informações */
}

/* Grid responsivo automático - não precisa de media queries específicas */

@media (max-width: 1023px) {
  .surebets-container {
    margin-left: 0; /* Remove margem em mobile/tablet */
    width: 100%; /* Largura total em mobile */
    max-width: 100%; /* Largura máxima total em mobile */
    overflow-x: hidden; /* Evitar scroll horizontal */
    overflow-y: auto; /* Permitir scroll vertical */
    -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
  }
}

@media (max-width: 700px) {
  .surebets-container {
    width: 100vw; /* Largura total da viewport */
    max-width: 100vw; /* Largura máxima da viewport */
    margin-left: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

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
    grid-template-columns: 1fr !important; /* Uma coluna em mobile */
    gap: 12px; /* Gap menor para mobile */
    padding: 0 8px; /* Padding lateral para evitar corte */
  }

  .load-more-container {
    margin: 24px 0;
    padding: 0 8px;
  }

  .load-more-btn {
    padding: 12px 20px;
    font-size: 14px;
    min-width: 140px;
    max-width: 160px;
  }
  .pinned-cards-grid {
    grid-template-columns: repeat(
      auto-fit,
      minmax(280px, 1fr)
    ) !important; /* Grid automático com minmax menor para mobile */
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
    padding: 16px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .search-controls {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .surebets-container {
    width: 100vw;
    max-width: 100vw;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .main-content {
    width: 100%;
    max-width: 100%;
    padding: 0 4px; /* Padding mínimo para evitar corte */
  }

  .surebets-grid {
    grid-template-columns: 1fr !important;
    gap: 8px;
    padding: 0 4px;
  }

  .page-title {
    font-size: 18px; /* Reduzido para mobile pequeno */
  }

  .page-subtitle {
    font-size: 13px;
  }
}

/* Overlay de Filtros */
.filter-overlay {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-primary);
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
    color: var(--text-primary);
    margin: 0;
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
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
    background: var(--bg-hover);
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
  border-bottom: 2px solid var(--border-primary);

  h4 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
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
  background: var(--border-primary);
  margin: 20px 0;
  opacity: 0.6;
  position: relative;
  z-index: 1;
}

.filter-section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
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
  background: rgba(var(--accent-primary-rgb), 0.1);
  color: var(--accent-primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(var(--accent-primary-rgb), 0.3);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: var(--bg-hover);
  }
}

/* Filtro de Data */
.date-filter {
  .date-select {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
    }

    option {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  }

  .date-help {
    font-size: 12px;
    color: var(--text-muted);
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

/* Filtros de Nível de Risco */
.risk-level-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.risk-filter-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  min-height: 80px;
  justify-content: center;
}

.risk-filter-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  border-radius: 10px;
}

.risk-filter-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.risk-filter-btn:hover::before {
  opacity: 0.1;
}

.risk-filter-btn:hover .risk-indicator {
  transform: scale(1.1);
}

.risk-filter-btn:hover .risk-title {
  color: var(--accent-primary);
}

.risk-filter-btn:hover .risk-description {
  color: var(--text-primary);
  opacity: 0.9;
}

/* Efeito de brilho sutil no hover */
.risk-filter-btn:hover::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  opacity: 0.6;
  z-index: 1;
  border-radius: 10px;
  pointer-events: none;
}

.risk-filter-btn.active {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.15);
  color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.risk-filter-btn.active::before {
  opacity: 0.2;
}

.risk-filter-btn.active .risk-indicator {
  transform: scale(1.05);
}

.risk-filter-btn.active .risk-title {
  color: var(--accent-primary);
  font-weight: 700;
}

.risk-filter-btn.active .risk-description {
  color: var(--text-primary);
  opacity: 0.8;
}

.risk-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.risk-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-bottom: 2px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.risk-indicator::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
}

.risk-indicator.conservative {
  background: var(--success);
  color: white;
}

.risk-indicator.moderate {
  background: var(--warning);
  color: white;
}

.risk-indicator.risky {
  background: var(--error);
  color: white;
}

.risk-indicator.all {
  background: var(--text-secondary);
  color: var(--bg-primary);
}

.risk-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.risk-description {
  font-size: 10px;
  opacity: 0.7;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.risk-filter-btn.active .risk-description {
  color: rgba(255, 255, 255, 0.8);
}

.risk-filter-btn.active .risk-title {
  color: white;
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
  .risk-level-filters {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .risk-filter-btn {
    min-height: 70px;
    padding: 14px 10px;
  }
}

.profit-input {
  flex: 1;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.profit-separator {
  color: var(--text-muted);
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
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: var(--bg-hover);
  }
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
}

.search-results-info {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-radius: 4px;
  border-left: 3px solid var(--accent-primary);
}

.search-results-text {
  font-size: 12px;
  color: var(--accent-primary);
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
    background: var(--bg-hover);
  }
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.checkbox-label {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer dos Filtros */
.filter-footer {
  padding: 20px;
  border-top: 1px solid var(--border-primary);
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
  background: var(--bg-overlay);
  color: var(--text-primary);

  &:hover {
    background: var(--bg-hover);
  }
}

.apply-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);

  &:hover {
    background: var(--accent-secondary);
  }
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
}

.saved-filters-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
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
  border-top: 1px solid var(--border-primary);
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
}

.filter-name-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.filter-preview {
  background: var(--bg-overlay);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  }
}

.preview-item {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;

  strong {
    color: var(--text-primary);
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
  background: var(--bg-overlay);
  color: var(--text-primary);

  &:hover {
    background: var(--bg-hover);
  }
}

.save-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);

  &:hover {
    background: var(--accent-secondary);
  }

  &:disabled {
    background: var(--bg-overlay);
    color: var(--text-muted);
    cursor: not-allowed;
  }
}

.empty-filters {
  text-align: center;
  color: var(--text-secondary);

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
  background: var(--bg-overlay);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-hover);
  }
}

.filter-info {
  flex: 1;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
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
  color: var(--text-secondary);
  background: var(--bg-tertiary);
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
  background: var(--accent-primary);
  color: var(--bg-primary);

  &:hover {
    background: var(--accent-secondary);
  }
}

.delete-btn {
  background: var(--error-color);
  color: var(--text-primary);

  &:hover {
    background: var(--error-hover);
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
  background: rgba(var(--error-color-rgb), 0.1);
  border: 1px solid rgba(var(--error-color-rgb), 0.3);

  &.connected {
    background: rgba(var(--accent-primary-rgb), 0.1);
    border-color: rgba(var(--accent-primary-rgb), 0.3);
  }

  &.polling {
    background: rgba(var(--warning-color-rgb), 0.1);
    border-color: rgba(var(--warning-color-rgb), 0.3);
  }
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--error-color);
  animation: pulse 2s infinite;

  .status-item.connected & {
    background: var(--accent-primary);
  }

  .status-item.polling & {
    background: var(--warning-color);
  }
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);

  .status-item.connected & {
    color: var(--accent-primary);
  }

  .status-item.polling & {
    color: var(--warning-color);
  }
}

@keyframes pulse {
  0%,
  100% {
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
  background: rgba(var(--bg-secondary-rgb), 0.2);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.market-option:hover {
  background: rgba(var(--bg-secondary-rgb), 0.4);
  border-color: var(--border-primary);
}

.market-option .checkbox-label {
  font-size: 12px;
  line-height: 1.3;
}

/* Filtros de Data */
.date-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-wrap: nowrap;
}

.date-filter-label {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.date-filter-input {
  padding: 6px 10px;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 0.85em;
  min-width: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
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
  padding: 4px 8px;
  border: 1px solid var(--error-color);
  background: transparent;
  color: var(--error-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1em;
  font-weight: bold;
  min-width: 24px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--error-color);
    color: var(--text-primary);
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
    box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.3);
  }

  &.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
    box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  .drag-hint {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--backdrop);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    animation: fadeInHint 0.5s ease forwards;
    pointer-events: none;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--backdrop);
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
    box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.4);
  }
}

.pinned-card-wrapper[draggable="true"] {
  cursor: grab;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
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
    box-shadow: 0 2px 8px rgba(var(--accent-primary-rgb), 0.3);
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
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* CSS para o layout melhorado dos filtros */
.filters {
  padding: 20px 32px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.search-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-color: var(--accent-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.refresh-btn {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);

  &:hover:not(:disabled) {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-color: var(--accent-primary);
  }

  &.live-tab-locked {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: var(--bg-secondary);
      border-color: var(--border-primary);
    }
  }
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.date-filter-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.date-filter-input {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.clear-date-btn {
  width: 24px;
  height: 24px;
  background: var(--error-color);
  color: var(--bg-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: var(--error-hover);
    transform: scale(1.1);
  }
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 450px;
  margin-left: auto;
  flex-wrap: wrap;
  gap: 8px;

  &:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
  }
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  margin-right: 8px;
  flex-shrink: 0;
}

.market-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.clear-search-btn {
  width: 20px;
  height: 20px;
  background: var(--error-color);
  color: var(--bg-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--error-hover);
    transform: scale(1.1);
  }
}

.games-found-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.surebets-count {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.more-available {
  color: var(--accent-primary);
  font-weight: 600;
}

.market-search-results-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--accent-hover-bg);
  border: 1px solid var(--accent-primary);
  border-radius: 6px;
}

.search-results-text {
  font-size: 13px;
  color: var(--accent-primary);
  font-weight: 500;
}

/* Responsividade para mobile */
@media (max-width: 768px) {
  .filters {
    padding: 16px 20px;
  }

  .search-controls {
    gap: 8px;
    margin-bottom: 12px;
  }

  .control-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .filter-tabs {
    gap: 12px;
    flex-direction: column;
    align-items: stretch;
  }

  .date-filters {
    margin-left: 0;
    justify-content: center;
  }

  .search-input-wrapper {
    min-width: 100%;
    margin-left: 0;
    margin-top: 12px;
  }
}

/* Estilos para busca unificada */
.unified-search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  min-width: 200px;

  &::placeholder {
    color: var(--text-secondary);
  }
}

.search-type-indicator {
  display: flex;
  align-items: center;
}

.search-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.market {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  &.bookmaker {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  &.tournament {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    border: 1px solid rgba(168, 85, 247, 0.2);
  }

  &.sport {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  &.general {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
    border: 1px solid rgba(107, 114, 128, 0.2);
  }
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-secondary);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.active {
    background: var(--bg-secondary);
  }

  .suggestion-type {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
    margin-right: 12px;
    min-width: 80px;
  }

  .suggestion-text {
    font-size: 14px;
    color: var(--text-primary);
    flex: 1;
  }
}

.unified-search-results-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 8px;

  .search-results-text {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;

    .search-type-info {
      color: var(--text-secondary);
      font-weight: 400;
      font-style: italic;
    }
  }
}

@media (max-width: 480px) {
  .filters {
    padding: 12px 16px;
  }

  .search-controls {
    flex-direction: column;
    gap: 8px;
  }

  .control-btn {
    justify-content: center;
  }

  .filter-tab {
    justify-content: center;
  }
}
</style>
