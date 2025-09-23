/**
 * API de Surebets - Exemplo de implementação
 *
 * Este arquivo demonstra como estruturar a API para evitar duplicatas
 * e fornecer dados para a página de ranking
 */

import { API_CONFIG, buildApiUrl } from "./apiConfig.js";
import { translateTournament } from "../services/tournamentTranslationService.js";

// Função para verificar se a resposta é JSON de forma segura
async function safeJsonResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    // Se não for JSON, retornar o texto da resposta
    const text = await response.text();
    console.error(
      "Resposta não-JSON recebida:",
      text.substring(0, 200) + "..."
    );
    return {
      error: "Resposta inválida do servidor",
      details: text.substring(0, 200),
    };
  }
}

// Função para processar resposta Server-Sent Events (SSE)
async function processSSEResponse(response) {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("text/event-stream")) {
    // Processar SSE
    const text = await response.text();
    const lines = text.split('\n');
    let eventData = null;
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(line.substring(6)); // Remove 'data: '
          eventData = jsonData;
          break; // Pegar apenas o primeiro evento 'data'
        } catch (parseError) {
          console.error("Erro ao parsear dados SSE:", parseError);
        }
      }
    }
    
    if (eventData) {
      return eventData;
    } else {
      throw new Error("Nenhum dado válido encontrado na resposta SSE");
    }
  } else {
    // Fallback para JSON normal
    return await safeJsonResponse(response);
  }
}

// Estrutura de uma surebet com ID único
const surebetExample = {
  id: "surebet_2024_001", // ID único para evitar duplicatas
  bookmaker1: "Bet365",
  bookmaker2: "William Hill",
  sport: "Futebol",
  event: "Brasil vs Argentina",
  market: "Resultado Final",
  selection1: "Brasil",
  selection2: "Empate",
  selection3: "Argentina",
  odds1: 2.1,
  odds2: 3.4,
  odds3: 3.8,
  profit: 15.5,
  roi: 3.2,
  stake: 100,
  createdAt: "2024-01-15T10:00:00Z",
  expiresAt: "2024-01-15T22:00:00Z",
  status: "active", // active, expired, completed
  tags: ["futebol", "brasileirao", "alta-liquidez"],
};

/**
 * Buscar surebets da API real (Server-Sent Events)
 * @param {Object} filters - Filtros para a busca
 * @returns {Promise<Array>} Lista de surebets
 */
async function fetchSurebets(filters = {}) {
  try {
    console.log("🌐 Buscando dados da API real (SSE)...");

    // Fazer chamada real à API com headers apropriados para SSE
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUREBETS), {
      method: "GET",
      headers: API_CONFIG.DEFAULT_HEADERS,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    // Processar dados SSE
    const apiData = await processSSEResponse(response);
    console.log("📡 Dados recebidos da API (SSE):", apiData);

    // Verificar se os dados têm a estrutura esperada
    if (!apiData || typeof apiData !== "object") {
      throw new Error("Estrutura de dados inválida da API");
    }

    // Processar dados da API real
    const processedSurebets = processRealAPIData(apiData);
    console.log(
      "✅ Dados processados:",
      processedSurebets.length,
      "surebets únicos"
    );

    // Salvar no banco local para cache
    try {
      await saveToLocalDatabase(processedSurebets, filters);
      console.log("💾 Dados salvos no banco local");
    } catch (saveError) {
      console.error("Erro ao salvar no banco local:", saveError);
    }

    return processedSurebets;
  } catch (error) {
    console.error("❌ Erro ao buscar da API real:", error);

    // Tentar carregar do banco local
    try {
      const localData = await loadFromLocalDatabase(filters);
      if (localData && localData.length > 0) {
        console.log(
          "📊 Carregando dados do banco local:",
          localData.length,
          "registros"
        );
        return localData;
      }
    } catch (localError) {
      console.error("Erro ao carregar do banco local:", localError);
    }

    // Retornar dados de exemplo se não conseguir carregar do banco local
    console.log("📊 Retornando dados de exemplo para demonstração");
    return getExampleData();
  }
}

/**
 * Função para buscar estatísticas de bookmakers
 * @param {Object} filters - Filtros de período e ordenação
 * @returns {Promise<Object>} Estatísticas dos bookmakers
 */
async function fetchBookmakerStats(filters = {}) {
  try {
    const response = await fetch("/api/bookmakers/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas");
    }

    const data = await safeJsonResponse(response);
    return data.stats;
  } catch (error) {
    console.error("Erro na API de estatísticas:", error);
    throw error;
  }
}

