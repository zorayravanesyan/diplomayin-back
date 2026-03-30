const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const UserSettings = sequelize.define(
  'UserSettings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    height_sm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    experience_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'user_settings',
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserSettings;
