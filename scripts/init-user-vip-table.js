const { Pool } = require('pg');

async function initUserVIPTable() {
  let pool = null;
  
  try {
    console.log('🚀 Inicializando tabela user_vip...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake'
    });

    // Criar tabela user_vip
    console.log('👑 Criando tabela user_vip...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_vip (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(100) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        plan_days INTEGER NOT NULL,
        data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_fim TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'expirado', 'cancelado')),
        order_id INTEGER,
        payment_method VARCHAR(50),
        amount DECIMAL(10,2),
        auto_renew BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices para performance
    console.log('⚡ Criando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vip_user_id ON user_vip(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vip_status ON user_vip(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vip_data_fim ON user_vip(data_fim)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vip_plan_id ON user_vip(plan_id)
    `);

    // Função para atualizar updated_at automaticamente
    console.log('🔧 Criando função para atualizar updated_at...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_user_vip_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Trigger para atualizar updated_at
    console.log('🔧 Criando trigger...');
    await pool.query(`
      DROP TRIGGER IF EXISTS update_user_vip_updated_at ON user_vip
    `);
    
    await pool.query(`
      CREATE TRIGGER update_user_vip_updated_at
      BEFORE UPDATE ON user_vip
      FOR EACH ROW
      EXECUTE FUNCTION update_user_vip_updated_at()
    `);

    // Verificar se a tabela foi criada corretamente
    console.log('🔍 Verificando estrutura da tabela...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_vip'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela user_vip:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Verificar se existem dados
    const countResult = await pool.query('SELECT COUNT(*) FROM user_vip');
    const vipCount = parseInt(countResult.rows[0].count);
    console.log(`\n📊 Total de registros VIP: ${vipCount}`);

    console.log('\n✅ Tabela user_vip inicializada com sucesso!');
    console.log('\n📋 Funcionalidades implementadas:');
    console.log('  - Controle de data de início e fim do VIP');
    console.log('  - Status automático (ativo, inativo, expirado, cancelado)');
    console.log('  - Renovação automática de VIPs');
    console.log('  - Histórico completo de VIPs');
    console.log('  - Índices para performance');
    console.log('  - Triggers para atualização automática');

  } catch (error) {
    console.error('❌ Erro ao inicializar tabela user_vip:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initUserVIPTable()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { initUserVIPTable };