/**
 * Função para buscar ranking de bookmakers
 * @param {Object} filters - Filtros de período e ordenação
 * @returns {Promise<Array>} Ranking dos bookmakers
 */
async function fetchBookmakerRanking(filters = {}) {
  try {
    const response = await fetch("/api/bookmakers/ranking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar ranking");
    }

    const data = await safeJsonResponse(response);
    return data.ranking;
  } catch (error) {
    console.error("Erro na API de ranking:", error);
    throw error;
  }
}

/**
 * Função para buscar evolução temporal das surebets
 * @param {Object} filters - Filtros de período
 * @returns {Promise<Object>} Dados temporais
 */
async function fetchTemporalData(filters = {}) {
  try {
    const response = await fetch("/api/surebets/temporal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar dados temporais");
    }

    const data = await safeJsonResponse(response);
    return data.temporal;
  } catch (error) {
    console.error("Erro na API de dados temporais:", error);
    throw error;
  }
}

/**
 * Função para verificar se uma surebet já existe
 * @param {Object} surebetData - Dados da surebet
 * @returns {Promise<boolean>} True se já existe
 */
async function checkSurebetExists(surebetData) {
  try {
    const response = await fetch("/api/surebets/check-duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(surebetData),
    });

    if (!response.ok) {
      throw new Error("Erro ao verificar duplicata");
    }

    const data = await safeJsonResponse(response);
    return data.exists;
  } catch (error) {
    console.error("Erro ao verificar duplicata:", error);
    throw error;
  }
}

/**
 * Função para criar uma nova surebet
 * @param {Object} surebetData - Dados da surebet
 * @returns {Promise<Object>} Surebet criada
 */
async function createSurebet(surebetData) {
  try {
    // Gerar ID único baseado em timestamp e dados
    const uniqueId = `surebet_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const surebetWithId = {
      ...surebetData,
      id: uniqueId,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch("/api/surebets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(surebetWithId),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar surebet");
    }

    const data = await safeJsonResponse(response);
    return data.surebet;
  } catch (error) {
    console.error("Erro ao criar surebet:", error);
    throw error;
  }
}

/**
 * Função para atualizar uma surebet existente
 * @param {string} id - ID da surebet
 * @param {Object} updateData - Dados para atualizar
 * @returns {Promise<Object>} Surebet atualizada
 */
async function updateSurebet(id, updateData) {
  try {
    const response = await fetch(`/api/surebets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar surebet");
    }

    const data = await safeJsonResponse(response);
    return data.surebet;
  } catch (error) {
    console.error("Erro ao atualizar surebet:", error);
    throw error;
  }
}

/**
 * Função para deletar uma surebet
 * @param {string} id - ID da surebet
 * @returns {Promise<boolean>} True se deletada com sucesso
 */
