const express = require('express');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../utils/auth');

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'name', 'email', 'role', 'account_type', 'credits', 
        'status', 'last_login', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      users
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
        'id', 'name', 'email', 'role', 'account_type', 'credits', 
        'status', 'last_login', 'login_attempts', 'locked_until',
        'last_credit_consumption', 'created_at', 'updated_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, account_type, credits } = req.body;

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
      password_hash: password,
      role: role || 'user',
      account_type: account_type || 'basic',
      credits: credits || 0,
      status: 'active'
    });

    // Retornar dados sem senha
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      credits: user.credits,
      status: user.status,
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
    const { name, email, role, account_type, credits, status } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se e-mail já existe (se foi alterado)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'E-mail já cadastrado'
        });
      }
    }

    // Atualizar campos
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (account_type) updateData.account_type = account_type;
    if (credits !== undefined) updateData.credits = credits;
    if (status) updateData.status = status;

    await user.update(updateData);

    // Retornar dados atualizados
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      credits: user.credits,
      status: user.status,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: userData
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Alterar senha do usuário
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar senha
    user.password_hash = password; // Será hasheada automaticamente
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Adicionar créditos
router.post('/:id/credits', async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Quantidade de créditos deve ser maior que zero'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Adicionar créditos
    await user.addCredits(amount);

    res.json({
      success: true,
      message: `${amount} crédito(s) adicionado(s) com sucesso`,
      credits_remaining: user.credits
    });

  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Desbloquear usuário
router.post('/:id/unlock', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Desbloquear usuário
    await user.resetLoginAttempts();

    res.json({
      success: true,
      message: 'Usuário desbloqueado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Não permitir deletar administradores
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Não é possível deletar administradores'
      });
    }

    // Deletar usuário
    await user.destroy();

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
