/**
 * Verificador de Pagamentos PIX
 * Verifica periodicamente o status dos pagamentos PIX pendentes
 */

const { Order, User, UserVIP } = require('../models');
const paymentService = require('../services/paymentService');
const { logger } = require('./logger');

class PaymentChecker {
  constructor() {
    this.checkInterval = 30000; // Verificar a cada 30 segundos
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Iniciar verificação de pagamentos
   */
  start() {
    if (this.isRunning) {
      logger.warn('PaymentChecker já está rodando');
      return;
    }

    this.isRunning = true;
    logger.info('🔄 Iniciando verificação de pagamentos PIX...');

    // Verificar imediatamente
    this.checkPayments();

    // Configurar verificação periódica
    this.intervalId = setInterval(() => {
      this.checkPayments();
    }, this.checkInterval);
  }

  /**
   * Parar verificação de pagamentos
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('⏹️ Verificação de pagamentos PIX parada');
  }

  /**
   * Verificar pagamentos pendentes
   */
  async checkPayments() {
    try {
      logger.debug('🔍 Verificando pagamentos PIX pendentes...');

      // Buscar pedidos PIX pendentes
      const pendingOrders = await Order.findAll({
        where: {
          status: 'pending',
          payment_method: 'pix'
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (pendingOrders.length === 0) {
        logger.debug('✅ Nenhum pagamento PIX pendente encontrado');
        return;
      }

      logger.info(`🔍 Encontrados ${pendingOrders.length} pagamentos PIX pendentes`);

      // Verificar cada pagamento
      for (const order of pendingOrders) {
        await this.checkPaymentStatus(order);
      }

    } catch (error) {
      logger.error('❌ Erro ao verificar pagamentos:', error);
    }
  }

  /**
   * Verificar status de um pagamento específico
   */
  async checkPaymentStatus(order) {
    try {
      logger.debug(`🔍 Verificando pagamento ${order.id}...`);

      // Simular verificação com MercadoPago
      // Em produção, você faria uma requisição real para a API do MercadoPago
      const paymentStatus = await this.getPaymentStatusFromMercadoPago(order);

      if (paymentStatus === 'approved') {
        logger.info(`✅ Pagamento ${order.id} aprovado!`);
        await this.processApprovedPayment(order);
      } else if (paymentStatus === 'rejected') {
        logger.info(`❌ Pagamento ${order.id} rejeitado`);
        await this.processRejectedPayment(order);
      } else {
        logger.debug(`⏳ Pagamento ${order.id} ainda pendente`);
      }

    } catch (error) {
      logger.error(`❌ Erro ao verificar pagamento ${order.id}:`, error);
    }
  }

  /**
   * Simular verificação com MercadoPago
   * Em produção, você faria uma requisição real para a API
   */
  async getPaymentStatusFromMercadoPago(order) {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular verificação baseada em tempo
      const now = new Date();
      const orderTime = new Date(order.created_at);
      const timeDiff = now - orderTime;

      // Se passou mais de 5 minutos, simular aprovação
      if (timeDiff > 5 * 60 * 1000) {
        return 'approved';
      }

      // Se passou mais de 10 minutos, simular rejeição
      if (timeDiff > 10 * 60 * 1000) {
        return 'rejected';
      }

      return 'pending';
    } catch (error) {
      logger.error('Erro ao verificar status no MercadoPago:', error);
      return 'pending';
    }
  }

  /**
   * Processar pagamento aprovado
   */
  async processApprovedPayment(order) {
    try {
      // Atualizar status do pedido
      await order.update({
        status: 'approved'
      });

      // Ativar VIP para o usuário
      const plan = paymentService.getPlan(order.plan_id);
      if (plan && order.user) {
        const vipResult = await paymentService.activateVIP(
          order.user,
          plan,
          `PIX_${order.id}`
        );

        if (vipResult.success) {
          logger.info(`✅ VIP ativado para usuário ${order.user.id}`, vipResult);
          
          // Criar notificação de pagamento confirmado
          const paymentService = require('../services/paymentService');
          await paymentService.createPaymentConfirmationNotification(
            order.user.id, 
            plan, 
            `PIX_${order.id}`
          );
        } else {
          logger.error(`❌ Erro ao ativar VIP para usuário ${order.user.id}:`, vipResult);
        }
      }

    } catch (error) {
      logger.error(`❌ Erro ao processar pagamento aprovado ${order.id}:`, error);
    }
  }

  /**
   * Processar pagamento rejeitado
   */
  async processRejectedPayment(order) {
    try {
      await order.update({
        status: 'rejected'
      });

      logger.info(`❌ Pagamento ${order.id} marcado como rejeitado`);

    } catch (error) {
      logger.error(`❌ Erro ao processar pagamento rejeitado ${order.id}:`, error);
    }
  }

  /**
   * Verificar pagamento específico por ID
   */
  async checkSpecificPayment(orderId) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!order) {
        logger.error(`❌ Pedido ${orderId} não encontrado`);
        return;
      }

      await this.checkPaymentStatus(order);

    } catch (error) {
      logger.error(`❌ Erro ao verificar pagamento específico ${orderId}:`, error);
    }
  }
}

module.exports = new PaymentChecker();
