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
const vipRoutes = require('./routes/vip');
const bookmakerAccountsRoutes = require('./routes/bookmakerAccounts');
const surebetStatsRoutes = require('./routes/surebetStats');
const ordersRoutes = require('./routes/orders');

// Importar cron jobs VIP
const vipCronJobs = require('./utils/vipCronJobs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Servir arquivos estáticos com tratamento de erros
app.use(express.static(path.join(__dirname, 'client/dist'), {
  setHeaders: (res, path, stat) => {
    // Definir headers corretos para diferentes tipos de arquivo
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Configurar headers para UTF-8 (apenas para rotas da API)
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Middleware para interceptar requisições problemáticas
app.use((req, res, next) => {
  // Log de todas as requisições para debug
  console.log(`📡 ${req.method} ${req.path} - ${req.get('User-Agent') || 'Sem User-Agent'}`);
  
  // Verificar se é um refresh forçado (Ctrl+F5) tentando acessar rotas da API
  const isForceRefresh = req.get('Cache-Control') === 'no-cache' || req.get('Pragma') === 'no-cache';
  
  // Se for uma requisição para uma rota da API que não existe, tratar como 404
  if (req.path.startsWith('/api/') && !req.path.match(/^\/(api\/auth|api\/users|api\/vip|api\/bookmaker-accounts|api\/surebet-stats|api\/orders|api\/surebets|api\/status|api\/toggle-search|api\/toggle-sound)/)) {
    console.log(`🚫 Rota da API não encontrada: ${req.method} ${req.path}${isForceRefresh ? ' (Refresh forçado detectado)' : ''}`);
    return res.status(404).json({
      error: 'Endpoint não encontrado',
      message: `A rota ${req.method} ${req.path} não existe`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      isForceRefresh: isForceRefresh
    });
  }
  
  next();
});

// Configurar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/bookmaker-accounts', bookmakerAccountsRoutes);
app.use('/api/surebet-stats', surebetStatsRoutes);
app.use('/api/orders', ordersRoutes);

// WebSocket server
const wss = new WebSocket.Server({ port: 3002 });

// Estado global
let surebets = [];
let isSearching = true;
let soundEnabled = true;
let lastSurebetCount = 0;

console.log('🚀 Estado inicial do servidor:');
console.log(`   - isSearching: ${isSearching}`);
console.log(`   - soundEnabled: ${soundEnabled}`);
console.log(`   - surebets: ${Object.keys(surebets).length} registros`);

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
    console.log('🔄 Cron job executando: buscando surebets...');
    fetchSurebets();
  } else {
    console.log('⏸️ Cron job pausado: busca desativada');
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
          
          // Notificar todos os clientes sobre a mudança de estado
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'search_state_changed',
                isSearching: isSearching
              }));
            }
          });
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

// Este middleware foi movido para cima para interceptar requisições antes das rotas específicas

// Middleware para tratar erros de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Erro de parsing JSON:', err.message);
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'O corpo da requisição contém JSON malformado',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});

// Rota específica para favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/favicon.ico'));
});

// Rota para servir o SPA (deve vir DEPOIS de todas as rotas da API)
app.get('*', (req, res) => {
  // Para todas as outras rotas, servir o SPA
  console.log(`🌐 Servindo SPA para: ${req.path}`);
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

    // Inicializar cron jobs VIP
    try {
      await vipCronJobs.initialize();
      console.log('✅ Cron jobs VIP inicializados automaticamente');
    } catch (error) {
      console.error('⚠️ Erro ao inicializar cron jobs VIP:', error.message);
    }
    
    // Inicializar busca de surebets
    fetchSurebets();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🔌 WebSocket rodando na porta 3002`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Inicializar aplicação
initializeApp();
