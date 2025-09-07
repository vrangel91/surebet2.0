# 🚀 Guia Completo de Testes de Performance - Surebets

## 📋 Visão Geral

Este guia fornece instruções detalhadas para executar testes de carga, estresse e performance na página de Surebets, garantindo que o sistema seja robusto e escalável mesmo com múltiplos usuários simultâneos.

## 🎯 Objetivos dos Testes

### 1. **Testes de Carga**
- Verificar performance sob carga normal (10-200 usuários)
- Validar tempo de resposta < 500ms
- Confirmar taxa de erro < 1%
- Garantir estabilidade do sistema

### 2. **Testes de Estresse**
- Identificar ponto de falha do sistema
- Testar recuperação após sobrecarga
- Validar comportamento com 300-1000+ usuários
- Determinar limite seguro de usuários

### 3. **Monitoramento de Performance**
- Coletar métricas em tempo real
- Monitorar uso de recursos (CPU, memória, rede)
- Identificar gargalos de banco de dados
- Gerar alertas de performance

## 🛠️ Configuração Inicial

### 1. **Instalação e Configuração**

```bash
# 1. Configurar ambiente de testes
npm run test:setup

# 2. Verificar se o servidor está rodando
npm start

# 3. Criar usuários de teste (opcional - feito automaticamente)
npm run test:users

# 4. Verificar se o banco de dados está acessível
# (PostgreSQL deve estar rodando na porta 5432)
```

### 2. **Verificação de Pré-requisitos**

```bash
# Verificar se todas as dependências estão instaladas
npm install

# Verificar se o servidor responde
curl http://localhost:3001/api/health

# Verificar se o WebSocket está ativo
# (deve conectar em ws://localhost:3002)
```

## 🚀 Executando os Testes

### 1. **Execução Completa (Recomendado)**

```bash
# Executar todos os testes automaticamente
npm run test:performance
```

Este comando executa:
- ✅ Testes de carga (10, 50, 100, 200 usuários)
- ✅ Testes de estresse (300, 500, 1000 usuários)
- ✅ Monitoramento de performance em tempo real
- ✅ Geração de relatórios consolidados

### 2. **Execução Individual**

```bash
# Apenas testes de carga
npm run test:load

# Apenas testes de estresse
npm run test:stress

# Apenas monitoramento
npm run test:monitor

# Criar usuários de teste
npm run test:users

# Limpar usuários de teste
npm run test:cleanup
```

### 3. **Execução Manual**

```bash
# Testes de carga
node scripts/load-testing.js

# Testes de estresse
node scripts/stress-test.js

# Monitoramento de performance
node scripts/performance-monitor.js

# Execução completa
node scripts/run-performance-tests.js
```

## 👥 Gerenciamento de Usuários de Teste

### 1. **Criação Automática**
Os testes criam automaticamente usuários de teste durante a execução:
- **Usuários de Carga**: `testuser0@example.com` até `testuser999@example.com`
- **Usuários de Estresse**: `stressuser0@example.com` até `stressuser999@example.com`
- **Senha Padrão**: `testpassword123` / `stresspassword123`

### 2. **Criação Manual**
```bash
# Criar usuários de teste em lote
npm run test:users

# Configurar até 1000 usuários
node scripts/setup-test-users.js --maxUsers=1000
```

### 3. **Limpeza Automática**
Após os testes, os usuários são limpos automaticamente:
```bash
# Limpeza manual (se necessário)
npm run test:cleanup

# Limpeza completa
node scripts/cleanup-test-users.js
```

### 4. **Verificação de Usuários**
```bash
# Verificar quantos usuários de teste existem
node scripts/cleanup-test-users.js --dry-run
```

## 📊 Interpretando os Resultados

### 1. **Métricas de Qualidade**

| Métrica | Ideal | Aceitável | Crítico |
|---------|-------|-----------|---------|
| Tempo de Resposta | < 500ms | < 1000ms | > 2000ms |
| Taxa de Erro | < 1% | < 5% | > 10% |
| Uso de CPU | < 70% | < 85% | > 90% |
| Uso de Memória | < 80% | < 90% | > 95% |
| Conexões DB | < 50 | < 100 | > 200 |

### 2. **Score de Performance**

- **80-100**: 🟢 **EXCELENTE** - Sistema robusto e otimizado
- **60-79**: 🟡 **BOM** - Sistema funcional com pequenas melhorias
- **40-59**: 🟠 **REGULAR** - Necessita otimizações
- **0-39**: 🔴 **RUIM** - Requer correções críticas

### 3. **Classificação de Estresse**

- **Baixo (80-100)**: Sistema suporta carga facilmente
- **Médio (60-79)**: Sistema estável com monitoramento
- **Alto (40-59)**: Sistema instável, otimizações necessárias
- **Crítico (0-39)**: Sistema falha, correções urgentes

## 📈 Cenários de Teste

### 1. **Cenário: Carga Baixa (10 usuários)**
- **Objetivo**: Validar fluxo básico
- **Duração**: 1 minuto
- **Ações**: Login, navegação, filtros básicos
- **Expectativa**: 100% de sucesso, < 300ms resposta

### 2. **Cenário: Carga Moderada (50 usuários)**
- **Objetivo**: Simular uso normal
- **Duração**: 2 minutos
- **Ações**: Todas as funcionalidades principais
- **Expectativa**: 99% de sucesso, < 500ms resposta

### 3. **Cenário: Carga Alta (100 usuários)**
- **Objetivo**: Identificar gargalos
- **Duração**: 3 minutos
- **Ações**: Operações intensivas
- **Expectativa**: 95% de sucesso, < 1000ms resposta

