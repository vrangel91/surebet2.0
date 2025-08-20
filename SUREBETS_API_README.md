# 🏆 API de Surebets - Implementação Backend

Este documento explica como implementar a API de surebets no backend para evitar duplicatas e fornecer dados para a página de ranking.

## 📋 Estrutura da Base de Dados

### Tabela: `surebets`

```sql
CREATE TABLE surebets (
  id VARCHAR(50) PRIMARY KEY,                    -- ID único para evitar duplicatas
  bookmaker1 VARCHAR(100) NOT NULL,              -- Primeira casa de apostas
  bookmaker2 VARCHAR(100) NOT NULL,              -- Segunda casa de apostas
  sport VARCHAR(50) NOT NULL,                    -- Esporte (Futebol, Basquete, etc.)
  event VARCHAR(200) NOT NULL,                   -- Evento específico
  market VARCHAR(100) NOT NULL,                  -- Mercado de apostas
  selection1 VARCHAR(100) NOT NULL,              -- Primeira seleção
  selection2 VARCHAR(100) NOT NULL,              -- Segunda seleção
  selection3 VARCHAR(100),                       -- Terceira seleção (opcional)
  odds1 DECIMAL(10,2) NOT NULL,                 -- Odds da primeira seleção
  odds2 DECIMAL(10,2) NOT NULL,                 -- Odds da segunda seleção
  odds3 DECIMAL(10,2),                          -- Odds da terceira seleção
  profit DECIMAL(10,2) NOT NULL,                 -- Lucro esperado
  roi DECIMAL(5,2) NOT NULL,                    -- ROI em porcentagem
  stake DECIMAL(10,2) NOT NULL,                 -- Stake recomendado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação
  expires_at TIMESTAMP NOT NULL,                 -- Data de expiração
  status VARCHAR(20) DEFAULT 'active',           -- Status: active, expired, completed
  tags TEXT[],                                   -- Tags para categorização
  user_id VARCHAR(50),                           -- ID do usuário que criou
  created_by VARCHAR(50)                         -- Sistema ou usuário que criou
);

-- Índices para performance
CREATE INDEX idx_surebets_bookmakers ON surebets(bookmaker1, bookmaker2);
CREATE INDEX idx_surebets_created_at ON surebets(created_at);
CREATE INDEX idx_surebets_status ON surebets(status);
CREATE INDEX idx_surebets_sport ON surebets(sport);
CREATE INDEX idx_surebets_profit ON surebets(profit);
CREATE INDEX idx_surebets_roi ON surebets(roi);
```

### Tabela: `bookmakers`

```sql
CREATE TABLE bookmakers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(50),
  website VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔑 Estratégias para Evitar Duplicatas

### 1. **ID Único Composto**
```javascript
// Gerar ID único baseado em múltiplos fatores
function generateUniqueId(surebetData) {
  const timestamp = Date.now();
  const hash = createHash(surebetData.bookmaker1 + surebetData.bookmaker2 + surebetData.event);
  const random = Math.random().toString(36).substr(2, 9);
  
  return `surebet_${timestamp}_${hash}_${random}`;
}
```

### 2. **Verificação de Duplicatas por Conteúdo**
```javascript
// Verificar se já existe uma surebet similar
async function checkDuplicate(surebetData) {
  const query = `
    SELECT id FROM surebets 
    WHERE bookmaker1 = $1 
    AND bookmaker2 = $2 
    AND event = $3 
    AND market = $4
    AND created_at > NOW() - INTERVAL '1 hour'
  `;
  
  const result = await db.query(query, [
    surebetData.bookmaker1,
    surebetData.bookmaker2,
    surebetData.event,
    surebetData.market
  ]);
  
  return result.rows.length > 0;
}
```

### 3. **Hash de Conteúdo**
```javascript
// Criar hash do conteúdo para verificação rápida
function createContentHash(surebetData) {
  const content = JSON.stringify({
    bookmaker1: surebetData.bookmaker1,
    bookmaker2: surebetData.bookmaker2,
    event: surebetData.event,
    market: surebetData.market,
    odds1: surebetData.odds1,
    odds2: surebetData.odds2,
    odds3: surebetData.odds3
  });
  
  return crypto.createHash('sha256').update(content).digest('hex');
}
```

## 🚀 Endpoints da API

### 1. **Criar Surebet**
```javascript
POST /api/surebets
Content-Type: application/json
Authorization: Bearer <token>

