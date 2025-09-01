const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User')(sequelize);
const UserSession = require('./UserSession')(sequelize);
const UserVIP = require('./UserVIP')(sequelize);
const BookmakerAccount = require('./BookmakerAccount')(sequelize);
const TransactionHistory = require('./TransactionHistory')(sequelize);
const SurebetStats = require('./SurebetStats')(sequelize);
const SurebetAnalytics = require('./SurebetAnalytics')(sequelize);
const Ticket = require('./Ticket')(sequelize);
const TicketMessage = require('./TicketMessage')(sequelize);

// Definir associações
User.hasMany(UserSession, {
  foreignKey: 'user_id',
  as: 'sessions'
});

UserSession.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Associações para VIP
User.hasMany(UserVIP, {
  foreignKey: 'user_id',
  as: 'vipSubscriptions'
});

User.hasMany(UserVIP, {
  foreignKey: 'user_id',
  as: 'vipPlans'
});

UserVIP.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Associações para contas de casas de apostas
User.hasMany(BookmakerAccount, {
  foreignKey: 'user_id',
  as: 'bookmakerAccounts'
});

BookmakerAccount.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Associações para histórico de transações
User.hasMany(TransactionHistory, {
  foreignKey: 'user_id',
  as: 'transactions'
});

BookmakerAccount.hasMany(TransactionHistory, {
  foreignKey: 'bookmaker_account_id',
  as: 'transactions'
});

TransactionHistory.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

TransactionHistory.belongsTo(BookmakerAccount, {
  foreignKey: 'bookmaker_account_id',
  as: 'bookmakerAccount'
});

// Associações para tickets
User.hasMany(Ticket, {
  foreignKey: 'user_id',
  as: 'tickets'
});

Ticket.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Ticket.hasMany(TicketMessage, {
  foreignKey: 'ticket_id',
  as: 'messages'
});

TicketMessage.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
});

TicketMessage.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Função para sincronizar modelos com o banco
async function syncModels() {
  try {
    // Usar force: false para não alterar tabelas existentes
    // Usar alter: false para não modificar estrutura existente
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos sincronizados com o banco de dados');
  } catch (error) {
    // Se houver erro de índice duplicado, apenas logar e continuar
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('já existe')) {
      console.log('⚠️ Alguns índices já existem, continuando...');
    } else {
      console.error('❌ Erro ao sincronizar modelos:', error);
      throw error;
    }
  }
}

module.exports = {
  sequelize,
  User,
  UserSession,
  UserVIP,
  BookmakerAccount,
  TransactionHistory,
  SurebetStats,
  SurebetAnalytics,
  Ticket,
  TicketMessage,
  syncModels
};
