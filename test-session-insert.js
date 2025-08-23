const { sequelize } = require('./models');

async function testSessionInsert() {
  try {
    console.log('🔍 Testando inserção na tabela user_sessions...\n');
    
    // Verificar a sequência atual
    const [sequenceResult] = await sequelize.query(`
      SELECT last_value, is_called FROM user_sessions_id_seq
    `);
    
    console.log('📊 Estado da sequência:');
    console.log('   - Last Value:', sequenceResult[0].last_value);
    console.log('   - Is Called:', sequenceResult[0].is_called);
    
    // Verificar o próximo ID disponível
    const [nextIdResult] = await sequelize.query(`
      SELECT nextval('user_sessions_id_seq')
    `);
    
    console.log('🔢 Próximo ID disponível:', nextIdResult[0].nextval);
    
    // Tentar inserir uma sessão de teste
    const testToken = 'test-token-' + Date.now();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    console.log('\n📤 Tentando inserir sessão de teste...');
    console.log('   - Token:', testToken);
    console.log('   - Expires At:', expiresAt);
    
    const [insertResult] = await sequelize.query(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at
    `, {
      bind: [2, testToken, expiresAt]
    });
    
    console.log('✅ Sessão inserida com sucesso:');
    console.log('   - ID:', insertResult[0].id);
    console.log('   - User ID:', insertResult[0].user_id);
    console.log('   - Token:', insertResult[0].token);
    
    // Limpar sessão de teste
    await sequelize.query(`
      DELETE FROM user_sessions WHERE token = $1
    `, {
      bind: [testToken]
    });
    
    console.log('🧹 Sessão de teste removida');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSessionInsert();
