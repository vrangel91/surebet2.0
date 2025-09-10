/**
 * Monitor de webhooks em tempo real
 */

const fs = require('fs');
const path = require('path');

function monitorWebhooks() {
  console.log('🔍 Monitorando webhooks em tempo real...');
  console.log('📋 Para parar, pressione Ctrl+C');
  console.log('📁 Logs sendo salvos em: webhook-monitor.log');
  
  const logFile = path.join(__dirname, 'webhook-monitor.log');
  
  // Limpar arquivo de log anterior
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
  
  // Monitorar logs do PM2
  const { spawn } = require('child_process');
  
  const pm2Logs = spawn('pm2', ['logs', 'surestake', '--raw'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  pm2Logs.stdout.on('data', (data) => {
    const logLine = data.toString();
    
    // Filtrar apenas logs relacionados a webhooks
    if (logLine.includes('webhook') || logLine.includes('Webhook') || logLine.includes('payment')) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${logLine}`;
      
      console.log(logEntry.trim());
      
      // Salvar no arquivo
      fs.appendFileSync(logFile, logEntry);
    }
  });
  
  pm2Logs.stderr.on('data', (data) => {
    const logLine = data.toString();
    
    if (logLine.includes('webhook') || logLine.includes('Webhook') || logLine.includes('payment')) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ERROR: ${logLine}`;
      
      console.log(logEntry.trim());
      
      // Salvar no arquivo
      fs.appendFileSync(logFile, logEntry);
    }
  });
  
  pm2Logs.on('close', (code) => {
    console.log(`\n📊 Monitor finalizado com código: ${code}`);
  });
  
  // Tratar interrupção
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando monitor...');
    pm2Logs.kill();
    process.exit(0);
  });
}

monitorWebhooks();
