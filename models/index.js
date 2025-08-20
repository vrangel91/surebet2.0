const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User')(sequelize);
const UserSession = require('./UserSession')(sequelize);

// Definir associações
User.hasMany(UserSession, {
  foreignKey: 'user_id',
  as: 'sessions'
});

UserSession.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Função para sincronizar modelos com o banco
async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
  }
}



module.exports = {
  sequelize,
  User,
  UserSession,
  syncModels
};
