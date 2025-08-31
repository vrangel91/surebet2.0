# Sistema de Traduções de Mercado

## Visão Geral

Este sistema fornece traduções automáticas de termos de mercado de apostas esportivas do inglês para o português brasileiro. Ele identifica padrões específicos e os converte em frases claras e intuitivas.

## Arquivos Principais

- **`client/src/utils/market-translations.js`** - Sistema principal de tradução
- **`client/test-market-translations.html`** - Arquivo de teste standalone
- **`client/README-MARKET-TRANSLATIONS.md`** - Esta documentação

## Regras de Tradução

### 1. Padrões Numéricos (TO/TU)
- **TO(x)** → "Total de gols acima de x" (quando não há métrica específica)
- **TU(x)** → "Total de gols abaixo de x" (quando não há métrica específica)
- **TO(x) for Team1** → "Total de gols acima de x para o Time 1" (quando não há métrica específica)
- **TU(x) for Team2** → "Total de gols abaixo de x para o Time 2" (quando não há métrica específica)
- **TO(x) for Team1 - Corners** → "Total de escanteios acima de x para o Time 1" (métrica específica)
- **TU(x) for Team2 - Shots** → "Total de chutes abaixo de x para o Time 2" (métrica específica)

### 2. Handicaps e Totais por Time (NOVO!)
- **AH1** → "Asian Handicap para o Time 1"
- **AH2** → "Asian Handicap para o Time 2"
- **EH1** → "European Handicap para o Time 1"
- **EH2** → "European Handicap para o Time 2"
- **TO1** → "Team 1 Over (Total acima para o Time 1)"
- **TU1** → "Team 1 Under (Total abaixo para o Time 1)"
- **TO2** → "Team 2 Over (Total acima para o Time 2)"
- **TU2** → "Team 2 Under (Total abaixo para o Time 2)"

### 3. Contexto de Time (for Team1/Team2)
- **for Team1** → "para o Time 1"
- **for Team2** → "para o Time 2"
- **for team1** → "para o Time 1"
- **FOR TEAM1** → "para o Time 1"

### 4. Vitórias de Times
- **Team1 Win** → "Vitória do Time 1"
- **Team2 Win** → "Vitória do Time 2"
- **Team1** → "Time 1"
- **Team2** → "Time 2"

### 5. Par/Ímpar
- **Odd** → "Resultado ímpar"
- **Even** → "Resultado par"

### 6. Padrões de Gols (NOVO!)
- **Both to score** → "Ambos marcam"
- **Both teams to score** → "Ambos os times marcam"
- **BTS** → "Ambos marcam"
- **One scoreless** → "Um time sem marcar"
- **One team scoreless** → "Um time sem marcar"
- **Scoreless** → "Sem gols"
- **No goals** → "Sem gols"
- **Clean sheet** → "Jogo sem gols"

### 6. Métricas Específicas
- **Shots on goal** → "Chutes a gol"
- **Corners** → "Escanteios"
- **Sets** → "Sets"
- **Maps** → "Mapas"
- **Goals** → "Gols"
- **Cards** → "Cartões"
- **Fouls** → "Faltas"

### 7. Esportes
- **Football/Soccer** → "Futebol"
- **Basketball** → "Basquete"
- **Tennis** → "Tênis"
- **Formula 1/F1** → "Fórmula 1"

## Ordem de Aplicação

As traduções são aplicadas na seguinte ordem para garantir consistência:

1. **Padrões Numéricos** (TO/TU)
2. **Contexto de Time** (for Team1/Team2) - **Novidade!**
3. **Handicaps** (AH1, AH2, EH1, EH2, TO1, TU1, TO2, TU2) - **Novidade!**
4. **Vitórias de Times** (Team1 Win, Team2 Win)
5. **Par/Ímpar** (Odd, Even)
6. **Padrões de Gols** (Both to score, One scoreless) - **Novidade!**
7. **Métricas Específicas** (Shots on goal, Corners, etc.)
8. **Esportes** (Football, Basketball, etc.)

