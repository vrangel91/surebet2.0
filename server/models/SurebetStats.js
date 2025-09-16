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
    
    // Lucro/Perda da surebet (campo antigo)
    profit_loss: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Lucro ou perda da surebet (campo legado)'
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
    
    // Metadados adicionais
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dados adicionais em formato JSON'
    },
    
    // NOVOS CAMPOS ADICIONADOS
    // Casa de apostas
    house: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nome da casa de apostas'
    },
    
    // Mercado da aposta
    market: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Tipo de mercado da aposta'
    },
    
    // Partida/Evento
    match: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Nome da partida ou evento'
    },
    
    // Lucro (novo campo)
    profit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Lucro da surebet'
    },
    
    // Data da partida
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data da partida'
    },
    
    // Hora da partida
    hour: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Hora da partida (0-23)'
    },
    
    // Esporte
    sport: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de esporte'
    },
    
    // Período da partida
    period: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Período da partida (1H, 2H, etc)'
    },
    
    // Minutos da partida
    minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Minutos da partida'
    },
    
    // Âncora 1
    anchorh1: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Primeira âncora da surebet'
    },
    
    // Âncora 2
    anchorh2: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Segunda âncora da surebet'
    },
    
    // Chance de sucesso
    chance: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Chance de sucesso da surebet (%)'
    }
    
  }, {
    tableName: 'surebet_stats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
      }
    ],
    comment: 'Tabela para armazenar estatísticas e dados de surebets'
  });

  return SurebetStats;
};
