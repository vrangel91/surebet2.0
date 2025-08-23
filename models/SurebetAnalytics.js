const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurebetAnalytics = sequelize.define('SurebetAnalytics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Usuário que fez a análise
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    // Data da análise
    date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da análise'
    },
    
    // Total de surebets
    total_surebets: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de surebets analisadas'
    },
    
    // Surebets bem-sucedidas
    successful_surebets: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de surebets bem-sucedidas'
    },
    
    // Lucro total
    total_profit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Lucro total das surebets'
    },
    
    // Total de apostas
    total_bets: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de apostas realizadas'
    },
    
    // ROI percentual
    roi_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Retorno sobre investimento em percentual'
    }
    
  }, {
    tableName: 'surebet_analytics',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['date']
      }
    ],
    comment: 'Tabela para armazenar análises de surebets por usuário'
  });

  return SurebetAnalytics;
};
