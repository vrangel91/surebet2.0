const cron = require('node-cron');

console.log('🧪 Testando getNextExecutionTime com jobs reais...');

// Simular a estrutura da classe VIPCronJobs
class TestVIPCronJobs {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
    this.lastExecution = null;
  }

  // Criar jobs reais com node-cron
  createTestJobs() {
    console.log('⏰ Criando jobs de teste...');
    
    // Job 1: A cada minuto
    const job1 = cron.schedule('* * * * *', () => {
      console.log('✅ Job 1 executado!');
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Job 2: A cada 2 minutos
    const job2 = cron.schedule('*/2 * * * *', () => {
      console.log('✅ Job 2 executado!');
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Job 3: Às 00:00 todos os dias
    const job3 = cron.schedule('0 0 * * *', () => {
      console.log('✅ Job 3 executado!');
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set('job1', job1);
    this.jobs.set('job2', job2);
    this.jobs.set('job3', job3);
    
    console.log(`✅ ${this.jobs.size} jobs criados`);
  }

  // Método getNextExecutionTime idêntico ao original
  getNextExecutionTime() {
    console.log('🔍 [getNextExecutionTime] Calculando próxima execução...');
    
    if (this.jobs.size === 0) {
      console.log('🔍 [getNextExecutionTime] Nenhum job encontrado, retornando null');
      return null;
    }
    
    const now = new Date();
    let nextTime = null;
    
    console.log(`🔍 [getNextExecutionTime] Data atual: ${now.toISOString()}`);
    console.log(`🔍 [getNextExecutionTime] Total de jobs para verificar: ${this.jobs.size}`);
    
    for (const [name, job] of this.jobs) {
      console.log(`🔍 [getNextExecutionTime] Verificando job: ${name}`);
      
      // Verificar se o job tem o método nextDate
      console.log(`🔍 [getNextExecutionTime] Job ${name} - typeof job.nextDate: ${typeof job.nextDate}`);
      console.log(`🔍 [getNextExecutionTime] Job ${name} - job.nextDate: ${job.nextDate}`);
      
      if (job.nextDate) {
        try {
          const next = job.nextDate();
          console.log(`🔍 [getNextExecutionTime] Job ${name} - nextDate(): ${next ? next.toISOString() : 'null'}`);
          
          if (next && next instanceof Date && !isNaN(next.getTime())) {
            if (!nextTime || next < nextTime) {
              nextTime = next;
              console.log(`🔍 [getNextExecutionTime] Nova próxima execução encontrada: ${nextTime.toISOString()} (job: ${name})`);
            }
          } else {
            console.log(`🔍 [getNextExecutionTime] Job ${name} - nextDate() retornou valor inválido:`, next);
          }
        } catch (error) {
          console.error(`🔍 [getNextExecutionTime] Erro ao obter nextDate() do job ${name}:`, error);
        }
      } else {
        console.log(`🔍 [getNextExecutionTime] Job ${name} - não possui método nextDate`);
        
        // Tentar outras abordagens para obter a próxima execução
        console.log(`🔍 [getNextExecutionTime] Tentando alternativas para job ${name}...`);
        
        // Verificar se tem _scheduler
        if (job._scheduler) {
          console.log(`🔍 [getNextExecutionTime] Job ${name} tem _scheduler:`, job._scheduler);
          console.log(`🔍 [getNextExecutionTime] Job ${name} _scheduler.running:`, job._scheduler.running);
        }
        
        // Verificar outras propriedades do job
        console.log(`🔍 [getNextExecutionTime] Job ${name} propriedades:`, Object.getOwnPropertyNames(job));
        console.log(`🔍 [getNextExecutionTime] Job ${name} métodos:`, Object.getOwnPropertyNames(Object.getPrototypeOf(job)));
      }
    }
    
    console.log(`🔍 [getNextExecutionTime] Próxima execução calculada: ${nextTime ? nextTime.toISOString() : 'null'}`);
    return nextTime;
  }

  // Inicializar
  initialize() {
    console.log('🚀 Inicializando cron jobs de teste...');
    this.createTestJobs();
    this.isInitialized = true;
    this.lastExecution = new Date();
    console.log('✅ Cron jobs de teste inicializados!');
  }
}

// Testar
console.log('\n🧪 Criando instância de teste...');
const testCron = new TestVIPCronJobs();

console.log('\n🧪 Testando inicialização...');
testCron.initialize();

console.log('\n🧪 Testando getNextExecutionTime...');
try {
  const nextTime = testCron.getNextExecutionTime();
  console.log('✅ getNextExecutionTime executado com sucesso!');
  console.log('⏰ Próxima execução:', nextTime);
} catch (error) {
  console.error('❌ Erro em getNextExecutionTime:', error);
}

console.log('\n✅ Teste concluído!');
