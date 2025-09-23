const express = require("express");
const https = require("https");
const cors = require("cors");
const axios = require("axios");
const WebSocket = require("ws");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");

// Console.logs ativados para debug
// const silentLog = () => {};
// console.log = silentLog;
// console.error = silentLog;
// console.warn = silentLog;

// Importar configurações do banco e modelos
const { sequelize, testConnection } = require("./server/config/database");
const { syncModels } = require("./server/models");

// Importar WebSocket
const { surebetsWebSocket } = require("./server/utils/surebetsWebSocket");

// Importar rotas
const authRoutes = require("./server/routes/auth");
const userRoutes = require("./server/routes/users");
const vipRoutes = require("./server/routes/vip");
const bookmakerAccountsRoutes = require("./server/routes/bookmakerAccounts");
const surebetStatsRoutes = require("./server/routes/surebetStats");
const ordersRoutes = require("./server/routes/orders");
const referralsRoutes = require("./server/routes/referrals");
const ticketsRoutes = require("./server/routes/tickets");
const adminRoutes = require("./server/routes/admin");
const notificationRoutes = require("./server/routes/notifications");
const paymentRoutes = require("./server/routes/payments");
const manualPaymentRoutes = require("./server/routes/manualPayments");
const paymentStatusRoutes = require("./server/routes/paymentStatus");
const planVerificationRoutes = require("./server/routes/planVerification");
const surebetReportsRoutes = require("./server/routes/surebetReports");
let plansRoutes;
try {
  plansRoutes = require("./server/routes/plans");
  console.log("✅ Módulo plans carregado com sucesso");
} catch (error) {
  console.error("❌ Erro ao carregar módulo plans:", error);
  process.exit(1);
}

// Importar cron jobs VIP
const vipCronJobs = require("./server/utils/vipCronJobs");

// Importar verificador de pagamentos
const paymentChecker = require("./server/utils/paymentChecker");

// Importar sistemas de otimização
const { backendCache } = require("./server/utils/cache");
const {
  backendRateLimiter,
  surebetsRateLimiter,
} = require("./server/utils/rateLimiter");
const { systemMonitor } = require("./server/utils/monitoring");
const { logger } = require("./server/utils/logger");
const { healthChecker } = require("./server/utils/healthCheck");
const { errorAnalyzer } = require("./server/utils/errorAnalyzer");
const { databaseOptimizer } = require("./server/utils/databaseOptimizer");
const { compressionManager } = require("./server/utils/compression");
// Sistema de cache para surebets
const { surebetsCache } = require("./server/utils/surebetsCache");
const { surebetsService } = require("./server/utils/surebetsService");
// Middleware de autenticação
const { authenticateToken } = require("./server/utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = 3443; // Porta para HTTPS
const WS_PORT = 3001; // Porta específica para WebSocket

// Log do diretório atual para debug
console.log("🔍 [SERVER] __dirname:", __dirname);
console.log("🔍 [SERVER] process.cwd():", process.cwd());
console.log(
  "🔍 [SERVER] Verificando se index.html existe:",
  require("fs").existsSync(path.join(__dirname, "client", "dist", "index.html"))
);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de monitoramento
app.use(systemMonitor.requestMiddleware());

// Middleware de logging detalhado
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    logger.httpRequest(req, res, responseTime);

    // Log de performance para endpoints críticos
    if (
      req.path.includes("/api/surebets") ||
      req.path.includes("/api/bookmaker-accounts")
    ) {
      logger.performance(`API ${req.method} ${req.path}`, responseTime, {
        statusCode: res.statusCode,
        userId: req.user ? req.user.id : null,
      });
    }
  });

  next();
});

// Middleware de rate limiting
app.use(backendRateLimiter.middleware());

// Middleware de compressão
app.use(compressionManager.middleware());

