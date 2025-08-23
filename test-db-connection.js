require('dotenv').config();
const { sequelize, User, UserSession } = require('./models');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida com sucesso');
    
    // Testar sincronização dos modelos
    console.log('🔍 Testando sincronização dos modelos...');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados com sucesso');
    
    // Testar consulta simples na tabela users
    console.log('🔍 Testando consulta na tabela users...');
    const userCount = await User.count();
    console.log(`✅ Tabela users acessível. Total de usuários: ${userCount}`);
    
    // Testar consulta simples na tabela user_sessions
    console.log('🔍 Testando consulta na tabela user_sessions...');
    const sessionCount = await UserSession.count();
    console.log(`✅ Tabela user_sessions acessível. Total de sessões: ${sessionCount}`);
    
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();
