const express = require('express');
const VIPService = require('../utils/vipService');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { UserVIP, User } = require('../models');
const { Op } = require('sequelize');
const vipCronJobs = require('../utils/vipCronJobs');
const VIPReports = require('../utils/vipReports');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS VIP =====

// 1. Ativar VIP para usuário
router.post('/activate', async (req, res) => {
  try {
    const {
      userId,
      planId,
      planName,
      planDays,
      orderId,
      paymentMethod,
      amount,
      autoRenew,
      notes
    } = req.body;

    // Validações básicas
    if (!userId || !planId || !planName || !planDays) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios não fornecidos: userId, planId, planName, planDays' 
      });
    }

    const planData = {
      plan_id: planId,
      plan_name: planName,
      plan_days: parseInt(planDays),
      order_id: orderId,
      payment_method: paymentMethod,
      amount: amount ? parseFloat(amount) : null,
      auto_renew: autoRenew || false,
      notes: notes
    };

    const result = await VIPService.activateVIP(userId, planData);

    res.status(201).json(result);

  } catch (error) {
    console.error('Erro ao ativar VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 2. Verificar status VIP do usuário
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const result = await VIPService.checkVIPStatus(userId);

    res.json(result);

  } catch (error) {
    console.error('Erro ao verificar status VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 3. Verificar status VIP do usuário atual
router.get('/my-status', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await VIPService.checkVIPStatus(userId);

    res.json(result);

  } catch (error) {
    console.error('Erro ao verificar status VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 4. Renovar VIP
router.post('/renew/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      planId,
      planName,
      planDays,
      orderId,
      paymentMethod,
      amount,
      autoRenew,
      notes
    } = req.body;

    if (!planId || !planName || !planDays) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios não fornecidos: planId, planName, planDays' 
      });
    }

    const planData = {
      plan_id: planId,
      plan_name: planName,
      plan_days: parseInt(planDays),
      order_id: orderId,
      payment_method: paymentMethod,
      amount: amount ? parseFloat(amount) : null,
      auto_renew: autoRenew || false,
      notes: notes
    };

    const result = await VIPService.renewVIP(userId, planData);

    res.json(result);

  } catch (error) {
    console.error('Erro ao renovar VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 5. Cancelar VIP (admin only)
router.patch('/cancel/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const result = await VIPService.cancelVIP(userId, reason);

    res.json(result);

  } catch (error) {
    console.error('Erro ao cancelar VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 6. Listar histórico VIP do usuário atual
router.get('/my-history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await VIPService.getVIPHistory(userId, parseInt(page), parseInt(limit));

    res.json(result);

  } catch (error) {
    console.error('Erro ao listar histórico VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 7. Listar histórico completo de todos os VIPs (admin)
router.get('/history/all', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Carregando histórico VIP completo...');
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Consulta direta sem usar o serviço que espera userId
    const { count, rows } = await UserVIP.findAndCountAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const vipHistory = rows.map(vip => ({
      id: vip.id,
      userId: vip.user_id,
      user: vip.user ? {
        id: vip.user.id,
        first_name: vip.user.first_name,
        last_name: vip.user.last_name,
        email: vip.user.email
      } : null,
      planId: vip.plan_id,
      planName: vip.plan_name,
      planDays: vip.plan_days,
      dataInicio: vip.data_inicio,
      dataFim: vip.data_fim,
      status: vip.status,
      amount: vip.amount,
      paymentMethod: vip.payment_method,
      createdAt: vip.created_at
    }));

    console.log(`✅ Histórico carregado: ${vipHistory.length} registros`);

    res.json({
      success: true,
      vipHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar histórico completo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 8. Listar histórico VIP do usuário
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await VIPService.getVIPHistory(userId, parseInt(page), parseInt(limit));

    res.json(result);

  } catch (error) {
    console.error('Erro ao listar histórico VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 8. Verificar e processar VIPs expirados (admin only)
router.post('/process-expired', requireAdmin, async (req, res) => {
  try {
    const result = await VIPService.processExpiredVIPs();

    res.json(result);

  } catch (error) {
    console.error('Erro ao processar VIPs expirados:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 9. Estatísticas VIP (admin only)
router.get('/statistics', requireAdmin, async (req, res) => {
  try {
    const result = await VIPService.getVIPStatistics();

    res.json(result);

  } catch (error) {
    console.error('Erro ao obter estatísticas VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 10. Migrar dados da tabela antiga (admin only)
router.post('/migrate', requireAdmin, async (req, res) => {
  try {
    const result = await VIPService.migrateFromOldTable();

    res.json(result);

  } catch (error) {
    console.error('Erro na migração:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 11. Enviar notificação de expiração (admin only)
router.post('/notify-expiration/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await VIPService.sendExpirationNotification(userId);

    res.json(result);

  } catch (error) {
    console.error('Erro ao enviar notificação de expiração:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 12. Listar todos os VIPs ativos (admin only)
router.get('/active', requireAdmin, async (req, res) => {
  try {
    const { UserVIP, User } = require('../models');
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await UserVIP.findAndCountAll({
      where: { status: 'ativo' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }],
      order: [['data_fim', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    const activeVIPs = rows.map(vip => ({
      id: vip.id,
      userId: vip.user_id,
      user: vip.user ? {
        id: vip.user.id,
        first_name: vip.user.first_name,
        last_name: vip.user.last_name,
        email: vip.user.email
      } : null,
      planId: vip.plan_id,
      planName: vip.plan_name,
      planDays: vip.plan_days,
      dataInicio: vip.data_inicio,
      dataFim: vip.data_fim,
      amount: vip.amount,
      daysRemaining: vip.daysRemaining(),
      isExpired: vip.isExpired(),
      status: vip.status,
      autoRenew: vip.auto_renew,
      createdAt: vip.created_at
    }));

    res.json({
      success: true,
      activeVIPs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao listar VIPs ativos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 13. Listar VIPs que expiram em breve (admin only)
router.get('/expiring-soon', requireAdmin, async (req, res) => {
  try {
    const { UserVIP, User } = require('../models');
    const { days = 7 } = req.query;

    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + parseInt(days));

    const { Op } = require('sequelize');
    const expiringVIPs = await UserVIP.findAll({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.between]: [new Date(), expiringDate]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }],
      order: [['data_fim', 'ASC']]
    });

    const result = expiringVIPs.map(vip => ({
      id: vip.id,
      userId: vip.user_id,
      user: vip.user ? {
        id: vip.user.id,
        first_name: vip.user.first_name,
        last_name: vip.user.last_name,
        email: vip.user.email
      } : null,
      planId: vip.plan_id,
      planName: vip.plan_name,
      dataFim: vip.data_fim,
      daysRemaining: vip.daysRemaining(),
      expiresIn: Math.ceil((vip.data_fim - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      expiringVIPs: result,
      count: result.length,
      daysChecked: parseInt(days)
    });

  } catch (error) {
    console.error('Erro ao listar VIPs que expiram em breve:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// ===== ROTAS DE CRON JOBS (ADMIN ONLY) =====

// 14. Inicializar cron jobs VIP
router.post('/cron/initialize', requireAdmin, async (req, res) => {
  try {
    const result = await vipCronJobs.initialize();
    res.json(result);
  } catch (error) {
    console.error('Erro ao inicializar cron jobs:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 15. Parar cron jobs VIP
router.post('/cron/stop', requireAdmin, async (req, res) => {
  try {
    const result = await vipCronJobs.stop();
    res.json(result);
  } catch (error) {
    console.error('Erro ao parar cron jobs:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 16. Verificar status dos cron jobs
router.get('/cron/status', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Verificando status dos cron jobs...');
    const status = await vipCronJobs.getStatus();
    console.log('✅ Status dos cron jobs:', status);
    res.json({ success: true, status });
  } catch (error) {
    console.error('❌ Erro ao verificar status dos cron jobs:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 17. Processar VIPs expirados manualmente
router.post('/cron/process-expired', requireAdmin, async (req, res) => {
  try {
    const result = await vipCronJobs.processExpiredVIPs();
    res.json(result);
  } catch (error) {
    console.error('Erro ao processar VIPs expirados:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 18. Gerar relatório semanal
router.post('/cron/weekly-report', requireAdmin, async (req, res) => {
  try {
    const result = await vipCronJobs.generateWeeklyReport();
    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// ===== ROTAS DE RELATÓRIOS (ADMIN ONLY) =====

// 19. Relatório de receita
router.get('/reports/revenue', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await VIPReports.generateRevenueReport(startDate, endDate);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Erro ao gerar relatório de receita:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 20. Relatório de conversão
router.get('/reports/conversion', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await VIPReports.generateConversionReport(startDate, endDate);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Erro ao gerar relatório de conversão:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 21. Relatório de retenção
router.get('/reports/retention', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await VIPReports.generateRetentionReport(startDate, endDate);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Erro ao gerar relatório de retenção:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 22. Relatório por planos
router.get('/reports/plans', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await VIPReports.generatePlansReport(startDate, endDate);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Erro ao gerar relatório por planos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
