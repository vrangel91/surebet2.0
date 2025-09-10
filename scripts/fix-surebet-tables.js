const { sequelize } = require('../config/database');

async function fixSurebetTables() {
  try {
    console.log('🔧 Corrigindo tabelas surebet...');
    
    // Corrigir tabela surebet_stats
    console.log('\n📊 Corrigindo tabela surebet_stats...');
    
    // Adicionar colunas faltantes
    await sequelize.query(`
      ALTER TABLE surebet_stats 
      ADD COLUMN IF NOT EXISTS metadata JSON,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS house VARCHAR(100),
      ADD COLUMN IF NOT EXISTS market VARCHAR(100),
      ADD COLUMN IF NOT EXISTS match VARCHAR(200),
      ADD COLUMN IF NOT EXISTS profit DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS date DATE,
      ADD COLUMN IF NOT EXISTS hour INTEGER,
      ADD COLUMN IF NOT EXISTS sport VARCHAR(50),
      ADD COLUMN IF NOT EXISTS period VARCHAR(50),
      ADD COLUMN IF NOT EXISTS minutes INTEGER,
      ADD COLUMN IF NOT EXISTS anchorh1 TEXT,
      ADD COLUMN IF NOT EXISTS anchorh2 TEXT,
      ADD COLUMN IF NOT EXISTS chance DECIMAL(5,2)
    `);
    
    console.log('✅ Colunas adicionadas à tabela surebet_stats');
    
    // Corrigir tabela surebet_analytics
    console.log('\n📊 Corrigindo tabela surebet_analytics...');
    
    await sequelize.query(`
      ALTER TABLE surebet_analytics 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS analysis_type VARCHAR(50) DEFAULT 'comprehensive',
      ADD COLUMN IF NOT EXISTS period_days INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS sport_filter VARCHAR(50) DEFAULT 'all'
    `);
    
    console.log('✅ Colunas adicionadas à tabela surebet_analytics');
    
    // Verificar estrutura final
    console.log('\n🔍 Verificando estrutura final...');
    
    const [statsColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'surebet_stats' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura final da tabela surebet_stats:');
    statsColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    const [analyticsColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'surebet_analytics' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura final da tabela surebet_analytics:');
    analyticsColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🎉 Tabelas corrigidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabelas:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixSurebetTables();
