const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { logger } = require('../utils/logger');

/**
 * Webhook para receber notificações de pagamento
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    const payload = JSON.stringify(req.body);

    // Verificar assinatura do webhook (opcional, mas recomendado)
    if (signature && !paymentService.verifyWebhookSignature(payload, signature)) {
      logger.warn('Assinatura de webhook inválida');
      return res.status(401).json({
        success: false,
        error: 'Assinatura inválida'
      });
    }

    // Processar webhook
    const result = await paymentService.processPaymentWebhook(req.body);

    if (result.success) {
      logger.info('Webhook processado com sucesso:', result);
      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
        data: result
      });
    } else {
      logger.error('Erro ao processar webhook:', result);
      res.status(400).json({
        success: false,
        error: result.error || 'Erro ao processar webhook'
      });
    }

  } catch (error) {
    logger.error('Erro no webhook de pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Obter planos disponíveis
 * GET /api/payments/plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = paymentService.getPlans();
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    logger.error('Erro ao obter planos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Obter status VIP do usuário
 * GET /api/payments/vip-status/:userId
 */
router.get('/vip-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const vipStatus = await paymentService.getUserVIPStatus(userId);
    
    res.json({
      success: true,
      ...vipStatus
    });
  } catch (error) {
    logger.error('Erro ao verificar status VIP:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Criar pedido de pagamento
 * POST /api/payments/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { userId, planId, paymentMethod } = req.body;

    // Verificar se o plano existe
    const plan = paymentService.getPlan(planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Plano não encontrado'
      });
    }

    // Aqui você integraria com o gateway de pagamento (MercadoPago, PagSeguro, etc.)
    // Por enquanto, vamos simular a criação de um pedido
    
    const orderData = {
      orderId: `ORDER_${Date.now()}_${userId}`,
      userId: userId,
      planId: planId,
      amount: plan.price,
      planName: plan.name,
      planDays: plan.days,
      paymentMethod: paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    logger.info('Pedido criado:', orderData);

    res.json({
      success: true,
      message: 'Pedido criado com sucesso',
      order: orderData
    });

  } catch (error) {
    logger.error('Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Simular pagamento aprovado (para testes)
 * POST /api/payments/simulate-payment
 */
router.post('/simulate-payment', async (req, res) => {
  try {
    const { userId, planId, paymentId } = req.body;

    // Verificar se o plano existe
    const plan = paymentService.getPlan(planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Plano não encontrado'
      });
    }

    // Simular webhook de pagamento aprovado
    const webhookData = {
      event_type: 'payment.approved',
      payment_id: paymentId || `PAY_${Date.now()}`,
      user_id: userId,
      plan_id: planId,
      amount: plan.price,
      status: 'approved',
      payment_method: 'credit_card',
      created_at: new Date().toISOString()
    };

    // Processar pagamento
    const result = await paymentService.processPaymentWebhook(webhookData);

    res.json({
      success: true,
      message: 'Pagamento simulado com sucesso',
      result: result
    });

  } catch (error) {
    logger.error('Erro ao simular pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
