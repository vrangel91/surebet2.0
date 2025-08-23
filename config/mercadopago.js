const { MercadoPagoConfig, Payment } = require('mercadopago');

/**
 * Configuração do Mercado Pago com tratamento de erros aprimorado
 */
class MercadoPagoService {
  constructor() {
    this.config = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-3182761403687473-051409-e381080719c0060d8dd1dc1582618d3d-266645918'
    });
    
    this.payment = new Payment(this.config);
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 segundos
  }

  /**
   * Verificar se a configuração está válida
   */
  validateConfig() {
    if (!this.config.accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    }
    
    if (!this.config.accessToken.startsWith('APP_USR-')) {
      throw new Error('Formato inválido do MERCADOPAGO_ACCESS_TOKEN');
    }
    
    return true;
  }

  /**
   * Criar pagamento PIX com retry automático
   */
  async createPixPayment(paymentData, retryCount = 0) {
    try {
      console.log(`🔄 Tentativa ${retryCount + 1} de criar PIX`);
      
      // Validar dados obrigatórios
      this.validatePixPaymentData(paymentData);
      
      const pixPayment = await this.payment.create({
        body: {
          transaction_amount: parseFloat(paymentData.amount),
          description: paymentData.description,
          payment_method_id: 'pix',
          external_reference: paymentData.externalReference,
          payer: {
            email: paymentData.payer.email,
            first_name: paymentData.payer.firstName,
            last_name: paymentData.payer.lastName,
            identification: {
              type: 'CPF',
              number: paymentData.payer.cpf.replace(/\D/g, '')
            }
          },
          date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        requestOptions: {
          idempotencyKey: `pix_${paymentData.externalReference}_${Date.now()}_${retryCount}`
        }
      });

      // Validar resposta
      this.validatePixResponse(pixPayment);
      
      console.log('✅ PIX criado com sucesso');
      return pixPayment;

    } catch (error) {
      console.error(`❌ Erro na tentativa ${retryCount + 1}:`, {
        error: error.message,
        retryCount,
        maxRetries: this.maxRetries
      });

      // Retry automático para erros específicos
      if (this.shouldRetry(error) && retryCount < this.maxRetries) {
        console.log(`⏳ Aguardando ${this.retryDelay}ms antes da tentativa ${retryCount + 2}...`);
        await this.delay(this.retryDelay);
        return this.createPixPayment(paymentData, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Validar dados do pagamento PIX
   */
  validatePixPaymentData(paymentData) {
    const required = ['amount', 'description', 'externalReference', 'payer'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }

    if (!paymentData.payer.email || !paymentData.payer.firstName || !paymentData.payer.lastName || !paymentData.payer.cpf) {
      throw new Error('Dados do pagador incompletos');
    }

    if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
      throw new Error('Valor do pagamento inválido');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.payer.email)) {
      throw new Error('Formato de email inválido');
    }

    // Validar CPF
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(paymentData.payer.cpf.replace(/\D/g, ''))) {
      throw new Error('CPF inválido');
    }
  }

  /**
   * Validar resposta da API do Mercado Pago
   */
  validatePixResponse(pixPayment) {
    // A resposta pode ter a estrutura com 'body' ou diretamente no objeto raiz
    const responseData = pixPayment.body || pixPayment;
    
    if (!responseData) {
      throw new Error('Resposta da API vazia');
    }

    if (!responseData.point_of_interaction) {
      throw new Error('Resposta da API sem point_of_interaction');
    }

    if (!responseData.point_of_interaction.transaction_data) {
      throw new Error('Resposta da API sem transaction_data');
    }

    const transactionData = responseData.point_of_interaction.transaction_data;
    
    if (!transactionData.qr_code && !transactionData.qr_code_base64) {
      throw new Error('Nenhum código PIX foi gerado');
    }
  }

  /**
   * Determinar se deve fazer retry baseado no erro
   */
  shouldRetry(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND'
    ];

    return retryableErrors.some(retryableError => 
      error.message.toLowerCase().includes(retryableError.toLowerCase()) ||
      error.code === retryableError
    );
  }

  /**
   * Delay entre tentativas
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extrair dados do PIX da resposta
   */
  extractPixData(pixPayment) {
    // A resposta pode ter a estrutura com 'body' ou diretamente no objeto raiz
    const responseData = pixPayment.body || pixPayment;
    const transactionData = responseData.point_of_interaction.transaction_data;
    
    return {
      pixCode: transactionData.qr_code || '',
      pixCodeBase64: transactionData.qr_code_base64 || '',
      ticketUrl: transactionData.ticket_url || '',
      paymentId: responseData.id,
      status: responseData.status,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Verificar status de um pagamento
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await this.payment.get({ id: paymentId });
      // A resposta pode ter a estrutura com 'body' ou diretamente no objeto raiz
      const responseData = payment.body || payment;
      
      return {
        id: responseData.id,
        status: responseData.status,
        externalReference: responseData.external_reference,
        amount: responseData.transaction_amount,
        createdAt: responseData.date_created,
        updatedAt: responseData.date_last_updated
      };
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error.message);
      throw error;
    }
  }
}

// Instância singleton
const mercadopagoService = new MercadoPagoService();

module.exports = mercadopagoService;
