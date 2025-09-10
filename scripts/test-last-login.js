const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testLastLogin() {
  try {
    console.log('🧪 Testando funcionalidade de último login...');
    
    // Verificar se a coluna existe
    const checkColumnQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Coluna last_login não encontrada');
      return;
    }
    
    console.log('✅ Coluna last_login encontrada:', checkResult.rows[0]);
    
    // Listar usuários com último login
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        last_login,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const usersResult = await pool.query(usersQuery);
    
    console.log('\n📋 Usuários e seus últimos logins:');
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Último login: ${user.last_login || 'Nunca'}`);
      console.log(`   - Criado em: ${user.created_at}`);
      console.log('');
    });
    
    // Simular um login para testar a atualização
    if (usersResult.rows.length > 0) {
      const testUser = usersResult.rows[0];
      console.log(`🔄 Simulando login para usuário: ${testUser.email}`);
      
      const updateQuery = `
        UPDATE users 
        SET last_login = NOW() 
        WHERE id = $1
      `;
      
      await pool.query(updateQuery, [testUser.id]);
      console.log('✅ Último login atualizado com sucesso!');
      
      // Verificar se foi atualizado
      const verifyQuery = `
        SELECT last_login FROM users WHERE id = $1
      `;
      
      const verifyResult = await pool.query(verifyQuery, [testUser.id]);
      console.log(`📅 Novo último login: ${verifyResult.rows[0].last_login}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar último login:', error);
  } finally {
    await pool.end();
  }
}

testLastLogin();
