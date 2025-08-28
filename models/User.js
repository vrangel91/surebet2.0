const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_vip: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    vip_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    account_type: {
      type: DataTypes.STRING,
      defaultValue: 'basic',
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
    // Colunas removidas pois não existem no banco surestake
    // role, credits, status, login_attempts, locked_until, last_credit_consumption
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      }
    }
  });

  // Método para verificar senha
  User.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Método para verificar se pode usar o sistema
  User.prototype.canUseSystem = function() {
    return this.is_admin || this.is_vip;
  };

  return User;
};
