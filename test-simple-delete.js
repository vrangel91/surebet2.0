const axios = require('axios');

async function testSimpleDelete() {
  try {
    console.log('🧪 Teste simples de exclusão...\n');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@surestake.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    // Listar usuários
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = usersResponse.data.users;
    const userToDelete = users.find(u => u.email !== 'admin@surestake.com');
    
    if (!userToDelete) {
      console.log('❌ Nenhum usuário para deletar');
      return;
    }
    
    console.log(`📋 Deletando usuário: ${userToDelete.username} (ID: ${userToDelete.id})`);
    
    // Tentar deletar
    const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Exclusão OK:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
}

testSimpleDelete();
