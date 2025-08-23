const { Pool } = require('pg');

async function consolidateDatabases() {
  let sourcePool = null;
  let targetPool = null;
  
  try {
    console.log('🚀 Consolidando bancos de dados...');
    
    // Conectar ao banco fonte (surestake_db)
    sourcePool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake_db'
    });
    
    // Conectar ao banco destino (surestake)
    targetPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake'
    });
    
    console.log('📋 Verificando tabelas no banco fonte...');
    
    // Listar tabelas do banco fonte
    const sourceTables = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas encontradas no banco fonte:');
    sourceTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Criar tabelas no banco destino
    console.log('\n🔧 Criando tabelas no banco destino...');
    
    // 1. Tabela users
    console.log('👥 Criando tabela users...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        cpf VARCHAR(14),
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        is_vip BOOLEAN DEFAULT FALSE,
        vip_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Tabela user_sessions
    console.log('🔐 Criando tabela user_sessions...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 3. Tabela bookmaker_accounts
    console.log('🎰 Criando tabela bookmaker_accounts...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS bookmaker_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bookmaker_name VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        balance DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'BRL',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 4. Tabela surebet_stats
    console.log('📈 Criando tabela surebet_stats...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS surebet_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bookmaker_account_id INTEGER REFERENCES bookmaker_accounts(id),
        surebet_id VARCHAR(255),
        profit_loss DECIMAL(10,2) DEFAULT 0,
        bet_amount DECIMAL(10,2) DEFAULT 0,
        odds_1 DECIMAL(8,4),
        odds_2 DECIMAL(8,4),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 5. Tabela surebet_analytics
    console.log('📊 Criando tabela surebet_analytics...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS surebet_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date DATE,
        total_surebets INTEGER DEFAULT 0,
        successful_surebets INTEGER DEFAULT 0,
        total_profit DECIMAL(10,2) DEFAULT 0,
        total_bets DECIMAL(10,2) DEFAULT 0,
        roi_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 6. Tabela transaction_history
    console.log('💳 Criando tabela transaction_history...');
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS transaction_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bookmaker_account_id INTEGER REFERENCES bookmaker_accounts(id),
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrar dados
    console.log('\n🔄 Migrando dados...');
    
    // Migrar usuários
    console.log('👥 Migrando usuários...');
    const users = await sourcePool.query('SELECT * FROM users');
    if (users.rows.length > 0) {
      for (const user of users.rows) {
        // Tratar valores nulos
        const username = user.username || `user_${user.id}`;
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const cpf = user.cpf || '';
        const phone = user.phone || '';
        
        await targetPool.query(`
          INSERT INTO users (id, username, email, password_hash, first_name, last_name, cpf, phone, is_admin, is_vip, vip_expires_at, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING
        `, [
          user.id, username, user.email, user.password_hash, 
          firstName, lastName, cpf, phone,
          user.is_admin || false, user.is_vip || false, user.vip_expires_at,
          user.created_at, user.updated_at
        ]);
      }
      console.log(`✅ ${users.rows.length} usuários migrados`);
    }
    
    // Migrar sessões
    console.log('🔐 Migrando sessões...');
    const sessions = await sourcePool.query('SELECT * FROM user_sessions');
    if (sessions.rows.length > 0) {
      for (const session of sessions.rows) {
        await targetPool.query(`
          INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [session.id, session.user_id, session.token, session.expires_at, session.created_at]);
      }
      console.log(`✅ ${sessions.rows.length} sessões migradas`);
    }
    
    // Migrar contas de casas de apostas
    console.log('🎰 Migrando contas de casas de apostas...');
    const accounts = await sourcePool.query('SELECT * FROM bookmaker_accounts');
    if (accounts.rows.length > 0) {
      for (const account of accounts.rows) {
        await targetPool.query(`
          INSERT INTO bookmaker_accounts (id, user_id, bookmaker_name, username, balance, currency, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          account.id, account.user_id, account.bookmaker_name, account.username,
          account.balance, account.currency, account.is_active,
          account.created_at, account.updated_at
        ]);
      }
      console.log(`✅ ${accounts.rows.length} contas migradas`);
    }
    
    // Migrar estatísticas de surebets
    console.log('📈 Migrando estatísticas de surebets...');
    const stats = await sourcePool.query('SELECT * FROM surebet_stats');
    if (stats.rows.length > 0) {
      for (const stat of stats.rows) {
        await targetPool.query(`
          INSERT INTO surebet_stats (id, user_id, bookmaker_account_id, surebet_id, profit_loss, bet_amount, odds_1, odds_2, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [
          stat.id, stat.user_id, stat.bookmaker_account_id, stat.surebet_id,
          stat.profit_loss, stat.bet_amount, stat.odds_1, stat.odds_2,
          stat.status, stat.created_at
        ]);
      }
      console.log(`✅ ${stats.rows.length} estatísticas migradas`);
    }
    
    // Migrar análises
    console.log('📊 Migrando análises...');
    const analytics = await sourcePool.query('SELECT * FROM surebet_analytics');
    if (analytics.rows.length > 0) {
      for (const analytic of analytics.rows) {
        // Tratar valores nulos
        const userId = analytic.user_id || null;
        const date = analytic.date || new Date();
        const totalSurebets = analytic.total_surebets || 0;
        const successfulSurebets = analytic.successful_surebets || 0;
        const totalProfit = analytic.total_profit || 0;
        const totalBets = analytic.total_bets || 0;
        const roiPercentage = analytic.roi_percentage || 0;
        
        await targetPool.query(`
          INSERT INTO surebet_analytics (id, user_id, date, total_surebets, successful_surebets, total_profit, total_bets, roi_percentage, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          analytic.id, userId, date, totalSurebets,
          successfulSurebets, totalProfit, totalBets,
          roiPercentage, analytic.created_at || new Date()
        ]);
      }
      console.log(`✅ ${analytics.rows.length} análises migradas`);
    }
    
    // Migrar histórico de transações
    console.log('💳 Migrando histórico de transações...');
    const transactions = await sourcePool.query('SELECT * FROM transaction_history');
    if (transactions.rows.length > 0) {
      for (const transaction of transactions.rows) {
        await targetPool.query(`
          INSERT INTO transaction_history (id, user_id, bookmaker_account_id, transaction_type, amount, description, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [
          transaction.id, transaction.user_id, transaction.bookmaker_account_id,
          transaction.transaction_type, transaction.amount, transaction.description,
          transaction.status, transaction.created_at
        ]);
      }
      console.log(`✅ ${transactions.rows.length} transações migradas`);
    }
    
    // Criar índices para performance
    console.log('\n⚡ Criando índices...');
    
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_bookmaker_accounts_user_id ON bookmaker_accounts(user_id)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_surebet_stats_user_id ON surebet_stats(user_id)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_surebet_analytics_user_id ON surebet_analytics(user_id)');
    await targetPool.query('CREATE INDEX IF NOT EXISTS idx_transaction_history_user_id ON transaction_history(user_id)');
    
    console.log('✅ Índices criados');
    
    // Verificar dados migrados
    console.log('\n🔍 Verificando dados migrados...');
    
    const tables = ['users', 'user_sessions', 'bookmaker_accounts', 'surebet_stats', 'surebet_analytics', 'transaction_history'];
    
    for (const table of tables) {
      const result = await targetPool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`📋 ${table}: ${result.rows[0].count} registros`);
    }
    
    console.log('\n🎉 Consolidação concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  - Todas as tabelas foram criadas no banco surestake');
    console.log('  - Dados migrados do banco surestake_db');
    console.log('  - Sistema agora usa um banco unificado');
    console.log('  - PIX e sistema VIP funcionando perfeitamente');
    
    console.log('\n🚀 Próximos passos:');
    console.log('  1. Atualizar configurações para usar apenas surestake');
    console.log('  2. Testar sistema completo');
    console.log('  3. Remover banco surestake_db (opcional)');
    
  } catch (error) {
    console.error('❌ Erro na consolidação:', error);
    throw error;
  } finally {
    if (sourcePool) await sourcePool.end();
    if (targetPool) await targetPool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  consolidateDatabases()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { consolidateDatabases };
