const { sequelize } = require('../config/database');
const { Ticket, TicketMessage } = require('../models');

async function initTicketTables() {
  try {
    console.log('🚀 Iniciando criação das tabelas de tickets...');
    
    // Sincronizar modelos com o banco
    await sequelize.sync({ force: false, alter: false });
    
    console.log('✅ Tabelas de tickets criadas/atualizadas com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const ticketTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('tickets'));
    
    const messageTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('ticket_messages'));
    
    if (ticketTableExists && messageTableExists) {
      console.log('✅ Tabelas verificadas:');
      console.log('   - tickets: ✅');
      console.log('   - ticket_messages: ✅');
      
      // Mostrar estrutura das tabelas
      const ticketStructure = await sequelize.getQueryInterface().describeTable('tickets');
      const messageStructure = await sequelize.getQueryInterface().describeTable('ticket_messages');
      
      console.log('\n📋 Estrutura da tabela tickets:');
      Object.keys(ticketStructure).forEach(column => {
        const col = ticketStructure[column];
        console.log(`   - ${column}: ${col.type} ${col.allowNull ? 'NULL' : 'NOT NULL'}`);
      });
      
      console.log('\n📋 Estrutura da tabela ticket_messages:');
      Object.keys(messageStructure).forEach(column => {
        const col = messageStructure[column];
        console.log(`   - ${column}: ${col.type} ${col.allowNull ? 'NULL' : 'NOT NULL'}`);
      });
      
    } else {
      console.log('❌ Erro: Algumas tabelas não foram criadas');
      if (!ticketTableExists) console.log('   - tickets: ❌');
      if (!messageTableExists) console.log('   - ticket_messages: ❌');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas de tickets:', error);
    
    // Se for erro de enum, tentar criar manualmente
    if (error.message.includes('ENUM')) {
      console.log('🔄 Tentando criar tabelas manualmente...');
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(20) CHECK (category IN ('financial', 'technical', 'support', 'billing', 'feature', 'other')) NOT NULL DEFAULT 'other',
            priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
            status VARCHAR(20) CHECK (status IN ('open', 'pending', 'closed')) NOT NULL DEFAULT 'open',
            user_id INTEGER NOT NULL REFERENCES users(id),
            assigned_to INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS ticket_messages (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            message_type VARCHAR(20) CHECK (message_type IN ('user', 'support', 'admin')) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        console.log('✅ Tabelas criadas manualmente com sucesso!');
        
      } catch (manualError) {
        console.error('❌ Erro ao criar tabelas manualmente:', manualError);
      }
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Conexão com banco fechada');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initTicketTables()
    .then(() => {
      console.log('🎉 Script de inicialização concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { initTicketTables };
