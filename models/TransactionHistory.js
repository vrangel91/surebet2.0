const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TransactionHistory = sequelize.define('TransactionHistory', {
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
    bookmaker_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookmaker_accounts',
        key: 'id'
      }
    },
    transaction_type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'adjustment'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'failed', 'cancelled'),
      defaultValue: 'completed'
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'transaction_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associações
  TransactionHistory.associate = (models) => {
    TransactionHistory.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    TransactionHistory.belongsTo(models.BookmakerAccount, {
      foreignKey: 'bookmaker_account_id',
      as: 'bookmakerAccount'
    });
  };

  // Hook para atualizar o saldo da conta após a transação
  TransactionHistory.addHook('afterCreate', async (transaction, options) => {
    // Removendo este hook temporariamente para evitar conflito com o ajuste manual
    // O saldo já está sendo atualizado no endpoint adjust-balance
    console.log('📝 Hook afterCreate executado para transação:', transaction.id);
  });

  return TransactionHistory;
};
