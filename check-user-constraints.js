const { sequelize } = require('./models');

async function checkUserConstraints() {
  try {
    console.log('🔍 Verificando restrições de chave estrangeira para usuários...\n');
    
    // Verificar se há tabelas que referenciam users
    const [constraints] = await sequelize.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'users'
        AND ccu.column_name = 'id'
    `);
    
    if (constraints.length > 0) {
      console.log('📋 Tabelas que referenciam users:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.table_name}.${constraint.column_name} -> users.id`);
      });
    } else {
      console.log('✅ Nenhuma restrição de chave estrangeira encontrada');
    }
    
    // Verificar se há dados nas tabelas que referenciam users
    if (constraints.length > 0) {
      console.log('\n📊 Verificando dados nas tabelas relacionadas...');
      
      for (const constraint of constraints) {
        const [count] = await sequelize.query(`
          SELECT COUNT(*) as count FROM ${constraint.table_name}
        `);
        
        console.log(`   - ${constraint.table_name}: ${count[0].count} registros`);
        
        // Verificar se há registros que referenciam um usuário específico
        const [userRefs] = await sequelize.query(`
          SELECT COUNT(*) as count FROM ${constraint.table_name} 
          WHERE ${constraint.column_name} = $1
        `, {
          bind: [2] // ID do usuário admin
        });
        
        console.log(`     Referências ao usuário ID 2: ${userRefs[0].count}`);
      }
    }
    
    // Verificar se há triggers ou regras especiais
    console.log('\n🔍 Verificando triggers e regras...');
    const [triggers] = await sequelize.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
    `);
    
    if (triggers.length > 0) {
      console.log('📋 Triggers encontrados na tabela users:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
        console.log(`     ${trigger.action_statement}`);
      });
    } else {
      console.log('✅ Nenhum trigger encontrado na tabela users');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUserConstraints();