{
  "bookmaker1": "Bet365",
  "bookmaker2": "William Hill",
  "sport": "Futebol",
  "event": "Brasil vs Argentina",
  "market": "Resultado Final",
  "selection1": "Brasil",
  "selection2": "Empate",
  "selection3": "Argentina",
  "odds1": 2.10,
  "odds2": 3.40,
  "odds3": 3.80,
  "profit": 15.50,
  "roi": 3.2,
  "stake": 100,
  "expiresAt": "2024-01-15T22:00:00Z",
  "tags": ["futebol", "brasileirao", "alta-liquidez"]
}
```

**Resposta:**
```json
{
  "success": true,
  "surebet": {
    "id": "surebet_1705312800000_a1b2c3d4e5_xyz789",
    "createdAt": "2024-01-15T10:00:00Z",
    ...outros campos
  }
}
```

### 2. **Buscar Surebets**
```javascript
POST /api/surebets
Content-Type: application/json
Authorization: Bearer <token>

{
  "period": "30",           // 7, 30, 90, all
  "sortBy": "frequency",    // frequency, profit, roi, created_at
  "limit": 50,
  "offset": 0,
  "filters": {
    "sport": "Futebol",
    "minProfit": 10,
    "maxROI": 5
  }
}
```

### 3. **Estatísticas de Bookmakers**
```javascript
POST /api/bookmakers/stats
Content-Type: application/json
Authorization: Bearer <token>

{
  "period": "30",
  "groupBy": "day"  // day, week, month
}
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "totalSurebets": 1250,
    "uniqueBookmakers": 15,
    "averageROI": 3.45,
    "totalProfit": 18750.25,
    "dailyStats": [
      {
        "date": "2024-01-15",
        "count": 45,
        "avgProfit": 18.20,
        "avgROI": 3.8
      }
    ]
  }
}
```

### 4. **Ranking de Bookmakers**
```javascript
POST /api/bookmakers/ranking
Content-Type: application/json
Authorization: Bearer <token>

{
  "period": "30",
  "sortBy": "frequency",  // frequency, profit, roi
  "limit": 20
}
```

**Resposta:**
```json
{
  "success": true,
  "ranking": [
    {
      "id": "bet365",
      "name": "Bet365",
      "frequency": 156,
      "percentage": 12.5,
      "avgProfit": 16.80,
      "avgROI": 3.2,
      "lastAppearance": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## 🛡️ Validações e Segurança

### 1. **Validação de Dados**
```javascript
const surebetSchema = Joi.object({
  bookmaker1: Joi.string().required().min(2).max(100),
  bookmaker2: Joi.string().required().min(2).max(100),
  sport: Joi.string().required().valid('Futebol', 'Basquete', 'Tênis', 'Basquete'),
  event: Joi.string().required().min(5).max(200),
  market: Joi.string().required().min(2).max(100),
  odds1: Joi.number().positive().required(),
  odds2: Joi.number().positive().required(),
  odds3: Joi.number().positive().optional(),
  profit: Joi.number().positive().required(),
  roi: Joi.number().positive().max(100).required(),
  stake: Joi.number().positive().required(),
  expiresAt: Joi.date().greater('now').required()
});
```

### 2. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const surebetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas de criação de surebets. Tente novamente mais tarde.'
});

app.use('/api/surebets', surebetLimiter);
```

### 3. **Autenticação e Autorização**
```javascript
// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autorização para admins
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};
```

## 📊 Queries de Performance

### 1. **Ranking de Bookmakers**
```sql
WITH bookmaker_stats AS (
  SELECT 
    bookmaker1 as name,
    COUNT(*) as frequency,
    AVG(profit) as avg_profit,
    AVG(roi) as avg_roi,
    MAX(created_at) as last_appearance
  FROM surebets 
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY bookmaker1
  
  UNION ALL
  
  SELECT 
    bookmaker2 as name,
    COUNT(*) as frequency,
    AVG(profit) as avg_profit,
    AVG(roi) as avg_roi,
    MAX(created_at) as last_appearance
  FROM surebets 
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY bookmaker2
)
SELECT 
  name,
  SUM(frequency) as total_frequency,
  AVG(avg_profit) as avg_profit,
  AVG(avg_roi) as avg_roi,
  MAX(last_appearance) as last_appearance
