/**
 * Rotas de Notificações - Versão Simplificada
 * Evita problemas de SQL com consultas complexas
 */

const express = require('express');
const { Op } = require('sequelize');
const { Notification, User } = require('../models');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

// GET /api/notifications - Listar notificações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Consulta base - notificações para todos ou para o tipo de usuário
    let whereClause = {
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    };

    // Filtrar por público-alvo baseado no tipo de usuário
    if (req.user.isAdmin) {
      whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
    } else if (req.user.isVIP) {
      whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
    } else {
      whereClause.target_audience = 'all';
    }

    // Buscar notificações de forma simples
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Contar total
    const count = await Notification.count({
      where: whereClause
    });

    // Buscar notificações específicas separadamente (se necessário)
    if (req.user && req.user.id) {
      try {
        const specificNotifications = await Notification.findAll({
          where: {
            target_audience: 'specific',
            is_dismissed: false,
            [Op.or]: [
              { expires_at: null },
              { expires_at: { [Op.gt]: new Date() } }
            ]
          }
        });

        // Filtrar notificações específicas que contêm o ID do usuário
        const userSpecificNotifications = specificNotifications.filter(notification => {
          try {
            const targetIds = notification.target_user_ids;
            if (Array.isArray(targetIds)) {
              return targetIds.includes(req.user.id);
            } else if (typeof targetIds === 'string') {
              return targetIds.includes(req.user.id.toString());
            }
            return false;
          } catch (error) {
            return false;
          }
        });

        // Adicionar notificações específicas ao resultado
        notifications.push(...userSpecificNotifications);
        
        // Ordenar novamente por data
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Aplicar limite novamente
        const limitedNotifications = notifications.slice(0, parseInt(limit));
        
        res.json({
          success: true,
          data: limitedNotifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count + userSpecificNotifications.length,
            pages: Math.ceil((count + userSpecificNotifications.length) / limit)
          }
        });

      } catch (specificError) {
        console.warn('Erro ao buscar notificações específicas:', specificError.message);
        
        // Retornar apenas as notificações gerais se houver erro
        res.json({
          success: true,
          data: notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        });
      }
    } else {
      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    }

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar notificações'
    });
  }
});

// POST /api/notifications - Criar notificação
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        message: 'Apenas administradores podem criar notificações'
      });
    }

    const {
      title,
      message,
      type = 'info',
      priority = 'normal',
      target_audience = 'all',
      target_user_ids = null,
      expires_at = null
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Título e mensagem são obrigatórios'
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      target_audience,
      target_user_ids,
      expires_at,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a notificação'
    });
  }
});

// PUT /api/notifications/:id/read - Marcar como lida
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      success: true,
      data: notification,
      message: 'Notificação marcada como lida'
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível marcar a notificação como lida'
    });
  }
});

// PUT /api/notifications/:id/dismiss - Descartar notificação
router.put('/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    await notification.update({
      is_dismissed: true,
      dismissed_at: new Date()
    });

    res.json({
      success: true,
      data: notification,
      message: 'Notificação descartada'
    });

  } catch (error) {
    console.error('Erro ao descartar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível descartar a notificação'
    });
  }
});

// DELETE /api/notifications/:id - Deletar notificação
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        message: 'Apenas administradores podem deletar notificações'
      });
    }

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
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar a notificação'
    });
  }
});

// GET /api/notifications/unread-count - Contar notificações não lidas
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    console.log('🔔 [Notifications] Buscando contagem de não lidas para usuário:', req.user.userId);

    // Consulta base - notificações não lidas
    let whereClause = {
      is_read: false,
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    };

    // Filtrar por público-alvo baseado no tipo de usuário
    if (req.user.isAdmin) {
      whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
    } else if (req.user.isVIP) {
      whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
    } else {
      whereClause.target_audience = 'all';
    }

    // Contar notificações não lidas
    const unreadCount = await Notification.count({
      where: whereClause
    });

    console.log('🔔 [Notifications] Contagem de não lidas:', unreadCount);

    res.json({
      success: true,
      data: {
        unreadCount: unreadCount
      }
    });

  } catch (error) {
    console.error('❌ [Notifications] Erro ao contar notificações não lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível contar as notificações não lidas'
    });
  }
});

module.exports = router;
