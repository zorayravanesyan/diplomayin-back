import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true,
  }
);

export default ChatMessage;
