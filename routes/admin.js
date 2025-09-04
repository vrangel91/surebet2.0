const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Notification, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  validationErrorResponse,
  serverErrorResponse,
  asyncHandler 
} = require('../utils/apiResponse');

// Middleware para verificar se o usuário é admin
router.use(authenticateToken);
router.use(requireAdmin);

// Forçar atualização PWA para todos os usuários
router.post('/force-pwa-update', async (req, res) => {
  try {
    console.log('[ADMIN] Forçando atualização PWA...');
    
    // Aqui você pode implementar lógica para:
    // 1. Enviar notificações push para todos os usuários
    // 2. Invalidar caches
    // 3. Forçar reload em clientes conectados via WebSocket
    
    // Por enquanto, retornamos sucesso
    res.json({
      success: true,
      message: 'Atualização PWA forçada com sucesso',
      timestamp: new Date().toISOString(),
      action: 'force-pwa-update'
    });
    
  } catch (error) {
    console.error('[ADMIN] Erro ao forçar atualização PWA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Obter estatísticas de usuários PWA
router.get('/pwa-stats', async (req, res) => {
  try {
    console.log('[ADMIN] Obtendo estatísticas PWA...');
    
    // Aqui você pode implementar lógica para coletar estatísticas
    // como número de usuários com PWA instalado, versões, etc.
    
    const stats = {
      totalUsers: 0,
      pwaInstalled: 0,
      pwaNotInstalled: 0,
      lastUpdate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('[ADMIN] Erro ao obter estatísticas PWA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Enviar notificação global para todos os usuários
router.post('/send-notification', async (req, res) => {
  try {
    const { 
      title, 
      message, 
      type = 'info', 
      priority = 'normal',
      target_audience = 'all',
      target_user_ids = null,
      expires_at = null,
      metadata = {}
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Título e mensagem são obrigatórios'
      });
    }
    
    console.log('[ADMIN] Enviando notificação:', { 
      title, 
      message, 
      type, 
      priority, 
      target_audience,
      target_user_ids,
      expires_at 
    });
    
    // Criar notificação no banco
    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      target_audience,
      target_user_ids,
      expires_at: expires_at ? new Date(expires_at) : null,
      metadata,
      created_by: req.user.id
    });
    
    // Contar usuários que receberão a notificação
    let userCount = 0;
    if (target_audience === 'all') {
      userCount = await User.count();
    } else if (target_audience === 'vip') {
      // Usar VIPService para contar usuários VIP ativos
      const { UserVIP } = require('../models');
      const now = new Date();
      userCount = await UserVIP.count({
        where: {
          status: 'active',
          dataFim: { [Op.gt]: now }
        }
      });
    } else if (target_audience === 'admin') {
      userCount = await User.count({ where: { is_admin: true } });
    } else if (target_audience === 'specific' && target_user_ids) {
      userCount = target_user_ids.length;
    }
    
    // TODO: Implementar WebSocket para notificações em tempo real
    // TODO: Implementar notificações push para dispositivos móveis
    
    res.json({
      success: true,
      message: 'Notificação enviada com sucesso',
      data: {
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          target_audience: notification.target_audience,
          target_user_ids: notification.target_user_ids,
          expires_at: notification.expires_at,
          sent_at: notification.sent_at
        },
        userCount,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('[ADMIN] Erro ao enviar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Listar todas as notificações
router.get('/notifications', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, priority, target_audience } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = {};
  
  if (type) whereClause.type = type;
  if (priority) whereClause.priority = priority;
  if (target_audience) whereClause.target_audience = target_audience;
  
  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'creator',
      attributes: ['id', 'username', 'email']
    }],
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
  
  res.json(successResponse(
    { notifications, pagination },
    'Notificações listadas com sucesso'
  ));
}));

// Obter estatísticas de notificações
router.get('/notifications/stats', asyncHandler(async (req, res) => {
  const totalNotifications = await Notification.count();
  const unreadNotifications = await Notification.count({ where: { is_read: false } });
  const dismissedNotifications = await Notification.count({ where: { is_dismissed: true } });
  
  // Contar por tipo (simplificado)
  const typeStats = [];
  const types = ['info', 'success', 'warning', 'error', 'update'];
  for (const type of types) {
    const count = await Notification.count({ where: { type } });
    if (count > 0) {
      typeStats.push({ type, count });
    }
  }
  
  // Contar por público-alvo (simplificado)
  const audienceStats = [];
  const audiences = ['all', 'vip', 'admin', 'specific'];
  for (const audience of audiences) {
    const count = await Notification.count({ where: { target_audience: audience } });
    if (count > 0) {
      audienceStats.push({ target_audience: audience, count });
    }
  }
  
  const stats = {
    total: totalNotifications,
    unread: unreadNotifications,
    dismissed: dismissedNotifications,
    byType: typeStats,
    byAudience: audienceStats
  };
  
  res.json(successResponse(
    stats,
    'Estatísticas obtidas com sucesso'
  ));
}));

// Deletar notificação
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }
    
    await notification.destroy();
    
    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
    
  } catch (error) {
    console.error('[ADMIN] Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Endpoint de teste para verificar se as rotas admin estão funcionando
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rotas admin funcionando corretamente',
    timestamp: new Date().toISOString(),
    user: {
      id: req.user.id,
      username: req.user.username || req.user.email,
      isAdmin: req.user.is_admin
    }
  });
});

module.exports = router;
