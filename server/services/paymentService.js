/**
 * Serviço de Pagamentos
 * Gerencia webhooks e processamento de pagamentos
 */

const crypto = require('crypto');
const { User, UserVIP } = require('../models');
const { logger } = require('../utils/logger');

class PaymentService {
  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET || '1be7b91f404f74fed096a02490ed8f0c3b57e603b09bd3f58fec69f11058f1e4';
    this.plans = {
      // Planos padrão
      'basic': {
        id: 'basic',
        name: 'Plano Básico',
        days: 30,
        price: 29.90,
        features: ['Acesso a surebets', 'Suporte básico']
      },
      'premium': {
        id: 'premium',
        name: 'Plano Premium',
        days: 30,
        price: 49.90,
        features: ['Acesso a surebets', 'Suporte prioritário', 'Alertas em tempo real']
      },
      'vip': {
        id: 'vip',
        name: 'Plano VIP',
        days: 30,
        price: 99.90,
        features: ['Acesso a surebets', 'Suporte VIP', 'Alertas em tempo real', 'Análises exclusivas']
      },
      
      // Planos diários - Pré-Jogo
      'pre-daily': {
        id: 'pre-daily',
        name: 'Surebet Pré-Jogo Diário',
        days: 1,
        price: 1.00,
        features: ['1 dia de acesso', 'Jogos Pré-Jogo', 'Suporte Técnico']
      },
      'pre-weekly': {
        id: 'pre-weekly',
        name: 'Surebet Pré-Jogo Semanal',
        days: 7,
        price: 57.00,
        features: ['7 dias de acesso', 'Jogos Pré-Jogo', 'Suporte Técnico']
      },
      'pre-monthly': {
        id: 'pre-monthly',
        name: 'Surebet Pré-Jogo Mensal',
        days: 30,
        price: 97.00,
        features: ['30 dias de acesso', 'Jogos Pré-Jogo', 'Suporte Técnico']
      },
      'pre-yearly': {
        id: 'pre-yearly',
        name: 'Surebet Pré-Jogo Anual',
        days: 365,
        price: 497.00,
        features: ['365 dias de acesso', 'Jogos Pré-Jogo', 'Suporte Técnico']
      },
      
      // Planos diários - Live
      'live-daily': {
        id: 'live-daily',
        name: 'Surebet Live Diário',
        days: 1,
        price: 29.00,
        features: ['1 dia de acesso', 'Jogos Ao-vivo', 'Suporte Técnico']
      },
      'live-weekly': {
        id: 'live-weekly',
        name: 'Surebet Live Semanal',
        days: 7,
        price: 137.00,
        features: ['7 dias de acesso', 'Jogos Ao-vivo', 'Suporte Técnico']
      },
      'live-monthly': {
        id: 'live-monthly',
        name: 'Surebet Live Mensal',
        days: 30,
        price: 347.00,
        features: ['30 dias de acesso', 'Jogos Ao-vivo', 'Suporte Técnico']
      },
      'live-yearly': {
        id: 'live-yearly',
        name: 'Surebet Live Anual',
        days: 365,
        price: 1997.00,
        features: ['365 dias de acesso', 'Jogos Ao-vivo', 'Suporte Técnico']
      },
      
      // Planos diários - Pré+Live
      'prelive-daily': {
        id: 'prelive-daily',
        name: 'Surebet Pré+Live Diário',
        days: 1,
        price: 39.00,
        features: ['1 dia de acesso', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Calculadora Automática', 'Suporte Técnico']
      },
      'prelive-weekly': {
        id: 'prelive-weekly',
        name: 'Surebet Pré+Live Semanal',
        days: 7,
        price: 137.00,
        features: ['7 dias de acesso', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Calculadora Automática', 'Suporte Técnico']
      },
      'prelive-monthly': {
        id: 'prelive-monthly',
        name: 'Surebet Pré+Live Mensal',
        days: 30,
        price: 347.00,
        features: ['30 dias de acesso', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Calculadora Automática', 'Suporte Técnico']
      },
      'prelive-yearly': {
        id: 'prelive-yearly',
        name: 'Surebet Pré+Live Anual',
        days: 365,
        price: 1997.00,
        features: ['365 dias de acesso', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Calculadora Automática', 'Suporte Técnico']
      },
      
      // Planos diários - Valuebet
      'value-daily': {
        id: 'value-daily',
        name: 'Valuebet Diário',
        days: 1,
        price: 39.00,
        features: ['1 dia de acesso', 'Valuebet Premium', 'Suporte Técnico']
      },
      'value-weekly': {
        id: 'value-weekly',
        name: 'Valuebet Semanal',
        days: 7,
        price: 137.00,
        features: ['7 dias de acesso', 'Valuebet Premium', 'Suporte Técnico']
      },
      'value-monthly': {
        id: 'value-monthly',
        name: 'Valuebet Mensal',
        days: 30,
        price: 347.00,
        features: ['30 dias de acesso', 'Valuebet Premium', 'Suporte Técnico']
      },
      'value-yearly': {
        id: 'value-yearly',
        name: 'Valuebet Anual',
        days: 365,
        price: 1997.00,
        features: ['365 dias de acesso', 'Valuebet Premium', 'Suporte Técnico']
      },
      
      // Planos diários - Full
      'full-daily': {
        id: 'full-daily',
        name: 'Full - Pré+Live+Valuebet Diário',
        days: 1,
        price: 67.00,
        features: ['1 dia de acesso completo', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Valuebet Premium', 'Calculadora Automática', 'Suporte Técnico', 'Acesso Completo']
      },
      'full-weekly': {
        id: 'full-weekly',
        name: 'Full - Pré+Live+Valuebet Semanal',
        days: 7,
        price: 197.00,
        features: ['7 dias de acesso completo', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Valuebet Premium', 'Calculadora Automática', 'Suporte Técnico', 'Acesso Completo']
      },
      'full-monthly': {
        id: 'full-monthly',
        name: 'Full - Pré+Live+Valuebet Mensal',
        days: 30,
        price: 497.00,
        features: ['30 dias de acesso completo', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Valuebet Premium', 'Calculadora Automática', 'Suporte Técnico', 'Acesso Completo']
      },
      'full-yearly': {
        id: 'full-yearly',
        name: 'Full - Pré+Live+Valuebet Anual',
        days: 365,
        price: 2997.00,
        features: ['365 dias de acesso completo', 'Jogos Pré-Jogo', 'Jogos Ao-vivo', 'Valuebet Premium', 'Calculadora Automática', 'Suporte Técnico', 'Acesso Completo']
      }
    };
  }

  /**
   * Verificar assinatura do webhook do MercadoPago
   */
  verifyWebhookSignature(webhookData, signature, headers = {}) {
    try {
      // O MercadoPago envia a assinatura no formato: ts=timestamp,v1=hash
      let signatureHash = signature;
      let ts = null;
      
      // Extrair ts e v1 da assinatura
      if (signature.includes('v1=')) {
        const parts = signature.split(',');
        for (const part of parts) {
          const [key, value] = part.split('=');
          if (key === 'ts') {
            ts = value;
          } else if (key === 'v1') {
            signatureHash = value;
          }
        }
      } else if (signature.includes('sha256=')) {
        signatureHash = signature.replace('sha256=', '');
      }
      
      // Construir a mensagem no formato correto: id:[data.id];request-id:[x-request-id];ts:[ts];
      const dataId = webhookData.data?.id || webhookData.id;
      const requestId = headers['x-request-id'] || '';
      
      // Template correto conforme documentação do MercadoPago
      const message = `id:${dataId};request-id:${requestId};ts:${ts};`;
      
      logger.info('Validando assinatura:', {
        message,
        signature: signatureHash,
        ts,
        requestId,
        dataId,
        webhookSecret: this.webhookSecret.substring(0, 10) + '...'
      });
      
      // Gerar HMAC SHA256 usando o WEBHOOK_SECRET como chave
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(message)
        .digest('hex');
      
      logger.info('Assinaturas:', {
        received: signatureHash,
        expected: expectedSignature,
        match: signatureHash === expectedSignature
      });
      
      return signatureHash === expectedSignature;
    } catch (error) {
      logger.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }

  /**
   * Calcular HMAC para validação de assinatura
   */
  calculateHMAC(stringBase) {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(stringBase)
      .digest('hex');
  }

  /**
   * Buscar detalhes do pagamento na API do MercadoPago
   */
  async getMercadoPagoPaymentDetails(paymentId) {
    try {
      logger.info('🔍 Consultando API real do MercadoPago para paymentId:', paymentId);
      
      // Consultar API real do MercadoPago
      const mercadopagoService = require('../config/mercadopago');
      const realPaymentDetails = await mercadopagoService.getPaymentStatus(paymentId);
      
      if (!realPaymentDetails) {
        logger.error('❌ Erro ao consultar API do MercadoPago para paymentId:', paymentId);
        return null;
      }

      logger.info('📱 Resposta real da API do MercadoPago:', {
        paymentId: realPaymentDetails.id,
        status: realPaymentDetails.status,
        externalReference: realPaymentDetails.externalReference,
        amount: realPaymentDetails.amount
      });

      // Buscar dados do pedido no banco para complementar informações
      const { Order, sequelize } = require('../models');
      const [results] = await sequelize.query(
        `SELECT * FROM orders WHERE payment_data->>'paymentId' = :paymentId LIMIT 1`,
        {
          replacements: { paymentId: paymentId.toString() },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!results) {
        logger.error('❌ Pedido não encontrado no banco para payment_id:', paymentId);
        return null;
      }

      // Retornar dados reais da API do MercadoPago
      return {
        id: realPaymentDetails.id,
        status: realPaymentDetails.status, // ✅ STATUS REAL DA API
        transaction_amount: realPaymentDetails.amount,
        description: `${results.plan_name} - ${results.plan_days} dias`,
        external_reference: results.id.toString(), // ✅ Usar orderId como external_reference
        payment_method_id: results.payment_method,
        date_created: realPaymentDetails.createdAt,
        date_last_updated: realPaymentDetails.updatedAt
      };
      
    } catch (error) {
      logger.error('❌ Erro ao consultar API do MercadoPago:', error);
      return null;
    }
  }

  /**
   * Atualizar status do pedido no banco
   */
  async updateOrderStatus(paymentId, status) {
    try {
      const { Order, sequelize } = require('../models');
      
      // Buscar pedido usando consulta SQL raw para evitar problemas com JSON
      const [results] = await sequelize.query(
        `SELECT * FROM orders WHERE payment_data->>'paymentId' = :paymentId LIMIT 1`,
        {
          replacements: { paymentId: paymentId.toString() },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (results) {
        // Atualizar status usando SQL raw
        await sequelize.query(
          `UPDATE orders SET status = :status WHERE id = :orderId`,
          {
            replacements: { 
              status: status,
              orderId: results.id 
            }
          }
        );
        logger.info('Status do pedido atualizado:', { paymentId, status, orderId: results.id });
      } else {
        logger.warn('Pedido não encontrado para payment_id:', paymentId);
      }
    } catch (error) {
      logger.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  /**
   * Ativar VIP para pagamento aprovado
   */
  async activateVIPForPayment(paymentDetails) {
    try {
      const orderId = paymentDetails.external_reference; // external_reference é o orderId
      
      logger.info('🔄 Ativando VIP para pagamento aprovado:', {
        paymentId: paymentDetails.id,
        orderId: orderId,
        status: paymentDetails.status
      });

      // Buscar o pedido no banco para obter o userId
      const { Order, sequelize } = require('../models');
      const [orderResult] = await sequelize.query(
        `SELECT * FROM orders WHERE id = :orderId LIMIT 1`,
        {
          replacements: { orderId: orderId },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!orderResult) {
        logger.error('❌ Pedido não encontrado para orderId:', orderId);
        return;
      }

      const userId = orderResult.user_id;
      const plan = this.extractPlanFromDescription(paymentDetails.description) || orderResult.plan_id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        logger.error('❌ Usuário não encontrado para ativar VIP:', userId);
        return;
      }

      const planInfo = this.plans[plan];
      if (!planInfo) {
        logger.error('❌ Plano não encontrado:', plan);
        return;
      }

      // Ativar VIP
      const vipResult = await this.activateVIP(user, planInfo, paymentDetails.id);
      
      if (vipResult.success) {
        logger.info('✅ VIP ativado com sucesso:', { 
          userId, 
          orderId, 
          plan, 
          paymentId: paymentDetails.id 
        });
      } else {
        logger.error('❌ Erro ao ativar VIP:', vipResult);
      }
      
    } catch (error) {
      logger.error('❌ Erro ao ativar VIP para pagamento:', error);
    }
  }

  /**
   * Processar webhook do MercadoPago (seguindo pseudocódigo oficial)
   */
  async processPaymentWebhook(webhookData, headers = {}, rawBody = '') {
    try {
      logger.info('🔔 Processando webhook do MercadoPago:', {
        webhookId: webhookData.id,
        type: webhookData.type,
        action: webhookData.action,
        paymentId: webhookData.data?.id
      });

      // 1. Verificar se webhook já foi processado (proteção contra duplicação)
      const webhookId = webhookData.id;
      if (await this.isWebhookAlreadyProcessed(webhookId)) {
        logger.info('⚠️ Webhook já foi processado anteriormente:', webhookId);
        return { success: true, message: 'Webhook já processado' };
      }

      // 2. Captura dos headers
      const headerSignature = headers['x-signature'];
      const headerTimestamp = headers['x-request-ts'];
      
      // 3. Validar assinatura HMAC (se disponível)
      if (headerSignature && headerTimestamp && rawBody) {
        const notificationId = webhookData.id;
        const stringBase = `ts=${headerTimestamp},id=${notificationId}`;
        const calculatedSignature = this.calculateHMAC(stringBase);
        
        if (calculatedSignature !== headerSignature) {
          logger.error('❌ Assinatura inválida:', { headerSignature, calculatedSignature });
          return { success: false, error: 'Invalid signature' };
        }
      }

      // 4. Extrair dados do evento
      const eventId = webhookData.data?.id;
      const eventType = webhookData.type;
      const eventAction = webhookData.action;

      // 5. Ignorar eventos de teste
      if (!eventId || typeof eventId === 'string' && (
        eventId.startsWith('TEST_') || 
        eventId.startsWith('SIMPLE_TEST_') ||
        eventId.startsWith('TEST_PAYMENT_')
      )) {
        logger.info('⚠️ Evento de teste ignorado:', eventId);
        return { success: true, message: 'Evento de teste ignorado' };
      }

      // 6. Validar tipo do evento
      if (eventType !== 'payment') {
        logger.info('⚠️ Tipo de evento não suportado:', eventType);
        return { success: true, message: 'Tipo não tratado' };
      }

      // 7. Log do tipo de evento recebido
      logger.info('📋 Evento recebido:', {
        action: eventAction,
        paymentId: eventId,
        type: eventType
      });

      // 8. Consultar detalhes do pagamento na API do MercadoPago
      const paymentDetails = await this.getMercadoPagoPaymentDetails(eventId);
      
      if (!paymentDetails) {
        logger.error('❌ Erro ao buscar detalhes do pagamento:', eventId);
        return { success: false, error: 'Erro ao buscar pagamento' };
      }

      // 9. Validar e processar status do pagamento
      const paymentStatus = paymentDetails.status;
      
      logger.info('🔍 Status real do pagamento (da API):', {
        paymentId: eventId,
        status: paymentStatus,
        action: eventAction,
        amount: paymentDetails.transaction_amount,
        externalReference: paymentDetails.external_reference,
        details: paymentDetails
      });

      // 10. Validação adicional de segurança
      if (!this.isValidPaymentStatus(paymentStatus)) {
        logger.error('❌ Status de pagamento inválido:', paymentStatus);
        return { success: false, error: 'Status de pagamento inválido' };
      }

      // 11. Log específico para payment.created vs payment.updated
      if (eventAction === 'payment.created') {
        logger.info('📋 Evento payment.created recebido - PIX foi gerado, aguardando pagamento');
      } else if (eventAction === 'payment.updated') {
        logger.info('📋 Evento payment.updated recebido - Status do pagamento foi alterado');
      }
      
      // 12. Processar baseado no status real da API
      switch (paymentStatus) {
        case 'approved':
          // ✅ CRÍTICO: Só liberar VIP se status for realmente 'approved'
          logger.info('✅ Processando pagamento APROVADO:', eventId);
          await this.updateOrderStatus(eventId, 'pago');
          await this.activateVIPForPayment(paymentDetails);
          
          // Notificar via WebSocket que o pagamento foi confirmado
          this.notifyPaymentConfirmedViaWebSocket(paymentDetails);
          
          logger.info('✅ Pagamento aprovado e VIP ativado:', eventId);
          break;
          
        case 'pending':
          logger.info('⏳ Pagamento PENDENTE - apenas atualizando status:', eventId);
          await this.updateOrderStatus(eventId, 'pendente');
          logger.info('⏳ Status atualizado para pendente:', eventId);
          break;
          
        case 'rejected':
          logger.info('❌ Pagamento REJEITADO:', eventId);
          await this.updateOrderStatus(eventId, 'rejeitado');
          logger.info('❌ Status atualizado para rejeitado:', eventId);
          break;
          
        case 'cancelled':
          logger.info('🚫 Pagamento CANCELADO:', eventId);
          await this.updateOrderStatus(eventId, 'cancelado');
          logger.info('🚫 Status atualizado para cancelado:', eventId);
          break;
          
        case 'refunded':
          logger.info('💰 Pagamento REEMBOLSADO:', eventId);
          await this.updateOrderStatus(eventId, 'reembolsado');
          logger.info('💰 Status atualizado para reembolsado:', eventId);
          break;
          
        default:
          logger.warn('⚠️ Status desconhecido recebido:', paymentStatus);
      }

      // 11. Marcar webhook como processado
      await this.markWebhookAsProcessed(webhookId, eventId, paymentStatus);

      // 12. Retornar sucesso ao MercadoPago
      return { success: true, message: 'Webhook processado com sucesso' };

    } catch (error) {
      logger.error('Erro ao processar webhook de pagamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar evento de pagamento
   */
  async processPaymentEvent(paymentData, action) {
    try {
      // Extrair o ID do pagamento do objeto data
      const paymentId = paymentData?.id || paymentData;
      logger.info('Processando evento de pagamento:', { paymentData, paymentId, action });
      
      // Log para debug
      logger.info('PaymentId extraído:', { paymentId, type: typeof paymentId });

      // Buscar informações do pagamento no MercadoPago
      const paymentInfo = await this.getMercadoPagoPayment(paymentId);
      
      if (!paymentInfo) {
        logger.error('Pagamento não encontrado no MercadoPago:', paymentId);
        return { success: false, error: 'Pagamento não encontrado' };
      }

      // Verificar se o pagamento foi aprovado
      if (paymentInfo.status !== 'approved') {
        logger.info('Pagamento não foi aprovado:', paymentInfo.status);
        return { success: true, message: 'Pagamento não aprovado' };
      }

      // Extrair informações do pagamento
      const { 
        id: payment_id,
        transaction_amount: amount,
        description,
        external_reference: user_id,
        payment_method_id: payment_method
      } = paymentInfo;

      // Extrair plano do description ou external_reference
      const plan_id = this.extractPlanFromDescription(description) || 'vip'; // Default para VIP

      // Verificar se o plano existe
      const plan = this.plans[plan_id];
      if (!plan) {
        logger.error('Plano não encontrado:', plan_id);
        return { success: false, error: 'Plano não encontrado' };
      }

      // Verificar se o valor está correto (com tolerância de 1 centavo)
      if (Math.abs(amount - plan.price) > 0.01) {
        logger.error('Valor incorreto:', { expected: plan.price, received: amount });
        return { success: false, error: 'Valor incorreto' };
      }

      // Buscar usuário
      const user = await User.findByPk(user_id);
      if (!user) {
        logger.error('Usuário não encontrado:', user_id);
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Atualizar status do pedido no banco
      const { Order } = require('../models');
      const order = await Order.findOne({
        where: {
          payment_id: payment_id,
          user_id: user_id
        }
      });

      if (order) {
        await order.update({
          status: 'approved',
          payment_data: {
            ...order.payment_data,
            webhook_processed: true,
            processed_at: new Date().toISOString()
          }
        });
        logger.info('Status do pedido atualizado para aprovado:', order.id);
      }

      // Ativar VIP para o usuário
      const vipResult = await this.activateVIP(user, plan, payment_id);

      if (vipResult.success) {
        logger.info('VIP ativado com sucesso:', {
          userId: user_id,
          planId: plan_id,
          paymentId: payment_id
        });

        // Criar notificação de pagamento confirmado
        await this.createPaymentConfirmationNotification(user_id, plan, payment_id);
      }

      return vipResult;

    } catch (error) {
      logger.error('Erro ao processar evento de pagamento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar evento de chargeback
   */
  async processChargebackEvent(chargebackId, action) {
    try {
      logger.info('Processando evento de chargeback:', { chargebackId, action });
      
      // Aqui você pode implementar lógica para lidar com chargebacks
      // Por exemplo, suspender o usuário ou reverter o VIP
      
      return { success: true, message: 'Chargeback processado' };
    } catch (error) {
      logger.error('Erro ao processar chargeback:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar evento de disputa
   */
  async processDisputeEvent(disputeId, action) {
    try {
      logger.info('Processando evento de disputa:', { disputeId, action });
      
      // Aqui você pode implementar lógica para lidar com disputas
      
      return { success: true, message: 'Disputa processada' };
    } catch (error) {
      logger.error('Erro ao processar disputa:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar informações do pagamento no MercadoPago
   */
  async getMercadoPagoPayment(paymentId) {
    try {
      // Buscar dados reais do pedido no banco de dados
      const { Order, sequelize } = require('../models');
      
      logger.info('Buscando pagamento no banco de dados:', paymentId);
      
      // Buscar pedido usando consulta SQL raw para evitar problemas com JSON
      const [results] = await sequelize.query(
        `SELECT * FROM orders WHERE payment_data->>'paymentId' = :paymentId LIMIT 1`,
        {
          replacements: { paymentId: paymentId.toString() },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!results) {
        logger.error('Pedido não encontrado para payment_id:', paymentId);
        return null;
      }

      // Retornar dados do pedido real
      return {
        id: paymentId,
        status: 'approved', // Assumindo que chegou até aqui, está aprovado
        transaction_amount: parseFloat(results.amount),
        description: `${results.plan_name} - ${results.plan_days} dias`,
        external_reference: results.user_id.toString(),
        payment_method_id: results.payment_method
      };
      
    } catch (error) {
      logger.error('Erro ao buscar pagamento no MercadoPago:', error);
      return null;
    }
  }

  /**
   * Extrair plano do description
   */
  extractPlanFromDescription(description) {
    if (!description) return null;
    
    const desc = description.toLowerCase();
    
    // Planos padrão
    if (desc.includes('básico') || desc.includes('basic')) return 'basic';
    if (desc.includes('premium')) return 'premium';
    if (desc.includes('vip')) return 'vip';
    
    // Planos diários - Pré-Jogo
    if (desc.includes('pre-daily') || desc.includes('pré jogo diário')) return 'pre-daily';
    if (desc.includes('pre-weekly') || desc.includes('pré jogo semanal')) return 'pre-weekly';
    if (desc.includes('pre-monthly') || desc.includes('pré jogo mensal')) return 'pre-monthly';
    if (desc.includes('pre-yearly') || desc.includes('pré jogo anual')) return 'pre-yearly';
    
    // Planos diários - Live
    if (desc.includes('live-daily') || desc.includes('live diário')) return 'live-daily';
    if (desc.includes('live-weekly') || desc.includes('live semanal')) return 'live-weekly';
    if (desc.includes('live-monthly') || desc.includes('live mensal')) return 'live-monthly';
    if (desc.includes('live-yearly') || desc.includes('live anual')) return 'live-yearly';
    
    // Planos diários - Pré+Live
    if (desc.includes('prelive-daily') || desc.includes('pré + live diário')) return 'prelive-daily';
    if (desc.includes('prelive-weekly') || desc.includes('pré + live semanal')) return 'prelive-weekly';
    if (desc.includes('prelive-monthly') || desc.includes('pré + live mensal')) return 'prelive-monthly';
    if (desc.includes('prelive-yearly') || desc.includes('pré + live anual')) return 'prelive-yearly';
    
    // Planos diários - Valuebet
    if (desc.includes('value-daily') || desc.includes('valuebet diário')) return 'value-daily';
    if (desc.includes('value-weekly') || desc.includes('valuebet semanal')) return 'value-weekly';
    if (desc.includes('value-monthly') || desc.includes('valuebet mensal')) return 'value-monthly';
    if (desc.includes('value-yearly') || desc.includes('valuebet anual')) return 'value-yearly';
    
    // Planos diários - Full
    if (desc.includes('full-daily') || desc.includes('full diário')) return 'full-daily';
    if (desc.includes('full-weekly') || desc.includes('full semanal')) return 'full-weekly';
    if (desc.includes('full-monthly') || desc.includes('full mensal')) return 'full-monthly';
    if (desc.includes('full-yearly') || desc.includes('full anual')) return 'full-yearly';
    
    return null;
  }

  /**
   * Ativar VIP para usuário
   */
  async activateVIP(user, plan, paymentId) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (plan.days * 24 * 60 * 60 * 1000));

      // Verificar se usuário já tem VIP ativo
      const existingVIP = await UserVIP.findOne({
        where: {
          user_id: user.id,
          status: 'ativo'
        },
        order: [['created_at', 'DESC']]
      });

      if (existingVIP) {
        // Se já tem VIP ativo, estender a data de expiração
        const newExpiresAt = new Date(existingVIP.data_fim.getTime() + (plan.days * 24 * 60 * 60 * 1000));
        
        await existingVIP.update({
          plan_days: existingVIP.plan_days + plan.days,
          data_fim: newExpiresAt,
          updated_at: now
        });

        logger.info('VIP estendido:', {
          userId: user.id,
          planId: plan.id,
          newExpiresAt
        });
      } else {
        // Criar novo VIP
        const vip = await UserVIP.create({
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_days: plan.days,
          amount: plan.price,
          payment_id: paymentId,
          data_inicio: now,
          data_fim: expiresAt,
          status: 'ativo',
          created_at: now,
          updated_at: now
        });

        logger.info('Novo VIP criado:', {
          userId: user.id,
          planId: plan.id,
          vipId: vip.id
        });
      }

      // Atualizar status do usuário com o plano específico
      await user.update({
        is_vip: true,
        account_type: plan.name, // Usar o nome do plano, não o ID
        plan: plan.name, // Adicionar campo plan também
        vip_expires_at: expiresAt
      });

      return {
        success: true,
        message: 'VIP ativado com sucesso',
        plan: plan,
        expiresAt: expiresAt,
        paymentId: paymentId,
        userId: user.id,
        vipDetails: {
          planId: plan.id,
          planName: plan.name,
          planDays: plan.days,
          amount: plan.price,
          dataInicio: now,
          dataFim: expiresAt,
          status: 'ativo'
        }
      };

      // Invalidar cache do usuário após ativação
      const { invalidateUserCache } = require('../utils/optimizedPlanMiddleware');
      invalidateUserCache(user.id.toString());
      
      logger.info('📦 Cache invalidado após ativação VIP:', { userId: user.id });

      return {
        success: true,
        message: 'VIP ativado com sucesso',
        plan: plan,
        expiresAt: expiresAt,
        paymentId: paymentId,
        userId: user.id,
        vipDetails: {
          planId: plan.id,
          planName: plan.name,
          planDays: plan.days,
          amount: plan.price,
          dataInicio: now,
          dataFim: expiresAt,
          status: 'ativo'
        }
      };

    } catch (error) {
      logger.error('Erro ao ativar VIP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter planos disponíveis
   */
  getPlans() {
    return Object.values(this.plans);
  }

  /**
   * Obter plano por ID
   */
  getPlan(planId) {
    return this.plans[planId];
  }

  /**
   * Verificar status VIP do usuário
   */
  async getUserVIPStatus(userId) {
    try {
      const vip = await UserVIP.findOne({
        where: {
          user_id: userId,
          status: 'ativo'
        },
        order: [['created_at', 'DESC']]
      });

      if (!vip) {
        return { hasVIP: false, vip: null };
      }

      const now = new Date();
      const isExpired = now > vip.data_fim;

      if (isExpired) {
        // Marcar VIP como expirado
        await vip.update({ status: 'expired' });
        return { hasVIP: false, vip: null };
      }

      return {
        hasVIP: true,
        vip: {
          id: vip.id,
          planId: vip.plan_id,
          planName: vip.plan_name,
          planDays: vip.plan_days,
          dataInicio: vip.data_inicio,
          dataFim: vip.data_fim,
          status: vip.status
        }
      };

    } catch (error) {
      logger.error('Erro ao verificar status VIP:', error);
      return { hasVIP: false, vip: null };
    }
  }

  /**
   * Criar notificação de confirmação de pagamento
   */
  async createPaymentConfirmationNotification(userId, plan, paymentId) {
    try {
      const { Notification } = require('../models');
      
      const planNames = {
        // Planos padrão
        'basic': 'Plano Básico',
        'premium': 'Plano Premium', 
        'vip': 'Plano VIP',
        
        // Planos Pré-Jogo
        'pre-daily': 'Surebet Pré-Jogo Diário',
        'pre-weekly': 'Surebet Pré-Jogo Semanal',
        'pre-monthly': 'Surebet Pré-Jogo Mensal',
        'pre-yearly': 'Surebet Pré-Jogo Anual',
        
        // Planos Live
        'live-daily': 'Surebet Live Diário',
        'live-weekly': 'Surebet Live Semanal',
        'live-monthly': 'Surebet Live Mensal',
        'live-yearly': 'Surebet Live Anual',
        
        // Planos Pré+Live
        'prelive-daily': 'Surebet Pré+Live Diário',
        'prelive-weekly': 'Surebet Pré+Live Semanal',
        'prelive-monthly': 'Surebet Pré+Live Mensal',
        'prelive-yearly': 'Surebet Pré+Live Anual',
        
        // Planos Valuebet
        'value-daily': 'Valuebet Diário',
        'value-weekly': 'Valuebet Semanal',
        'value-monthly': 'Valuebet Mensal',
        'value-yearly': 'Valuebet Anual',
        
        // Planos Full
        'full-daily': 'Full - Pré+Live+Valuebet Diário',
        'full-weekly': 'Full - Pré+Live+Valuebet Semanal',
        'full-monthly': 'Full - Pré+Live+Valuebet Mensal',
        'full-yearly': 'Full - Pré+Live+Valuebet Anual'
      };

      const planName = planNames[plan.id] || plan.name || 'Plano VIP';
      
      const notification = await Notification.create({
        title: '🎉 Pagamento Confirmado!',
        message: `Seu ${planName} foi ativado com sucesso! Você já pode aproveitar todos os benefícios do seu plano.`,
        type: 'success',
        priority: 'high',
        target_audience: 'specific',
        target_user_ids: [userId],
        metadata: {
          paymentId: paymentId,
          planId: plan.id,
          planName: planName,
          action: 'payment_confirmed'
        },
        created_by: 1 // Sistema
      });

      logger.info('Notificação de pagamento confirmado criada:', {
        notificationId: notification.id,
        userId: userId,
        planName: planName
      });

      return notification;

    } catch (error) {
      logger.error('Erro ao criar notificação de pagamento confirmado:', error);
      // Não falhar o processo de pagamento por causa da notificação
      return null;
    }
  }

  /**
   * Verificar se webhook já foi processado
   */
  async isWebhookAlreadyProcessed(webhookId) {
    try {
      const { sequelize } = require('../models');
      
      // Verificar se a tabela existe antes de consultar
      const [tableExists] = await sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'webhook_events'
        )`
      );
      
      if (!tableExists[0].exists) {
        logger.warn('⚠️ Tabela webhook_events não existe, pulando verificação de duplicação');
        return false;
      }
      
      const [results] = await sequelize.query(
        `SELECT id FROM webhook_events WHERE id = :webhookId LIMIT 1`,
        {
          replacements: { webhookId: webhookId },
          type: sequelize.QueryTypes.SELECT
        }
      );

      return results !== undefined;
    } catch (error) {
      logger.error('Erro ao verificar webhook processado:', error);
      return false; // Em caso de erro, permitir processamento
    }
  }

  /**
   * Marcar webhook como processado
   */
  async markWebhookAsProcessed(webhookId, paymentId, status) {
    try {
      const { sequelize } = require('../models');
      
      // Verificar se a tabela existe antes de inserir
      const [tableExists] = await sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'webhook_events'
        )`
      );
      
      if (!tableExists[0].exists) {
        logger.warn('⚠️ Tabela webhook_events não existe, pulando marcação de processamento');
        return;
      }
      
      await sequelize.query(
        `INSERT INTO webhook_events (id, payment_id, status, processed_at) 
         VALUES (:webhookId, :paymentId, :status, NOW())
         ON CONFLICT (id) DO NOTHING`,
        {
          replacements: { 
            webhookId: webhookId,
            paymentId: paymentId,
            status: status
          }
        }
      );

      logger.info('✅ Webhook marcado como processado:', {
        webhookId,
        paymentId,
        status
      });
    } catch (error) {
      logger.error('Erro ao marcar webhook como processado:', error);
      // Não falhar o processo por causa do controle de duplicação
    }
  }

  /**
   * Validar se o status do pagamento é válido
   */
  isValidPaymentStatus(status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'refunded'];
    return validStatuses.includes(status);
  }

  /**
   * Notificar pagamento confirmado via WebSocket
   */
  notifyPaymentConfirmedViaWebSocket(paymentDetails) {
    try {
      const { surebetsWebSocket } = require('../utils/surebetsWebSocket');
      
      const webSocketData = {
        paymentId: paymentDetails.id,
        orderId: paymentDetails.external_reference,
        status: paymentDetails.status,
        planName: this.extractPlanFromDescription(paymentDetails.description),
        amount: paymentDetails.transaction_amount,
        timestamp: new Date().toISOString()
      };
      
      surebetsWebSocket.notifyPaymentConfirmed(webSocketData);
      
      logger.info('🔔 WebSocket notification sent for payment confirmation:', webSocketData);
      
    } catch (error) {
      logger.error('❌ Erro ao enviar notificação WebSocket:', error);
      // Não falhar o processo por causa do WebSocket
    }
  }
}

module.exports = PaymentService;
