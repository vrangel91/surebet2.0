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
      data: {
        accounts: accounts
      }
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
    if (!bookmaker_name) {
      return res.status(400).json({
        success: false,
        message: 'Casa de apostas é obrigatória'
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
        message: 'Casa de apostas deve ter pelo menos 2 caracteres'
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

    // Verificar se há transações associadas (apenas para log)
    const transactionCount = await TransactionHistory.count({
      where: { bookmaker_account_id: req.params.id }
    });

    // Log da operação antes da exclusão
    console.log(`🗑️ Excluindo conta: ${account.bookmaker_name} (ID: ${account.id})`);
    console.log(`💰 Saldo da conta: ${account.balance}`);
    console.log(`📊 Transações associadas: ${transactionCount}`);

    // Excluir transações associadas primeiro (cascade delete)
    if (transactionCount > 0) {
      await TransactionHistory.destroy({
        where: { bookmaker_account_id: req.params.id }
      });
      console.log(`🗑️ ${transactionCount} transação(ões) excluída(s)`);
    }

    // Excluir a conta
    await account.destroy();

    res.json({
      success: true,
      message: 'Conta excluída com sucesso',
      data: {
        deletedAccount: account.bookmaker_name,
        balance: account.balance,
        transactionsDeleted: transactionCount
      }
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

// POST /api/bookmaker-accounts/:id/adjust-balance - Ajustar saldo da conta
router.post('/:id/adjust-balance', async (req, res) => {
  try {
    console.log('💰 Iniciando ajuste de saldo para conta ID:', req.params.id);
    console.log('📊 Dados recebidos:', req.body);
    
    const { amount, description, type } = req.body;

    if (!amount || isNaN(amount)) {
      console.log('❌ Valor inválido:', amount);
      return res.status(400).json({
        success: false,
        message: 'Valor do ajuste deve ser um número válido'
      });
    }

    console.log('🔍 Buscando conta...');
    const account = await BookmakerAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      console.log('❌ Conta não encontrada');
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }

    console.log('✅ Conta encontrada:', account.bookmaker_name, 'Saldo atual:', account.balance);

    if (account.status !== 'active') {
      console.log('❌ Conta não está ativa:', account.status);
      return res.status(400).json({
        success: false,
        message: 'Conta não está ativa'
      });
    }

    const adjustAmount = parseFloat(amount);
    const currentBalance = parseFloat(account.balance);
    const newBalance = currentBalance + adjustAmount;

    console.log('📊 Cálculos:', {
      adjustAmount,
      currentBalance,
      newBalance
    });

    // Verificar se o novo saldo não ficará negativo
    if (newBalance < 0) {
      console.log('❌ Saldo ficaria negativo:', newBalance);
      return res.status(400).json({
        success: false,
        message: 'Ajuste resultaria em saldo negativo'
      });
    }

    console.log('💾 Atualizando saldo da conta...');
    // Atualizar saldo da conta
    await account.update({
      balance: newBalance,
      last_updated: new Date()
    });

    console.log('✅ Saldo atualizado com sucesso');

    console.log('📝 Criando transação...');
    // Criar transação de ajuste
    const transaction = await TransactionHistory.create({
      user_id: req.user.id,
      bookmaker_account_id: account.id,
      transaction_type: 'adjustment',
      amount: Math.abs(adjustAmount), // Sempre positivo para o histórico
      balance_before: currentBalance,
      balance_after: newBalance,
      description: description || `Ajuste de saldo: ${adjustAmount > 0 ? '+' : ''}${adjustAmount.toFixed(2)}`,
      status: 'completed',
      reference_id: type || 'manual_adjustment'
    });

    console.log('✅ Transação criada com sucesso:', transaction.id);

    res.json({
      success: true,
      message: 'Saldo ajustado com sucesso',
      data: {
        transaction,
        newBalance,
        adjustment: adjustAmount
      }
    });
  } catch (error) {
    console.error('❌ Erro ao ajustar saldo:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
