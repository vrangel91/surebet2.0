const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'surestake',
  user: 'postgres',
  password: 'SureStake2024!'
});

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o banco...');
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Testar uma query simples
    const result = await client.query('SELECT COUNT(*) as count FROM user_vip');
    console.log('📊 Resultado da query:', result.rows[0]);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    await pool.end();
  }
}

testConnection();
