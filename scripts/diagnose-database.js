const { sequelize } = require('../config/database');

async function diagnoseDatabase() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DO BANCO DE DADOS');
    console.log('============================================');
    
    // 1. Testar conexão
    console.log('\n1️⃣ Testando conexão...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');
    
    // 2. Verificar todas as tabelas
    console.log('\n2️⃣ Verificando todas as tabelas...');
    const [tables] = await sequelize.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
    
    // 3. Verificar estrutura detalhada de surebet_stats
    console.log('\n3️⃣ Estrutura detalhada de surebet_stats...');
    const [statsColumns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'surebet_stats' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas de surebet_stats:');
    statsColumns.forEach(col => {
      let details = `${col.column_name}: ${col.data_type}`;
      if (col.character_maximum_length) details += `(${col.character_maximum_length})`;
      if (col.numeric_precision) details += `(${col.numeric_precision},${col.numeric_scale || 0})`;
      details += ` (nullable: ${col.is_nullable})`;
      if (col.column_default) details += ` [default: ${col.column_default}]`;
      console.log(`  - ${details}`);
    });
    
    // 4. Verificar estrutura detalhada de surebet_analytics
    console.log('\n4️⃣ Estrutura detalhada de surebet_analytics...');
    const [analyticsColumns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'surebet_analytics' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas de surebet_analytics:');
    analyticsColumns.forEach(col => {
      let details = `${col.column_name}: ${col.data_type}`;
      if (col.character_maximum_length) details += `(${col.character_maximum_length})`;
      if (col.numeric_precision) details += `(${col.numeric_precision},${col.numeric_scale || 0})`;
      details += ` (nullable: ${col.is_nullable})`;
      if (col.column_default) details += ` [default: ${col.column_default}]`;
      console.log(`  - ${details}`);
    });
    
    // 5. Verificar constraints e índices
    console.log('\n5️⃣ Verificando constraints e índices...');
    
    // Constraints de surebet_stats
    const [statsConstraints] = await sequelize.query(`
      SELECT 
        constraint_name, 
        constraint_type, 
        table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'surebet_stats'
    `);
    
    console.log('🔒 Constraints de surebet_stats:');
    statsConstraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
    // 6. Verificar dados existentes
    console.log('\n6️⃣ Verificando dados existentes...');
    
    const [statsCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM surebet_stats
    `);
    console.log(`📊 Total de registros em surebet_stats: ${statsCount[0].total}`);
    
    const [analyticsCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM surebet_analytics
    `);
    console.log(`📊 Total de registros em surebet_analytics: ${analyticsCount[0].total}`);
    
    // 7. Verificar sequências
    console.log('\n7️⃣ Verificando sequências...');
    try {
      const [sequences] = await sequelize.query(`
        SELECT 
          sequence_name,
          last_value,
          is_called,
          increment_by
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        ORDER BY sequence_name
      `);
      
      console.log('🔢 Sequências encontradas:');
      sequences.forEach(seq => {
        console.log(`  - ${seq.sequence_name}: last_value=${seq.last_value}, is_called=${seq.is_called}`);
      });
    } catch (error) {
      console.log('⚠️ Erro ao verificar sequências:', error.message);
    }
    
    // 8. Verificar permissões
    console.log('\n8️⃣ Verificando permissões...');
    try {
      const [permissions] = await sequelize.query(`
        SELECT 
          grantee,
          privilege_type,
          table_name
        FROM information_schema.role_table_grants 
        WHERE table_name IN ('surebet_stats', 'surebet_analytics')
        ORDER BY table_name, privilege_type
      `);
      
      console.log('🔑 Permissões encontradas:');
      permissions.forEach(perm => {
        console.log(`  - ${perm.grantee} pode ${perm.privilege_type} em ${perm.table_name}`);
      });
    } catch (error) {
      console.log('⚠️ Erro ao verificar permissões:', error.message);
    }
    
    // 9. Testar inserção simples
    console.log('\n9️⃣ Testando inserção simples...');
    try {
      const [insertResult] = await sequelize.query(`
        INSERT INTO surebet_stats (
          surebet_id, user_id, house, market, match, profit, 
          date, hour, sport, period, minutes, anchorh1, anchorh2, 
          chance, metadata, status, created_at, updated_at
        ) VALUES (
          'test_diagnose_${Date.now()}', 
          1, 'TestHouse', 'TestMarket', 'Test Match', 
          10.50, CURRENT_DATE, 12, 'Football', '90min', 
          90, 'Team1', 'Team2', 95.5, 
          '{"test": true, "diagnose": true}', 'active',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id
      `);
      
      console.log(`✅ Inserção teste bem-sucedida: ID ${insertResult[0].id}`);
      
      // Limpar teste
      await sequelize.query(`
        DELETE FROM surebet_stats WHERE id = ${insertResult[0].id}
      `);
      console.log('✅ Teste limpo');
      
    } catch (error) {
      console.error('❌ Erro na inserção teste:', error.message);
      console.error('SQL State:', error.sqlState);
      console.error('Code:', error.code);
    }
    
    console.log('\n🎉 DIAGNÓSTICO COMPLETO FINALIZADO!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

diagnoseDatabase();
