'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'chat_conversations',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          title: {
            type: Sequelize.STRING(120),
            allowNull: true,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'chat_conversations',
        ['user_id', 'updated_at'],
        {
          name: 'chat_conversations_user_id_updated_at',
          transaction,
        }
      );

      await queryInterface.createTable(
        'chat_messages',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          conversation_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'chat_conversations', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          role: {
            type: Sequelize.ENUM('user', 'assistant', 'system'),
            allowNull: false,
          },
          content: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          tokens: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'chat_messages',
        ['conversation_id', 'created_at'],
        {
          name: 'chat_messages_conversation_created_at',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        'chat_messages',
        'chat_messages_conversation_created_at',
        { transaction }
      );
      await queryInterface.dropTable('chat_messages', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_chat_messages_role";',
        { transaction }
      );

      await queryInterface.removeIndex(
        'chat_conversations',
        'chat_conversations_user_id_updated_at',
        { transaction }
      );
      await queryInterface.dropTable('chat_conversations', { transaction });
    });
  },
};
