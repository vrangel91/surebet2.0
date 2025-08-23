require('dotenv').config();

console.log('🧪 Teste Simples de Integração PIX\n');

// Testar configuração básica
console.log('1️⃣ Verificando configuração...');
console.log('   - MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado');

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.log('   - Usando token padrão do código');
}

// Testar importação do serviço
try {
  console.log('\n2️⃣ Testando importação do serviço...');
  const mercadopagoService = require('./config/mercadopago');
  console.log('   - Serviço importado: ✅ OK');
  
  // Testar validação de configuração
  try {
    mercadopagoService.validateConfig();
    console.log('   - Configuração válida: ✅ OK');
  } catch (error) {
    console.log('   - Configuração inválida: ❌', error.message);
  }
  
  console.log('\n3️⃣ Testando validação de dados...');
  
  // Teste com dados válidos
  const validData = {
    amount: 10.00,
    description: 'Teste PIX',
    externalReference: 'test123',
    payer: {
      email: 'teste@exemplo.com',
      firstName: 'Usuário',
      lastName: 'Teste',
      cpf: '12345678901'
    }
  };
  
  try {
    mercadopagoService.validatePixPaymentData(validData);
    console.log('   - Dados válidos: ✅ OK');
  } catch (error) {
    console.log('   - Dados válidos: ❌', error.message);
  }
  
  // Teste com dados inválidos
  const invalidData = {
    amount: 'inválido',
    description: 'Teste PIX',
    externalReference: 'test123',
    payer: {
      email: 'email-invalido',
      firstName: 'Usuário',
      lastName: 'Teste',
      cpf: '123'
    }
  };
  
  try {
    mercadopagoService.validatePixPaymentData(invalidData);
    console.log('   - Dados inválidos: ❌ Deveria ter falhado');
  } catch (error) {
    console.log('   - Dados inválidos: ✅ Falhou corretamente:', error.message);
  }
  
  console.log('\n✅ Teste básico concluído com sucesso!');
  console.log('\n💡 Para testar a integração completa, execute:');
  console.log('   npm run test-pix');
  
} catch (error) {
  console.error('\n❌ Erro ao importar serviço:', error.message);
  console.log('\n🔧 Verifique se:');
  console.log('   1. As dependências estão instaladas (npm install)');
  console.log('   2. O arquivo config/mercadopago.js existe');
  console.log('   3. O SDK do Mercado Pago está funcionando');
}
