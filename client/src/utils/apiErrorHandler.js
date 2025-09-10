// 🚀 Sistema de Tratamento de Erros da API - SureStake

class APIErrorHandler {
  constructor() {
    this.errorMessages = {
      // Erros de rede
      'Network Error': 'Erro de conexão. Verifique sua internet.',
      'timeout': 'Tempo limite excedido. Tente novamente.',
      'ft': 'Falha na comunicação com o servidor.',
      
      // Erros HTTP
      400: 'Requisição inválida.',
      401: 'Sessão expirada. Faça login novamente.',
      403: 'Acesso negado.',
      404: 'Recurso não encontrado.',
      500: 'Erro interno do servidor.',
      502: 'Servidor indisponível.',
      503: 'Serviço temporariamente indisponível.',
      504: 'Tempo limite do servidor excedido.',
      
      // Erros específicos do PWA
      'PWA_OFFLINE': 'Aplicativo offline. Usando dados locais.',
      'CACHE_MISS': 'Dados não encontrados no cache.',
      'SYNC_FAILED': 'Falha na sincronização com servidor.'
    }
  }

  // Tratar erro da API
  handleError(error, context = '') {
    let errorMessage = 'Erro desconhecido'
    let errorType = 'unknown'
    let isOffline = false
    let shouldRetry = false

    try {
      // Verificar se é erro de rede
      if (error.message === 'Network Error' || !navigator.onLine) {
        errorMessage = this.errorMessages['Network Error']
        errorType = 'network'
        isOffline = true
        shouldRetry = true
      }
      // Verificar se é erro de timeout
      else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = this.errorMessages['timeout']
        errorType = 'timeout'
        shouldRetry = true
      }
      // Verificar se é erro HTTP
      else if (error.response) {
        const status = error.response.status
        errorMessage = this.errorMessages[status] || `Erro ${status}: ${error.response.statusText}`
        errorType = 'http'
        
        // Retry para erros 5xx
        if (status >= 500) {
          shouldRetry = true
        }
      }
      // Verificar se é erro "ft" (erro específico do sistema)
      else if (error.message === 'ft' || error.toString().includes('ft')) {
        errorMessage = this.errorMessages['ft']
        errorType = 'system'
        shouldRetry = true
      }
      // Outros erros
      else if (error.message) {
        errorMessage = error.message
        errorType = 'other'
      }

      // Log do erro
      console.error(`❌ Erro da API [${context}]:`, {
        message: errorMessage,
        type: errorType,
        original: error,
        isOffline,
        shouldRetry,
        timestamp: new Date().toISOString()
      })

      // Retornar objeto de erro estruturado
      return {
        message: errorMessage,
        type: errorType,
        isOffline,
        shouldRetry,
        original: error,
        context
      }

    } catch (parseError) {
      console.error('❌ Erro ao processar erro da API:', parseError)
      return {
        message: 'Erro ao processar erro',
        type: 'parse_error',
        isOffline: false,
        shouldRetry: false,
        original: error,
        context
      }
    }
  }

  // Verificar se deve tentar novamente
  shouldRetry(error, retryCount = 0, maxRetries = 3) {
    const errorInfo = this.handleError(error)
    
    if (!errorInfo.shouldRetry) return false
    if (retryCount >= maxRetries) return false
    
    // Não retry para erros de autenticação
    if (errorInfo.type === 'http' && error.response?.status === 401) return false
    
    return true
  }

  // Obter mensagem amigável para o usuário
  getUserFriendlyMessage(error) {
    const errorInfo = this.handleError(error)
    
    if (errorInfo.isOffline) {
      return '📱 Modo offline ativo. Algumas funcionalidades podem estar limitadas.'
    }
    
    return errorInfo.message
  }

  // Verificar se é erro crítico
  isCriticalError(error) {
    const errorInfo = this.handleError(error)
    
    // Erros críticos que requerem ação do usuário
    const criticalTypes = ['auth', 'permission', 'validation']
    const criticalStatuses = [401, 403, 422]
    
    return criticalTypes.includes(errorInfo.type) || 
           (errorInfo.type === 'http' && criticalStatuses.includes(errorInfo.original?.response?.status))
  }

  // Verificar se é erro temporário
  isTemporaryError(error) {
    const errorInfo = this.handleError(error)
    
    // Erros temporários que podem ser resolvidos sozinhos
    const temporaryTypes = ['network', 'timeout', 'system']
    const temporaryStatuses = [500, 502, 503, 504]
    
    return temporaryTypes.includes(errorInfo.type) || 
           (errorInfo.type === 'http' && temporaryStatuses.includes(errorInfo.original?.response?.status))
  }

  // Obter sugestões de resolução
  getResolutionSuggestions(error) {
    const errorInfo = this.handleError(error)
    
    const suggestions = {
      network: [
        'Verifique sua conexão com a internet',
        'Tente novamente em alguns instantes',
        'Verifique se o servidor está online'
      ],
      timeout: [
        'A operação está demorando mais que o esperado',
        'Tente novamente em alguns instantes',
        'Verifique sua conexão com a internet'
      ],
      auth: [
        'Sua sessão pode ter expirado',
        'Faça login novamente',
        'Verifique suas credenciais'
      ],
      permission: [
        'Você não tem permissão para esta ação',
        'Entre em contato com o administrador',
        'Verifique se sua conta tem os privilégios necessários'
      ],
      system: [
        'Erro interno do sistema',
        'Tente novamente em alguns instantes',
        'Entre em contato com o suporte se o problema persistir'
      ]
    }
    
    return suggestions[errorInfo.type] || ['Tente novamente mais tarde']
  }

  // Log de erro para debugging
  logErrorForDebugging(error, context = '') {
    const errorInfo = this.handleError(error, context)
    
    // Log estruturado para debugging
    const debugInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: errorInfo.message,
        type: errorInfo.type,
        isOffline: errorInfo.isOffline,
        shouldRetry: errorInfo.shouldRetry
      },
      user: {
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      original: {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      }
    }
    
    console.group('🐛 Debug Info - Erro da API')
    console.table(debugInfo)
    console.groupEnd()
    
    return debugInfo
  }
}

// Instância global do handler
const apiErrorHandler = new APIErrorHandler()

export default apiErrorHandler