// Rota específica para webhook do MercadoPago (DEVE vir antes dos arquivos estáticos)
app.post("/webhook", express.json(), async (req, res) => {
  try {
    // Debug: verificar o que está sendo recebido
    console.log("🔍 Webhook recebido (HTTPS):", {
      contentType: req.headers["content-type"],
      contentLength: req.headers["content-length"],
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      bodyPreview: req.body
        ? JSON.stringify(req.body).substring(0, 200)
        : "null",
    });

    // Verificar se o body existe
    if (!req.body) {
      console.log("⚠️ Webhook recebido sem body");
      return res.status(400).json({
        success: false,
        error: "Body vazio",
      });
    }

    // O body já é um objeto JSON parseado pelo express.json()
    const webhookBody = req.body;

    console.log("✅ Webhook MercadoPago processado (HTTPS):", {
      headers: req.headers,
      body: webhookBody,
    });

    // Verificar se é um evento de teste do MercadoPago
    const isTestEvent =
      webhookBody.id === "123456" ||
      webhookBody.data?.id === "123456" ||
      webhookBody.live_mode === false;

    console.log("É evento de teste?", isTestEvent);

    // Validar assinatura do webhook (opcional - pode ser desabilitado para testes)
    const PaymentService = require("./server/services/paymentService");
    const paymentService = new PaymentService();
    const signature = req.headers["x-signature"];

    // Pular validação de assinatura para eventos de teste
    if (!isTestEvent && signature && process.env.NODE_ENV === "production") {
      const isValid = paymentService.verifyWebhookSignature(
        webhookBody,
        signature,
        req.headers
      );

      if (!isValid) {
        console.error("Assinatura do webhook inválida:", signature);
        return res.status(401).json({
          success: false,
          error: "Assinatura inválida",
        });
      }
    } else if (isTestEvent) {
      console.log(
        "Evento de teste detectado - pulando validação de assinatura"
      );
    }

    // Processar webhook usando o serviço de pagamentos
    console.log("🔍 [WEBHOOK DEBUG] Iniciando processamento do webhook...");
    const result = await paymentService.processPaymentWebhook(
      webhookBody,
      req.headers,
      JSON.stringify(webhookBody)
    );

    if (result.success) {
      console.log(
        "✅ [WEBHOOK SUCCESS] Webhook processado com sucesso:",
        result
      );

      // Notificar via WebSocket se disponível
      if (global.notifyPaymentConfirmed) {
        console.log(
          "🔌 [WEBSOCKET] Enviando notificação de pagamento confirmado"
        );
        global.notifyPaymentConfirmed(result.paymentData);
      }

      res.json({
        success: true,
        message: "Webhook processado com sucesso",
        data: result,
      });
    } else {
      console.error("❌ [WEBHOOK ERROR] Erro ao processar webhook:", result);
      res.status(400).json({
        success: false,
        error: result.error || "Erro ao processar webhook",
      });
    }
  } catch (error) {
    console.error("Erro no webhook MercadoPago:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// Rota para verificar pagamento específico (para testes)
app.post("/api/payments/check/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔍 Verificando pagamento ${orderId} manualmente...`);

    await paymentChecker.checkSpecificPayment(orderId);

    res.json({
      success: true,
      message: `Pagamento ${orderId} verificado`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao verificar pagamento",
    });
  }
});

// Servir arquivos estáticos será movido para depois das rotas da API

// Configurar headers para UTF-8 (apenas para rotas da API)
app.use("/api", (req, res, next) => {
  console.log(`🔍 [API MIDDLEWARE] Interceptando: ${req.method} ${req.path}`);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Middleware para interceptar requisições problemáticas (SIMPLIFICADO)
app.use((req, res, next) => {
  // Log de todas as requisições para debug
  console.log(
    `📡 ${req.method} ${req.path} - ${
      req.get("User-Agent") || "Sem User-Agent"
    }`
  );

  // Se for uma requisição para uma rota da API que não existe, tratar como 404
  if (
    req.path.startsWith("/api/") &&
    !req.path.match(
      /^\/(api\/auth|api\/users|api\/vip|api\/bookmaker-accounts|api\/surebet-stats|api\/orders|api\/referrals|api\/tickets|api\/admin|api\/notifications|api\/plans|api\/surebets|api\/external-surebets|api\/status|api\/toggle-search|api\/toggle-sound)/
    )
  ) {
    console.log(`🚫 Rota da API não encontrada: ${req.method} ${req.path}`);
    return res.status(404).json({
      error: "Endpoint não encontrado",
      message: `A rota ${req.method} ${req.path} não existe`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }

  next();
});

// Configurar rotas da API (movidas para httpApp)
// app.use('/api/plans', plansRoutes);
console.log("✅ Rota /api/plans registrada");
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/vip', vipRoutes);
// app.use('/api/bookmaker-accounts', bookmakerAccountsRoutes);
// app.use('/api/surebet-stats', surebetStatsRoutes);

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
    timestamp: new Date().toISOString(),
  };
}
// app.use('/api/orders', ordersRoutes);
// app.use('/api/referrals', referralsRoutes);
// app.use('/api/tickets', ticketsRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/manual-payments', manualPaymentRoutes);
// app.use('/api/payment-status', paymentStatusRoutes);

// Rota de teste simples (movida para httpApp)
// app.get('/api/test', (req, res) => {
//   console.log('🔍 [TEST API] Rota /api/test executada');
//   res.json({ message: 'Teste funcionando!' });
// });

// Rota de monitoramento do sistema (movida para httpApp)
// app.get('/api/monitoring/stats', (req, res) => {
//   try {
//     const stats = systemMonitor.getSystemStats();
//     res.json(stats);
//   } catch (error) {
//     console.error('❌ Erro ao obter estatísticas:', error);
//     res.status(500).json({ error: 'Erro interno do servidor' });
//   }
// });

// Rota de alertas (movida para httpApp)
// app.get('/api/monitoring/alerts', (req, res) => {
//   try {
//     const alerts = systemMonitor.getActiveAlerts();
//     res.json(alerts);
//   } catch (error) {
//     console.error('❌ Erro ao obter alertas:', error);
//     res.status(500).json({ error: 'Erro interno do servidor' });
//   }
// });

// Rota de health check (movida para httpApp)
// app.get('/api/health', async (req, res) => {
//   try {
//     const health = await healthChecker.runAllChecks();
//     const statusCode = health.status === 'healthy' ? 200 :
//                       health.status === 'warning' ? 200 : 503;
//     res.status(statusCode).json(health);
//   } catch (error) {
//     logger.error('Health check failed', { error: error.message });
//     res.status(503).json({
//       status: 'unhealthy',
//       message: 'Health check falhou',
//       error: error.message
//     });
//   }
// });

// Rota de health check rápido (movida para httpApp)
// app.get('/api/health/quick', async (req, res) => {
//   try {
//     const health = await healthChecker.quickCheck();
//     const statusCode = health.status === 'healthy' ? 200 : 503;
//     res.status(statusCode).json(health);
//   } catch (error) {
//     logger.error('Quick health check failed', { error: error.message });
//     res.status(503).json({
//       status: 'unhealthy',
//       message: 'Quick health check falhou',
//       error: error.message
//     });
//   }
// });

// Rota de análise de erros (movida para httpApp)
// app.get('/api/errors/analysis', (req, res) => {
//   try {
//     const report = errorAnalyzer.getErrorReport();
//     res.json(report);
//   } catch (error) {
//     logger.error('Error analysis failed', { error: error.message });
//     res.status(500).json({
//       error: 'Erro ao gerar análise de erros',
//       message: error.message
//     });
//   }
// });

// WebSocket server será configurado após HTTPS
let wss = null;

// Estado global
let surebets = {};
let isSearching = true;
let soundEnabled = true;
let lastSurebetCount = 0;

// Expor variável global para o serviço de cache
global.surebets = surebets;

console.log("🚀 Estado inicial do servidor:");
console.log(`   - isSearching: ${isSearching}`);
console.log(`   - soundEnabled: ${soundEnabled}`);
console.log(
  `   - surebets: ${
    surebets && typeof surebets === "object" ? Object.keys(surebets).length : 0
  } registros`
);

// Função antiga removida - usando nova estrutura com proxy para sempregreen

// Rota de surebets otimizada (DESABILITADA - usando rota original)
/*
app.get('/api/surebets', async (req, res) => {
  // ... código comentado ...
});
*/

// app.get('/api/status', (req, res) => {
//   res.json({
//     isSearching,
//     soundEnabled,
//     surebetCount: surebets && typeof surebets === 'object' ? Object.keys(surebets).length : 0
//   });
// });

// app.post('/api/toggle-search', (req, res) => {
//   isSearching = req.body.isSearching;
//   res.json({ isSearching });
// });

// app.post('/api/toggle-sound', (req, res) => {
//   soundEnabled = req.body.soundEnabled;
//   res.json({ soundEnabled });
// });

// Este middleware foi movido para cima para interceptar requisições antes das rotas específicas

// Middleware para tratar erros de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("❌ Erro de parsing JSON:", err.message);
    return res.status(400).json({
      error: "JSON inválido",
      message: "O corpo da requisição contém JSON malformado",
      timestamp: new Date().toISOString(),
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
    userAgent: req.get("User-Agent"),
  });

  // Log do erro
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    analysis,
  });

  // Resposta baseada no tipo de erro
  if (err.code === "ECONNREFUSED") {
    res.status(503).json({
      error: "Serviço indisponível",
      message:
        "Serviço temporariamente indisponível. Tente novamente em alguns minutos.",
      code: "SERVICE_UNAVAILABLE",
    });
  } else if (err.code === "ETIMEDOUT") {
    res.status(504).json({
      error: "Timeout",
      message:
        "A requisição demorou muito para ser processada. Tente novamente.",
      code: "TIMEOUT",
    });
  } else {
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
      code: "INTERNAL_ERROR",
    });
  }
});

