const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurebetStats = sequelize.define('SurebetStats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Identificador único da surebet
    surebet_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID único da surebet'
    },
    
    // Usuário que fez a aposta
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    // Conta da casa de apostas
    bookmaker_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bookmaker_accounts',
        key: 'id'
      }
    },
    
    // Lucro/Perda da surebet
    profit_loss: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Lucro ou perda da surebet'
    },
    
    // Valor da aposta
    bet_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Valor apostado'
    },
    
    // Odds da primeira aposta
    odds_1: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Odds da primeira aposta'
    },
    
    // Odds da segunda aposta
    odds_2: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Odds da segunda aposta'
    },
    
    // Status da surebet
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      comment: 'Status da surebet (pending, completed, cancelled)'
    },
    
    // Status da surebet
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
      comment: 'Status atual da surebet'
    },
    
    // Metadados adicionais
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dados adicionais em formato JSON'
    }
    
  }, {
    tableName: 'surebet_stats',
    timestamps: true,
    indexes: [
      {
        fields: ['surebet_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['bookmaker_account_id']
      },
      {
        fields: ['status']
      }
    ],
    comment: 'Tabela para armazenar estatísticas e dados de surebets'
  });

  return SurebetStats;
};
