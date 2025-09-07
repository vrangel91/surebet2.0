const express = require('express');
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

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
const referralsRoutes = require('./routes/referrals');
const ticketsRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// Importar cron jobs VIP
const vipCronJobs = require('./utils/vipCronJobs');

// Importar sistemas de otimização
const { backendCache } = require('./utils/cache');
const { backendRateLimiter, surebetsRateLimiter } = require('./utils/rateLimiter');
const { systemMonitor } = require('./utils/monitoring');
const { logger } = require('./utils/logger');
const { healthChecker } = require('./utils/healthCheck');
const { errorAnalyzer } = require('./utils/errorAnalyzer');
const { databaseOptimizer } = require('./utils/databaseOptimizer');
const { compressionManager } = require('./utils/compression');
// Cache completamente removido
// const { surebetsCache } = require('./utils/surebetsCache');
// Sistema de cache desabilitado temporariamente
// const { surebetsScheduler } = require('./utils/surebetsScheduler');
// const { surebetsWebSocket } = require('./utils/surebetsWebSocket');

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = 3443; // Porta para HTTPS

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de monitoramento
app.use(systemMonitor.requestMiddleware());

// Middleware de logging detalhado
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.httpRequest(req, res, responseTime);
    
    // Log de performance para endpoints críticos
    if (req.path.includes('/api/surebets') || req.path.includes('/api/bookmaker-accounts')) {
      logger.performance(`API ${req.method} ${req.path}`, responseTime, {
        statusCode: res.statusCode,
        userId: req.user ? req.user.id : null
      });
    }
  });
  
  next();
});

// Middleware de rate limiting
app.use(backendRateLimiter.middleware());

