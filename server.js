const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');

// Importar configurações do banco e modelos
const { sequelize, testConnection } = require('./config/database');
const { syncModels } = require('./models');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookmakerAccountsRoutes = require('./routes/bookmakerAccounts');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Configurar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmaker-accounts', bookmakerAccountsRoutes);

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Estado global
let surebets = [];
let isSearching = true;
let soundEnabled = true;
let lastSurebetCount = 0;

// Função para buscar surebets da API
async function fetchSurebets() {
  try {
    const response = await axios.get('https://zerolossbet.com/api/fetch_surebets/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://zerolossbet.com/dashboard',
        'Origin': 'https://zerolossbet.com'
      }
    });
    
    // Verificar se a resposta contém dados válidos
    if (response.data && typeof response.data === 'object') {
      const newSurebets = response.data;
      
      // Verificar se há novos surebets
      const currentSurebetCount = Object.keys(newSurebets).length;
      
      if (currentSurebetCount > lastSurebetCount && soundEnabled) {
        // Enviar notificação para todos os clientes conectados
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'new_surebet',
              count: currentSurebetCount - lastSurebetCount
            }));
          }
        });
      }
      
      surebets = newSurebets;
      lastSurebetCount = currentSurebetCount;
      
      console.log(`Surebets atualizados: ${currentSurebetCount} encontrados`);
    } else {
      console.log('API retornou dados vazios ou inválidos, mantendo dados anteriores');
    }
  } catch (error) {
    console.error('Erro ao buscar surebets:', error.message);
    // Manter os dados anteriores em caso de erro
    console.log('Mantendo dados anteriores devido ao erro na API externa');
  }
}

// Agendar busca de surebets a cada 30 segundos
cron.schedule('*/30 * * * * *', () => {
  if (isSearching) {
    fetchSurebets();
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');
  
  // Enviar estado atual para o novo cliente
  try {
    ws.send(JSON.stringify({
      type: 'initial_state',
      surebets: surebets,
      isSearching: isSearching,
      soundEnabled: soundEnabled
    }));
  } catch (error) {
    console.error('Erro ao enviar estado inicial:', error);
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'toggle_search':
          isSearching = data.isSearching;
          console.log(`Busca ${isSearching ? 'ativada' : 'pausada'}`);
          break;
          
        case 'toggle_sound':
          soundEnabled = data.soundEnabled;
          console.log(`Som ${soundEnabled ? 'ativado' : 'desativado'}`);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
  
  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
  
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Rotas da API existentes
app.get('/api/surebets', (req, res) => {
  res.json(surebets);
});

app.get('/api/status', (req, res) => {
  res.json({
    isSearching,
    soundEnabled,
    surebetCount: Object.keys(surebets).length
  });
});

app.post('/api/toggle-search', (req, res) => {
  isSearching = req.body.isSearching;
  res.json({ isSearching });
});

app.post('/api/toggle-sound', (req, res) => {
  soundEnabled = req.body.soundEnabled;
  res.json({ soundEnabled });
});

// Rota para servir o SPA (sempre)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Inicializar aplicação
async function initializeApp() {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    // Sincronizar modelos
    await syncModels();
    
    // Criar administrador padrão

    
    // Inicializar busca de surebets
    fetchSurebets();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🔌 WebSocket rodando na porta 8080`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Inicializar aplicação
initializeApp();
