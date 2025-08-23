const axios = require('axios');

async function testDeleteDebug() {
  try {
    console.log('🔍 Debugando exclusão de usuários...\n');
    
    // Passo 1: Fazer login como admin
    console.log('📋 Passo 1: Fazendo login como admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');
    console.log('   - Token:', token.substring(0, 30) + '...');
    console.log('   - User ID:', loginResponse.data.user.id);
    console.log('   - Is Admin:', loginResponse.data.user.is_admin);
    
    // Passo 2: Verificar token no endpoint /me
    console.log('\n📋 Passo 2: Verificando token...');
    const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token válido:');
    console.log('   - Status:', meResponse.status);
    console.log('   - User ID:', meResponse.data.user?.id);
    console.log('   - Is Admin:', meResponse.data.user?.is_admin);
    
    // Passo 3: Listar usuários para ver quais existem
    console.log('\n📋 Passo 3: Listando usuários...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const users = usersResponse.data.users;
    console.log(`✅ ${users.length} usuários encontrados:`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Admin: ${user.is_admin}`);
    });
    
    // Encontrar um usuário que não seja o admin logado
    const adminUser = users.find(u => u.email === 'admin@surestake.com');
    const otherUsers = users.filter(u => u.id !== adminUser.id);
    
    if (otherUsers.length === 0) {
      console.log('\n⚠️ Não há outros usuários para deletar (apenas o admin)');
      return;
    }
    
    const userToDelete = otherUsers[0];
    console.log(`\n📋 Usuário selecionado para exclusão:`);
    console.log(`   - ID: ${userToDelete.id}`);
    console.log(`   - Username: ${userToDelete.username}`);
    console.log(`   - Email: ${userToDelete.email}`);
    
    // Passo 4: Verificar se o usuário existe individualmente
    console.log('\n📋 Passo 4: Verificando usuário individual...');
    try {
      const userResponse = await axios.get(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Usuário encontrado individualmente:');
      console.log('   - Status:', userResponse.status);
      console.log('   - Dados:', userResponse.data.user);
    } catch (error) {
      console.log('❌ Erro ao buscar usuário individual:', error.response?.status, error.response?.data);
    }
    
    // Passo 5: Tentar deletar o usuário
    console.log('\n📋 Passo 5: Tentando deletar usuário...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Resposta da exclusão:');
      console.log('   - Status:', deleteResponse.status);
      console.log('   - Dados:', deleteResponse.data);
      
    } catch (error) {
      console.log('❌ Erro na exclusão:');
      console.log('   - Status:', error.response?.status);
      console.log('   - Dados:', error.response?.data);
      console.log('   - Mensagem:', error.message);
    }
    
    // Passo 6: Verificar se o usuário foi realmente deletado
    console.log('\n📋 Passo 6: Verificando se usuário foi deletado...');
    try {
      const userResponse = await axios.get(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Usuário ainda existe após exclusão:');
      console.log('   - Status:', userResponse.status);
      console.log('   - Dados:', userResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Usuário foi deletado com sucesso (não encontrado)');
      } else {
        console.log('❌ Erro ao verificar exclusão:', error.response?.status, error.response?.data);
      }
    }
    
    // Passo 7: Listar usuários novamente para confirmar
    console.log('\n📋 Passo 7: Listando usuários após exclusão...');
    try {
      const usersAfterResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const usersAfter = usersAfterResponse.data.users;
      console.log(`✅ ${usersAfter.length} usuários após exclusão:`);
      usersAfter.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
      
      const deletedUser = usersAfter.find(u => u.id === userToDelete.id);
      if (deletedUser) {
        console.log('❌ Usuário ainda aparece na lista após exclusão');
      } else {
        console.log('✅ Usuário não aparece mais na lista (exclusão bem-sucedida)');
      }
      
    } catch (error) {
      console.log('❌ Erro ao listar usuários após exclusão:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('\n❌ Erro geral no teste:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDeleteDebug();
