const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const { Notification, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Middleware para verificar se o usuário está autenticado
router.use(authenticateToken);

// Obter notificações do usuário
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    // Determinar o tipo de usuário
    let userType = 'basic';
    if (req.user.is_admin) userType = 'admin';
    else if (req.user.is_vip) userType = 'vip';
    
    let whereClause = {
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    };
    
    if (unread_only === 'true') {
      whereClause.is_read = false;
    }
    
    // Filtrar por público-alvo
    if (userType === 'admin') {
      whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
    } else if (userType === 'vip') {
      whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
    } else {
      whereClause.target_audience = 'all';
    }
    
    // Incluir notificações específicas para o usuário
    // Só incluir se o usuário tiver um ID válido
    if (req.user && req.user.id) {
      whereClause = {
        [Op.or]: [
          whereClause,
          {
            target_audience: 'specific',
            target_user_ids: { [Op.contains]: [req.user.id] }
          }
        ]
      };
    }
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erro ao obter notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Marcar notificação como lida
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }
    
    // Verificar se o usuário tem acesso a esta notificação
    if (notification.target_audience === 'specific' && 
        !notification.target_user_ids.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado a esta notificação'
      });
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      message: 'Notificação marcada como lida',
      data: {
        id: notification.id,
        is_read: notification.is_read,
        read_at: notification.read_at
      }
    });
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Descartar notificação
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }
    
    // Verificar se o usuário tem acesso a esta notificação
    if (notification.target_audience === 'specific' && 
        !notification.target_user_ids.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado a esta notificação'
      });
    }
    
    await notification.dismiss();
    
    res.json({
      success: true,
      message: 'Notificação descartada',
      data: {
        id: notification.id,
        is_dismissed: notification.is_dismissed,
        dismissed_at: notification.dismissed_at
      }
    });
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erro ao descartar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Marcar todas as notificações como lidas
router.patch('/mark-all-read', async (req, res) => {
  try {
    // Determinar o tipo de usuário
    let userType = 'basic';
    if (req.user.is_admin) userType = 'admin';
    else if (req.user.is_vip) userType = 'vip';
    
    let whereClause = {
      is_read: false,
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    };
    
    // Filtrar por público-alvo
    if (userType === 'admin') {
      whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
    } else if (userType === 'vip') {
      whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
    } else {
      whereClause.target_audience = 'all';
    }
    
    // Incluir notificações específicas para o usuário
    // Só incluir se o usuário tiver um ID válido
    if (req.user && req.user.id) {
      whereClause = {
        [Op.or]: [
          whereClause,
          {
            target_audience: 'specific',
            target_user_ids: { [Op.contains]: [req.user.id] }
          }
        ]
      };
    }
    
    const result = await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: whereClause
      }
    );
    
    res.json({
      success: true,
      message: `${result[0]} notificações marcadas como lidas`,
      data: {
        updatedCount: result[0]
      }
    });
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erro ao marcar todas como lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Contar notificações não lidas
router.get('/unread-count', async (req, res) => {
  try {
    // Determinar o tipo de usuário
    let userType = 'basic';
    if (req.user.is_admin) userType = 'admin';
    else if (req.user.is_vip) userType = 'vip';
    
    let whereClause = {
      is_read: false,
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    };
    
    // Filtrar por público-alvo
    if (userType === 'admin') {
      whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
    } else if (userType === 'vip') {
      whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
    } else {
      whereClause.target_audience = 'all';
    }
    
    // Incluir notificações específicas para o usuário
    // Só incluir se o usuário tiver um ID válido
    if (req.user && req.user.id) {
      whereClause = {
        [Op.or]: [
          whereClause,
          {
            target_audience: 'specific',
            target_user_ids: { [Op.contains]: [req.user.id] }
          }
        ]
      };
    }
    
    const count = await Notification.count({ where: whereClause });
    
    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
    
  } catch (error) {
    console.error('[NOTIFICATIONS] Erro ao contar notificações não lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;
