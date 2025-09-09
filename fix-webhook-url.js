/**
 * Script para corrigir a URL do webhook no MercadoPago
 */

const axios = require('axios');

async function fixWebhookUrl() {
  console.log('🔧 Corrigindo URL do webhook no MercadoPago...');
  
  try {
    // Verificar se o webhook está funcionando no domínio correto
    console.log('✅ Webhook funcionando em: https://surestake.com.br/webhook');
    
    // Verificar se o webhook NÃO está funcionando no domínio errado
    console.log('❌ Webhook NÃO funcionando em: https://surebets.com.br/webhook');
    
    console.log('\n📋 Ações necessárias:');
    console.log('1. Acesse o Dashboard do MercadoPago');
    console.log('2. Vá em "Configurações" > "Webhooks"');
    console.log('3. Verifique se a URL está configurada como:');
    console.log('   ✅ https://surestake.com.br/webhook');
    console.log('   ❌ NÃO https://surebets.com.br/webhook');
    console.log('4. Se estiver errado, atualize para o domínio correto');
    
    console.log('\n🔑 Configurações do webhook:');
    console.log('- URL: https://surestake.com.br/webhook');
    console.log('- Chave Secreta: 1be7b91f404f74fed096a02490ed8f0c3b57e603b09bd3f58fec69f11058f1e4');
    console.log('- Eventos: payment, chargeback, dispute');
    
    console.log('\n🧪 Para testar após a correção:');
    console.log('node test-webhook-production.js');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixWebhookUrl();