// Rotas específicas para arquivos estáticos
app.get("/favicon.ico", (req, res) => {
  const faviconPath = "/var/www/surebet/client/dist/favicon.ico";
  console.log(`🔍 [FAVICON] Tentando servir: ${faviconPath}`);
  if (require("fs").existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    console.error(`❌ [FAVICON] Arquivo não encontrado: ${faviconPath}`);
    res.status(404).send("Favicon not found");
  }
});

// Rota para favicon SVG
app.get("/img/icons/favicon.svg", (req, res) => {
  const faviconPath = "/var/www/surebet/client/dist/img/icons/favicon.svg";
  console.log(`🔍 [FAVICON SVG] Tentando servir: ${faviconPath}`);
  if (require("fs").existsSync(faviconPath)) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.sendFile(faviconPath);
  } else {
    console.error(`❌ [FAVICON SVG] Arquivo não encontrado: ${faviconPath}`);
    res.status(404).send("Favicon SVG not found");
  }
});

// Servir arquivos CSS
app.get("/css/*", (req, res) => {
  const filePath = path.join("/var/www/surebet/client/dist", req.path);
  console.log(`🔍 [CSS] Tentando servir: ${filePath}`);
  if (require("fs").existsSync(filePath)) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.sendFile(filePath);
  } else {
    console.error(`❌ [CSS] Arquivo não encontrado: ${filePath}`);
    res.status(404).send("CSS file not found");
  }
});

// Servir arquivos JS
app.get("/js/*", (req, res) => {
  const filePath = path.join("/var/www/surebet/client/dist", req.path);
  console.log(`🔍 [JS] Tentando servir: ${filePath}`);
  if (require("fs").existsSync(filePath)) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.sendFile(filePath);
  } else {
    console.error(`❌ [JS] Arquivo não encontrado: ${filePath}`);
    res.status(404).send("JS file not found");
  }
});

// Servir imagens
app.get("/img/*", (req, res) => {
  const filePath = path.join("/var/www/surebet/client/dist", req.path);
  console.log(`🔍 [IMG] Tentando servir: ${filePath}`);
  if (require("fs").existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error(`❌ [IMG] Arquivo não encontrado: ${filePath}`);
    res.status(404).send("Image not found");
  }
});

// Servir fontes
app.get("/fonts/*", (req, res) => {
  const filePath = path.join("/var/www/surebet/client/dist", req.path);
  console.log(`🔍 [FONTS] Tentando servir: ${filePath}`);
  if (require("fs").existsSync(filePath)) {
    // Definir Content-Type correto baseado na extensão
    if (filePath.endsWith(".woff2")) {
      res.setHeader("Content-Type", "font/woff2");
    } else if (filePath.endsWith(".woff")) {
      res.setHeader("Content-Type", "font/woff");
    } else if (filePath.endsWith(".ttf")) {
      res.setHeader("Content-Type", "font/ttf");
    } else if (filePath.endsWith(".eot")) {
      res.setHeader("Content-Type", "application/vnd.ms-fontobject");
    }
    res.sendFile(filePath);
  } else {
    console.error(`❌ [FONTS] Arquivo não encontrado: ${filePath}`);
    res.status(404).send("Font not found");
  }
});

// Rota específica para Service Worker
app.get("/sw.js", (req, res) => {
  const swPath = "/var/www/surebet/client/dist/sw.js";
  console.log(`🔍 [SW] Tentando servir: ${swPath}`);
  if (require("fs").existsSync(swPath)) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(swPath);
  } else {
    console.error("❌ [SW] Service Worker não encontrado:", swPath);
    res.status(404).send("Service Worker não encontrado");
  }
});

