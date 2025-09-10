const { sequelize } = require('../config/database');

async function checkDatabaseConstraints() {
  try {
    console.log('🔍 VERIFICANDO CONSTRAINTS E ESTRUTURA DO BANCO');
    console.log('================================================');
    
    // 1. Verificar estrutura da tabela surebet_stats
    console.log('\n1️⃣ Estrutura da tabela surebet_stats:');
    const [statsColumns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'surebet_stats' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Colunas encontradas:');
    statsColumns.forEach(col => {
      let details = `${col.column_name}: ${col.data_type}`;
      if (col.character_maximum_length) details += `(${col.character_maximum_length})`;
      details += ` (nullable: ${col.is_nullable})`;
      if (col.column_default) details += ` [default: ${col.column_default}]`;
      console.log(`  - ${details}`);
    });
    
    // 2. Verificar constraints
    console.log('\n2️⃣ Constraints da tabela surebet_stats:');
    const [constraints] = await sequelize.query(`
      SELECT 
        constraint_name, 
        constraint_type, 
        table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'surebet_stats'
      ORDER BY constraint_type
    `);
    
    console.log('🔒 Constraints encontradas:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
    // 3. Verificar chaves estrangeiras
    console.log('\n3️⃣ Chaves estrangeiras:');
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'surebet_stats'
    `);
    
    if (foreignKeys.length > 0) {
      console.log('🔗 Chaves estrangeiras:');
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('  - Nenhuma chave estrangeira encontrada');
    }
    
    // 4. Verificar índices
    console.log('\n4️⃣ Índices da tabela:');
    const [indexes] = await sequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'surebet_stats'
      ORDER BY indexname
    `);
    
    console.log('📋 Índices encontrados:');
    indexes.forEach(index => {
      console.log(`  - ${index.indexname}: ${index.indexdef}`);
    });
    
    // 5. Verificar dados existentes
    console.log('\n5️⃣ Dados existentes:');
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM surebet_stats
    `);
    console.log(`📊 Total de registros: ${count[0].total}`);
    
    if (count[0].total > 0) {
      const [sample] = await sequelize.query(`
        SELECT * FROM surebet_stats LIMIT 1
      `);
      console.log('📝 Exemplo de registro:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
    // 6. Verificar sequências
    console.log('\n6️⃣ Sequências:');
    try {
      const [sequences] = await sequelize.query(`
        SELECT 
          sequence_name,
          last_value,
          is_called
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        AND sequence_name LIKE '%surebet_stats%'
      `);
      
      if (sequences.length > 0) {
        console.log('🔢 Sequências encontradas:');
        sequences.forEach(seq => {
          console.log(`  - ${seq.sequence_name}: last_value=${seq.last_value}, is_called=${seq.is_called}`);
        });
      } else {
        console.log('  - Nenhuma sequência encontrada');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar sequências:', error.message);
    }
    
    console.log('\n🎉 Verificação de constraints concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar constraints:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDatabaseConstraints();
