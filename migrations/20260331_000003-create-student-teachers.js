'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_teachers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addConstraint('student_teachers', {
      type: 'unique',
      fields: ['student_id', 'teacher_id'],
      name: 'uq_student_teachers_student_id_teacher_id',
    });

    await queryInterface.addIndex('student_teachers', ['student_id'], {
      name: 'idx_student_teachers_student_id',
    });
    await queryInterface.addIndex('student_teachers', ['teacher_id'], {
      name: 'idx_student_teachers_teacher_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_teachers');
  },
};

