import { createStore } from 'vuex'

export default createStore({
  state: {
    authToken: localStorage.getItem('authToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    users: JSON.parse(localStorage.getItem('users')) || [
      {
        id: '1',
        name: 'Administrador',
        email: 'admin@zeroloss.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: null
      },
      {
        id: '2',
        name: 'Usuário Teste',
        email: 'user@test.com',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-02T00:00:00.000Z',
        lastLogin: null
      }
    ],
    tickets: JSON.parse(localStorage.getItem('tickets')) || [
      {
        id: '001',
        userId: '2',
        userEmail: 'user@test.com',
        title: 'Problema com login na plataforma',
        description: 'Não consigo fazer login na minha conta. Aparece erro de credenciais inválidas mesmo com senha correta.',
        category: 'account',
        priority: 'high',
        status: 'open',
        createdAt: '2024-01-15T10:30:00',
        updatedAt: '2024-01-15T10:30:00',
        messages: [
          {
            id: 1,
            author: 'user@test.com',
            content: 'Não consigo fazer login na minha conta. Aparece erro de credenciais inválidas mesmo com senha correta.',
            type: 'user',
            createdAt: '2024-01-15T10:30:00'
          },
          {
            id: 2,
            author: 'Suporte Técnico',
            content: 'Olá! Vamos verificar isso. Pode tentar resetar sua senha através do link "Esqueci minha senha"?',
            type: 'support',
            createdAt: '2024-01-15T11:00:00'
          }
        ]
      },
      {
        id: '002',
        userId: '2',
        userEmail: 'user@test.com',
        title: 'Dúvida sobre planos e preços',
        description: 'Gostaria de saber mais detalhes sobre os planos disponíveis e se há desconto para pagamento anual.',
        category: 'billing',
        priority: 'medium',
        status: 'pending',
        createdAt: '2024-01-14T14:20:00',
        updatedAt: '2024-01-15T09:15:00',
        messages: [
          {
            id: 1,
            author: 'user@test.com',
            content: 'Gostaria de saber mais detalhes sobre os planos disponíveis e se há desconto para pagamento anual.',
            type: 'user',
            createdAt: '2024-01-14T14:20:00'
          }
        ]
      },
      {
        id: '003',
        userId: '2',
        userEmail: 'user@test.com',
        title: 'Sugestão de nova funcionalidade',
        description: 'Seria muito útil ter uma funcionalidade de exportar relatórios em PDF. Poderiam implementar isso?',
        category: 'feature',
        priority: 'low',
        status: 'closed',
        createdAt: '2024-01-10T16:45:00',
        updatedAt: '2024-01-12T11:30:00',
        messages: [
          {
            id: 1,
            author: 'user@test.com',
            content: 'Seria muito útil ter uma funcionalidade de exportar relatórios em PDF. Poderiam implementar isso?',
            type: 'user',
            createdAt: '2024-01-10T16:45:00'
          },
          {
            id: 2,
            author: 'Suporte Técnico',
            content: 'Obrigado pela sugestão! Vamos analisar a viabilidade e incluí-la em nossa roadmap de desenvolvimento.',
            type: 'support',
            createdAt: '2024-01-12T11:30:00'
          }
        ]
      }
    ]
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
    
    addUser(state, user) {
      state.users.push(user)
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
    
    createUser({ commit }, userData) {
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
      commit('addUser', newUser)
      return newUser
    },
    
    updateUserData({ commit }, { id, updates }) {
      commit('updateUser', { id, updates })
    },
    
    deleteUserData({ commit }, id) {
      commit('deleteUser', id)
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
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    authToken: state => state.authToken,
    allUsers: state => state.users,
    isAdmin: state => state.user?.role === 'admin',
    activeUsers: state => state.users.filter(user => user.status === 'active'),
    inactiveUsers: state => state.users.filter(user => user.status === 'inactive'),
    allTickets: state => state.tickets,
    userTickets: state => state.tickets.filter(ticket => ticket.userId === state.user?.id),
    openTickets: state => state.tickets.filter(ticket => ticket.status === 'open'),
    pendingTickets: state => state.tickets.filter(ticket => ticket.status === 'pending'),
    closedTickets: state => state.tickets.filter(ticket => ticket.status === 'closed')
  }
})
