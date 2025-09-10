const { Sequelize } = require('sequelize');
const { User, SurebetStats } = require('../models');

async function testFrontendData() {
  try {
    console.log('🧪 Testando dados do frontend...');
    
    // 1. Verificar se há usuários no banco
    const users = await User.findAll({ limit: 1 });
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      return;
    }
    
    const testUser = users[0];
    console.log(`✅ Usuário encontrado: ${testUser.id} - ${testUser.email}`);
    
    // 2. Simular dados exatamente como o frontend envia
    const frontendData = {
      surebet_id: 'test_surebet_' + Date.now(),
      house: 'Test House',
      market: 'Test Market',
      match: 'Test Match',
      profit: 100.50,
      date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      hour: 15, // Número inteiro
      sport: 'Football',
      period: '90min',
      minutes: 45,
      anchorh1: 'https://example.com?is_live=1',
      anchorh2: 'https://example.com?is_live=0',
      chance: 85.5,
      metadata: {
        source: 'ranking_view',
        generated_at: new Date().toISOString()
      }
    };
    
    console.log('📝 Dados do frontend:', JSON.stringify(frontendData, null, 2));
    
    // 3. Tentar criar SurebetStats (o backend deve adicionar user_id automaticamente)
    console.log('📝 Tentando criar SurebetStats...');
    const newStat = await SurebetStats.create({
      user_id: testUser.id, // Simular o que o backend faz
      ...frontendData,
      status: 'active'
    });
    
    console.log(`✅ SurebetStats criado com sucesso! ID: ${newStat.id}`);
    console.log(`✅ user_id: ${newStat.user_id}`);
    console.log(`✅ hour: ${newStat.hour} (tipo: ${typeof newStat.hour})`);
    console.log(`✅ date: ${newStat.date} (tipo: ${typeof newStat.date})`);
    
    // 4. Verificar se o registro foi salvo corretamente
    const savedStat = await SurebetStats.findByPk(newStat.id);
    console.log(`✅ Registro recuperado:`);
    console.log(`  - user_id: ${savedStat.user_id}`);
    console.log(`  - hour: ${savedStat.hour} (tipo: ${typeof savedStat.hour})`);
    console.log(`  - date: ${savedStat.date} (tipo: ${typeof savedStat.date})`);
    console.log(`  - profit: ${savedStat.profit} (tipo: ${typeof savedStat.profit})`);
    
    // 5. Limpar o registro de teste
    await newStat.destroy();
    console.log('🧹 Registro de teste removido');
    
    console.log('🎉 Teste concluído com sucesso! Os dados do frontend estão sendo processados corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('📋 Erros de validação:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('🗄️ Erro de banco de dados:', error.message);
      console.error('SQL:', error.sql);
      console.error('Parâmetros:', error.parameters);
    }
  } finally {
    process.exit(0);
  }
}

testFrontendData();

