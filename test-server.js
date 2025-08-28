const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota para testar VIP
app.get('/api/vip/test', (req, res) => {
  res.json({ message: 'Rota VIP funcionando!', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Teste disponível em http://localhost:${PORT}/api/test`);
  console.log(`👑 VIP teste disponível em http://localhost:${PORT}/api/vip/test`);
});
