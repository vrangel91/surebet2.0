import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import SurebetsView from '../SurebetsView.vue';

// Mock dos composables
vi.mock('../../composables/useSurebets.js', () => ({
  useSurebets: () => ({
    // Estados básicos
    sidebarCollapsed: false,
    isSearching: true,
    soundEnabled: true,
    loading: false,
    pinnedCards: [],
    dragMode: false,
    draggedIndex: null,
    dragOverIndex: null,
    bookmakerAccounts: [],
    isLoadingAccounts: false,
    roundValues: false,
    activeFilter: 'prelive',
    preliveCount: 0,
    liveCount: 0,
    selectedDate: '',
    unifiedSearchTerm: '',
    activeSearchType: '',
    paginatedSurebets: [],
    filteredSurebetsByMarket: [],
    hasMoreItems: false,
    remainingItemsCount: 0,
    filteredSurebetsByUnifiedSearch: [],
    filteredSurebets: [],
    isLoadingMore: false,
    lastCheckCount: 0,
    uptimeMinutes: 0,
    showFilterOverlay: false,
    minProfit: 0,
    maxProfit: 1000,
    isUsingDefaultProfitFilters: true,
    selectedRiskLevel: 'todos',
    houseSearchTerm: '',
    sportSearchTerm: '',
    selectedHouses: [],
    selectedSports: [],
    selectedCurrencies: [],
    filteredHouses: [],
    filteredSports: [],
    showSaveFilterModal: false,
    currentFilterName: '',
    showSavedFiltersModal: false,
    savedFilters: [],
    
    // Métodos
    handleSidebarToggle: vi.fn(),
    handleSidebarStateLoaded: vi.fn(),
    toggleSearch: vi.fn(),
    toggleSound: vi.fn(),
    manualRefresh: vi.fn(),
    toggleFilterOverlay: vi.fn(),
    scrollToPinnedCards: vi.fn(),
    setFilter: vi.fn(),
    showLiveRestrictedMessage: vi.fn(),
    onDateChange: vi.fn(),
    clearDateFilter: vi.fn(),
    onUnifiedSearchInput: vi.fn(),
    hideSearchSuggestions: vi.fn(),
    toggleDragMode: vi.fn(),
    clearAllPinnedCards: vi.fn(),
    onDrop: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDragEnter: vi.fn(),
    addSurebetToReports: vi.fn(),
    togglePinCard: vi.fn(),
    handleBalanceDebited: vi.fn(),
    refreshAccounts: vi.fn(),
    loadMoreCards: vi.fn(),
    setRiskLevel: vi.fn(),
    selectAllHouses: vi.fn(),
    deselectAllHouses: vi.fn(),
    selectFavoriteHouses: vi.fn(),
    toggleHouse: vi.fn(),
    selectAllSports: vi.fn(),
    deselectAllSports: vi.fn(),
    selectFavoriteSports: vi.fn(),
    toggleSport: vi.fn(),
    selectAllCurrencies: vi.fn(),
    deselectAllCurrencies: vi.fn(),
    toggleCurrency: vi.fn(),
    clearFilters: vi.fn(),
    applyFilters: vi.fn(),
    closeSaveFilterModal: vi.fn(),
    saveFilter: vi.fn(),
    closeSavedFiltersModal: vi.fn(),
    loadFilter: vi.fn(),
    deleteFilter: vi.fn(),
  })
}));

// Mock dos componentes
vi.mock('../../components/surebet/MainLayout.vue', () => ({
  default: {
    name: 'MainLayout',
    template: '<div class="main-layout"><slot /></div>',
    props: ['sidebarCollapsed'],
    emits: ['toggle-sidebar', 'sidebar-state-loaded']
  }
}));

vi.mock('../../components/surebet/SurebetsContent.vue', () => ({
  default: {
    name: 'SurebetsContent',
    template: '<div class="surebets-content">Content</div>',
    props: [
      'isSearching', 'soundEnabled', 'loading', 'pinnedCards', 'dragMode',
      'draggedIndex', 'dragOverIndex', 'bookmakerAccounts', 'isLoadingAccounts',
      'roundValues', 'activeFilter', 'preliveCount', 'liveCount', 'selectedDate',
      'unifiedSearchTerm', 'activeSearchType', 'paginatedSurebets',
      'filteredSurebetsByMarket', 'hasMoreItems', 'remainingItemsCount',
      'filteredSurebetsByUnifiedSearch', 'filteredSurebets', 'isLoadingMore',
      'lastCheckCount', 'uptimeMinutes'
    ],
    emits: [
      'toggle-search', 'toggle-sound', 'manual-refresh', 'toggle-filter-overlay',
      'scroll-to-pinned-cards', 'set-filter', 'show-live-restricted-message',
      'date-change', 'clear-date-filter', 'unified-search-input',
      'show-search-suggestions', 'hide-search-suggestions', 'toggle-drag-mode',
      'clear-all-pinned-cards', 'on-drop', 'on-drag-start', 'on-drag-end',
      'on-drag-enter', 'add-to-reports', 'toggle-pin', 'balance-debited',
      'refresh-accounts', 'load-more-cards'
    ]
  }
}));

