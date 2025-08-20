# 🧪 Sistema de Testes do Ranking

Este diretório contém arquivos de teste para verificar o funcionamento correto do sistema de ranking, especialmente para resolver o problema do ROI aparecendo como "0,00%".

## 📁 Arquivos de Teste

### 1. `rankingTest.js`
**Arquivo principal de testes** que contém:
- Dados de teste com valores conhecidos
- Função para testar cálculo de estatísticas dos bookmakers
- Função para testar funções de formatação
- Função para testar funções de classe CSS
- Função principal `runAllTests()` para executar todos os testes

### 2. `roiDebugTest.js`
**Arquivo específico para debug do ROI** que contém:
- Função `debugROIProblem()` para simular exatamente o que acontece no componente
- Função `testROIFormatting()` para testar especificamente a formatação do ROI
- Função `testROICalculation()` para testar cálculos matemáticos
- Função principal `runROIDebugTests()` para executar todos os testes de debug

### 3. `simpleROITest.js`
**Arquivo de teste simples** que contém:
- Teste básico de cálculo do ROI
- Verificação de formatação
- Dados de teste mínimos para validação rápida

### 4. `clearDataTest.js`
**Arquivo de teste para limpeza de dados** que contém:
- Teste de limpeza do localStorage
- Teste de limpeza de dados em memória
- Verificação de que todos os dados são corretamente zerados
- Simulação da funcionalidade de limpeza completa

### 5. `uniqueSurebetTest.js`
**Arquivo de teste para identificação única de surebets** que contém:
- Teste de geração de IDs únicos para surebets
- Verificação de detecção de surebets duplicadas
- Teste de contagem correta de bookmakers (evitando duplicatas)
- Validação da lógica de identificação única baseada em múltiplos critérios
- Simulação de cenários com bookmakers repetidos na mesma surebet

### 6. `weightedROITest.js`
**Arquivo de teste para o ROI Médio Ponderado** que contém:
- Teste da fórmula: `ROI_médio = (Lucro Total / Investimento Total) × 100`
- Comparação entre ROI Médio Ponderado e ROI Médio Simples
- Validação de cenários com investimentos diferentes
- Verificação da precisão dos cálculos
- Teste de casos extremos (investimentos muito diferentes)

### 7. `duplinhasTest.js`
**Arquivo de teste para funcionalidade das Duplinhas** que contém:
- Teste de identificação de pares únicos de bookmakers
- Verificação de contagem correta de frequência das duplas
- Validação de ordenação por frequência (mais frequente primeiro)
- Teste de detecção de surebets duplicadas
- Verificação de ROI médio ponderado para cada dupla
- Teste de cenários com ordem invertida de bookmakers
- Validação de tratamento de valores inválidos

## 🚀 Como Usar

### Opção 1: Página de Teste HTML
1. Abra o arquivo `client/public/test-ranking.html` no navegador
2. Use os botões para executar diferentes tipos de teste
3. Visualize os resultados no console da página

### Opção 2: Console do Navegador
1. Abra a página de ranking no navegador
2. Abra o console do desenvolvedor (F12)
3. Execute os testes diretamente:

```javascript
// Importar e executar testes básicos
import('./utils/rankingTest.js').then(module => {
  module.runAllTests()
})

// Importar e executar debug do ROI
import('./utils/roiDebugTest.js').then(module => {
  module.runROIDebugTests()
})

// Importar e executar teste simples
import('./utils/simpleROITest.js').then(module => {
  module.runSimpleTest()
})

// Importar e executar testes de limpeza
import('./utils/clearDataTest.js').then(module => {
  module.runClearDataTests()
})

// Importar e executar testes de surebets únicas
import('./utils/uniqueSurebetTest.js').then(module => {
  module.runUniqueSurebetTests()
})

// Importar e executar testes do ROI Médio Ponderado
import('./utils/weightedROITest.js').then(module => {
  module.runWeightedROITests()
})

// Importar e executar testes das Duplinhas
import('./utils/duplinhasTest.js').then(module => {
  module.runDuplinhasTests()
})
```

