const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Função para gerar código de referência único
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
    },
    // Campos para sistema de referências
    referral_code: {
      type: DataTypes.STRING(8),
      allowNull: true,
      unique: true
    },
    referred_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    commission_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
      allowNull: false,
      validate: {
        isIn: [['active', 'inactive']]
      }
    }
    // Colunas removidas pois não existem no banco surestake
    // role, credits, login_attempts, locked_until, last_credit_consumption
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
        
        // Gerar referral_code único automaticamente
        if (!user.referral_code) {
          user.referral_code = generateReferralCode();
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

  // Associações para referências
  User.associate = (models) => {
    // Usuário que foi referido por outro
    User.belongsTo(models.User, {
      foreignKey: 'referred_by',
      as: 'referrer'
    });
    
    // Usuários que foram referidos por este usuário
    User.hasMany(models.User, {
      foreignKey: 'referred_by',
      as: 'referredUsers'
    });
    
    // Notificações criadas pelo usuário
    User.hasMany(models.Notification, {
      foreignKey: 'created_by',
      as: 'createdNotifications'
    });
    
    // Plano do usuário
  };

  return User;
};
