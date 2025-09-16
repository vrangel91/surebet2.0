/**
 * Testes da API - Zerolossbet
 */

import { API_CONFIG, buildApiUrl, checkApiHealth } from './apiConfig.js'

// Função para verificar se a resposta é JSON de forma segura
async function safeJsonResponse(response) {
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

/**
 * Testar conectividade com a API
 */
export async function testAPIConnectivity() {
  console.log('🌐 Testando conectividade com a API...')
  
  try {
    const isHealthy = await checkApiHealth()
    console.log('📡 Status da API:', isHealthy ? '✅ Online' : '❌ Offline')
    
    if (isHealthy) {
      console.log('🎯 API está respondendo corretamente')
      return { success: true, status: 'online' }
    } else {
      console.log('⚠️ API não está respondendo')
      return { success: false, status: 'offline' }
    }
  } catch (error) {
    console.error('❌ Erro ao testar conectividade:', error)
    return { success: false, status: 'error', error: error.message }
  }
}

/**
 * Testar endpoint de surebets
 */
export async function testSurebetsEndpoint() {
  console.log('🧪 Testando endpoint de surebets...')
  
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS)
    console.log('🔗 URL testada:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors'
    })
    
    console.log('📡 Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await safeJsonResponse(response)
    console.log('📊 Dados recebidos:', data)
    
    // Validar estrutura dos dados
    const isValid = validateAPIResponse(data)
    console.log('✅ Validação da resposta:', isValid)
    
    return {
      success: true,
      status: response.status,
      data,
      isValid
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validar resposta da API
 */
function validateAPIResponse(data) {
  if (!data || typeof data !== 'object') {
    console.error('❌ Resposta não é um objeto válido')
    return false
  }
  
  const keys = Object.keys(data)
  if (keys.length === 0) {
    console.error('❌ Resposta está vazia')
    return false
  }
  
  console.log('📋 Chaves encontradas:', keys)
  
  // Verificar se pelo menos uma chave tem o formato esperado
  const sampleKey = keys[0]
  const sampleValue = data[sampleKey]
  
  if (!Array.isArray(sampleValue)) {
    console.error('❌ Valor não é um array:', sampleValue)
    return false
  }
  
  if (sampleValue.length === 0) {
    console.error('❌ Array está vazio')
    return false
  }
  
  // Verificar estrutura do primeiro item
  const sampleItem = sampleValue[0]
  const requiredFields = ['house', 'profit', 'roi']
  const missingFields = requiredFields.filter(field => !sampleItem.hasOwnProperty(field))
  
  if (missingFields.length > 0) {
    console.error('❌ Campos obrigatórios faltando:', missingFields)
    return false
  }
  
  console.log('✅ Estrutura da resposta é válida')
  return true
}

/**
 * Testar timeout da API
 */
export async function testAPITimeout() {
  console.log('⏱️ Testando timeout da API...')
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
    
    const startTime = Date.now()
    
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`⏱️ Tempo de resposta: ${responseTime}ms`)
    
    if (responseTime > API_CONFIG.TIMEOUT) {
      console.warn('⚠️ API respondeu, mas demorou mais que o timeout configurado')
    }
    
    return {
      success: true,
      responseTime,
      withinTimeout: responseTime <= API_CONFIG.TIMEOUT
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏰ API excedeu o timeout configurado')
      return { success: false, error: 'timeout' }
    } else {
      console.error('❌ Erro durante teste de timeout:', error)
      return { success: false, error: error.message }
    }
  }
}

/**
 * Testar headers da API
 */
export async function testAPIHeaders() {
  console.log('📋 Testando headers da API...')
  
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: 'HEAD',
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: 'cors'
    })
    
    const headers = Object.fromEntries(response.headers.entries())
    console.log('📋 Headers recebidos:', headers)
    
    // Verificar headers importantes
    const importantHeaders = ['content-type', 'access-control-allow-origin', 'cache-control']
    const foundHeaders = importantHeaders.filter(header => 
      Object.keys(headers).some(key => key.toLowerCase() === header)
    )
    
    console.log('🎯 Headers importantes encontrados:', foundHeaders)
    
    return {
      success: true,
      headers,
      importantHeaders: foundHeaders
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar headers:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Testar CORS
 */
export async function testCORSPolicy() {
  console.log('🌍 Testando política CORS...')
  
  try {
    // Testar com diferentes origens
    const testOrigins = [
      'https://localhost:3000',
      'https://127.0.0.1:3000',
      'https://boasvindasbotbet.com'
    ]
    
    const results = {}
    
    for (const origin of testOrigins) {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
          method: 'GET',
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            'Origin': origin
          },
          mode: 'cors'
        })
        
        results[origin] = {
          success: response.ok,
          status: response.status,
          corsAllowed: response.headers.get('access-control-allow-origin') !== null
        }
        
      } catch (error) {
        results[origin] = {
          success: false,
          error: error.message
        }
      }
    }
    
    console.log('🌍 Resultados CORS:', results)
    
    return {
      success: true,
      results
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar CORS:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Executar todos os testes da API
 */
export async function runAllAPITests() {
  console.log('🚀 Executando todos os testes da API...')
  
  const results = {
    connectivity: await testAPIConnectivity(),
    endpoint: await testSurebetsEndpoint(),
    timeout: await testAPITimeout(),
    headers: await testAPIHeaders(),
    cors: await testCORSPolicy()
  }
  
  console.log('📋 Resultados dos testes da API:', results)
  
  const allPassed = Object.values(results).every(result => result.success)
  console.log(allPassed ? '🎉 Todos os testes da API passaram!' : '❌ Alguns testes da API falharam')
  
  return results
}

/**
 * Teste rápido de funcionalidade
 */
export async function quickAPITest() {
  console.log('⚡ Teste rápido da API...')
  
  try {
    const connectivity = await testAPIConnectivity()
    
    if (!connectivity.success) {
      console.log('❌ API não está acessível')
      return { success: false, reason: 'no_connectivity' }
    }
    
    const endpoint = await testSurebetsEndpoint()
    
    if (!endpoint.success) {
      console.log('❌ Endpoint não está funcionando')
      return { success: false, reason: 'endpoint_error' }
    }
    
    console.log('✅ API está funcionando corretamente')
    return { success: true, data: endpoint.data }
    
  } catch (error) {
    console.error('❌ Erro no teste rápido:', error)
    return { success: false, reason: 'test_error', error: error.message }
  }
}

// Executar testes automaticamente se importado diretamente
if (typeof window !== 'undefined') {
  // Estamos no navegador
  window.apiTest = {
    testAPIConnectivity,
    testSurebetsEndpoint,
    testAPITimeout,
    testAPIHeaders,
    testCORSPolicy,
    runAllAPITests,
    quickAPITest
  }
  
  console.log('🔧 API Test disponível em window.apiTest')
}
