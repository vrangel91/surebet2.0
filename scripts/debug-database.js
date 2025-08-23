const { Pool } = require('pg');

async function debugDatabase() {
  console.log('🔍 Debugando configuração do banco...');
  
  // Simular a configuração exata do routes/orders.js
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'SureStake2024!',
    database: process.env.DB_NAME || 'surestake'
  };
  
  console.log('📋 Configuração que será usada:');
  console.log(JSON.stringify(config, null, 2));
  
  // Verificar variáveis de ambiente
  console.log('\n🌍 Variáveis de ambiente:');
  console.log(`  - DB_HOST: ${process.env.DB_HOST || '(não definida)'}`);
  console.log(`  - DB_PORT: ${process.env.DB_PORT || '(não definida)'}`);
  console.log(`  - DB_USER: ${process.env.DB_USER || '(não definida)'}`);
  console.log(`  - DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(não definida)'}`);
  console.log(`  - DB_NAME: ${process.env.DB_NAME || '(não definida)'}`);
  
  let pool = null;
  
  try {
    // Tentar conectar com a configuração
    pool = new Pool(config);
    
    console.log('\n🔌 Tentando conectar...');
    await pool.query('SELECT 1');
    console.log('✅ Conexão estabelecida!');
    
    // Verificar qual banco estamos conectados
    const dbResult = await pool.query('SELECT current_database()');
    console.log(`📊 Banco atual: ${dbResult.rows[0].current_database}`);
    
    // Verificar se a tabela orders existe
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name = 'orders'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tabela orders encontrada!');
    } else {
      console.log('❌ Tabela orders NÃO encontrada!');
      
      // Listar todas as tabelas
      const allTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log('\n📋 Tabelas disponíveis:');
      allTables.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código do erro:', error.code);
    
    if (error.code === '3D000') {
      console.log('\n💡 O banco de dados não existe!');
    } else if (error.code === '28P01') {
      console.log('\n💡 Erro de autenticação!');
    }
  } finally {
    if (pool) await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugDatabase()
    .then(() => {
      console.log('\n🎉 Debug concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro no debug:', error);
      process.exit(1);
    });
}

module.exports = { debugDatabase };
