// Teste do sistema de extração de domínio dos campos anchorh
import { extractDomainFromAnchorh, buildBookmakerUrlFromDomain } from '../config/bookmakerUrls.js'

// Dados de teste simulando a API
const testData = [
  {
    house: "Pixbet",
    anchorh1: "https://www.betburger.com/bets/12345?domain=pixbet.bet.br&is_live=0&sport=soccer",
    anchorh2: "https://www.betburger.com/bets/67890?domain=bateu.bet.br&is_live=0&sport=soccer",
    isLive: false
  },
  {
    house: "Bet365",
    anchorh1: "https://www.betburger.com/bets/11111?domain=bet365.com&is_live=1&sport=soccer",
    anchorh2: null,
    isLive: true
  },
  {
    house: "Betano",
    anchorh1: null,
    anchorh2: "https://www.betburger.com/bets/22222?domain=betano.bet.br&is_live=0&sport=soccer",
    isLive: false
  },
  {
    house: "CasaSemAnchorh",
    anchorh1: null,
    anchorh2: null,
    isLive: false
  }
]

/**
 * Testa a extração de domínio dos campos anchorh
 */
export function testAnchorhExtraction() {
  console.log('🧪 TESTE: Extração de domínio dos campos anchorh')
  console.log('=' .repeat(60))
  
  testData.forEach((bet, index) => {
    console.log(`\n📊 Teste ${index + 1}: ${bet.house}`)
    console.log(`   anchorh1: ${bet.anchorh1 || 'null'}`)
    console.log(`   anchorh2: ${bet.anchorh2 || 'null'}`)
    console.log(`   isLive: ${bet.isLive}`)
    
    // Testa extração do anchorh1
    if (bet.anchorh1) {
      const domain1 = extractDomainFromAnchorh(bet.anchorh1)
      const url1 = buildBookmakerUrlFromDomain(domain1, bet.isLive)
      console.log(`   ✅ anchorh1 → domínio: "${domain1}" → URL: ${url1}`)
    }
    
    // Testa extração do anchorh2
    if (bet.anchorh2) {
      const domain2 = extractDomainFromAnchorh(bet.anchorh2)
      const url2 = buildBookmakerUrlFromDomain(domain2, bet.isLive)
      console.log(`   ✅ anchorh2 → domínio: "${domain2}" → URL: ${url2}`)
    }
    
    if (!bet.anchorh1 && !bet.anchorh2) {
      console.log(`   ❌ Nenhum campo anchorh disponível`)
    }
  })
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ Teste concluído!')
}

/**
 * Simula o processo de redirecionamento para uma aposta
 */
export function simulateBetRedirect(bet) {
  console.log(`\n🎯 SIMULAÇÃO: Redirecionamento para ${bet.house}`)
  
  let targetUrl = null
  let source = null
  
  // Tenta extrair do anchorh1 primeiro
  if (bet.anchorh1) {
    const domain = extractDomainFromAnchorh(bet.anchorh1)
    if (domain) {
      targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive)
      source = 'anchorh1'
    }
  }
  
  // Se não encontrou no anchorh1, tenta no anchorh2
  if (!targetUrl && bet.anchorh2) {
    const domain = extractDomainFromAnchorh(bet.anchorh2)
    if (domain) {
      targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive)
      source = 'anchorh2'
    }
  }
  
  if (targetUrl) {
    console.log(`   🚀 Redirecionando para: ${targetUrl}`)
    console.log(`   📍 Fonte: ${source}`)
    console.log(`   🔗 URL original: ${bet[source]}`)
    return { success: true, url: targetUrl, source }
  } else {
    console.log(`   ❌ Não foi possível extrair URL válida`)
    return { success: false, url: null, source: null }
  }
}

// Executa o teste se o arquivo for importado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adiciona ao console global para testes
  window.testAnchorhExtraction = testAnchorhExtraction
  window.simulateBetRedirect = simulateBetRedirect
  console.log('🧪 Funções de teste disponíveis:')
  console.log('   - testAnchorhExtraction()')
  console.log('   - simulateBetRedirect(bet)')
}
