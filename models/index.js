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
const Notification = require('./Notification');

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

// Associações para notificações
User.hasMany(Notification, {
  foreignKey: 'created_by',
  as: 'createdNotifications'
});

Notification.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Função para sincronizar modelos com o banco
async function syncModels() {
  try {
    // Primeiro, sincronizar todos os modelos existentes
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos existentes sincronizados com o banco de dados');
    
    // Depois, sincronizar especificamente o modelo Notification com alter: true
    // para garantir que a tabela e colunas sejam criadas corretamente
    try {
      await Notification.sync({ alter: true });
      console.log('✅ Modelo Notification sincronizado com alterações');
    } catch (notificationError) {
      console.error('⚠️ Erro ao sincronizar Notification:', notificationError.message);
      // Tentar criar a tabela do zero se houver erro
      try {
        await Notification.sync({ force: true });
        console.log('✅ Tabela Notification criada do zero');
      } catch (forceError) {
        console.error('❌ Erro ao criar tabela Notification:', forceError.message);
        throw forceError;
      }
    }
    
    console.log('✅ Todos os modelos sincronizados com sucesso');
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
  Notification,
  syncModels
};
