const cron = require('node-cron');
const VIPService = require('./vipService');
const { User, UserVIP } = require('../models');
const { Op } = require('sequelize');

class VIPCronJobs {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
    this.lastExecution = null;
  }

  /**
   * Inicializar todos os cron jobs VIP
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Cron jobs VIP já estão inicializados');
      return { success: true, message: 'Cron jobs já estão inicializados' };
    }

    console.log('🚀 Inicializando cron jobs VIP...');

    try {
      // 1. Processar VIPs expirados diariamente às 00:00
      this.scheduleExpiredVIPsProcessing();
      
      // 2. Verificar VIPs que expiram em 7 dias (diariamente às 09:00)
      this.scheduleExpirationNotifications();
      
      // 3. Verificar VIPs que expiram em 1 dia (diariamente às 18:00)
      this.scheduleLastDayNotifications();
      
      // 4. Gerar relatório semanal de VIPs (domingo às 08:00)
      this.scheduleWeeklyReport();
      
      // 5. Limpeza de dados antigos (mensal, primeiro dia às 02:00)
      this.scheduleDataCleanup();

      this.isInitialized = true;
      this.lastExecution = new Date();
      
      console.log('✅ Cron jobs VIP inicializados com sucesso!');
      console.log(`📊 Total de cron jobs criados: ${this.jobs.size}`);
      
      return { 
        success: true, 
        message: 'Cron jobs inicializados com sucesso',
        totalJobs: this.jobs.size,
        jobs: Array.from(this.jobs.keys())
      };
      
    } catch (error) {
      console.error('❌ Erro ao inicializar cron jobs VIP:', error);
      throw error;
    }
  }

  /**
   * Agendar processamento de planos expirados (VIP e PREMIUM)
   */
  scheduleExpiredVIPsProcessing() {
    try {
      const job = cron.schedule('0 0 * * *', async () => {
        console.log('🔄 [CRON] Processando planos expirados (VIP e PREMIUM)...');
        
        try {
          const result = await VIPService.processExpiredVIPs();
          console.log(`✅ [CRON] ${result.expiredCount} planos expirados processados`);
          
          // Log detalhado para administradores
          if (result.expiredCount > 0) {
            console.log(`📊 [CRON] Relatório de expiração: ${result.expiredCount} usuários tiveram planos expirados`);
          }
          
        } catch (error) {
          console.error('❌ [CRON] Erro ao processar planos expirados:', error);
        }
      }, {
        scheduled: true,
        timezone: 'America/Sao_Paulo'
      });

      this.jobs.set('expiredVIPs', job);
      console.log('⏰ Cron job "Processar Planos Expirados" agendado (00:00 diário)');
    } catch (error) {
      console.error('❌ Erro ao agendar processamento de planos expirados:', error);
    }
  }

  /**
   * Agendar notificações de expiração em 7 dias
   */
  scheduleExpirationNotifications() {
    const job = cron.schedule('0 9 * * *', async () => {
      console.log('🔔 [CRON] Verificando VIPs que expiram em 7 dias...');
      
      try {
        const expiringDate = new Date();
        expiringDate.setDate(expiringDate.getDate() + 7);
        
        const expiringVIPs = await UserVIP.findAll({
          where: {
            status: 'ativo',
            data_fim: {
              [Op.between]: [new Date(), expiringDate]
            }
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
          }]
        });

        console.log(`📧 [CRON] ${expiringVIPs.length} VIPs expiram em 7 dias`);
        
        // Aqui você pode implementar o envio de emails/SMS
        for (const vip of expiringVIPs) {
          if (vip.user) {
            console.log(`📧 [CRON] Notificação enviada para ${vip.user.email} - VIP expira em ${vip.daysRemaining()} dias`);
            // await sendExpirationNotification(vip.user, vip);
          }
        }
        
      } catch (error) {
        console.error('❌ [CRON] Erro ao verificar VIPs que expiram:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set('expirationNotifications', job);
    console.log('⏰ Cron job "Notificações de Expiração" agendado (09:00 diário)');
  }

  /**
   * Agendar notificações de último dia
   */
  scheduleLastDayNotifications() {
    const job = cron.schedule('0 18 * * *', async () => {
      console.log('🚨 [CRON] Verificando VIPs que expiram amanhã...');
      
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        const lastDayVIPs = await UserVIP.findAll({
          where: {
            status: 'ativo',
            data_fim: {
              [Op.between]: [tomorrow, dayAfter]
            }
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
          }]
        });

        console.log(`🚨 [CRON] ${lastDayVIPs.length} VIPs expiram amanhã`);
        
        // Notificação urgente para último dia
        for (const vip of lastDayVIPs) {
          if (vip.user) {
            console.log(`🚨 [CRON] Notificação URGENTE enviada para ${vip.user.email} - VIP expira amanhã!`);
            // await sendUrgentExpirationNotification(vip.user, vip);
          }
        }
        
      } catch (error) {
        console.error('❌ [CRON] Erro ao verificar VIPs do último dia:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set('lastDayNotifications', job);
    console.log('⏰ Cron job "Notificações Último Dia" agendado (18:00 diário)');
  }

  /**
   * Agendar relatório semanal
   */
  scheduleWeeklyReport() {
    const job = cron.schedule('0 8 * * 0', async () => {
      console.log('📊 [CRON] Gerando relatório semanal de VIPs...');
      
      try {
        const stats = await VIPService.getVIPStatistics();
        const weeklyReport = await this.generateWeeklyReport();
        
        console.log('📊 [CRON] Relatório semanal gerado:', weeklyReport);
        
        // Aqui você pode enviar o relatório por email para administradores
        // await sendWeeklyReportToAdmins(weeklyReport);
        
      } catch (error) {
        console.error('❌ [CRON] Erro ao gerar relatório semanal:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set('weeklyReport', job);
    console.log('⏰ Cron job "Relatório Semanal" agendado (08:00 domingo)');
  }

  /**
   * Agendar limpeza de dados antigos
   */
  scheduleDataCleanup() {
    const job = cron.schedule('0 2 1 * *', async () => {
      console.log('🧹 [CRON] Executando limpeza de dados antigos...');
      
      try {
        // Limpar VIPs cancelados/expirados com mais de 1 ano
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const deletedCount = await UserVIP.destroy({
          where: {
            status: ['expirado', 'cancelado'],
            updated_at: {
              [Op.lt]: oneYearAgo
            }
          }
        });
        
        console.log(`🧹 [CRON] ${deletedCount} registros antigos removidos`);
        
      } catch (error) {
        console.error('❌ [CRON] Erro na limpeza de dados:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set('dataCleanup', job);
    console.log('⏰ Cron job "Limpeza de Dados" agendado (02:00 primeiro dia do mês)');
  }

  /**
   * Gerar relatório semanal
   */
  async generateWeeklyReport() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // VIPs ativados na semana
    const activatedThisWeek = await UserVIP.count({
      where: {
        created_at: {
          [Op.gte]: weekAgo
        }
      }
    });

    // VIPs expirados na semana
    const expiredThisWeek = await UserVIP.count({
      where: {
        status: 'expirado',
        data_fim: {
          [Op.gte]: weekAgo
        }
      }
    });

    // VIPs renovados na semana
    const renewedThisWeek = await UserVIP.count({
      where: {
        updated_at: {
          [Op.gte]: weekAgo
        },
        status: 'ativo'
      }
    });

    // Receita da semana
    const revenueThisWeek = await UserVIP.sum('amount', {
      where: {
        created_at: {
          [Op.gte]: weekAgo
        },
        amount: {
          [Op.not]: null
        }
      }
    });

    return {
      period: {
        start: weekAgo,
        end: now
      },
      metrics: {
        activated: activatedThisWeek,
        expired: expiredThisWeek,
        renewed: renewedThisWeek,
        revenue: revenueThisWeek || 0
      },
      generatedAt: now
    };
  }

  /**
   * Parar todos os cron jobs
   */
  stop() {
    console.log('🛑 Parando cron jobs VIP...');
    
    const stoppedJobs = [];
    for (const [name, job] of this.jobs) {
      job.stop();
      stoppedJobs.push(name);
      console.log(`⏹️ Cron job "${name}" parado`);
    }
    
    this.jobs.clear();
    this.isInitialized = false;
    console.log('✅ Todos os cron jobs VIP parados');
    
    return {
      success: true,
      message: 'Cron jobs parados com sucesso',
      stoppedJobs: stoppedJobs,
      totalStopped: stoppedJobs.length
    };
  }

  /**
   * Obter próxima execução dos cron jobs
   */
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
      
      // node-cron não possui nextDate, vamos calcular baseado no padrão cron
      try {
        // Obter o padrão cron do job
        const cronPattern = this.getCronPatternFromJob(job);
        if (cronPattern) {
          console.log(`🔍 [getNextExecutionTime] Job ${name} - padrão cron: ${cronPattern}`);
          
          // Calcular próxima execução baseada no padrão
          const nextExecution = this.calculateNextExecution(cronPattern, now);
          if (nextExecution) {
            console.log(`🔍 [getNextExecutionTime] Job ${name} - próxima execução calculada: ${nextExecution.toISOString()}`);
            
            if (!nextTime || nextExecution < nextTime) {
              nextTime = nextExecution;
              console.log(`🔍 [getNextExecutionTime] Nova próxima execução encontrada: ${nextTime.toISOString()} (job: ${name})`);
            }
          }
        } else {
          console.log(`🔍 [getNextExecutionTime] Job ${name} - não foi possível obter padrão cron`);
        }
      } catch (error) {
        console.error(`🔍 [getNextExecutionTime] Erro ao calcular próxima execução do job ${name}:`, error);
      }
    }
    
    console.log(`🔍 [getNextExecutionTime] Próxima execução calculada: ${nextTime ? nextTime.toISOString() : 'null'}`);
    return nextTime;
  }

  /**
   * Extrair padrão cron do job
   */
  getCronPatternFromJob(job) {
    try {
      // Tentar acessar o padrão cron através do _scheduler
      if (job._scheduler && job._scheduler.timeMatcher && job._scheduler.timeMatcher.pattern) {
        return job._scheduler.timeMatcher.pattern;
      }
      
      // Tentar outras propriedades
      if (job.options && job.options.cron) {
        return job.options.cron;
      }
      
      // Se não conseguir extrair, retornar padrões padrão baseados no nome do job
      return this.getDefaultCronPattern(job);
    } catch (error) {
      console.error('❌ Erro ao extrair padrão cron:', error);
      return null;
    }
  }

  /**
   * Obter padrão cron padrão baseado no nome do job
   */
  getDefaultCronPattern(job) {
    // Mapear nomes de jobs para padrões cron padrão
    const defaultPatterns = {
      'expiredVIPs': '0 0 * * *',           // 00:00 diário
      'expirationNotifications': '0 9 * * *', // 09:00 diário
      'lastDayNotifications': '0 18 * * *',   // 18:00 diário
      'weeklyReport': '0 8 * * 0',           // 08:00 domingo
      'dataCleanup': '0 2 1 * *'             // 02:00 primeiro dia do mês
    };
    
    // Tentar encontrar o nome do job no Map
    for (const [name, jobInstance] of this.jobs) {
      if (jobInstance === job) {
        return defaultPatterns[name] || null;
      }
    }
    
    return null;
  }

  /**
   * Calcular próxima execução baseada no padrão cron
   */
  calculateNextExecution(cronPattern, fromDate = new Date()) {
    try {
      // Implementação simplificada para padrões comuns
      const parts = cronPattern.split(' ');
      if (parts.length !== 5) {
        console.log(`🔍 [calculateNextExecution] Padrão inválido: ${cronPattern}`);
        return null;
      }
      
      const [minute, hour, day, month, weekday] = parts;
      
      // Para padrões diários simples (ex: "0 0 * * *")
      if (day === '*' && month === '*' && weekday === '*') {
        const next = new Date(fromDate);
        
        // Se já passou da hora hoje, agendar para amanhã
        if (next.getHours() > parseInt(hour) || 
            (next.getHours() === parseInt(hour) && next.getMinutes() >= parseInt(minute))) {
          next.setDate(next.getDate() + 1);
        }
        
        next.setHours(parseInt(hour), parseInt(minute), 0, 0);
        return next;
      }
      
      // Para padrões semanais (ex: "0 8 * * 0")
      if (day === '*' && month === '*' && weekday !== '*') {
        const next = new Date(fromDate);
        const targetWeekday = parseInt(weekday);
        
        // Calcular dias até o próximo dia da semana
        let daysToAdd = (targetWeekday - next.getDay() + 7) % 7;
        if (daysToAdd === 0 && (next.getHours() > parseInt(hour) || 
            (next.getHours() === parseInt(hour) && next.getMinutes() >= parseInt(minute)))) {
          daysToAdd = 7;
        }
        
        next.setDate(next.getDate() + daysToAdd);
        next.setHours(parseInt(hour), parseInt(minute), 0, 0);
        return next;
      }
      
      // Para padrões mensais (ex: "0 2 1 * *")
      if (day !== '*' && month === '*' && weekday === '*') {
        const next = new Date(fromDate);
        const targetDay = parseInt(day);
        
        // Se já passou do dia este mês, agendar para o próximo mês
        if (next.getDate() >= targetDay) {
          next.setMonth(next.getMonth() + 1);
        }
        
        next.setDate(targetDay);
        next.setHours(parseInt(hour), parseInt(minute), 0, 0);
        return next;
      }
      
      console.log(`🔍 [calculateNextExecution] Padrão não suportado: ${cronPattern}`);
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao calcular próxima execução:', error);
      return null;
    }
  }

  /**
   * Obter status dos cron jobs
   */
  getStatus() {
    console.log('🔍 [getStatus] Verificando status dos cron jobs...');
    console.log(`🔍 [getStatus] isInitialized: ${this.isInitialized}`);
    console.log(`🔍 [getStatus] Total de jobs: ${this.jobs.size}`);
    
    const status = {};
    
    for (const [name, job] of this.jobs) {
      console.log(`🔍 [getStatus] Verificando job: ${name}`);
      
      // Para node-cron, vamos usar uma lógica mais confiável:
      // Se o job foi criado e não foi explicitamente parado, ele está rodando
      // Vamos verificar se o job tem as propriedades necessárias para funcionar
      const hasValidJob = job && typeof job.stop === 'function';
      const nextDate = job.nextDate ? job.nextDate() : null;
      
      // Se o job foi criado e não foi parado, ele está rodando
      const isJobRunning = hasValidJob && this.isInitialized;
      
      console.log(`🔍 [getStatus] Job ${name}: hasValidJob=${hasValidJob}, isJobRunning=${isJobRunning}, nextDate=${nextDate}`);
      
      status[name] = {
        running: isJobRunning,
        nextDate: nextDate
      };
    }
    
    const overallStatus = {
      isRunning: this.isInitialized && this.jobs.size > 0,
      initialized: this.isInitialized,
      jobs: status,
      totalJobs: this.jobs.size,
      lastExecution: this.lastExecution || null,
      nextExecution: this.getNextExecutionTime()
    };
    
    console.log('🔍 [getStatus] Status final:', overallStatus);
    return overallStatus;
  }

  /**
   * Executar processamento manual de planos expirados (VIP e PREMIUM)
   */
  async processExpiredVIPsManual() {
    console.log('🔄 Executando processamento manual de planos expirados (VIP e PREMIUM)...');
    
    try {
      const result = await VIPService.processExpiredVIPs();
      console.log(`✅ ${result.expiredCount} planos expirados processados manualmente`);
      return result;
    } catch (error) {
      console.error('❌ Erro no processamento manual:', error);
      throw error;
    }
  }

  /**
   * Executar verificação manual de expirações
   */
  async checkExpirationsManual() {
    console.log('🔍 Executando verificação manual de expirações...');
    
    try {
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 7);
      
      const expiringVIPs = await UserVIP.findAll({
        where: {
          status: 'ativo',
          data_fim: {
            [Op.between]: [new Date(), expiringDate]
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }]
      });

      return {
        expiringCount: expiringVIPs.length,
        expiringVIPs: expiringVIPs.map(vip => ({
          id: vip.id,
          userId: vip.user_id,
          user: vip.user ? {
            id: vip.user.id,
            name: vip.user.username || `${vip.user.first_name || ''} ${vip.user.last_name || ''}`.trim(),
            email: vip.user.email
          } : null,
          planName: vip.plan_name,
          dataFim: vip.data_fim,
          daysRemaining: vip.daysRemaining()
        }))
      };
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      throw error;
    }
  }
}

// Instância singleton
const vipCronJobs = new VIPCronJobs();

module.exports = vipCronJobs;
