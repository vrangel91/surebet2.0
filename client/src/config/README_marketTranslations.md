# Sistema de Traduções de Mercado

Este sistema permite gerenciar traduções de códigos de mercado de apostas de forma centralizada e fácil de manter.

## Estrutura de Arquivos

```
client/src/
├── config/
│   ├── marketTranslations.json    # Arquivo JSON com todas as traduções
│   └── README_marketTranslations.md
└── services/
    └── marketTranslationService.js # Serviço para carregar e usar traduções
```

## Como Funciona

### 1. Arquivo JSON (`marketTranslations.json`)

Contém todas as traduções organizadas em categorias:

```json
{
  "translations": {
    "TO(0.5)": "Mais de 0.5 Gols",
    "TU(0.5)": "Menos de 0.5 Gols",
    "1": "Vitória Time 1",
    "2": "Vitória Time 2"
  },
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-01-15",
    "description": "Traduções de códigos de mercado de apostas para português brasileiro",
    "categories": {
      "over_under": ["TO", "TU"],
      "handicaps": ["AH", "EH"],
      "results": ["Score", "Exact", "Team1 Win", "Team2 Win"]
    }
  }
}
```

### 2. Serviço (`marketTranslationService.js`)

Fornece funções para:
- Carregar traduções do JSON
- Traduzir códigos de mercado
- Extrair códigos de strings completas
- Gerenciar cache das traduções

## Como Usar

### No Componente Vue

```javascript
import { translateMarket, extractMarketCode } from '../services/marketTranslationService.js'

export default {
  methods: {
    async showTranslation(marketString) {
      // Traduz mercado completo
      const translated = await translateMarket(marketString)
      console.log(translated) // "Mais de 2.5 Gols" para "TO(2.5)"
      
      // Extrai apenas o código
      const code = await extractMarketCode(marketString)
      console.log(code) // "TO(2.5)" de "TO(2.5) - Barcelona vs Real Madrid"
    }
  }
}
```

### Adicionando Novas Traduções

1. Abra `client/src/config/marketTranslations.json`
2. Adicione a nova tradução no objeto `translations`:

```json
{
  "translations": {
    "NOVO_CODIGO": "Nova Tradução",
    "EXISTING_CODE": "Tradução Existente"
  }
}
```

3. Atualize a categoria correspondente em `metadata.categories` se necessário
4. Salve o arquivo - as traduções serão carregadas automaticamente

### Recarregando Traduções (Desenvolvimento)

```javascript
import { reloadTranslations } from '../services/marketTranslationService.js'

// Força recarregamento das traduções
await reloadTranslations()
```

## Vantagens do Sistema

1. **Centralizado**: Todas as traduções em um local
2. **Fácil Manutenção**: Apenas editar o JSON
3. **Cache Inteligente**: Carrega apenas uma vez
4. **Fallback**: Traduções básicas em caso de erro
5. **Assíncrono**: Não bloqueia a interface
6. **Extensível**: Fácil adicionar novas categorias

## Categorias de Mercado

- **Over/Under**: `TO`, `TU` (Mais de/Menos de)
- **Handicaps**: `AH`, `EH` (Handicap Asiático/Europeu)
- **Resultados**: `Score`, `Exact`, `Team1 Win`, `Team2 Win`
- **Períodos**: `HT`, `FT` (Primeiro Tempo/Tempo Completo)
- **Estatísticas**: `Field Goals`, `Fouls`, `Corners`
- **Mercados Especiais**: `BothToScore`, `FirstGoal`, `LastGoal`
- **Direcionais**: `for Team1`, `for Team2`
- **Escanteios**: Combinações com `- Corners`

## Exemplos de Uso

```javascript
// Tradução simples
await translateMarket("TO(2.5)") // "Mais de 2.5 Gols"

// Tradução com contexto
await translateMarket("TO(2.5) - Barcelona vs Real Madrid") 
// "Mais de 2.5 Gols - Barcelona vs Real Madrid"

// Código não encontrado
await translateMarket("UNKNOWN_CODE") // "UNKNOWN_CODE" (retorna original)
```

## Troubleshooting

### Tradução não aparece
1. Verifique se o código está no JSON
2. Confirme se o arquivo JSON está acessível
3. Verifique o console para erros de carregamento

### Performance lenta
- As traduções são carregadas apenas uma vez e ficam em cache
- Se necessário, use `reloadTranslations()` para forçar recarregamento

### Adicionando muitas traduções
- Organize por categorias no JSON
- Use nomes descritivos para os códigos
- Mantenha a estrutura consistente
