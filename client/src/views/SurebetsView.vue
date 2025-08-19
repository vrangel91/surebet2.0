<template>
  <div class="surebets-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo e Header -->
      <div class="sidebar-header">
                 <div class="logo">
           <span class="logo-icon" v-show="!sidebarCollapsed">👑</span>
           <h1 v-show="!sidebarCollapsed">SureStake</h1>
         </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span v-if="sidebarCollapsed">☰</span>
          <span v-else>☰</span>
        </button>
      </div>

      <!-- Perfil do Usuário -->
      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details" v-show="!sidebarCollapsed">
            <p class="user-greeting">Olá, viniciius@live.com</p>
            <div class="user-status"> 
              <span class="status-dot"></span>
              <span class="status-text">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu de Navegação -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: $route.path === '/' }">
            <router-link to="/" class="nav-link" :title="sidebarCollapsed ? 'Dashboard' : ''">
              <span class="nav-icon">🏠</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/reports' }">
            <router-link to="/reports" class="nav-link" :title="sidebarCollapsed ? 'Relatórios' : ''">
              <span class="nav-icon">📊</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Relatórios</span>
            </router-link>
          </li>
          <li class="nav-item" :class="{ active: $route.path === '/settings' }">
            <router-link to="/settings" class="nav-link" :title="sidebarCollapsed ? 'Configurações' : ''">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Configurações</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

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
           </div>
         </div>
      </header>

                     <!-- Filtros Simples -->
        <div class="filters">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              Todas ({{ totalSurebets }})
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'prelive' }"
              @click="setFilter('prelive')"
            >
              Pré-live ({{ preliveCount }})
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'live' }"
              @click="setFilter('live')"
            >
              Live ({{ liveCount }})
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
            <div v-else class="games-count">
              Total de jogos encontrados: {{ totalSurebets }}
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
             @add-to-reports="addSurebetToReports"
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
           <!-- Filtro por Data do Evento -->
           <div class="filter-section">
             <label class="filter-section-label">Data do evento:</label>
             <div class="date-filter">
               <select v-model="selectedDateFilter" class="date-select">
                 <option value="any">Qualquer horário</option>
                 <option value="12h">12 horas</option>
                 <option value="16h">16 horas</option>
                 <option value="24h">24 horas</option>
                 <option value="48h">48 horas</option>
                 <option value="1w">1 semana</option>
               </select>
               <p class="date-help">Selecione o intervalo de tempo dos eventos</p>
             </div>
           </div>
           
           <!-- Filtro por Faixa de Lucro -->
           <div class="filter-section">
             <label class="filter-section-label">Faixa de Lucro</label>
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
           
           <!-- Filtro por Casas de Aposta -->
           <div class="filter-section">
             <div class="filter-section-header">
               <label class="filter-section-label">Casas:</label>
               <div class="filter-actions">
                 <button @click="selectAllHouses" class="action-btn">Marcar Todos</button>
                 <span class="separator">|</span>
                 <button @click="deselectAllHouses" class="action-btn">Desmarcar Todos</button>
               </div>
             </div>
             <div class="houses-grid">
               <label 
                 v-for="house in filterOptions.houses" 
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
           </div>
           
                       <!-- Filtro por Esportes -->
            <div class="filter-section">
              <div class="filter-section-header">
                <label class="filter-section-label">Esportes:</label>
                <div class="filter-actions">
                  <button @click="selectAllSports" class="action-btn">Marcar Todos</button>
                  <span class="separator">|</span>
                  <button @click="deselectAllSports" class="action-btn">Desmarcar Todos</button>
                </div>
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
                  <span class="separator">|</span>
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
         
         <div class="filter-footer">
           <button @click="clearFilters" class="clear-btn">Limpar Filtros</button>
           <button @click="applyFilters" class="apply-btn">Aplicar</button>
         </div>
       </div>
     </div>
   </div>
 </template>

<script>
import SurebetCard from '../components/SurebetCard.vue'
import { filterOptions } from '../config/filters.js'

