const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TicketMessage = sequelize.define('TicketMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_internal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
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
    }
  }, {
    tableName: 'ticket_messages',
    timestamps: false,
    underscored: true
  });

  TicketMessage.associate = (models) => {
    TicketMessage.belongsTo(models.Ticket, {
      foreignKey: 'ticket_id',
      as: 'ticket'
    });
    
    TicketMessage.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return TicketMessage;
};
