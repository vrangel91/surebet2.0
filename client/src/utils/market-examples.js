/**
 * Exemplos de Uso do Sistema de Mapeamento de Mercados
 * Este arquivo demonstra como usar as funções do market-translations.js
 */

import { 
  categorizeMarket, 
  formatMarketForDisplay, 
  getMarketCategories,
  getSubcategories,
  isMarketInCategory 
} from './market-translations.js'

// Exemplos de mercados para testar
const exampleMarkets = [
  // Resultados básicos
  "1",
  "X", 
  "2",
  "1X",
  "12",
  "X2",
  
  // Handicaps
  "AH1",
  "AH2(0.0)",
  "EH1(-1.5)",
  
  // Totais
  "Over (2.5)",
  "Under (3)",
  "TO1(1.5)",
  "TU2(0.5)",
  
  // Parciais
  "1H-1X2",
  "2H-TO(1.5)",
  
  // Escanteios
  "1 - Escanteios",
  "2 - Escanteios", 
  "1X - Escanteios",
  
  // Cartões
  "YELLOW_CARDS",
  "TEAM1_YELLOW_CARDS",
  
  // Estatísticas
  "ACES_TOTAL",
  "FOULS",
  
  // Combinados
  "1X2+TO(2.5)",
  
  // Casos especiais
  "Team1 Win",
  "AH2(0.0)/DNB"
]

/**
 * Função para demonstrar o funcionamento do sistema
 */
export function demonstrateMarketSystem() {
  console.log('🎯 SISTEMA DE MAPEAMENTO DE MERCADOS')
  console.log('=====================================\n')
  
  // Mostrar todas as categorias disponíveis
  console.log('📂 CATEGORIAS DISPONÍVEIS:')
  const categories = getMarketCategories()
  categories.forEach(category => {
    console.log(`  • ${category}`)
  })
  console.log()
  
  // Testar cada mercado de exemplo
  console.log('🔍 ANÁLISE DOS MERCADOS:')
  exampleMarkets.forEach(market => {
    const categorization = categorizeMarket(market)
    const formatted = formatMarketForDisplay(market)
    
    console.log(`\n📊 "${market}"`)
    console.log(`   Categoria: ${categorization.category}`)
    console.log(`   Subcategoria: ${categorization.subcategory}`)
    console.log(`   Código Base: ${categorization.baseCode}`)
    console.log(`   Valor: ${categorization.value || 'N/A'}`)
    console.log(`   Formatado: ${formatted}`)
    
    // Verificar se pertence a categorias específicas
    if (isMarketInCategory(market, 'Resultado')) {
      console.log(`   ✅ Pertence à categoria "Resultado"`)
    }
    if (isMarketInCategory(market, 'Handicaps')) {
      console.log(`   ✅ Pertence à categoria "Handicaps"`)
    }
    if (isMarketInCategory(market, 'Totais')) {
      console.log(`   ✅ Pertence à categoria "Totais"`)
    }
  })
  
  // Mostrar subcategorias de uma categoria específica
  console.log('\n📋 SUBCATEGORIAS DE "RESULTADO":')
  const resultSubcategories = getSubcategories('Resultado')
  resultSubcategories.forEach(sub => {
    console.log(`  • ${sub}`)
  })
  
  console.log('\n✨ DEMONSTRAÇÃO CONCLUÍDA!')
}

/**
 * Função para testar casos específicos
 */
export function testSpecificCases() {
  console.log('\n🧪 TESTES ESPECÍFICOS:')
  
  // Teste 1: Mercado com valor entre parênteses
  const market1 = "Under (3.5)"
  console.log(`\nTeste 1: "${market1}"`)
  const cat1 = categorizeMarket(market1)
  console.log(`   Categoria: ${cat1.category}`)
  console.log(`   Subcategoria: ${cat1.subcategory}`)
  console.log(`   Valor: ${cat1.value}`)
  
  // Teste 2: Mercado com sufixo
  const market2 = "1 - Escanteios"
  console.log(`\nTeste 2: "${market2}"`)
  const cat2 = categorizeMarket(market2)
  console.log(`   Categoria: ${cat2.category}`)
  console.log(`   Subcategoria: ${cat2.subcategory}`)
  console.log(`   Valor: ${cat2.value}`)
  
  // Teste 3: Mercado simples
  const market3 = "X"
  console.log(`\nTeste 3: "${market3}"`)
  const cat3 = categorizeMarket(market3)
  console.log(`   Categoria: ${cat3.category}`)
  console.log(`   Subcategoria: ${cat3.subcategory}`)
  console.log(`   Valor: ${cat3.value}`)
}

// Executar demonstração se o arquivo for executado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  demonstrateMarketSystem()
  testSpecificCases()
}
