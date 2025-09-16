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

// Função para verificar se a resposta é JSON
async function checkJsonResponse(response) {
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

// Objeto HTTP com métodos para requisições
export const http = {
  async get(url, config = {}) {
    const response = await authenticatedFetch(url, {
      method: 'GET',
      ...config
    })
    
    if (!response.ok) {
      const errorData = await checkJsonResponse(response)
      throw {
        response: {
          data: errorData,
          status: response.status
        }
      }
    }
    
    return {
      data: await checkJsonResponse(response)
    }
  },
  
  async post(url, data = {}, config = {}) {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    })
    
    if (!response.ok) {
      const errorData = await checkJsonResponse(response)
      throw {
        response: {
          data: errorData,
          status: response.status
        }
      }
    }
    
    return {
      data: await checkJsonResponse(response)
    }
  },
  
  async put(url, data = {}, config = {}) {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    })
    
    if (!response.ok) {
      const errorData = await checkJsonResponse(response)
      throw {
        response: {
          data: errorData,
          status: response.status
        }
      }
    }
    
    return {
      data: await checkJsonResponse(response)
    }
  },
  
  async delete(url, config = {}) {
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
      ...config
    })
    
    if (!response.ok) {
      const errorData = await checkJsonResponse(response)
      throw {
        response: {
          data: errorData,
          status: response.status
        }
      }
    }
    
    return {
      data: await checkJsonResponse(response)
    }
  }
}
