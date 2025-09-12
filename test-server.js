const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota de surebets mock
app.get('/api/surebets', (req, res) => {
  res.json({
    success: true,
    data: {
      surebet_1: {
        id: 'test_1',
        profit: 5.2,
        sport: 'Futebol',
        market: '1X2',
        teams: ['Time A', 'Time B'],
        bookmakers: ['Bet365', 'Betfair'],
        odds: [2.1, 2.0, 3.5]
      }
    },
    source: 'mock',
    timestamp: Date.now()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});
