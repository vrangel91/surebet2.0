const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addLastLoginColumn() {
  try {
    console.log('🔧 Adicionando coluna last_login à tabela users...');
    
    // Verificar se a coluna já existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Coluna last_login já existe na tabela users');
      return;
    }
    
    // Adicionar a coluna last_login
    const addColumnQuery = `
      ALTER TABLE users 
      ADD COLUMN last_login TIMESTAMP WITHOUT TIME ZONE
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ Coluna last_login adicionada com sucesso!');
    
    // Verificar a estrutura atualizada
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('📋 Estrutura da coluna last_login:', structureResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna last_login:', error);
  } finally {
    await pool.end();
  }
}

addLastLoginColumn();
