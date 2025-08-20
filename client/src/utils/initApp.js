import store from '@/store'

/**
 * Inicializa a aplicação e limpa dados mocados
 */
export function initializeApp() {
  console.log('🚀 Inicializando aplicação...')
  
  // Não limpar dados de usuários automaticamente - agora usamos API real
  // store.dispatch('clearMockDataOnInit')
  
  // Garantir que todos os usuários tenham a propriedade credits
  store.dispatch('ensureAllUsersHaveCredits')
  
  console.log('✅ Aplicação inicializada com sucesso')
}

/**
 * Limpa todos os dados do localStorage (use com cuidado!)
 */
export function clearAllLocalStorage() {
  console.log('🗑️ Limpando todo o localStorage...')
  localStorage.clear()
  console.log('✅ localStorage limpo completamente')
}

/**
 * Limpa apenas dados específicos do localStorage
 */
export function clearSpecificLocalStorage(keys) {
  console.log('🗑️ Limpando dados específicos do localStorage...')
  keys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`✅ Removido: ${key}`)
  })
}
