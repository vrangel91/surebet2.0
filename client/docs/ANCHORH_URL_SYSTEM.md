# Sistema de Extração de URLs dos Campos Anchorh

## Visão Geral

Este sistema implementa uma solução inteligente para extrair URLs de redirecionamento diretamente dos campos `anchorh1` e `anchorh2` retornados pela API, garantindo que cada botão de aposta redirecione para a casa de apostas correta.

## Como Funciona

### 1. Extração de Domínio

O sistema analisa os campos `anchorh1` e `anchorh2` para extrair o domínio da casa de apostas:

```javascript
// Exemplo de campo anchorh da API
"anchorh1": "https://www.betburger.com/bets/12345?domain=pixbet.bet.br&is_live=0&sport=soccer"

// O sistema extrai o parâmetro domain=
const domain = extractDomainFromAnchorh(anchorh1)
// Resultado: "pixbet.bet.br"
```

### 2. Construção da URL

Com o domínio extraído, o sistema constrói a URL completa:

```javascript
const url = buildBookmakerUrlFromDomain(domain, isLive)
// Resultado: "https://pixbet.bet.br/"
```

### 3. Priorização de Fontes

O sistema segue uma hierarquia de prioridades:

1. **Primeiro**: Extrai domínio de `anchorh1` (casa principal)
2. **Segundo**: Extrai domínio de `anchorh2` (casa secundária)
3. **Terceiro**: Usa `url_redirect` da API (se disponível)
4. **Último**: Usa mapeamento estático baseado no nome da casa

## Estrutura dos Dados

### Campos da API

```json
{
  "house": "Pixbet",
  "anchorh1": "https://www.betburger.com/bets/12345?domain=pixbet.bet.br&is_live=0",
  "anchorh2": "https://www.betburger.com/bets/67890?domain=bateu.bet.br&is_live=0",
  "isLive": false,
  "url_redirect": "https://pixbet.bet.br/event/12345"
}
```

### Parâmetros Importantes

- **`domain=`**: Contém o domínio da casa de apostas
- **`is_live=`**: Indica se é jogo live (1) ou pré-match (0)
- **`sport=`**: Esporte da aposta
- **`url_redirect`**: URL alternativa fornecida pela API

## Funções Principais

### `extractDomainFromAnchorh(anchorh)`

Extrai o domínio de um campo anchorh:

```javascript
// Busca pelo parâmetro domain=
const domainMatch = anchorh.match(/domain=([^&]+)/)

// Fallback: extrai da URL completa
const urlMatch = anchorh.match(/https?:\/\/([^\/\?&]+)/)
```

### `buildBookmakerUrlFromDomain(domain, isLive)`

Constrói a URL completa para a casa de apostas:

```javascript
// Adiciona protocolo se necessário
let url = domain.startsWith('http') ? domain : `https://${domain}`

// Adiciona parâmetros para jogos live
if (isLive && !url.includes('/live')) {
  url = url.endsWith('/') ? url + 'live' : url + '/live'
}
```

## Implementação no Frontend

### SurebetCard.vue

```vue
<button 
  class="bet-btn" 
  @click="placeBet(bet)"
  :title="getButtonTooltip(bet)"
  :class="{ 'disabled': !hasValidUrl(bet) }"
>
  <span class="bet-icon">💰</span>
  <span class="bet-text">Apostar</span>
  <span class="url-source" v-if="getUrlSource(bet)">
    {{ getUrlSource(bet) }}
  </span>
