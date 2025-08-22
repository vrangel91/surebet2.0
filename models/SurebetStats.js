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
    
    // Casa de aposta
    house: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nome da casa de aposta'
    },
    
    // Mercado da aposta
    market: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipo de mercado (ex: Resultado Final, Over/Under)'
    },
    
    // Partida ou evento
    match: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nome da partida ou evento esportivo'
    },
    
    // Lucro da surebet
    profit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Lucro em reais da surebet'
    },
    
    // Data da surebet
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da surebet'
    },
    
    // Hora da surebet
    hour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Hora da surebet (0-23)'
    },
    
    // Esporte
    sport: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipo de esporte'
    },
    
    // Período da partida
    period: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Período da partida em minutos'
    },
    
    // Minutos decorridos
    minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Minutos decorridos desde o início'
    },
    
    // URLs de referência
    anchorh1: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Primeira URL de referência'
    },
    
    anchorh2: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Segunda URL de referência'
    },
    
    // Percentual de chance
    chance: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Percentual de chance da surebet'
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
        fields: ['house']
      },
      {
        fields: ['market']
      },
      {
        fields: ['sport']
      },
      {
        fields: ['date']
      },
      {
        fields: ['hour']
      },
      {
        fields: ['status']
      }
    ],
    comment: 'Tabela para armazenar estatísticas e dados de surebets'
  });

  return SurebetStats;
};
