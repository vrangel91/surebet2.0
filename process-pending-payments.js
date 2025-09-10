/**
 * Script para processar pagamentos PIX pendentes
 * Execute este script quando um pagamento for confirmado no MercadoPago
 */

const axios = require('axios');
const manualPaymentProcessor = require('./utils/manualPaymentProcessor');

async function processPendingPayments() {
  console.log('🔄 Verificando pagamentos PIX pendentes...');
  
  try {
    // Listar pedidos pendentes
    const pendingResult = await manualPaymentProcessor.getPendingOrders();
    
    if (!pendingResult.success) {
      console.error('❌ Erro ao listar pedidos pendentes:', pendingResult.error);
      return;
    }
    
    const orders = pendingResult.orders;
    console.log(`📋 Encontrados ${orders.length} pedidos pendentes`);
    
    if (orders.length === 0) {
      console.log('✅ Nenhum pagamento pendente encontrado');
      return;
    }
    
    // Mostrar pedidos pendentes
    console.log('\n📋 Pedidos pendentes:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ID: ${order.id} | Plano: ${order.planName} | Valor: R$ ${order.amount} | Usuário: ${order.user?.username || order.user?.email} | Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}`);
    });
    
    // Processar todos os pedidos pendentes
    console.log('\n🔄 Processando todos os pedidos pendentes...');
    const result = await manualPaymentProcessor.processAllPendingOrders();
    
    if (result.success) {
      console.log('✅ Processamento concluído!');
      console.log('\n📊 Resultados:');
      result.results.forEach((res, index) => {
        const status = res.success ? '✅' : '❌';
        console.log(`${index + 1}. Pedido ${res.orderId}: ${status} ${res.message}`);
      });
    } else {
      console.error('❌ Erro ao processar pedidos:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

async function processSpecificPayment(orderId) {
  console.log(`🔄 Processando pagamento específico: ${orderId}`);
  
  try {
    const result = await manualPaymentProcessor.processPayment(orderId);
    
    if (result.success) {
      console.log('✅ Pagamento processado com sucesso!');
      console.log('📊 Detalhes:', result);
    } else {
      console.error('❌ Erro ao processar pagamento:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

async function listPendingOrders() {
  console.log('📋 Listando pedidos pendentes...');
  
  try {
    const result = await manualPaymentProcessor.getPendingOrders();
    
    if (result.success) {
      console.log(`\n📊 Total: ${result.orders.length} pedidos pendentes\n`);
      
      result.orders.forEach((order, index) => {
        console.log(`${index + 1}. ID: ${order.id}`);
        console.log(`   Plano: ${order.planName}`);
        console.log(`   Valor: R$ ${order.amount}`);
        console.log(`   Usuário: ${order.user?.username || order.user?.email} (ID: ${order.user?.id})`);
        console.log(`   Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}`);
        console.log('');
      });
    } else {
      console.error('❌ Erro ao listar pedidos:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];
const orderId = args[1];

switch (command) {
  case 'list':
    listPendingOrders();
    break;
  case 'process':
    if (orderId) {
      processSpecificPayment(orderId);
    } else {
      processPendingPayments();
    }
    break;
  default:
    console.log('📋 Uso do script:');
    console.log('  node process-pending-payments.js list                    - Listar pedidos pendentes');
    console.log('  node process-pending-payments.js process                - Processar todos os pedidos pendentes');
    console.log('  node process-pending-payments.js process <orderId>      - Processar pedido específico');
    console.log('');
    console.log('📋 Exemplos:');
    console.log('  node process-pending-payments.js list');
    console.log('  node process-pending-payments.js process');
    console.log('  node process-pending-payments.js process 123');
    break;
}
