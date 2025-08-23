const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Rota de teste simples
app.post('/test-login', (req, res) => {
  try {
    console.log('📤 Requisição recebida:', req.body);
    res.json({ success: true, message: 'Teste funcionando' });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Iniciar servidor de teste
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Servidor de teste rodando na porta ${PORT}`);
  console.log('📤 Teste com: curl -X POST http://localhost:3002/test-login -H "Content-Type: application/json" -d "{\\"email\\":\\"test@test.com\\"}"');
});

// Testar a rota automaticamente após 2 segundos
setTimeout(async () => {
  try {
    const axios = require('axios');
    const response = await axios.post('http://localhost:3002/test-login', {
      email: 'test@test.com'
    });
    console.log('✅ Teste automático passou:', response.data);
    process.exit(0);
  } catch (error) {
    console.error('❌ Teste automático falhou:', error.message);
    process.exit(1);
  }
}, 2000);
