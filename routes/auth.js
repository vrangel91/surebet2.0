const express = require('express');
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
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Verificar se está bloqueado
    if (user.isLocked()) {
      const remainingTime = Math.ceil((user.locked_until - new Date()) / 1000 / 60);
      return res.status(423).json({
        error: `Conta bloqueada. Tente novamente em ${remainingTime} minutos.`
      });
    }

    // Verificar senha
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        error: 'E-mail ou senha incorretos'
      });
    }

    // Resetar tentativas de login
    await user.resetLoginAttempts();

    // Gerar token
    const token = generateToken(user);

    // Criar sessão
    await createUserSession(user, token, req);

    // Retornar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      credits: user.credits,
      status: user.status,
      last_login: user.last_login,
      can_use_system: user.canUseSystem()
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
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
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail já cadastrado'
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: password, // Será hasheada automaticamente
      role: 'user',
      account_type: 'basic',
      credits: 5, // 5 créditos gratuitos
      status: 'active'
    });

    // Gerar token
    const token = generateToken(user);

    // Criar sessão
    await createUserSession(user, token, req);

    // Retornar dados do usuário
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      credits: user.credits,
      status: user.status,
      last_login: user.last_login,
      can_use_system: user.canUseSystem()
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
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      account_type: req.user.account_type,
      credits: req.user.credits,
      status: req.user.status,
      last_login: req.user.last_login,
      can_use_system: req.user.canUseSystem()
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

// Rota para consumir crédito
router.post('/consume-credit', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'admin') {
      return res.json({
        success: true,
        message: 'Administradores não consomem créditos'
      });
    }

    const consumed = await user.consumeCredit();

    if (consumed) {
      res.json({
        success: true,
        message: 'Crédito consumido com sucesso',
        credits_remaining: user.credits
      });
    } else {
      res.status(403).json({
        error: 'Créditos insuficientes'
      });
    }

  } catch (error) {
    console.error('Erro ao consumir crédito:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
