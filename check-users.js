const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'surestake',
  user: 'postgres',
  password: 'SureStake2024!'
});

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...');
    
    const result = await pool.query('SELECT id, email, first_name, last_name, is_admin FROM users LIMIT 10');
    
    console.log('✅ Usuários encontrados:');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Nome: ${user.first_name} ${user.last_name}, Admin: ${user.is_admin}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
