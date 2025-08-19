import store from '../store'

export function requireAuth(to, from, next) {
  // Verifica se o usuário está autenticado
  if (store.getters.isAuthenticated) {
    next()
  } else {
    // Redireciona para login se não estiver autenticado
    next('/login')
  }
}

export function requireGuest(to, from, next) {
  // Verifica se o usuário NÃO está autenticado (para páginas como login)
  if (!store.getters.isAuthenticated) {
    next()
  } else {
    // Redireciona para dashboard se já estiver autenticado
    next('/')
  }
}

export function checkAuthStatus() {
  // Verifica o status de autenticação ao carregar a aplicação
  store.dispatch('checkAuth')
}

export function requireAdmin(to, from, next) {
  // Verifica se o usuário está autenticado e é admin
  if (store.getters.isAuthenticated && store.getters.isAdmin) {
    next()
  } else {
    // Redireciona para dashboard se não for admin
    next('/')
  }
}
