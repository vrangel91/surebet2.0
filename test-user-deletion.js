const axios = require('axios');

async function testUserDeletion() {
  try {
    console.log('🗑️ Testando exclusão de usuários...\n');
    
    // Passo 1: Fazer login como admin
    console.log('📋 Passo 1: Fazendo login como admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');
    
    // Passo 2: Listar usuários para ver quais existem
    console.log('\n📋 Passo 2: Listando usuários existentes...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const users = usersResponse.data.users;
    console.log(`✅ ${users.length} usuários encontrados`);
    
    // Encontrar um usuário que não seja o admin logado
    const adminUser = users.find(u => u.email === 'admin@surestake.com');
    const otherUsers = users.filter(u => u.id !== adminUser.id);
    
    if (otherUsers.length === 0) {
      console.log('⚠️ Não há outros usuários para deletar (apenas o admin)');
      return;
    }
    
    const userToDelete = otherUsers[0];
    console.log(`📋 Usuário selecionado para exclusão: ${userToDelete.username} (ID: ${userToDelete.id})`);
    
    // Passo 3: Tentar deletar o usuário
    console.log('\n📋 Passo 3: Tentando deletar usuário...');
    const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Usuário deletado com sucesso:');
    console.log('   - Status:', deleteResponse.status);
    console.log('   - Mensagem:', deleteResponse.data.message);
    
    // Passo 4: Verificar se o usuário foi realmente deletado
    console.log('\n📋 Passo 4: Verificando se usuário foi deletado...');
    try {
      const userResponse = await axios.get(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Usuário ainda existe (erro na exclusão)');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Usuário foi deletado com sucesso (não encontrado)');
      } else {
        console.log('❌ Erro ao verificar exclusão:', error.message);
      }
    }
    
    console.log('\n🎉 Teste de exclusão de usuários concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testUserDeletion();
