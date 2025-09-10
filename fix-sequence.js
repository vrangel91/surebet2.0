const { sequelize } = require('./models');

async function fixSequence() {
  try {
    console.log('🔧 Corrigindo sequência da tabela user_sessions...\n');
    
    // Verificar o maior ID atual na tabela
    const [maxIdResult] = await sequelize.query(`
      SELECT MAX(id) as max_id FROM user_sessions
    `);
    
    const maxId = maxIdResult[0].max_id;
    console.log('📊 Maior ID atual na tabela:', maxId);
    
    // Verificar a sequência atual
    const [sequenceResult] = await sequelize.query(`
      SELECT last_value, is_called FROM user_sessions_id_seq
    `);
    
    console.log('📊 Estado atual da sequência:');
    console.log('   - Last Value:', sequenceResult[0].last_value);
    console.log('   - Is Called:', sequenceResult[0].is_called);
    
    // Corrigir a sequência para o próximo valor disponível
    const nextValue = maxId + 1;
    console.log('🔢 Definindo sequência para:', nextValue);
    
    await sequelize.query(`
      SELECT setval('user_sessions_id_seq', $1, true)
    `, {
      bind: [nextValue]
    });
    
    // Verificar se a correção funcionou
    const [newSequenceResult] = await sequelize.query(`
      SELECT last_value, is_called FROM user_sessions_id_seq
    `);
    
    console.log('✅ Sequência corrigida:');
    console.log('   - Last Value:', newSequenceResult[0].last_value);
    console.log('   - Is Called:', newSequenceResult[0].is_called);
    
    // Testar inserção
    const testToken = 'test-token-' + Date.now();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    console.log('\n🧪 Testando inserção após correção...');
    
    const [insertResult] = await sequelize.query(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at
    `, {
      bind: [2, testToken, expiresAt]
    });
    
    console.log('✅ Inserção bem-sucedida após correção:');
    console.log('   - ID:', insertResult[0].id);
    console.log('   - Token:', insertResult[0].token);
    
    // Limpar sessão de teste
    await sequelize.query(`
      DELETE FROM user_sessions WHERE token = $1
    `, {
      bind: [testToken]
    });
    
    console.log('🧹 Sessão de teste removida');
    console.log('\n🎉 Sequência corrigida com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

fixSequence();
