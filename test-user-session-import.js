const { User, UserSession } = require('./models');

async function testUserSessionImport() {
  try {
    console.log('🔍 Testando importação do UserSession...\n');
    
    console.log('✅ User importado:', typeof User);
    console.log('✅ UserSession importado:', typeof UserSession);
    
    // Testar consulta simples
    const sessionsCount = await UserSession.count();
    console.log('✅ Total de sessões:', sessionsCount);
    
    // Testar consulta com filtro
    const userSessions = await UserSession.findAll({
      where: { user_id: 9 }
    });
    
    console.log('✅ Sessões do usuário 9:', userSessions.length);
    
    // Testar delete
    if (userSessions.length > 0) {
      console.log('🧪 Testando delete das sessões...');
      const deleteResult = await UserSession.destroy({
        where: { user_id: 9 }
      });
      console.log('✅ Sessões deletadas:', deleteResult);
    }
    
    console.log('\n🎉 Teste de importação passou!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    const { sequelize } = require('./models');
    await sequelize.close();
  }
}

testUserSessionImport();
