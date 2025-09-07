# Guia de Testes - Surebets Client

Este documento descreve a estrutura completa de testes implementada para garantir que os cálculos de surebets, filtros, botões e atualizações em tempo real funcionem corretamente com múltiplos usuários.

## 📋 Estrutura de Testes

### 🧪 Testes Unitários (Vitest)
- **Localização**: `src/test/unit/`
- **Foco**: Lógica isolada, cálculos, utilitários
- **Execução**: `npm run test:unit`

#### Arquivos:
- `surebetCalculations.test.js` - Cálculos de surebet e stakes
- `formatters.test.js` - Formatação de moeda, data, ROI

### 🔗 Testes de Integração (Vitest + Vue Testing Library)
- **Localização**: `src/test/integration/`
- **Foco**: Componentes Vue, interações, filtros
- **Execução**: `npm run test:integration`

#### Arquivos:
- `SurebetCard.integration.test.js` - Componente de card de surebet
- `SurebetsView.integration.test.js` - Página principal de surebets

### 🌐 Testes E2E (Cypress)
- **Localização**: `cypress/e2e/`
- **Foco**: Fluxos completos de usuário, responsividade
- **Execução**: `npm run test:e2e`

#### Arquivos:
- `surebets.cy.js` - Fluxos principais de usuário
- `load-testing.cy.js` - Testes de carga e múltiplos usuários

## 🚀 Como Executar os Testes

### Instalação e Configuração
```bash
# Instalar dependências
npm install

# Configurar ambiente de teste
node scripts/test-setup.js

# Limpar dados de teste (se necessário)
node scripts/test-cleanup.js
```

### Execução de Testes

#### Todos os Testes
```bash
npm run test:all
```

#### Testes Unitários
```bash
npm run test:unit
npm run test:unit -- --watch  # Modo watch
npm run test:unit -- --coverage  # Com cobertura
```

#### Testes de Integração
```bash
npm run test:integration
```

#### Testes E2E
```bash
# Executar em modo headless
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:open
```

#### Testes com Cobertura
```bash
npm run test:coverage
```

## 🎯 Cenários de Teste Cobertos

### 1. Cálculos de Surebet
- ✅ Odds que geram lucro positivo
- ✅ Odds que não geram lucro (resultado 0)
- ✅ Odds com valores extremos (1.01 e 20.0)
- ✅ Validação de surebet válido/inválido
- ✅ Cálculo de stakes e lucro esperado

### 2. Filtros e Busca
- ✅ Filtro por esporte (Futebol, Basquete, etc.)
- ✅ Filtro por casa de apostas (Bet365, William Hill, etc.)
- ✅ Filtro de ROI mínimo/máximo
- ✅ Filtro de lucro mínimo/máximo
- ✅ Filtro por data
- ✅ Limpeza de filtros
- ✅ Combinação de múltiplos filtros

### 3. Atualizações em Tempo Real
- ✅ Conexão WebSocket
- ✅ Recebimento de novos surebets
- ✅ Atualização sem duplicação de dados
- ✅ Fallback para HTTP polling
- ✅ Reconexão automática
- ✅ Tratamento de erros de conexão

### 4. Interações do Usuário
- ✅ Pausar/retomar busca
- ✅ Alternar som de notificação
- ✅ Fixar/desfixar cards
- ✅ Clicar em botões de apostar
- ✅ Navegação por teclado
- ✅ Acessibilidade

### 5. Responsividade
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1920px)
- ✅ Adaptação de layout
- ✅ Controles acessíveis

### 6. Performance
- ✅ Carregamento rápido (< 2s)
- ✅ Filtros rápidos (< 500ms)
- ✅ Renderização com muitos dados
- ✅ Atualizações em tempo real sem travamento

### 7. Tratamento de Erros
- ✅ API indisponível
- ✅ Timeout de requisições
- ✅ Dados inválidos
- ✅ Falha de WebSocket
- ✅ Retry automático
- ✅ Mensagens de erro claras

### 8. Testes de Carga
- ✅ Múltiplas sessões simultâneas
- ✅ Muitos dados (100+ surebets)
- ✅ Filtros com grandes volumes
- ✅ Atualizações frequentes
- ✅ Falhas de rede intermitentes

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente
As configurações de teste estão em `test.env`:
- Banco de dados: `surestake_test`
- API: `http://localhost:3000`
- WebSocket: `ws://localhost:3002`
- Cache TTL: 1000ms
- Rate limiting: 1000 req/min

### Banco de Dados de Teste
- Nome: `surestake_test`
- Usuário: `test_user`
- Senha: `test_password`
- Dados são limpos a cada execução

### Mocks e Fixtures
- **Handlers MSW**: `src/test/mocks/handlers.js`
- **Dados de teste**: `src/test/fixtures/surebets.js`
- **Comandos Cypress**: `cypress/support/commands.js`

## 📊 Métricas e Cobertura

### Cobertura de Código
- **Mínimo**: 80%
- **Ideal**: 90%+
- **Excluídos**: Arquivos de configuração, testes, mocks

### Performance
- **Carregamento inicial**: < 2s
- **Filtros**: < 500ms
- **Atualizações**: < 100ms
- **Renderização**: < 100ms

### Acessibilidade
- **Navegação por teclado**: ✅
- **Contraste**: ✅
- **Estrutura semântica**: ✅
- **Labels apropriados**: ✅

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

#### Testes Unitários Falhando
```bash
# Verificar configuração
npm run test:unit -- --reporter=verbose

# Executar teste específico
npm run test:unit -- surebetCalculations.test.js
```

#### Testes E2E Falhando
```bash
# Executar com interface gráfica
npm run test:e2e:open

# Verificar screenshots
ls cypress/screenshots/

# Verificar videos
ls cypress/videos/
```

#### Problemas de Banco de Dados
```bash
# Recriar banco de teste
node scripts/test-cleanup.js
node scripts/test-setup.js
```

#### Problemas de Performance
```bash
# Executar com profiling
npm run test:e2e -- --browser chrome --headed
```

### Logs e Debugging
- **Vitest**: Logs no console
- **Cypress**: Screenshots e videos automáticos
- **MSW**: Logs de requisições mockadas

## 🔄 CI/CD e Integração Contínua

### GitHub Actions (Exemplo)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:all
```

### Pré-commit Hooks
```bash
# Instalar husky
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run test:unit"
```

## 📈 Melhorias Futuras

### Testes Adicionais
- [ ] Testes de acessibilidade automatizados
- [ ] Testes de performance com Lighthouse
- [ ] Testes de segurança
- [ ] Testes de compatibilidade de navegadores

### Otimizações
- [ ] Paralelização de testes
- [ ] Cache de dependências
- [ ] Testes incrementais
- [ ] Relatórios detalhados

### Monitoramento
- [ ] Métricas de cobertura em tempo real
- [ ] Alertas de performance
- [ ] Relatórios de qualidade
- [ ] Dashboard de testes

## 📚 Recursos Adicionais

### Documentação
- [Vitest](https://vitest.dev/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Cypress](https://docs.cypress.io/)
- [MSW](https://mswjs.io/)

### Boas Práticas
- Sempre escreva testes antes de implementar funcionalidades
- Mantenha testes simples e focados
- Use nomes descritivos para testes
- Limpe dados entre execuções
- Mock dependências externas
- Teste casos extremos e edge cases

---

**Última atualização**: Janeiro 2024
**Versão**: 1.0.0
**Mantenedor**: Equipe de Desenvolvimento