## Uso

### Função Principal
```javascript
import { formatMarketForDisplay } from '@/utils/market-translations';

const translatedMarket = formatMarketForDisplay('AH1');
// Resultado: "Asian Handicap para o Time 1"
```

### Exemplos de Uso

#### Handicaps Simples
```javascript
formatMarketForDisplay('AH1')        // "Asian Handicap para o Time 1"
formatMarketForDisplay('EH2')        // "European Handicap para o Time 2"
formatMarketForDisplay('TO1')        // "Team 1 Over (Total acima para o Time 1)"
formatMarketForDisplay('TU2')        // "Team 2 Under (Total abaixo para o Time 2)"
```

#### Combinações Complexas
```javascript
formatMarketForDisplay('TO(4.5) for Team1 - Shots on goal')
// "Total de chutes a gol acima de 4.5 para o Time 1"

formatMarketForDisplay('TU(3.5) for Team2 - Corners')
// "Total de escanteios abaixo de 3.5 para o Time 2"
```

#### Contexto de Time
```javascript
formatMarketForDisplay('for Team1')  // "para o Time 1"
formatMarketForDisplay('FOR TEAM2')  // "para o Time 2"
```

## Categorias de Mercado

O sistema reconhece e categoriza diferentes tipos de mercados:

### Handicap
- **AH1, AH2** - Asian Handicap para Time 1 e Time 2
- **EH1, EH2** - European Handicap para Time 1 e Time 2
- **TO1, TU1** - Team 1 Over/Under
- **TO2, TU2** - Team 2 Over/Under

### Total
- **TO(x), TU(x)** - Total de gols acima/abaixo de um valor
- **TO(x) for Team1/Team2** - Total de gols específico para um time

### Vitória
- **Team1 Win, Team2 Win** - Vitória de um time específico

### Par/Ímpar
- **Odd, Even** - Resultado par ou ímpar

### Gols
- **Both to score, BTS** - Ambos os times marcam
- **One scoreless, Clean sheet** - Um time sem marcar

### Métricas
- **Shots on goal, Corners, Sets, Maps, Goals, Cards, Fouls**

## Funções Utilitárias

### `categorizeMarket(marketText)`
Categoriza um mercado em uma das categorias disponíveis.

### `getMarketCategories()`
Retorna todas as categorias disponíveis.

### `getSubcategories(category)`
Retorna as subcategorias de uma categoria específica.

### `getMarketCodes(category)`
Retorna exemplos de códigos para uma categoria específica.

### `hasTranslation(marketText)`
Verifica se um mercado tem tradução disponível.

### `getTranslation(marketText)`
Retorna a tradução de um mercado específico.

## Testes

Use o arquivo `client/test-market-translations.html` para testar todas as funcionalidades:

1. **Teste Manual** - Digite qualquer texto para testar
2. **Testes Automáticos** - Execute testes específicos por categoria
3. **Teste Completo** - Execute todos os testes de uma vez

### Executando Testes
```bash
# Abra o arquivo HTML no navegador
open client/test-market-translations.html

# Ou use um servidor local
python -m http.server 8000
# Acesse: http://localhost:8000/client/test-market-translations.html
```

## Contribuindo

Para adicionar novas traduções:

1. Adicione os padrões ao objeto correspondente
2. Crie a função de aplicação se necessário
3. Integre na função `formatMarketForDisplay`
4. Atualize a documentação
5. Adicione testes no arquivo HTML

## Notas Importantes

- **Case-insensitive**: O sistema reconhece variações maiúsculas/minúsculas
- **Ordem de Prioridade**: Padrões mais específicos são aplicados primeiro
- **Extensibilidade**: Fácil de adicionar novos padrões e categorias
- **Testes**: Sempre teste novas funcionalidades antes de usar em produção
