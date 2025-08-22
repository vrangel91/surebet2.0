const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurebetAnalytics = sequelize.define('SurebetAnalytics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Tipo de análise
    analysis_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipo de análise realizada'
    },
    
    // Período da análise
    period_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Período em dias para a análise'
    },
    
    // Esporte filtrado (ou 'all' para todos)
    sport_filter: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'all',
      comment: 'Esporte filtrado para a análise'
    },
    
    // Dados da análise em JSON
    analysis_data: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Dados da análise em formato JSON'
    },
    
    // Estatísticas resumidas
    total_surebets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total de surebets analisadas'
    },
    
    unique_houses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de casas únicas'
    },
    
    unique_markets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de mercados únicos'
    },
    
    average_profit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Lucro médio das surebets'
    },
    
    // Timestamp da análise
    analyzed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data e hora da análise'
    },
    
    // Hash para verificar se os dados mudaram
    data_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Hash dos dados para verificar mudanças'
    }
    
  }, {
    tableName: 'surebet_analytics',
    timestamps: true,
    indexes: [
      {
        fields: ['analysis_type', 'period_days', 'sport_filter']
      },
      {
        fields: ['analyzed_at']
      },
      {
        fields: ['data_hash']
      }
    ],
    comment: 'Tabela para armazenar análises agregadas de surebets'
  });

  return SurebetAnalytics;
};
