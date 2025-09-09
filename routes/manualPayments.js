const express = require('express');
const router = express.Router();
const manualPaymentProcessor = require('../utils/manualPaymentProcessor');
const { logger } = require('../utils/logger');

// Middleware de autenticação (apenas para admin)
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024');
    
    // Verificar se é admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Listar pedidos pendentes
 * GET /api/manual-payments/pending
 */
router.get('/pending', authenticateAdmin, async (req, res) => {
  try {
    const result = await manualPaymentProcessor.getPendingOrders();
    
    if (result.success) {
      res.json({
        success: true,
        orders: result.orders,
        count: result.orders.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Erro ao listar pedidos pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Verificar status de um pedido
 * GET /api/manual-payments/status/:orderId
 */
router.get('/status/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await manualPaymentProcessor.getOrderStatus(orderId);
    
    if (result.success) {
      res.json({
        success: true,
        order: result.order
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Erro ao verificar status do pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Processar pagamento manualmente
 * POST /api/manual-payments/process/:orderId
 */
router.post('/process/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId } = req.body;
    
    logger.info(`🔄 Processando pagamento manual: ${orderId}`);
    
    const result = await manualPaymentProcessor.processPayment(orderId, paymentId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Pagamento processado com sucesso',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Erro ao processar pagamento manual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Processar todos os pedidos pendentes
 * POST /api/manual-payments/process-all
 */
router.post('/process-all', authenticateAdmin, async (req, res) => {
  try {
    logger.info('🔄 Processando todos os pedidos pendentes...');
    
    const result = await manualPaymentProcessor.processAllPendingOrders();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        results: result.results
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Erro ao processar todos os pedidos pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Testar webhook
 * POST /api/manual-payments/test-webhook
 */
router.post('/test-webhook', authenticateAdmin, async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    
    // Simular webhook do MercadoPago
    const webhookData = {
      type: 'payment',
      action: 'payment.created',
      data: {
        id: paymentId || `TEST_${Date.now()}`
      },
      date_created: new Date().toISOString(),
      id: Date.now(),
      live_mode: false,
      user_id: 1
    };
    
    // Processar webhook
    const paymentService = require('../services/paymentService');
    const result = await paymentService.processPaymentWebhook(webhookData);
    
    res.json({
      success: true,
      message: 'Webhook testado com sucesso',
      webhookData: webhookData,
      result: result
    });
    
  } catch (error) {
    logger.error('Erro ao testar webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
