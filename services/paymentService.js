/**
 * Serviço de Pagamentos
 * Gerencia webhooks e processamento de pagamentos
 */

const crypto = require('crypto');
const { User, UserVIP } = require('../models');
const { logger } = require('../utils/logger');

class PaymentService {
  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET || 'surestake-webhook-secret-2024';
    this.plans = {
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
      }
    };
  }

  /**
   * Verificar assinatura do webhook
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }

  /**
   * Processar webhook de pagamento
   */
  async processPaymentWebhook(webhookData) {
    try {
      logger.info('Processando webhook de pagamento:', webhookData);

      const { 
        event_type, 
        payment_id, 
        user_id, 
        plan_id, 
        amount, 
        status, 
        payment_method,
        created_at 
      } = webhookData;

      // Verificar se é um evento de pagamento aprovado
      if (event_type !== 'payment.approved') {
        logger.info('Evento não é de pagamento aprovado:', event_type);
        return { success: true, message: 'Evento ignorado' };
      }

      // Verificar se o pagamento foi aprovado
      if (status !== 'approved') {
        logger.info('Pagamento não foi aprovado:', status);
        return { success: true, message: 'Pagamento não aprovado' };
      }

      // Verificar se o plano existe
      const plan = this.plans[plan_id];
      if (!plan) {
        logger.error('Plano não encontrado:', plan_id);
        return { success: false, error: 'Plano não encontrado' };
      }

      // Verificar se o valor está correto
      if (amount !== plan.price) {
        logger.error('Valor incorreto:', { expected: plan.price, received: amount });
        return { success: false, error: 'Valor incorreto' };
      }

      // Buscar usuário
      const user = await User.findByPk(user_id);
      if (!user) {
        logger.error('Usuário não encontrado:', user_id);
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Ativar VIP para o usuário
      const vipResult = await this.activateVIP(user, plan, payment_id);

      if (vipResult.success) {
        logger.info('VIP ativado com sucesso:', {
          userId: user_id,
          planId: plan_id,
          paymentId: payment_id
        });
      }

      return vipResult;

    } catch (error) {
      logger.error('Erro ao processar webhook de pagamento:', error);
      return { success: false, error: error.message };
    }
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
          status: 'active'
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
          status: 'active',
          created_at: now,
          updated_at: now
        });

        logger.info('Novo VIP criado:', {
          userId: user.id,
          planId: plan.id,
          vipId: vip.id
        });
      }

      // Atualizar status do usuário
      await user.update({
        is_vip: true,
        account_type: plan.id,
        vip_expires_at: expiresAt
      });

      return {
        success: true,
        message: 'VIP ativado com sucesso',
        plan: plan,
        expiresAt: expiresAt
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
          status: 'active'
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
}

module.exports = new PaymentService();
