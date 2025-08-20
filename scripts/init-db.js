const { sequelize, testConnection } = require('../config/database');
const { syncModels } = require('../models');

async function initializeDatabase() {
  console.log('🚀 Inicializando banco de dados...');
  
  try {
    // Testar conexão
    await testConnection();
    
    // Sincronizar modelos
    await syncModels();
    

    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('');
    console.log('📋 Sistema inicializado sem usuário administrador padrão');
    console.log('   Crie um usuário administrador através da interface ou API');
    console.log('');
    console.log('🔗 URLs da API:');
    console.log('   Login: POST /api/auth/login');
    console.log('   Registro: POST /api/auth/register');
    console.log('   Verificar Token: GET /api/auth/verify');
    console.log('   Usuários (Admin): GET /api/users');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