// Rota específica para manifest.json
app.get("/manifest.json", (req, res) => {
  const manifestPath = "/var/www/surebet/client/dist/manifest.json";
  console.log(`🔍 [MANIFEST] Tentando servir: ${manifestPath}`);
  if (require("fs").existsSync(manifestPath)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.sendFile(manifestPath);
  } else {
    console.error("❌ [MANIFEST] Manifest não encontrado:", manifestPath);
    res.status(404).send("Manifest não encontrado");
  }
});

// Rota específica para pwa-config.js
app.get("/pwa-config.js", (req, res) => {
  const pwaConfigPath = "/var/www/surebet/client/dist/pwa-config.js";
  console.log(`🔍 [PWA-CONFIG] Tentando servir: ${pwaConfigPath}`);
  if (require("fs").existsSync(pwaConfigPath)) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.sendFile(pwaConfigPath);
  } else {
    console.error("❌ [PWA-CONFIG] Arquivo não encontrado:", pwaConfigPath);
    res.status(404).send("PWA Config não encontrado");
  }
});

// Servir arquivos estáticos (TEMPORARIAMENTE DESABILITADO para debug)
// app.use(express.static(path.join(__dirname, 'client/dist'), {
//   setHeaders: (res, path, stat) => {
//     // Definir headers corretos para diferentes tipos de arquivo
//     if (path.endsWith('.js')) {
//       res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
//     } else if (path.endsWith('.css')) {
//       res.setHeader('Content-Type', 'text/css; charset=utf-8');
//     } else if (path.endsWith('.html')) {
//       res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     }
//   }
// }));

