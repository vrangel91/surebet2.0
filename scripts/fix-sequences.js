const { sequelize } = require('../config/database');

async function fixSequences() {
  try {
    console.log('🔧 Corrigindo sequências de auto-incremento...');
    
    // Corrigir sequência da tabela surebet_stats
    console.log('\n📊 Corrigindo sequência de surebet_stats...');
    
    await sequelize.query(`
      SELECT setval(pg_get_serial_sequence('surebet_stats', 'id'), 
        COALESCE((SELECT MAX(id) FROM surebet_stats), 0) + 1, false);
    `);
    
    console.log('✅ Sequência de surebet_stats corrigida');
    
    // Corrigir sequência da tabela surebet_analytics
    console.log('\n📊 Corrigindo sequência de surebet_analytics...');
    
    await sequelize.query(`
      SELECT setval(pg_get_serial_sequence('surebet_analytics', 'id'), 
        COALESCE((SELECT MAX(id) FROM surebet_analytics), 0) + 1, false);
    `);
    
    console.log('✅ Sequência de surebet_analytics corrigida');
    
    // Verificar sequências
    console.log('\n🔍 Verificando sequências...');
    
    const [statsSeq] = await sequelize.query(`
      SELECT pg_get_serial_sequence('surebet_stats', 'id') as sequence_name,
             currval(pg_get_serial_sequence('surebet_stats', 'id')) as current_value
    `);
    
    console.log('📊 Sequência surebet_stats:', statsSeq[0]);
    
    const [analyticsSeq] = await sequelize.query(`
      SELECT pg_get_serial_sequence('surebet_analytics', 'id') as sequence_name,
             currval(pg_get_serial_sequence('surebet_analytics', 'id')) as current_value
    `);
    
    console.log('📊 Sequência surebet_analytics:', analyticsSeq[0]);
    
    console.log('\n🎉 Sequências corrigidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir sequências:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixSequences();
