const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Título da notificação'
  },
  
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Mensagem da notificação'
  },
  
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'update'),
    defaultValue: 'info',
    comment: 'Tipo da notificação'
  },
  
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    comment: 'Prioridade da notificação'
  },
  
  target_audience: {
    type: DataTypes.ENUM('all', 'vip', 'admin', 'specific'),
    defaultValue: 'all',
    comment: 'Público-alvo da notificação'
  },
  
  target_user_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'IDs específicos de usuários (quando target_audience = specific)'
  },
  
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se a notificação foi lida'
  },
  
  is_dismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se a notificação foi descartada'
  },
  
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração da notificação'
  },
  
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Data de envio da notificação'
  },
  
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de leitura da notificação'
  },
  
  dismissed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de descarte da notificação'
  },
  
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados adicionais da notificação (links, ações, etc.)'
  },
  
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do usuário que criou a notificação'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  indexes: [
    // Comentando índices temporariamente para evitar erros de sincronização
    // {
    //   fields: ['target_audience']
    // },
    // {
    //   fields: ['type']
    // },
    // {
    //   fields: ['priority']
    // },
    // {
    //   fields: ['is_read']
    // },
    // {
    //   fields: ['expires_at']
    // },
    // {
    //   fields: ['created_at']
    // }
  ]
});

// Métodos de instância
Notification.prototype.markAsRead = function() {
  this.is_read = true;
  this.read_at = new Date();
  return this.save();
};

Notification.prototype.dismiss = function() {
  this.is_dismissed = true;
  this.dismissed_at = new Date();
  return this.save();
};

Notification.prototype.isExpired = function() {
  if (!this.expires_at) return false;
  return new Date() > this.expires_at;
};

// Métodos estáticos
Notification.findActive = function() {
  return this.findAll({
    where: {
      is_dismissed: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    },
    order: [['created_at', 'DESC']]
  });
};

Notification.findForUser = function(userId, userType = 'basic') {
  // Método simplificado para evitar erros de SQL
  let whereClause = {
    is_dismissed: false,
    [Op.or]: [
      { expires_at: null },
      { expires_at: { [Op.gt]: new Date() } }
    ]
  };

  // Filtrar por público-alvo
  if (userType === 'admin') {
    whereClause.target_audience = { [Op.in]: ['all', 'admin'] };
  } else if (userType === 'vip') {
    whereClause.target_audience = { [Op.in]: ['all', 'vip'] };
  } else {
    whereClause.target_audience = 'all';
  }

  return this.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']]
  });
};

// Associações - Comentado temporariamente para evitar erros de SQL
// Notification.associate = (models) => {
//   Notification.belongsTo(models.User, {
//     foreignKey: 'created_by',
//     as: 'creator'
//   });
// };

module.exports = Notification;
