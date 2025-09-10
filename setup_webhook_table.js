#!/usr/bin/env node

// Script simples para criar a tabela webhook_events
const { Pool } = require('pg');
require('dotenv').config();

async function createWebhookTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'SureStake2024!',
    database: process.env.DB_NAME || 'surestake',
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // Criar tabela
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id VARCHAR(255) PRIMARY KEY,
        payment_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabela webhook_events criada!');
    
    // Criar índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id 
      ON webhook_events(payment_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at 
      ON webhook_events(processed_at)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_events_status 
      ON webhook_events(status)
    `);
    
    console.log('✅ Índices criados!');
    
    // Verificar se foi criada
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'webhook_events'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela confirmada no banco de dados!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createWebhookTable();