### Opção 3: Teste Individual
```javascript
// Testar apenas cálculo básico
import('./utils/simpleROITest.js').then(module => {
  module.testBasicROICalculation()
})

// Testar apenas formatação
import('./utils/simpleROITest.js').then(module => {
  module.testROIFormatting()
})
```

## 🔍 O que os Testes Verificam

### 1. Cálculo de Estatísticas
- ✅ Processamento correto dos surebets
- ✅ Cálculo correto de totais (count, totalProfit, totalROI)
- ✅ Cálculo correto de médias (averageProfit, averageROI)
- ✅ Validação de valores inválidos (NaN, Infinity, etc.)

### 2. Formatação
- ✅ Função `formatROI()` funcionando corretamente
- ✅ Função `formatCurrency()` funcionando corretamente
- ✅ Função `formatPercentage()` funcionando corretamente
- ✅ Tratamento de valores inválidos

### 3. Classes CSS
- ✅ Função `getROIClass()` retornando classes corretas
- ✅ Função `getProfitClass()` retornando classes corretas
- ✅ Tratamento de valores undefined/null

## 🐛 Problemas Identificados e Corrigidos

### 1. ROI Aparecendo como "0,00%"
**Causa:** As médias não estavam sendo calculadas corretamente na função `processBookmakerStats`

**Solução:** 
- Adicionada validação adequada dos valores antes do cálculo
- Melhorada a lógica de cálculo das médias
- Adicionados logs de debug para identificar problemas

### 2. Valores NaN/Infinity
**Causa:** Valores inválidos sendo passados para as funções de cálculo

**Solução:**
- Validação rigorosa de todos os valores antes do processamento
- Conversão adequada de strings para números
- Tratamento de valores null/undefined

### 3. Cálculos Incorretos
**Causa:** Lógica de cálculo das médias com problemas

**Solução:**
- Reescrita da lógica de cálculo das médias
- Verificação de divisão por zero
- Validação dos resultados dos cálculos

### 4. ROI Médio Ponderado
**Causa:** Necessidade de implementar cálculo mais preciso do ROI considerando o peso dos investimentos

**Solução:**
- Implementação da fórmula: `ROI_médio = (Lucro Total / Investimento Total) × 100`
- Adição do campo `totalInvestment` para rastrear investimentos
- Substituição do ROI Médio Simples pelo ROI Médio Ponderado
- Validação de cenários com investimentos diferentes
- Testes específicos para verificar a precisão do cálculo

### 4. Funcionalidade de Limpeza de Dados
**Implementação:** Criada funcionalidade completa para zerar todos os dados e forçar nova busca

**Funcionalidades:**
- Limpeza completa do localStorage (todas as chaves relacionadas ao ranking)
- Limpeza do banco de dados local (IndexedDB)
- Zeragem de todos os dados em memória
- Forçar nova busca de dados da API
- Recriação automática dos gráficos
- Indicador visual durante o processo de limpeza

### 5. Identificação Única de Surebets
**Implementação:** Sistema robusto para identificar surebets únicas e evitar contagem duplicada

**Funcionalidades:**
- Geração de IDs únicos baseados em múltiplos critérios (bookmakers, esporte, evento, mercado, odds, data)
- Detecção automática de surebets duplicadas
- Prevenção de contagem duplicada de bookmakers dentro da mesma surebet
- Logs detalhados para debug da contagem
- Validação de integridade dos dados de contagem

## 📊 Exemplo de Saída dos Testes

