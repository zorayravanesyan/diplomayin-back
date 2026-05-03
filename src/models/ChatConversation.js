import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ChatConversation = sequelize.define(
  'ChatConversation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
  },
  {
    tableName: 'chat_conversations',
    timestamps: true,
    underscored: true,
  }
);

export default ChatConversation;
