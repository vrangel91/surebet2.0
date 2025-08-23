const axios = require('axios');

async function testEnhancedDelete() {
  try {
    console.log('🚀 Testando exclusão de usuários melhorada...\n');
    
    // Passo 1: Login como admin
    console.log('📋 Passo 1: Fazendo login como admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');
    
    // Passo 2: Listar usuários
    console.log('\n📋 Passo 2: Listando usuários...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = usersResponse.data.users;
    console.log(`✅ ${users.length} usuários encontrados`);
    
    // Encontrar usuário para deletar (não admin)
    const userToDelete = users.find(u => !u.is_admin);
    
    if (!userToDelete) {
      console.log('⚠️ Nenhum usuário não-admin encontrado para deletar');
      return;
    }
    
    console.log(`\n📋 Usuário selecionado para exclusão:`);
    console.log(`   - ID: ${userToDelete.id}`);
    console.log(`   - Username: ${userToDelete.username}`);
    console.log(`   - Email: ${userToDelete.email}`);
    
    // Passo 3: Tentar deletar com validação de ID inválido
    console.log('\n📋 Passo 3: Testando validação de ID inválido...');
    try {
      await axios.delete('http://localhost:3001/api/users/invalid', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ Validação de ID falhou (deveria ter retornado erro)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validação de ID funcionando:', error.response.data.error);
      } else {
        console.log('❌ Erro inesperado na validação:', error.response?.status);
      }
    }
    
    // Passo 4: Tentar deletar usuário inexistente
    console.log('\n📋 Passo 4: Testando exclusão de usuário inexistente...');
    try {
      await axios.delete('http://localhost:3001/api/users/99999', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ Validação de usuário inexistente falhou');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Validação de usuário inexistente funcionando:', error.response.data.error);
      } else {
        console.log('❌ Erro inesperado na validação:', error.response?.status);
      }
    }
    
    // Passo 5: Deletar usuário válido
    console.log('\n📋 Passo 5: Deletando usuário válido...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Exclusão bem-sucedida:');
      console.log('   - Status:', deleteResponse.status);
      console.log('   - Mensagem:', deleteResponse.data.message);
      console.log('   - Detalhes:', JSON.stringify(deleteResponse.data.details, null, 2));
      
    } catch (error) {
      console.log('❌ Erro na exclusão:', error.response?.status, error.response?.data);
      return;
    }
    
    // Passo 6: Verificar se foi realmente deletado
    console.log('\n📋 Passo 6: Verificando exclusão...');
    try {
      await axios.get(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ Usuário ainda existe após exclusão');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Usuário foi deletado com sucesso (não encontrado)');
      } else {
        console.log('❌ Erro ao verificar exclusão:', error.response?.status);
      }
    }
    
    // Passo 7: Listar usuários para confirmar
    console.log('\n📋 Passo 7: Listando usuários após exclusão...');
    const usersAfterResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const usersAfter = usersAfterResponse.data.users;
    console.log(`✅ ${usersAfter.length} usuários após exclusão`);
    
    const deletedUser = usersAfter.find(u => u.id === userToDelete.id);
    if (deletedUser) {
      console.log('❌ Usuário ainda aparece na lista após exclusão');
    } else {
      console.log('✅ Usuário não aparece mais na lista (exclusão bem-sucedida)');
    }
    
    console.log('\n🎉 Teste de exclusão melhorada concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro geral no teste:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEnhancedDelete();
