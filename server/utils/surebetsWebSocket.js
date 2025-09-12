/**
 * Sistema de WebSocket para Surebets
 * Envia atualizações em tempo real para clientes conectados
 */

const { logger } = require('./logger');
const { surebetsCache } = require('./surebetsCache');

class SurebetsWebSocket {
  constructor() {
    this.clients = new Map(); // Map<clientId, WebSocket>
    this.clientSubscriptions = new Map(); // Map<clientId, Set<subscriptions>>
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      lastMessage: null
    };
    
    logger.info('SurebetsWebSocket initialized');
  }

  /**
   * Adiciona cliente conectado
   */
  addClient(clientId, ws) {
    this.clients.set(clientId, ws);
    this.clientSubscriptions.set(clientId, new Set());
    this.stats.totalConnections++;
    this.stats.activeConnections++;
    
    logger.info('WebSocket client connected', {
      clientId,
      activeConnections: this.stats.activeConnections
    });

    // Enviar dados iniciais
    this.sendInitialData(clientId);
  }

  /**
   * Remove cliente desconectado
   */
  removeClient(clientId) {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      this.clientSubscriptions.delete(clientId);
      this.stats.activeConnections--;
      
      logger.info('WebSocket client disconnected', {
        clientId,
        activeConnections: this.stats.activeConnections
      });
    }
  }

  /**
   * Adiciona subscription do cliente
   */
  addSubscription(clientId, subscription) {
    if (this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.get(clientId).add(subscription);
      
      logger.debug('Subscription added', {
        clientId,
        subscription,
        totalSubscriptions: this.clientSubscriptions.get(clientId).size
      });
    }
  }

  /**
   * Remove subscription do cliente
   */
  removeSubscription(clientId, subscription) {
    if (this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.get(clientId).delete(subscription);
      
      logger.debug('Subscription removed', {
        clientId,
        subscription,
        totalSubscriptions: this.clientSubscriptions.get(clientId).size
      });
    }
  }

  /**
   * Envia dados iniciais para cliente recém-conectado
   */
  sendInitialData(clientId) {
    try {
      const cachedData = surebetsCache.get('all');
      if (cachedData) {
        this.sendToClient(clientId, {
          type: 'initial_data',
          data: cachedData,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('Error sending initial data', {
        clientId,
        error: error.message
      });
    }
  }

  /**
   * Envia mensagem para cliente específico
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(JSON.stringify(message));
        this.stats.messagesSent++;
        this.stats.lastMessage = new Date().toISOString();
        
        logger.debug('Message sent to client', {
          clientId,
          messageType: message.type
        });
      } catch (error) {
        logger.error('Error sending message to client', {
          clientId,
          error: error.message
        });
        this.removeClient(clientId);
      }
    }
  }

  /**
   * Envia mensagem para todos os clientes
   */
  broadcast(message) {
    const clientIds = Array.from(this.clients.keys());
    
    clientIds.forEach(clientId => {
      this.sendToClient(clientId, message);
    });
    
    logger.debug('Message broadcasted', {
      messageType: message.type,
      recipients: clientIds.length
    });
  }

  /**
   * Envia mensagem para clientes com subscription específica
   */
  broadcastToSubscribers(subscription, message) {
    const subscribers = [];
    
    for (const [clientId, subscriptions] of this.clientSubscriptions.entries()) {
      if (subscriptions.has(subscription)) {
        this.sendToClient(clientId, message);
        subscribers.push(clientId);
      }
    }
    
    logger.debug('Message sent to subscribers', {
      subscription,
      messageType: message.type,
      recipients: subscribers.length
    });
  }

  /**
   * Notifica atualização de surebets
   */
  notifySurebetsUpdate(updateData) {
    const message = {
      type: 'surebets_update',
      data: updateData,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  /**
   * Notifica novo surebet
   */
  notifyNewSurebet(surebet) {
    const message = {
      type: 'new_surebet',
      data: surebet,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  /**
   * Notifica surebet expirado
   */
  notifyExpiredSurebet(surebetId) {
    const message = {
      type: 'surebet_expired',
      data: { id: surebetId },
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  /**
   * Notifica mudança de status do servidor
   */
  notifyServerStatus(status) {
    const message = {
      type: 'server_status',
      data: status,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  /**
   * Notifica atualização de status de pagamento
   */
  notifyPaymentStatusUpdate(paymentData) {
    const message = {
      type: 'payment_status_update',
      data: paymentData,
      timestamp: Date.now()
    };
    
    // Enviar para todos os clientes (ou apenas para o usuário específico se necessário)
    this.broadcast(message);
    
    logger.info('Payment status update broadcasted', {
      paymentId: paymentData.paymentId,
      status: paymentData.status,
      orderId: paymentData.orderId
    });
  }

  /**
   * Notifica pagamento confirmado
   */
  notifyPaymentConfirmed(paymentData) {
    const message = {
      type: 'payment_confirmed',
      data: paymentData,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
    
    logger.info('Payment confirmed notification sent', {
      paymentId: paymentData.paymentId,
      orderId: paymentData.orderId,
      planName: paymentData.planName
    });
  }

  /**
   * Processa mensagem recebida do cliente
   */
  handleClientMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          this.addSubscription(clientId, data.subscription);
          this.sendToClient(clientId, {
            type: 'subscription_confirmed',
            subscription: data.subscription,
            timestamp: Date.now()
          });
          break;
          
        case 'unsubscribe':
          this.removeSubscription(clientId, data.subscription);
          this.sendToClient(clientId, {
            type: 'unsubscription_confirmed',
            subscription: data.subscription,
            timestamp: Date.now()
          });
          break;
          
        case 'ping':
          this.sendToClient(clientId, {
            type: 'pong',
            timestamp: Date.now()
          });
          break;
          
        case 'get_data':
          this.sendInitialData(clientId);
          break;
          
        default:
          logger.warn('Unknown message type', {
            clientId,
            messageType: data.type
          });
      }
    } catch (error) {
      logger.error('Error handling client message', {
        clientId,
        error: error.message,
        message: message.substring(0, 100)
      });
    }
  }

  /**
   * Retorna estatísticas do WebSocket
   */
  getStats() {
    return {
      ...this.stats,
      clientSubscriptions: Array.from(this.clientSubscriptions.entries()).map(([clientId, subscriptions]) => ({
        clientId,
        subscriptions: Array.from(subscriptions)
      }))
    };
  }

  /**
   * Retorna informações detalhadas
   */
  getInfo() {
    return {
      stats: this.getStats(),
      clients: Array.from(this.clients.keys()),
      totalSubscriptions: Array.from(this.clientSubscriptions.values())
        .reduce((total, subscriptions) => total + subscriptions.size, 0)
    };
  }

  /**
   * Limpa conexões inativas
   */
  cleanup() {
    const inactiveClients = [];
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.readyState !== 1) { // Não está aberto
        inactiveClients.push(clientId);
      }
    }
    
    inactiveClients.forEach(clientId => {
      this.removeClient(clientId);
    });
    
    if (inactiveClients.length > 0) {
      logger.info('Cleaned up inactive clients', {
        count: inactiveClients.length,
        activeConnections: this.stats.activeConnections
      });
    }
  }
}

// Instância singleton
const surebetsWebSocket = new SurebetsWebSocket();

// Limpeza automática a cada 30 segundos
setInterval(() => {
  surebetsWebSocket.cleanup();
}, 30000);

module.exports = { SurebetsWebSocket, surebetsWebSocket };
