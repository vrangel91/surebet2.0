# 🧪 Sistema de Testes e Otimização para Surebets

Este documento descreve o sistema completo de testes e otimizações implementado para a página de Surebets, incluindo cache inteligente, rate limiting e testes automatizados.

## 📋 Visão Geral

O sistema foi projetado para resolver os seguintes problemas:
- ✅ **Evitar chamadas desnecessárias à API** quando usuários navegam entre páginas
- ✅ **Melhorar performance do servidor** com cache e rate limiting
- ✅ **Garantir qualidade** com testes automatizados
- ✅ **Monitorar performance** em tempo real

## 🏗️ Arquitetura

### Frontend (Client)
```
client/src/
├── utils/
│   └── surebetsCache.js          # Cache inteligente no frontend
├── composables/
│   └── useSurebets.js            # Composable para gerenciar estado
├── test/
│   ├── unit/
│   │   └── SurebetsView.test.js  # Testes unitários
│   └── integration/
│       └── SurebetsView.integration.test.js # Testes de integração
└── cypress/e2e/
    └── surebets-performance.cy.js # Testes E2E
```

### Backend (Server)
```
utils/
├── surebetsCache.js              # Cache otimizado no servidor
├── rateLimiter.js                # Rate limiting inteligente
└── scripts/
    └── test-surebets-performance.js # Teste de performance
```

## 🚀 Funcionalidades Implementadas

### 1. Cache Inteligente
- **Frontend**: Cache local com TTL configurável
- **Backend**: Cache em memória com compressão
- **Estratégia**: Cache por parâmetros de filtro
- **Limpeza**: Automática e manual

### 2. Rate Limiting
- **API Geral**: 30 requisições/minuto
- **Surebets**: 15 requisições/minuto (mais restritivo)
- **Backend**: 100 requisições/minuto
- **Proteção**: Bloqueio temporário de IPs abusivos

### 3. Testes Automatizados
- **Unitários**: Vitest + Vue Test Utils
- **Integração**: Testes de componentes
- **E2E**: Cypress para fluxos completos
- **Performance**: Testes de carga e stress

## 📦 Instalação e Configuração

### 1. Instalar Dependências
```bash
cd client
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# client/.env.test
VUE_APP_API_URL=http://localhost:3001
VUE_APP_CACHE_ENABLED=true
VUE_APP_CACHE_TTL=300000
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client
npm run serve
```

## 🧪 Executando Testes

### Testes Unitários
```bash
cd client
npm run test:unit
```

### Testes de Integração
```bash
cd client
npm run test:integration
```

### Testes E2E
```bash
cd client
npm run test:e2e
```

### Todos os Testes
```bash
cd client
npm run test:all
```

### Teste de Performance
```bash
node scripts/test-surebets-performance.js
```

## 📊 Monitoramento

### Estatísticas de Cache
```bash
curl http://localhost:3001/api/cache/stats
```

### Limpar Cache
```bash
curl -X POST http://localhost:3001/api/cache/clear
```

### Exemplo de Resposta
```json
{
  "success": true,
  "data": {
    "surebetsCache": {
      "hits": 150,
      "misses": 25,
      "hitRate": "85.71%",
      "size": 45,
      "maxSize": 1000,
      "utilization": "4.5%",
      "totalSize": "2.3MB"
    },
    "rateLimiter": {
      "totalRequests": 200,
      "blockedRequests": 5,
      "allowedRequests": 195,
      "hitRate": "97.50%",
      "activeIPs": 12
    }
  }
}
```

## 🎯 Cenários de Teste

### 1. Cache e Navegação
```javascript
// Testa se cache funciona ao navegar entre páginas
describe('Cache Navigation', () => {
  it('should use cache when navigating back to surebets', async () => {
    // 1. Carregar dados iniciais
    await visit('/surebets')
    await waitForData()
    
    // 2. Navegar para outra página
    await visit('/dashboard')
    
    // 3. Voltar para surebets
    await visit('/surebets')
    
    // 4. Verificar se dados estão em cache
    expect(apiCalls).toHaveLength(1) // Apenas primeira chamada
  })
})
```

### 2. Rate Limiting
```javascript
// Testa se rate limiting funciona corretamente
describe('Rate Limiting', () => {
  it('should block excessive requests', async () => {
    const requests = []
    
    // Fazer 20 requisições rapidamente
    for (let i = 0; i < 20; i++) {
      requests.push(fetch('/api/surebets'))
    }
    
    const responses = await Promise.all(requests)
    const blocked = responses.filter(r => r.status === 429)
    
    expect(blocked.length).toBeGreaterThan(0)
  })
})
```

### 3. Performance
```javascript
// Testa performance com muitos usuários
describe('Performance', () => {
  it('should handle 50 concurrent users', async () => {
    const startTime = performance.now()
    
    // Simular 50 usuários simultâneos
    const users = Array.from({ length: 50 }, (_, i) => 
      simulateUser(i)
    )
    
    await Promise.all(users)
    
    const duration = performance.now() - startTime
    
    expect(duration).toBeLessThan(10000) // Menos de 10 segundos
  })
})
```

## 🔧 Configurações Avançadas

### Cache Frontend
```javascript
// client/src/utils/surebetsCache.js
const cache = new SurebetsCache({
  maxSize: 50,           // Máximo de entradas
  defaultTTL: 300000,    // 5 minutos
  compressionEnabled: true
})
```

### Rate Limiting
```javascript
// utils/rateLimiter.js
const rateLimiter = new RateLimiter({
  windowMs: 60000,       // 1 minuto
  maxRequests: 30,       // 30 requisições
  skipSuccessfulRequests: false,
  skipFailedRequests: false
})
```

### Testes
```javascript
// client/vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

## 📈 Métricas de Performance

### Objetivos
- **Tempo de resposta**: < 500ms (média)
- **Taxa de sucesso**: > 95%
- **Cache hit rate**: > 70%
- **Rate limit**: < 5% de bloqueios

### Monitoramento
```bash
# Verificar performance em tempo real
watch -n 5 'curl -s http://localhost:3001/api/cache/stats | jq .data.surebetsCache.hitRate'
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Cache não funciona
```bash
# Verificar se cache está habilitado
curl http://localhost:3001/api/cache/stats

# Limpar cache se necessário
curl -X POST http://localhost:3001/api/cache/clear
```

#### 2. Rate limiting muito restritivo
```javascript
// Ajustar limites em utils/rateLimiter.js
const surebetsRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 30, // Aumentar se necessário
})
```

#### 3. Testes falhando
```bash
# Verificar se servidor está rodando
curl http://localhost:3001/api/surebets

# Executar testes com verbose
npm run test:unit -- --reporter=verbose
```

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Cache Redis**: Implementar cache distribuído
2. **WebSocket**: Atualizações em tempo real
3. **CDN**: Cache de assets estáticos
4. **Load Balancing**: Distribuição de carga
5. **Monitoring**: Dashboard de métricas

### Integração CI/CD
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          npm install
          cd client && npm install
      - name: Run tests
        run: |
          npm start &
          cd client && npm run test:all
```

## 📚 Recursos Adicionais

- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [Cypress](https://www.cypress.io/)
- [MSW](https://mswjs.io/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

## 🤝 Contribuição

Para contribuir com melhorias:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente testes para sua mudança
4. Execute todos os testes
5. Submeta um pull request

---

**Desenvolvido com ❤️ para otimizar a experiência dos usuários de Surebets**
