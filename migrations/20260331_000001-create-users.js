'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'UNKNOWN'),
        allowNull: false,
        defaultValue: 'UNKNOWN',
      },
      role: {
        type: Sequelize.ENUM('STUDENT', 'TICHER', 'ADMIN'),
        allowNull: false,
        defaultValue: 'STUDENT',
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');

    // Postgres enum cleanup
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_gender";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};
