const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 255]
      }
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
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    account_type: {
      type: DataTypes.ENUM('basic', 'premium', 'vip'),
      defaultValue: 'basic'
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    last_login: {
      type: DataTypes.DATE
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE
    },
    last_credit_consumption: {
      type: DataTypes.DATE
    }
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

  // Método para consumir crédito
  User.prototype.consumeCredit = async function() {
    if (this.credits > 0) {
      this.credits -= 1;
      this.last_credit_consumption = new Date();
      await this.save();
      return true;
    }
    return false;
  };

  // Método para adicionar créditos
  User.prototype.addCredits = async function(amount) {
    this.credits += amount;
    await this.save();
  };

  // Método para verificar se pode usar o sistema
  User.prototype.canUseSystem = function() {
    if (this.role === 'admin') return true;
    
    const today = new Date().toDateString();
    const lastConsumption = this.last_credit_consumption 
      ? new Date(this.last_credit_consumption).toDateString() 
      : null;
    
    return lastConsumption === today || this.credits > 0;
  };

  // Método para incrementar tentativas de login
  User.prototype.incrementLoginAttempts = async function() {
    this.login_attempts += 1;
    
    // Bloquear após 5 tentativas por 15 minutos
    if (this.login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await this.save();
  };

  // Método para resetar tentativas de login
  User.prototype.resetLoginAttempts = async function() {
    this.login_attempts = 0;
    this.locked_until = null;
    this.last_login = new Date();
    await this.save();
  };

  // Método para verificar se está bloqueado
  User.prototype.isLocked = function() {
    return this.locked_until && new Date() < this.locked_until;
  };

  return User;
};