### 4. **Cenário: Carga Extrema (200 usuários)**
- **Objetivo**: Testar limites
- **Duração**: 4 minutos
- **Ações**: Estresse máximo
- **Expectativa**: 90% de sucesso, < 2000ms resposta

### 5. **Cenário: Estresse (300+ usuários)**
- **Objetivo**: Encontrar ponto de falha
- **Duração**: 5 minutos
- **Ações**: Sobrecarga extrema
- **Expectativa**: Identificar limite do sistema

## 🔍 Monitoramento em Tempo Real

### 1. **Métricas do Sistema**
- **CPU**: Uso percentual e load average
- **Memória**: Total, usado, livre, percentual
- **Rede**: Bytes recebidos/enviados
- **Processos**: Contagem de processos Node.js

### 2. **Métricas de Banco de Dados**
- **Conexões Ativas**: Número de conexões simultâneas
- **Status**: Conectado/desconectado
- **Performance**: Tempo de resposta das consultas

### 3. **Métricas de Aplicação**
- **Requisições**: Total, sucessos, falhas
- **Tempo de Resposta**: Médio, mínimo, máximo
- **Throughput**: Requisições por segundo
- **Taxa de Erro**: Percentual de falhas

## 📋 Relatórios Gerados

### 1. **Relatório de Carga** (`load-test-report.json`)
```json
{
  "summary": {
    "totalScenarios": 4,
    "totalRequests": 15000,
    "successfulRequests": 14850,
    "failedRequests": 150,
    "overallErrorRate": 1.0,
    "averageResponseTime": 450
  },
  "scenarios": [...],
  "recommendations": [...]
}
```

### 2. **Relatório de Estresse** (`stress-test-report.json`)
```json
{
  "summary": {
    "totalScenarios": 3,
    "criticalFailures": 25,
    "averageStressScore": 75.5
  },
  "failureAnalysis": [...],
  "recommendations": [...]
}
```

### 3. **Relatório de Performance** (`performance-report.json`)
```json
{
  "summary": {
    "totalSamples": 1000,
    "duration": 300000
  },
  "averages": {
    "cpu": 65.2,
    "memory": 78.5,
    "databaseConnections": 45
  },
  "peaks": {...},
  "alerts": [...]
}
```

### 4. **Relatório Consolidado** (`consolidated-report.json`)
- Resumo de todos os testes
- Análise comparativa
- Recomendações consolidadas
- Score geral de performance

### 5. **Relatório HTML** (`report.html`)
- Visualização amigável dos resultados
- Gráficos e métricas
- Recomendações destacadas
- Exportável para compartilhamento

## 🚨 Troubleshooting

### 1. **Problemas Comuns**

#### Erro: "Servidor não está acessível"
```bash
# Verificar se o servidor está rodando
npm start

# Verificar se a porta 3001 está livre
netstat -an | findstr :3001
```

#### Erro: "Dependências faltando"
```bash
# Instalar dependências
npm install

# Verificar instalação
npm list axios ws
```

#### Erro: "Permissões negadas" (Unix)
```bash
# Tornar scripts executáveis
chmod +x test-performance.sh
chmod +x scripts/*.js
```

### 2. **Problemas de Performance**

#### CPU Alto (> 90%)
- Verificar loops infinitos no código
- Otimizar consultas de banco de dados
- Implementar cache mais agressivo
- Considerar load balancing

#### Memória Alta (> 90%)
- Verificar vazamentos de memória
- Otimizar uso de arrays e objetos
- Implementar garbage collection
- Reduzir tamanho de dados em cache

#### Taxa de Erro Alta (> 5%)
- Verificar logs de erro
- Implementar retry policies
- Adicionar circuit breakers
- Melhorar tratamento de exceções

#### Conexões DB Altas (> 100)
- Implementar pool de conexões
- Otimizar consultas
- Adicionar índices no banco
- Considerar read replicas

## 💡 Recomendações de Otimização

### 1. **Otimizações Imediatas**
- Implementar cache Redis
- Otimizar consultas SQL
- Adicionar índices no banco
- Implementar rate limiting

### 2. **Otimizações de Médio Prazo**
- Implementar CDN
- Adicionar load balancer
- Otimizar imagens e assets
- Implementar compressão gzip

### 3. **Otimizações de Longo Prazo**
- Migrar para arquitetura microserviços
- Implementar cache distribuído
- Adicionar monitoramento contínuo
- Considerar auto-scaling

## 📅 Cronograma de Testes

### 1. **Testes Diários**
- Executar testes de carga básicos
- Monitorar métricas principais
- Verificar alertas de performance

### 2. **Testes Semanais**
- Executar suite completa de testes
- Analisar tendências de performance
- Atualizar configurações se necessário

### 3. **Testes Mensais**
- Executar testes de estresse completos
- Revisar e otimizar configurações
- Atualizar documentação

### 4. **Testes Antes de Deploy**
- Executar todos os testes
- Verificar se performance não degradou
- Confirmar que novos recursos não impactam performance

## 📞 Suporte e Contato

Para dúvidas, problemas ou sugestões relacionadas aos testes de performance:

1. **Documentação**: Consulte este guia e a documentação do projeto
2. **Logs**: Verifique os arquivos de log em `test-results/logs/`
3. **Issues**: Reporte problemas no repositório do projeto
4. **Equipe**: Entre em contato com a equipe de desenvolvimento

---

*Documentação atualizada em: ${new Date().toLocaleDateString('pt-BR')}*
*Versão: 1.0.0*
