const express = require('express');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Ticket, TicketMessage, User } = require('../models');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/tickets - Listar tickets (usuários veem apenas os seus, admins veem todos)
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;

    let whereClause = {};
    let includeOptions = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'email', 'username']
      },
      {
        model: TicketMessage,
        as: 'messages',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'username']
          }
        ],
        order: [['created_at', 'ASC']]
      }
    ];

    // Se não for admin, mostrar apenas tickets do usuário
    if (!isAdmin) {
      whereClause.user_id = userId;
    }

    // Aplicar filtros
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;

    // Busca por texto
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { subject: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { '$messages.message$': { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });

    // Formatar dados para o frontend
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      userId: ticket.user_id,
      userName: ticket.user ? `${ticket.user.first_name || ''} ${ticket.user.last_name || ''}`.trim() || ticket.user.username : 'Usuário',
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        author: msg.user ? `${msg.user.first_name || ''} ${msg.user.last_name || ''}`.trim() || msg.user.username : 'Usuário',
        content: msg.message,
        type: msg.is_internal ? 'internal' : 'user',
        createdAt: msg.created_at
      }))
    }));

    res.json({
      success: true,
      tickets: formattedTickets
    });

  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/tickets - Criar novo ticket
router.post('/', async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    const userId = req.user.id;

    // Validações
    if (!subject || !message || !category || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    // Criar ticket
    const ticket = await Ticket.create({
      subject,
      category,
      priority,
      user_id: userId,
      status: 'open',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Criar primeira mensagem
    await TicketMessage.create({
      ticket_id: ticket.id,
      user_id: userId,
      message: message,
      is_internal: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Buscar ticket com dados completos
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'username']
        },
        {
          model: TicketMessage,
          as: 'messages',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'email', 'username']
            }
          ]
        }
      ]
    });

    // Formatar resposta
    const formattedTicket = {
      id: createdTicket.id,
      subject: createdTicket.subject,
      status: createdTicket.status,
      priority: createdTicket.priority,
      category: createdTicket.category,
      createdAt: createdTicket.created_at,
      updatedAt: createdTicket.updated_at,
      userId: createdTicket.user_id,
      userName: createdTicket.user ? `${createdTicket.user.first_name || ''} ${createdTicket.user.last_name || ''}`.trim() || createdTicket.user.username : 'Usuário',
      messages: createdTicket.messages.map(msg => ({
        id: msg.id,
        author: msg.user ? `${msg.user.first_name || ''} ${msg.user.last_name || ''}`.trim() || msg.user.username : 'Usuário',
        content: msg.message,
        type: msg.is_internal ? 'internal' : 'user',
        createdAt: msg.created_at
      }))
    };

    res.status(201).json({
      success: true,
      message: 'Ticket criado com sucesso',
      ticket: formattedTicket
    });

  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/tickets/:id/messages - Adicionar mensagem ao ticket
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;

    // Validações
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Conteúdo da mensagem é obrigatório'
      });
    }

    // Verificar se o ticket existe
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    // Verificar permissões (usuário só pode responder aos seus próprios tickets, admin pode responder a qualquer um)
    if (!isAdmin && ticket.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para acessar este ticket'
      });
    }

    // Determinar se é mensagem interna (apenas para admins)
    const isInternal = isAdmin && req.body.is_internal === true;

    // Criar mensagem
    const newMessage = await TicketMessage.create({
      ticket_id: id,
      user_id: userId,
      message: message.trim(),
      is_internal: isInternal,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Atualizar status do ticket para "in_progress" se estiver aberto
    if (ticket.status === 'open') {
      await ticket.update({ 
        status: 'in_progress',
        updated_at: new Date()
      });
    } else {
      // Atualizar timestamp do ticket
      await ticket.update({ updated_at: new Date() });
    }

    // Buscar mensagem com dados do usuário
    const createdMessage = await TicketMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'username']
        }
      ]
    });

    // Formatar resposta
    const formattedMessage = {
      id: createdMessage.id,
      author: createdMessage.user ? `${createdMessage.user.first_name || ''} ${createdMessage.user.last_name || ''}`.trim() || createdMessage.user.username : 'Usuário',
      content: createdMessage.message,
      type: createdMessage.is_internal ? 'internal' : 'user',
      createdAt: createdMessage.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Mensagem adicionada com sucesso',
      data: formattedMessage
    });

  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/tickets/:id/status - Atualizar status do ticket (apenas admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validações
    if (!status || !['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido'
      });
    }

    // Verificar se o ticket existe
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    // Atualizar status
    const updateData = { status };
    
    // Se estiver fechando o ticket, adicionar closed_at
    if (status === 'closed') {
      updateData.closed_at = new Date();
    }
    
    await ticket.update(updateData);

    res.json({
      success: true,
      message: 'Status do ticket atualizado com sucesso',
      data: { id, status }
    });

  } catch (error) {
    console.error('Erro ao atualizar status do ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/tickets/stats - Estatísticas dos tickets (apenas admin)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const inProgressTickets = await Ticket.count({ where: { status: 'in_progress' } });
    const closedTickets = await Ticket.count({ where: { status: 'closed' } });

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: openTickets,
        in_progress: inProgressTickets,
        closed: closedTickets
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
