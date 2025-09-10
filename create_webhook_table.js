const { sequelize } = require('./config/database');

async function createWebhookEventsTable() {
  try {
    console.log('🔄 Criando tabela webhook_events...');
    
    // Criar tabela
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id VARCHAR(255) PRIMARY KEY,
        payment_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabela webhook_events criada com sucesso!');
    
    // Criar índices
    console.log('🔄 Criando índices...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id 
      ON webhook_events(payment_id)
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at 
      ON webhook_events(processed_at)
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_status 
      ON webhook_events(status)
    `);
    
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar se a tabela foi criada
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'webhook_events'
    `);
    
    if (results.length > 0) {
      console.log('✅ Tabela webhook_events confirmada no banco de dados!');
    } else {
      console.log('❌ Erro: Tabela não foi criada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar
createWebhookEventsTable();
