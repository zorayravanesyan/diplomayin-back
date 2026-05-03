'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminUsername || !adminPassword) {
      throw new Error(
        'Missing ADMIN_EMAIL / ADMIN_USERNAME / ADMIN_PASSWORD env vars for admin seeder.'
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { email: adminEmail },
      }
    );

    if (existing.length > 0) return;

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        username: adminUsername,
        password: passwordHash,
        refresh_token: null,
        gender: 'UNKNOWN',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await queryInterface.bulkDelete('users', { email: adminEmail });
  },
};

