const { sequelize, SurebetStats, SurebetAnalytics, User } = require('../models');

async function testRankingComplete() {
  try {
    console.log('🧪 TESTE COMPLETO DO RANKING');
    console.log('================================');
    
    // 1. Testar conexão
    console.log('\n1️⃣ Testando conexão com banco...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');
    
    // 2. Verificar usuário válido
    console.log('\n2️⃣ Verificando usuário válido...');
    const validUser = await User.findOne();
    if (!validUser) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    console.log(`✅ Usuário: ID ${validUser.id} - ${validUser.email}`);
    
    // 3. Testar estrutura das tabelas
    console.log('\n3️⃣ Verificando estrutura das tabelas...');
    
    // Verificar surebet_stats
    const [statsColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'surebet_stats' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas de surebet_stats:');
    statsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar surebet_analytics
    const [analyticsColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'surebet_analytics' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas de surebet_analytics:');
    analyticsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 4. Testar inserção de dados simulando o RankingView
    console.log('\n4️⃣ Testando inserção de dados do RankingView...');
    
    // Dados simulados do RankingView
    const mockRankingData = [
      {
        surebet_id: 'test_ranking_1',
        house: 'Bet365',
        market: 'Resultado Final',
        match: 'Flamengo vs Palmeiras',
        profit: 15.50,
        date: new Date(),
        hour: 20,
        sport: 'Football',
        period: '90min',
        minutes: 90,
        anchorh1: 'Flamengo',
        anchorh2: 'Palmeiras',
        chance: 95.5,
        metadata: { source: 'ranking_view', test: true }
      },
      {
        surebet_id: 'test_ranking_2',
        house: 'Betano',
        market: 'Over/Under',
        match: 'São Paulo vs Corinthians',
        profit: 12.30,
        date: new Date(),
        hour: 16,
        sport: 'Football',
        period: '90min',
        minutes: 90,
        anchorh1: 'São Paulo',
        anchorh2: 'Corinthians',
        chance: 92.1,
        metadata: { source: 'ranking_view', test: true }
      }
    ];
    
    // Testar inserção individual
    console.log('\n📝 Testando inserção individual...');
    for (const item of mockRankingData) {
      try {
        const newStat = await SurebetStats.create({
          surebet_id: item.surebet_id,
          user_id: validUser.id,
          house: item.house,
          market: item.market,
          match: item.match,
          profit: item.profit,
          date: item.date,
          hour: item.hour,
          sport: item.sport,
          period: item.period,
          minutes: item.minutes,
          anchorh1: item.anchorh1,
          anchorh2: item.anchorh2,
          chance: item.chance,
          metadata: item.metadata,
          status: 'active'
        });
        
        console.log(`✅ SurebetStats criado: ID ${newStat.id} - ${item.house}`);
        
        // Limpar teste
        await newStat.destroy();
        console.log(`✅ Teste limpo: ID ${newStat.id}`);
        
      } catch (error) {
        console.error(`❌ Erro ao criar ${item.house}:`, error.message);
        console.error('Detalhes:', error);
      }
    }
    
    // 5. Testar inserção em lote
    console.log('\n📝 Testando inserção em lote...');
    try {
      const bulkData = mockRankingData.map(item => ({
        surebet_id: item.surebet_id + '_bulk',
        user_id: validUser.id,
        house: item.house,
        market: item.market,
        match: item.match,
        profit: item.profit,
        date: item.date,
        hour: item.hour,
        sport: item.sport,
        period: item.period,
        minutes: item.minutes,
        anchorh1: item.anchorh1,
        anchorh2: item.anchorh2,
        chance: item.chance,
        metadata: item.metadata,
        status: 'active'
      }));
      
      const bulkStats = await SurebetStats.bulkCreate(bulkData);
      console.log(`✅ Bulk create: ${bulkStats.length} registros criados`);
      
      // Limpar testes
      for (const stat of bulkStats) {
        await stat.destroy();
      }
      console.log('✅ Testes em lote limpos');
      
    } catch (error) {
      console.error('❌ Erro no bulk create:', error.message);
      console.error('Detalhes:', error);
    }
    
    // 6. Testar analytics
    console.log('\n📊 Testando analytics...');
    try {
      const analytics = await SurebetAnalytics.create({
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
      
      console.log('✅ Analytics criado:', analytics.id);
      
      // Limpar teste
      await analytics.destroy();
      console.log('✅ Teste analytics limpo');
      
    } catch (error) {
      console.error('❌ Erro ao criar analytics:', error.message);
      console.error('Detalhes:', error);
    }
    
    // 7. Verificar sequências
    console.log('\n7️⃣ Verificando sequências...');
    try {
      const [statsSeq] = await sequelize.query(`
        SELECT pg_get_serial_sequence('surebet_stats', 'id') as sequence_name,
               last_value, is_called
        FROM pg_get_serial_sequence('surebet_stats', 'id'), surebet_stats_id_seq
      `);
      
      console.log('📊 Sequência surebet_stats:', statsSeq[0]);
      
    } catch (error) {
      console.log('⚠️ Não foi possível verificar sequência (normal se tabela estiver vazia)');
    }
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testRankingComplete();
