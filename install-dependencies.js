#!/usr/bin/env node

/**
 * Script para instalar dependências faltando
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function installDependencies() {
  try {
    console.log('📦 Instalando dependências faltando...');
    
    // Instalar node-cache e compression
    console.log('🔧 Instalando node-cache...');
    await execAsync('npm install node-cache');
    
    console.log('🔧 Instalando compression...');
    await execAsync('npm install compression');
    
    console.log('✅ Dependências instaladas!');
    
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
  }
}

installDependencies();
