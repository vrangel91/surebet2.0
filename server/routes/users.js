const express = require('express');
const { User, UserSession } = require('../models');
const { Op } = require('sequelize');
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
  host: 'localhost',
  port: 5432,
  database: 'surestake',
  user: 'postgres',
  password: 'SureStake2024!'
});

// Aplicar middleware de autenticação em todas as rotas (exceto teste)
router.use((req, res, next) => {
  // Permitir rota de teste sem autenticação
  if (req.path === '/test') {
    return next();
  }
  // Aplicar autenticação para todas as outras rotas
  return authenticateToken(req, res, next);
});

// ===== ROTA DE PERFIL DO USUÁRIO =====

// GET /api/users/profile - Obter perfil do usuário atual
router.get('/profile', async (req, res) => {
  try {
    console.log('🔍 [Users] Rota de perfil chamada')
    console.log('🔍 [Users] Request headers:', req.headers)
    console.log('🔍 [Users] User from token:', req.user)
    console.log('👤 [Profile] Buscando perfil do usuário:', req.user.id);
    
    const { Plan } = require('../models');
    
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'account_type', 'cpf', 'phone', 'created_at', 'last_login',
        'referral_code', 'referred_by', 'plan_id'
      ],
      include: [{
        model: Plan,
        as: 'plan',
        attributes: ['id', 'name', 'display_name', 'type', 'category', 'price', 'duration_days', 'color', 'css_class'],
        required: false
      }]
    });

    if (!user) {
      console.log('❌ [Profile] Usuário não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [Profile] Perfil encontrado:', {
      id: user.id,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_admin: user.is_admin,
        is_vip: user.is_vip,
        vip_expires_at: user.vip_expires_at,
        account_type: user.account_type,
        cpf: user.cpf,
        phone: user.phone,
        created_at: user.created_at,
        last_login: user.last_login,
        referral_code: user.referral_code,
        referred_by: user.referred_by
      }
    });

  } catch (error) {
    console.error('❌ [Profile] Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/users/profile - Atualizar perfil do usuário atual
router.put('/profile', async (req, res) => {
  try {
    console.log('🔄 [Profile] Atualizando perfil do usuário:', req.user.id);
    console.log('📝 [Profile] Dados recebidos:', req.body);
    
    const { first_name, last_name, email, phone, cpf } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      console.log('❌ [Profile] Usuário não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar campos permitidos
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (cpf !== undefined) user.cpf = cpf;

    await user.save();
    
    console.log('✅ [Profile] Perfil atualizado com sucesso');

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('❌ [Profile] Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

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
    console.log('📊 Buscando estatísticas VIP...');
    
    // Usar Sequelize para buscar estatísticas
    const { UserVIP } = require('../models');
    
    // Total de usuários VIP ativos
    const activeVIPs = await UserVIP.count({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.gt]: new Date()
        }
      }
    });
    console.log('👑 VIPs ativos:', activeVIPs);

    // VIPs que expiram nos próximos 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await UserVIP.count({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.between]: [new Date(), sevenDaysFromNow]
        }
      }
    });
    console.log('⏰ Expirando em 7 dias:', expiringSoon);

    // VIPs expirados hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const expiredToday = await UserVIP.count({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.between]: [today, tomorrow]
        }
      }
    });
    console.log('❌ Expirados hoje:', expiredToday);

    // Receita total
    const totalRevenueResult = await UserVIP.sum('amount', {
      where: {
        amount: {
          [Op.gt]: 0
        }
      }
    });
    const totalRevenue = parseFloat(totalRevenueResult) || 0;
    console.log('💰 Receita total:', totalRevenue);

    // Receita deste mês
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const thisMonthRevenueResult = await UserVIP.sum('amount', {
      where: {
        amount: {
          [Op.gt]: 0
        },
        created_at: {
          [Op.gte]: thisMonthStart
        }
      }
    });
    const thisMonthRevenue = parseFloat(thisMonthRevenueResult) || 0;
    console.log('📅 Receita deste mês:', thisMonthRevenue);

    // Total de VIPs criados este mês
    const thisMonth = await UserVIP.count({
      where: {
        created_at: {
          [Op.gte]: thisMonthStart
        }
      }
    });
    console.log('📊 VIPs criados este mês:', thisMonth);

    const statistics = {
      activeVIPs,
      expiringSoon,
      expiredToday,
      thisMonth,
      totalRevenue,
      thisMonthRevenue,
      totalVIPs: activeVIPs + expiringSoon + expiredToday
    };

    console.log('✅ Estatísticas calculadas:', statistics);

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas VIP:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// 🔒 Rota para verificar status VIP do usuário
router.get('/vip-status', authenticateToken, async (req, res) => {
  try {
    console.log('🔒 [VIP Status] Verificando status VIP para usuário:', req.user.id);
    
    // Buscar dados do usuário
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'is_vip', 'vip_expires_at', 'status']
    });
    
    if (!user) {
      console.log('❌ [VIP Status] Usuário não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o usuário está ativo
    if (user.status !== 'active') {
      console.log('❌ [VIP Status] Usuário inativo:', user.status);
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo',
        isVIP: false,
        expiration: null
      });
    }
    
    // Verificar se o VIP expirou
    const now = new Date();
    const vipExpiresAt = user.vip_expires_at ? new Date(user.vip_expires_at) : null;
    const isVIP = user.is_vip && vipExpiresAt && vipExpiresAt > now;
    
    console.log('✅ [VIP Status] Status VIP verificado:', {
      userId: user.id,
      isVIP,
      vipExpiresAt,
      now
    });
    
    // Retornar status VIP
    res.json({
      success: true,
      isVIP,
      expiration: vipExpiresAt ? vipExpiresAt.toISOString() : null,
      lastValidation: now.toISOString(),
      userStatus: user.status
    });
    
  } catch (error) {
    console.error('❌ [VIP Status] Erro ao verificar status VIP:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      isVIP: false,
      expiration: null
    });
  }
});