```
🚀 Iniciando testes de debug do ROI...
================================================================================
🧪 TESTE 1: Debug completo do problema do ROI
--------------------------------------------------
🔍 DEBUG: Investigando problema do ROI...
============================================================

📊 Estado inicial:
   bookmakersStats: 0 items
   totalSurebets: 0
   uniqueBookmakers: 0
   totalProfit: 0
   averageROI: 0

🔄 Simulando processamento dos surebets...

🔍 Processando surebet 1: test_001
   Dados originais:
     bookmaker1: "Bet365"
     bookmaker2: "William Hill"
     profit: 15.5 (number)
     roi: 3.2 (number)
   ✅ Criado novo bookmaker: Bet365
   📈 Count atualizado para Bet365: 1
   🔍 Valores antes da validação:
     profit original: 15.5 (number)
     roi original: 3.2 (number)
   ✅ Valores após validação:
     validProfit: 15.5 (number)
     validROI: 3.2 (number)
   📊 Totais acumulados para Bet365:
     totalProfit: 15.5
     totalROI: 3.2
   🧮 Médias calculadas para Bet365:
     averageProfit: 15.5
     averageROI: 3.2
   ✅ Médias finais para Bet365:
     averageProfit: 15.5
     averageROI: 3.2

📊 RESULTADOS FINAIS DO DEBUG:
============================================================

🏆 1º Lugar: Bet365
   Count: 3
   Total Profit: 45.05
   Total ROI: 9.5
   Average Profit: 15.016666666666667
   Average ROI: 3.1666666666666665
   Formatação:
     ROI formatado: 3.17%
     Profit formatado: R$ 15,02

🏆 2º Lugar: William Hill
   Count: 2
   Total Profit: 33.1
   Total ROI: 7.9
   Average Profit: 16.55
   Average ROI: 3.95
   Formatação:
     ROI formatado: 3.95%
     Profit formatado: R$ 16,55

🏆 3º Lugar: Betfair
   Count: 2
   Total Profit: 41.9
   Total ROI: 9.1
   Average Profit: 20.95
   Average ROI: 4.55
   Formatação:
     ROI formatado: 4.55%
     Profit formatado: R$ 20,95

============================================================
📈 ESTATÍSTICAS GERAIS:
============================================================
   Total Surebets: 5
   Unique Bookmakers: 3
   Total Profit: 120.05
   Average ROI: 5.3
```

## 🎯 Próximos Passos

1. **Execute os testes** para verificar se o problema foi resolvido
2. **Verifique os logs** no console para identificar qualquer problema restante
3. **Teste na interface** para confirmar que os valores estão sendo exibidos corretamente
4. **Monitore o desempenho** para garantir que as correções não afetaram a performance

## 🏆 Funcionalidade das Duplinhas

### O que são as Duplinhas?
As "Duplinhas" são pares únicos de casas de apostas que aparecem juntas nas surebets. Esta funcionalidade identifica e conta quantas vezes cada combinação de duas casas aparece, criando um ranking baseado na frequência.

### Como funciona:
1. **Identificação única**: Cada surebet é identificada de forma única para evitar contagem duplicada
2. **Pares ordenados**: A ordem dos bookmakers não importa (Bet365 + Kto = Kto + Bet365)
3. **Contagem de frequência**: Cada par recebe +1 ponto cada vez que aparece em uma surebet nova
4. **Ranking por frequência**: As duplas são ordenadas da mais frequente para a menos frequente

### Exemplo prático:
- Surebet 1: Bet365 + Kto
- Surebet 2: Bet365 + Superbet  
- Surebet 3: Bet365 + Kto (duplicada - não conta)
- Surebet 4: Kto + Superbet

**Resultado:**
- (Bet365, Kto) → 1 vez
- (Bet365, Superbet) → 1 vez
- (Kto, Superbet) → 1 vez

### Benefícios:
- Identifica quais casas trabalham melhor juntas
- Ajuda na estratégia de arbitragem
- Fornece insights sobre parcerias entre casas
- Permite análise de performance por dupla

## 📞 Suporte

Se os testes revelarem problemas adicionais:
1. Verifique os logs de erro no console
2. Execute o debug específico do ROI
3. Compare os resultados com os dados de teste esperados
4. Verifique se há problemas de sincronização ou timing

---

**Nota:** Estes testes são específicos para o problema do ROI e podem precisar de ajustes conforme o sistema evolui.
