import { createStore } from 'vuex'

// Função para verificar se a resposta é JSON de forma segura
async function safeJsonResponse(response) {
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  } else {
    // Se não for JSON, retornar o texto da resposta
    const text = await response.text()
    console.error('Resposta não-JSON recebida:', text.substring(0, 200) + '...')
    return { error: 'Resposta inválida do servidor', details: text.substring(0, 200) }
  }
}

export default createStore({
  state: {
    authToken: localStorage.getItem('authToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    users: JSON.parse(localStorage.getItem('users')) || [],
    tickets: JSON.parse(localStorage.getItem('tickets')) || [],
    // 🔒 Estado VIP para controle de acesso
    vipStatus: JSON.parse(localStorage.getItem('vipStatus')) || {
      isVIP: false,
      expiration: null,
      lastValidation: null
    }
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
    
    // 🔒 Mutação para definir status VIP
    setVIPStatus(state, vipData) {
      state.vipStatus = {
        isVIP: vipData.isVIP || false,
        expiration: vipData.expiration || null,
        lastValidation: vipData.lastValidation || null
      }
      
      // Salvar no localStorage para persistência
      localStorage.setItem('vipStatus', JSON.stringify(state.vipStatus))
      
      console.log('🔒 [Store] Status VIP atualizado:', state.vipStatus)
    },
    
    // 🔒 Limpar status VIP (logout)
    clearVIPStatus(state) {
      state.vipStatus = {
        isVIP: false,
        expiration: null,
        lastValidation: null
      }
      localStorage.removeItem('vipStatus')
      console.log('🔒 [Store] Status VIP limpo')
    },
    
    logout(state) {
      state.authToken = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // 🔒 Limpar status VIP ao fazer logout
      this.commit('clearVIPStatus')
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
    

  },
  
  actions: {
    login({ commit }, { token, user }) {
      // Converter dados do backend para o formato esperado pelo frontend
      const convertedUser = {
        ...user,
        // Garantir que as propriedades is_admin e is_vip estejam presentes
        is_admin: user.is_admin || user.role === 'admin' || false,
        is_vip: user.is_vip || user.accountType === 'vip' || user.accountType === 'premium' || false,
        // Manter propriedades existentes
        role: user.role || 'user',
        accountType: user.accountType || 'basic'
      }
      
      commit('setAuthToken', token)
      commit('setUser', convertedUser)
      
      console.log('✅ Login realizado com sucesso para:', convertedUser.email, 'Tipo de conta:', convertedUser.accountType)
    },
    
    logout({ commit, state }) {
      const userEmail = state.user?.email || 'Usuário desconhecido'
      console.log('🚪 Logout realizado para:', userEmail)
      commit('logout')
    },
    
    checkAuth({ commit, state }) {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          
          // Converter dados do localStorage para o formato esperado pelo frontend
          const convertedUser = {
            ...userData,
            // Garantir que as propriedades is_admin e is_vip estejam presentes
            is_admin: userData.is_admin || userData.role === 'admin' || false,
            is_vip: userData.is_vip || userData.accountType === 'vip' || userData.accountType === 'premium' || false,
            // Manter propriedades existentes
            role: userData.role || 'user',
            accountType: userData.accountType || 'basic'
          }
          
          commit('setAuthToken', token)
          commit('setUser', convertedUser)
          console.log('✅ Usuário autenticado restaurado:', convertedUser.email, 'Tipo:', convertedUser.accountType)
        } catch (error) {
          console.error('❌ Erro ao restaurar dados do usuário:', error)
          commit('logout')
        }
      } else {
        console.log('ℹ️ Nenhum usuário autenticado encontrado')
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
            username: userData.name, // Usar name como username
            email: userData.email,
            password: userData.password,
            is_admin: userData.role === 'admin',
            is_vip: userData.accountType === 'vip'
          })
        })

        if (!response.ok) {
          const errorData = await safeJsonResponse(response)
          throw new Error(errorData.error || 'Erro ao criar usuário')
        }

        const result = await safeJsonResponse(response)
        
        // Converter dados do backend (snake_case) para frontend (camelCase)
        const newUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accountType: result.user.account_type,
  
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
          const errorData = await safeJsonResponse(response)
          throw new Error(errorData.error || 'Erro ao atualizar usuário')
        }

        const result = await safeJsonResponse(response)
        
        // Converter dados do backend (snake_case) para frontend (camelCase)
        const updatedUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          accountType: result.user.account_type,
  
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
          const errorData = await safeJsonResponse(response)
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
          const errorData = await safeJsonResponse(response)
          throw new Error(errorData.error || 'Erro ao alterar tipo de conta')
        }

        const result = await safeJsonResponse(response)
        
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
          const errorData = await safeJsonResponse(response)
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
    
    async createTicket({ commit, state }, ticketData) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ticketData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao criar ticket')
        }

        const result = await response.json()
        const newTicket = result.ticket
        
        // Adicionar ticket ao estado local
        commit('addTicket', newTicket)
        
        return newTicket
      } catch (error) {
        console.error('Erro ao criar ticket:', error)
        throw error
      }
    },
    
    updateTicketData({ commit }, { id, updates }) {
      commit('updateTicket', { id, updates })
    },
    
    async addMessageToTicket({ commit, state }, { ticketId, message }) {
      try {
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        const response = await fetch(`/api/tickets/${ticketId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao adicionar mensagem')
        }

        const result = await response.json()
        const newMessage = result.data
        
        // Adicionar mensagem ao ticket local
        commit('addTicketMessage', { ticketId, message: newMessage })
        
        return newMessage
      } catch (error) {
        console.error('Erro ao adicionar mensagem:', error)
        throw error
      }
    },
    

    

    
    async upgradeAccountType({ commit, state }, { userId, accountType }) {
      try {
        console.log('🔄 Store: Iniciando upgradeAccountType...')
        console.log('Store: userId:', userId, 'accountType:', accountType)
        
        const token = state.authToken
        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        console.log('Store: Token encontrado, fazendo requisição para API...')
        
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ account_type: accountType })
        })

        console.log('Store: Resposta da API recebida, status:', response.status)

        if (!response.ok) {
          const errorData = await safeJsonResponse(response)
          console.error('Store: Erro na API:', errorData)
          throw new Error(errorData.error || 'Erro ao alterar tipo de conta')
        }

        const result = await safeJsonResponse(response)
        console.log('Store: Resposta da API:', result)
        
        // Atualizar usuário local
        commit('updateAccountType', { userId, accountType: result.user.account_type })
        console.log('Store: Usuário atualizado localmente')
        
        return { success: true }
        
      } catch (error) {
        console.error('❌ Erro ao alterar tipo de conta:', error)
        throw error
      }
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
        
        const data = await safeJsonResponse(response)
        
        if (data.success && data.users) {
          // Mapear os campos do backend para o formato do frontend
          const mappedUsers = data.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,

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
        
        const data = await safeJsonResponse(response)
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
          const errorData = await safeJsonResponse(response)
          throw new Error(errorData.error || 'Erro ao salvar estatísticas')
        }
        
        const result = await safeJsonResponse(response)
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
          const errorData = await safeJsonResponse(response)
          throw new Error(errorData.error || 'Erro ao salvar análise')
        }
        
        const result = await safeJsonResponse(response)
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
        
        const data = await safeJsonResponse(response)
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
    isAdmin: state => state.user?.is_admin === true,
    isVIP: state => {
      // Priorizar o status VIP do sistema de segurança
      if (state.vipStatus.isVIP) return true
      
      // Fallback para dados do usuário
      if (!state.user) return false
      if (state.user.is_admin === true) return true
      if (state.user.is_vip === true) return true
      return ['premium', 'vip'].includes(state.user.accountType)
    },
    
    // 🔒 Status VIP completo
    vipStatus: state => state.vipStatus,
    
    // 🔒 Verificar se VIP expirou
    isVIPExpired: state => {
      if (!state.vipStatus.isVIP || !state.vipStatus.expiration) return false
      
      const now = new Date()
      const expiration = new Date(state.vipStatus.expiration)
      return expiration <= now
    },
    
    // 🔒 Dias restantes do VIP
    vipDaysRemaining: state => {
      if (!state.vipStatus.isVIP || !state.vipStatus.expiration) return 0
      
      const now = new Date()
      const expiration = new Date(state.vipStatus.expiration)
      const diffTime = expiration - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return Math.max(0, diffDays)
    },
    
    // 🔒 Verificar se pode usar recursos VIP
    canUseVIPFeatures: state => {
      if (!state.vipStatus.isVIP) return false
      if (state.vipStatus.expiration) {
        const now = new Date()
        const expiration = new Date(state.vipStatus.expiration)
        return expiration > now
      }
      return true
    },
    activeUsers: state => state.users.filter(user => user.status === 'active'),
    inactiveUsers: state => state.users.filter(user => user.status === 'inactive'),
    allTickets: state => state.tickets,
    userTickets: state => state.tickets.filter(ticket => ticket.userId === state.user?.id),
    openTickets: state => state.tickets.filter(ticket => ticket.status === 'open'),
    pendingTickets: state => state.tickets.filter(ticket => ticket.status === 'pending'),
    closedTickets: state => state.tickets.filter(ticket => ticket.status === 'closed'),
    
    // Getters para sistema de créditos

    userAccountType: state => state.user?.accountType || 'basic',
    canUseSystem: state => {
      if (!state.user) return false
      if (state.user.is_admin === true) return true
      if (state.user.is_vip === true) return true
      return true // Todos os usuários podem usar o sistema agora
    },
    accountTypeInfo: () => {
      return {
        basic: {
          name: 'Básico',
          description: 'Acesso básico ao sistema',
          features: ['Acesso às surebets', 'Filtros básicos', 'Relatórios simples'],
          price: 'Grátis'
        },
        premium: {
          name: 'Premium',
          description: 'Acesso completo com recursos avançados',
          features: ['Todas as funcionalidades básicas', 'Filtros avançados', 'Relatórios detalhados', 'Prioridade no suporte'],
          price: 'R$ 29,90/mês'
        },
        vip: {
          name: 'VIP',
          description: 'Acesso exclusivo com recursos premium',
          features: ['Todas as funcionalidades premium', 'Filtros personalizados', 'Relatórios em tempo real', 'Suporte prioritário 24/7', 'Funcionalidades exclusivas'],
          price: 'R$ 99,90/mês'
        }
      }
    }
  }
})
