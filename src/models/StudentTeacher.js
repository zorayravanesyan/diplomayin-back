const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const StudentTeacher = sequelize.define(
  'StudentTeacher',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'student_teachers',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['student_id', 'teacher_id'] }],
  }
);

module.exports = StudentTeacher;