async function deleteSurebet(id) {
  try {
    const response = await fetch(`/api/surebets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar surebet");
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar surebet:", error);
    throw error;
  }
}

/**
 * Função para buscar surebets por período
 * @param {string} period - Período (7d, 30d, 90d, all)
 * @returns {Promise<Array>} Lista de surebets do período
 */
async function fetchSurebetsByPeriod(period) {
  const filters = {};

  if (period !== "all") {
    const days = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    filters.startDate = cutoffDate.toISOString();
  }

  return await fetchSurebets(filters);
}

/**
 * Função para buscar top bookmakers por critério
 * @param {string} criteria - Critério (frequency, profit, roi)
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Top bookmakers
 */
async function fetchTopBookmakers(criteria = "frequency", limit = 10) {
  const filters = {
    sortBy: criteria,
    limit: limit,
  };

  return await fetchBookmakerRanking(filters);
}

// Exportar exemplo para referência

/**
 * Dados de exemplo para demonstração
 * @returns {Array} Lista de surebets de exemplo
 */
function getExampleData() {
  return [
    {
      id: "surebet_2024_001",
      bookmaker1: "Bet365",
      bookmaker2: "William Hill",
      sport: "Futebol",
      event: "Brasil vs Argentina",
      market: "Resultado Final",
      selection1: "Brasil",
      selection2: "Empate",
      selection3: "Argentina",
      odds1: 2.1,
      odds2: 3.4,
      odds3: 3.8,
      profit: 15.5,
      roi: 3.2,
      stake: 100,
      createdAt: "2024-01-15T10:00:00Z",
      expiresAt: "2024-01-15T22:00:00Z",
      status: "active",
      tags: ["futebol", "brasileirao", "alta-liquidez"],
    },
    {
      id: "surebet_2024_002",
      bookmaker1: "Bet365",
      bookmaker2: "Unibet",
      sport: "Futebol",
      event: "Manchester United vs Liverpool",
      market: "Resultado Final",
      selection1: "Manchester United",
      selection2: "Empate",
      selection3: "Liverpool",
      odds1: 2.8,
      odds2: 3.2,
      odds3: 2.6,
      profit: 12.8,
      roi: 2.8,
      stake: 100,
      createdAt: "2024-01-14T15:30:00Z",
      expiresAt: "2024-01-14T21:00:00Z",
      status: "active",
      tags: ["futebol", "premier-league", "alta-liquidez"],
    },
    {
      id: "surebet_2024_003",
      bookmaker1: "William Hill",
      bookmaker2: "Betfair",
      sport: "Futebol",
      event: "Real Madrid vs Barcelona",
      market: "Resultado Final",
      selection1: "Real Madrid",
      selection2: "Empate",
      selection3: "Barcelona",
      odds1: 2.4,
      odds2: 3.5,
      odds3: 2.9,
      profit: 18.2,
      roi: 4.1,
      stake: 100,
      createdAt: "2024-01-13T09:15:00Z",
      expiresAt: "2024-01-13T20:00:00Z",
      status: "active",
      tags: ["futebol", "la-liga", "alta-liquidez"],
    },
    {
      id: "surebet_2024_004",
      bookmaker1: "Betfair",
      bookmaker2: "Unibet",
      sport: "Futebol",
      event: "Bayern Munich vs Borussia Dortmund",
      market: "Resultado Final",
      selection1: "Bayern Munich",
      selection2: "Empate",
      selection3: "Borussia Dortmund",
      odds1: 1.9,
      odds2: 3.8,
      odds3: 3.6,
      profit: 22.1,
      roi: 4.8,
      stake: 100,
      createdAt: "2024-01-12T14:20:00Z",
      expiresAt: "2024-01-12T19:00:00Z",
      status: "active",
      tags: ["futebol", "bundesliga", "alta-liquidez"],
    },
    {
      id: "surebet_2024_005",
      bookmaker1: "Bet365",
      bookmaker2: "Betfair",
      sport: "Futebol",
      event: "PSG vs Marseille",
      market: "Resultado Final",
      selection1: "PSG",
      selection2: "Empate",
      selection3: "Marseille",
      odds1: 1.7,
      odds2: 4.2,
      odds3: 4.5,
      profit: 16.75,
      roi: 3.5,
      stake: 100,
      createdAt: "2024-01-11T09:45:00Z",
      expiresAt: "2024-01-11T18:00:00Z",
      status: "active",
      tags: ["futebol", "ligue-1", "alta-liquidez"],
    },
    {
      id: "surebet_2024_006",
      bookmaker1: "William Hill",
      bookmaker2: "Unibet",
      sport: "Futebol",
      event: "Juventus vs Inter",
      market: "Resultado Final",
      selection1: "Juventus",
      selection2: "Empate",
      selection3: "Inter",
      odds1: 2.6,
      odds2: 3.3,
      odds3: 2.7,
      profit: 14.3,
      roi: 3.8,
      stake: 100,
      createdAt: "2024-01-10T16:00:00Z",
      expiresAt: "2024-01-10T21:30:00Z",
      status: "active",
      tags: ["futebol", "serie-a", "alta-liquidez"],
    },
    {
      id: "surebet_2024_007",
      bookmaker1: "Betfair",
      bookmaker2: "Bet365",
      sport: "Futebol",
      event: "Ajax vs PSV",
      market: "Resultado Final",
      selection1: "Ajax",
      selection2: "Empate",
      selection3: "PSV",
      odds1: 2.2,
      odds2: 3.6,
      odds3: 3.1,
      profit: 19.8,
      roi: 4.3,
      stake: 100,
      createdAt: "2024-01-09T11:30:00Z",
      expiresAt: "2024-01-09T20:00:00Z",
      status: "active",
      tags: ["futebol", "eredivisie", "alta-liquidez"],
    },
    {
      id: "surebet_2024_008",
      bookmaker1: "Unibet",
      bookmaker2: "William Hill",
      sport: "Futebol",
      event: "Porto vs Benfica",
      market: "Resultado Final",
      selection1: "Porto",
      selection2: "Empate",
      selection3: "Benfica",
      odds1: 2.5,
      odds2: 3.4,
      odds3: 2.8,
      profit: 13.9,
      roi: 3.1,
      stake: 100,
      createdAt: "2024-01-08T13:45:00Z",
      expiresAt: "2024-01-08T22:00:00Z",
      status: "active",
      tags: ["futebol", "primeira-liga", "alta-liquidez"],
    },
  ];
}

/**
 * Processar dados da API real (nova estrutura)
 * @param {Object} apiData - Dados brutos da API
 * @returns {Array} Lista de surebets processados
 */
function processRealAPIData(apiData) {
  const processedSurebets = [];
  const processedIds = new Set();

  // Iterar sobre cada surebet_id na resposta da API
  Object.entries(apiData).forEach(([surebetId, surebetParts]) => {
    // Verificar se já processamos este surebet_id
    if (processedIds.has(surebetId)) {
      console.log(`⚠️ Surebet ID duplicado ignorado: ${surebetId}`);
      return;
    }

    // Marcar como processado
    processedIds.add(surebetId);

    // Processar cada parte do surebet
    if (Array.isArray(surebetParts) && surebetParts.length >= 2) {
      // Agrupar todas as partes em uma única surebet
      const houses = [];
      const odds = [];
      const markets = [];
      let firstPart = null;

      surebetParts.forEach((part, index) => {
        try {
          // Extrair informações da parte (nova estrutura)
          const {
            house,
            chance, // Nova estrutura usa 'chance' em vez de 'odds'
            profit,
            timestamp,
            sport,
            match, // Nova estrutura usa 'match' em vez de 'event'
            market,
            tournament,
            titulo,
            minutes,
            period,
            date,
            hour,
            url_redirect,
            redirect_id
          } = part;

          // Coletar casas de aposta
          if (house && !houses.includes(house)) {
            houses.push(house);
          }

          // Coletar odds (chances)
          if (chance) {
            odds.push(parseFloat(chance));
          }

          // Coletar mercados
          if (market && !markets.includes(market)) {
            markets.push(market);
          }

          // Usar a primeira parte como base
          if (index === 0) {
            firstPart = {
              house,
              chance,
              profit,
              timestamp,
              sport,
              match,
              market,
              tournament,
              titulo,
              minutes,
              period,
              date,
              hour,
              url_redirect,
              redirect_id
            };
          }
        } catch (partError) {
          console.error(
            `Erro ao processar parte ${index + 1} do surebet ${surebetId}:`,
            partError
          );
        }
      });

      // Criar uma única surebet com todas as casas
      if (firstPart) {
        const translatedTournament = translateTournament(
          firstPart.tournament,
          firstPart.sport
        );

        // Calcular ROI baseado no profit
        const roi = firstPart.profit ? (parseFloat(firstPart.profit) / 100) * 100 : 0;

        const processedSurebet = {
          id: surebetId,
          surebet_id: surebetId,
          bookmaker1: houses[0] || "", // Primeira casa
          bookmaker2: houses[1] || "", // Segunda casa (se houver)
          bookmaker3: houses[2] || "", // Terceira casa (se houver)
          allBookmakers: houses, // Todas as casas para busca
          sport: firstPart.sport || "Futebol",
          event: firstPart.match || "Evento não especificado",
          market: markets.join(" vs ") || "Mercado não especificado",
          tournament: translatedTournament,
          originalTournament: firstPart.tournament,
          selection1: markets[0] || "",
          selection2: markets[1] || "",
          selection3: markets[2] || "",
          odds1: odds[0] || 0,
          odds2: odds[1] || 0,
          odds3: odds[2] || 0,
          profit: parseFloat(firstPart.profit) || 0,
          roi: roi,
          stake: 100, // Valor padrão
          createdAt: firstPart.timestamp
            ? new Date(firstPart.timestamp).toISOString()
            : new Date().toISOString(),
          expiresAt: firstPart.timestamp
            ? new Date(
                new Date(firstPart.timestamp).getTime() + 24 * 60 * 60 * 1000
              ).toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          tags: [firstPart.sport?.toLowerCase() || "futebol", "api-real"],
          // Campos adicionais da nova API
          minutes: firstPart.minutes || 0,
          period: firstPart.period || "",
          date: firstPart.date || "",
          hour: firstPart.hour || "",
          url_redirect: firstPart.url_redirect || "",
          redirect_id: firstPart.redirect_id || ""
        };

        processedSurebets.push(processedSurebet);
      }
    } else {
      console.warn(`Formato inválido para surebet ${surebetId}:`, surebetParts);
    }
  });

  console.log(
    `🎯 Processados ${processedSurebets.length} surebets únicos de ${processedIds.size} IDs únicos`
  );
  return processedSurebets;
}

// Funções de banco de dados local (IndexedDB)
let db = null;

/**
 * Inicializar banco de dados local
 */
async function initLocalDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SurebetsDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Criar store para surebets
      if (!db.objectStoreNames.contains("surebets")) {
        const surebetsStore = db.createObjectStore("surebets", {
          keyPath: "id",
        });
        surebetsStore.createIndex("createdAt", "createdAt", { unique: false });
        surebetsStore.createIndex("bookmaker1", "bookmaker1", {
          unique: false,
        });
        surebetsStore.createIndex("bookmaker2", "bookmaker2", {
          unique: false,
        });
      }

      // Criar store para estatísticas
      if (!db.objectStoreNames.contains("stats")) {
        const statsStore = db.createObjectStore("stats", { keyPath: "id" });
        statsStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

/**
 * Salvar surebets no banco local
 */
async function saveToLocalDatabase(surebets, filters = {}) {
  if (!db) await initLocalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["surebets"], "readwrite");
    const store = transaction.objectStore("surebets");

    // Limpar dados antigos
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      // Inserir novos dados
      let completed = 0;
      let errors = 0;

      surebets.forEach((surebet) => {
        const request = store.add(surebet);

        request.onsuccess = () => {
          completed++;
          if (completed + errors === surebets.length) {
            resolve();
          }
        };

        request.onerror = () => {
          errors++;
          console.error("Erro ao salvar surebet:", surebet.id);
          if (completed + errors === surebets.length) {
            resolve();
          }
        };
      });
    };

    clearRequest.onerror = () => reject(clearRequest.error);
  });
}

/**
 * Carregar surebets do banco local
 */
async function loadFromLocalDatabase(filters = {}) {
  if (!db) await initLocalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["surebets"], "readonly");
    const store = transaction.objectStore("surebets");
    const request = store.getAll();

    request.onsuccess = () => {
      let surebets = request.result;

      // Aplicar filtros
      if (filters.period && filters.period !== "all") {
        const days = parseInt(filters.period);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        surebets = surebets.filter(
          (surebet) => new Date(surebet.createdAt) >= cutoffDate
        );
      }

      // Aplicar ordenação
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "createdAt":
            surebets.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          case "profit":
            surebets.sort((a, b) => b.profit - a.profit);
            break;
          case "roi":
            surebets.sort((a, b) => b.roi - a.roi);
            break;
        }
      }

      resolve(surebets);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Salvar estatísticas no banco local
 */
async function saveStatsToLocalDatabase(stats) {
  if (!db) await initLocalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["stats"], "readwrite");
    const store = transaction.objectStore("stats");

    const statsData = {
      id: "current_stats",
      data: stats,
      timestamp: Date.now(),
    };

    const request = store.put(statsData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Carregar estatísticas do banco local
 */
async function loadStatsFromLocalDatabase() {
  if (!db) await initLocalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["stats"], "readonly");
    const store = transaction.objectStore("stats");
    const request = store.get("current_stats");

    request.onsuccess = () => {
      const result = request.result;
      if (result && Date.now() - result.timestamp < 5 * 60 * 1000) {
        resolve(result.data);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Limpar completamente o banco de dados local
 */
async function clearLocalDatabase() {
  if (!db) await initLocalDatabase();

  return new Promise((resolve, reject) => {
    try {
      // Limpar store de surebets
      const surebetsTransaction = db.transaction(["surebets"], "readwrite");
      const surebetsStore = surebetsTransaction.objectStore("surebets");
      const surebetsRequest = surebetsStore.clear();

      surebetsRequest.onsuccess = () => {
        console.log("🗄️ Store de surebets limpo");

        // Limpar store de estatísticas
        const statsTransaction = db.transaction(["stats"], "readwrite");
        const statsStore = statsTransaction.objectStore("stats");
        const statsRequest = statsStore.clear();

        statsRequest.onsuccess = () => {
          console.log("🗄️ Store de estatísticas limpo");
          resolve();
        };

        statsRequest.onerror = () => {
          console.error("❌ Erro ao limpar estatísticas:", statsRequest.error);
          reject(statsRequest.error);
        };
      };

      surebetsRequest.onerror = () => {
        console.error("❌ Erro ao limpar surebets:", surebetsRequest.error);
        reject(surebetsRequest.error);
      };
    } catch (error) {
      console.error("❌ Erro ao limpar banco:", error);
      reject(error);
    }
  });
}

// Exportar funções individuais
export {
  fetchSurebets,
  fetchBookmakerStats,
  fetchBookmakerRanking,
  fetchTemporalData,
  checkSurebetExists,
  createSurebet,
  updateSurebet,
  deleteSurebet,
  fetchSurebetsByPeriod,
  fetchTopBookmakers,
  surebetExample,
  // Funções de banco local
  initLocalDatabase,
  saveToLocalDatabase,
  loadFromLocalDatabase,
  saveStatsToLocalDatabase,
  loadStatsFromLocalDatabase,
  clearLocalDatabase,
};
