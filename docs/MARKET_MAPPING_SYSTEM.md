# Sistema de Mapeamento de Mercados - Documentação

## 📋 Visão Geral

Este sistema implementa um mapeamento completo e inteligente dos campos `market` da API para categorização e tradução automática, seguindo a estrutura especificada pelo usuário.

## 🏗️ Estrutura do Sistema

### Categorias Principais

1. **Resultado** - Mercados de resultado final, dupla chance, etc.
2. **Handicaps** - Handicaps asiáticos, europeus e spreads
3. **Totais** - Over/Under e totais por time
4. **Parciais / Períodos** - Resultados por tempo, sets, maps
5. **Escanteios** - Mercados específicos de escanteios
6. **Cartões** - Cartões amarelos, vermelhos e pênaltis
7. **Estatísticas** - Aces, faltas, impedimentos, etc.
8. **Combinados** - Mercados combinados (ex: resultado + total)

## 🔧 Como Usar

### Importação

```javascript
import { 
  categorizeMarket, 
  formatMarketForDisplay, 
  getMarketCategories,
  getSubcategories,
  isMarketInCategory 
} from '@/utils/market-translations.js'
```

### Funções Principais

#### 1. `categorizeMarket(marketText)`

Categoriza automaticamente um mercado e retorna informações detalhadas:

```javascript
const result = categorizeMarket("Under (3.5)")
console.log(result)
// {
//   category: "Totais",
//   subcategory: "Total Geral – Menos (Under)",
//   baseCode: "Under",
//   originalText: "Under (3.5)",
//   value: "3.5"
// }
```

#### 2. `formatMarketForDisplay(marketText)`

Formata o mercado para exibição amigável:

```javascript
formatMarketForDisplay("1 - Escanteios") // "Total Time 1 Escanteios – Escanteios"
formatMarketForDisplay("X") // "Empate"
formatMarketForDisplay("Over (2.5)") // "Total Geral – Mais (Over) – 2.5"
```

#### 3. `getMarketCategories()`

Retorna todas as categorias disponíveis:

```javascript
const categories = getMarketCategories()
// ["Resultado", "Handicaps", "Totais", "Parciais / Períodos", "Escanteios", "Cartões", "Estatísticas", "Combinados"]
```

#### 4. `isMarketInCategory(marketText, category)`

Verifica se um mercado pertence a uma categoria específica:

```javascript
isMarketInCategory("1", "Resultado") // true
isMarketInCategory("AH1", "Handicaps") // true
isMarketInCategory("X", "Totais") // false
```

## 📊 Exemplos de Mercados

### Resultados Básicos
- `"1"` → Vitória do Time 1
- `"X"` → Empate  
- `"2"` → Vitória do Time 2
- `"1X"` → Time 1 ou Empate
- `"12"` → Time 1 ou Time 2
- `"X2"` → Empate ou Time 2

### Handicaps
- `"AH1"` → Handicap Asiático - Casa
- `"AH2(0.0)"` → Handicap Asiático - Visitante (0.0)
- `"EH1(-1.5)"` → Handicap Europeu - Casa (-1.5)

### Totais
- `"Over (2.5)"` → Total Geral – Mais (Over) (2.5)
- `"Under (3)"` → Total Geral – Menos (Under) (3)
- `"TO1(1.5)"` → Over Time 1 (1.5)

### Escanteios
- `"1 - Escanteios"` → Total Time 1 Escanteios – Escanteios
- `"2 - Escanteios"` → Total Time 2 Escanteios – Escanteios
- `"1X - Escanteios"` → Dupla Chance de Escanteios – Escanteios

### Cartões
- `"YELLOW_CARDS"` → Cartões Amarelos
- `"TEAM1_YELLOW_CARDS"` → Total Time 1 Amarelos
- `"PENALTY"` → Pênalti

## 🧠 Lógica de Processamento

### 1. Extração do Código Base
O sistema remove complementos como:
- Valores entre parênteses: `"Under (3.5)"` → `"Under"`
- Sufixos: `"1 - Escanteios"` → `"1"`

### 2. Categorização
Compara o código base com as listas do `MARKET_MAPPING` para encontrar a categoria e subcategoria corretas.

### 3. Formatação
Monta uma frase amigável combinando:
- Nome da subcategoria
- Valor extraído (se houver)

## 🔄 Integração com Componentes

### SurebetCard.vue
```javascript
import { formatMarketForDisplay } from '@/utils/market-translations.js'

// No método formatMarket
formatMarket(market, sport = null) {
  if (!market) return 'Resultado Final'
  return formatMarketForDisplay(market)
}
```

### ReportsView.vue
```javascript
import { formatMarketForDisplay } from '@/utils/market-translations.js'

// No método formatMarketForDisplay
formatMarketForDisplay(marketText) {
  if (!marketText) return 'N/A'
  return formatMarketForDisplay(marketText)
}
```

## 🧪 Testes

Use o arquivo `market-examples.js` para testar o sistema:

```javascript
import { demonstrateMarketSystem } from '@/utils/market-examples.js'

// Executar demonstração
demonstrateMarketSystem()
```

## 📝 Adicionando Novos Mercados

Para adicionar novos mercados, edite o `MARKET_MAPPING` em `market-translations.js`:

```javascript
"Estatísticas": {
  "Novo Mercado": ["NOVO_CODIGO", "OUTRO_CODIGO"],
  // ... outros mercados
}
```

## 🚀 Benefícios

1. **Categorização Automática** - Mercados são automaticamente organizados
2. **Tradução Inteligente** - Texto amigável para usuários brasileiros
3. **Extensibilidade** - Fácil adição de novos mercados
4. **Consistência** - Padrão único em toda a aplicação
5. **Manutenibilidade** - Centralizado em um único arquivo

## 🔍 Casos de Uso

- **Filtros de UI** - Agrupar mercados por categoria
- **Relatórios** - Organizar dados por tipo de mercado
- **Análises** - Estatísticas por categoria de aposta
- **Interface** - Exibição amigável para usuários
