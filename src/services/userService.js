const { User } = require('../models/index.js');
const { ConflictError } = require('../utils/errors.js');
const { sequelize } = require('../config/database.js');

async function createTeacher(userData) {
  return sequelize.transaction(async (t) => {
    const existingEmail = await User.findOne({
      where: { email: userData.email },
      transaction: t,
    });
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await User.findOne({
      where: { username: userData.username },
      transaction: t,
    });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const user = await User.create(
      {
        ...userData,
        role: 'TICHER',
      },
      { transaction: t }
    );

    return user.toJSON();
  });
}

module.exports = {
  createTeacher,
};