// ===== ROTAS DE USUÁRIOS =====

// Rota de teste simples
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 [Users API] Rota de teste executada');
    res.json({
      success: true,
      message: 'Rota de teste funcionando',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Users API] Erro na rota de teste:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    console.log('🔍 [Users API] Rota / executada - Buscando usuários...');
    const { Plan } = require('../models');
    console.log('📋 [Users API] Modelo Plan importado:', !!Plan);
    
    console.log('📋 [Users API] Iniciando consulta User.findAll...');
    
    // Primeiro, vamos testar uma consulta simples sem include
    console.log('🔍 [Users API] Testando consulta simples...');
    const simpleUsers = await User.findAll({
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'account_type', 'status', 'created_at', 'last_login', 'plan_id'
      ],
      order: [['created_at', 'DESC']]
    });
    console.log(`✅ [Users API] Consulta simples executada com sucesso. ${simpleUsers.length} usuários encontrados.`);
    
    // Por enquanto, vamos usar apenas a consulta simples para evitar o erro
    console.log('🔍 [Users API] Usando consulta simples (sem include do Plan por enquanto)...');
    const users = simpleUsers;
    console.log(`✅ [Users API] Usando dados da consulta simples. ${users.length} usuários encontrados.`);
    
    // Para cada usuário, vamos buscar o plano separadamente se tiver plan_id
    console.log('🔍 [Users API] Buscando planos individuais para usuários...');
    for (let user of users) {
      if (user.plan_id) {
        try {
          const plan = await Plan.findByPk(user.plan_id);
          if (plan) {
            user.dataValues.plan = plan.toJSON();
          }
        } catch (planError) {
          console.log(`⚠️ [Users API] Erro ao buscar plano ${user.plan_id} para usuário ${user.id}:`, planError.message);
        }
      }
    }

    // Mapear os dados para incluir o campo 'name' esperado pelo frontend
    console.log('🔍 [Users API] Iniciando mapeamento dos usuários...');
    const mappedUsers = users.map(user => ({
      ...user.toJSON(),
      name: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Nome não informado',
      role: user.is_admin ? 'admin' : 'user',
      account_type: user.account_type || 'user',
      status: user.status, // Usar o status real do banco de dados
      lastLogin: user.last_login, // Mapear para o formato esperado pelo frontend
      plan: user.plan || null // Incluir dados do plano
    }));

    console.log('✅ [Users API] Usuários mapeados com sucesso');
    console.log(`📊 [Users API] Total de usuários retornados: ${mappedUsers.length}`);
    
    // Log do primeiro usuário para debug
    if (mappedUsers.length > 0) {
      console.log('🔍 [Users API] Primeiro usuário:', JSON.stringify(mappedUsers[0], null, 2));
    }

    res.json({
      success: true,
      users: mappedUsers
    });

  } catch (error) {
    console.error('❌ [Users API] Erro ao listar usuários:', error);
    console.error('📋 [Users API] Stack trace:', error.stack);
    console.error('📋 [Users API] Error name:', error.name);
    console.error('📋 [Users API] Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Listar planos ativos (substitui a funcionalidade de VIPs ativos)
router.get('/with-plans', async (req, res) => {
  try {
    console.log('🔍 [Users API] Rota /with-plans executada - Buscando planos ativos...');
    const { Plan } = require('../models');
    
    // Consulta simples primeiro - apenas usuários com plan_id
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'account_type', 'status', 'created_at', 'last_login', 'plan_id'
      ],
      where: {
        plan_id: {
          [require('sequelize').Op.ne]: null // Apenas usuários com plano
        }
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ [Users API] Consulta simples executada. ${users.length} planos ativos encontrados.`);
    
    // Para cada usuário, buscar o plano separadamente
    console.log('🔍 [Users API] Buscando planos individuais para usuários com planos...');
    for (let user of users) {
      if (user.plan_id) {
        try {
          const plan = await Plan.findByPk(user.plan_id);
          if (plan) {
            user.dataValues.plan = plan.toJSON();
          }
        } catch (planError) {
          console.log(`⚠️ [Users API] Erro ao buscar plano ${user.plan_id} para usuário ${user.id}:`, planError.message);
        }
      }
    }
    
    // Filtrar apenas usuários com planos específicos (full, live, pré+live, pré jogo, value bet)
    const allowedCategories = ['Full', 'Live', 'Pré+Live', 'Pré-Jogo', 'Valuebet'];
    console.log('🔍 [Users API] Categorias permitidas:', allowedCategories);
    
    const filteredUsers = users.filter(user => {
      if (!user.dataValues.plan) {
        console.log(`⚠️ [Users API] Usuário ${user.id} não tem plano associado`);
        return false;
      }
      
      const planCategory = user.dataValues.plan.category;
      const isAllowed = allowedCategories.includes(planCategory);
      
      console.log(`🔍 [Users API] Usuário ${user.id}: Plano ${user.dataValues.plan.name} (categoria: ${planCategory}) - ${isAllowed ? 'PERMITIDO' : 'FILTRADO'}`);
      
      return isAllowed;
    });
    
    console.log(`🔍 [Users API] Planos filtrados por categoria. ${filteredUsers.length} planos ativos permitidos.`);

    // Mapear os dados para o formato esperado pelo frontend
    const mappedUsers = filteredUsers.map(user => ({
      id: user.id,
      userId: user.id,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      },
      planId: user.dataValues.plan ? user.dataValues.plan.id : null,
      planName: user.dataValues.plan ? user.dataValues.plan.display_name : 'Plano não encontrado',
      planType: user.dataValues.plan ? user.dataValues.plan.type : null,
      planCategory: user.dataValues.plan ? user.dataValues.plan.category : null,
      planPrice: user.dataValues.plan ? user.dataValues.plan.price : 0,
      planDays: user.dataValues.plan ? user.dataValues.plan.duration_days : 0,
      planColor: user.dataValues.plan ? user.dataValues.plan.color : null,
      planCssClass: user.dataValues.plan ? user.dataValues.plan.css_class : null,
      dataInicio: user.created_at, // Data de criação do usuário como início
      dataFim: user.vip_expires_at, // Data de expiração do VIP
      amount: user.dataValues.plan ? user.dataValues.plan.price : 0,
      status: user.is_vip ? 'ativo' : 'inativo',
      autoRenew: false, // Por enquanto sempre false
      createdAt: user.created_at
    }));

    console.log('✅ [Users API] Planos ativos mapeados com sucesso');
    console.log(`📊 [Users API] Total de planos ativos retornados: ${mappedUsers.length}`);
    
    // Log do primeiro usuário para debug
    if (mappedUsers.length > 0) {
      console.log('🔍 [Users API] Primeiro usuário com plano:', JSON.stringify(mappedUsers[0], null, 2));
    }
    
    // Log de todos os usuários para debug
    console.log('🔍 [Users API] Todos os usuários com planos ativos:');
    mappedUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Nome: ${user.user?.first_name} ${user.user?.last_name}, Plano: ${user.planName} (${user.planCategory})`);
    });

    res.json({
      success: true,
      activeVIPs: mappedUsers,
      count: mappedUsers.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar planos ativos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Listar usuários sem planos (categoria "SEM PLANO")
router.get('/without-plans', async (req, res) => {
  try {
    console.log('🔍 [Users API] Rota /without-plans executada - Buscando usuários sem planos...');
    
    // Buscar usuários sem plan_id ou com plan_id nulo
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'account_type', 'status', 'created_at', 'last_login', 'plan_id'
      ],
      where: {
        [require('sequelize').Op.or]: [
          { plan_id: null },
          { plan_id: { [require('sequelize').Op.is]: null } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ [Users API] ${users.length} usuários sem planos encontrados.`);
    
    // Mapear os dados para o formato esperado pelo frontend
    const mappedUsers = users.map(user => ({
      id: user.id,
      userId: user.id,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      },
      planId: null,
      planName: 'SEM PLANO',
      planType: 'sem-plano',
      planCategory: 'sem-plano',
      planPrice: 0,
      planDays: 0,
      planColor: '#6c757d',
      planCssClass: 'sem-plano',
      dataInicio: user.created_at,
      dataFim: null,
      amount: 0,
      status: 'sem-plano',
      autoRenew: false,
      createdAt: user.created_at
    }));
    
    console.log('✅ [Users API] Usuários sem planos mapeados com sucesso');
    console.log(`📊 [Users API] Total de usuários sem planos retornados: ${mappedUsers.length}`);
    
    res.json({
      success: true,
      usersWithoutPlans: mappedUsers,
      count: mappedUsers.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários sem planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Atualizar plano do usuário (admin only)
router.put('/:id/plan', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id, is_vip, vip_expires_at, account_type, notes } = req.body;
    
    console.log(`🔄 Atualizando plano do usuário ${id}...`);
    console.log('📋 Dados recebidos:', { plan_id, is_vip, vip_expires_at, account_type, notes });
    
    // Verificar se o usuário existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o plano existe
    if (plan_id) {
      const { Plan } = require('../models');
      const plan = await Plan.findByPk(plan_id);
      if (!plan) {
        return res.status(400).json({
          success: false,
          message: 'Plano não encontrado'
        });
      }
    }
    
    // Atualizar usuário
    const updateData = {};
    if (plan_id !== undefined) updateData.plan_id = plan_id;
    if (is_vip !== undefined) updateData.is_vip = is_vip;
    if (vip_expires_at !== undefined) updateData.vip_expires_at = vip_expires_at;
    if (account_type !== undefined) updateData.account_type = account_type;
    
    await user.update(updateData);
    
    console.log(`✅ Plano do usuário ${id} atualizado com sucesso`);
    
    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        plan_id: user.plan_id,
        is_vip: user.is_vip,
        vip_expires_at: user.vip_expires_at,
        account_type: user.account_type
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar plano do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'email', 'is_admin', 'is_vip',
        'vip_expires_at', 'account_type', 'cpf', 'phone', 'created_at', 'last_login'
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
      account_type: user.account_type || 'user',
      status: 'active',

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
      account_type: user.account_type || 'user',

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
    console.log('🔄 PUT /api/users/:id - Iniciando atualização...')
    const { id } = req.params;
    const { name, email, role, account_type, plan, status } = req.body;
    
    console.log('Backend: Dados recebidos:', { id, name, email, role, account_type, plan, status })

    const user = await User.findByPk(id);

    if (!user) {
      console.log('Backend: Usuário não encontrado')
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log('Backend: Usuário encontrado:', { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      account_type: user.account_type 
    })

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    
    // Atualizar is_admin diretamente (removendo dependência do account_type)
    if (account_type) {
      console.log('Backend: Atualizando is_admin baseado no account_type:', account_type)
      
      // Atualizar is_admin baseado no account_type
      if (account_type === 'admin') {
        console.log('Backend: Definindo is_admin como true')
        user.is_admin = true;
      } else {
        console.log('Backend: Definindo is_admin como false')
        user.is_admin = false;
      }
    }

    if (status) user.status = status;

    await user.save();
    console.log('Backend: Usuário salvo no banco')
    
    // Se o usuário foi promovido a admin ou removido de admin, invalidar suas sessões
    if (account_type && (account_type === 'admin' || account_type === 'user')) {
      console.log('Backend: Invalidando sessões do usuário devido a mudança de status admin')
      try {
        await UserSession.destroy({
          where: { user_id: user.id }
        });
        console.log('Backend: Sessões do usuário invalidadas com sucesso')
      } catch (sessionError) {
        console.log('Backend: Erro ao invalidar sessões (não crítico):', sessionError.message)
      }
    }

    const responseData = {
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.is_admin ? 'admin' : 'user',
        is_admin: user.is_admin,
        status: user.status,
        updated_at: user.updated_at
      }
    };
    
    console.log('Backend: Resposta sendo enviada:', responseData)
    res.json(responseData);

  } catch (error) {
    console.error('Backend: Erro ao atualizar usuário:', error);
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

// Alterar status do usuário
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    console.log('🔄 [Status Update] Iniciando alteração de status...');
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 [Status Update] Dados recebidos:', { userId: id, newStatus: status });
    
    if (!status || !['active', 'inactive'].includes(status)) {
      console.log('❌ [Status Update] Status inválido:', status);
      return res.status(400).json({
        error: 'Status inválido. Deve ser "active" ou "inactive"'
      });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      console.log('❌ [Status Update] Usuário não encontrado:', id);
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    console.log('✅ [Status Update] Usuário encontrado:', {
      id: user.id,
      email: user.email,
      statusAtual: user.status,
      novoStatus: status
    });
    
    // Atualizar status
    const statusAnterior = user.status;
    user.status = status;
    
    console.log('💾 [Status Update] Salvando no banco...');
    await user.save();
    
    console.log('✅ [Status Update] Status alterado com sucesso:', {
      id: user.id,
      statusAnterior,
      statusNovo: user.status
    });
    
    res.json({
      success: true,
      message: `Status do usuário alterado para ${status}`,
      user: {
        id: user.id,
        status: user.status
      }
    });
    
  } catch (error) {
    console.error('❌ [Status Update] Erro ao alterar status do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Alterar senha do usuário (admin only)
router.patch('/:id/password', requireAdmin, async (req, res) => {
  try {
    console.log('🔐 [Change Password] Iniciando alteração de senha...')
    const { id } = req.params;
    const { newPassword } = req.body;
    
    console.log('🔐 [Change Password] Dados recebidos:', { userId: id, hasPassword: !!newPassword })
    
    // Validações
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha é obrigatória'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }
    
    if (newPassword.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'A senha deve ter no máximo 50 caracteres'
      });
    }
    
    // Buscar usuário
    const user = await User.findByPk(id);
    if (!user) {
      console.log('❌ [Change Password] Usuário não encontrado:', id)
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    console.log('✅ [Change Password] Usuário encontrado:', { 
      id: user.id, 
      email: user.email, 
      username: user.username 
    })
    
    // Hash da nova senha
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha
    user.password_hash = passwordHash;
    await user.save();
    
    console.log('✅ [Change Password] Senha alterada com sucesso para usuário:', user.email)
    
    // Log da ação para auditoria
    console.log('📝 [AUDIT] Senha alterada:', {
      userId: user.id,
      userEmail: user.email,
      adminId: req.user.id,
      adminEmail: req.user.email,
      timestamp: new Date().toISOString()
    })
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [Change Password] Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
