/**
 * Rotas para consultar status de pagamentos
 */

const express = require('express');
const router = express.Router();
const { Order } = require('../models');
// Middleware de autenticação simples (sem arquivo separado)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de acesso requerido' });
  }

  // Para testes, aceitar qualquer token
  // Em produção, você deve verificar o JWT aqui
  req.user = { id: 1 }; // Simular usuário ID 1
  next();
};

/**
 * Consultar status de um pagamento específico
 */
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Consultando status do pagamento ${paymentId} para usuário ${userId}`);

    // Buscar pedido pelo payment_id
    const order = await Order.findOne({
      where: {
        payment_id: paymentId,
        user_id: userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado'
      });
    }

    // Retornar status do pagamento
    res.json({
      success: true,
      data: {
        paymentId: order.payment_id,
        status: order.status,
        planId: order.plan_id,
        planName: order.plan_name,
        amount: order.amount,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        paymentData: order.payment_data
      }
    });

  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Consultar todos os pagamentos do usuário
 */
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🔍 Consultando pagamentos do usuário ${userId}`);

    const orders = await Order.findAll({
      where: {
        user_id: userId
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: orders.map(order => ({
        paymentId: order.payment_id,
        status: order.status,
        planId: order.plan_id,
        planName: order.plan_name,
        amount: order.amount,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }))
    });

  } catch (error) {
    console.error('Erro ao consultar pagamentos do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Consultar status de pagamento pendente (para polling)
 */
router.get('/pending/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 Verificando pagamento pendente ${orderId} para usuário ${userId}`);

    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    // Se o pagamento foi aprovado, retornar informações do VIP
    if (order.status === 'approved') {
      // Buscar informações do VIP ativado
      const { UserVIP } = require('../models');
      const vipInfo = await UserVIP.findOne({
        where: {
          user_id: userId,
          order_id: orderId
        },
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          status: 'approved',
          orderId: order.id,
          paymentId: order.payment_id,
          planId: order.plan_id,
          planName: order.plan_name,
          amount: order.amount,
          vipActivated: !!vipInfo,
          vipDetails: vipInfo ? {
            planId: vipInfo.plan_id,
            planName: vipInfo.plan_name,
            expiresAt: vipInfo.data_fim,
            status: vipInfo.status
          } : null
        }
      });
    }

    // Pagamento ainda pendente
    res.json({
      success: true,
      data: {
        status: order.status,
        orderId: order.id,
        paymentId: order.payment_id,
        planId: order.plan_id,
        planName: order.plan_name,
        amount: order.amount,
        vipActivated: false
      }
    });

  } catch (error) {
    console.error('Erro ao verificar pagamento pendente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
