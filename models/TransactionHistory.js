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
    const { BookmakerAccount } = require('./index');
    
    try {
      const account = await BookmakerAccount.findByPk(transaction.bookmaker_account_id);
      if (account) {
        account.balance = transaction.balance_after;
        account.last_updated = new Date();
        await account.save();
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo da conta:', error);
    }
  });

  return TransactionHistory;
};
