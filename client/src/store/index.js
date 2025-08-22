import { createStore } from 'vuex'

export default createStore({
  state: {
    authToken: localStorage.getItem('authToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    users: JSON.parse(localStorage.getItem('users')) || [],
    tickets: JSON.parse(localStorage.getItem('tickets')) || []
  },
  
  mutations: {
    setAuthToken(state, token) {
      state.authToken = token
      state.isAuthenticated = !!token
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        localStorage.removeItem('authToken')
      }
    },
    
    setUser(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    
    logout(state) {
      state.authToken = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },
    
    // Limpar dados mocados do localStorage
    clearMockData(state) {
      // Limpar usuários e tickets mocados
      localStorage.removeItem('users')
      localStorage.removeItem('tickets')
      state.users = []
      state.tickets = []
      console.log('🗑️ Dados mocados removidos do localStorage')
    },
    
    addUser(state, user) {
      state.users.push(user)
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    
    setUsers(state, users) {
      state.users = users
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    
    updateUser(state, { id, updates }) {
      const userIndex = state.users.findIndex(user => user.id === id)
      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], ...updates }
        localStorage.setItem('users', JSON.stringify(state.users))
      }
    },
    
    deleteUser(state, id) {
      state.users = state.users.filter(user => user.id !== id)
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    
    updateUserLastLogin(state, email) {
      const user = state.users.find(u => u.email === email)
      if (user) {
        user.lastLogin = new Date().toISOString()
        localStorage.setItem('users', JSON.stringify(state.users))
      }
    },
    
    addTicket(state, ticket) {
      state.tickets.push(ticket)
      localStorage.setItem('tickets', JSON.stringify(state.tickets))
    },
    
    updateTicket(state, { id, updates }) {
      const ticketIndex = state.tickets.findIndex(ticket => ticket.id === id)
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = { ...state.tickets[ticketIndex], ...updates }
        localStorage.setItem('tickets', JSON.stringify(state.tickets))
      }
    },
    
    addTicketMessage(state, { ticketId, message }) {
      const ticket = state.tickets.find(t => t.id === ticketId)
      if (ticket) {
        ticket.messages.push(message)
        ticket.updatedAt = new Date().toISOString()
        localStorage.setItem('tickets', JSON.stringify(state.tickets))
      }
    },
    
    // Mutations para sistema de créditos
    consumeCredit(state, userId) {
      const user = state.users.find(u => u.id === userId)
      if (user && user.credits > 0) {
        user.credits--
        user.lastCreditConsumption = new Date().toISOString()
        localStorage.setItem('users', JSON.stringify(state.users))
        
        // Atualizar usuário atual se for o mesmo
        if (state.user && state.user.id === userId) {
          state.user.credits = user.credits
          state.user.lastCreditConsumption = user.lastCreditConsumption
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      }
    },
    
    addCredits(state, { userId, amount }) {
      const user = state.users.find(u => u.id === userId)
      if (user) {
        // Garantir que credits seja um número
        if (typeof user.credits !== 'number') {
          user.credits = 0
        }
        
        user.credits += amount
        localStorage.setItem('users', JSON.stringify(state.users))
        
        // Atualizar usuário atual se for o mesmo
        if (state.user && state.user.id === userId) {
          state.user.credits = user.credits
          localStorage.setItem('user', JSON.stringify(state.user))
        }
        
        console.log(`Créditos adicionados: ${amount} para usuário ${userId}. Total: ${user.credits}`)
      } else {
        console.error(`Usuário não encontrado: ${userId}`)
      }
    },
    
    updateAccountType(state, { userId, accountType }) {
      const user = state.users.find(u => u.id === userId)
      if (user) {
        user.accountType = accountType
        localStorage.setItem('users', JSON.stringify(state.users))
        
        // Atualizar usuário atual se for o mesmo
        if (state.user && state.user.id === userId) {
          state.user.accountType = accountType
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      }
    },
    
    // Garantir que todos os usuários tenham a propriedade credits
    ensureUserCredits(state) {
      state.users.forEach(user => {
        if (typeof user.credits !== 'number') {
          user.credits = 0
        }
      })
      localStorage.setItem('users', JSON.stringify(state.users))
    }
  },
  
  actions: {
    login({ commit }, { token, user }) {
      commit('setAuthToken', token)
      commit('setUser', user)
    },
    
    logout({ commit }) {
      commit('logout')
    },
    
    checkAuth({ commit, state }) {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          commit('setAuthToken', token)
          commit('setUser', userData)
        } catch (error) {
          commit('logout')
        }
      } else {
        commit('logout')
      }
    },
    
    async createUser({ commit, state }, userData) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user',
            account_type: userData.accountType || 'basic'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao criar usuário')
        }

        const result = await response.json()
        
        // Converter dados do backend (snake_case) para frontend (camelCase)
        const newUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accountType: result.user.account_type,
          credits: result.user.credits || 0,
          status: result.user.status,
          lastLogin: result.user.last_login,
          createdAt: result.user.created_at,
          updatedAt: result.user.updated_at
        }

        // Adicionar usuário ao estado local
        commit('addUser', newUser)
        return newUser
        
      } catch (error) {
        console.error('❌ Erro ao criar usuário:', error)
        throw error
      }
    },
    
    async updateUserData({ commit, state }, { id, updates }) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        // Converter dados do frontend (camelCase) para backend (snake_case)
        const backendUpdates = {}
        if (updates.name) backendUpdates.name = updates.name
        if (updates.email) backendUpdates.email = updates.email
        if (updates.role) backendUpdates.role = updates.role
        if (updates.status) backendUpdates.status = updates.status
        if (updates.accountType) backendUpdates.account_type = updates.accountType

        const response = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendUpdates)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao atualizar usuário')
        }

        const result = await response.json()
        
        // Converter dados do backend (snake_case) para frontend (camelCase)
        const updatedUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accountType: result.user.account_type,
          credits: result.user.credits || 0,
          status: result.user.status,
          lastLogin: result.user.last_login,
          createdAt: result.user.created_at,
          updatedAt: result.user.updated_at
        }

        // Atualizar usuário no estado local
        commit('updateUser', { id, updates: updatedUser })
        return updatedUser
        
      } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error)
        throw error
      }
    },
    
    async changeUserPassword({ state }, { id, password }) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch(`/api/users/${id}/password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao alterar senha')
        }

        return { success: true }
        
      } catch (error) {
        console.error('❌ Erro ao alterar senha:', error)
        throw error
      }
    },
    
    async changeAccountType({ commit, state }, { userId, newType }) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ account_type: newType })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao alterar tipo de conta')
        }

        const result = await response.json()
        
        // Atualizar usuário local
        commit('updateUser', { 
          id: userId, 
          updates: { accountType: result.user.account_type }
        })
        
        return { success: true }
        
      } catch (error) {
        console.error('❌ Erro ao alterar tipo de conta:', error)
        throw error
      }
    },
    
    async deleteUserData({ commit, state }, id) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao excluir usuário')
        }

        // Se a API retornou sucesso, fazer commit local
        commit('deleteUser', id)
        return { success: true }
        
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error)
        throw error
      }
    },
    
    updateLastLogin({ commit }, email) {
      commit('updateUserLastLogin', email)
    },
    
    createTicket({ commit, state }, ticketData) {
      const newTicket = {
        id: String(state.tickets.length + 1).padStart(3, '0'),
        userId: state.user.id,
        userEmail: state.user.email,
        ...ticketData,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 1,
            author: state.user.email,
            content: ticketData.description,
            type: 'user',
            createdAt: new Date().toISOString()
          }
        ]
      }
      commit('addTicket', newTicket)
      return newTicket
    },
    
    updateTicketData({ commit }, { id, updates }) {
      commit('updateTicket', { id, updates })
    },
    
    addMessageToTicket({ commit }, { ticketId, message }) {
      commit('addTicketMessage', { ticketId, message })
    },
    
    // Actions para sistema de créditos
    checkAndConsumeCredit({ commit, state, getters }) {
      const user = state.user
      if (!user) return false
      
      // Verificar se já consumiu crédito hoje
      const today = new Date().toDateString()
      const lastConsumption = user.lastCreditConsumption 
        ? new Date(user.lastCreditConsumption).toDateString() 
        : null
      
      if (lastConsumption === today) {
        return true // Já consumiu hoje, pode usar
      }
      
      // Verificar se tem créditos disponíveis
      if (user.credits > 0) {
        commit('consumeCredit', user.id)
        return true
      }
      
      return false // Sem créditos
    },
    
    addCreditsToUser({ commit }, { userId, amount }) {
      console.log('Action addCreditsToUser chamada:', { userId, amount })
      commit('addCredits', { userId, amount })
    },
    
    upgradeAccountType({ commit }, { userId, accountType }) {
      commit('updateAccountType', { userId, accountType })
    },
    
    ensureAllUsersHaveCredits({ commit }) {
      commit('ensureUserCredits')
    },
    
    // Limpar dados mocados na inicialização
    clearMockDataOnInit({ commit }) {
      commit('clearMockData')
    },
    
    // Buscar usuários da API
    async fetchUsers({ commit, state }) {
      try {
        const token = state.authToken
        if (!token) {
          console.error('❌ Token de autenticação não encontrado')
          return
        }
        
        const response = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.users) {
          // Mapear os campos do backend para o formato do frontend
          const mappedUsers = data.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            credits: user.credits || 0,
            accountType: user.account_type || 'basic',
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }))
          
          commit('setUsers', mappedUsers)
          console.log(`✅ ${mappedUsers.length} usuário(s) carregado(s) da API`)
        } else {
          console.error('❌ Resposta da API inválida:', data)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error)
      }
    },
    
    // Actions para estatísticas de surebets
    async fetchSurebetStats({ state }, { period = 'all', sport = 'all', limit = 100 } = {}) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }
        
        const params = new URLSearchParams()
        if (period !== 'all') params.append('period', period)
        if (sport !== 'all') params.append('sport', sport)
        if (limit !== 100) params.append('limit', limit)
        
        const response = await fetch(`/api/surebet-stats?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        return data.success ? data.data : []
        
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas de surebets:', error)
        throw error
      }
    },
    
    async saveSurebetStats({ state }, statsData) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }
        
        const response = await fetch('/api/surebet-stats/bulk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stats: statsData })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao salvar estatísticas')
        }
        
        const result = await response.json()
        return result
        
      } catch (error) {
        console.error('❌ Erro ao salvar estatísticas de surebets:', error)
        throw error
      }
    },
    
    async saveSurebetAnalytics({ state }, analyticsData) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }
        
        const response = await fetch('/api/surebet-stats/analytics', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(analyticsData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao salvar análise')
        }
        
        const result = await response.json()
        return result
        
      } catch (error) {
        console.error('❌ Erro ao salvar análise de surebets:', error)
        throw error
      }
    },
    
    async fetchSurebetAnalytics({ state }, { period = 'all', sport = 'all', type } = {}) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }
        
        const params = new URLSearchParams()
        if (period !== 'all') params.append('period', period)
        if (sport !== 'all') params.append('sport', sport)
        if (type) params.append('type', type)
        
        const response = await fetch(`/api/surebet-stats/analytics?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        return data.success ? data.data : []
        
      } catch (error) {
        console.error('❌ Erro ao buscar análises de surebets:', error)
        throw error
      }
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    authToken: state => state.authToken,
    allUsers: state => state.users,
    isAdmin: state => state.user?.role === 'admin',
    isVIP: state => {
      if (!state.user) return false
      if (state.user.role === 'admin') return true
      return ['premium', 'vip'].includes(state.user.accountType)
    },
    activeUsers: state => state.users.filter(user => user.status === 'active'),
    inactiveUsers: state => state.users.filter(user => user.status === 'inactive'),
    allTickets: state => state.tickets,
    userTickets: state => state.tickets.filter(ticket => ticket.userId === state.user?.id),
    openTickets: state => state.tickets.filter(ticket => ticket.status === 'open'),
    pendingTickets: state => state.tickets.filter(ticket => ticket.status === 'pending'),
    closedTickets: state => state.tickets.filter(ticket => ticket.status === 'closed'),
    
    // Getters para sistema de créditos
    userCredits: state => state.user?.credits || 0,
    userAccountType: state => state.user?.accountType || 'basic',
    canUseSystem: state => {
      if (!state.user) return false
      if (state.user.role === 'admin') return true
      
      const today = new Date().toDateString()
      const lastConsumption = state.user.lastCreditConsumption 
        ? new Date(state.user.lastCreditConsumption).toDateString() 
        : null
      
      return lastConsumption === today || state.user.credits > 0
    },
    accountTypeInfo: () => {
      return {
        basic: {
          name: 'Básico',
          description: 'Acesso básico ao sistema',
          features: ['Acesso às surebets', 'Filtros básicos', 'Relatórios simples'],
          price: 'Grátis',
          creditsPerDay: 1
        },
        premium: {
          name: 'Premium',
          description: 'Acesso completo com recursos avançados',
          features: ['Todas as funcionalidades básicas', 'Filtros avançados', 'Relatórios detalhados', 'Prioridade no suporte'],
          price: 'R$ 29,90/mês',
          creditsPerDay: 1
        },
        vip: {
          name: 'VIP',
          description: 'Acesso exclusivo com recursos premium',
          features: ['Todas as funcionalidades premium', 'Filtros personalizados', 'Relatórios em tempo real', 'Suporte prioritário 24/7', 'Funcionalidades exclusivas'],
          price: 'R$ 99,90/mês',
          creditsPerDay: 1
        }
      }
    }
  }
})
