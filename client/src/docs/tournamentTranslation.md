# Sistema de Tradução de Campeonatos

## Visão Geral

O sistema de tradução de campeonatos foi criado para traduzir automaticamente os nomes dos campeonatos e torneios retornados pela API para os nomes corretos usados no Brasil. O sistema é inteligente, automático e possui fallbacks para casos não mapeados.

## Características

### ✅ **Inteligente e Automático**

- Tradução automática baseada em mapeamentos pré-definidos
- Busca por padrões conhecidos (ex: "Premier League", "EPL", "English Premier League")
- Detecção inteligente baseada no contexto do esporte

### ✅ **Fallbacks Inteligentes**

- Fallback por esporte (ex: Futebol → "Futebol")
- Fallback genérico para casos não mapeados
- Preserva o nome original quando não há tradução

### ✅ **Extensível**

- Fácil adição de novas traduções
- Suporte a múltiplas variações do mesmo campeonato
- Categorização por esporte

## Estrutura dos Arquivos

```
client/src/
├── config/
│   └── tournamentTranslations.json    # Mapeamentos de tradução
├── services/
│   └── tournamentTranslationService.js # Serviço principal
├── examples/
│   └── tournamentTranslationExample.js # Exemplos de uso
└── docs/
    └── tournamentTranslation.md       # Esta documentação
```

## Como Usar

### 1. Importação Básica

```javascript
import { translateTournament } from "../services/tournamentTranslationService.js";

// Tradução simples
const translated = translateTournament("Premier League");
console.log(translated); // "Premier League"
```

### 2. Tradução com Contexto

```javascript
// Com contexto de esporte para melhor precisão
const translated = translateTournament("NBA", "Basquete");
console.log(translated); // "NBA"
```

### 3. Tradução Múltipla

```javascript
import { translateMultipleTournaments } from "../services/tournamentTranslationService.js";

const tournaments = ["Premier League", "La Liga", "Serie A"];
const translated = translateMultipleTournaments(tournaments);
console.log(translated); // ["Premier League", "La Liga", "Serie A"]
```

### 4. Verificação de Tradução

```javascript
import { hasTranslation } from "../services/tournamentTranslationService.js";

if (hasTranslation("Premier League")) {
  console.log("Tradução disponível!");
}
```

## Mapeamentos Incluídos

### Futebol

- **Premier League**: Premier League, EPL, English Premier League
- **La Liga**: La Liga, Spanish La Liga, Primera División
- **Serie A**: Serie A, Italian Serie A, Calcio
- **Bundesliga**: Bundesliga, German Bundesliga
- **Ligue 1**: Ligue 1, French Ligue 1
- **Brasileirão**: Brasileirão, Campeonato Brasileiro, Série A
- **Champions League**: Champions League, UCL, UEFA Champions League
- **Copa do Brasil**: Copa do Brasil, Brazilian Cup
- **Copa Libertadores**: Copa Libertadores, Libertadores
- **Copa do Mundo**: Copa do Mundo, World Cup, FIFA World Cup

### Basquete

- **NBA**: NBA, National Basketball Association
- **WNBA**: WNBA, Women's NBA
- **EuroLeague**: EuroLeague, Turkish Airlines EuroLeague
- **NBB**: NBB, Novo Basquete Brasil
- **NCAA**: NCAA, College Basketball, March Madness

### Tênis

- **Wimbledon**: Wimbledon, Wimbledon Championships
- **US Open**: US Open, US Open Tennis
- **Roland Garros**: Roland Garros, French Open
- **Australian Open**: Australian Open, AO
- **ATP**: ATP, ATP Tour
- **WTA**: WTA, WTA Tour

### Futebol Americano

- **NFL**: NFL, National Football League
- **NCAA Football**: NCAA Football, College Football

### Esports

- **Counter-Strike 2**: CS2, Counter-Strike 2, CS:GO
- **League of Legends**: LoL, League of Legends, LCS, LEC, LCK, LPL
- **Dota 2**: Dota 2, DOTA2, The International
- **Valorant**: Valorant, VALORANT, VCT

### Outros Esportes

- **Fórmula 1**: F1, Formula 1, Formula One
- **UFC**: UFC, Ultimate Fighting Championship
- **NHL**: NHL, National Hockey League
- **MLB**: MLB, Major League Baseball
- **MotoGP**: MotoGP, Moto GP

## Integração com a API

O sistema já está integrado no processamento da API (`surebetsAPI.js`):

```javascript
// Tradução automática durante o processamento
const translatedTournament = translateTournament(tournament, sport);

const processedSurebet = {
  // ... outros campos
  tournament: translatedTournament,
  originalTournament: tournament, // Mantém original para referência
  // ... outros campos
};
```

## Adicionando Novas Traduções

### 1. Via Arquivo JSON

Edite `tournamentTranslations.json`:

```json
{
  "translations": {
    "Novo Campeonato": "Novo Campeonato",
    "New Championship": "Novo Campeonato",
    "NC": "Novo Campeonato"
  }
}
```

### 2. Via Código

```javascript
import { addTranslation } from "../services/tournamentTranslationService.js";

addTranslation("Novo Campeonato", "Novo Campeonato");
```

## Estatísticas

```javascript
import { getTranslationStats } from "../services/tournamentTranslationService.js";

const stats = getTranslationStats();
console.log(stats);
// {
//   totalTranslations: 150,
//   totalPatterns: 9,
//   totalFallbacks: 8,
//   categories: { ... }
// }
```

## Fallbacks

O sistema possui 3 níveis de fallback:

1. **Tradução Exata**: Busca exata no mapeamento
2. **Tradução por Padrão**: Busca por padrões conhecidos
3. **Fallback por Esporte**: Usa o nome do esporte
4. **Fallback Genérico**: Retorna o nome original

## Performance

- **Busca O(1)** para traduções exatas
- **Busca O(n)** para padrões (onde n é o número de padrões)
- **Cache automático** de traduções frequentes
- **Processamento assíncrono** para múltiplas traduções

## Exemplos de Uso Real

### No Componente Vue

```vue
<template>
  <div class="tournament">
    {{ surebet[0]?.tournament || "Liga" }}
  </div>
</template>
```

### No Processamento de Dados

```javascript
// Dados da API
const apiData = {
  sport: "Futebol",
  tournament: "Premier League",
  event: "Manchester United vs Liverpool",
};

// Processamento com tradução
const processedData = {
  ...apiData,
  tournament: translateTournament(apiData.tournament, apiData.sport),
};
```

## Manutenção

### Atualizando Traduções

1. Edite `tournamentTranslations.json`
2. Adicione novas traduções conforme necessário
3. Teste com `tournamentTranslationExample.js`
4. Deploy da atualização

### Monitoramento

- Use `getTranslationStats()` para monitorar uso
- Verifique logs para traduções não encontradas
- Adicione novas traduções baseadas nos logs

## Conclusão

O sistema de tradução de campeonatos é uma solução robusta, inteligente e automática que melhora significativamente a experiência do usuário ao apresentar nomes de campeonatos em português brasileiro. É facilmente extensível e mantém compatibilidade com dados existentes.
