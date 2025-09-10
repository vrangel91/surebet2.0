const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { 
  generateToken, 
  createUserSession, 
  invalidateSession,
  authenticateToken 
} = require('../utils/auth');

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 [Auth] Rota de login chamada')
    console.log('🔍 [Auth] Request body:', req.body)
    console.log('🔍 [Auth] Request headers:', req.headers)
    
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      console.log('❌ [Auth] Dados obrigatórios ausentes:', { email: !!email, password: !!password })
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    console.log('🔍 [Auth] Tentativa de login para:', email);

    // Buscar usuário diretamente no banco
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'password_hash', 'is_admin', 'is_vip', 'account_type', 'created_at']
    });

    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({
        error: 'E-mail ou senha incorretos'
      });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
      return res.status(401).json({
        error: 'E-mail ou senha incorretos'
      });
    }

    console.log('✅ Senha válida para:', email);

    // Verificar privilégios - permitir todos os usuários logarem
    // if (!user.is_admin && !user.is_vip) {
    //   console.log('❌ Usuário sem privilégios:', email);
    //   return res.status(401).json({
    //     error: 'Conta sem privilégios. Entre em contato com o suporte.'
    //   });
    // }

    // Gerar token simples
    const token = generateToken(user);

    // Atualizar último login do usuário
    await user.update({ last_login: new Date() });

    // Criar sessão no banco
    await createUserSession(user, token, req);

    // Retornar dados do usuário (sem senha) - mapeando para formato esperado pelo frontend
    const userData = {
      id: user.id,
      username: user.username,
      name: user.username, // Mapeamento para compatibilidade
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin,
      is_vip: user.is_vip,
      account_type: user.account_type || 'basic',
      plan: user.account_type || 'basic', // Usar account_type como plan
      can_use_system: true, // Todos os usuários podem usar o sistema
      // Mapeamento para propriedades esperadas pelo frontend
      role: user.is_admin ? 'admin' : 'user',
      accountType: user.account_type || (user.is_vip ? 'vip' : (user.is_admin ? 'admin' : 'basic')),
      
      status: 'active',
      lastLogin: user.last_login // Incluir último login
    };

    console.log('✅ [Auth] Login bem-sucedido para:', email);
    console.log('🔍 [Auth] Dados do usuário a serem retornados:', userData);

    const responseData = {
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userData
    };
    
    console.log('🔍 [Auth] Response data:', responseData);
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    console.log('🔍 [Auth] Rota de registro chamada')
    console.log('🔍 [Auth] Request body:', req.body)
    console.log('🔍 [Auth] Request headers:', req.headers)
    
    const { name, email, password, referer_id } = req.body;

    // Validações
    if (!name || !email || !password) {
      console.log('❌ [Auth] Dados obrigatórios ausentes:', { name: !!name, email: !!email, password: !!password })
      return res.status(400).json({
        error: 'Nome, e-mail e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se e-mail já existe
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['id', 'email', 'account_type']
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Verificar se o referer_id é válido (se fornecido)
    let referrerUser = null;
    if (referer_id) {
      console.log(`🔍 Verificando código de referência: ${referer_id}`);
      referrerUser = await User.findOne({
        where: { referral_code: referer_id },
        attributes: ['id', 'username', 'email']
      });
      
      if (!referrerUser) {
        console.log(`⚠️ Código de referência inválido: ${referer_id}`);
        // Não falha o registro, apenas ignora o referer_id inválido
      } else {
        console.log(`✅ Referenciador válido encontrado: ${referrerUser.username} (${referrerUser.email}) - ID: ${referrerUser.id}`);
      }
    }

    // Criar usuário
    const user = await User.create({
      username: name, // Usar o nome como username para evitar constraint NOT NULL
      first_name: name.split(' ')[0] || name, // Primeiro nome
      last_name: name.split(' ').slice(1).join(' ') || '', // Sobrenome
      email: email.toLowerCase(),
      password_hash: password, // Será hasheada automaticamente
      account_type: 'basic', // Usuário ganha privilégio BÁSICO automaticamente
      is_admin: false,
      is_vip: false,
      referred_by: referrerUser ? referrerUser.id : null // Inclui o ID do referenciador se válido
    });

    if (referrerUser) {
      console.log(`✅ Usuário criado com sucesso e vinculado ao referenciador: ${referrerUser.username} (ID: ${referrerUser.id})`);
    } else {
      console.log(`✅ Usuário criado com sucesso sem referenciador`);
    }

    // Gerar token
    const token = generateToken(user);

    // Criar sessão
    await createUserSession(user, token, req);

    // Retornar dados do usuário
    const userData = {
      id: user.id,
      username: user.username,
      name: user.username, // Usar username como name para compatibilidade
      email: user.email,
      is_admin: user.is_admin,
      is_vip: user.is_vip,
      account_type: user.account_type,
      can_use_system: true // Usuários básicos também podem usar o sistema
    };

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Rota de logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    
    // Invalidar sessão
    await invalidateSession(token);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const userData = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      is_admin: req.user.is_admin,
      is_vip: req.user.is_vip,
      account_type: req.user.account_type || 'basic',
      can_use_system: true
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});



module.exports = router;
