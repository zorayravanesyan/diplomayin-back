const User = require('./User.js');
const UserSettings = require('./UserSettings.js');

User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, UserSettings };
