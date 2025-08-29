const { UserVIP, User } = require('../models');

class VIPService {
  /**
   * Ativar VIP para um usuário
   * @param {number} userId - ID do usuário
   * @param {Object} planData - Dados do plano
   * @returns {Object} - Resultado da ativação
   */
  static async activateVIP(userId, planData) {
    try {
      console.log(`🔄 Ativando VIP para usuário ${userId}...`);
      
      // Verificar se o usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Ativar VIP usando o modelo
      const vip = await UserVIP.activateVIP(userId, planData);
      
      // Atualizar status do usuário
      await user.update({
        is_vip: true,
        account_type: planData.plan_id
      });

      console.log(`✅ VIP ativado com sucesso para usuário ${userId}`);
      
      return {
        success: true,
        message: 'VIP ativado com sucesso',
        vip: {
          id: vip.id,
          planId: vip.plan_id,
          planName: vip.plan_name,
          planDays: vip.plan_days,
          dataInicio: vip.data_inicio,
          dataFim: vip.data_fim,
          status: vip.status
        }
      };
    } catch (error) {
      console.error('❌ Erro ao ativar VIP:', error);
      throw error;
    }
  }

  /**
   * Verificar status VIP do usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} - Status do VIP
   */
  static async checkVIPStatus(userId) {
    try {
      console.log(`🔍 Verificando status VIP para usuário ${userId}...`);
      
      const vipStatus = await UserVIP.getUserVIPStatus(userId);
      
      // Se não tem VIP, verificar se é admin
      if (!vipStatus.hasVIP) {
        const user = await User.findByPk(userId);
        if (user && user.is_admin) {
          return {
            success: true,
            hasVIP: true,
            vipStatus: {
              isAdmin: true,
              planId: 'admin',
              planName: 'Administrador',
              status: 'ativo'
            }
          };
        }
      }
      
      return {
        success: true,
        ...vipStatus
      };
    } catch (error) {
      console.error('❌ Erro ao verificar status VIP:', error);
      throw error;
    }
  }

  /**
   * Renovar VIP do usuário
   * @param {number} userId - ID do usuário
   * @param {Object} planData - Dados do plano de renovação
   * @returns {Object} - Resultado da renovação
   */
  static async renewVIP(userId, planData) {
    try {
      console.log(`🔄 Renovando VIP para usuário ${userId}...`);
      
      // Verificar se o usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar VIP ativo
      const activeVIP = await UserVIP.findOne({
        where: {
          user_id: userId,
          status: 'ativo'
        },
        order: [['data_fim', 'DESC']]
      });

      if (!activeVIP) {
        // Se não tem VIP ativo, criar novo
        return await this.activateVIP(userId, planData);
      }

      // Renovar VIP existente
      await activeVIP.renew(planData.plan_days, false);
      
      console.log(`✅ VIP renovado com sucesso para usuário ${userId}`);
      
      return {
        success: true,
        message: 'VIP renovado com sucesso',
        vip: {
          id: activeVIP.id,
          planId: activeVIP.plan_id,
          planName: activeVIP.plan_name,
          planDays: activeVIP.plan_days,
          dataInicio: activeVIP.data_inicio,
          dataFim: activeVIP.data_fim,
          status: activeVIP.status
        }
      };
    } catch (error) {
      console.error('❌ Erro ao renovar VIP:', error);
      throw error;
    }
  }

