/**
 * Serviço de Tradução de Campeonatos
 *
 * Este serviço traduz nomes de campeonatos e torneios da API
 * para os nomes corretos usados no Brasil
 */

import tournamentTranslations from "../config/tournamentTranslations.json";

/**
 * Traduz um nome de campeonato para português brasileiro
 * @param {string} tournamentName - Nome original do campeonato
 * @param {string} sport - Tipo de esporte (opcional, para contexto)
 * @returns {string} Nome traduzido do campeonato
 */
export function translateTournament(tournamentName, sport = null) {
  if (!tournamentName || typeof tournamentName !== "string") {
    return "Campeonato";
  }

  // Normalizar o nome para busca
  const normalizedName = tournamentName.trim();

  // 1. Busca exata nas traduções
  const exactTranslation = tournamentTranslations.translations[normalizedName];
  if (exactTranslation) {
    return exactTranslation;
  }

  // 2. Busca case-insensitive
  const lowerName = normalizedName.toLowerCase();
  for (const [original, translation] of Object.entries(
    tournamentTranslations.translations
  )) {
    if (original.toLowerCase() === lowerName) {
      return translation;
    }
  }

  // 3. Busca por padrões (partial match)
  for (const [original, translation] of Object.entries(
    tournamentTranslations.translations
  )) {
    if (
      lowerName.includes(original.toLowerCase()) ||
      original.toLowerCase().includes(lowerName)
    ) {
      return translation;
    }
  }

  // 4. Busca inteligente por padrões conhecidos
  const patternMatch = findPatternMatch(lowerName, sport);
  if (patternMatch) {
    return patternMatch;
  }

  // 5. Fallback baseado no esporte
  const sportFallback = getSportFallback(sport);
  if (sportFallback) {
    return sportFallback;
  }

  // 6. Fallback genérico
  return tournamentName;
}

/**
 * Encontra correspondência por padrões conhecidos
 * @param {string} tournamentName - Nome do campeonato em lowercase
 * @param {string} sport - Tipo de esporte
 * @returns {string|null} Tradução encontrada ou null
 */
function findPatternMatch(tournamentName, sport) {
  const patterns = tournamentTranslations.patterns;

  // Buscar por padrões específicos do esporte
  if (sport) {
    const sportLower = sport.toLowerCase();

    // Futebol
    if (
      sportLower.includes("futebol") ||
      sportLower.includes("football") ||
      sportLower.includes("soccer")
    ) {
      for (const [key, variations] of Object.entries(patterns)) {
        if (
          key.includes("brasileirao") ||
          key.includes("premier_league") ||
          key.includes("champions_league")
        ) {
          for (const variation of variations) {
            if (tournamentName.includes(variation)) {
              return getTranslationByPattern(key);
            }
          }
        }
      }
    }

    // Basquete
    if (sportLower.includes("basquete") || sportLower.includes("basketball")) {
      for (const [key, variations] of Object.entries(patterns)) {
        if (key === "nba") {
          for (const variation of variations) {
            if (tournamentName.includes(variation)) {
              return getTranslationByPattern(key);
            }
          }
        }
      }
    }

    // Futebol Americano
    if (
      sportLower.includes("futebol americano") ||
      sportLower.includes("american football")
    ) {
      for (const [key, variations] of Object.entries(patterns)) {
        if (key === "nfl") {
          for (const variation of variations) {
            if (tournamentName.includes(variation)) {
              return getTranslationByPattern(key);
            }
          }
        }
      }
    }
  }

  // Busca geral por padrões
  for (const [key, variations] of Object.entries(patterns)) {
    for (const variation of variations) {
      if (tournamentName.includes(variation)) {
        return getTranslationByPattern(key);
      }
    }
  }

  return null;
}

/**
 * Obtém tradução baseada no padrão encontrado
 * @param {string} patternKey - Chave do padrão
 * @returns {string} Tradução correspondente
 */
function getTranslationByPattern(patternKey) {
  const patternTranslations = {
    brasileirao: "Brasileirão",
    premier_league: "Premier League",
    champions_league: "Champions League",
    nba: "NBA",
    nfl: "NFL",
    f1: "Fórmula 1",
    ufc: "UFC",
    cs2: "Counter-Strike 2",
    lol: "League of Legends",
  };

  return patternTranslations[patternKey] || patternKey;
}

/**
 * Obtém fallback baseado no esporte
 * @param {string} sport - Tipo de esporte
 * @returns {string|null} Fallback ou null
 */
function getSportFallback(sport) {
  if (!sport) return null;

  const sportLower = sport.toLowerCase();
  const fallbacks = tournamentTranslations.fallbacks;

  for (const [key, value] of Object.entries(fallbacks)) {
    if (sportLower.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Traduz múltiplos campeonatos de uma vez
 * @param {Array} tournaments - Array de nomes de campeonatos
 * @param {string} sport - Tipo de esporte (opcional)
 * @returns {Array} Array de traduções
 */
export function translateMultipleTournaments(tournaments, sport = null) {
  if (!Array.isArray(tournaments)) {
    return [];
  }

  return tournaments.map((tournament) =>
    translateTournament(tournament, sport)
  );
}

/**
 * Obtém estatísticas das traduções
 * @returns {Object} Estatísticas do serviço
 */
export function getTranslationStats() {
  const translations = tournamentTranslations.translations;
  const patterns = tournamentTranslations.patterns;
  const fallbacks = tournamentTranslations.fallbacks;

  return {
    totalTranslations: Object.keys(translations).length,
    totalPatterns: Object.keys(patterns).length,
    totalFallbacks: Object.keys(fallbacks).length,
    categories: tournamentTranslations.metadata.categories,
  };
}

/**
 * Adiciona uma nova tradução dinamicamente
 * @param {string} original - Nome original
 * @param {string} translation - Tradução
 */
export function addTranslation(original, translation) {
  if (original && translation) {
    tournamentTranslations.translations[original] = translation;
    console.log(`✅ Tradução adicionada: "${original}" -> "${translation}"`);
  }
}

/**
 * Busca traduções por categoria
 * @param {string} category - Categoria do esporte
 * @returns {Array} Array de traduções da categoria
 */
export function getTranslationsByCategory(category) {
  const categories = tournamentTranslations.metadata.categories;
  const categoryTranslations = categories[category] || [];

  return categoryTranslations.map((tournament) => ({
    original: tournament,
    translation: tournamentTranslations.translations[tournament] || tournament,
  }));
}

/**
 * Valida se uma tradução existe
 * @param {string} tournamentName - Nome do campeonato
 * @returns {boolean} True se existe tradução
 */
export function hasTranslation(tournamentName) {
  if (!tournamentName) return false;

  const normalizedName = tournamentName.trim();
  const lowerName = normalizedName.toLowerCase();

  // Verifica tradução exata
  if (tournamentTranslations.translations[normalizedName]) {
    return true;
  }

  // Verifica tradução case-insensitive
  for (const original of Object.keys(tournamentTranslations.translations)) {
    if (original.toLowerCase() === lowerName) {
      return true;
    }
  }

  return false;
}

export default {
  translateTournament,
  translateMultipleTournaments,
  getTranslationStats,
  addTranslation,
  getTranslationsByCategory,
  hasTranslation,
};
