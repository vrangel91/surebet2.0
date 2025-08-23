const axios = require('axios');

async function testDeleteDirect() {
  try {
    console.log('🎯 Teste direto de exclusão...\n');
    
    // Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    // Listar usuários
    console.log('\n2. Listando usuários...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = usersResponse.data.users;
    console.log(`✅ ${users.length} usuários encontrados`);
    
    // Encontrar usuário para deletar (não admin)
    const userToDelete = users.find(u => !u.is_admin);
    
    if (!userToDelete) {
      console.log('❌ Nenhum usuário não-admin encontrado');
      return;
    }
    
    console.log(`\n3. Usuário selecionado: ${userToDelete.username} (ID: ${userToDelete.id})`);
    
    // Tentar deletar
    console.log('\n4. Tentando deletar...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Exclusão bem-sucedida:');
      console.log('   - Status:', deleteResponse.status);
      console.log('   - Resposta:', deleteResponse.data);
      
    } catch (error) {
      console.log('❌ Erro na exclusão:');
      console.log('   - Status:', error.response?.status);
      console.log('   - Dados:', error.response?.data);
      console.log('   - Mensagem:', error.message);
    }
    
    // Verificar se foi deletado
    console.log('\n5. Verificando se foi deletado...');
    try {
      const checkResponse = await axios.get(`http://localhost:3001/api/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('❌ Usuário ainda existe:');
      console.log('   - Status:', checkResponse.status);
      console.log('   - Dados:', checkResponse.data);
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Usuário foi deletado (não encontrado)');
      } else {
        console.log('❌ Erro ao verificar:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDeleteDirect();
