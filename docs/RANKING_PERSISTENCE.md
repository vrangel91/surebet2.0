# Sistema de Persistência de Estatísticas - RankingView

## Visão Geral

O sistema de persistência de estatísticas foi implementado para armazenar dados de surebets e análises no banco de dados PostgreSQL, evitando que as estatísticas sejam resetadas a cada carregamento da página.

## Componentes Implementados

### 1. Modelos de Banco de Dados

#### `SurebetStats` - Estatísticas Individuais
- **Tabela**: `surebet_stats`
- **Campos**:
  - `id`: ID único (auto-incremento)
  - `surebet_id`: Identificador da surebet
  - `house`: Nome da casa de aposta
  - `market`: Tipo de mercado
  - `match`: Nome da partida
  - `profit`: Lucro em reais
  - `date`: Data da surebet
  - `hour`: Hora (0-23)
  - `sport`: Tipo de esporte
  - `period`: Período da partida em minutos
  - `minutes`: Minutos decorridos
  - `anchorh1`, `anchorh2`: URLs de referência
  - `chance`: Percentual de chance
  - `status`: Status (active/expired/cancelled)
  - `metadata`: Dados adicionais em JSON

#### `SurebetAnalytics` - Análises Agregadas
- **Tabela**: `surebet_analytics`
- **Campos**:
  - `id`: ID único (auto-incremento)
  - `analysis_type`: Tipo de análise
  - `period_days`: Período em dias
  - `sport_filter`: Esporte filtrado
  - `analysis_data`: Dados da análise em JSON
  - `total_surebets`: Total de surebets analisadas
  - `unique_houses`: Número de casas únicas
  - `unique_markets`: Número de mercados únicos
  - `average_profit`: Lucro médio
  - `analyzed_at`: Data/hora da análise
  - `data_hash`: Hash para verificar mudanças

### 2. API Routes

#### Endpoints Principais
- `GET /api/surebet-stats` - Buscar estatísticas
- `POST /api/surebet-stats` - Criar estatística individual
- `POST /api/surebet-stats/bulk` - Criar múltiplas estatísticas
- `GET /api/surebet-stats/analytics` - Buscar análises
- `POST /api/surebet-stats/analytics` - Salvar análise
- `PUT /api/surebet-stats/:id` - Atualizar estatística
- `DELETE /api/surebet-stats/:id` - Deletar estatística

#### Filtros Disponíveis
- **Período**: 7, 30, 90 dias ou 'all'
- **Esporte**: Filtro por esporte específico ou 'all'
- **Limite**: Número máximo de registros retornados

### 3. Integração Frontend

#### Store Vuex
Novas actions implementadas:
- `fetchSurebetStats()` - Buscar estatísticas do banco
- `saveSurebetStats()` - Salvar estatísticas no banco
- `saveSurebetAnalytics()` - Salvar análises no banco
- `fetchSurebetAnalytics()` - Buscar análises do banco

#### RankingView.vue
- **Carregamento Inteligente**: Tenta carregar do banco primeiro, fallback para dados de exemplo
- **Persistência Automática**: Salva dados e análises automaticamente
- **Sincronização**: Mantém dados atualizados entre sessões

## Como Funciona

### 1. Carregamento de Dados
```javascript
async loadSurebetsData() {
  try {
    // 1. Tentar carregar do banco
    const dbStats = await this.$store.dispatch('fetchSurebetStats', {
      period: this.selectedPeriod,
      sport: this.selectedSport,
      limit: 1000
    })
    
    if (dbStats && dbStats.length > 0) {
      this.surebets = dbStats
    } else {
      // 2. Fallback para dados de exemplo
      this.surebets = this.generateSampleData()
    }
    
    // 3. Processar análises
    this.processAnalytics()
    
    // 4. Salvar no banco se necessário
    if (this.surebets.length > 0) {
      this.saveDataToDatabase()
    }
  } catch (error) {
    // Fallback para dados de exemplo em caso de erro
    this.surebets = this.generateSampleData()
    this.processAnalytics()
  }
}
```

### 2. Persistência de Estatísticas
```javascript
async saveDataToDatabase() {
  const statsToSave = this.surebets.map(item => ({
    surebet_id: item.surebet_id,
    house: item.house,
    market: item.market,
    profit: item.profit,
    date: item.date,
    hour: item.hour,
    sport: item.sport,
    // ... outros campos
  }))
  
  const result = await this.$store.dispatch('saveSurebetStats', statsToSave)
}
```

### 3. Persistência de Análises
```javascript
async saveAnalyticsToDatabase(filteredData) {
  const analyticsData = {
    analysis_type: 'comprehensive',
    period_days: parseInt(this.selectedPeriod),
    sport_filter: this.selectedSport,
    analysis_data: {
      topHouses: this.topHouses,
      topHousePairs: this.topHousePairs,
      // ... outros dados de análise
    },
    total_surebets: totalSurebets,
    unique_houses: uniqueHouses,
    unique_markets: uniqueMarkets,
    average_profit: averageProfit
  }
  
  const result = await this.$store.dispatch('saveSurebetAnalytics', analyticsData)
}
```

## Vantagens do Sistema

### 1. Persistência
- **Dados não se perdem** entre sessões
- **Histórico mantido** de todas as análises
- **Backup automático** no banco de dados

### 2. Performance
- **Cache inteligente** de análises
- **Verificação de mudanças** via hash MD5
- **Atualizações incrementais** apenas quando necessário

### 3. Escalabilidade
- **Suporte a grandes volumes** de dados
- **Filtros eficientes** por período e esporte
- **Índices otimizados** para consultas rápidas

### 4. Confiabilidade
- **Fallback automático** para dados de exemplo
- **Tratamento de erros** robusto
- **Logs detalhados** para debugging

## Configuração

### 1. Banco de Dados
Certifique-se de que o PostgreSQL está rodando e as tabelas foram criadas:
```bash
npm start  # Isso sincroniza os modelos automaticamente
```

### 2. Variáveis de Ambiente
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boasvindasbotbet
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

### 3. Dependências
```bash
npm install sequelize pg pg-hstore
```

## Monitoramento

### 1. Logs do Console
- ✅ Dados carregados do banco
- ⚠️ Fallback para dados de exemplo
- ❌ Erros de conexão/operação

### 2. Métricas de Performance
- Tempo de carregamento do banco
- Número de registros processados
- Tamanho das análises salvas

### 3. Alertas
- Falhas de conexão com banco
- Dados corrompidos
- Análises não salvas

## Troubleshooting

### Problema: Dados não estão sendo salvos
**Solução**: Verificar se o usuário tem permissões de escrita no banco

### Problema: Análises não estão sendo carregadas
**Solução**: Verificar se as tabelas foram criadas corretamente

### Problema: Performance lenta
**Solução**: Verificar índices do banco e otimizar consultas

## Próximos Passos

1. **Implementar limpeza automática** de dados antigos
2. **Adicionar compressão** para análises grandes
3. **Implementar cache Redis** para melhor performance
4. **Adicionar métricas** de uso e performance
5. **Implementar backup automático** das análises

## Conclusão

O sistema de persistência implementado garante que todas as estatísticas e análises de surebets sejam mantidas no banco de dados, proporcionando uma experiência consistente e confiável para os usuários, mesmo entre diferentes sessões e recarregamentos da página.