</button>
```

### Método placeBet

```javascript
placeBet(bet) {
  // 1. Tenta extrair do anchorh1
  if (bet.anchorh1) {
    const domain = extractDomainFromAnchorh(bet.anchorh1)
    if (domain) {
      const targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive)
      window.open(targetUrl, '_blank')
      return
    }
  }
  
  // 2. Tenta extrair do anchorh2
  if (bet.anchorh2) {
    const domain = extractDomainFromAnchorh(bet.anchorh2)
    if (domain) {
      const targetUrl = buildBookmakerUrlFromDomain(domain, bet.isLive)
      window.open(targetUrl, '_blank')
      return
    }
  }
  
  // 3. Fallbacks...
}
```

## Validação e Tratamento de Erros

### Verificação de URLs Válidas

```javascript
hasValidUrl(bet) {
  return !!(bet.anchorh1 || bet.anchorh2 || 
    (bet.url_redirect && bet.url_redirect.includes('http')))
}
```

### Botões Desabilitados

Se nenhuma URL válida for encontrada, o botão é desabilitado:

```css
.bet-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--text-secondary);
}
```

## Informações Visuais

### Tooltip do Botão

Mostra informações sobre a fonte da URL:

```
Casa: Pixbet
URL extraída de anchorh1
https://www.betburger.com/bets/12345?domain=pixbet.bet.br&is_live=0
```

### Indicador de Fonte

Cada botão mostra visualmente a fonte da URL:

- **anchorh1**: URL extraída do campo principal
- **anchorh2**: URL extraída do campo secundário  
- **API**: URL fornecida diretamente pela API

## Testes

### Função de Teste

```javascript
// No console do navegador
testAnchorhExtraction()

// Simula redirecionamento
simulateBetRedirect(bet)
```

### Dados de Teste

```javascript
const testData = [
  {
    house: "Pixbet",
    anchorh1: "https://www.betburger.com/bets/12345?domain=pixbet.bet.br&is_live=0",
    anchorh2: "https://www.betburger.com/bets/67890?domain=bateu.bet.br&is_live=0",
    isLive: false
  }
]
```

## Vantagens do Sistema

1. **URLs Dinâmicas**: Cada botão usa a URL específica da casa
2. **Fallbacks Inteligentes**: Múltiplas fontes de URL
3. **Validação Robusta**: Verifica URLs antes de habilitar botões
4. **Debug Visual**: Mostra claramente qual fonte está sendo usada
5. **Tratamento de Erros**: Graceful degradation para casos problemáticos

## Configuração

### Arquivo bookmakerUrls.js

Contém o mapeamento estático de casas de apostas como fallback:

```javascript
export const bookmakerUrls = {
  "Pixbet": "https://pixbet.bet.br/",
  "Bet365": "https://www.bet365.bet.br/",
  // ... outras casas
}
```

### URLs Específicas para Live

```javascript
export const bookmakerLiveUrls = {
  "Betboo": "https://www.betboo.bet.br/pt-br/sports/ao-vivo/aposta",
  // ... outras casas com URLs live específicas
}
```

## Monitoramento e Debug

### Console Logs

O sistema gera logs detalhados para debug:

```
🔗 Domínio extraído de anchorh: pixbet.bet.br
🏗️ URL construída para domínio pixbet.bet.br: https://pixbet.bet.br/
🚀 Redirecionando para Pixbet usando domínio extraído: https://pixbet.bet.br/
```

### Métricas de Uso

- Fonte da URL mais utilizada
- Taxa de sucesso na extração
- Casas de apostas com problemas de URL

## Manutenção

### Adicionar Nova Casa

1. Adicionar ao mapeamento estático em `bookmakerUrls.js`
2. Testar com dados reais da API
3. Verificar se os campos anchorh estão corretos

### Atualizar URLs

1. Modificar o mapeamento estático
2. Testar redirecionamentos
3. Verificar se as URLs estão funcionando

## Troubleshooting

### Problemas Comuns

1. **Domínio não extraído**: Verificar formato do campo anchorh
2. **URL malformada**: Verificar se o domínio está correto
3. **Botão desabilitado**: Verificar se há campos anchorh válidos

### Debug

1. Usar `testAnchorhExtraction()` no console
2. Verificar logs do console
3. Inspecionar campos anchorh na API
4. Testar URLs manualmente

## Conclusão

Este sistema fornece uma solução robusta e inteligente para redirecionar usuários para as casas de apostas corretas, garantindo uma experiência de usuário consistente e confiável.
