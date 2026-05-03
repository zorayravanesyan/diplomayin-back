const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

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

module.exports = ChatConversation;
