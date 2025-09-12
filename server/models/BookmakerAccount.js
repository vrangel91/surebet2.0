const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookmakerAccount = sequelize.define('BookmakerAccount', {
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
    bookmaker_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'BRL'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'bookmaker_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Associação com o usuário
  BookmakerAccount.associate = (models) => {
    BookmakerAccount.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Método para adicionar saldo
  BookmakerAccount.prototype.addBalance = async function(amount) {
    if (amount > 0) {
      this.balance = parseFloat(this.balance) + parseFloat(amount);
      this.last_updated = new Date();
      await this.save();
      return true;
    }
    return false;
  };

  // Método para subtrair saldo (saque)
  BookmakerAccount.prototype.withdrawBalance = async function(amount) {
    if (amount > 0 && parseFloat(this.balance) >= parseFloat(amount)) {
      this.balance = parseFloat(this.balance) - parseFloat(amount);
      this.last_updated = new Date();
      await this.save();
      return true;
    }
    return false;
  };

  // Método para verificar se tem saldo suficiente
  BookmakerAccount.prototype.hasSufficientBalance = function(amount) {
    return parseFloat(this.balance) >= parseFloat(amount);
  };

  return BookmakerAccount;
};
