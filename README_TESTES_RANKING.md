# Testes da Página de Ranking

Este documento explica como usar os arquivos de teste para debugar e verificar a funcionalidade da página de ranking.

## 📁 Arquivos de Teste

### 1. `rankingDebug.js`
- **Função**: Testa o processamento de dados e lógica interna
- **Testes**: Validação de dados, processamento de bookmakers, cálculos estatísticos
- **Uso**: Para verificar se a lógica de negócio está funcionando

### 2. `apiTest.js`
- **Função**: Testa a conectividade e funcionalidade da API externa
- **Testes**: Conectividade, endpoint, timeout, headers, CORS
- **Uso**: Para verificar se a API `https://zerolossbet.com/api/fetch_surebets/` está funcionando

### 3. `rankingDataTest.js`
- **Função**: Testa a renderização e exibição de dados na página
- **Testes**: Carregamento de dados, gráficos, filtros, responsividade
- **Uso**: Para verificar se a interface está funcionando corretamente

### 4. `testRunner.js`
- **Função**: Executor principal que integra todos os testes
- **Testes**: Executa todos os testes e gera relatórios
- **Uso**: Para uma verificação completa da página

## 🚀 Como Usar

### 1. Abrir a Página de Ranking
- Navegue para `/ranking` na aplicação
- Abra o console do navegador (F12)

### 2. Executar Testes Individuais

#### Teste Rápido
```javascript
// Teste básico da página
window.testRunner.quickTest()
```

#### Teste de Dados
```javascript
// Verificar se os dados estão sendo carregados
window.rankingDataTest.testRankingDataLoading()

// Testar dados de fallback
window.rankingDataTest.testFallbackData()

// Verificar gráficos
window.rankingDataTest.testChartRendering()
```

#### Teste da API
```javascript
// Teste rápido da API
window.apiTest.quickAPITest()

// Teste completo da API
window.apiTest.runAllAPITests()

// Teste específico de conectividade
window.apiTest.testAPIConnectivity()
```

#### Teste de Debug
```javascript
// Testar processamento de dados
window.rankingDebug.testAPIProcessing()

// Testar integração
window.rankingDebug.testRankingIntegration()

// Todos os testes de debug
window.rankingDebug.runAllTests()
```

### 3. Executar Todos os Testes
```javascript
// Execução completa com relatório
window.testRunner.runAllTests()

// Gerar relatório dos resultados
const results = await window.testRunner.runAllTests()
window.testRunner.generateTestReport(results)
```

### 4. Investigar Problemas Específicos
```javascript
// Investigar problemas de dados
window.testRunner.testDataIssues()

// Verificar responsividade
window.rankingDataTest.testResponsiveness()

// Testar filtros
window.rankingDataTest.testFilters()
```

## 🔍 Interpretando os Resultados

### ✅ Testes Passando
- **Verde**: Funcionalidade está funcionando corretamente
- **Logs**: Mostram detalhes do que foi testado

### ❌ Testes Falhando
- **Vermelho**: Problema identificado
- **Logs**: Mostram o erro específico e recomendações

### 📊 Estatísticas
- **Total de Testes**: Quantos testes foram executados
- **Taxa de Sucesso**: Porcentagem de testes que passaram
- **Tempo de Execução**: Quanto tempo levou para executar todos os testes

## 🐛 Problemas Comuns e Soluções

### 1. API Não Acessível
```
❌ Erro: API não está respondendo
🔧 Solução: Verificar conectividade de rede e URL da API
```

### 2. Dados Não Carregando
```
❌ Erro: Nenhum dado na tabela de ranking
🔧 Solução: Verificar processamento de dados e dados de fallback
```

### 3. Gráficos Não Renderizando
```
❌ Erro: Gráficos não encontrados
🔧 Solução: Verificar biblioteca Chart.js e dados dos gráficos
```

### 4. Página Não Responsiva
```
❌ Erro: Layout quebrado em dispositivos móveis
🔧 Solução: Verificar CSS responsivo e media queries
```

## 📱 Testando em Diferentes Dispositivos

### Desktop
```javascript
// Teste padrão
window.testRunner.runAllTests()
```

### Mobile/Tablet
```javascript
// Teste de responsividade
window.rankingDataTest.testResponsiveness()

// Teste específico para mobile
window.rankingDataTest.testFilters()
```

## 🔧 Debug Avançado

### Verificar Console
- Abra o console do navegador (F12)
- Procure por erros JavaScript
- Verifique logs de debug

### Verificar Network
- Abra a aba Network no DevTools
- Verifique se as requisições para a API estão funcionando
- Procure por erros de CORS ou timeout

### Verificar Storage
```javascript
// Verificar localStorage
console.log('Cache:', localStorage.getItem('ranking_cache'))

// Verificar IndexedDB
console.log('IndexedDB disponível:', 'indexedDB' in window)
```

## 📋 Checklist de Testes

### ✅ Funcionalidade Básica
- [ ] Página carrega sem erros
- [ ] Sidebar está funcionando
- [ ] Navegação funciona

### ✅ Dados
- [ ] Estatísticas são exibidas
- [ ] Tabela de ranking tem dados
- [ ] Gráficos são renderizados

### ✅ API
- [ ] Conectividade com API externa
- [ ] Dados são processados corretamente
- [ ] Fallback funciona quando API falha

### ✅ Interface
- [ ] Filtros funcionam
- [ ] Botão de atualização funciona
- [ ] Página é responsiva

## 🚨 Troubleshooting

### Se Nenhum Teste Funcionar
1. Verifique se a página está carregada
2. Abra o console e procure por erros
3. Verifique se os arquivos de teste foram importados
4. Recarregue a página

### Se Alguns Testes Falharem
1. Execute `window.testRunner.testDataIssues()`
2. Verifique os logs específicos do teste que falhou
3. Use as recomendações fornecidas pelos testes

### Se a API Estiver Offline
1. Execute `window.apiTest.testAPIConnectivity()`
2. Verifique se a URL está correta
3. Teste se há problemas de CORS
4. Use dados de fallback para desenvolvimento

## 📞 Suporte

Se os testes não conseguirem identificar o problema:

1. **Execute todos os testes**: `window.testRunner.runAllTests()`
2. **Copie os logs do console**
3. **Verifique a aba Network** no DevTools
4. **Teste em diferentes navegadores**
5. **Verifique se há erros JavaScript**

## 🎯 Próximos Passos

Após executar os testes:

1. **Corrija os problemas identificados**
2. **Execute os testes novamente** para verificar
3. **Monitore a página em produção**
4. **Atualize os testes conforme necessário**

---

**💡 Dica**: Execute `window.testRunner.quickTest()` primeiro para uma verificação básica, depois use `window.testRunner.runAllTests()` para uma análise completa.
