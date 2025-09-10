# Sistema de Validação e Sanitização UTF-8

## Visão Geral

Este documento descreve o sistema completo de validação e sanitização UTF-8 implementado no `RankingView.vue` para corrigir erros de inserção no banco de dados PostgreSQL relacionados a caracteres inválidos para UTF-8.

## Funcionalidades Implementadas

### 1. Validação de Codificação do Banco de Dados

**Função:** `validateDatabaseUTF8Encoding()`

- Verifica se o banco de dados está configurado corretamente para UTF-8
- Testa inserção de caracteres especiais (acentos, emojis, símbolos)
- Retorna status da configuração UTF-8 do banco

```javascript
// Exemplo de uso
const isUTF8Ready = await this.validateDatabaseUTF8Encoding()
if (!isUTF8Ready) {
  console.warn('Banco pode ter problemas de codificação UTF-8')
}
```

### 2. Validação de Strings UTF-8

**Função:** `isValidUTF8String(str)`

- Verifica se uma string é válida em UTF-8
- Usa codificação/decodificação URI para validação
- Retorna `true` se válida, `false` caso contrário

```javascript
// Exemplo de uso
const isValid = this.isValidUTF8String('Flamengo vs São Paulo ⚽')
console.log('String válida:', isValid) // true
```

### 3. Sanitização de Strings UTF-8

**Função:** `sanitizeUTF8String(str)`

- Remove caracteres de controle inválidos
- Normaliza caracteres Unicode (NFC)
- Substitui caracteres problemáticos por '?'
- Mantém acentos e símbolos válidos

```javascript
// Exemplo de uso
const sanitized = this.sanitizeUTF8String('Texto com\x00caracteres\x1Finválidos')
console.log('Texto sanitizado:', sanitized) // 'Texto com?caracteres?inválidos'
```

### 4. Sanitização de Objetos JSON

**Função:** `sanitizeJSONForUTF8(obj)`

- Sanitiza recursivamente objetos, arrays e strings
- Preserva estrutura original dos dados
- Aplica sanitização UTF-8 em chaves e valores

```javascript
// Exemplo de uso
const data = {
  casa: 'São Paulo FC',
  evento: 'Flamengo vs São Paulo ⚽',
  metadata: { descrição: 'Partida com acentos' }
}
const sanitized = this.sanitizeJSONForUTF8(data)
```

### 5. Sanitização Completa de Dados

**Função:** `sanitizeDataForUTF8(data)`

- Sanitiza dados completos para inserção no banco
- Gera relatório detalhado de correções
- Lista campos que precisaram de correção
- Testa serialização JSON após sanitização

```javascript
// Exemplo de uso
const result = await this.sanitizeDataForUTF8(surebetData)
if (result.hasUTF8Issues) {
  console.log('Campos corrigidos:', result.fieldsCorrected)
  console.log('Relatório:', result.utf8Report)
}
```

### 6. Sistema de Prevenção Automática

**Função:** `setupUTF8Prevention()`

- Intercepta requisições fetch para validação automática
- Aplica sanitização UTF-8 em requisições POST/PUT/PATCH
- Configura headers padrão para UTF-8
- Previne problemas antes de chegarem ao servidor

### 7. Validação de Dados de Entrada

**Função:** `validateInputData(data)`

- Valida recursivamente dados de entrada
- Identifica problemas em strings, arrays e objetos
- Retorna lista detalhada de problemas encontrados

### 8. Geração de Relatórios

**Função:** `generateUTF8ValidationReport(data)`

- Gera relatório completo de validação UTF-8
- Inclui timestamp, total de problemas e recomendações
- Fornece análise detalhada dos dados

### 9. Sistema de Logging

**Função:** `logUTF8Report(report)`

- Salva relatórios UTF-8 no localStorage
- Envia relatórios para o servidor (opcional)
- Mantém histórico dos últimos 100 relatórios

## Integração com o Sistema

### Inicialização Automática

O sistema é inicializado automaticamente no `mounted()` do componente:

```javascript
async mounted() {
  // Inicializar sistema de prevenção UTF-8
  await this.setupUTF8Prevention()
  
  // ... resto da inicialização
}
```

### Validação em Inserções no Banco

Todas as inserções passam por validação UTF-8:

