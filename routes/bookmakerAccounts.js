const express = require('express');
const router = express.Router();
const { BookmakerAccount, TransactionHistory, User } = require('../models');
const { authenticateToken } = require('../utils/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/bookmaker-accounts - Listar todas as contas do usuário
router.get('/', async (req, res) => {
  try {
    const accounts = await BookmakerAccount.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/bookmaker-accounts - Criar nova conta
router.post('/', async (req, res) => {
  try {
    const { bookmaker_name, balance, currency, notes } = req.body;

    // Validações
    if (!bookmaker_name || bookmaker_name.trim().length < 2) {
      return res.status(400)
      ({
        success: false,
        message: 'Nome da casa de apostas é obrigatório e deve ter pelo menos 2 caracteres'
      });
    }

    if (balance && (isNaN(balance) || parseFloat(balance) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Saldo deve ser um número positivo'
      });
    }

    // Verificar se já existe uma conta com este nome para o usuário
    const existingAccount = await BookmakerAccount.findOne({
      where: {
        user_id: req.user.id,
        bookmaker_name: bookmaker_name.trim()
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma conta para esta casa de apostas'
      });
    }

    // Criar nova conta
    const account = await BookmakerAccount.create({
      user_id: req.user.id,
      bookmaker_name: bookmaker_name.trim(),
      balance: balance || 0.00,
      currency: currency || 'BRL',
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso',
      data: account
    });
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/bookmaker-accounts/:id - Obter detalhes de uma conta específica
router.get('/:id', async (req, res) => {
  try {
    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: TransactionHistory,
          as: 'transactions',
          order: [['created_at', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/bookmaker-accounts/:id - Atualizar conta
router.put('/:id', async (req, res) => {
  try {
    const { bookmaker_name, balance, currency, notes, status } = req.body;

    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    // Validações
    if (bookmaker_name && bookmaker_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Nome da casa de apostas deve ter pelo menos 2 caracteres'
      });
    }

    if (balance !== undefined && (isNaN(balance) || parseFloat(balance) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Saldo deve ser um número positivo'
      });
    }

    // Verificar se o novo nome já existe (se estiver sendo alterado)
    if (bookmaker_name && bookmaker_name.trim() !== account.bookmaker_name) {
      const existingAccount = await BookmakerAccount.findOne({
        where: {
          user_id: req.user.id,
          bookmaker_name: bookmaker_name.trim(),
          id: { [require('sequelize').Op.ne]: req.params.id }
        }
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma conta para esta casa de apostas'
        });
      }
    }

    // Atualizar conta
    const updatedAccount = await account.update({
      bookmaker_name: bookmaker_name ? bookmaker_name.trim() : account.bookmaker_name,
      balance: balance !== undefined ? parseFloat(balance) : account.balance,
      currency: currency || account.currency,
      notes: notes !== undefined ? notes : account.notes,
      status: status || account.status
    });

    res.json({
      success: true,
      message: 'Conta atualizada com sucesso',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/bookmaker-accounts/:id - Excluir conta
router.delete('/:id', async (req, res) => {
  try {
    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    // Verificar se há transações associadas
    const transactionCount = await TransactionHistory.count({
      where: { bookmaker_account_id: req.params.id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir uma conta que possui histórico de transações'
      });
    }

    await account.destroy();

    res.json({
      success: true,
      message: 'Conta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/bookmaker-accounts/:id/withdraw - Fazer saque (fictício)
router.post('/:id/withdraw', async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor do saque deve ser um número positivo'
      });
    }

    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    if (account.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Conta não está ativa'
      });
    }

    const withdrawAmount = parseFloat(amount);
    const currentBalance = parseFloat(account.balance);

    if (currentBalance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar o saque'
      });
    }

    // Criar transação de saque
    const transaction = await TransactionHistory.create({
      user_id: req.user.id,
      bookmaker_account_id: account.id,
      transaction_type: 'withdrawal',
      amount: withdrawAmount,
      balance_before: currentBalance,
      balance_after: currentBalance - withdrawAmount,
      description: description || `Saque de R$ ${withdrawAmount.toFixed(2)}`,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Saque realizado com sucesso',
      data: {
        transaction,
        newBalance: currentBalance - withdrawAmount
      }
    });
  } catch (error) {
    console.error('Erro ao realizar saque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/bookmaker-accounts/:id/deposit - Fazer depósito
router.post('/:id/deposit', async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor do depósito deve ser um número positivo'
      });
    }

    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    if (account.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Conta não está ativa'
      });
    }

    const depositAmount = parseFloat(amount);
    const currentBalance = parseFloat(account.balance);

    // Criar transação de depósito
    const transaction = await TransactionHistory.create({
      user_id: req.user.id,
      bookmaker_account_id: account.id,
      transaction_type: 'deposit',
      amount: depositAmount,
      balance_before: currentBalance,
      balance_after: currentBalance + depositAmount,
      description: description || `Depósito de R$ ${depositAmount.toFixed(2)}`,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Depósito realizado com sucesso',
      data: {
        transaction,
        newBalance: currentBalance + depositAmount
      }
    });
  } catch (error) {
    console.error('Erro ao realizar depósito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/bookmaker-accounts/:id/transactions - Obter histórico de transações
router.get('/:id/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Verificar se a conta pertence ao usuário
    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    const transactions = await TransactionHistory.findAndCountAll({
      where: { bookmaker_account_id: req.params.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalItems: transactions.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
