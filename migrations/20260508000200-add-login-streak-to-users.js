'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users').catch(() => null);
    if (!users) {
      return;
    }

    if (!users.login_streak_count) {
      await queryInterface.addColumn('users', 'login_streak_count', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!users.last_login_date) {
      await queryInterface.addColumn('users', 'last_login_date', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const users = await queryInterface.describeTable('users').catch(() => null);
    if (!users) {
      return;
    }

    if (users.last_login_date) {
      await queryInterface.removeColumn('users', 'last_login_date');
    }

    if (users.login_streak_count) {
      await queryInterface.removeColumn('users', 'login_streak_count');
    }
  },
};
