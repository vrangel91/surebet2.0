#!/usr/bin/env node

/**
 * Script de Diagnóstico para Produção
 * Verifica se todas as APIs estão funcionando corretamente
 */

const axios = require('axios');
const https = require('https');

// Configurações
const API_BASE_URL = 'https://surestake.com.br';
const TEST_USER = {
  email: 'admin@surebets.com', // ← Usuário admin encontrado no banco
  password: 'admin123' // ← ALTERAR para senha real
};

// Ignorar certificados SSL para testes
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const api = axios.create({
  baseURL: API_BASE_URL,
  httpsAgent,
  timeout: 10000
});

let authToken = null;

async function testAPI(endpoint, method = 'GET', data = null, requiresAuth = true) {
  try {
    console.log(`🔍 Testando: ${method} ${endpoint}`);
    
    const config = {
      method,
      url: endpoint,
      headers: {}
    };
    
    if (requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await api(config);
    console.log(`✅ ${endpoint} - Status: ${response.status}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${endpoint} - Erro: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`   Detalhes: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico de produção...\n');
  
  // 1. Testar APIs públicas
  console.log('📋 1. Testando APIs públicas:');
  await testAPI('/api/health', 'GET', null, false);
  await testAPI('/api/surebets', 'GET', null, false);
  
  // 2. Testar login
  console.log('\n📋 2. Testando autenticação:');
  const loginResult = await testAPI('/api/auth/login', 'POST', TEST_USER, false);
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('✅ Token de autenticação obtido');
  } else {
    console.log('❌ Falha na autenticação - testes autenticados serão pulados');
    return;
  }
  
  // 3. Testar APIs autenticadas
  console.log('\n📋 3. Testando APIs autenticadas:');
  await testAPI('/api/users', 'GET');
  await testAPI('/api/vip/status', 'GET');
  await testAPI('/api/notifications', 'GET');
  await testAPI('/api/admin/stats', 'GET');
  await testAPI('/api/tickets', 'GET');
  
  // 4. Testar APIs específicas que não estão funcionando
  console.log('\n📋 4. Testando APIs problemáticas:');
  await testAPI('/api/vip/plans', 'GET');
  await testAPI('/api/admin/users', 'GET');
  await testAPI('/api/notifications/unread-count', 'GET');
  
  console.log('\n🎯 Diagnóstico concluído!');
  console.log('\n📊 Resumo:');
  console.log('- Se todas as APIs retornaram ✅, o problema pode ser no frontend');
  console.log('- Se algumas APIs retornaram ❌, o problema está no backend');
  console.log('- Verifique os logs do servidor para mais detalhes');
}

// Executar diagnóstico
runDiagnostics().catch(console.error);
