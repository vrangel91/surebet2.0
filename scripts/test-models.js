const { sequelize, SurebetStats, SurebetAnalytics, User } = require('../models');

async function testModels() {
  try {
    console.log('🧪 Testando modelos...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Buscar um usuário válido
    console.log('\n👤 Buscando usuário válido...');
    const validUser = await User.findOne();
    
    if (!validUser) {
      console.log('❌ Nenhum usuário encontrado na tabela users');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ID ${validUser.id} - ${validUser.email}`);
    
    // Testar modelo SurebetStats
    console.log('\n📊 Testando modelo SurebetStats...');
    
    try {
      const testStat = await SurebetStats.create({
        surebet_id: 'test_' + Date.now(),
        user_id: validUser.id,
        house: 'TestHouse',
        market: 'TestMarket',
        match: 'Test Match',
        profit: 10.50,
        date: new Date(),
        hour: 12,
        sport: 'Football',
        period: '1H',
        minutes: 45,
        anchorh1: 'test1',
        anchorh2: 'test2',
        chance: 95.5,
        metadata: { test: true },
        status: 'active'
      });
      
      console.log('✅ SurebetStats criado com sucesso:', testStat.id);
      
      // Limpar teste
      await testStat.destroy();
      console.log('✅ Teste limpo');
      
    } catch (error) {
      console.error('❌ Erro ao criar SurebetStats:', error.message);
      console.error('Detalhes:', error);
    }
    
    // Testar modelo SurebetAnalytics
    console.log('\n📊 Testando modelo SurebetAnalytics...');
    
    try {
      const testAnalytics = await SurebetAnalytics.create({
        user_id: validUser.id,
        date: new Date(),
        total_surebets: 100,
        successful_surebets: 80,
        total_profit: 1500.00,
        total_bets: 1000,
        roi_percentage: 15.00,
        analysis_type: 'comprehensive',
        period_days: 30,
        sport_filter: 'all'
      });
      
      console.log('✅ SurebetAnalytics criado com sucesso:', testAnalytics.id);
      
      // Limpar teste
      await testAnalytics.destroy();
      console.log('✅ Teste limpo');
      
    } catch (error) {
      console.error('❌ Erro ao criar SurebetAnalytics:', error.message);
      console.error('Detalhes:', error);
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testModels();
