const { Pool } = require('pg');

async function addPlanIdToUsers() {
  let pool = null;
  
  try {
    console.log('🚀 Adicionando coluna plan_id à tabela users...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '7nYi>q10v_:>8pz)^0dC',
      database: process.env.DB_NAME || 'surestake'
    });

    // Verificar se a coluna já existe
    console.log('🔍 Verificando se a coluna plan_id já existe...');
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'plan_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna plan_id já existe na tabela users');
      return;
    }

    // Adicionar coluna plan_id
    console.log('➕ Adicionando coluna plan_id...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL
    `);

    // Adicionar índice para performance
    console.log('⚡ Criando índice para plan_id...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id)
    `);

    // Adicionar comentário na coluna
    await pool.query(`
      COMMENT ON COLUMN users.plan_id IS 'ID do plano associado ao usuário'
    `);

    console.log('✅ Coluna plan_id adicionada com sucesso!');
    console.log('📋 Próximos passos:');
    console.log('   1. Atualizar tabela plans com os novos planos');
    console.log('   2. Migrar dados existentes da tabela user_vip');
    console.log('   3. Atualizar APIs para usar o novo relacionamento');

  } catch (error) {
    console.error('❌ Erro ao adicionar coluna plan_id:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addPlanIdToUsers()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { addPlanIdToUsers };
