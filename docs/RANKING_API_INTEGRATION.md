# Integração da API Real no RankingView

## Resumo das Mudanças

O `RankingView.vue` foi modificado para buscar dados reais da API externa em vez de usar dados hardcoded, implementando um sistema de busca contínua e armazenamento persistente.

## Principais Funcionalidades Implementadas

### 1. Busca de Dados da API Externa
- **Método**: `fetchFromExternalAPI()`
- **Endpoint**: `/api/surebets` (via servidor)
- **Frequência**: A cada 2 minutos automaticamente
- **Fallback**: Banco local → Dados de exemplo

### 2. Processamento de Dados
- **Método**: `processExternalAPIData()`
- **Funcionalidades**:
  - Conversão de timestamp para data/hora
  - Normalização de campos
  - Detecção de duplicatas
  - Estruturação para análise

### 3. Busca Automática Contínua
- **Início**: Automático ao carregar a página
- **Intervalo**: 2 minutos
- **Controle**: Botão para pausar/retomar
- **Status Visual**: Indicador de atividade

### 4. Armazenamento Persistente
- **Método**: `saveDataToDatabase()`
- **Endpoint**: `/api/surebet-stats/bulk`
- **Fallback**: Salvamento individual
- **Análises**: Salvamento automático de estatísticas

### 5. Detecção de Novos Dados
- **Método**: `hasNewSurebets()`
- **Critério**: IDs únicos de surebets
- **Atualização**: Gráficos e análises automáticas

## Estrutura de Dados Processados

```javascript
{
  surebet_id: "string",
  house: "string",
  market: "string", 
  match: "string",
  profit: number,
  date: "YYYY-MM-DD",
  hour: number (0-23),
  sport: "string",
  period: number | null,
  minutes: number | null,
  anchorh1: string | null,
  anchorh2: string | null,
  chance: number | null,
  metadata: {
    source: "external_api",
    timestamp: "ISO string",
    selection1: string | null,
    selection2: string | null,
    selection3: string | null,
    odds1: number | null,
    odds2: number | null,
    odds3: number | null,
    stake: number,
    status: "active",
    processed_at: "ISO string"
  }
}
```

## Interface do Usuário

### Status da Busca Automática
- **Indicador visual**: Ponto pulsante verde quando ativo
- **Texto de status**: "Busca automática ativa/pausada"
- **Última atualização**: Data/hora formatada
- **Contador**: Número de atualizações realizadas
- **Botão de controle**: Pausar/Retomar busca

### Botões de Ação
- **🔄 Atualizar**: Busca manual imediata
- **⏸️ Pausar/▶️ Retomar**: Controle da busca automática

## Fluxo de Dados

1. **Carregamento Inicial**:
   ```
   API Externa → Processamento → Banco Local → Análise → Gráficos
   ```

2. **Busca Automática**:
   ```
   API Externa → Verificação de Novos Dados → Atualização → Análise → Gráficos
   ```

3. **Fallback**:
   ```
   API Externa (erro) → Banco Local → Dados de Exemplo
   ```

## Configurações

### Intervalo de Busca
- **Padrão**: 2 minutos (120.000ms)
- **Configurável**: Variável `autoRefreshInterval`

### Filtros Disponíveis
- **Período**: 7, 30, 90 dias
- **Esporte**: Todos ou específico
- **Limite**: 1000 registros

## Logs e Monitoramento

### Console Logs
- `🌐 Buscando dados da API externa...`
- `📡 Dados recebidos da API externa:`
- `✅ Dados processados: X registros únicos`
- `🆕 Novos dados encontrados!`
- `💾 Salvando X registros no banco...`

### Tratamento de Erros
- **API indisponível**: Fallback para banco local
- **Banco indisponível**: Fallback para dados de exemplo
- **Erro de processamento**: Log detalhado + continuidade

## Benefícios

1. **Dados Reais**: Análises baseadas em dados reais da API
2. **Atualização Contínua**: Dados sempre atualizados
3. **Persistência**: Armazenamento local para histórico
4. **Performance**: Processamento eficiente em lotes
5. **Confiabilidade**: Múltiplos fallbacks
6. **Transparência**: Status visual da busca

## Próximos Passos

1. **Otimização**: Cache inteligente de dados
2. **Notificações**: Alertas de novos surebets
3. **Métricas**: Estatísticas de performance da API
4. **Configuração**: Interface para ajustar intervalos
5. **Exportação**: Download de dados históricos
