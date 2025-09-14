/**
 * Exemplo de Uso do Serviço de Tradução de Campeonatos
 *
 * Este arquivo demonstra como usar o serviço de tradução
 * de campeonatos em diferentes cenários
 */

import {
  translateTournament,
  translateMultipleTournaments,
  getTranslationStats,
  hasTranslation,
  getTranslationsByCategory,
} from "../services/tournamentTranslationService.js";

// Exemplo 1: Tradução simples
console.log("=== EXEMPLO 1: Tradução Simples ===");
console.log(translateTournament("Premier League")); // "Premier League"
console.log(translateTournament("English Premier League")); // "Premier League"
console.log(translateTournament("EPL")); // "Premier League"
console.log(translateTournament("Brasileirão Série A")); // "Brasileirão"
console.log(translateTournament("UEFA Champions League")); // "Champions League"

// Exemplo 2: Tradução com contexto de esporte
console.log("\n=== EXEMPLO 2: Tradução com Contexto ===");
console.log(translateTournament("NBA", "Basquete")); // "NBA"
console.log(translateTournament("National Basketball Association", "Basquete")); // "NBA"
console.log(translateTournament("NFL", "Futebol Americano")); // "NFL"
console.log(
  translateTournament("National Football League", "Futebol Americano")
); // "NFL"

// Exemplo 3: Tradução de múltiplos campeonatos
console.log("\n=== EXEMPLO 3: Tradução Múltipla ===");
const tournaments = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Brasileirão Série A",
  "Champions League",
  "NBA",
  "NFL",
  "F1",
  "UFC",
];

const translated = translateMultipleTournaments(tournaments);
console.log("Traduções:", translated);

// Exemplo 4: Verificar se existe tradução
console.log("\n=== EXEMPLO 4: Verificação de Tradução ===");
console.log("Premier League existe?", hasTranslation("Premier League")); // true
console.log("Liga Desconhecida existe?", hasTranslation("Liga Desconhecida")); // false

// Exemplo 5: Estatísticas do serviço
console.log("\n=== EXEMPLO 5: Estatísticas ===");
const stats = getTranslationStats();
console.log("Estatísticas:", stats);

// Exemplo 6: Traduções por categoria
console.log("\n=== EXEMPLO 6: Traduções por Categoria ===");
const futebolTranslations = getTranslationsByCategory("futebol");
console.log("Futebol:", futebolTranslations);

const basqueteTranslations = getTranslationsByCategory("basquete");
console.log("Basquete:", basqueteTranslations);

// Exemplo 7: Casos especiais e fallbacks
console.log("\n=== EXEMPLO 7: Casos Especiais ===");
console.log(translateTournament("Campeonato Desconhecido")); // "Campeonato Desconhecido" (fallback)
console.log(translateTournament("", "Futebol")); // "Futebol" (fallback por esporte)
console.log(translateTournament(null)); // "Campeonato" (fallback genérico)

// Exemplo 8: Simulação de dados da API
console.log("\n=== EXEMPLO 8: Simulação de Dados da API ===");
const apiData = [
  {
    sport: "Futebol",
    tournament: "Premier League",
    event: "Manchester United vs Liverpool",
  },
  {
    sport: "Basquete",
    tournament: "NBA",
    event: "Lakers vs Warriors",
  },
  {
    sport: "Futebol Americano",
    tournament: "NFL",
    event: "Patriots vs Bills",
  },
  {
    sport: "Futebol",
    tournament: "Brasileirão Série A",
    event: "Flamengo vs Palmeiras",
  },
];

console.log("Dados processados:");
apiData.forEach((data) => {
  const translatedTournament = translateTournament(data.tournament, data.sport);
  console.log(`${data.sport} - ${data.tournament} -> ${translatedTournament}`);
});

export {
  translateTournament,
  translateMultipleTournaments,
  getTranslationStats,
  hasTranslation,
  getTranslationsByCategory,
};
