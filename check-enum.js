/**
 * Script para verificar o enum no banco de dados
 */

const { Pool } = require('pg');

async function checkEnum() {
  let pool = null;
  
  try {
    console.log('🔍 Verificando enum no banco de dados...');

    // Conectar ao banco de dados
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'SureStake2024!',
      database: 'surestake'
    });

    // Verificar se a tabela user_vip existe
    console.log('📋 Verificando tabela user_vip...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_vip'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela user_vip não existe!');
      return;
    }
    
    console.log('✅ Tabela user_vip existe');

    // Verificar a estrutura da coluna status
    console.log('🔍 Verificando coluna status...');
    const columnInfo = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_vip' 
      AND column_name = 'status';
    `);
    
    if (columnInfo.rows.length === 0) {
      console.log('❌ Coluna status não existe!');
      return;
    }
    
    console.log('📊 Informações da coluna status:');
    console.log(columnInfo.rows[0]);

    // Verificar se é um enum
    if (columnInfo.rows[0].data_type === 'USER-DEFINED') {
      console.log('🔍 Verificando valores do enum...');
      const enumValues = await pool.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid 
          FROM pg_type 
          WHERE typname = 'enum_user_vip_status'
        )
        ORDER BY enumsortorder;
      `);
      
      console.log('📋 Valores do enum enum_user_vip_status:');
      enumValues.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. "${row.enumlabel}"`);
      });
    }

    // Tentar inserir um registro de teste
    console.log('🧪 Testando inserção com status "ativo"...');
    try {
      const testInsert = await pool.query(`
        INSERT INTO user_vip (user_id, plan_id, plan_name, plan_days, data_inicio, data_fim, status)
        VALUES (999999, 'test', 'Teste', 30, NOW(), NOW() + INTERVAL '30 days', 'ativo')
        RETURNING id;
      `);
      
      console.log('✅ Inserção com "ativo" funcionou! ID:', testInsert.rows[0].id);
      
      // Limpar o registro de teste
      await pool.query('DELETE FROM user_vip WHERE id = $1', [testInsert.rows[0].id]);
      console.log('🧹 Registro de teste removido');
      
    } catch (insertError) {
      console.error('❌ Erro ao inserir com "ativo":', insertError.message);
    }

    // Tentar inserir com "active" para ver o erro
    console.log('🧪 Testando inserção com status "active"...');
    try {
      const testInsert2 = await pool.query(`
        INSERT INTO user_vip (user_id, plan_id, plan_name, plan_days, data_inicio, data_fim, status)
        VALUES (999999, 'test', 'Teste', 30, NOW(), NOW() + INTERVAL '30 days', 'active')
        RETURNING id;
      `);
      
      console.log('✅ Inserção com "active" funcionou! ID:', testInsert2.rows[0].id);
      
      // Limpar o registro de teste
      await pool.query('DELETE FROM user_vip WHERE id = $1', [testInsert2.rows[0].id]);
      console.log('🧹 Registro de teste removido');
      
    } catch (insertError2) {
      console.error('❌ Erro ao inserir com "active":', insertError2.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

checkEnum();