  /**
   * Cancelar VIP do usuário
   * @param {number} userId - ID do usuário
   * @param {string} reason - Motivo do cancelamento
   * @returns {Object} - Resultado do cancelamento
   */
  static async cancelVIP(userId, reason = 'Cancelamento manual') {
    try {
      console.log(`🔄 Cancelando VIP para usuário ${userId}...`);
      
      // Buscar VIP ativo
      const activeVIP = await UserVIP.findOne({
        where: {
          user_id: userId,
          status: 'ativo'
        },
        order: [['data_fim', 'DESC']]
      });

      if (!activeVIP) {
        throw new Error('Usuário não possui VIP ativo');
      }

      // Cancelar VIP
      await activeVIP.update({
        status: 'cancelado',
        notes: reason
      });

      // Atualizar status do usuário
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          is_vip: false,
          account_type: 'basic'
        });
      }

      console.log(`✅ VIP cancelado com sucesso para usuário ${userId}`);
      
      return {
        success: true,
        message: 'VIP cancelado com sucesso',
        vip: {
          id: activeVIP.id,
          status: 'cancelado',
          cancelledAt: new Date()
        }
      };
    } catch (error) {
      console.error('❌ Erro ao cancelar VIP:', error);
      throw error;
    }
  }

  /**
   * Obter histórico VIP do usuário
   * @param {number} userId - ID do usuário
   * @param {number} page - Página
   * @param {number} limit - Limite por página
   * @returns {Object} - Histórico do VIP
   */
  static async getVIPHistory(userId, page = 1, limit = 10) {
    try {
      console.log(`📋 Obtendo histórico VIP para usuário ${userId}...`);
      
      const history = await UserVIP.getUserVIPHistory(userId, page, limit);
      
      return {
        success: true,
        ...history
      };
    } catch (error) {
      console.error('❌ Erro ao obter histórico VIP:', error);
      throw error;
    }
  }

  /**
   * Verificar e processar planos expirados (VIP e PREMIUM)
   * @returns {Object} - Resultado do processamento
   */
  static async processExpiredVIPs() {
    try {
      console.log('🔄 Processando planos expirados (VIP e PREMIUM)...');
      
      const expiredCount = await UserVIP.checkExpiredVIPs();
      
      if (expiredCount > 0) {
        // Atualizar status dos usuários que tiveram planos expirados
        const expiredVIPs = await UserVIP.findAll({
          where: {
            status: 'expirado'
          },
          include: [{
            model: User,
            as: 'user'
          }]
        });

        for (const vip of expiredVIPs) {
          if (vip.user) {
            console.log(`🔄 Processando expiração para usuário ${vip.user.id} - Plano: ${vip.plan_name} (${vip.plan_id})`);
            
            // Verificar se o usuário tem outros planos ativos
            const activePlans = await UserVIP.findAll({
              where: {
                user_id: vip.user_id,
                status: 'ativo'
              }
            });

            if (activePlans.length === 0) {
              // Se não há planos ativos, fazer downgrade para BÁSICO
              await vip.user.update({
                is_vip: false,
                account_type: 'basic'
              });
              
              console.log(`✅ Usuário ${vip.user.id} movido para plano BÁSICO`);
            } else {
              // Se há outros planos ativos, manter o plano mais alto
              const highestPlan = activePlans.reduce((highest, plan) => {
                const planHierarchy = { 'basic': 0, 'premium': 1, 'vip': 2 };
                const currentLevel = planHierarchy[plan.plan_id] || 0;
                const highestLevel = planHierarchy[highest.plan_id] || 0;
                return currentLevel > highestLevel ? plan : highest;
              });
              
              await vip.user.update({
                is_vip: highestPlan.plan_id === 'vip',
                account_type: highestPlan.plan_id
              });
              
              console.log(`✅ Usuário ${vip.user.id} mantido no plano ${highestPlan.plan_name} (${highestPlan.plan_id})`);
            }
          }
        }
      }
      
      console.log(`✅ ${expiredCount} planos expirados processados`);
      
      return {
        success: true,
        expiredCount,
        message: `${expiredCount} planos expirados processados`
      };
    } catch (error) {
      console.error('❌ Erro ao processar planos expirados:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas VIP
   * @returns {Object} - Estatísticas do VIP
   */
  static async getVIPStatistics() {
    try {
      console.log('📊 Obtendo estatísticas VIP...');
      
      // Total de VIPs ativos
      const activeVIPs = await UserVIP.count({
        where: { status: 'ativo' }
      });

          // VIPs que expiram nos próximos 7 dias
    const { Op } = require('sequelize');
    const expiringSoon = await UserVIP.count({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.between]: [
            new Date(),
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ]
        }
      }
    });

          // VIPs expirados hoje
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const expiredToday = await UserVIP.count({
      where: {
        status: 'expirado',
        data_fim: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

          // Total de VIPs criados este mês
    const thisMonth = await UserVIP.count({
      where: {
        created_at: {
          [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    });

      // Total de usuários VIP
      const totalVIPUsers = await User.count({
        where: { is_vip: true }
      });

      return {
        success: true,
        statistics: {
          activeVIPs,
          expiringSoon,
          expiredToday,
          thisMonth,
          totalVIPUsers,
          totalVIPs: activeVIPs + expiringSoon + expiredToday
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas VIP:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário pode acessar funcionalidade VIP
   * @param {number} userId - ID do usuário
   * @returns {boolean} - Se pode acessar
   */
  static async canAccessVIP(userId) {
    try {
      const vipStatus = await this.checkVIPStatus(userId);
      return vipStatus.hasVIP;
    } catch (error) {
      console.error('❌ Erro ao verificar acesso VIP:', error);
      return false;
    }
  }

  /**
   * Migrar dados da tabela antiga user_vip_status para a nova user_vip
   * @returns {Object} - Resultado da migração
   */
  static async migrateFromOldTable() {
    try {
      console.log('🔄 Migrando dados da tabela antiga...');
      
      const { sequelize } = require('../models');
      
      // Verificar se a tabela antiga existe
      const tableExists = await sequelize.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_vip_status')",
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!tableExists[0].exists) {
        return {
          success: true,
          message: 'Tabela antiga não existe, migração não necessária'
        };
      }

      // Buscar dados da tabela antiga
      const oldVIPs = await sequelize.query(
        'SELECT * FROM user_vip_status WHERE status = \'active\'',
        { type: sequelize.QueryTypes.SELECT }
      );

      let migratedCount = 0;

      for (const oldVIP of oldVIPs) {
        try {
          // Verificar se já existe na nova tabela
          const existingVIP = await UserVIP.findOne({
            where: {
              user_id: oldVIP.user_id,
              status: 'ativo'
            }
          });

          if (!existingVIP) {
            // Criar novo registro na tabela nova
            await UserVIP.create({
              user_id: oldVIP.user_id,
              plan_id: oldVIP.plan_id || 'vip',
              plan_name: 'VIP Migrado',
              plan_days: oldVIP.plan_days || 30,
              data_inicio: oldVIP.activated_at || new Date(),
              data_fim: oldVIP.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: 'ativo',
              order_id: oldVIP.order_id,
              created_at: oldVIP.created_at || new Date(),
              updated_at: oldVIP.updated_at || new Date()
            });

            migratedCount++;
          }
        } catch (error) {
          console.error(`❌ Erro ao migrar VIP ${oldVIP.id}:`, error);
        }
      }

      console.log(`✅ ${migratedCount} VIPs migrados com sucesso`);
      
      return {
        success: true,
        migratedCount,
        message: `${migratedCount} VIPs migrados com sucesso`
      };
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  }
}

module.exports = VIPService;
