const { Pool } = require('pg');

async function updatePlansTable() {
  let pool = null;
  
  try {
    console.log('🚀 Atualizando tabela plans com os novos planos...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || '7nYi>q10v_:>8pz)^0dC',
      database: process.env.DB_NAME || 'surestake'
    });

    // Verificar se a tabela plans existe
    console.log('🔍 Verificando se a tabela plans existe...');
    const checkTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'plans'
    `);

    if (checkTable.rows.length === 0) {
      console.log('📋 Criando tabela plans...');
      await pool.query(`
        CREATE TABLE plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          display_name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          category VARCHAR(50) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          duration_days INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          description TEXT,
          features JSONB,
          color VARCHAR(7),
          css_class VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Limpar dados antigos
    console.log('🧹 Limpando dados antigos...');
    await pool.query('DELETE FROM plans');

    // Inserir os novos planos
    console.log('➕ Inserindo novos planos...');
    
    const newPlans = [
      // Pré-Jogo
      { name: 'pre-daily', display_name: 'Pré-Jogo Diário', type: 'pre-daily', category: 'Pré-Jogo', price: 19.90, duration_days: 1, color: '#28a745', css_class: 'pre-daily' },
      { name: 'pre-weekly', display_name: 'Pré-Jogo Semanal', type: 'pre-weekly', category: 'Pré-Jogo', price: 39.90, duration_days: 7, color: '#28a745', css_class: 'pre-weekly' },
      { name: 'pre-monthly', display_name: 'Pré-Jogo Mensal', type: 'pre-monthly', category: 'Pré-Jogo', price: 79.90, duration_days: 30, color: '#28a745', css_class: 'pre-monthly' },
      { name: 'pre-yearly', display_name: 'Pré-Jogo Anual', type: 'pre-yearly', category: 'Pré-Jogo', price: 299.90, duration_days: 365, color: '#28a745', css_class: 'pre-yearly' },
      
      // Live
      { name: 'live-daily', display_name: 'Live Diário', type: 'live-daily', category: 'Live', price: 19.90, duration_days: 1, color: '#dc3545', css_class: 'live-daily' },
      { name: 'live-weekly', display_name: 'Live Semanal', type: 'live-weekly', category: 'Live', price: 39.90, duration_days: 7, color: '#dc3545', css_class: 'live-weekly' },
      { name: 'live-monthly', display_name: 'Live Mensal', type: 'live-monthly', category: 'Live', price: 79.90, duration_days: 30, color: '#dc3545', css_class: 'live-monthly' },
      { name: 'live-yearly', display_name: 'Live Anual', type: 'live-yearly', category: 'Live', price: 299.90, duration_days: 365, color: '#dc3545', css_class: 'live-yearly' },
      
      // Live + Pré
      { name: 'prelive-daily', display_name: 'Pré+Live Diário', type: 'prelive-daily', category: 'Pré+Live', price: 29.90, duration_days: 1, color: '#6f42c1', css_class: 'prelive-daily' },
      { name: 'prelive-weekly', display_name: 'Pré+Live Semanal', type: 'prelive-weekly', category: 'Pré+Live', price: 59.90, duration_days: 7, color: '#6f42c1', css_class: 'prelive-weekly' },
      { name: 'prelive-monthly', display_name: 'Pré+Live Mensal', type: 'prelive-monthly', category: 'Pré+Live', price: 119.90, duration_days: 30, color: '#6f42c1', css_class: 'prelive-monthly' },
      { name: 'prelive-yearly', display_name: 'Pré+Live Anual', type: 'prelive-yearly', category: 'Pré+Live', price: 399.90, duration_days: 365, color: '#6f42c1', css_class: 'prelive-yearly' },
      
      // Valuebet
      { name: 'valuebet-daily', display_name: 'Valuebet Diário', type: 'valuebet-daily', category: 'Valuebet', price: 19.90, duration_days: 1, color: '#fd7e14', css_class: 'valuebet-daily' },
      { name: 'valuebet-weekly', display_name: 'Valuebet Semanal', type: 'valuebet-weekly', category: 'Valuebet', price: 39.90, duration_days: 7, color: '#fd7e14', css_class: 'valuebet-weekly' },
      { name: 'valuebet-monthly', display_name: 'Valuebet Mensal', type: 'valuebet-monthly', category: 'Valuebet', price: 79.90, duration_days: 30, color: '#fd7e14', css_class: 'valuebet-monthly' },
      { name: 'valuebet-yearly', display_name: 'Valuebet Anual', type: 'valuebet-yearly', category: 'Valuebet', price: 299.90, duration_days: 365, color: '#fd7e14', css_class: 'valuebet-yearly' },
      
      // Full
      { name: 'full-daily', display_name: 'Full Diário', type: 'full-daily', category: 'Full', price: 39.90, duration_days: 1, color: '#20c997', css_class: 'full-daily' },
      { name: 'full-weekly', display_name: 'Full Semanal', type: 'full-weekly', category: 'Full', price: 79.90, duration_days: 7, color: '#20c997', css_class: 'full-weekly' },
      { name: 'full-monthly', display_name: 'Full Mensal', type: 'full-monthly', category: 'Full', price: 159.90, duration_days: 30, color: '#20c997', css_class: 'full-monthly' },
      { name: 'full-yearly', display_name: 'Full Anual', type: 'full-yearly', category: 'Full', price: 599.90, duration_days: 365, color: '#20c997', css_class: 'full-yearly' }
    ];

    // Inserir planos
    for (const plan of newPlans) {
      await pool.query(`
        INSERT INTO plans (name, display_name, type, category, price, duration_days, color, css_class, is_active, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        plan.name,
        plan.display_name,
        plan.type,
        plan.category,
        plan.price,
        plan.duration_days,
        plan.color,
        plan.css_class,
        true
      ]);
    }

    // Criar função para atualizar updatedAt automaticamente
    console.log('🔧 Criando função para atualizar updatedAt...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_plans_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Criar trigger para updatedAt
    await pool.query(`
      DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
      CREATE TRIGGER update_plans_updated_at
        BEFORE UPDATE ON plans
        FOR EACH ROW
        EXECUTE FUNCTION update_plans_updated_at()
    `);

    // Verificar inserção
    const result = await pool.query('SELECT COUNT(*) as count FROM plans');
    console.log(`✅ ${result.rows[0].count} planos inseridos com sucesso!`);

    // Mostrar resumo por categoria
    const categories = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM plans 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('📊 Resumo por categoria:');
    categories.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} planos`);
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tabela plans:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updatePlansTable()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { updatePlansTable };
