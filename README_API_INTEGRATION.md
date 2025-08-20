# Integração com API Real - Zerolossbet

## Visão Geral

Este documento descreve a integração com a API real da Zerolossbet (`https://zerolossbet.com/api/fetch_surebets/`) para fornecer dados em tempo real para a página de ranking.

## Estrutura da API

### Endpoint
- **URL**: `https://zerolossbet.com/api/fetch_surebets/`
- **Método**: GET
- **Resposta**: JSON

### Formato de Resposta
A API retorna um objeto onde:
- **Chaves**: `surebet_id` únicos
- **Valores**: Arrays de partes do surebet

```json
{
  "surebet_001": [
    {
      "house": "Bet365",
      "profit": 15.50,
      "roi": 3.2,
      "timestamp": "2024-01-15T10:00:00Z",
      "sport": "Futebol",
      "event": "Brasil vs Argentina",
      "market": "Resultado Final",
      "selection1": "Brasil",
      "selection2": "Empate",
      "selection3": "Argentina",
      "odds1": 2.10,
      "odds2": 3.40,
      "odds3": 3.80,
      "stake": 100,
      "status": "active"
    }
  ],
  "surebet_002": [
    // ... mais partes do surebet
  ]
}
```

## Processamento de Dados

### 1. Garantia de Unicidade
- Cada `surebet_id` é processado apenas uma vez
- Uso de `Set` para rastrear IDs já processados
- Prevenção de duplicação na contagem de casas de apostas

### 2. Transformação de Dados
- **`house`** → `bookmaker1` (casa de aposta principal)
- **`profit`** → Lucro do surebet
- **`roi`** → Retorno sobre investimento
- **`timestamp`** → Data de criação
- **`sport`, `event`, `market`** → Informações do evento

### 3. Estrutura Interna
```javascript
{
  id: `${surebetId}_part_${index + 1}`,
  surebet_id: surebetId,
  bookmaker1: house,
  bookmaker2: '', // Preenchido se houver múltiplas casas
  profit: parseFloat(profit),
  roi: parseFloat(roi),
  createdAt: timestamp,
  // ... outros campos
}
```

## Arquivos Principais

### 1. `client/src/utils/apiConfig.js`
- Configurações centralizadas da API
- URLs, headers, timeouts
- Funções utilitárias

### 2. `client/src/utils/surebetsAPI.js`
- Função `fetchSurebets()` para buscar dados da API
- Função `processRealAPIData()` para processar resposta
- Integração com IndexedDB para cache local

### 3. `client/src/views/RankingView.vue`
- Interface do usuário para exibição dos dados
- Processamento de estatísticas dos bookmakers
- Gráficos e tabelas de ranking

## Fluxo de Dados

```
API Externa → processRealAPIData() → RankingView → Gráficos/Tabelas
     ↓
IndexedDB (Cache Local) → Fallback se API falhar
     ↓
Dados de Exemplo → Último recurso se tudo falhar
```

## Tratamento de Erros

### 1. Falha na API
- Log detalhado do erro
- Fallback para dados locais (IndexedDB)
- Fallback para dados de exemplo

### 2. Dados Inválidos
- Validação da estrutura de resposta
- Tratamento de campos ausentes
- Logs de warning para dados problemáticos

### 3. Problemas de CORS
- Headers apropriados configurados
- Modo `cors` habilitado
- Fallback para dados locais se necessário

## Cache e Persistência

### 1. IndexedDB
- Armazenamento local persistente
- Cache de dados da API
- Recuperação offline

### 2. localStorage
- Cache secundário
- Configurações de usuário
- Estado da aplicação

## Monitoramento e Logs

### 1. Console Logs
- `🌐` - Início da busca na API
- `📡` - Dados recebidos
- `✅` - Processamento bem-sucedido
- `❌` - Erros encontrados
- `⚠️` - Avisos e duplicatas

### 2. Métricas
- Total de surebets processados
- IDs únicos encontrados
- Tempo de resposta da API
- Tamanho do cache local

## Configurações

### 1. Timeout
- **Padrão**: 30 segundos
- **Configurável**: Via `API_CONFIG.TIMEOUT`

### 2. Retry
- **Máximo de tentativas**: 3
- **Delay entre tentativas**: 1 segundo

### 3. Cache
- **Duração**: 5 minutos
- **Tamanho máximo**: 1000 registros

## Testes

### 1. Teste de Conectividade
```javascript
import { checkApiHealth } from './apiConfig.js'

const isHealthy = await checkApiHealth()
console.log('API está disponível:', isHealthy)
```

### 2. Teste de Dados
```javascript
import { fetchSurebets } from './surebetsAPI.js'

const surebets = await fetchSurebets()
console.log('Surebets carregados:', surebets.length)
```

## Troubleshooting

### 1. Erro CORS
- Verificar se a API permite requisições do domínio
- Verificar headers enviados
- Considerar proxy se necessário

### 2. Dados não aparecem
- Verificar console para erros
- Verificar se a API está respondendo
- Verificar dados de fallback

### 3. Performance lenta
- Verificar timeout da API
- Verificar tamanho da resposta
- Considerar paginação se disponível

## Próximos Passos

1. **Monitoramento em Produção**
   - Métricas de sucesso/falha
   - Tempo de resposta médio
   - Taxa de cache hit/miss

2. **Otimizações**
   - Compressão de dados
   - Paginação se suportada
   - Cache inteligente baseado em uso

3. **Fallbacks Avançados**
   - Múltiplas APIs de backup
   - Sincronização offline
   - Notificações de status da API
