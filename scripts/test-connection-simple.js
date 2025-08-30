const { Sequelize } = require('sequelize');

// Configuração simples para teste
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'SureStake2024!',
  database: 'surestake',
  logging: console.log
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const [result] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Query de teste:', result);
    
    // Verificar se as tabelas existem
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('surebet_stats', 'surebet_analytics')
    `);
    
    console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();
