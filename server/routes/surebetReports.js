const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utils/auth");
const { BookmakerAccount } = require("../models");

// Armazenamento temporário em memória para relatórios de surebets
// Em produção, isso seria substituído por um banco de dados
let surebetReports = [];

// Adicionar relatório de teste para desenvolvimento
const testReport = {
  id: 1758949198258,
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
};

// Adicionar relatório de teste se não existir
if (surebetReports.length === 0) {
  surebetReports.push(testReport);
  console.log('🧪 Relatório de teste adicionado:', testReport.id);
}

// GET /api/surebet-reports - Listar relatórios de surebets
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(`📊 Carregando ${surebetReports.length} relatórios de surebets`);
    console.log('🔍 [DEBUG] Relatórios disponíveis:', surebetReports.map(r => ({ id: r.id, status: r.status, timestamp: r.timestamp })));
    
    // Retornar relatórios armazenados em memória
    // Ordenar por timestamp (mais recentes primeiro)
    const sortedReports = surebetReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: sortedReports,
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

    // Criar novo relatório
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

    // Adicionar ao armazenamento em memória
    surebetReports.push(newReport);

    console.log("✅ Novo relatório de surebet criado:", newReport);
    console.log(`📊 Total de relatórios: ${surebetReports.length}`);

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

    console.log('🔍 [DEBUG] Confirmar resultado - ID:', id);
    console.log('🔍 [DEBUG] Dados recebidos:', { results, actualProfit, status, surebet, stakes });
    console.log('🔍 [DEBUG] Relatórios disponíveis:', surebetReports);

    // Validar dados
    if (!results || typeof actualProfit !== "number") {
      console.log('❌ [DEBUG] Validação falhou - results:', results, 'actualProfit:', actualProfit);
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        message: "results e actualProfit são obrigatórios",
      });
    }

    // Encontrar o relatório no armazenamento
    const reportIndex = surebetReports.findIndex(report => report.id === parseInt(id));
    console.log('🔍 [DEBUG] Índice do relatório encontrado:', reportIndex);
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Relatório não encontrado",
        message: "O relatório especificado não existe",
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
            action: "credit", // Adicionar saldo (ganhou a aposta)
            amount: returnAmount // Valor total a ser creditado
          });
        } else if (result === "loss") {
          // Para LOSS, não fazer nada - o débito já foi feito quando adicionou aos relatórios
          balanceAdjustments.push({
            house: bet.house,
            stake: stake,
            returnAmount: 0,
            profit: -stake,
            result: "loss",
            action: "none", // Não fazer nada - débito já foi feito
            amount: 0
          });
        }
      }
    }

    // Atualizar o relatório no armazenamento
    surebetReports[reportIndex] = {
      ...surebetReports[reportIndex],
      status: "completed",
      actualProfit,
      results,
      confirmedAt: new Date().toISOString(),
    };

    console.log("💰 Ajustes de saldo calculados:", balanceAdjustments);

    // Aplicar ajustes de saldo nas contas das casas de apostas
    const appliedAdjustments = [];
    
    for (const adjustment of balanceAdjustments) {
      if (adjustment.action === "credit") {
        try {
          // Buscar conta da casa de apostas
          const account = await BookmakerAccount.findOne({
            where: { name: adjustment.house, status: 'active' }
          });

          if (account) {
            // Adicionar saldo (crédito)
            const newBalance = parseFloat(account.balance) + adjustment.amount;
            
            await account.update({
              balance: newBalance
            });

            appliedAdjustments.push({
              house: adjustment.house,
              action: "credit",
              amount: adjustment.amount,
              oldBalance: parseFloat(account.balance),
              newBalance: newBalance,
              success: true
            });

            console.log(`✅ Saldo creditado em ${adjustment.house}: +${adjustment.amount} (Novo saldo: ${newBalance})`);
          } else {
            console.log(`❌ Conta não encontrada para ${adjustment.house}`);
            appliedAdjustments.push({
              house: adjustment.house,
              action: "credit",
              amount: adjustment.amount,
              success: false,
              error: "Conta não encontrada"
            });
          }
        } catch (error) {
          console.error(`❌ Erro ao creditar saldo em ${adjustment.house}:`, error);
          appliedAdjustments.push({
            house: adjustment.house,
            action: "credit",
            amount: adjustment.amount,
            success: false,
            error: error.message
          });
        }
      } else if (adjustment.action === "none") {
        // Para LOSS, apenas registrar que não foi feito nada
        appliedAdjustments.push({
          house: adjustment.house,
          action: "none",
          amount: 0,
          success: true,
          message: "Débito já foi feito anteriormente"
        });
        console.log(`ℹ️ Nenhum ajuste necessário para ${adjustment.house} (LOSS - débito já foi feito)`);
      }
    }

    console.log(`📊 Relatório ${id} atualizado para status: completed`);
    console.log("💰 Ajustes aplicados:", appliedAdjustments);

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        status: "completed",
        actualProfit,
        results,
        balanceAdjustments,
        appliedAdjustments,
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

    // Encontrar o relatório no armazenamento
    const reportIndex = surebetReports.findIndex(report => report.id === parseInt(id));
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Relatório não encontrado",
        message: "O relatório especificado não existe",
      });
    }

    // Atualizar o relatório no armazenamento
    surebetReports[reportIndex] = {
      ...surebetReports[reportIndex],
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    };

    console.log(`❌ Relatório ${id} cancelado`);
    console.log(`📊 Relatório ${id} atualizado para status: cancelled`);

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

    console.log(`🔍 Buscando relatório ${id}`);

    // Buscar relatório no armazenamento
    const report = surebetReports.find(report => report.id === parseInt(id));

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Relatório não encontrado",
        message: "O relatório especificado não existe",
      });
    }

    res.json({
      success: true,
      data: report,
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
