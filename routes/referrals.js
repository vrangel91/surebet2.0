const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken } = require('../utils/auth');

// Middleware de autenticação
router.use(authenticateToken);

// GET /api/referrals/my-status - Obter status de referências do usuário atual
router.get('/my-status', async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de status de referências...');
    const userId = req.user.id;
    console.log('👤 User ID:', userId);
    
    // Buscar usuário básico primeiro
    const user = await User.findByPk(userId);
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    // Verificar se tem código de referência
    if (!user.referral_code) {
      console.log('🔑 Gerando código de referência...');
      user.referral_code = generateReferralCode();
      await user.save();
      console.log('✅ Código gerado:', user.referral_code);
    }
    
    // Buscar usuários referidos (versão simplificada)
    console.log('🔍 Buscando usuários referidos...');
    const referredUsers = await User.findAll({
      where: { referred_by: userId },
      attributes: ['id', 'username', 'first_name', 'last_name', 'account_type', 'created_at']
    });
    console.log('👥 Usuários referidos encontrados:', referredUsers.length);
    
    // Calcular comissões simuladas
    let totalCommission = 0;
    const referredUsersWithCommission = referredUsers.map(refUser => {
      const planValue = refUser.account_type === 'vip' ? 100.00 : 50.00;
      const commission = planValue * 0.25;
      totalCommission += commission;
      
      return {
        id: refUser.id,
        name: refUser.first_name && refUser.last_name 
          ? `${refUser.first_name} ${refUser.last_name}` 
          : refUser.username || 'Usuário',
        planValue: planValue,
        commission: commission,
        joinedAt: refUser.created_at
      };
    });
    
    const responseData = {
      success: true,
      referralData: {
        referralCode: user.referral_code,
        commissionBalance: user.commission_balance || 0,
        totalEarned: totalCommission,
        referredUsers: referredUsersWithCommission,
        affiliateLink: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?referer_id=${user.referral_code}`
      }
    };
    
    console.log('✅ Resposta preparada com sucesso');
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Erro detalhado:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

// POST /api/referrals/withdraw - Solicitar saque de comissão
router.post('/withdraw', async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valor inválido para saque' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    if ((user.commission_balance || 0) < amount) {
      return res.status(400).json({ success: false, message: 'Saldo insuficiente para saque' });
    }
    
    // Atualizar saldo de comissão
    user.commission_balance = (user.commission_balance || 0) - amount;
    await user.save();
    
    res.json({
      success: true,
      message: 'Saque solicitado com sucesso',
      newBalance: user.commission_balance,
      withdrawalAmount: amount
    });
    
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/referrals/history - Obter histórico de saques
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    
    res.json({
      success: true,
      withdrawals: []
    });
    
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Função para gerar código de referência único
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;
