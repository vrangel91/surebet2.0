# 🎯 Perfis de Aposta - Sistema de Simulação

## Visão Geral

O sistema de Perfis de Aposta permite simular a evolução da banca em 30 dias com diferentes perfis de apostador, considerando turnover diário, custos de múltiplas e variações naturais dos resultados.

## Funcionalidades

### 📊 Perfis Disponíveis

1. **Conservador**
   - Lucro médio: 2% do turnover
   - Baixo risco, lucros modestos
   - Ideal para iniciantes

2. **Balanceado**
   - Lucro médio: 3.5% do turnover
   - Equilíbrio entre risco e retorno
   - Perfil recomendado

3. **Agressivo**
   - Lucro médio: 5% do turnover
   - Alto risco, potencial de grandes lucros
   - Para apostadores experientes

4. **Camuflado**
   - Lucro médio: 2.5% do turnover
   - Perfil discreto para evitar detecção
   - Estratégia de baixo perfil

### 🔧 Parâmetros de Entrada

- **Banca Inicial**: Valor inicial para começar as simulações
- **Turnover Diário**: Volume médio de apostas por dia
- **Meta de Lucro Diário**: Objetivo de lucro por dia
- **Quantidade de Múltiplas**: Número de múltiplas diárias
- **Valor das Múltiplas**: Custo por múltipla
- **Variação Percentual**: Flutuação permitida nos resultados diários

### 📈 Processo de Cálculo

Para cada um dos 30 dias:

1. **Lucro Esperado** = Turnover × % do perfil
2. **Variação Aplicada** = ±% configurada (simulação realista)
3. **Custo Múltiplas** = Quantidade × Valor
4. **Lucro Líquido** = Lucro com variação - Custo múltiplas
5. **Banca Atualizada** = Banca anterior + Lucro líquido
6. **Meta Verificada** = Lucro líquido ≥ Meta diária

### 📊 Resultados

#### Resumo Final
- **Banca Final**: Valor após 30 dias
- **Lucro Total**: Soma de todos os lucros líquidos
- **ROI Médio Diário**: Retorno médio por dia
- **Custo Múltiplas**: Percentual do lucro bruto
- **Metas Atingidas**: Dias que atingiram a meta

#### Visualizações
- **Gráfico de Evolução**: Linha temporal da banca e lucros
- **Tabela Detalhada**: Dados dia a dia com todos os campos
- **Indicadores Visuais**: Cores para lucros/ganhos e metas atingidas

## Como Usar

1. Acesse a página "Perfis de Aposta" no menu lateral
2. Configure os parâmetros desejados
3. Clique em "Calcular Evolução"
4. Analise os resultados e gráficos
5. Use "Limpar" para resetar os dados

## Alertas e Recomendações

### ⚠️ Alertas Automáticos
- Custo das múltiplas > 20% do lucro bruto
- Meta não atingida por mais de 5 dias consecutivos
- Banca abaixo do valor inicial

### 💡 Dicas de Uso
- Comece com perfis conservadores
- Ajuste metas realistas baseadas no turnover
- Monitore o custo das múltiplas
- Use variações pequenas para simulações mais realistas

## Integração com o Sistema

### Rotas
- **URL**: `/betting-profiles`
- **Acesso**: Apenas usuários VIP
- **Guarda**: `requireVIP`

### Componentes
- **View**: `BettingProfilesView.vue`
- **Router**: Adicionado ao `index.js`
- **Sidebar**: Item de menu adicionado

### Dependências
- **Chart.js**: Para gráficos de evolução
- **Vue Router**: Navegação
- **Vuex**: Estado da aplicação

## Personalização

### Adicionar Novos Perfis
1. Edite o objeto `profileConfig` no componente
2. Adicione novo perfil com `profitPercentage`
3. Atualize o select de opções no template

### Modificar Cálculos
1. Ajuste a lógica no método `calculateEvolution`
2. Modifique fórmulas conforme necessário
3. Atualize validações e alertas

### Estilização
- Variáveis CSS definidas no componente
- Responsivo para mobile
- Tema escuro/claro compatível

## Exemplo de Uso

```javascript
// Configuração exemplo
{
  profile: 'balanceado',
  initialBank: 1000,
  dailyTurnover: 500,
  dailyProfitTarget: 50,
  dailyMultiples: 3,
  multipleValue: 5,
  variationPercent: 10
}

// Resultado esperado (aproximado)
// Banca Final: R$ 1.250,00
// Lucro Total: R$ 250,00
// ROI Médio: 0,83% ao dia
// Metas Atingidas: 18/30 dias
```

## Manutenção

### Logs e Debug
- Console logs para cálculos complexos
- Validação de dados de entrada
- Tratamento de erros em gráficos

### Performance
- Cálculos otimizados para 30 dias
- Gráficos responsivos
- Lazy loading de componentes

### Atualizações
- Versão: 1.0.0
- Data: Dezembro 2024
- Compatibilidade: Vue 3.x, Chart.js 4.x

