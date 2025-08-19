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
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    authToken: state => state.authToken,
    allUsers: state => state.users,
    isAdmin: state => state.user?.role === 'admin',
    activeUsers: state => state.users.filter(user => user.status === 'active'),
    inactiveUsers: state => state.users.filter(user => user.status === 'inactive')
  }
})