```javascript
async saveDataToDatabase() {
  // Validar codificação UTF-8 do banco
  await this.validateDatabaseUTF8Encoding()
  
  // Sanitizar cada item antes de salvar
  const sanitizedItem = await this.sanitizeDataForUTF8(item)
  await this.saveIndividualRecord(sanitizedItem.data)
}
```

### Processamento de Dados da API

Dados da API externa são sanitizados automaticamente:

```javascript
processExternalAPIData(apiData) {
  // ... processamento normal ...
  
  // Aplicar sanitização UTF-8 antes de adicionar
  const sanitizedSurebet = this.sanitizeJSONForUTF8(processedSurebet)
  processedData.push(sanitizedSurebet)
}
```

## Interface de Teste

### Botões de Desenvolvimento

Em modo de desenvolvimento, botões de teste são exibidos:

- **🧪 Testar UTF-8**: Executa teste completo do sistema
- **📊 Stats UTF-8**: Exibe estatísticas dos relatórios salvos
- **🗑️ Limpar Relatórios**: Remove relatórios antigos do localStorage

### Função de Teste

**Função:** `testUTF8System()`

```javascript
// Exemplo de uso no console
await this.testUTF8System()
```

Testa o sistema com dados de exemplo contendo:
- Texto normal
- Acentos (áéíóú àèìòù âêîôû ãõ ç ñ)
- Emojis (🏆⚽🎯💰)
- Símbolos (€£¥₹)
- Texto misto

## Campos Validados

O sistema valida os seguintes campos de texto:

- `surebet_id`
- `house`, `house_name`, `bookmaker`
- `market`, `market_name`, `bet_type`
- `match`, `match_name`, `game`, `event`
- `sport`, `sport_name`, `category`
- `period`, `time_period`, `period_name`
- `anchorh1`, `anchor_h1`, `anchor1`
- `anchorh2`, `anchor_h2`, `anchor2`
- `metadata` (objeto completo)

## Tratamento de Erros

### Erros de Codificação

- Caracteres inválidos são substituídos por '?'
- Dados originais são preservados no relatório
- Processo continua mesmo com erros

### Erros de Serialização

- Testa serialização JSON após sanitização
- Registra erros de serialização no relatório
- Retorna dados originais em caso de erro crítico

### Logging de Problemas

- Todos os problemas são registrados no localStorage
- Relatórios incluem timestamp e contexto
- Estatísticas são mantidas para análise

## Prevenção Futura

### Validação Automática

- Interceptação de requisições fetch
- Sanitização automática de dados JSON
- Headers UTF-8 configurados por padrão

### Monitoramento

- Relatórios automáticos de problemas
- Estatísticas de uso do sistema
- Histórico de correções aplicadas

## Exemplo de Uso Completo

```javascript
// 1. Inicializar sistema (automático no mounted)
await this.setupUTF8Prevention()

// 2. Validar dados antes de inserir
const validationReport = this.generateUTF8ValidationReport(data)
this.displayUTF8Report(validationReport)

// 3. Sanitizar dados se necessário
if (validationReport.totalIssues > 0) {
  const sanitized = await this.sanitizeDataForUTF8(data)
  data = sanitized.data
}

// 4. Inserir dados sanitizados
await this.saveIndividualRecord(data)

// 5. Verificar estatísticas
this.showUTF8Statistics()
```

## Benefícios

1. **Prevenção de Erros**: Evita falhas de inserção no banco
2. **Dados Limpos**: Garante compatibilidade UTF-8
3. **Relatórios Detalhados**: Facilita identificação de problemas
4. **Sistema Automático**: Funciona transparentemente
5. **Monitoramento**: Permite acompanhar qualidade dos dados
6. **Flexibilidade**: Funciona com qualquer tipo de dado

## Manutenção

### Limpeza de Relatórios

```javascript
// Limpar relatórios antigos
this.clearUTF8Reports()
```

### Verificação de Estatísticas

```javascript
// Ver estatísticas de uso
this.showUTF8Statistics()
```

### Teste do Sistema

```javascript
// Testar funcionamento
await this.testUTF8System()
```

## Conclusão

O sistema de validação e sanitização UTF-8 implementado garante que todos os dados inseridos no banco PostgreSQL sejam compatíveis com UTF-8, prevenindo erros de codificação e mantendo a integridade dos dados. O sistema é transparente, automático e fornece relatórios detalhados para monitoramento e análise.
