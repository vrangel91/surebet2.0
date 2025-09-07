#!/usr/bin/env node

/**
 * Script para compilar frontend
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function buildFrontend() {
  try {
    console.log('🏗️ Compilando frontend...');
    
    // Navegar para pasta client e compilar
    console.log('📁 Navegando para pasta client...');
    process.chdir('./client');
    
    console.log('📦 Instalando dependências do frontend...');
    await execAsync('npm install');
    
    console.log('🔨 Compilando frontend...');
    await execAsync('npm run build');
    
    console.log('✅ Frontend compilado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao compilar frontend:', error.message);
  }
}

buildFrontend();
