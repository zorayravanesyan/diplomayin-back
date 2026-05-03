<<<<<<< HEAD
import User from './User.js';
import ChatConversation from './ChatConversation.js';
import ChatMessage from './ChatMessage.js';

User.hasMany(ChatConversation, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ChatConversation.belongsTo(User, { foreignKey: 'user_id' });
ChatConversation.hasMany(ChatMessage, {
  as: 'messages',
  foreignKey: 'conversation_id',
  onDelete: 'CASCADE',
});
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversation_id' });

export { User, ChatConversation, ChatMessage };
=======
const User = require('./User.js');
const UserSettings = require('./UserSettings.js');
const StudentTeacher = require('./StudentTeacher.js');

User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Self-referential many-to-many: STUDENT -> TICHER(s)
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

module.exports = { User, UserSettings, StudentTeacher };
>>>>>>> 0e79217d6450744c0062f74289ded1a5fda20daf
