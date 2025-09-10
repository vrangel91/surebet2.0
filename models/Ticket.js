const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
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
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'closed'),
      defaultValue: 'open',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tickets',
    timestamps: false,
    underscored: true
  });

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Ticket.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignedTo'
    });
    
    Ticket.hasMany(models.TicketMessage, {
      foreignKey: 'ticket_id',
      as: 'messages'
    });
  };

  return Ticket;
};