export default {
  name: 'SurebetsView',
  components: {
    SurebetCard
  },
  data() {
    return {
      surebets: {},
      isSearching: true,
      soundEnabled: true,
      activeFilter: 'all',
      loading: true,
      ws: null,
      sidebarCollapsed: false,
      updateInterval: null,
      selectedHouses: [...filterOptions.houses], // Inicia com todas as casas selecionadas
      selectedSports: filterOptions.sports.map(sport => sport.value), // Inicia com todos os esportes selecionados
      selectedCurrencies: filterOptions.currencies.map(currency => currency.code), // Inicia com todas as moedas selecionadas
      filterOptions: filterOptions,
      showFilterOverlay: false,
      selectedDateFilter: 'any',
      minProfit: 0,
      maxProfit: 1000,
      lastCheckCount: 0,
      startTime: Date.now(),
      uptimeMinutes: 0
    }
  },
  computed: {
    totalSurebets() {
      return Object.keys(this.surebets).length
    },
    preliveCount() {
      return Object.values(this.surebets).filter(surebet => 
        surebet[0]?.minutes === 0
      ).length
    },
    liveCount() {
      return Object.values(this.surebets).filter(surebet => 
        surebet[0]?.minutes > 0
      ).length
    },
    filteredSurebets() {
      let surebetsArray = Object.values(this.surebets)
      
      // Filtro por status (prelive/live)
      switch (this.activeFilter) {
        case 'prelive':
          surebetsArray = surebetsArray.filter(surebet => surebet[0]?.minutes === 0)
          break
        case 'live':
          surebetsArray = surebetsArray.filter(surebet => surebet[0]?.minutes > 0)
          break
      }
      
      // Filtro por casas de aposta (vinculado ao campo "house" da API)
      if (this.selectedHouses.length > 0 && this.selectedHouses.length !== this.filterOptions.houses.length) {
        surebetsArray = surebetsArray.filter(surebet => {
          const surebetHouses = surebet.map(bet => bet.house).filter(Boolean)
          return this.selectedHouses.some(house => surebetHouses.includes(house))
        })
      }
      
      // Filtro por esportes (vinculado ao campo "sport" da API)
      if (this.selectedSports.length > 0 && this.selectedSports.length !== this.filterOptions.sports.length) {
        surebetsArray = surebetsArray.filter(surebet => {
          const surebetSport = surebet[0]?.sport
          return surebetSport && this.selectedSports.includes(surebetSport)
        })
      }
      
      // Filtro por moedas (vinculado ao campo "currency" da API)
      if (this.selectedCurrencies.length > 0 && this.selectedCurrencies.length !== this.filterOptions.currencies.length) {
        surebetsArray = surebetsArray.filter(surebet => {
          const surebetCurrency = surebet[0]?.currency
          return surebetCurrency && this.selectedCurrencies.includes(surebetCurrency)
        })
      }
      
      // Filtro por data (intervalo até o evento)
      if (this.selectedDateFilter !== 'any') {
        const hoursMap = { '12h': 12, '16h': 16, '24h': 24, '48h': 48, '1w': 168 }
        const maxHours = hoursMap[this.selectedDateFilter] || null
        if (maxHours) {
          const now = new Date()
          surebetsArray = surebetsArray.filter(surebet => {
            const ts = surebet[0]?.timestamp || null
            if (!ts) return true
            const eventTime = new Date(ts)
            const diffHours = (eventTime - now) / (1000 * 60 * 60)
            return diffHours <= maxHours
          })
        }
      }

      // Filtro por faixa de lucro
      if (this.minProfit > 0 || this.maxProfit < 1000) {
        surebetsArray = surebetsArray.filter(surebet => {
          const profit = surebet[0]?.profit || 0
          return profit >= this.minProfit && profit <= this.maxProfit
        })
      }
      
      return surebetsArray
    },
    
    hasActiveFilters() {
      const allHousesSelected = this.selectedHouses.length === this.filterOptions.houses.length
      const allSportsSelected = this.selectedSports.length === this.filterOptions.sports.length
      const allCurrenciesSelected = this.selectedCurrencies.length === this.filterOptions.currencies.length
      const profitDefault = this.minProfit === 0 && this.maxProfit === 1000
      const dateDefault = this.selectedDateFilter === 'any'
      return (!allHousesSelected) || (!allSportsSelected) || (!allCurrenciesSelected) || this.activeFilter !== 'all' || !profitDefault || !dateDefault
    },
    
    activeFiltersCount() {
      let count = 0
      if (this.selectedHouses.length !== this.filterOptions.houses.length) count++
      if (this.selectedSports.length !== this.filterOptions.sports.length) count++
      if (this.selectedCurrencies.length !== this.filterOptions.currencies.length) count++
      if (this.activeFilter !== 'all') count++
      if (!(this.minProfit === 0 && this.maxProfit === 1000)) count++
      if (this.selectedDateFilter !== 'any') count++
      return count
    }
  },
  mounted() {
    this.initWebSocket()
    this.fetchSurebets()
    this.startAutoUpdate()
    
    // Atualiza estatísticas a cada minuto
    setInterval(() => {
      this.updateStats()
    }, 60000)
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
    this.stopAutoUpdate()
  },
  methods: {
    // Extrai casas/esportes/moedas do payload da API e garante seleção padrão "todos marcados"
    refreshFilterOptionsFromData(rawSurebets) {
      try {
        const values = Object.values(rawSurebets || {})
        const houseSet = new Set()
        const sportSet = new Set()
        const currencySet = new Set()
        
        // Adiciona as opções padrão primeiro
        houseSet.add(...this.filterOptions.houses)
        sportSet.add(...this.filterOptions.sports.map(s => s.value))
        currencySet.add(...this.filterOptions.currencies.map(c => c.code))
        
        // Adiciona as opções encontradas nos dados da API
        for (const legs of values) {
          for (const leg of legs) {
            if (leg?.house) houseSet.add(leg.house)
            if (leg?.sport) sportSet.add(leg.sport)
            if (leg?.currency) currencySet.add(leg.currency)
          }
        }

        const newHouses = Array.from(houseSet).sort()
        const newSports = Array.from(sportSet).sort()
        const newCurrencies = Array.from(currencySet).sort()

        const prevAllHouses = this.selectedHouses.length === this.filterOptions.houses.length
        const prevAllSports = this.selectedSports.length === this.filterOptions.sports.length
        const prevAllCurrencies = this.selectedCurrencies.length === this.filterOptions.currencies.length

        this.filterOptions.houses = newHouses
        // Mantém a estrutura de objetos para esportes (value/label)
        this.filterOptions.sports = newSports.map(sport => ({ value: sport, label: sport }))
        // Mantém a estrutura de objetos para moedas (code/label)
        this.filterOptions.currencies = newCurrencies.map(currency => ({ code: currency, label: currency }))

        // Se ainda não há seleção ou se antes estava tudo selecionado, mantém tudo selecionado
        if (this.selectedHouses.length === 0 || prevAllHouses) {
          this.selectedHouses = [...newHouses]
        } else {
          // Remove seleções que não existem mais
          this.selectedHouses = this.selectedHouses.filter(h => newHouses.includes(h))
        }

        if (this.selectedSports.length === 0 || prevAllSports) {
          this.selectedSports = [...newSports]
        } else {
          this.selectedSports = this.selectedSports.filter(s => newSports.includes(s))
        }

        if (this.selectedCurrencies.length === 0 || prevAllCurrencies) {
          this.selectedCurrencies = [...newCurrencies]
        } else {
          this.selectedCurrencies = this.selectedCurrencies.filter(c => newCurrencies.includes(c))
        }
      } catch (e) {
        console.warn('Falha ao atualizar opções de filtros:', e)
      }
    },
    initWebSocket() {
      this.ws = new WebSocket('ws://localhost:3002/ws')
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado')
      }
      
             this.ws.onmessage = (event) => {
         const data = JSON.parse(event.data)
         
         switch (data.type) {
           case 'initial_state':
             this.surebets = data.surebets
             this.refreshFilterOptionsFromData(this.surebets)
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
             this.refreshFilterOptionsFromData(this.surebets)
             
             // Toca som apenas se há novos dados e o som está habilitado
             if (this.soundEnabled && hasNewData) {
               this.playNotificationSound()
             }
             break
         }
       }
      
      this.ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket desconectado')
      }
    },
    
         async fetchSurebets() {
       try {
         const response = await fetch('/api/surebets')
         const data = await response.json()
         
         // Verifica se há novos dados comparando com os dados atuais
         const currentKeys = Object.keys(this.surebets)
         const newKeys = Object.keys(data)
         const hasNewData = newKeys.length > currentKeys.length || 
                           newKeys.some(key => !currentKeys.includes(key))
         
         this.surebets = data
         this.refreshFilterOptionsFromData(this.surebets)
         this.loading = false
         this.updateStats() // Atualiza estatísticas
         
         // Toca som apenas se há novos dados e o som está habilitado
         if (this.soundEnabled && hasNewData) {
           this.playNotificationSound()
         }
       } catch (error) {
         console.error('Erro ao buscar surebets:', error)
         this.loading = false
         this.updateStats() // Atualiza estatísticas mesmo em caso de erro
       }
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
      this.activeFilter = filter
    },
    
    applyFilters() {
      // Os filtros são aplicados automaticamente através do computed filteredSurebets
    },
    
    clearFilters() {
      // Limpa filtros mas mantém tudo selecionado por padrão
      this.selectedHouses = [...this.filterOptions.houses]
      this.selectedSports = this.filterOptions.sports.map(sport => sport.value)
      this.selectedCurrencies = this.filterOptions.currencies.map(currency => currency.code)
      this.activeFilter = 'all'
      this.selectedDateFilter = 'any'
      this.minProfit = 0
      this.maxProfit = 1000
    },
    
    toggleFilterOverlay() {
      this.showFilterOverlay = !this.showFilterOverlay
    },
    
    selectAllHouses() {
      this.selectedHouses = [...this.filterOptions.houses]
    },
    
    deselectAllHouses() {
      this.selectedHouses = []
    },
    
    selectAllSports() {
      // filterOptions.sports sempre tem estrutura de objetos {value, label}
      this.selectedSports = this.filterOptions.sports.map(sport => sport.value)
    },
    
    deselectAllSports() {
      this.selectedSports = []
    },
    
    selectAllCurrencies() {
      // filterOptions.currencies sempre tem estrutura de objetos {code, label}
      this.selectedCurrencies = this.filterOptions.currencies.map(currency => currency.code)
    },
    
    deselectAllCurrencies() {
      this.selectedCurrencies = []
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
           market: firstBet.market || 'Mercado não especificado',
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
     
     // Mostra notificação
     showNotification(message) {
       const notification = document.createElement('div')
       notification.className = 'notification'
       notification.textContent = message
               notification.style.cssText = `
          position: fixed;
          top: 100px;
          right: 20px;
          background: #00ff88;
          color: #1a1a1a;
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
     }
  }
}
</script>

<style lang="scss" scoped>
.surebets-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
  transition: width 0.3s ease;
  
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
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-primary);
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
  
  &:hover {
    background: #404040;
    color: #ffffff;
  }
  
  &.active {
    background: #00ff88;
    color: #1a1a1a;
    border-color: #00ff88;
  }
}

.surebets-list {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
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
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
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
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 30px;
}

.filter-section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
  margin-bottom: 12px;
}

.filter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.separator {
  color: #404040;
  font-size: 12px;
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

/* Grids de Checkboxes */
.houses-grid,
.sports-grid,
.currencies-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
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
</style>