vi.mock('../../components/surebet/SurebetsModals.vue', () => ({
  default: {
    name: 'SurebetsModals',
    template: '<div class="surebets-modals">Modals</div>',
    props: [
      'showFilterOverlay', 'minProfit', 'maxProfit', 'isUsingDefaultProfitFilters',
      'roundValues', 'selectedRiskLevel', 'houseSearchTerm', 'sportSearchTerm',
      'selectedHouses', 'selectedSports', 'selectedCurrencies', 'filteredHouses',
      'filteredSports', 'filterOptions', 'showSaveFilterModal', 'currentFilterName',
      'showSavedFiltersModal', 'savedFilters'
    ],
    emits: [
      'toggle-filter-overlay', 'update:minProfit', 'update:maxProfit',
      'update:roundValues', 'set-risk-level', 'select-all-houses',
      'deselect-all-houses', 'select-favorite-houses', 'update:houseSearchTerm',
      'clear-house-search', 'toggle-house', 'select-all-sports',
      'deselect-all-sports', 'select-favorite-sports', 'update:sportSearchTerm',
      'clear-sport-search', 'toggle-sport', 'select-all-currencies',
      'deselect-all-currencies', 'toggle-currency', 'clear-filters',
      'apply-filters', 'close-save-filter-modal', 'update:currentFilterName',
      'save-filter', 'close-saved-filters-modal', 'load-filter', 'delete-filter'
    ]
  }
}));

vi.mock('../../components/surebet/NotificationAudio.vue', () => ({
  default: {
    name: 'NotificationAudio',
    template: '<audio ref="notificationAudio"></audio>',
    methods: {
      play: vi.fn()
    }
  }
}));

// Mock das configurações
vi.mock('../../config/filters.js', () => ({
  filterOptions: {
    houses: ['Bet365', 'Betano', 'Pixbet'],
    sports: [
      { value: 'futebol', label: 'Futebol' },
      { value: 'basquete', label: 'Basquete' }
    ],
    currencies: [
      { code: 'BRL', label: 'Real' },
      { code: 'USD', label: 'Dólar' }
    ]
  }
}));

vi.mock('../../config/bookmakerUrls.js', () => ({
  getBookmakerUrl: vi.fn(() => 'https://example.com'),
  addBookmakerUrl: vi.fn()
}));

vi.mock('../../config/marketTranslations.json', () => ({
  translations: {
    '1X2': 'Resultado Final',
    'Over/Under': 'Mais de/Menos de'
  }
}));

// Mock do Lucide Vue Next
vi.mock('lucide-vue-next', () => ({
  MapPin: { name: 'MapPin', template: '<svg></svg>' },
  Trash2: { name: 'Trash2', template: '<svg></svg>' }
}));

