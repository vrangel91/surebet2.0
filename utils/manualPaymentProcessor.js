/**
 * Processador Manual de Pagamentos
 * Para processar pagamentos quando o webhook não funciona
 */

const { Order, User, UserVIP } = require('../models');
const paymentService = require('../services/paymentService');
const { logger } = require('./logger');

class ManualPaymentProcessor {
  constructor() {
    this.processedPayments = new Set();
  }

  /**
   * Processar pagamento manualmente
   */
  async processPayment(orderId, paymentId = null) {
    try {
      logger.info(`🔄 Processando pagamento manual: ${orderId}`);

      // Buscar pedido
      const order = await Order.findByPk(orderId, {
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!order) {
        throw new Error(`Pedido ${orderId} não encontrado`);
      }

      if (order.status !== 'pending') {
        logger.warn(`Pedido ${orderId} já foi processado (status: ${order.status})`);
        return {
          success: false,
          message: `Pedido já processado com status: ${order.status}`
        };
      }

      // Verificar se o usuário existe
      if (!order.user) {
        throw new Error(`Usuário não encontrado para o pedido ${orderId}`);
      }

      // Obter plano
      const plan = paymentService.getPlan(order.plan_id);
      if (!plan) {
        throw new Error(`Plano ${order.plan_id} não encontrado`);
      }

      // Atualizar status do pedido
      await order.update({
        status: 'approved',
        payment_data: {
          ...order.payment_data,
          manual_processing: true,
          processed_at: new Date().toISOString(),
          payment_id: paymentId || `MANUAL_${orderId}`
        }
      });

      // Ativar VIP
      const vipResult = await paymentService.activateVIP(
        order.user,
        plan,
        paymentId || `MANUAL_${orderId}`
      );

      if (vipResult.success) {
        logger.info(`✅ VIP ativado para usuário ${order.user.id}`, vipResult);
        
        // Criar notificação de pagamento confirmado
        const paymentService = require('../services/paymentService');
        await paymentService.createPaymentConfirmationNotification(
          order.user.id, 
          plan, 
          paymentId || `MANUAL_${orderId}`
        );
        
        // Marcar como processado
        this.processedPayments.add(orderId);
        
        return {
          success: true,
          message: 'Pagamento processado com sucesso',
          order: {
            id: order.id,
            status: order.status,
            planName: order.plan_name,
            amount: order.amount,
            userId: order.user.id
          },
          vip: vipResult
        };
      } else {
        throw new Error(`Erro ao ativar VIP: ${vipResult.error}`);
      }

    } catch (error) {
      logger.error(`❌ Erro ao processar pagamento manual ${orderId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar pedidos pendentes
   */
  async getPendingOrders() {
    try {
      const orders = await Order.findAll({
        where: {
          status: 'pending',
          payment_method: 'pix'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      return {
        success: true,
        orders: orders.map(order => ({
          id: order.id,
          planName: order.plan_name,
          amount: order.amount,
          createdAt: order.created_at,
          user: {
            id: order.user?.id,
            username: order.user?.username,
            email: order.user?.email
          }
        }))
      };

    } catch (error) {
      logger.error('❌ Erro ao listar pedidos pendentes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar status de um pedido
   */
  async getOrderStatus(orderId) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }]
      });

      if (!order) {
        return {
          success: false,
          error: 'Pedido não encontrado'
        };
      }

      return {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          planName: order.plan_name,
          amount: order.amount,
          paymentMethod: order.payment_method,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          user: {
            id: order.user?.id,
            username: order.user?.username,
            email: order.user?.email
          },
          paymentData: order.payment_data
        }
      };

    } catch (error) {
      logger.error(`❌ Erro ao verificar status do pedido ${orderId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar todos os pedidos pendentes
   */
  async processAllPendingOrders() {
    try {
      logger.info('🔄 Processando todos os pedidos pendentes...');

      const pendingResult = await this.getPendingOrders();
      if (!pendingResult.success) {
        throw new Error(pendingResult.error);
      }

      const orders = pendingResult.orders;
      logger.info(`📋 Encontrados ${orders.length} pedidos pendentes`);

      const results = [];
      for (const order of orders) {
        const result = await this.processPayment(order.id);
        results.push({
          orderId: order.id,
          success: result.success,
          message: result.message || result.error
        });
      }

      return {
        success: true,
        message: `${results.length} pedidos processados`,
        results: results
      };

    } catch (error) {
      logger.error('❌ Erro ao processar todos os pedidos pendentes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ManualPaymentProcessor();
