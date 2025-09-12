const express = require('express');
const router = express.Router();
const { User, UserVIP } = require('../models');
const { authenticateToken } = require('../utils/auth');
const { Op } = require('sequelize');

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
    
        // Buscar usuários referidos com informações de planos VIP
    console.log('🔍 Buscando usuários referidos...');
    const referredUsers = await User.findAll({
      where: { referred_by: userId },
      attributes: ['id', 'username', 'first_name', 'last_name', 'account_type', 'created_at'],
      include: [{
        model: UserVIP,
        as: 'vipPlans',
        where: { 
          status: 'ativo',
          data_fim: { [Op.gt]: new Date() }
        },
        required: false,
        attributes: ['plan_name', 'plan_days', 'amount', 'data_inicio', 'data_fim']
      }]
    });
    console.log('👥 Usuários referidos encontrados:', referredUsers.length);
    
    // Log detalhado de cada usuário referido
    referredUsers.forEach((refUser, index) => {
      console.log(`👤 Usuário ${index + 1}: ${refUser.username || refUser.first_name}`);
      if (refUser.vipPlans && refUser.vipPlans.length > 0) {
        refUser.vipPlans.forEach((plan, planIndex) => {
          console.log(`  📋 Plano ${planIndex + 1}: ${plan.plan_name} - ${plan.plan_days} dias - R$ ${plan.amount}`);
        });
      } else {
        console.log(`  ❌ Sem planos VIP ativos`);
      }
    });
    
    // Calcular comissões baseadas em planos VIP ativos
    let totalCommission = 0;
    const referredUsersWithCommission = referredUsers.map(refUser => {
      let planValue = 0;
      let commission = 0;
      let planInfo = null;
      let status = 'pending'; // pending, active, no-plan
      
      // Verificar se tem plano VIP ativo
      if (refUser.vipPlans && refUser.vipPlans.length > 0) {
        const activePlan = refUser.vipPlans[0]; // Pegar o primeiro plano ativo
        planValue = activePlan.amount || 0;
        
        // Só calcular comissão se o plano for de pelo menos 30 dias (mensal ou anual)
        if (activePlan.plan_days >= 30 && planValue >= 19.90) {
          commission = planValue * 0.25; // 25% de comissão
          status = 'active';
          planInfo = {
            name: activePlan.plan_name,
            days: activePlan.plan_days,
            amount: planValue
          };
        } else {
          status = 'pending';
        }
      } else {
        status = 'no-plan';
      }
      
      return {
        id: refUser.id,
        name: refUser.first_name && refUser.last_name 
          ? `${refUser.first_name} ${refUser.last_name}` 
          : refUser.username || 'Usuário',
        planValue: planValue,
        commission: commission,
        hasActivePlan: planValue > 0,
        planInfo: planInfo,
        status: status,
        joinedAt: refUser.created_at
      };
    });
    
    // Calcular total de comissões apenas com usuários que têm planos ativos
    totalCommission = referredUsersWithCommission
      .filter(user => user.status === 'active')
      .reduce((total, user) => total + user.commission, 0);
    
    console.log('💰 Comissões calculadas:');
    referredUsersWithCommission.forEach((user, index) => {
      console.log(`  💵 ${user.name}: R$ ${user.planValue} → Comissão: R$ ${user.commission}`);
    });
    console.log(`  🎯 Total de comissões: R$ ${totalCommission}`);
    
    const responseData = {
      success: true,
      referralData: {
        referralCode: user.referral_code,
        commissionBalance: user.commission_balance || 0,
        totalEarned: totalCommission,
        referredUsers: referredUsersWithCommission,
        affiliateLink: `${process.env.FRONTEND_URL || 'https://surestake.com.br'}/login?referer_id=${user.referral_code}`
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