// Middleware de compressão
app.use(compressionManager.middleware());
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
  if (req.path.startsWith('/api/') && !req.path.match(/^\/(api\/auth|api\/users|api\/vip|api\/bookmaker-accounts|api\/surebet-stats|api\/orders|api\/referrals|api\/tickets|api\/admin|api\/notifications|api\/surebets|api\/status|api\/toggle-search|api\/toggle-sound)/)) {
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

// Rate limiting específico para surebets (desabilitado)
// app.use('/api/surebets', surebetsRateLimiter.middleware());

// Rota de surebets com cache otimizado (COMENTADA - usando versão otimizada abaixo)
// app.get('/api/surebets', async (req, res) => {
//   try {
//     const filters = req.query;
//     const cacheKey = surebetsCache.generateKey(filters);
//     
//     // Verificar cache primeiro
//     const cachedData = surebetsCache.get(cacheKey);
//     if (cachedData) {
//       logger.info('Surebets served from cache', { 
//         filters, 
//         count: cachedData.surebets?.length || 0 
//       });
//       return res.json({
//         success: true,
//         data: cachedData,
//         cached: true,
//         timestamp: Date.now()
//       });
//     }
//     
//     logger.debug('Buscando surebets', { filters, userId: req.user?.id });
//     
//     // Verificar cache do backend
//     const backendCachedData = backendCache.getSurebets(filters);
//     if (backendCachedData) {
//       logger.cache('HIT', 'surebets', true, { filters });
//       
//       // Salvar no cache otimizado
//       surebetsCache.set(cacheKey, backendCachedData);
//       
//       return res.json(backendCachedData);
//     }
//     
//     logger.cache('MISS', 'surebets', false, { filters });
//     
//     // Buscar dados (simulação - substitua pela lógica real)
//     const surebets = await getSurebetsFromAPI(filters);
//     
//     // Armazenar no cache
//     backendCache.setSurebets(filters, surebets);
//     logger.cache('SET', 'surebets', null, { filters, dataSize: JSON.stringify(surebets).length });
//     
//     res.json(surebets);
//   } catch (error) {
//     logger.apiError('/api/surebets', error, req);
//     res.status(500).json({ 
//       error: 'Erro interno do servidor',
//       message: 'Não foi possível buscar surebets no momento'
//     });
//   }
// });

// Função para buscar surebets (substitua pela lógica real)
async function getSurebetsFromAPI(filters) {
  // Simulação - substitua pela lógica real de busca de surebets
  return {
    surebets: [],
    total: 0,
    filters: filters,
    timestamp: new Date().toISOString()
  };
}
app.use('/api/orders', ordersRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Rota de monitoramento do sistema
app.get('/api/monitoring/stats', (req, res) => {
  try {
    const stats = systemMonitor.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de alertas
app.get('/api/monitoring/alerts', (req, res) => {
  try {
    const alerts = systemMonitor.getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('❌ Erro ao obter alertas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthChecker.runAllChecks();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({ 
      status: 'unhealthy', 
      message: 'Health check falhou',
      error: error.message 
    });
  }
});

// Rota de health check rápido
app.get('/api/health/quick', async (req, res) => {
  try {
    const health = await healthChecker.quickCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Quick health check failed', { error: error.message });
    res.status(503).json({ 
      status: 'unhealthy', 
      message: 'Quick health check falhou',
      error: error.message 
    });
  }
});

// Rota de análise de erros
app.get('/api/errors/analysis', (req, res) => {
  try {
    const report = errorAnalyzer.getErrorReport();
    res.json(report);
  } catch (error) {
    logger.error('Error analysis failed', { error: error.message });
    res.status(500).json({ 
      error: 'Erro ao gerar análise de erros',
      message: error.message 
    });
  }
});

// WebSocket server será configurado após HTTPS
let wss = null;

// Estado global
let surebets = {};
let isSearching = true;
let soundEnabled = true;
let lastSurebetCount = 0;

console.log('🚀 Estado inicial do servidor:');
console.log(`   - isSearching: ${isSearching}`);
console.log(`   - soundEnabled: ${soundEnabled}`);
console.log(`   - surebets: ${surebets && typeof surebets === 'object' ? Object.keys(surebets).length : 0} registros`);

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
      // Garantir que surebets seja sempre um objeto válido
      if (!surebets || typeof surebets !== 'object') {
        surebets = {};
      }
    }
  } catch (error) {
    console.error('Erro ao buscar surebets:', error.message);
    // Manter os dados anteriores em caso de erro
    console.log('Mantendo dados anteriores devido ao erro na API externa');
    // Garantir que surebets seja sempre um objeto válido
    if (!surebets || typeof surebets !== 'object') {
      surebets = {};
    }
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


// Rota de surebets otimizada (DESABILITADA - usando rota original)
/*
app.get('/api/surebets', async (req, res) => {
  // ... código comentado ...
});
*/

app.get('/api/status', (req, res) => {
  res.json({
    isSearching,
    soundEnabled,
    surebetCount: surebets && typeof surebets === 'object' ? Object.keys(surebets).length : 0
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

// Middleware global de tratamento de erros com análise
app.use((err, req, res, next) => {
  // Analisar erro
  const analysis = errorAnalyzer.analyzeError(err, {
    endpoint: req.path,
    method: req.method,
    userId: req.user ? req.user.id : null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  // Log do erro
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    analysis
  });
  
  // Resposta baseada no tipo de erro
  if (err.code === 'ECONNREFUSED') {
    res.status(503).json({
      error: 'Serviço indisponível',
      message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      code: 'SERVICE_UNAVAILABLE'
    });
  } else if (err.code === 'ETIMEDOUT') {
    res.status(504).json({
      error: 'Timeout',
      message: 'A requisição demorou muito para ser processada. Tente novamente.',
      code: 'TIMEOUT'
    });
  } else {
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
      code: 'INTERNAL_ERROR'
    });
  }
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
    
  // Sistema otimizado de surebets desabilitado
  // surebetsScheduler.start();
  // console.log('🚀 Sistema otimizado de surebets iniciado');
    
    // Inicializar busca de surebets (legacy - manter para compatibilidade)
    fetchSurebets();
    
    // Inicializar sistema de monitoramento
    systemMonitor.start();
    console.log('📊 Sistema de monitoramento iniciado');
    
    // Inicializar otimizador de banco de dados
    await databaseOptimizer.initialize();
    console.log('🗄️ Otimizador de banco de dados iniciado');
    
    // Configurar HTTPS
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
    };
    
    // Criar servidor HTTPS
    const httpsServer = https.createServer(httpsOptions, app);
    
    // Iniciar servidor HTTPS
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`🚀 Servidor HTTPS rodando na porta ${HTTPS_PORT}`);
      console.log(`📊 API disponível em https://localhost:${HTTPS_PORT}/api`);
      console.log(`🔐 Certificados SSL carregados com sucesso`);
      console.log(`⚠️  Certificado autoassinado - aceite o aviso de segurança no navegador`);
      
      // Configurar WebSocket após HTTPS estar rodando
      wss = new WebSocket.Server({ 
        port: 3002,
        verifyClient: (info) => {
          return true;
        }
      });
      
      console.log(`🔌 WebSocket rodando na porta 3002`);
      
      // WebSocket connection handler otimizado
      wss.on('connection', (ws, req) => {
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔌 Cliente WebSocket conectado: ${clientId}`);
        
        // Sistema WebSocket otimizado desabilitado
        // surebetsWebSocket.addClient(clientId, ws);
        
        // Enviar estado atual para o novo cliente
        try {
          // Garantir que surebets seja sempre um objeto válido
          const safeSurebets = surebets && typeof surebets === 'object' ? surebets : {};
          
          ws.send(JSON.stringify({
            type: 'initial_state',
            surebets: safeSurebets,
            isSearching: isSearching,
            soundEnabled: soundEnabled
          }));
        } catch (error) {
          console.error('Erro ao enviar estado inicial:', error);
        }
        
        ws.on('message', (message) => {
          try {
            // Sistema WebSocket otimizado desabilitado
            // surebetsWebSocket.handleClientMessage(clientId, message);
            
            // Manter compatibilidade com sistema legado
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
          console.error(`❌ Erro WebSocket para cliente ${clientId}:`, error);
          // surebetsWebSocket.removeClient(clientId);
        });
        
        ws.on('close', () => {
          console.log(`🔌 Cliente WebSocket desconectado: ${clientId}`);
          // surebetsWebSocket.removeClient(clientId);
        });
      });
    });
    
    // Manter servidor HTTP para compatibilidade na porta 3000
    app.listen(3000, () => {
      console.log(`🌐 Servidor HTTP de compatibilidade na porta 3000`);
    });
    
    // Servidor HTTP adicional na porta 3001 para acesso direto
    const httpApp = express();
    httpApp.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    httpApp.use(express.json({ limit: '10mb' }));
    httpApp.use(express.static(path.join(__dirname, 'client', 'dist')));
    
    // Aplicar todas as rotas da API no servidor HTTP também
    httpApp.use('/api/auth', authRoutes);
    httpApp.use('/api/users', userRoutes);
    httpApp.use('/api/vip', vipRoutes);
    httpApp.use('/api/bookmaker-accounts', bookmakerAccountsRoutes);
    httpApp.use('/api/surebet-stats', surebetStatsRoutes);
    httpApp.use('/api/orders', ordersRoutes);
    httpApp.use('/api/referrals', referralsRoutes);
    httpApp.use('/api/tickets', ticketsRoutes);
    httpApp.use('/api/admin', adminRoutes);
    httpApp.use('/api/notifications', notificationRoutes);
    
    // Rotas da API existentes
    httpApp.get('/api/surebets', (req, res) => {
      res.json(surebets);
    });
    
    httpApp.get('/api/status', (req, res) => {
      res.json({
        isSearching,
        soundEnabled,
        surebetCount: surebets && typeof surebets === 'object' ? Object.keys(surebets).length : 0
      });
    });
    
    httpApp.post('/api/toggle-search', (req, res) => {
      isSearching = req.body.isSearching;
      res.json({ isSearching });
    });
    
    httpApp.post('/api/toggle-sound', (req, res) => {
      soundEnabled = req.body.soundEnabled;
      res.json({ soundEnabled });
    });
    
    // Rota de estatísticas do cache
    // Rotas de cache desabilitadas
    /*
    httpApp.get('/api/cache/stats', (req, res) => {
      try {
        // const cacheStats = surebetsCache.getStats();
        // const rateLimitStats = surebetsRateLimiter.getStats();
        
        // ... código comentado ...
      } catch (error) {
        // ... código comentado ...
      }
    });

    httpApp.post('/api/cache/clear', (req, res) => {
      try {
        // surebetsCache.clear();
        // ... código comentado ...
      } catch (error) {
        // ... código comentado ...
      }
    });
    */

    // Rota para controlar o scheduler
    // Rotas de monitoramento desabilitadas
    /*
    httpApp.get('/api/scheduler/stats', (req, res) => {
      try {
        // const schedulerStats = surebetsScheduler.getStats();
        // const webSocketStats = surebetsWebSocket.getStats();
        
        // ... código comentado ...
      } catch (error) {
        // ... código comentado ...
      }
    });
    */

    // Rotas do scheduler desabilitadas
    /*
    httpApp.post('/api/scheduler/force-update', async (req, res) => {
      try {
        // await surebetsScheduler.forceUpdate();
        
        // ... código comentado ...
      } catch (error) {
        // ... código comentado ...
      }
    });
    */

    // Servir SPA para todas as outras rotas
    httpApp.get('*', (req, res) => {
      console.log(`🌐 Servindo SPA para: ${req.path}`);
      res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
    });
    
    httpApp.listen(3001, () => {
      console.log(`🌐 Servidor HTTP rodando na porta 3001`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Inicializar aplicação
initializeApp();
