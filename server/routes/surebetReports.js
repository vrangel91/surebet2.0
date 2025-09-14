const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utils/auth");
const { BookmakerAccount } = require("../models");

// GET /api/surebet-reports - Listar relatórios de surebets
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Por enquanto, retornar dados mockados
    // Em produção, isso viria do banco de dados
    const mockReports = [
      {
        id: 1,
        surebet: [
          {
            house: "Superbet",
            market: "Resultado Final",
            chance: 4.6,
            match: "Flamengo vs Palmeiras",
          },
          {
            house: "Vbet",
            market: "Resultado Final",
            chance: 1.25,
            match: "Flamengo vs Palmeiras",
          },
        ],
        stakes: [340.0, 1160.0],
        totalInvestment: 1500.0,
        expectedProfit: 64.0,
        actualProfit: null,
        timestamp: new Date().toISOString(),
        status: "pending",
        results: [],
      },
    ];

    res.json({
      success: true,
      data: mockReports,
      message: "Relatórios carregados com sucesso",
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Não foi possível carregar os relatórios",
    });
  }
});

// POST /api/surebet-reports - Criar novo relatório
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { surebet, stakes, totalInvestment, expectedProfit, results } =
      req.body;

    // Validar dados obrigatórios
    if (!surebet || !stakes || !totalInvestment || !expectedProfit) {
      return res.status(400).json({
        success: false,
        error: "Dados obrigatórios não fornecidos",
        message:
          "surebet, stakes, totalInvestment e expectedProfit são obrigatórios",
      });
    }

    // Criar relatório (mockado por enquanto)
    const newReport = {
      id: Date.now(), // ID temporário
      surebet,
      stakes,
      totalInvestment,
      expectedProfit,
      actualProfit: null,
      timestamp: new Date().toISOString(),
      status: "pending",
      results: results || [],
    };

    console.log("✅ Novo relatório de surebet criado:", newReport);

    res.json({
      success: true,
      data: newReport,
      message: "Relatório criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar relatório:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Não foi possível criar o relatório",
    });
  }
});

// PUT /api/surebet-reports/:id/confirm-result - Confirmar resultado
router.put("/:id/confirm-result", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { results, actualProfit, status, surebet, stakes } = req.body;

    // Validar dados
    if (!results || typeof actualProfit !== "number") {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        message: "results e actualProfit são obrigatórios",
      });
    }

    console.log(`✅ Resultado confirmado para relatório ${id}:`, {
      results,
      actualProfit,
      status,
      surebet,
      stakes,
    });

    // Processar ajustes de saldo baseados nos resultados
    const balanceAdjustments = [];

    if (surebet && stakes && results) {
      for (let i = 0; i < surebet.length; i++) {
        const bet = surebet[i];
        const stake = stakes[i];
        const result = results[i];

        if (result === "win") {
          // Calcular retorno: stake * odd
          const returnAmount = stake * parseFloat(bet.chance);
          const profit = returnAmount - stake;

          balanceAdjustments.push({
            house: bet.house,
            stake: stake,
            returnAmount: returnAmount,
            profit: profit,
            result: "win",
          });
        } else if (result === "loss") {
          // Apenas manter o débito já registrado
          balanceAdjustments.push({
            house: bet.house,
            stake: stake,
            returnAmount: 0,
            profit: -stake,
            result: "loss",
          });
        }
      }
    }

    // Simular confirmação de resultado
    console.log("💰 Ajustes de saldo calculados:", balanceAdjustments);

    // Em produção, aqui você:
    // 1. Atualizaria o relatório no banco de dados
    // 2. Processaria os ajustes de saldo nas contas correspondentes
    // 3. Registraria o histórico de transações

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        status: "completed",
        actualProfit,
        results,
        balanceAdjustments,
        confirmedAt: new Date().toISOString(),
      },
      message: "Resultado confirmado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao confirmar resultado:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Não foi possível confirmar o resultado",
    });
  }
});

// PUT /api/surebet-reports/:id/cancel - Cancelar relatório
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Simular cancelamento
    console.log(`❌ Relatório ${id} cancelado`);

    // Em produção, aqui você atualizaria o status no banco de dados
    // e possivelmente reverteria os débitos de saldo

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      },
      message: "Relatório cancelado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar relatório:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Não foi possível cancelar o relatório",
    });
  }
});

// GET /api/surebet-reports/:id - Obter relatório específico
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Simular busca de relatório específico
    console.log(`🔍 Buscando relatório ${id}`);

    // Em produção, aqui você buscaria no banco de dados
    const mockReport = {
      id: parseInt(id),
      surebet: [
        {
          house: "Superbet",
          market: "Resultado Final",
          chance: 4.6,
          match: "Flamengo vs Palmeiras",
        },
      ],
      stakes: [340.0],
      totalInvestment: 340.0,
      expectedProfit: 64.0,
      actualProfit: null,
      timestamp: new Date().toISOString(),
      status: "pending",
      results: [],
    };

    res.json({
      success: true,
      data: mockReport,
      message: "Relatório encontrado",
    });
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Não foi possível buscar o relatório",
    });
  }
});

module.exports = router;
