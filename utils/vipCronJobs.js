const cron = require('node-cron');
const VIPService = require('./vipService');
const { User, UserVIP } = require('../models');
const { Op } = require('sequelize');

class VIPCronJobs {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Inicializar todos os cron jobs VIP
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Cron jobs VIP já estão inicializados');
      return;
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
      console.log('✅ Cron jobs VIP inicializados com sucesso!');
      console.log(`📊 Total de cron jobs criados: ${this.jobs.size}`);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar cron jobs VIP:', error);
      throw error;
    }
  }

  /**
   * Agendar processamento de VIPs expirados
   */
  scheduleExpiredVIPsProcessing() {
    try {
      const job = cron.schedule('0 0 * * *', async () => {
        console.log('🔄 [CRON] Processando VIPs expirados...');
        
        try {
          const result = await VIPService.processExpiredVIPs();
          console.log(`✅ [CRON] ${result.expiredCount} VIPs expirados processados`);
          
          // Log detalhado para administradores
          if (result.expiredCount > 0) {
            console.log(`📊 [CRON] Relatório de expiração: ${result.expiredCount} usuários perderam acesso VIP`);
          }
          
        } catch (error) {
          console.error('❌ [CRON] Erro ao processar VIPs expirados:', error);
        }
      }, {
        scheduled: true,
        timezone: 'America/Sao_Paulo'
      });

      this.jobs.set('expiredVIPs', job);
      console.log('⏰ Cron job "Processar VIPs Expirados" agendado (00:00 diário)');
    } catch (error) {
      console.error('❌ Erro ao agendar processamento de VIPs expirados:', error);
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
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ Cron job "${name}" parado`);
    }
    
    this.jobs.clear();
    this.isInitialized = false;
    console.log('✅ Todos os cron jobs VIP parados');
  }

  /**
   * Obter status dos cron jobs
   */
  getStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate ? job.nextDate() : null
      };
    }
    
    return {
      initialized: this.isInitialized,
      jobs: status,
      totalJobs: this.jobs.size
    };
  }

  /**
   * Executar processamento manual de VIPs expirados
   */
  async processExpiredVIPsManual() {
    console.log('🔄 Executando processamento manual de VIPs expirados...');
    
    try {
      const result = await VIPService.processExpiredVIPs();
      console.log(`✅ ${result.expiredCount} VIPs expirados processados manualmente`);
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
