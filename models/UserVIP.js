const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserVIP = sequelize.define('UserVIP', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    plan_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'ID do plano (basic, premium, vip)'
    },
    plan_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do plano'
    },
    plan_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duração do plano em dias'
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data/hora da ativação do VIP'
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data/hora de expiração do VIP (calculada automaticamente)'
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'expirado', 'cancelado'),
      allowNull: false,
      defaultValue: 'ativo',
      comment: 'Status do VIP'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do pedido relacionado'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Método de pagamento'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Valor pago'
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se o VIP deve renovar automaticamente'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o VIP'
    }
  }, {
    tableName: 'user_vip',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_vip_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_user_vip_status',
        fields: ['status']
      },
      {
        name: 'idx_user_vip_data_fim',
        fields: ['data_fim']
      },
      {
        name: 'idx_user_vip_plan_id',
        fields: ['plan_id']
      }
    ],
    hooks: {
      beforeCreate: async (userVIP) => {
        // Calcular data_fim automaticamente se não fornecida
        if (!userVIP.data_fim && userVIP.data_inicio && userVIP.plan_days) {
          userVIP.data_fim = new Date(userVIP.data_inicio.getTime() + (userVIP.plan_days * 24 * 60 * 60 * 1000));
        }
      },
      beforeUpdate: async (userVIP) => {
        // Verificar se o VIP expirou
        if (userVIP.status === 'ativo' && userVIP.data_fim && new Date() > userVIP.data_fim) {
          userVIP.status = 'expirado';
        }
      }
    }
  });

  // Método para verificar se o VIP está ativo
  UserVIP.prototype.isActive = function() {
    return this.status === 'ativo' && new Date() <= this.data_fim;
  };

  // Método para verificar se o VIP expirou
  UserVIP.prototype.isExpired = function() {
    return new Date() > this.data_fim;
  };

  // Método para calcular dias restantes
  UserVIP.prototype.daysRemaining = function() {
    if (this.isExpired()) return 0;
    const now = new Date();
    const diffTime = this.data_fim - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Método para renovar VIP
  UserVIP.prototype.renew = async function(planDays, startFromNow = false) {
    const newStartDate = startFromNow ? new Date() : this.data_fim;
    this.data_inicio = newStartDate;
    this.plan_days += planDays;
    this.data_fim = new Date(newStartDate.getTime() + (this.plan_days * 24 * 60 * 60 * 1000));
    this.status = 'ativo';
    await this.save();
  };

  // Método estático para verificar e atualizar VIPs expirados
  UserVIP.checkExpiredVIPs = async function() {
    const { Op } = require('sequelize');
    const now = new Date();
    const expiredVIPs = await UserVIP.findAll({
      where: {
        status: 'ativo',
        data_fim: {
          [Op.lt]: now
        }
      }
    });

    for (const vip of expiredVIPs) {
      vip.status = 'expirado';
      await vip.save();
    }

    return expiredVIPs.length;
  };

  // Método estático para ativar VIP
  UserVIP.activateVIP = async function(userId, planData) {
    const {
      plan_id,
      plan_name,
      plan_days,
      order_id = null,
      payment_method = null,
      amount = null,
      auto_renew = false,
      notes = null
    } = planData;

    // Verificar se usuário já tem VIP ativo
    const existingVIP = await UserVIP.findOne({
      where: {
        user_id: userId,
        status: 'ativo'
      },
      order: [['data_fim', 'DESC']]
    });

    if (existingVIP) {
      // Renovar VIP existente
      await existingVIP.renew(plan_days, false); // Adicionar dias a partir da data_fim atual
      return existingVIP;
    } else {
      // Criar novo VIP
      const data_inicio = new Date();
      const data_fim = new Date(data_inicio.getTime() + (plan_days * 24 * 60 * 60 * 1000));

      return await UserVIP.create({
        user_id: userId,
        plan_id,
        plan_name,
        plan_days,
        data_inicio,
        data_fim,
        status: 'ativo',
        order_id,
        payment_method,
        amount,
        auto_renew,
        notes
      });
    }
  };

  // Método estático para obter status VIP do usuário
  UserVIP.getUserVIPStatus = async function(userId) {
    const vip = await UserVIP.findOne({
      where: {
        user_id: userId,
        status: 'ativo'
      },
      order: [['data_fim', 'DESC']]
    });

    if (!vip) {
      return {
        hasVIP: false,
        vipStatus: null
      };
    }

    const isExpired = vip.isExpired();
    const daysRemaining = vip.daysRemaining();

    return {
      hasVIP: !isExpired,
      vipStatus: {
        id: vip.id,
        planId: vip.plan_id,
        planName: vip.plan_name,
        planDays: vip.plan_days,
        dataInicio: vip.data_inicio,
        dataFim: vip.data_fim,
        daysRemaining: isExpired ? 0 : daysRemaining,
        isExpired: isExpired,
        status: vip.status,
        autoRenew: vip.auto_renew
      }
    };
  };

  // Método estático para obter histórico VIP do usuário
  UserVIP.getUserVIPHistory = async function(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await UserVIP.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      vipHistory: rows.map(vip => ({
        id: vip.id,
        planId: vip.plan_id,
        planName: vip.plan_name,
        planDays: vip.plan_days,
        dataInicio: vip.data_inicio,
        dataFim: vip.data_fim,
        status: vip.status,
        orderId: vip.order_id,
        paymentMethod: vip.payment_method,
        amount: vip.amount,
        createdAt: vip.created_at
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  };

  return UserVIP;
};
