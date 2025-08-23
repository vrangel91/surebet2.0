const axios = require('axios');

async function testDebugResponse() {
  try {
    console.log('🔍 Debugando resposta da API...\n');
    
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
    const userToDelete = users.find(u => !u.is_admin);
    
    if (!userToDelete) {
      console.log('❌ Nenhum usuário para deletar');
      return;
    }
    
    console.log(`📋 Deletando usuário: ${userToDelete.username} (ID: ${userToDelete.id})`);
    
    // Deletar e verificar resposta completa
    const deleteResponse = await axios.delete(`http://localhost:3001/api/users/${userToDelete.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📤 Resposta completa:');
    console.log('   - Status:', deleteResponse.status);
    console.log('   - Headers:', deleteResponse.headers);
    console.log('   - Data:', JSON.stringify(deleteResponse.data, null, 2));
    console.log('   - Data type:', typeof deleteResponse.data);
    console.log('   - Has details:', 'details' in deleteResponse.data);
    console.log('   - Details value:', deleteResponse.data.details);
    console.log('   - Details type:', typeof deleteResponse.data.details);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data);
  }
}

testDebugResponse();
