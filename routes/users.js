const express = require('express');
const { User, UserSession } = require('../models');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const { Pool } = require('pg');

// Função auxiliar para verificar dependências de usuário
async function checkUserDependencies(userId) {
  console.log(`🔍 Verificando dependências para usuário ID: ${userId}`);
  const dependencies = {};
  
  try {
    // Verificar sessões ativas
    const sessionsCount = await UserSession.count({
      where: { user_id: userId }
    });
    dependencies.sessions = sessionsCount;
    console.log(`✅ Sessões encontradas: ${sessionsCount}`);
    
    // Verificar outras possíveis dependências (expandir conforme necessário)
    // Exemplo: bookmaker_accounts, transaction_history, etc.
    
    console.log(`📊 Dependências finais:`, dependencies);
    return dependencies;
  } catch (error) {
    console.error('❌ Erro ao verificar dependências:', error);
    throw error;
  }
}

const router = express.Router();

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/surestake'
});

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS VIP (devem vir antes das rotas genéricas) =====

// 1. Ativar VIP para usuário
router.post('/activate-vip', async (req, res) => {
  try {
    const {
      userId,
      planId,
      planDays,
      activatedAt,
      expiresAt,
      orderId
    } = req.body;

    // Validações básicas
    if (!userId || !planId || !planDays || !activatedAt || !expiresAt) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se usuário já tem VIP ativo
    const existingVIPQuery = `
      SELECT * FROM user_vip_status 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const existingVIPResult = await pool.query(existingVIPQuery, [userId]);

    if (existingVIPResult.rows.length > 0) {
      // Usuário já tem VIP ativo, somar os dias
      const existingVIP = existingVIPResult.rows[0];
      const newExpiresAt = new Date(existingVIP.expires_at.getTime() + (planDays * 24 * 60 * 60 * 1000));

      // Atualizar VIP existente
      const updateQuery = `
        UPDATE user_vip_status 
        SET plan_days = plan_days + $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, [planDays, newExpiresAt, existingVIP.id]);

      res.json({
        success: true,
        message: 'VIP estendido com sucesso',
        vip: {
          id: updateResult.rows[0].id,
          planDays: updateResult.rows[0].plan_days,
          expiresAt: updateResult.rows[0].expires_at,
          status: 'extended'
        }
      });

    } else {
      // Criar novo VIP
      const insertQuery = `
        INSERT INTO user_vip_status (user_id, plan_id, plan_days, activated_at, expires_at, order_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING *
      `;

      const insertResult = await pool.query(insertQuery, [
        userId,
        planId,
        planDays,
        activatedAt,
        expiresAt,
        orderId
      ]);

      res.status(201).json({
        success: true,
        message: 'VIP ativado com sucesso',
        vip: {
          id: insertResult.rows[0].id,
          planDays: insertResult.rows[0].plan_days,
          expiresAt: insertResult.rows[0].expires_at,
          status: 'activated'
        }
      });
    }

  } catch (error) {
    console.error('Erro ao ativar VIP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 2. Verificar status VIP do usuário
router.get('/:userId/vip-status', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT * FROM user_vip_status 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        hasVIP: false,
        vipStatus: null
      });
    }

    const vip = result.rows[0];
    const now = new Date();
    const expiresAt = new Date(vip.expires_at);
    const isExpired = now > expiresAt;
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      hasVIP: !isExpired,
      vipStatus: {
        id: vip.id,
        planId: vip.plan_id,
        planDays: vip.plan_days,
        activatedAt: vip.activated_at,
        expiresAt: vip.expires_at,
        daysRemaining: isExpired ? 0 : daysRemaining,
        isExpired: isExpired,
        status: vip.status
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status VIP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 3. Listar histórico VIP do usuário
router.get('/:userId/vip-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = `
      SELECT * FROM user_vip_status 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [
      userId, 
      parseInt(limit), 
      (parseInt(page) - 1) * parseInt(limit)
    ]);

    // Contar total de registros VIP
    const countQuery = `
      SELECT COUNT(*) FROM user_vip_status WHERE user_id = $1
    `;

    const countResult = await pool.query(countQuery, [userId]);
    const totalVIPs = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      vipHistory: result.rows.map(vip => ({
        id: vip.id,
        planId: vip.plan_id,
        planDays: vip.plan_days,
        activatedAt: vip.activated_at,
        expiresAt: vip.expires_at,
        status: vip.status,
        orderId: vip.order_id,
        createdAt: vip.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalVIPs,
        pages: Math.ceil(totalVIPs / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao listar histórico VIP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 4. Cancelar VIP (admin only)
router.patch('/:userId/cancel-vip', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Verificar se usuário tem VIP ativo
    const checkQuery = `
      SELECT * FROM user_vip_status 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não possui VIP ativo' });
    }

    const vip = checkResult.rows[0];

    // Cancelar VIP
    const updateQuery = `
      UPDATE user_vip_status 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [vip.id]);

    res.json({
      success: true,
      message: 'VIP cancelado com sucesso',
      vip: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        cancelledAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao cancelar VIP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 5. Renovar VIP
router.post('/:userId/renew-vip', async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, planDays, orderId } = req.body;

    if (!planId || !planDays) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + (planDays * 24 * 60 * 60 * 1000));

    // Verificar se usuário já tem VIP ativo
    const existingVIPQuery = `
      SELECT * FROM user_vip_status 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const existingVIPResult = await pool.query(existingVIPQuery, [userId]);

    if (existingVIPResult.rows.length > 0) {
      // Usuário já tem VIP ativo, somar os dias
      const existingVIP = existingVIPResult.rows[0];
      const newExpiresAt = new Date(existingVIP.expires_at.getTime() + (planDays * 24 * 60 * 60 * 1000));

      // Atualizar VIP existente
      const updateQuery = `
        UPDATE user_vip_status 
        SET plan_days = plan_days + $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, [planDays, newExpiresAt, existingVIP.id]);

      res.json({
        success: true,
        message: 'VIP renovado com sucesso',
        vip: {
          id: updateResult.rows[0].id,
          planDays: updateResult.rows[0].plan_days,
          expiresAt: updateResult.rows[0].expires_at,
          status: 'renewed'
        }
      });

    } else {
      // Criar novo VIP
      const insertQuery = `
        INSERT INTO user_vip_status (user_id, plan_id, plan_days, activated_at, expires_at, order_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING *
      `;

      const insertResult = await pool.query(insertQuery, [
        userId,
        planId,
        planDays,
        activatedAt,
        expiresAt,
        orderId
      ]);

      res.json({
        success: true,
        message: 'VIP ativado com sucesso',
        vip: {
          id: insertResult.rows[0].id,
          planDays: insertResult.rows[0].plan_days,
          expiresAt: insertResult.rows[0].expires_at,
          status: 'activated'
        }
      });
    }

  } catch (error) {
    console.error('Erro ao renovar VIP:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 6. Verificar expiração de VIP (para rotina automática)
router.get('/check-expiration', async (req, res) => {
  try {
    const now = new Date();

    // Buscar VIPs expirados
    const expiredVIPsQuery = `
      SELECT * FROM user_vip_status 
      WHERE status = 'active' AND expires_at < $1
    `;

    const expiredVIPsResult = await pool.query(expiredVIPsQuery, [now]);

    const expiredVIPs = expiredVIPsResult.rows.map(vip => ({
      id: vip.id,
      userId: vip.user_id,
      planId: vip.plan_id,
      expiresAt: vip.expires_at
    }));

    res.json({
      success: true,
      expiredVIPs,
      count: expiredVIPs.length
    });

  } catch (error) {
    console.error('Erro ao verificar expiração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 7. Processar expiração de VIP (para rotina automática)
router.post('/process-expiration', async (req, res) => {
  try {
    const { vipIds } = req.body;

    if (!vipIds || !Array.isArray(vipIds)) {
      return res.status(400).json({ error: 'IDs de VIP necessários' });
    }

    const processedVIPs = [];

    for (const vipId of vipIds) {
      try {
        // Buscar dados do VIP
        const vipQuery = `
          SELECT * FROM user_vip_status WHERE id = $1
        `;

        const vipResult = await pool.query(vipQuery, [vipId]);

        if (vipResult.rows.length === 0) {
          continue;
        }

        const vip = vipResult.rows[0];

        // Marcar VIP como expirado
        const updateQuery = `
          UPDATE user_vip_status 
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `;

        await pool.query(updateQuery, [vipId]);

        processedVIPs.push({
          id: vip.id,
          userId: vip.user_id,
          status: 'expired',
          processedAt: new Date()
        });

        // Aqui você implementaria:
        // 1. Remover cargo VIP do usuário
        // 2. Atribuir cargo básico
        // 3. Enviar notificação
        // 4. Registrar no log

      } catch (error) {
        console.error(`Erro ao processar VIP ${vipId}:`, error);
      }
    }

    res.json({
      success: true,
      message: `${processedVIPs.length} VIPs processados`,
      processedVIPs
    });

  } catch (error) {
    console.error('Erro ao processar expiração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 8. Estatísticas VIP (admin only)
router.get('/vip-statistics', requireAdmin, async (req, res) => {
  try {
    // Total de usuários VIP ativos
    const activeVIPsQuery = `
      SELECT COUNT(*) FROM user_vip_status WHERE status = 'active'
    `;

    const activeVIPsResult = await pool.query(activeVIPsQuery);
    const activeVIPs = parseInt(activeVIPsResult.rows[0].count);

    // VIPs que expiram nos próximos 7 dias
    const expiringSoonQuery = `
      SELECT COUNT(*) FROM user_vip_status 
      WHERE status = 'active' 
      AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `;

    const expiringSoonResult = await pool.query(expiringSoonQuery);
    const expiringSoon = parseInt(expiringSoonResult.rows[0].count);

    // VIPs expirados hoje
    const expiredTodayQuery = `
      SELECT COUNT(*) FROM user_vip_status 
      WHERE status = 'active' 
      AND DATE(expires_at) = CURRENT_DATE
    `;

    const expiredTodayResult = await pool.query(expiredTodayQuery);
    const expiredToday = parseInt(expiredTodayResult.rows[0].count);

    // Total de VIPs criados este mês
    const thisMonthQuery = `
      SELECT COUNT(*) FROM user_vip_status 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    const thisMonthResult = await pool.query(thisMonthQuery);
    const thisMonth = parseInt(thisMonthResult.rows[0].count);

    res.json({
      success: true,
      statistics: {
        activeVIPs,
        expiringSoon,
        expiredToday,
        thisMonth,
        totalVIPs: activeVIPs + expiringSoon + expiredToday
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DE USUÁRIOS =====

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    // Mapear os dados para incluir o campo 'name' esperado pelo frontend
    const mappedUsers = users.map(user => ({
      ...user.toJSON(),
      name: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Nome não informado',
      role: user.is_admin ? 'admin' : 'user',
      account_type: user.account_type || 'basic',
      status: 'active',
      credits: 0
    }));

    res.json({
      success: true,
      users: mappedUsers
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'cpf', 'phone', 'created_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Mapear os dados para incluir o campo 'name' esperado pelo frontend
    const mappedUser = {
      ...user.toJSON(),
      name: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Nome não informado',
      role: user.is_admin ? 'admin' : 'user',
      account_type: user.account_type || 'basic',
      status: 'active',
      credits: 0
    };

    res.json({
      success: true,
      user: mappedUser
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo usuário
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, first_name, last_name, email, password, is_admin, is_vip } = req.body;

    // Validações
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, e-mail e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se e-mail já existe
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Verificar se username já existe
    const existingUsername = await User.findOne({
      where: { username: username }
    });

    if (existingUsername) {
      return res.status(409).json({
        error: 'Username já cadastrado'
      });
    }

    // Hash da senha
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await User.create({
      username,
      first_name: first_name || username,
      last_name: last_name || '',
      email: email.toLowerCase(),
      password_hash: passwordHash,
      is_admin: is_admin || false,
      is_vip: is_vip || false
    });

    // Retornar dados sem senha
    const userData = {
      id: user.id,
      name: user.username, // Usar username como name
      email: user.email,
      role: user.is_admin ? 'admin' : 'user',
      account_type: user.account_type || 'basic',
      credits: 0, // Usuários novos começam com 0 créditos
      status: 'active',
      created_at: user.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: userData
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, account_type, credits, status } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (account_type) user.account_type = account_type;
    if (credits !== undefined) user.credits = credits;
    if (status) user.status = status;

    await user.save();

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        account_type: user.account_type,
        credits: user.credits,
        status: user.status,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar usuário
router.delete('/:id', requireAdmin, async (req, res) => {
  console.log('🚀 INÍCIO DA ROTA DELETE');
  try {
    const { id } = req.params;
    
    // Validação do ID
    if (!id || isNaN(parseInt(id))) {
      console.log(`❌ ID inválido recebido: ${id}`);
      return res.status(400).json({
        error: 'ID de usuário inválido'
      });
    }

    console.log(`🗑️ Tentativa de exclusão do usuário ID: ${id}`);

    // 1. IDENTIFICAR: Verificar se o usuário existe
    const user = await User.findByPk(id);
    if (!user) {
      console.log(`❌ Usuário ID ${id} não encontrado`);
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log(`✅ Usuário encontrado: ${user.username} (${user.email})`);

    // 2. VERIFICAR DEPENDÊNCIAS: Verificar se não é o próprio usuário logado
    if (user.id === req.user.id) {
      console.log(`❌ Tentativa de auto-exclusão bloqueada para usuário ID ${id}`);
      return res.status(400).json({
        error: 'Não é possível deletar o próprio usuário'
      });
    }

    // Primeiro, deletar todas as sessões do usuário
    console.log(`🧹 Limpando sessões do usuário...`);
    const deletedSessions = await UserSession.destroy({
      where: { user_id: id }
    });
    console.log(`✅ ${deletedSessions} sessões removidas`);

    // Depois, deletar o usuário
    console.log(`🗑️ Deletando usuário ID ${id}...`);
    await user.destroy();

    console.log(`✅ Usuário ID ${id} deletado com sucesso`);

    // 7. AUDITORIA: Log da operação
    console.log(`📝 AUDITORIA: Usuário ${user.username} (${user.email}) deletado por admin ID ${req.user.id}`);

    // Construir resposta SIMPLES primeiro
    const response = {
      success: true,
      message: 'Usuário deletado com sucesso',
      details: {
        deletedUserId: parseInt(id),
        deletedUsername: user.username,
        deletedEmail: user.email,
        sessionsRemoved: deletedSessions,
        deletedBy: req.user.username,
        deletedAt: new Date().toISOString()
      }
    };
    
    console.log('📤 RESPOSTA SENDO ENVIADA:', JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
    console.log('✅ RESPOSTA ENVIADA COM SUCESSO');

  } catch (error) {
    console.error(`❌ ERRO CAPTURADO:`, error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
