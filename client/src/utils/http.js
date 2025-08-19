import store from '../store'

// Função para adicionar headers de autenticação
export function addAuthHeaders(headers = {}) {
  const token = store.getters.authToken
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  headers['Content-Type'] = 'application/json'
  return headers
}

// Função para fazer requisições HTTP autenticadas
export async function authenticatedFetch(url, options = {}) {
  const headers = addAuthHeaders(options.headers)
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  // Se receber 401 (Unauthorized), faz logout
  if (response.status === 401) {
    store.dispatch('logout')
    window.location.href = '/login'
    throw new Error('Sessão expirada. Faça login novamente.')
  }
  
  return response
}

// Função para verificar se o token é válido
export async function validateToken() {
  try {
    const token = store.getters.authToken
    if (!token) return false
    
    // Aqui você faria uma chamada para sua API para validar o token
    // const response = await fetch('/api/auth/validate', {
    //   headers: addAuthHeaders()
    // })
    // return response.ok
    
    // Por enquanto, vamos apenas verificar se o token existe
    return !!token
  } catch (error) {
    console.error('Erro ao validar token:', error)
    return false
  }
}