FROM bookmaker_stats
GROUP BY name
ORDER BY total_frequency DESC
LIMIT 20;
```

### 2. **Evolução Temporal**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as surebets_count,
  AVG(profit) as avg_profit,
  AVG(roi) as avg_roi
FROM surebets
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### 3. **Top Performers**
```sql
SELECT 
  bookmaker1 as name,
  AVG(roi) as avg_roi,
  COUNT(*) as frequency
FROM surebets
WHERE roi > 0 
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY bookmaker1
HAVING COUNT(*) >= 5
ORDER BY avg_roi DESC
LIMIT 10;
```

## 🔄 Processamento em Lote

### 1. **Limpeza de Surebets Expiradas**
```javascript
// Job agendado para limpar surebets expiradas
async function cleanupExpiredSurebets() {
  try {
    const result = await db.query(`
      UPDATE surebets 
      SET status = 'expired' 
      WHERE expires_at < NOW() 
      AND status = 'active'
    `);
    
    console.log(`Limpeza concluída: ${result.rowCount} surebets expiradas`);
  } catch (error) {
    console.error('Erro na limpeza:', error);
  }
}

// Executar a cada hora
setInterval(cleanupExpiredSurebets, 60 * 60 * 1000);
```

### 2. **Atualização de Estatísticas**
```javascript
// Job para atualizar estatísticas em cache
async function updateStatsCache() {
  try {
    const stats = await calculateBookmakerStats();
    await redis.setex('bookmaker_stats', 3600, JSON.stringify(stats));
    console.log('Cache de estatísticas atualizado');
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
  }
}

// Executar a cada 15 minutos
setInterval(updateStatsCache, 15 * 60 * 1000);
```

## 📈 Monitoramento e Logs

### 1. **Logs de Auditoria**
```javascript
const auditLog = (action, userId, surebetId, details) => {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    surebetId,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Salvar no banco de dados
  db.query(`
    INSERT INTO audit_logs (action, user_id, surebet_id, details, ip, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [log.action, log.userId, log.surebetId, log.details, log.ip, log.userAgent]);
  
  // Log no console
  console.log(`[AUDIT] ${action} by user ${userId} on surebet ${surebetId}`);
};
```

### 2. **Métricas de Performance**
```javascript
const performanceMetrics = {
  requestCount: 0,
  averageResponseTime: 0,
  errorCount: 0,
  
  recordRequest(duration) {
    this.requestCount++;
    this.averageResponseTime = 
      (this.averageResponseTime * (this.requestCount - 1) + duration) / this.requestCount;
  },
  
  recordError() {
    this.errorCount++;
  },
  
  getStats() {
    return {
      requestCount: this.requestCount,
      averageResponseTime: this.averageResponseTime,
      errorRate: this.errorCount / this.requestCount
    };
  }
};
```

## 🚀 Deploy e Configuração

### 1. **Variáveis de Ambiente**
```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/surebets_db
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=3000
```

### 2. **Docker Compose**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=surebets_db
      - POSTGRES_USER=surebets_user
      - POSTGRES_PASSWORD=surebets_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 📝 Checklist de Implementação

- [ ] Criar tabelas no banco de dados
- [ ] Implementar validação de dados
- [ ] Criar sistema de IDs únicos
- [ ] Implementar verificação de duplicatas
- [ ] Criar endpoints da API
- [ ] Implementar autenticação e autorização
- [ ] Adicionar rate limiting
- [ ] Implementar cache Redis
- [ ] Criar jobs de limpeza
- [ ] Adicionar logs de auditoria
- [ ] Implementar métricas de performance
- [ ] Configurar monitoramento
- [ ] Testes unitários e de integração
- [ ] Documentação da API
- [ ] Deploy em produção

## 🔗 Links Úteis

- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT.io](https://jwt.io/)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)

---

**Nota:** Esta implementação garante que cada surebet tenha um ID único e evita duplicatas através de múltiplas camadas de verificação, proporcionando dados confiáveis para a página de ranking.
