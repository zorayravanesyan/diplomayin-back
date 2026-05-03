const User = require('./User.js');
const UserSettings = require('./UserSettings.js');
const StudentTeacher = require('./StudentTeacher.js');
const ChatConversation = require('./ChatConversation.js');
const ChatMessage = require('./ChatMessage.js');

User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsToMany(User, {
  as: 'teachers',
  through: StudentTeacher,
  foreignKey: 'student_id',
  otherKey: 'teacher_id',
});
User.belongsToMany(User, {
  as: 'students',
  through: StudentTeacher,
  foreignKey: 'teacher_id',
  otherKey: 'student_id',
});

User.hasMany(ChatConversation, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ChatConversation.belongsTo(User, { foreignKey: 'user_id' });
ChatConversation.hasMany(ChatMessage, {
  as: 'messages',
  foreignKey: 'conversation_id',
  onDelete: 'CASCADE',
});
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversation_id' });

module.exports = {
  User,
  UserSettings,
  StudentTeacher,
  ChatConversation,
  ChatMessage,
};
