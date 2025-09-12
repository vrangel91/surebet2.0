const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Order, User, UserVIP, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// Middleware para verificar se é admin
router.use(authenticateToken);
router.use(requireAdmin);

// Buscar todos os pagamentos com informações do usuário
router.get('/payments', async (req, res) => {
  try {
    console.log('🔍 [Admin] Buscando pagamentos...');
    
    const payments = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100 // Limitar para performance
    });

    console.log(`📊 [Admin] Encontrados ${payments.length} pagamentos`);

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      user_id: payment.user_id,
      user_name: payment.user ? 
        `${payment.user.first_name || ''} ${payment.user.last_name || ''}`.trim() || 
        payment.user.username || 
        'Usuário' : 'Usuário',
      user_email: payment.user?.email || '',
      plan_id: payment.plan_id,
      amount: payment.amount,
      status: payment.status,
      payment_method: payment.payment_method,
      payment_id: payment.payment_data?.id || payment.payment_data?.payment_id || '',
      description: payment.plan_name || '',
      created_at: payment.created_at,
      expires_at: null // Order não tem campo expires_at, será calculado baseado no VIP
    }));

    res.json({
      success: true,
      payments: formattedPayments
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar pagamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Aprovar pagamento
router.patch('/payments/:id/approve', async (req, res) => {
  try {
    const paymentId = req.params.id;
    console.log(`✅ [Admin] Aprovando pagamento ${paymentId}...`);

    const payment = await Order.findByPk(paymentId, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Pagamento já foi processado'
      });
    }

    // Atualizar status do pagamento
    await payment.update({
      status: 'approved',
      approved_at: new Date(),
      approved_by: req.user.id
    });

    // Ativar VIP do usuário
    const { PaymentService } = require('../services/paymentService');
    const paymentService = new PaymentService();
    
    await paymentService.activateVIP(
      payment.user_id,
      payment.plan_id,
      payment.id
    );

    console.log(`✅ [Admin] Pagamento ${paymentId} aprovado e VIP ativado`);

    res.json({
      success: true,
      message: 'Pagamento aprovado com sucesso'
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao aprovar pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rejeitar pagamento
router.patch('/payments/:id/reject', async (req, res) => {
  try {
    const paymentId = req.params.id;
    console.log(`❌ [Admin] Rejeitando pagamento ${paymentId}...`);

    const payment = await Order.findByPk(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Pagamento já foi processado'
      });
    }

    // Atualizar status do pagamento
    await payment.update({
      status: 'rejected',
      rejected_at: new Date(),
      rejected_by: req.user.id
    });

    console.log(`❌ [Admin] Pagamento ${paymentId} rejeitado`);

    res.json({
      success: true,
      message: 'Pagamento rejeitado com sucesso'
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao rejeitar pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar estatísticas de pagamentos
router.get('/payments/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Buscando estatísticas de pagamentos...');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPayments,
      todayPayments,
      weekPayments,
      monthPayments,
      approvedPayments,
      pendingPayments,
      rejectedPayments
    ] = await Promise.all([
      Order.count(),
      Order.count({ where: { created_at: { [Op.gte]: startOfDay } } }),
      Order.count({ where: { created_at: { [Op.gte]: startOfWeek } } }),
      Order.count({ where: { created_at: { [Op.gte]: startOfMonth } } }),
      Order.count({ where: { status: 'approved' } }),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'rejected' } })
    ]);

    const totalRevenue = await Order.sum('amount', {
      where: { status: 'approved' }
    });

    const todayRevenue = await Order.sum('amount', {
      where: {
        status: 'approved',
        created_at: { [Op.gte]: startOfDay }
      }
    });

    const weekRevenue = await Order.sum('amount', {
      where: {
        status: 'approved',
        created_at: { [Op.gte]: startOfWeek }
      }
    });

    const monthRevenue = await Order.sum('amount', {
      where: {
        status: 'approved',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    res.json({
      success: true,
      stats: {
        totalPayments,
        todayPayments,
        weekPayments,
        monthPayments,
        approvedPayments,
        pendingPayments,
        rejectedPayments,
        totalRevenue: totalRevenue || 0,
        todayRevenue: todayRevenue || 0,
        weekRevenue: weekRevenue || 0,
        monthRevenue: monthRevenue || 0
      }
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ===== ROTAS DE NOTIFICAÇÕES =====

// Obter estatísticas de notificações
router.get('/notifications/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Buscando estatísticas de notificações...');
    
    const total = await Notification.count();
    const unread = await Notification.count({
      where: { is_read: false }
    });
    const dismissed = await Notification.count({
      where: { is_dismissed: true }
    });
    
    // Estatísticas por tipo
    const byType = await Notification.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    
    // Estatísticas por público-alvo
    const byAudience = await Notification.findAll({
      attributes: [
        'target_audience',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['target_audience'],
      raw: true
    });
    
    const stats = {
      total,
      unread,
      dismissed,
      byType: byType.map(item => ({
        type: item.type,
        count: parseInt(item.count)
      })),
      byAudience: byAudience.map(item => ({
        audience: item.target_audience,
        count: parseInt(item.count)
      }))
    };
    
    console.log('✅ [Admin] Estatísticas de notificações:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar estatísticas de notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter lista de notificações
router.get('/notifications', async (req, res) => {
  try {
    console.log('📋 [Admin] Buscando notificações...');
    
    const { page = 1, limit = 20, type, priority, target_audience } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (type) whereClause.type = type;
    if (priority) whereClause.priority = priority;
    if (target_audience) whereClause.target_audience = target_audience;
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    };
    
    console.log(`✅ [Admin] Encontradas ${notifications.length} notificações`);
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Enviar notificação
router.post('/send-notification', async (req, res) => {
  try {
    console.log('📤 [Admin] Enviando notificação...');
    console.log('📋 [Admin] Dados recebidos:', req.body);
    
    const {
      title,
      message,
      type = 'info',
      priority = 'normal',
      target_audience = 'all',
      expires_at,
      metadata = {}
    } = req.body;
    
    // Validar dados obrigatórios
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Título e mensagem são obrigatórios'
      });
    }
    
    // Criar notificação
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      target_audience,
      expires_at: expires_at ? new Date(expires_at) : null,
      metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
      is_read: false,
      is_dismissed: false,
      created_by: req.user.id // ID do usuário admin que está criando a notificação
    });
    
    console.log('✅ [Admin] Notificação criada:', notification.id);
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao enviar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar notificação
router.delete('/notifications/:id', async (req, res) => {
  try {
    console.log('🗑️ [Admin] Deletando notificação:', req.params.id);
    
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }
    
    await notification.destroy();
    
    console.log('✅ [Admin] Notificação deletada');
    
    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;