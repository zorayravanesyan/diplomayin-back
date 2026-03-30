const { User } = require('../models/index.js');
const { ConflictError, ForbiddenError } = require('../utils/errors.js');
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
  async getTeachers() {
    const teachers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'username', 'gender'],
      where: { role: 'TICHER' },
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return teachers.map((t) => t.toJSON());
  },
  async getMyTeachers(user) {
    if (!user || user.role !== 'STUDENT') {
      throw new ForbiddenError('Only students can access their teachers');
    }

    const me = await User.findByPk(user.id, {
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'teachers',
          attributes: ['id', 'first_name', 'last_name', 'username', 'gender'],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [
        [{ model: User, as: 'teachers' }, 'last_name', 'ASC'],
        [{ model: User, as: 'teachers' }, 'first_name', 'ASC'],
        [{ model: User, as: 'teachers' }, 'id', 'ASC'],
      ],
    });

    return (me?.teachers || []).map((t) => t.toJSON());
  },
  async getMyStudents(user) {
    if (!user || user.role !== 'TICHER') {
      throw new ForbiddenError('Only teachers can access their students');
    }

    const me = await User.findByPk(user.id, {
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id', 'first_name', 'last_name', 'username', 'gender'],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [
        [{ model: User, as: 'students' }, 'last_name', 'ASC'],
        [{ model: User, as: 'students' }, 'first_name', 'ASC'],
        [{ model: User, as: 'students' }, 'id', 'ASC'],
      ],
    });

    return (me?.students || []).map((s) => s.toJSON());
  },
};
