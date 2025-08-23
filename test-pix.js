require('dotenv').config();
const { testPixIntegration, testApiConnection } = require('./utils/testPixIntegration');

console.log('🚀 Iniciando testes de integração PIX...\n');

(async () => {
  try {
    // Teste 1: Conexão com API
    await testApiConnection();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Teste 2: Integração PIX
    await testPixIntegration();
    
    console.log('\n🎉 Todos os testes foram concluídos!');
    
  } catch (error) {
    console.error('\n💥 Erro durante os testes:', error.message);
    process.exit(1);
  }
})();
