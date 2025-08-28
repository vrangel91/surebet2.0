const { sequelize } = require('../config/database');

async function testAccountTypeUpdate() {
  console.log('🧪 Testando funcionalidade de atualização de tipo de conta...');
  
  try {
    // 1. Verificar se a coluna account_type existe
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'account_type'
    `);
    
    if (columns.length === 0) {
      console.log('❌ Coluna account_type não existe na tabela users');
      return;
    }
    
    console.log('✅ Coluna account_type existe na tabela users');
    
    // 2. Verificar usuários existentes e seus tipos de conta
    const [users] = await sequelize.query(`
      SELECT id, username, email, account_type, is_admin, is_vip
      FROM users 
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('\n📊 Usuários encontrados:');
    users.forEach(user => {
      console.log(`  ID: ${user.id} | ${user.username || user.email} | Tipo: ${user.account_type} | Admin: ${user.is_admin} | VIP: ${user.is_vip}`);
    });
    
    // 3. Testar atualização de um usuário (se existir)
    if (users.length > 0) {
      const testUser = users[0];
      const newAccountType = testUser.account_type === 'basic' ? 'premium' : 'basic';
      
      console.log(`\n🔄 Testando atualização do usuário ID ${testUser.id} de '${testUser.account_type}' para '${newAccountType}'...`);
      
      const [updateResult] = await sequelize.query(`
        UPDATE users 
        SET account_type = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, username, email, account_type, updated_at
      `, [newAccountType, testUser.id]);
      
      if (updateResult.length > 0) {
        console.log('✅ Atualização realizada com sucesso!');
        console.log(`  Novo tipo de conta: ${updateResult[0].account_type}`);
        console.log(`  Atualizado em: ${updateResult[0].updated_at}`);
        
        // 4. Verificar se a atualização foi persistida
        const [verifyResult] = await sequelize.query(`
          SELECT id, username, email, account_type
          FROM users 
          WHERE id = $1
        `, [testUser.id]);
        
        if (verifyResult.length > 0 && verifyResult[0].account_type === newAccountType) {
          console.log('✅ Verificação: Dados persistidos corretamente no banco');
        } else {
          console.log('❌ Verificação: Dados não foram persistidos corretamente');
        }
        
        // 5. Reverter para o valor original
        await sequelize.query(`
          UPDATE users 
          SET account_type = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [testUser.account_type, testUser.id]);
        
        console.log(`🔄 Revertido para o valor original: '${testUser.account_type}'`);
        
      } else {
        console.log('❌ Falha na atualização');
      }
    }
    
    // 6. Verificar estrutura da tabela
    console.log('\n📋 Estrutura da coluna account_type:');
    const [columnInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'account_type'
    `);
    
    if (columnInfo.length > 0) {
      const info = columnInfo[0];
      console.log(`  Nome: ${info.column_name}`);
      console.log(`  Tipo: ${info.data_type}`);
      console.log(`  Nullable: ${info.is_nullable}`);
      console.log(`  Default: ${info.column_default}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testAccountTypeUpdate();
