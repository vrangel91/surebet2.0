const { UserVIP, User } = require('../models');
const { Op } = require('sequelize');

class VIPReports {
  /**
   * Gerar relatório de receita por período
   */
  static async generateRevenueReport(startDate, endDate, groupBy = 'day') {
    try {
      const whereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        },
        amount: {
          [Op.not]: null
        }
      };

      let groupClause;
      let dateFormat;

      switch (groupBy) {
        case 'day':
          groupClause = 'DATE(created_at)';
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          groupClause = 'DATE_TRUNC(\'week\', created_at)';
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          groupClause = 'DATE_TRUNC(\'month\', created_at)';
          dateFormat = 'YYYY-MM';
          break;
        default:
          groupClause = 'DATE(created_at)';
          dateFormat = 'YYYY-MM-DD';
      }

      const { sequelize } = require('../models');
      
      const revenueData = await sequelize.query(`
        SELECT 
          ${groupClause} as period,
          COUNT(*) as transactions,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_amount,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_vip 
        WHERE created_at BETWEEN :startDate AND :endDate 
        AND amount IS NOT NULL
        GROUP BY ${groupClause}
        ORDER BY period
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      // Calcular métricas adicionais
      const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
      const totalTransactions = revenueData.reduce((sum, item) => sum + parseInt(item.transactions), 0);
      const avgRevenue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        period: { startDate, endDate, groupBy },
        summary: {
          totalRevenue,
          totalTransactions,
          avgRevenue,
          uniqueUsers: revenueData.reduce((sum, item) => sum + parseInt(item.unique_users), 0)
        },
        data: revenueData,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de receita:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de conversão
   */
  static async generateConversionReport(startDate, endDate) {
    try {
      const { sequelize } = require('../models');

      // Total de usuários no período
      const totalUsers = await User.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Usuários que se tornaram VIP no período
      const vipConversions = await UserVIP.count({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        distinct: true,
        col: 'user_id'
      });

      // Usuários que se tornaram VIP pela primeira vez
      const firstTimeVIPs = await sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM user_vip 
        WHERE user_id IN (
          SELECT user_id 
          FROM user_vip 
          WHERE created_at BETWEEN :startDate AND :endDate
        )
        AND created_at = (
          SELECT MIN(created_at) 
          FROM user_vip v2 
          WHERE v2.user_id = user_vip.user_id
        )
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      // Renovações no período
      const renewals = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM user_vip 
        WHERE created_at BETWEEN :startDate AND :endDate
        AND user_id IN (
          SELECT user_id 
          FROM user_vip 
          WHERE created_at < :startDate
        )
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      const conversionRate = totalUsers > 0 ? (vipConversions / totalUsers) * 100 : 0;
      const firstTimeRate = totalUsers > 0 ? (firstTimeVIPs[0].count / totalUsers) * 100 : 0;

      return {
        period: { startDate, endDate },
        metrics: {
          totalUsers,
          vipConversions,
          firstTimeVIPs: firstTimeVIPs[0].count,
          renewals: renewals[0].count,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          firstTimeRate: parseFloat(firstTimeRate.toFixed(2))
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de conversão:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de retenção
   */
  static async generateRetentionReport(startDate, endDate) {
    try {
      const { sequelize } = require('../models');

      // Usuários que tiveram VIP expirado no período
      const expiredVIPs = await UserVIP.count({
        where: {
          data_fim: {
            [Op.between]: [startDate, endDate]
          },
          status: 'expirado'
        },
        distinct: true,
        col: 'user_id'
      });

      // Usuários que renovaram após expiração
      const renewedAfterExpiry = await sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM user_vip 
        WHERE user_id IN (
          SELECT user_id 
          FROM user_vip 
          WHERE data_fim BETWEEN :startDate AND :endDate 
          AND status = 'expirado'
        )
        AND created_at > (
          SELECT MAX(data_fim) 
          FROM user_vip v2 
          WHERE v2.user_id = user_vip.user_id 
          AND v2.status = 'expirado'
        )
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      // Usuários que renovaram antes da expiração
      const renewedBeforeExpiry = await sequelize.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM user_vip 
        WHERE user_id IN (
          SELECT user_id 
          FROM user_vip 
          WHERE data_fim BETWEEN :startDate AND :endDate 
          AND status = 'ativo'
        )
        AND created_at > (
          SELECT MAX(created_at) 
          FROM user_vip v2 
          WHERE v2.user_id = user_vip.user_id 
          AND v2.created_at < :startDate
        )
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      const totalExpired = expiredVIPs;
      const totalRetained = renewedAfterExpiry[0].count + renewedBeforeExpiry[0].count;
      const retentionRate = totalExpired > 0 ? (totalRetained / totalExpired) * 100 : 0;

      return {
        period: { startDate, endDate },
        metrics: {
          totalExpired,
          renewedAfterExpiry: renewedAfterExpiry[0].count,
          renewedBeforeExpiry: renewedBeforeExpiry[0].count,
          totalRetained,
          retentionRate: parseFloat(retentionRate.toFixed(2))
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de retenção:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de planos
   */
  static async generatePlansReport(startDate, endDate) {
    try {
      const { sequelize } = require('../models');
      
      const plansData = await UserVIP.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'plan_id',
          'plan_name',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_activations'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
          [sequelize.fn('AVG', sequelize.col('amount')), 'avg_amount'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'unique_users']
        ],
        group: ['plan_id', 'plan_name'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
      });

      const totalActivations = plansData.reduce((sum, plan) => sum + parseInt(plan.dataValues.total_activations), 0);
      const totalRevenue = plansData.reduce((sum, plan) => sum + parseFloat(plan.dataValues.total_revenue || 0), 0);

      const plansWithPercentages = plansData.map(plan => {
        const activations = parseInt(plan.dataValues.total_activations);
        const revenue = parseFloat(plan.dataValues.total_revenue || 0);
        
        return {
          planId: plan.plan_id,
          planName: plan.plan_name,
          activations,
          revenue,
          avgAmount: parseFloat(plan.dataValues.avg_amount || 0),
          uniqueUsers: parseInt(plan.dataValues.unique_users),
          activationPercentage: totalActivations > 0 ? parseFloat(((activations / totalActivations) * 100).toFixed(2)) : 0,
          revenuePercentage: totalRevenue > 0 ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2)) : 0
        };
      });

      return {
        period: { startDate, endDate },
        summary: {
          totalActivations,
          totalRevenue,
          totalUniqueUsers: plansData.reduce((sum, plan) => sum + parseInt(plan.dataValues.unique_users), 0)
        },
        plans: plansWithPercentages,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de planos:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de métodos de pagamento
   */
  static async generatePaymentMethodsReport(startDate, endDate) {
    try {
      const { sequelize } = require('../models');
      
      const paymentData = await UserVIP.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          },
          payment_method: {
            [Op.not]: null
          }
        },
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_transactions'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
          [sequelize.fn('AVG', sequelize.col('amount')), 'avg_amount']
        ],
        group: ['payment_method'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
      });

      const totalTransactions = paymentData.reduce((sum, method) => sum + parseInt(method.dataValues.total_transactions), 0);
      const totalRevenue = paymentData.reduce((sum, method) => sum + parseFloat(method.dataValues.total_revenue || 0), 0);

      const methodsWithPercentages = paymentData.map(method => {
        const transactions = parseInt(method.dataValues.total_transactions);
        const revenue = parseFloat(method.dataValues.total_revenue || 0);
        
        return {
          paymentMethod: method.payment_method,
          transactions,
          revenue,
          avgAmount: parseFloat(method.dataValues.avg_amount || 0),
          transactionPercentage: totalTransactions > 0 ? parseFloat(((transactions / totalTransactions) * 100).toFixed(2)) : 0,
          revenuePercentage: totalRevenue > 0 ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2)) : 0
        };
      });

      return {
        period: { startDate, endDate },
        summary: {
          totalTransactions,
          totalRevenue
        },
        methods: methodsWithPercentages,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de métodos de pagamento:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de churn (cancelamentos)
   */
  static async generateChurnReport(startDate, endDate) {
    try {
      // VIPs cancelados no período
      const cancelledVIPs = await UserVIP.count({
        where: {
          status: 'cancelado',
          updated_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        distinct: true,
        col: 'user_id'
      });

      // VIPs expirados no período
      const expiredVIPs = await UserVIP.count({
        where: {
          status: 'expirado',
          data_fim: {
            [Op.between]: [startDate, endDate]
          }
        },
        distinct: true,
        col: 'user_id'
      });

      // Total de VIPs ativos no início do período
      const activeVIPsAtStart = await UserVIP.count({
        where: {
          status: 'ativo',
          data_fim: {
            [Op.gt]: startDate
          }
        },
        distinct: true,
        col: 'user_id'
      });

      const totalChurn = cancelledVIPs + expiredVIPs;
      const churnRate = activeVIPsAtStart > 0 ? (totalChurn / activeVIPsAtStart) * 100 : 0;

      return {
        period: { startDate, endDate },
        metrics: {
          activeVIPsAtStart,
          cancelledVIPs,
          expiredVIPs,
          totalChurn,
          churnRate: parseFloat(churnRate.toFixed(2))
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de churn:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório completo consolidado
   */
  static async generateComprehensiveReport(startDate, endDate) {
    try {
      const [
        revenueReport,
        conversionReport,
        retentionReport,
        plansReport,
        paymentMethodsReport,
        churnReport
      ] = await Promise.all([
        this.generateRevenueReport(startDate, endDate, 'day'),
        this.generateConversionReport(startDate, endDate),
        this.generateRetentionReport(startDate, endDate),
        this.generatePlansReport(startDate, endDate),
        this.generatePaymentMethodsReport(startDate, endDate),
        this.generateChurnReport(startDate, endDate)
      ]);

      return {
        period: { startDate, endDate },
        reports: {
          revenue: revenueReport,
          conversion: conversionReport,
          retention: retentionReport,
          plans: plansReport,
          paymentMethods: paymentMethodsReport,
          churn: churnReport
        },
        summary: {
          totalRevenue: revenueReport.summary.totalRevenue,
          totalConversions: conversionReport.metrics.vipConversions,
          retentionRate: retentionReport.metrics.retentionRate,
          churnRate: churnReport.metrics.churnRate,
          avgRevenuePerUser: conversionReport.metrics.vipConversions > 0 
            ? revenueReport.summary.totalRevenue / conversionReport.metrics.vipConversions 
            : 0
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de tendências (comparação com período anterior)
   */
  static async generateTrendsReport(startDate, endDate) {
    try {
      const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const previousStartDate = new Date(startDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(startDate.getTime() - (24 * 60 * 60 * 1000));

      const [currentPeriod, previousPeriod] = await Promise.all([
        this.generateRevenueReport(startDate, endDate, 'day'),
        this.generateRevenueReport(previousStartDate, previousEndDate, 'day')
      ]);

      const revenueGrowth = previousPeriod.summary.totalRevenue > 0 
        ? ((currentPeriod.summary.totalRevenue - previousPeriod.summary.totalRevenue) / previousPeriod.summary.totalRevenue) * 100 
        : 0;

      const transactionGrowth = previousPeriod.summary.totalTransactions > 0 
        ? ((currentPeriod.summary.totalTransactions - previousPeriod.summary.totalTransactions) / previousPeriod.summary.totalTransactions) * 100 
        : 0;

      return {
        currentPeriod: { startDate, endDate },
        previousPeriod: { startDate: previousStartDate, endDate: previousEndDate },
        trends: {
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          transactionGrowth: parseFloat(transactionGrowth.toFixed(2)),
          avgRevenueGrowth: previousPeriod.summary.avgRevenue > 0 
            ? ((currentPeriod.summary.avgRevenue - previousPeriod.summary.avgRevenue) / previousPeriod.summary.avgRevenue) * 100 
            : 0
        },
        currentMetrics: currentPeriod.summary,
        previousMetrics: previousPeriod.summary,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de tendências:', error);
      throw error;
    }
  }
}

module.exports = VIPReports;