// Rota para servir o SPA (deve vir DEPOIS de todas as rotas da API e arquivos estáticos)
app.get("*", (req, res) => {
  // Verificar se é uma rota da API que não foi encontrada
  if (req.path.startsWith("/api/")) {
    console.log(
      `🚫 [API] Rota da API não encontrada: ${req.method} ${req.path}`
    );
    return res.status(404).json({
      error: "Endpoint não encontrado",
      message: `A rota ${req.method} ${req.path} não existe`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }

  // Verificar se é uma rota de WebSocket - não servir SPA para WebSocket
  if (req.path.startsWith("/ws")) {
    console.log(`🔌 [WEBSOCKET] Rota WebSocket interceptada: ${req.path}`);
    return res.status(404).json({
      error: "WebSocket endpoint não encontrado",
      message: `A rota WebSocket ${req.path} não existe`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }

  // Para todas as outras rotas, servir o SPA
  console.log(`🌐 Servindo SPA para: ${req.path}`);
  console.log(`🔍 [SPA] __dirname: ${__dirname}`);

  const indexPath = "/var/www/surebet/client/dist/index.html";
  console.log(`🔍 [SPA] Caminho completo: ${indexPath}`);

  // Verificar se o arquivo existe antes de tentar enviá-lo
  if (require("fs").existsSync(indexPath)) {
    console.log(`✅ [SPA] Arquivo encontrado, enviando...`);
    res.sendFile(indexPath);
  } else {
    console.error(
      `❌ [SPA] Arquivo index.html não encontrado em: ${indexPath}`
    );
    console.error(`❌ [SPA] __dirname atual: ${__dirname}`);
    console.error(
      `❌ [SPA] Listando diretório:`,
      require("fs").readdirSync(__dirname)
    );
    res.status(500).send("Arquivo index.html não encontrado");
  }
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
      console.log("✅ Cron jobs VIP inicializados automaticamente");
    } catch (error) {
      console.error("⚠️ Erro ao inicializar cron jobs VIP:", error.message);
    }

    // Sistema otimizado de surebets desabilitado
    // surebetsScheduler.start();
    console.log("🚀 Sistema otimizado de surebets iniciado");

    // Inicializar busca de surebets (legacy - removido, usando nova estrutura)

    // Inicializar sistema de cache
    console.log("🚀 Sistema de cache de surebets inicializado");

    // Pré-aquecer cache após 5 segundos
    setTimeout(async () => {
      try {
        console.log("🔥 Pré-aquecendo cache de surebets...");
        await surebetsService.preloadCache();
        console.log("✅ Cache pré-aquecido com sucesso");
      } catch (error) {
        console.warn("⚠️ Falha ao pré-aquecer cache:", error.message);
      }
    }, 5000);

    // Inicializar sistema de monitoramento
    systemMonitor.start();
    console.log("📊 Sistema de monitoramento iniciado");

    // Inicializar otimizador de banco de dados
    await databaseOptimizer.initialize();
    console.log("🗄️ Otimizador de banco de dados iniciado");

    // Verificar se certificados SSL existem
    const keyPath = path.join(__dirname, "certs", "key.pem");
    const certPath = path.join(__dirname, "certs", "cert.pem");

    console.log("🔍 Verificando certificados SSL:");
    console.log("  - keyPath:", keyPath);
    console.log("  - certPath:", certPath);
    console.log("  - key exists:", fs.existsSync(keyPath));
    console.log("  - cert exists:", fs.existsSync(certPath));

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      // Configurar HTTPS se certificados existem
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      // Criar servidor HTTPS
      const httpsServer = https.createServer(httpsOptions, app);

      // Iniciar servidor HTTPS
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🚀 Servidor HTTPS rodando na porta ${HTTPS_PORT}`);
        console.log(`📊 API disponível em https://localhost:${HTTPS_PORT}/api`);
        console.log(`🔐 Certificados SSL carregados com sucesso`);
        console.log(
          `⚠️  Certificado autoassinado - aceite o aviso de segurança no navegador`
        );

        // Configurar WebSocket WSS após HTTPS estar rodando
        console.log(`🔌 [WEBSOCKET WSS] Criando WebSocket server WSS...`);
        try {
          wss = new WebSocket.Server({
            server: httpsServer, // Usar o servidor HTTPS como base
            path: "/ws", // Definir path específico para WebSocket
            perMessageDeflate: false,
            clientTracking: true,
          verifyClient: (info) => {
            console.log(
              `🔍 [WEBSOCKET WSS] Cliente tentando conectar:`,
              info.origin
            );
            
            // Verificar token de autenticação
            const url = new URL(info.url, `https://${info.headers.host}`);
            const token = url.searchParams.get('token');
            
            if (!token) {
              console.log('❌ [WEBSOCKET WSS] Token não fornecido');
              return false;
            }
            
            try {
              const jwt = require('jsonwebtoken');
              const decoded = jwt.verify(token, process.env.JWT_SECRET || 'surestake-secret-key-2024');
              console.log('✅ [WEBSOCKET WSS] Token válido para usuário:', decoded.email);
              return true;
            } catch (error) {
              console.log('❌ [WEBSOCKET WSS] Token inválido:', error.message);
              return false;
            }
          },
          });

          console.log(
            `🔌 [WEBSOCKET WSS] WebSocket WSS rodando no servidor HTTPS`
          );
          console.log(
            `🔍 [WEBSOCKET WSS] Verificando se wss foi criado:`,
            !!wss
          );
        } catch (error) {
          console.error(
            `❌ [WEBSOCKET ERROR] Erro ao criar WebSocket server WSS:`,
            error
          );
        }
      });
    } else {
      console.log(`⚠️  Certificados SSL não encontrados, usando apenas HTTP`);

      // Configurar WebSocket sem HTTPS (fallback)
      console.log(
        `🔌 [WEBSOCKET HTTP] Criando WebSocket server na porta ${WS_PORT}...`
      );
      try {
        wss = new WebSocket.Server({
          port: WS_PORT,
          path: "/ws",
          perMessageDeflate: false,
          clientTracking: true,
          verifyClient: (info) => {
            console.log(
              `🔍 [WEBSOCKET HTTP] Cliente tentando conectar:`,
              info.origin
            );
            
            // Verificar token de autenticação
            const url = new URL(info.url, `http://${info.headers.host}`);
            const token = url.searchParams.get('token');
            
            if (!token) {
              console.log('❌ [WEBSOCKET HTTP] Token não fornecido');
              return false;
            }
            
            try {
              const jwt = require('jsonwebtoken');
              const decoded = jwt.verify(token, process.env.JWT_SECRET || 'surestake-secret-key-2024');
              console.log('✅ [WEBSOCKET HTTP] Token válido para usuário:', decoded.email);
              return true;
            } catch (error) {
              console.log('❌ [WEBSOCKET HTTP] Token inválido:', error.message);
              return false;
            }
          },
        });

        console.log(`🔌 [WEBSOCKET HTTP] WebSocket rodando na porta ${WS_PORT}`);
        console.log(
          `🔍 [WEBSOCKET HTTP] Verificando se wss foi criado:`,
          !!wss
        );
      } catch (error) {
        console.error(
          `❌ [WEBSOCKET ERROR] Erro ao criar WebSocket server HTTP:`,
          error
        );
      }
    }

    // WebSocket connection handler otimizado (comum para HTTPS e HTTP)
    if (wss) {
      console.log(
        `🔌 [WEBSOCKET INIT] WebSocket server configurado, aguardando conexões...`
      );
      console.log(`🔍 [WEBSOCKET INIT] wss.clients.size:`, wss.clients.size);

      // Handler de erro do WebSocket server
      wss.on("error", (error) => {
        console.error(
          `❌ [WEBSOCKET ERROR] Erro no servidor WebSocket:`,
          error
        );
      });

      wss.on("connection", (ws, req) => {
        const clientId = `client_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const clientIP =
          req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        console.log(
          `🔌 [WEBSOCKET DEBUG] Nova conexão WebSocket: ${clientId} de ${clientIP}`
        );
        console.log(
          `🔍 [WEBSOCKET DEBUG] Total de clientes conectados: ${wss.clients.size}`
        );

        // Sistema WebSocket otimizado habilitado
        surebetsWebSocket.addClient(clientId, ws);
        console.log(
          `✅ [WEBSOCKET SUCCESS] Cliente ${clientId} adicionado ao sistema`
        );

        // Enviar estado atual para o novo cliente
        try {
          // Processar dados de forma robusta
          const processSurebetsData = (data) => {
            if (!data || typeof data !== "object") {
              return {};
            }

            // Se já é um objeto válido, retornar
            if (Object.keys(data).length > 0) {
              return data;
            }

            // Se é um array, converter para objeto
            if (Array.isArray(data)) {
              const obj = {};
              data.forEach((item, index) => {
                if (item && typeof item === "object") {
                  obj[`surebet_${index}`] = item;
                }
              });
              return obj;
            }

            return {};
          };

          const safeSurebets = processSurebetsData(surebets);

          ws.send(
            JSON.stringify({
              type: "initial_state",
              surebets: safeSurebets,
              isSearching: isSearching,
              soundEnabled: soundEnabled,
            })
          );
        } catch (error) {
          console.error("Erro ao enviar estado inicial:", error);
        }

        // Lidar com mensagens recebidas
        ws.on("message", (message) => {
          try {
            console.log(
              `🔍 [WEBSOCKET DEBUG] Mensagem recebida de ${clientId}:`,
              message.toString()
            );

            // Sistema WebSocket otimizado habilitado
            surebetsWebSocket.handleClientMessage(clientId, message.toString());

            // Manter compatibilidade com sistema legado
            const data = JSON.parse(message);

            switch (data.type) {
              case "toggle_search":
                isSearching = data.isSearching;
                console.log(
                  `🔄 [WEBSOCKET DEBUG] Busca ${
                    isSearching ? "ativada" : "pausada"
                  }`
                );

                // Notificar todos os clientes sobre a mudança de estado
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(
                      JSON.stringify({
                        type: "search_state_changed",
                        isSearching: isSearching,
                      })
                    );
                  }
                });
                break;

              case "toggle_sound":
                soundEnabled = data.soundEnabled;
                console.log(
                  `🔊 [WEBSOCKET DEBUG] Som ${
                    soundEnabled ? "ativado" : "desativado"
                  }`
                );
                break;

              case "pix_generated":
                console.log(
                  `💰 [WEBSOCKET DEBUG] PIX gerado para pedido ${data.orderId}`
                );
                break;
            }
          } catch (error) {
            console.error(
              "❌ [WEBSOCKET ERROR] Erro ao processar mensagem:",
              error
            );
          }
        });

        // Lidar com desconexão
        ws.on("close", (code, reason) => {
          console.log(
            `🔌 [WEBSOCKET DEBUG] Conexão WebSocket fechada: ${clientId} (${code}: ${reason})`
          );
          console.log(
            `🔍 [WEBSOCKET DEBUG] Total de clientes conectados: ${wss.clients.size}`
          );
          surebetsWebSocket.removeClient(clientId);
        });

        // Lidar com erros
        ws.on("error", (error) => {
          console.error(
            `❌ [WEBSOCKET ERROR] Erro na conexão WebSocket ${clientId}:`,
            error
          );
          surebetsWebSocket.removeClient(clientId);
        });

        // Ping para manter conexão viva
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);

        // Limpar intervalo quando a conexão fechar
        ws.on("close", () => {
          clearInterval(pingInterval);
        });
      });
    }

    // Manter servidor HTTP para compatibilidade na porta 3000
    app.listen(3000, () => {
      console.log(`🌐 Servidor HTTP de compatibilidade na porta 3000`);
    });

    // Servidor HTTP adicional na porta 3001 para acesso direto
    const httpApp = express();
    httpApp.use(
      cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );
    httpApp.use(express.json({ limit: "10mb" }));
    // httpApp.use(express.static(path.join(__dirname, 'client', 'dist'))); // REMOVIDO - causava conflito

    // Rota específica para webhook do MercadoPago no servidor HTTP (DEVE vir antes dos arquivos estáticos)
    httpApp.post("/webhook", express.json(), async (req, res) => {
      try {
        // Debug: verificar o que está sendo recebido
        console.log("🔍 Webhook recebido (HTTP):", {
          contentType: req.headers["content-type"],
          contentLength: req.headers["content-length"],
          bodyType: typeof req.body,
          bodyKeys: req.body ? Object.keys(req.body) : [],
          bodyPreview: req.body
            ? JSON.stringify(req.body).substring(0, 200)
            : "null",
        });

        // Verificar se o body existe
        if (!req.body) {
          console.log("⚠️ Webhook recebido sem body");
          return res.status(400).json({
            success: false,
            error: "Body vazio",
          });
        }

        // O body já é um objeto JSON parseado pelo express.json()
        const webhookBody = req.body;

        console.log("✅ Webhook MercadoPago processado (HTTP):", {
          headers: req.headers,
          body: webhookBody,
        });

        // Verificar se é um evento de teste do MercadoPago
        const isTestEvent =
          webhookBody.id === "123456" ||
          webhookBody.data?.id === "123456" ||
          webhookBody.live_mode === false;

        console.log("É evento de teste? (HTTP)", isTestEvent);

        // Validar assinatura do webhook (opcional - pode ser desabilitado para testes)
        const PaymentService = require("./server/services/paymentService");
        const paymentService = new PaymentService();
        const signature = req.headers["x-signature"];

        // Pular validação de assinatura para eventos de teste
        if (
          !isTestEvent &&
          signature &&
          process.env.NODE_ENV === "production"
        ) {
          const isValid = paymentService.verifyWebhookSignature(
            webhookBody,
            signature,
            req.headers
          );

          if (!isValid) {
            console.error("Assinatura do webhook inválida:", signature);
            return res.status(401).json({
              success: false,
              error: "Assinatura inválida",
            });
          }
        } else if (isTestEvent) {
          console.log(
            "Evento de teste detectado - pulando validação de assinatura"
          );
        }

        // Processar webhook usando o serviço de pagamentos
        const result = await paymentService.processPaymentWebhook(
          webhookBody,
          req.headers,
          JSON.stringify(webhookBody)
        );

        if (result.success) {
          console.log("Webhook processado com sucesso (HTTP):", result);
          res.json({
            success: true,
            message: "Webhook processado com sucesso",
            data: result,
          });
        } else {
          console.error("Erro ao processar webhook (HTTP):", result);
          res.status(400).json({
            success: false,
            error: result.error || "Erro ao processar webhook",
          });
        }
      } catch (error) {
        console.error("Erro no webhook MercadoPago (HTTP):", error);
        res.status(500).json({
          success: false,
          error: "Erro interno do servidor",
        });
      }
    });

    // Aplicar todas as rotas da API no servidor HTTP também
    httpApp.use("/api/plans", plansRoutes);
    httpApp.use("/api/auth", authRoutes);
    httpApp.use("/api/users", userRoutes);
    httpApp.use("/api/vip", vipRoutes);
    httpApp.use("/api/bookmaker-accounts", bookmakerAccountsRoutes);
    httpApp.use("/api/surebet-stats", surebetStatsRoutes);
    httpApp.use("/api/orders", ordersRoutes);
    httpApp.use("/api/referrals", referralsRoutes);
    httpApp.use("/api/tickets", ticketsRoutes);
    httpApp.use("/api/admin", adminRoutes);
    httpApp.use("/api/notifications", notificationRoutes);
    httpApp.use("/api/payments", paymentRoutes);
    httpApp.use("/api/manual-payments", manualPaymentRoutes);
    httpApp.use("/api/payment-status", paymentStatusRoutes);
    httpApp.use("/api/plan", planVerificationRoutes);
    httpApp.use("/api/surebet-reports", surebetReportsRoutes);

    // Rotas da API existentes
    // Rota de surebets com cache inteligente e controle de acesso apenas para usuários logados
    httpApp.get("/api/surebets", authenticateToken, async (req, res) => {
      try {
        const filters = req.query;
        const result = await surebetsService.getSurebets(filters);

        if (result.success) {
          res.json({
            success: true,
            data: result.data,
            source: result.source,
            timestamp: result.timestamp,
            responseTime: result.responseTime,
            warning: result.warning,
          });
        } else {
          res.status(500).json({
            success: false,
            error: result.error,
            source: result.source,
            timestamp: result.timestamp,
          });
        }
      } catch (error) {
        console.error("❌ Erro na rota /api/surebets:", error);
        res.status(500).json({
          success: false,
          error: "Erro interno do servidor",
          timestamp: Date.now(),
        });
      }
    });

    // Proxy para API externa de surebets (SSE)
    httpApp.get("/api/external-surebets", async (req, res) => {
      try {
        console.log("🔄 [PROXY] Fazendo proxy para API externa sempregreen...");
        
        // Configurar headers para SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', 'https://surestake.com.br');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
        
        // Fazer requisição para API externa
        const externalResponse = await axios.get('https://sempregreen.net.br/apipre/stream', {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Referer': 'https://sempregreen.net.br',
            'Origin': 'https://sempregreen.net.br'
          },
          responseType: 'stream'
        });

        // Pipe da resposta externa para o cliente
        externalResponse.data.pipe(res);
        
        // Lidar com erros da stream
        externalResponse.data.on('error', (error) => {
          console.error("❌ [PROXY] Erro na stream externa:", error);
          res.write(`data: ${JSON.stringify({error: 'Erro na conexão externa'})}\n\n`);
          res.end();
        });

        // Lidar com fechamento da conexão
        req.on('close', () => {
          console.log("🔌 [PROXY] Cliente desconectado");
          externalResponse.data.destroy();
        });

      } catch (error) {
        console.error("❌ [PROXY] Erro ao fazer proxy:", error);
        res.status(500).json({
          success: false,
          error: "Erro ao conectar com API externa",
          message: error.message
        });
      }
    });

    // Rotas de gerenciamento do cache
    httpApp.get("/api/cache/stats", (req, res) => {
      try {
        const cacheStats = surebetsCache.getStats();
        const serviceStats = surebetsService.getStats();

        res.json({
          cache: cacheStats,
          service: serviceStats,
          timestamp: Date.now(),
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    httpApp.post("/api/cache/clear", (req, res) => {
      try {
        surebetsService.clearCache();
        res.json({
          success: true,
          message: "Cache limpo com sucesso",
          timestamp: Date.now(),
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    httpApp.post("/api/cache/preload", async (req, res) => {
      try {
        const result = await surebetsService.preloadCache();
        res.json({
          success: result.success,
          message: result.success
            ? "Cache pré-aquecido com sucesso"
            : "Falha ao pré-aquecer cache",
          timestamp: Date.now(),
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    httpApp.get("/api/cache/health", async (req, res) => {
      try {
        const health = await surebetsService.healthCheck();
        res.json(health);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    httpApp.get("/api/status", (req, res) => {
      res.json({
        isSearching,
        soundEnabled,
        surebetCount:
          surebets && typeof surebets === "object"
            ? Object.keys(surebets).length
            : 0,
      });
    });

    httpApp.post("/api/toggle-search", authenticateToken, (req, res) => {
      isSearching = req.body.isSearching;
      res.json({ isSearching });
    });

    httpApp.post("/api/toggle-sound", authenticateToken, (req, res) => {
      soundEnabled = req.body.soundEnabled;
      res.json({ soundEnabled });
    });

    // Rota de teste simples
    httpApp.get("/api/test", (req, res) => {
      console.log("🔍 [TEST API] Rota /api/test executada");
      res.json({ message: "Teste funcionando!" });
    });

    // Rota de monitoramento do sistema
    httpApp.get("/api/monitoring/stats", (req, res) => {
      try {
        const stats = systemMonitor.getSystemStats();
        res.json(stats);
      } catch (error) {
        console.error("❌ Erro ao obter estatísticas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    });

    // Rota de alertas
    httpApp.get("/api/monitoring/alerts", (req, res) => {
      try {
        const alerts = systemMonitor.getActiveAlerts();
        res.json(alerts);
      } catch (error) {
        console.error("❌ Erro ao obter alertas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    });

    // Rota de health check
    httpApp.get("/api/health", async (req, res) => {
      try {
        const health = await healthChecker.runAllChecks();
        const statusCode =
          health.status === "healthy"
            ? 200
            : health.status === "warning"
            ? 200
            : 503;
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error("Health check failed", { error: error.message });
        res.status(503).json({
          status: "unhealthy",
          message: "Health check falhou",
          error: error.message,
        });
      }
    });

    // Rota de health check rápido
    httpApp.get("/api/health/quick", async (req, res) => {
      try {
        const health = await healthChecker.quickCheck();
        const statusCode = health.status === "healthy" ? 200 : 503;
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error("Quick health check failed", { error: error.message });
        res.status(503).json({
          status: "unhealthy",
          message: "Quick health check falhou",
          error: error.message,
        });
      }
    });

    // Rota de análise de erros
    httpApp.get("/api/errors/analysis", (req, res) => {
      try {
        const report = errorAnalyzer.getErrorReport();
        res.json(report);
      } catch (error) {
        logger.error("Error analysis failed", { error: error.message });
        res.status(500).json({
          error: "Erro ao gerar análise de erros",
          message: error.message,
        });
      }
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

    // Rota específica para Service Worker no servidor HTTP
    httpApp.get("/sw.js", (req, res) => {
      const swPath = "/var/www/surebet/client/dist/sw.js";
      console.log(`🔍 [HTTP SW] Tentando servir: ${swPath}`);
      if (require("fs").existsSync(swPath)) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.sendFile(swPath);
      } else {
        console.error("❌ [HTTP SW] Service Worker não encontrado:", swPath);
        res.status(404).send("Service Worker não encontrado");
      }
    });

    // Rota específica para manifest.json no servidor HTTP
    httpApp.get("/manifest.json", (req, res) => {
      const manifestPath = "/var/www//surebet/client/dist/manifest.json";
      console.log(`🔍 [HTTP MANIFEST] Tentando servir: ${manifestPath}`);
      if (require("fs").existsSync(manifestPath)) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.sendFile(manifestPath);
      } else {
        console.error(
          "❌ [HTTP MANIFEST] Manifest não encontrado:",
          manifestPath
        );
        res.status(404).send("Manifest não encontrado");
      }
    });

    // Rota específica para pwa-config.js no servidor HTTP
    httpApp.get("/pwa-config.js", (req, res) => {
      const pwaConfigPath = "/var/www/surebet/client/dist/pwa-config.js";
      console.log(`🔍 [HTTP PWA-CONFIG] Tentando servir: ${pwaConfigPath}`);
      if (require("fs").existsSync(pwaConfigPath)) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.sendFile(pwaConfigPath);
      } else {
        console.error(
          "❌ [HTTP PWA-CONFIG] Arquivo não encontrado:",
          pwaConfigPath
        );
        res.status(404).send("PWA Config não encontrado");
      }
    });

    // Rotas específicas para arquivos estáticos no servidor HTTP
    httpApp.get("/css/*", (req, res) => {
      const filePath = path.join("/var/www/surebet/client/dist", req.path);
      console.log(`🔍 [HTTP CSS] Tentando servir: ${filePath}`);
      if (require("fs").existsSync(filePath)) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
        res.sendFile(filePath);
      } else {
        console.error(`❌ [HTTP CSS] Arquivo não encontrado: ${filePath}`);
        res.status(404).send("CSS file not found");
      }
    });

    httpApp.get("/js/*", (req, res) => {
      const filePath = path.join("/var/www/surebet/client/dist", req.path);
      console.log(`🔍 [HTTP JS] Tentando servir: ${filePath}`);
      if (require("fs").existsSync(filePath)) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.sendFile(filePath);
      } else {
        console.error(`❌ [HTTP JS] Arquivo não encontrado: ${filePath}`);
        res.status(404).send("JS file not found");
      }
    });

    httpApp.get("/img/*", (req, res) => {
      const filePath = path.join("/var/www/surebet/client/dist", req.path);
      console.log(`🔍 [HTTP IMG] Tentando servir: ${filePath}`);
      if (require("fs").existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        console.error(`❌ [HTTP IMG] Arquivo não encontrado: ${filePath}`);
        res.status(404).send("Image not found");
      }
    });

    httpApp.get("/fonts/*", (req, res) => {
      const filePath = path.join("/var/www/surebet/client/dist", req.path);
      console.log(`🔍 [HTTP FONTS] Tentando servir: ${filePath}`);
      if (require("fs").existsSync(filePath)) {
        // Definir Content-Type correto baseado na extensão
        if (filePath.endsWith(".woff2")) {
          res.setHeader("Content-Type", "font/woff2");
        } else if (filePath.endsWith(".woff")) {
          res.setHeader("Content-Type", "font/woff");
        } else if (filePath.endsWith(".ttf")) {
          res.setHeader("Content-Type", "font/ttf");
        } else if (filePath.endsWith(".eot")) {
          res.setHeader("Content-Type", "application/vnd.ms-fontobject");
        }
        res.sendFile(filePath);
      } else {
        console.error(`❌ [HTTP FONTS] Arquivo não encontrado: ${filePath}`);
        res.status(404).send("Font not found");
      }
    });

    // Servir SPA para todas as outras rotas
    httpApp.get("*", (req, res) => {
      // Verificar se é uma rota da API que não foi encontrada
      if (req.path.startsWith("/api/")) {
        console.log(
          `🚫 [HTTP API] Rota da API não encontrada: ${req.method} ${req.path}`
        );
        return res.status(404).json({
          error: "Endpoint não encontrado",
          message: `A rota ${req.method} ${req.path} não existe`,
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
        });
      }

      console.log(`🌐 [HTTP] Servindo SPA para: ${req.path}`);
      console.log(`🔍 [HTTP SPA] __dirname: ${__dirname}`);

      const indexPath = "/var/www/surebet/client/dist/index.html";
      console.log(`🔍 [HTTP SPA] Caminho completo: ${indexPath}`);

      if (require("fs").existsSync(indexPath)) {
        console.log(`✅ [HTTP SPA] Arquivo encontrado, enviando...`);
        res.sendFile(indexPath);
      } else {
        console.error(
          `❌ [HTTP SPA] Arquivo index.html não encontrado em: ${indexPath}`
        );
        console.error(`❌ [HTTP SPA] __dirname atual: ${__dirname}`);
        console.error(
          `❌ [HTTP SPA] Listando diretório:`,
          require("fs").readdirSync(__dirname)
        );
        res.status(500).send("Arquivo index.html não encontrado");
      }
    });

    httpApp.listen(3001, () => {
      console.log(`🌐 Servidor HTTP rodando na porta 3001`);

      // Iniciar verificador de pagamentos PIX
      paymentChecker.start();
      console.log("🔄 Verificador de pagamentos PIX iniciado");
    });

    // WebSocket de desenvolvimento desabilitado para evitar conflitos
    // O WebSocket principal já está configurado na porta 3001

    // Integrar WebSocket com notificações de pagamento
    global.notifyPaymentUpdate = (paymentData) => {
      if (wss) {
        surebetsWebSocket.notifyPaymentStatusUpdate(paymentData);
      }
    };

    global.notifyPaymentConfirmed = (paymentData) => {
      if (wss) {
        surebetsWebSocket.notifyPaymentConfirmed(paymentData);
      }
    };
  } catch (error) {
    console.error("❌ Erro ao inicializar aplicação:", error);
    process.exit(1);
  }
}

// Inicializar aplicação
initializeApp();
