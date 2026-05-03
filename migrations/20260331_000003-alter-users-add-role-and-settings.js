'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // If DB was previously created by sequelize.sync(), tables may exist already.
    // This migration makes schema compatible with the new structure.

    const users = await queryInterface.describeTable('users').catch(() => null);
    if (users) {
      if (!users.role) {
        // ensure enum type exists (Postgres)
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
              CREATE TYPE "enum_users_role" AS ENUM ('STUDENT', 'TICHER', 'ADMIN');
            END IF;
          END$$;
        `);

        await queryInterface.addColumn('users', 'role', {
          type: Sequelize.ENUM('STUDENT', 'TICHER', 'ADMIN'),
          allowNull: false,
          defaultValue: 'STUDENT',
        });
      }

      // Drop old columns if they exist (moved to user_settings)
      if (users.weight_kg) {
        await queryInterface.removeColumn('users', 'weight_kg');
      }
      if (users.height_sm) {
        await queryInterface.removeColumn('users', 'height_sm');
      }
    }

    const userSettings = await queryInterface.describeTable('user_settings').catch(() => null);
    if (!userSettings) {
      await queryInterface.createTable('user_settings', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        weight_kg: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        height_sm: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        experience_months: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
    }
  },

  async down(queryInterface) {
    // Down is intentionally conservative for safety.
    // If needed, drop user_settings and role column manually.
    await queryInterface.dropTable('user_settings').catch(() => {});
    await queryInterface.removeColumn('users', 'role').catch(() => {});
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";').catch(() => {});
  },
};

