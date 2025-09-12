// Configurações de ambiente
module.exports = {
  // Banco de dados
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'surebet',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'SureStake2024!',

  // Servidor
  PORT: process.env.PORT || 3000,
  HTTP_PORT: process.env.HTTP_PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'production',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'seu_jwt_secret_aqui',

  // MercadoPago
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN || 'seu_access_token_aqui',
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY || 'seu_public_key_aqui',

  // Webhook MercadoPago - SUA ASSINATURA
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '1be7b91f404f74fed096a02490ed8f0c3b57e603b09bd3f58fec69f11058f1e4',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://surestake.com.br'
};
