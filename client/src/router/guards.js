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

// Guard para verificar acesso baseado em tipo de plano específico
export function requirePlanType(requiredPlans) {
  return function(to, from, next) {
    if (!store.getters.isAuthenticated) {
      console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
      localStorage.setItem('redirectAfterLogin', to.fullPath)
      next('/login')
      return
    }

    const user = store.getters.currentUser
    const userPlan = user?.accountType || user?.plan || 'basic'
    
    // Verificar se o usuário tem um dos planos necessários
    const hasAccess = requiredPlans.includes(userPlan) || user?.is_admin === true
    
    if (hasAccess) {
      console.log('✅ Acesso autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
      next()
    } else {
      console.warn('🚫 Acesso negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Planos necessários:', requiredPlans, 'Rota:', to.path)
      
      // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
      if (to.path !== '/plans') {
        localStorage.setItem('redirectAfterUpgrade', to.fullPath)
      }
      
      next('/plans')
    }
  }
}

// Guard para verificar acesso a funcionalidades de surebet
export function requireSurebetAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  console.log('🔍 [Guard] Verificando acesso a surebets:', {
    user: user?.email,
    accountType: user?.accountType,
    plan: user?.plan,
    is_admin: user?.is_admin,
    is_vip: user?.is_vip,
    userPlan,
    route: to.path
  })
  
  // Planos que têm acesso a surebets
  const surebetPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                       'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                       'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly']
  
  const hasAccess = surebetPlans.includes(userPlan) || user?.is_admin === true
  
  // Permitir que administradores acessem a página inicial mesmo com plano básico
  if (to.path === '/' && user?.is_admin === true) {
    console.log('✅ Admin acessando página inicial - permitido')
    next()
    return
  }
  
  if (hasAccess) {
    console.log('✅ Acesso a surebets autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a surebets negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}

// Guard para verificar acesso a funcionalidades de valuebet
export function requireValuebetAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  // Planos que têm acesso a valuebets
  const valuebetPlans = ['vip', 'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly']
  
  const hasAccess = valuebetPlans.includes(userPlan) || user?.is_admin === true
  
  if (hasAccess) {
    console.log('✅ Acesso a valuebets autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a valuebets negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}

// Guard para verificar acesso a funcionalidades de relatórios e análises
export function requireReportsAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  // Planos que têm acesso a relatórios (todos os planos pagos)
  const reportsPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                       'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                       'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
                       'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
                       'full-daily', 'full-weekly', 'full-monthly', 'full-yearly']
  
  const hasAccess = reportsPlans.includes(userPlan) || user?.is_admin === true
  
  if (hasAccess) {
    console.log('✅ Acesso a relatórios autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a relatórios negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}

// Guard para verificar acesso a funcionalidades de juros compostos
export function requireCompoundInterestAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  // Planos que têm acesso a juros compostos (todos os planos pagos)
  const compoundInterestPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                                'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                                'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
                                'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
                                'full-daily', 'full-weekly', 'full-monthly', 'full-yearly']
  
  const hasAccess = compoundInterestPlans.includes(userPlan) || user?.is_admin === true
  
  if (hasAccess) {
    console.log('✅ Acesso a juros compostos autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a juros compostos negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}

// Guard para verificar acesso a contas de casas de apostas
export function requireBookmakerAccountsAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  // Planos que têm acesso a contas de casas de apostas (todos os planos pagos)
  const bookmakerAccountsPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                                 'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                                 'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
                                 'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
                                 'full-daily', 'full-weekly', 'full-monthly', 'full-yearly']
  
  const hasAccess = bookmakerAccountsPlans.includes(userPlan) || user?.is_admin === true
  
  if (hasAccess) {
    console.log('✅ Acesso a contas de casas de apostas autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a contas de casas de apostas negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}

// Guard para verificar acesso a funcionalidades premium (guias, glossário, etc.)
export function requirePremiumAccess(to, from, next) {
  if (!store.getters.isAuthenticated) {
    console.warn('🚫 Tentativa de acesso sem autenticação para rota:', to.path)
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }

  const user = store.getters.currentUser
  const userPlan = user?.accountType || user?.plan || 'basic'
  
  // Planos que têm acesso a funcionalidades premium (todos os planos pagos)
  const premiumPlans = ['premium', 'vip', 'pre-daily', 'pre-weekly', 'pre-monthly', 'pre-yearly', 
                       'live-daily', 'live-weekly', 'live-monthly', 'live-yearly',
                       'prelive-daily', 'prelive-weekly', 'prelive-monthly', 'prelive-yearly',
                       'valuebet-daily', 'valuebet-weekly', 'valuebet-monthly', 'valuebet-yearly',
                       'full-daily', 'full-weekly', 'full-monthly', 'full-yearly']
  
  const hasAccess = premiumPlans.includes(userPlan) || user?.is_admin === true
  
  if (hasAccess) {
    console.log('✅ Acesso a funcionalidades premium autorizado para:', user?.email, 'Plano:', userPlan, 'Rota:', to.path)
    next()
  } else {
    console.warn('🚫 Acesso a funcionalidades premium negado para usuário:', user?.email, 'Plano atual:', userPlan, 'Rota:', to.path)
    
    // Salva a rota que o usuário tentou acessar para redirecionar após upgrade
    if (to.path !== '/plans') {
      localStorage.setItem('redirectAfterUpgrade', to.fullPath)
    }
    
    next('/plans')
  }
}
