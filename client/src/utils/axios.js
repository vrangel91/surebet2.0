import axios from 'axios'
import store from '@/store'

// Criar instância do axios
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getters.authToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Token adicionado ao header para:', config.url)
    } else {
      console.log('⚠️ Nenhum token encontrado para:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      store.dispatch('logout')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
