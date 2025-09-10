/**
 * Sistema de Monitoramento de Performance em Tempo Real
 * Monitora métricas do sistema durante os testes de carga
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      interval: config.interval || 1000, // 1 segundo
      logFile: config.logFile || 'performance-monitor.log',
      maxLogSize: config.maxLogSize || 10 * 1024 * 1024, // 10MB
      ...config
    };
    
    this.metrics = [];
    this.isMonitoring = false;
    this.startTime = null;
    this.logStream = null;
  }

  /**
   * Inicia o monitoramento
   */
  async start() {
    console.log('🔍 Iniciando monitoramento de performance...');
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    
    // Configurar log
    this.setupLogging();
    
    // Iniciar coleta de métricas
    this.collectMetrics();
    
    console.log('✅ Monitoramento iniciado');
  }

  /**
   * Para o monitoramento
   */
  stop() {
    console.log('⏹️ Parando monitoramento de performance...');
    
    this.isMonitoring = false;
    
    if (this.logStream) {
      this.logStream.end();
    }
    
    console.log('✅ Monitoramento parado');
  }

  /**
   * Configura o sistema de logging
   */
  setupLogging() {
    const logPath = path.join(__dirname, this.config.logFile);
    this.logStream = fs.createWriteStream(logPath, { flags: 'a' });
    
    // Log inicial
    this.logStream.write(`\n=== MONITORAMENTO INICIADO: ${new Date().toISOString()} ===\n`);
  }

  /**
   * Coleta métricas em loop
   */
  async collectMetrics() {
    while (this.isMonitoring) {
      try {
        const metric = await this.gatherSystemMetrics();
        this.metrics.push(metric);
        
        // Log da métrica
        this.logMetric(metric);
        
        // Manter apenas últimas 1000 métricas na memória
        if (this.metrics.length > 1000) {
          this.metrics = this.metrics.slice(-1000);
        }
        
        // Verificar tamanho do log
        this.checkLogSize();
        
      } catch (error) {
        console.error('Erro ao coletar métricas:', error);
      }
      
      await this.sleep(this.config.interval);
    }
  }

  /**
   * Coleta métricas do sistema
   */
  async gatherSystemMetrics() {
    const timestamp = Date.now();
    const uptime = timestamp - this.startTime;
    
    // Métricas do sistema
    const systemMetrics = {
      timestamp,
      uptime,
      cpu: {
        usage: await this.getCpuUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      network: await this.getNetworkMetrics(),
      processes: await this.getProcessMetrics(),
      database: await this.getDatabaseMetrics()
    };
    
    return systemMetrics;
  }

  /**
   * Obtém uso de CPU
   */
  async getCpuUsage() {
    try {
      const { stdout } = await execAsync('wmic cpu get loadpercentage /value');
      const lines = stdout.split('\n');
      const loadLine = lines.find(line => line.includes('LoadPercentage'));
      
      if (loadLine) {
        const usage = parseInt(loadLine.split('=')[1]);
        return isNaN(usage) ? 0 : usage;
      }
      
      return 0;
    } catch (error) {
      // Fallback para sistemas Unix
      try {
        const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | awk -F\'%\' \'{print $1}\'');
        return parseFloat(stdout) || 0;
      } catch (e) {
        return 0;
      }
    }
  }

  /**
   * Obtém métricas de rede
   */
  async getNetworkMetrics() {
    try {
      const { stdout } = await execAsync('netstat -i');
      const lines = stdout.split('\n');
      const networkInterface = lines.find(line => line.includes('eth0') || line.includes('en0'));
      
      if (networkInterface) {
        const parts = networkInterface.split(/\s+/);
        return {
          interface: parts[0],
          received: parseInt(parts[2]) || 0,
          transmitted: parseInt(parts[6]) || 0
        };
      }
      
      return { interface: 'unknown', received: 0, transmitted: 0 };
    } catch (error) {
      return { interface: 'unknown', received: 0, transmitted: 0 };
    }
  }

  /**
   * Obtém métricas de processos
   */
  async getProcessMetrics() {
    try {
      const { stdout } = await execAsync('tasklist /fo csv | find /c "node.exe"');
      const nodeProcesses = parseInt(stdout.trim()) || 0;
      
      return {
        nodeProcesses,
        totalProcesses: await this.getTotalProcesses()
      };
    } catch (error) {
      return { nodeProcesses: 0, totalProcesses: 0 };
    }
  }

  /**
   * Obtém total de processos
   */
  async getTotalProcesses() {
    try {
      const { stdout } = await execAsync('tasklist /fo csv | find /c /v ""');
      return parseInt(stdout.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtém métricas do banco de dados
   */
  async getDatabaseMetrics() {
    try {
      // Verificar conexões ativas no PostgreSQL
      const { stdout } = await execAsync('psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"');
      const activeConnections = parseInt(stdout.match(/\d+/)?.[0]) || 0;
      
      return {
        activeConnections,
        status: 'connected'
      };
    } catch (error) {
      return {
        activeConnections: 0,
        status: 'disconnected',
        error: error.message
      };
    }
  }

  /**
   * Loga uma métrica
   */
  logMetric(metric) {
    const logLine = JSON.stringify(metric) + '\n';
    
    if (this.logStream) {
      this.logStream.write(logLine);
    }
    
    // Log no console a cada 10 segundos
    if (this.metrics.length % 10 === 0) {
      this.printCurrentMetrics(metric);
    }
  }

  /**
   * Imprime métricas atuais no console
   */
  printCurrentMetrics(metric) {
    console.log(`\n📊 === MÉTRICAS ATUAIS (${new Date().toLocaleTimeString()}) ===`);
    console.log(`⏱️ Uptime: ${Math.floor(metric.uptime / 1000)}s`);
    console.log(`🖥️ CPU: ${metric.cpu.usage.toFixed(1)}% (Load: ${metric.cpu.loadAverage[0].toFixed(2)})`);
    console.log(`💾 Memória: ${metric.memory.usage.toFixed(1)}% (${this.formatBytes(metric.memory.used)}/${this.formatBytes(metric.memory.total)})`);
    console.log(`🌐 Rede: RX ${metric.network.received}, TX ${metric.network.transmitted}`);
    console.log(`🔄 Processos Node: ${metric.processes.nodeProcesses}`);
    console.log(`🗄️ DB Conexões: ${metric.database.activeConnections} (${metric.database.status})`);
    console.log('==========================================');
  }

  /**
   * Formata bytes para formato legível
   */
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Verifica tamanho do log
   */
  checkLogSize() {
    if (this.logStream) {
      const stats = fs.statSync(this.logStream.path);
      if (stats.size > this.config.maxLogSize) {
        this.rotateLog();
      }
    }
  }

  /**
   * Rotaciona o arquivo de log
   */
  rotateLog() {
    if (this.logStream) {
      this.logStream.end();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newLogFile = this.config.logFile.replace('.log', `-${timestamp}.log`);
      
      // Renomear arquivo atual
      fs.renameSync(this.logStream.path, newLogFile);
      
      // Criar novo arquivo
      this.logStream = fs.createWriteStream(this.config.logFile, { flags: 'a' });
      
      console.log(`📄 Log rotacionado: ${newLogFile}`);
    }
  }

  /**
   * Gera relatório de performance
   */
  generateReport() {
    if (this.metrics.length === 0) {
      console.log('❌ Nenhuma métrica coletada');
      return;
    }
    
    const report = {
      summary: {
        totalSamples: this.metrics.length,
        duration: this.metrics[this.metrics.length - 1].uptime,
        startTime: new Date(this.metrics[0].timestamp).toISOString(),
        endTime: new Date(this.metrics[this.metrics.length - 1].timestamp).toISOString()
      },
      averages: this.calculateAverages(),
      peaks: this.calculatePeaks(),
      trends: this.calculateTrends(),
      alerts: this.generateAlerts()
    };
    
    // Salvar relatório
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 RELATÓRIO DE PERFORMANCE');
    console.log('============================');
    console.log(`📊 Amostras: ${report.summary.totalSamples}`);
    console.log(`⏱️ Duração: ${Math.floor(report.summary.duration / 1000)}s`);
    console.log(`🖥️ CPU Médio: ${report.averages.cpu.toFixed(1)}%`);
    console.log(`💾 Memória Média: ${report.averages.memory.toFixed(1)}%`);
    console.log(`🗄️ Conexões DB Médias: ${report.averages.databaseConnections.toFixed(1)}`);
    console.log(`📄 Relatório salvo em: ${reportPath}`);
    
    return report;
  }

  /**
   * Calcula médias das métricas
   */
  calculateAverages() {
    const totals = this.metrics.reduce((acc, metric) => {
      acc.cpu += metric.cpu.usage;
      acc.memory += metric.memory.usage;
      acc.databaseConnections += metric.database.activeConnections;
      return acc;
    }, { cpu: 0, memory: 0, databaseConnections: 0 });
    
    const count = this.metrics.length;
    
    return {
      cpu: totals.cpu / count,
      memory: totals.memory / count,
      databaseConnections: totals.databaseConnections / count
    };
  }

  /**
   * Calcula picos das métricas
   */
  calculatePeaks() {
    const cpuValues = this.metrics.map(m => m.cpu.usage);
    const memoryValues = this.metrics.map(m => m.memory.usage);
    const dbValues = this.metrics.map(m => m.database.activeConnections);
    
    return {
      cpu: Math.max(...cpuValues),
      memory: Math.max(...memoryValues),
      databaseConnections: Math.max(...dbValues)
    };
  }

  /**
   * Calcula tendências das métricas
   */
  calculateTrends() {
    const firstHalf = this.metrics.slice(0, Math.floor(this.metrics.length / 2));
    const secondHalf = this.metrics.slice(Math.floor(this.metrics.length / 2));
    
    const firstHalfAvg = this.calculateAveragesForMetrics(firstHalf);
    const secondHalfAvg = this.calculateAveragesForMetrics(secondHalf);
    
    return {
      cpu: secondHalfAvg.cpu - firstHalfAvg.cpu,
      memory: secondHalfAvg.memory - firstHalfAvg.memory,
      databaseConnections: secondHalfAvg.databaseConnections - firstHalfAvg.databaseConnections
    };
  }

  /**
   * Calcula médias para um conjunto de métricas
   */
  calculateAveragesForMetrics(metrics) {
    const totals = metrics.reduce((acc, metric) => {
      acc.cpu += metric.cpu.usage;
      acc.memory += metric.memory.usage;
      acc.databaseConnections += metric.database.activeConnections;
      return acc;
    }, { cpu: 0, memory: 0, databaseConnections: 0 });
    
    const count = metrics.length;
    
    return {
      cpu: totals.cpu / count,
      memory: totals.memory / count,
      databaseConnections: totals.databaseConnections / count
    };
  }

  /**
   * Gera alertas baseados nas métricas
   */
  generateAlerts() {
    const alerts = [];
    const averages = this.calculateAverages();
    const peaks = this.calculatePeaks();
    
    if (averages.cpu > 70) {
      alerts.push({
        type: 'warning',
        message: `CPU médio alto: ${averages.cpu.toFixed(1)}%`,
        recommendation: 'Considerar otimizações de código ou aumentar recursos'
      });
    }
    
    if (peaks.cpu > 90) {
      alerts.push({
        type: 'critical',
        message: `Pico de CPU crítico: ${peaks.cpu.toFixed(1)}%`,
        recommendation: 'Investigar gargalos imediatamente'
      });
    }
    
    if (averages.memory > 80) {
      alerts.push({
        type: 'warning',
        message: `Uso de memória alto: ${averages.memory.toFixed(1)}%`,
        recommendation: 'Verificar vazamentos de memória'
      });
    }
    
    if (peaks.databaseConnections > 50) {
      alerts.push({
        type: 'warning',
        message: `Muitas conexões DB: ${peaks.databaseConnections}`,
        recommendation: 'Implementar pool de conexões'
      });
    }
    
    return alerts;
  }

  /**
   * Utilitário para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar monitoramento se chamado diretamente
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  // Capturar sinais para parar graciosamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando monitoramento...');
    monitor.stop();
    monitor.generateReport();
    process.exit(0);
  });
  
  monitor.start();
}

module.exports = PerformanceMonitor;
