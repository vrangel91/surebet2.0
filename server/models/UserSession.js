const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
    // Colunas removidas pois não existem no banco surestake:
    // is_active, user_agent, ip_address
  }, {
    tableName: 'user_sessions',
    timestamps: false, // Desabilitar timestamps automáticos
    indexes: [
      {
        fields: ['token']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Método para verificar se a sessão é válida
  UserSession.prototype.isValid = function() {
    return new Date() < this.expires_at;
  };

  // Método para invalidar sessão (remover do banco)
  UserSession.prototype.invalidate = async function() {
    await this.destroy();
  };

  return UserSession;
};
