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
