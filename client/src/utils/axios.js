import axios from 'axios'
import store from '@/store'
import { getApiUrl } from '@/config/production.js'
import apiErrorHandler from './apiErrorHandler'

// Criar instância do axios
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
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
    // Não tratar 404 em rotas VIP como erro crítico
    const isVIPRoute = error.config?.url?.includes('/api/vip/')
    const is404Error = error.response?.status === 404
    
    if (isVIPRoute && is404Error) {
      // Para rotas VIP com 404, não logar como erro crítico
      console.log('ℹ️ Rota VIP retornou 404 - usuário provavelmente não é VIP')
      error.apiErrorInfo = {
        message: 'Usuário não possui dados VIP',
        type: 'vip_not_found',
        isOffline: false,
        shouldRetry: false,
        original: error,
        context: 'axios_interceptor'
      }
      return Promise.reject(error)
    }
    
    // Usar o novo sistema de tratamento de erros para outros casos
    const errorInfo = apiErrorHandler.handleError(error, 'axios_interceptor')
    
    // Log do erro para debugging
    apiErrorHandler.logErrorForDebugging(error, 'axios_interceptor')
    
    // Tratar erros de autenticação
    if (errorInfo.type === 'http' && error.response?.status === 401) {
      console.log('🔑 Token expirado, fazendo logout...')
      store.dispatch('logout')
      window.location.href = '/login'
    }
    
    // Adicionar informações de erro ao objeto de erro
    error.apiErrorInfo = errorInfo
    
    return Promise.reject(error)
  }
)

export default axiosInstance
