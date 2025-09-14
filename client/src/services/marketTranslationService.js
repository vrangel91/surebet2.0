/**
 * Serviço para carregar e gerenciar traduções de mercado
 */

let marketTranslations = null;
let isLoading = false;
let loadPromise = null;

/**
 * Carrega as traduções do arquivo JSON
 * @returns {Promise<Object>} - Objeto com as traduções
 */
async function loadTranslations() {
  if (marketTranslations) {
    return marketTranslations;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("/src/config/marketTranslations.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      marketTranslations = data.translations;
      resolve(marketTranslations);
    } catch (error) {
      console.error("Erro ao carregar traduções de mercado:", error);
      // Fallback para traduções básicas em caso de erro
      marketTranslations = {
        "TO(0.5)": "Mais de 0.5 Gols",
        "TU(0.5)": "Menos de 0.5 Gols",
        1: "Vitória Time 1",
        2: "Vitória Time 2",
        X: "Empate",
      };
      resolve(marketTranslations);
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  });

  return loadPromise;
}

/**
 * Obtém a tradução de um código de mercado
 * @param {string} marketCode - Código do mercado
 * @returns {Promise<string>} - Tradução do mercado
 */
export async function getMarketTranslation(marketCode) {
  if (!marketCode) return "Resultado Final";

  const translations = await loadTranslations();
  return translations[marketCode] || marketCode;
}

/**
 * Extrai o código do mercado de uma string completa
 * @param {string} marketString - String completa do mercado
 * @returns {Promise<string|null>} - Código extraído ou null se não encontrado
 */
export async function extractMarketCode(marketString) {
  if (!marketString) return null;

  const translations = await loadTranslations();
  const sortedCodes = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  // Procura por códigos conhecidos no início da string
  for (const code of sortedCodes) {
    if (marketString.startsWith(code)) {
      return code;
    }
  }

  // Procura por códigos seguidos de parênteses, espaços ou outros separadores
  for (const code of sortedCodes) {
    const regex = new RegExp(
      `\\b${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
    );
    if (regex.test(marketString)) {
      return code;
    }
  }

  // Procura por códigos no meio da string (fallback)
  for (const code of sortedCodes) {
    if (marketString.includes(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Processa mercados dinâmicos de jogadores com shots on target
 * @param {string} marketString - String completa do mercado
 * @returns {string|null} - Tradução dinâmica ou null se não for aplicável
 */
function processPlayerShotsOnTarget(marketString) {
  if (!marketString || typeof marketString !== "string") return null;

  // Regex para capturar: Nome do Jogador - Over/Under(Número) - Player Shots on Target
  // Suporta diferentes formatos de espaços e caracteres especiais
  const playerShotsRegex =
    /^(.+?)\s*-\s*(Over|Under)\((\d+(?:\.\d+)?)\)\s*-\s*Player\s+Shots\s+on\s+Target$/i;

  const match = marketString.match(playerShotsRegex);
  if (!match) return null;

  try {
    const [, playerName, overUnder, number] = match;
    const isOver = overUnder.toLowerCase() === "over";
    const prefix = isOver ? "Mais de" : "Menos de";

    // Limpa o nome do jogador removendo espaços extras
    const cleanPlayerName = playerName.trim();

    return `${cleanPlayerName} - ${prefix} ${number} Chutes ao Gol`;
  } catch (error) {
    console.warn("Erro ao processar mercado de jogador:", error);
    return null;
  }
}

/**
 * Processa outros tipos de mercados dinâmicos de jogadores
 * @param {string} marketString - String completa do mercado
 * @returns {string|null} - Tradução dinâmica ou null se não for aplicável
 */
function processOtherPlayerMarkets(marketString) {
  if (!marketString || typeof marketString !== "string") return null;

  // Regex para outros tipos de mercados de jogadores:
  // - Nome do Jogador - Over/Under(Número) - Player Goals
  // - Nome do Jogador - Over/Under(Número) - Player Assists
  // - Nome do Jogador - Over/Under(Número) - Player Cards
  const playerMarketsRegex =
    /^(.+?)\s*-\s*(Over|Under)\((\d+(?:\.\d+)?)\)\s*-\s*Player\s+(Goals|Assists|Cards|Fouls|Corners)$/i;

  const match = marketString.match(playerMarketsRegex);
  if (!match) return null;

  try {
    const [, playerName, overUnder, number, marketType] = match;
    const isOver = overUnder.toLowerCase() === "over";
    const prefix = isOver ? "Mais de" : "Menos de";

    // Traduz o tipo de mercado
    const marketTranslations = {
      Goals: "Gols",
      Assists: "Assistências",
      Cards: "Cartões",
      Fouls: "Faltas",
      Corners: "Escanteios",
    };

    const translatedType = marketTranslations[marketType] || marketType;
    const cleanPlayerName = playerName.trim();

    return `${cleanPlayerName} - ${prefix} ${number} ${translatedType}`;
  } catch (error) {
    console.warn("Erro ao processar mercado de jogador:", error);
    return null;
  }
}

/**
 * Traduz um mercado completo
 * @param {string} marketString - String completa do mercado
 * @returns {Promise<string>} - Mercado com tradução aplicada
 */
export async function translateMarket(marketString) {
  if (!marketString) return "Resultado Final";

  // Primeiro, tenta processar mercados dinâmicos de jogadores com shots on target
  const shotsTranslation = processPlayerShotsOnTarget(marketString);
  if (shotsTranslation) {
    return shotsTranslation;
  }

  // Depois, tenta processar outros mercados dinâmicos de jogadores
  const otherPlayerTranslation = processOtherPlayerMarkets(marketString);
  if (otherPlayerTranslation) {
    return otherPlayerTranslation;
  }

  // Por último, usa as traduções estáticas
  const marketCode = await extractMarketCode(marketString);
  if (!marketCode) return marketString;

  const translation = await getMarketTranslation(marketCode);
  return marketString.replace(marketCode, translation);
}

/**
 * Obtém todas as traduções carregadas
 * @returns {Promise<Object>} - Objeto com todas as traduções
 */
export async function getAllTranslations() {
  return await loadTranslations();
}

/**
 * Recarrega as traduções (útil para desenvolvimento)
 * @returns {Promise<Object>} - Novas traduções carregadas
 */
export async function reloadTranslations() {
  marketTranslations = null;
  return await loadTranslations();
}

export default {
  getMarketTranslation,
  extractMarketCode,
  translateMarket,
  getAllTranslations,
  reloadTranslations,
};
