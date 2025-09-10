const { Sequelize } = require('sequelize');
const { User, SurebetStats } = require('../models');

async function testUserIdFix() {
  try {
    console.log('🧪 Testando correção do user_id...');
    
    // 1. Verificar se há usuários no banco
    const users = await User.findAll({ limit: 1 });
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      return;
    }
    
    const testUser = users[0];
    console.log(`✅ Usuário encontrado: ${testUser.id} - ${testUser.email}`);
    
    // 2. Testar criação de SurebetStats com user_id
    const testData = {
      user_id: testUser.id,
      surebet_id: 'test_surebet_' + Date.now(),
      house: 'Test House',
      market: 'Test Market',
      match: 'Test Match',
      profit: 100.50,
      date: new Date(),
      hour: 15, // Hora como número (0-23)
      sport: 'Football',
      status: 'active'
    };
    
    console.log('📝 Tentando criar SurebetStats com user_id...');
    const newStat = await SurebetStats.create(testData);
    console.log(`✅ SurebetStats criado com sucesso! ID: ${newStat.id}, user_id: ${newStat.user_id}`);
    
    // 3. Verificar se o registro foi salvo corretamente
    const savedStat = await SurebetStats.findByPk(newStat.id);
    console.log(`✅ Registro recuperado: user_id = ${savedStat.user_id}`);
    
    // 4. Limpar o registro de teste
    await newStat.destroy();
    console.log('🧹 Registro de teste removido');
    
    console.log('🎉 Teste concluído com sucesso! O user_id está sendo salvo corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('📋 Erros de validação:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    process.exit(0);
  }
}

testUserIdFix();