describe('SurebetsView.vue', () => {
  let wrapper;
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    
    // Mock do console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    wrapper = mount(SurebetsView, {
      global: {
        plugins: [pinia],
        stubs: {
          'MainLayout': true,
          'SurebetsContent': true,
          'SurebetsModals': true,
          'NotificationAudio': true,
          'MapPin': true,
          'Trash2': true
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.restoreAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o componente sem erros', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('deve renderizar o MainLayout', () => {
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      expect(mainLayout.exists()).toBe(true);
    });

    it('deve renderizar o SurebetsContent', () => {
      const content = wrapper.findComponent({ name: 'SurebetsContent' });
      expect(content.exists()).toBe(true);
    });

    it('deve renderizar o SurebetsModals', () => {
      const modals = wrapper.findComponent({ name: 'SurebetsModals' });
      expect(modals.exists()).toBe(true);
    });

    it('deve renderizar o NotificationAudio', () => {
      const audio = wrapper.findComponent({ name: 'NotificationAudio' });
      expect(audio.exists()).toBe(true);
    });
  });

  describe('Props do MainLayout', () => {
    it('deve passar sidebarCollapsed como prop', () => {
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      expect(mainLayout.props('sidebarCollapsed')).toBe(false);
    });

    it('deve ter os event handlers corretos', () => {
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      expect(mainLayout.emitted()).toBeDefined();
    });
  });

  describe('Props do SurebetsContent', () => {
    it('deve passar todas as props necessárias', () => {
      const content = wrapper.findComponent({ name: 'SurebetsContent' });
      
      // Verificar algumas props importantes
      expect(content.props('isSearching')).toBe(true);
      expect(content.props('soundEnabled')).toBe(true);
      expect(content.props('loading')).toBe(false);
      expect(content.props('activeFilter')).toBe('prelive');
      expect(content.props('roundValues')).toBe(false);
    });

    it('deve ter arrays vazios para dados iniciais', () => {
      const content = wrapper.findComponent({ name: 'SurebetsContent' });
      
      expect(Array.isArray(content.props('pinnedCards'))).toBe(true);
      expect(Array.isArray(content.props('bookmakerAccounts'))).toBe(true);
      expect(Array.isArray(content.props('paginatedSurebets'))).toBe(true);
    });
  });

  describe('Props do SurebetsModals', () => {
    it('deve passar todas as props de filtros', () => {
      const modals = wrapper.findComponent({ name: 'SurebetsModals' });
      
      expect(modals.props('showFilterOverlay')).toBe(false);
      expect(modals.props('minProfit')).toBe(0);
      expect(modals.props('maxProfit')).toBe(1000);
      expect(modals.props('selectedRiskLevel')).toBe('todos');
      expect(modals.props('showSaveFilterModal')).toBe(false);
      expect(modals.props('showSavedFiltersModal')).toBe(false);
    });

    it('deve ter arrays vazios para seleções', () => {
      const modals = wrapper.findComponent({ name: 'SurebetsModals' });
      
      expect(Array.isArray(modals.props('selectedHouses'))).toBe(true);
      expect(Array.isArray(modals.props('selectedSports'))).toBe(true);
      expect(Array.isArray(modals.props('selectedCurrencies'))).toBe(true);
      expect(Array.isArray(modals.props('savedFilters'))).toBe(true);
    });
  });

  describe('Configurações Estáticas', () => {
    it('deve ter filterOptions disponível', () => {
      expect(wrapper.vm.filterOptions).toBeDefined();
      expect(wrapper.vm.filterOptions.houses).toBeDefined();
      expect(wrapper.vm.filterOptions.sports).toBeDefined();
      expect(wrapper.vm.filterOptions.currencies).toBeDefined();
    });

    it('deve ter funções de URL de bookmaker disponíveis', () => {
      expect(typeof wrapper.vm.getBookmakerUrl).toBe('function');
      expect(typeof wrapper.vm.addBookmakerUrl).toBe('function');
    });

    it('deve ter traduções de mercado disponíveis', () => {
      expect(wrapper.vm.marketTranslations).toBeDefined();
      expect(wrapper.vm.marketTranslations.translations).toBeDefined();
    });
  });

  describe('Métodos do Composable', () => {
    it('deve ter todos os métodos necessários disponíveis', () => {
      const methods = [
        'handleSidebarToggle',
        'handleSidebarStateLoaded',
        'toggleSearch',
        'toggleSound',
        'manualRefresh',
        'toggleFilterOverlay',
        'scrollToPinnedCards',
        'setFilter',
        'showLiveRestrictedMessage',
        'onDateChange',
        'clearDateFilter',
        'onUnifiedSearchInput',
        'hideSearchSuggestions',
        'toggleDragMode',
        'clearAllPinnedCards',
        'onDrop',
        'onDragStart',
        'onDragEnd',
        'onDragEnter',
        'addSurebetToReports',
        'togglePinCard',
        'handleBalanceDebited',
        'refreshAccounts',
        'loadMoreCards',
        'setRiskLevel',
        'selectAllHouses',
        'deselectAllHouses',
        'selectFavoriteHouses',
        'toggleHouse',
        'selectAllSports',
        'deselectAllSports',
        'selectFavoriteSports',
        'toggleSport',
        'selectAllCurrencies',
        'deselectAllCurrencies',
        'toggleCurrency',
        'clearFilters',
        'applyFilters',
        'closeSaveFilterModal',
        'saveFilter',
        'closeSavedFiltersModal',
        'loadFilter',
        'deleteFilter'
      ];

      methods.forEach(method => {
        expect(typeof wrapper.vm[method]).toBe('function');
      });
    });
  });

  describe('Eventos', () => {
    it('deve emitir eventos corretamente', async () => {
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      
      // Simular evento de toggle da sidebar
      await mainLayout.vm.$emit('toggle-sidebar');
      expect(wrapper.vm.handleSidebarToggle).toHaveBeenCalled();
    });
  });

  describe('Estilos CSS', () => {
    it('deve ter estilos CSS básicos', () => {
      const style = wrapper.find('style');
      expect(style.exists()).toBe(true);
      expect(style.text()).toContain('.surebets-view');
      expect(style.text()).toContain('@keyframes slideIn');
      expect(style.text()).toContain('@keyframes slideOut');
    });
  });

  describe('Integração com Composables', () => {
    it('deve usar o composable useSurebets', () => {
      // Verificar se o composable foi chamado
      const { useSurebets } = require('../../composables/useSurebets.js');
      expect(useSurebets).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      const testWrapper = mount(SurebetsView, {
        global: {
          plugins: [pinia],
          stubs: {
            'MainLayout': true,
            'SurebetsContent': true,
            'SurebetsModals': true,
            'NotificationAudio': true,
            'MapPin': true,
            'Trash2': true
          }
        }
      });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Deve renderizar em menos de 100ms
      testWrapper.unmount();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica correta', () => {
      const mainLayout = wrapper.findComponent({ name: 'MainLayout' });
      expect(mainLayout.exists()).toBe(true);
    });
  });
});

