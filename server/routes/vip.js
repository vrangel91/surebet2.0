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
    // console.log('🔍 [VIP] Rota de ativação VIP chamada')
    // console.log('🔍 [VIP] Request body:', req.body)
    // console.log('🔍 [VIP] Request headers:', req.headers)
    // console.log('🔍 [VIP] User from token:', req.user)
    
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
      console.log('❌ [VIP] Dados obrigatórios ausentes:', { userId: !!userId, planId: !!planId, planName: !!planName, planDays: !!planDays })
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
    // console.log('🔍 [VIP] Rota de status VIP chamada')
    // console.log('🔍 [VIP] Request headers:', req.headers)
    // console.log('🔍 [VIP] User from token:', req.user)
    
    const userId = req.user.id;
    // console.log('🔍 [VIP] User ID:', userId)

    // Resposta simplificada para teste
    const result = {
      success: true,
      hasVIP: req.user.is_vip || false,
      isVIP: req.user.is_vip || false, // Manter compatibilidade
      userId: userId,
      vipStatus: {
        hasVIP: req.user.is_vip || false,
        isVIP: req.user.is_vip || false,
        dataFim: req.user.vip_expires_at || null,
        planId: req.user.account_type || 'basic'
      },
      message: 'Status VIP verificado com sucesso'
    };
    
    console.log('🔍 [VIP] Resultado do status VIP:', result)

    res.json(result);

  } catch (error) {
    console.error('❌ [VIP] Erro ao verificar status VIP:', error);
    console.error('❌ [VIP] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 4. Renovar VIP
router.post('/renew/:userId', async (req, res) => {
  try {
    console.log('🔄 [VIP Renew] Iniciando renovação de VIP:', req.params.userId);
    console.log('📝 [VIP Renew] Dados recebidos:', req.body);
    
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

    console.log('🔍 [VIP Renew] Validação dos dados:', {
      planId: planId,
      planName: planName,
      planDays: planDays,
      hasPlanId: !!planId,
      hasPlanName: !!planName,
      hasPlanDays: !!planDays
    });

    if (!planId || !planName || !planDays) {
      console.log('❌ [VIP Renew] Dados obrigatórios não fornecidos:', {
        planId: planId,
        planName: planName,
        planDays: planDays
      });
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

    console.log('📤 [VIP Renew] Dados processados para o serviço:', planData);

    const result = await VIPService.renewVIP(userId, planData);

    console.log('✅ [VIP Renew] Renovação concluída:', result);

    res.json(result);

  } catch (error) {
    console.error('❌ [VIP Renew] Erro ao renovar VIP:', error);
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

// 6. Atualizar VIP (admin only)
router.put('/update/:id', requireAdmin, async (req, res) => {
  try {
    console.log('🔄 [VIP Update] Iniciando atualização de VIP:', req.params.id);
    console.log('📝 [VIP Update] Dados recebidos:', req.body);
    
    const { id } = req.params;
    const {
      planName,
      planDays,
      amount,
      autoRenew,
      notes
    } = req.body;

    // Validações básicas
    if (!planName || !planDays || planDays <= 0) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios não fornecidos: planName, planDays (deve ser > 0)' 
      });
    }

    // Buscar o VIP existente
    const existingVIP = await UserVIP.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }]
    });

    if (!existingVIP) {
      console.log('❌ [VIP Update] VIP não encontrado:', id);
      return res.status(404).json({ 
        error: 'VIP não encontrado' 
      });
    }

    console.log('✅ [VIP Update] VIP encontrado:', {
      id: existingVIP.id,
      userId: existingVIP.user_id,
      currentPlan: existingVIP.plan_name,
      currentDays: existingVIP.plan_days
    });

    // Calcular nova data de expiração baseada nos dias restantes
    const now = new Date();
    const currentExpiry = new Date(existingVIP.data_fim);
    const daysRemaining = Math.ceil((currentExpiry - now) / (1000 * 60 * 60 * 24));
    
    // Se o VIP já expirou, usar a data atual como base
    const baseDate = daysRemaining > 0 ? now : currentExpiry;
    const newExpiryDate = new Date(baseDate.getTime() + (parseInt(planDays) * 24 * 60 * 60 * 1000));

    // Atualizar o VIP
    const updateData = {
      plan_name: planName,
      plan_days: parseInt(planDays),
      amount: amount ? parseFloat(amount) : existingVIP.amount,
      auto_renew: autoRenew !== undefined ? autoRenew : existingVIP.auto_renew,
      notes: notes || existingVIP.notes,
      data_fim: newExpiryDate,
      updated_at: new Date()
    };

    await existingVIP.update(updateData);

    console.log('✅ [VIP Update] VIP atualizado com sucesso:', {
      id: existingVIP.id,
      newPlan: planName,
      newDays: planDays,
      newExpiry: newExpiryDate
    });

    // Buscar o VIP atualizado para retornar
    const updatedVIP = await UserVIP.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'first_name', 'last_name']
      }]
    });

    res.json({
      success: true,
      message: 'VIP atualizado com sucesso',
      vip: {
        id: updatedVIP.id,
        userId: updatedVIP.user_id,
        planName: updatedVIP.plan_name,
        planDays: updatedVIP.plan_days,
        amount: updatedVIP.amount,
        autoRenew: updatedVIP.auto_renew,
        notes: updatedVIP.notes,
        dataInicio: updatedVIP.data_inicio,
        dataFim: updatedVIP.data_fim,
        status: updatedVIP.status,
        user: updatedVIP.user
      }
    });

  } catch (error) {
    console.error('❌ [VIP Update] Erro ao atualizar VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 7. Listar histórico VIP do usuário atual
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

// 12. Listar todos os VIPs ativos (acesso liberado para todos os usuários logados)
router.get('/active', async (req, res) => {
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
      offset,
      distinct: true, // Otimização para evitar duplicatas
      subQuery: false // Otimização para consultas com includes
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
    const result = await vipCronJobs.processExpiredVIPsManual();
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
