import store from '../store'

export function requireAuth(to, from, next) {
  // Verifica se o usuário está autenticado
  if (store.getters.isAuthenticated) {
    console.log('✅ Acesso autorizado para:', store.getters.currentUser?.email, 'Rota:', to.path)
    next()
  } else {
    // Log de tentativa de acesso não autorizado
    console.warn('🚫 Tentativa de acesso não autorizado para rota:', to.path, 'Redirecionando para login')
    
    // Salva a rota que o usuário tentou acessar para redirecionar após login
    if (to.path !== '/login') {
      localStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    
    // Redireciona para login se não estiver autenticado
    next('/login')
  }
}

export function requireGuest(to, from, next) {
  // Verifica se o usuário NÃO está autenticado (para páginas como login)
  if (!store.getters.isAuthenticated) {
    console.log('✅ Acesso à página de login autorizado para usuário não autenticado')
    next()
  } else {
    console.log('🔄 Usuário já autenticado, redirecionando...')
    
    // Redireciona baseado no tipo de conta se já estiver autenticado
    if (store.getters.isVIP) {
      next('/')
    } else {
      next('/plans')
    }
  }
}

export function checkAuthStatus() {
  // Verifica o status de autenticação ao carregar a aplicação
  console.log('🔍 Verificando status de autenticação...')
  store.dispatch('checkAuth')
}

export function requireAdmin(to, from, next) {
  // Verifica se o usuário está autenticado e é admin
  if (store.getters.isAuthenticated && store.getters.isAdmin) {
    console.log('✅ Acesso administrativo autorizado para:', store.getters.currentUser?.email, 'Rota:', to.path)
    next()
  } else {
    // Log de tentativa de acesso não autorizado
    if (store.getters.isAuthenticated) {
      console.warn('🚫 Tentativa de acesso administrativo negada para usuário:', store.getters.currentUser?.email, 'Rota:', to.path)
    } else {
      console.warn('🚫 Tentativa de acesso administrativo sem autenticação para rota:', to.path)
    }
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans' && to.path !== '/') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    // Redireciona baseado no tipo de conta se não for admin
    if (store.getters.isVIP) {
      next('/')
    } else {
      next('/plans')
    }
  }
}

export function requireVIP(to, from, next) {
  // Verifica se o usuário está autenticado e tem nível VIP ou Premium
  if (store.getters.isAuthenticated && store.getters.isVIP) {
    console.log('✅ Acesso VIP autorizado para:', store.getters.currentUser?.email, 'Rota:', to.path)
    next()
  } else {
    // Log de tentativa de acesso não autorizado
    if (store.getters.isAuthenticated) {
      console.warn('🚫 Tentativa de acesso VIP negada para usuário:', store.getters.currentUser?.email, 'Nível:', store.getters.currentUser?.accountType, 'Rota:', to.path)
    } else {
      console.warn('🚫 Tentativa de acesso VIP sem autenticação para rota:', to.path)
    }
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    // Redireciona para planos se não for VIP
    next('/plans')
  }
}
