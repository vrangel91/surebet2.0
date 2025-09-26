const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Order, User, UserVIP, Notification, UserSession, Plan, sequelize } = require('../models');
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

// ===== ROTAS PWA =====

// Forçar atualização PWA para todos os usuários
router.post('/force-pwa-update', async (req, res) => {
  try {
    console.log('🔄 [Admin] Forçando atualização PWA...');
    console.log('📋 [Admin] Dados recebidos:', req.body);
    
    const { reason, timestamp, admin } = req.body;
    
    // Validar dados obrigatórios
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Motivo da atualização é obrigatório'
      });
    }
    
    // Criar notificação de atualização PWA
    const notification = await Notification.create({
      title: 'Atualização do Sistema',
      message: `Uma atualização do sistema foi forçada pelo administrador. Motivo: ${reason}`,
      type: 'update',
      priority: 'high',
      target_audience: 'all',
      metadata: {
        forceUpdate: true,
        timestamp: timestamp || new Date().toISOString(),
        admin: admin || 'Sistema',
        reason: reason
      },
      is_read: false,
      is_dismissed: false,
      created_by: req.user.id
    });
    
    console.log('✅ [Admin] Notificação de atualização PWA criada:', notification.id);
    
    // Aqui você pode adicionar lógica adicional para:
    // - Enviar push notifications
    // - Invalidar cache do service worker
    // - Registrar a ação no log de auditoria
    
    res.json({
      success: true,
      message: 'Atualização PWA forçada com sucesso',
      data: {
        notificationId: notification.id,
        timestamp: new Date().toISOString(),
        admin: admin || req.user.email
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao forçar atualização PWA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter estatísticas PWA
router.get('/pwa-stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Buscando estatísticas PWA...');
    
    // Contar usuários e notificações de atualização
    const [
      totalUsers,
      pwaNotifications
    ] = await Promise.all([
      User.count(),
      Notification.count({
        where: {
          type: 'update'
        }
      })
    ]);
    
    const stats = {
      totalUsers,
      pwaNotifications,
      lastUpdate: await Notification.findOne({
        where: { type: 'update' },
        order: [['created_at', 'DESC']],
        attributes: ['created_at', 'metadata']
      })
    };
    
    console.log('✅ [Admin] Estatísticas PWA:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar estatísticas PWA:', error);
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

// ===== ROTAS DE DASHBOARD =====

// Obter estatísticas gerais do dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Buscando estatísticas do dashboard...');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Estatísticas de usuários
    const [
      totalUsers,
      newUsersToday,
      activeUsersToday,
      planUsers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { created_at: { [Op.gte]: startOfDay } } }),
      UserSession.count({ 
        where: { 
          created_at: { [Op.gte]: startOfDay } 
        },
        distinct: true,
        col: 'user_id'
      }),
      UserVIP.count({ 
        where: { 
          status: 'ativo',
          data_fim: { [Op.gt]: new Date() }
        }
      })
    ]);

    // Estatísticas de receita
    const [
      monthlyRevenue,
      lastMonthRevenue,
      newPlansToday
    ] = await Promise.all([
      Order.sum('amount', {
        where: {
          status: 'approved',
          created_at: { [Op.gte]: startOfMonth }
        }
      }),
      Order.sum('amount', {
        where: {
          status: 'approved',
          created_at: { 
            [Op.gte]: startOfLastMonth,
            [Op.lte]: endOfLastMonth
          }
        }
      }),
      UserVIP.count({
        where: {
          created_at: { [Op.gte]: startOfDay }
        }
      })
    ]);

    // Calcular crescimento
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Usuários ativos (últimos 7 dias)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersLastWeek = await UserSession.count({
      where: {
        created_at: { [Op.gte]: sevenDaysAgo }
      },
      distinct: true,
      col: 'user_id'
    });

    const activeGrowth = totalUsers > 0 
      ? ((activeUsersToday / totalUsers) * 100).toFixed(1)
      : 0;

    const stats = {
      totalUsers,
      planUsers,
      monthlyRevenue: monthlyRevenue || 0,
      activeUsers: activeUsersToday,
      newUsersToday,
      newPlansToday,
      revenueGrowth: parseFloat(revenueGrowth),
      activeGrowth: parseFloat(activeGrowth)
    };

    console.log('✅ [Admin] Estatísticas do dashboard:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter usuários recentes
router.get('/dashboard/recent-users', async (req, res) => {
  try {
    console.log('👥 [Admin] Buscando usuários recentes...');

    const recentUsers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'username', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Verificar status do plano para cada usuário
    const usersWithStatus = await Promise.all(
      recentUsers.map(async (user) => {
        const planStatus = await UserVIP.findOne({
          where: {
            user_id: user.id,
            status: 'ativo',
            data_fim: { [Op.gt]: new Date() }
          }
        });

        return {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuário',
          email: user.email,
          status: planStatus ? 'premium' : 'active',
          created_at: user.created_at
        };
      })
    );

    console.log(`✅ [Admin] Encontrados ${usersWithStatus.length} usuários recentes`);

    res.json({
      success: true,
      data: usersWithStatus
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar usuários recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter planos ativos
router.get('/dashboard/active-plans', async (req, res) => {
  try {
    console.log('💎 [Admin] Buscando planos ativos...');

    const activePlans = await UserVIP.findAll({
      attributes: [
        'plan_id',
        [sequelize.fn('COUNT', sequelize.col('UserVIP.id')), 'activeUsers'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'monthlyRevenue']
      ],
      where: {
        status: 'ativo',
        data_fim: { [Op.gt]: new Date() }
      },
      group: ['plan_id'],
      raw: true
    });

    // Buscar nomes dos planos
    const planNames = await Plan.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    const planMap = {};
    planNames.forEach(plan => {
      planMap[plan.id] = plan.name;
    });

    const formattedPlans = activePlans.map(plan => ({
      id: plan.plan_id,
      name: planMap[plan.plan_id] || `Plano ${plan.plan_id}`,
      activeUsers: parseInt(plan.activeUsers),
      monthlyRevenue: parseFloat(plan.monthlyRevenue) || 0
    }));

    console.log(`✅ [Admin] Encontrados ${formattedPlans.length} planos ativos`);

    res.json({
      success: true,
      data: formattedPlans
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar planos ativos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter atividades recentes
router.get('/dashboard/recent-activities', async (req, res) => {
  try {
    console.log('📋 [Admin] Buscando atividades recentes...');

    const activities = [];

    // Buscar novos usuários (últimas 24h)
    const newUsers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'username', 'created_at'],
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    newUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_signup',
        description: `Novo usuário cadastrado: ${user.first_name || user.username || 'Usuário'}`,
        created_at: user.created_at
      });
    });

    // Buscar ativações de planos (últimas 24h)
    const planActivations = await UserVIP.findAll({
      attributes: ['id', 'created_at', 'plan_name'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'username']
      }],
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    planActivations.forEach(plan => {
      const userName = plan.user ? 
        (plan.user.first_name || plan.user.username || 'Usuário') : 'Usuário';
      activities.push({
        id: `plan_${plan.id}`,
        type: 'plan_activation',
        description: `${userName} ativou o plano ${plan.plan_name}`,
        created_at: plan.created_at
      });
    });

    // Buscar pagamentos aprovados (últimas 24h)
    const payments = await Order.findAll({
      attributes: ['id', 'amount', 'created_at'],
      where: {
        status: 'approved',
        created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    payments.forEach(payment => {
      activities.push({
        id: `payment_${payment.id}`,
        type: 'payment',
        description: `Pagamento confirmado: R$ ${payment.amount.toFixed(2)}`,
        created_at: payment.created_at
      });
    });

    // Buscar logins recentes (últimas 24h)
    const recentLogins = await UserSession.findAll({
      attributes: ['id', 'created_at'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'username']
      }],
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    recentLogins.forEach(session => {
      const userName = session.user ? 
        (session.user.first_name || session.user.username || 'Usuário') : 'Usuário';
      activities.push({
        id: `login_${session.id}`,
        type: 'user_login',
        description: `${userName} fez login`,
        created_at: session.created_at
      });
    });

    // Ordenar todas as atividades por data
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Limitar a 10 atividades mais recentes
    const recentActivities = activities.slice(0, 10);

    console.log(`✅ [Admin] Encontradas ${recentActivities.length} atividades recentes`);

    res.json({
      success: true,
      data: recentActivities
    });

  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar atividades recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ===== ROTAS DE USUÁRIOS =====

// Listar usuários com paginação e filtros
router.get('/users', async (req, res) => {
  try {
    console.log('👥 [Admin] Buscando usuários...');
    
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '', 
      plan = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir filtros
    const whereClause = {};
    const userWhereClause = {};
    
    if (search) {
      userWhereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Buscar usuários com informações de planos
    const { count, rows: users } = await User.findAndCountAll({
      where: userWhereClause,
      include: [
        {
          model: UserVIP,
          as: 'vipPlans',
          where: {
            status: 'ativo',
            data_fim: { [Op.gt]: new Date() }
          },
          required: false,
          attributes: ['plan_id', 'plan_name', 'data_fim']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    // Formatar dados dos usuários
    const formattedUsers = users.map(user => {
      const activePlan = user.vipPlans && user.vipPlans.length > 0 ? user.vipPlans[0] : null;
      
      return {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuário',
        email: user.email,
        username: user.username,
        status: activePlan ? 'premium' : 'active',
        planName: activePlan ? activePlan.plan_name : 'Gratuito',
        planExpires: activePlan ? activePlan.data_fim : null,
        createdAt: user.created_at,
        lastLogin: user.last_login || null
      };
    });
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    };
    
    console.log(`✅ [Admin] Encontrados ${users.length} usuários`);
    
    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ===== ROTAS DE PLANOS =====

// Teste simples para verificar se há planos
router.get('/plans/test', async (req, res) => {
  try {
    console.log('🧪 [Admin] Testando busca de planos...');
    
    const totalPlans = await Plan.count();
    console.log(`📊 [Admin] Total de planos na tabela: ${totalPlans}`);
    
    const allPlans = await Plan.findAll({
      limit: 5,
      attributes: ['id', 'name', 'display_name', 'type', 'is_active']
    });
    
    console.log('📋 [Admin] Primeiros 5 planos:', allPlans);
    
    res.json({
      success: true,
      data: {
        total: totalPlans,
        sample: allPlans
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro no teste de planos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Listar planos
router.get('/plans', async (req, res) => {
  try {
    console.log('💎 [Admin] Buscando planos...');
    
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir filtros
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } },
        { type: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.is_active = status === 'active';
    }
    
    console.log('🔍 [Admin] Filtros aplicados:', whereClause);
    
    // Buscar planos
    const { count, rows: plans } = await Plan.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    console.log(`📊 [Admin] Encontrados ${plans.length} planos de ${count} total`);
    
    // Formatar planos (sem estatísticas por enquanto para debug)
    const formattedPlans = plans.map(plan => {
      console.log('📋 [Admin] Processando plano:', plan.id, plan.name);
      
      return {
        id: plan.id,
        name: plan.name,
        displayName: plan.display_name,
        type: plan.type,
        category: plan.category,
        price: parseFloat(plan.price),
        durationDays: plan.duration_days,
        isActive: plan.is_active,
        description: plan.description,
        features: plan.features,
        color: plan.color,
        cssClass: plan.css_class,
        activeUsers: 0, // Temporariamente 0 para debug
        monthlyRevenue: 0, // Temporariamente 0 para debug
        createdAt: plan.created_at
      };
    });
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    };
    
    console.log(`✅ [Admin] Encontrados ${plans.length} planos`);
    
    res.json({
      success: true,
      data: {
        plans: formattedPlans,
        pagination
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Ativar/Desativar plano
router.patch('/plans/:id/toggle', async (req, res) => {
  try {
    const planId = req.params.id;
    console.log(`🔄 [Admin] Alternando status do plano ${planId}...`);
    
    const plan = await Plan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado'
      });
    }
    
    await plan.update({
      is_active: !plan.is_active
    });
    
    console.log(`✅ [Admin] Plano ${planId} ${plan.is_active ? 'ativado' : 'desativado'}`);
    
    res.json({
      success: true,
      message: `Plano ${plan.is_active ? 'ativado' : 'desativado'} com sucesso`,
      data: {
        id: plan.id,
        isActive: plan.is_active
      }
    });
    
  } catch (error) {
    console.error('❌ [Admin] Erro ao alternar status do plano:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;