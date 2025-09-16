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
    },
    
    // Tipo de análise
    analysis_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'comprehensive',
      comment: 'Tipo de análise realizada'
    },
    
    // Período em dias
    period_days: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Período da análise em dias'
    },
    
    // Filtro de esporte
    sport_filter: {
      type: DataTypes.STRING(50),
      defaultValue: 'all',
      comment: 'Filtro de esporte aplicado'
    }
    
  }, {
    tableName: 'surebet_analytics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['date']
      },
      {
        fields: ['analysis_type']
      },
      {
        fields: ['period_days']
      },
      {
        fields: ['sport_filter']
      }
    ],
    comment: 'Tabela para armazenar análises de surebets por usuário'
  });

  return SurebetAnalytics;
};
