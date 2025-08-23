const { Pool } = require('pg');

async function initVIPTables() {
  let pool = null;
  
  try {
    console.log('🚀 Inicializando tabelas do sistema VIP...');

    // 0. Criar banco de dados surestake se não existir
    console.log('🗄️ Verificando banco de dados surestake...');
    
    // Primeira conexão para criar o banco
    const postgresPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'postgres'
    });
    
    try {
      await postgresPool.query('CREATE DATABASE surestake');
      console.log('✅ Banco de dados surestake criado com sucesso!');
    } catch (dbError) {
      if (dbError.code === '42P04') {
        console.log('ℹ️ Banco de dados surestake já existe');
      } else {
        console.log('⚠️ Erro ao criar banco (pode já existir):', dbError.message);
      }
    }
    
    await postgresPool.end();
    
    // Nova conexão com o banco surestake
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake'
    });

    // 1. Tabela de pedidos
    console.log('📋 Criando tabela orders...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(100) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        plan_days INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        installments INTEGER DEFAULT 1,
        customer_data JSONB,
        payment_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tabela de status VIP dos usuários
    console.log('👑 Criando tabela user_vip_status...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_vip_status (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(100) NOT NULL,
        plan_days INTEGER NOT NULL,
        activated_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        order_id INTEGER REFERENCES orders(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Tabela de histórico de transações
    console.log('💳 Criando tabela payment_history...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        payment_id VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        installments INTEGER,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details JSONB
      )
    `);

    // 4. Tabela de notificações
    console.log('🔔 Criando tabela notifications...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Tabela de logs do sistema
    console.log('📝 Criando tabela system_logs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        user_id VARCHAR(255),
        order_id INTEGER REFERENCES orders(id),
        vip_id INTEGER REFERENCES user_vip_status(id),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Índices para performance
    console.log('⚡ Criando índices...');
    
    // Índices para orders
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
    `);

    // Índices para user_vip_status
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vip_user_id ON user_vip_status(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vip_status ON user_vip_status(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vip_expires_at ON user_vip_status(expires_at)
    `);

    // Índices para payment_history
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment_history(order_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_history(status)
    `);

    // Índices para notifications
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at)
    `);

    // 7. Funções auxiliares
    console.log('🔧 Criando funções auxiliares...');
    
    // Função para atualizar updated_at automaticamente
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Triggers para atualizar updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders
    `);
    
    await pool.query(`
      CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_vip_updated_at ON user_vip_status
    `);
    
    await pool.query(`
      CREATE TRIGGER update_vip_updated_at
      BEFORE UPDATE ON user_vip_status
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    // 8. Dados iniciais (opcional)
    console.log('🌱 Inserindo dados iniciais...');
    
    // Verificar se já existem dados
    const existingOrders = await pool.query('SELECT COUNT(*) FROM orders');
    const existingVIPs = await pool.query('SELECT COUNT(*) FROM user_vip_status');
    
    if (parseInt(existingOrders.rows[0].count) === 0) {
      console.log('📊 Tabela orders está vazia');
    }
    
    if (parseInt(existingVIPs.rows[0].count) === 0) {
      console.log('👑 Tabela user_vip_status está vazia');
    }

    // 9. Verificar estrutura das tabelas
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const tables = ['orders', 'user_vip_status', 'payment_history', 'notifications', 'system_logs'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n📋 Tabela: ${table}`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
      });
    }

    console.log('\n✅ Sistema VIP inicializado com sucesso!');
    console.log('\n📊 Resumo das tabelas criadas:');
    console.log('  - orders: Gerenciamento de pedidos');
    console.log('  - user_vip_status: Status VIP dos usuários');
    console.log('  - payment_history: Histórico de pagamentos');
    console.log('  - notifications: Sistema de notificações');
    console.log('  - system_logs: Logs do sistema');
    
    console.log('\n🚀 Próximos passos:');
    console.log('  1. Configurar variáveis de ambiente');
    console.log('  2. Testar conexão com Mercado Pago');
    console.log('  3. Implementar autenticação JWT');
    console.log('  4. Configurar webhooks');
    console.log('  5. Testar fluxo completo');

  } catch (error) {
    console.error('❌ Erro ao inicializar sistema VIP:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initVIPTables()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { initVIPTables };
