'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userSettings = await queryInterface.describeTable('user_settings').catch(() => null);
    if (!userSettings || userSettings.age) {
      return;
    }

    await queryInterface.addColumn('user_settings', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const userSettings = await queryInterface.describeTable('user_settings').catch(() => null);
    if (!userSettings || !userSettings.age) {
      return;
    }

    await queryInterface.removeColumn('user_settings', 'age');
  },
};
