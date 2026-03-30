const { User, StudentTeacher } = require('../models/index.js');
const { ConflictError, ForbiddenError, NotFoundError } = require('../utils/errors.js');
const { sequelize } = require('../config/database.js');

const ROSTER_ATTRIBUTES = ['id', 'first_name', 'last_name', 'username', 'gender'];
const ROSTER_ORDER = [
  ['last_name', 'ASC'],
  ['first_name', 'ASC'],
  ['id', 'ASC'],
];

async function findUsersByRole(role) {
  const rows = await User.findAll({
    attributes: ROSTER_ATTRIBUTES,
    where: { role },
    order: ROSTER_ORDER,
  });
  return rows.map((r) => r.toJSON());
}

async function assertCanViewUserProfile(requester, targetId) {
  if (requester.role === 'ADMIN' || requester.id === targetId) {
    return;
  }

  if (requester.role === 'TICHER') {
    const link = await StudentTeacher.findOne({
      where: { teacher_id: requester.id, student_id: targetId },
    });
    if (link) return;
    throw new ForbiddenError('Access denied');
  }

  if (requester.role === 'STUDENT') {
    const link = await StudentTeacher.findOne({
      where: { student_id: requester.id, teacher_id: targetId },
    });
    if (link) return;
    throw new ForbiddenError('Access denied');
  }

  throw new ForbiddenError('Access denied');
}

/**
 * Մեկ օգտատիրոջ քարտ՝ role-ին կապված teachers կամ students զանգվածով
 */
async function getUserWithRelationsById(targetIdRaw, requester) {
  const targetId = Number(targetIdRaw);
  if (!Number.isInteger(targetId) || targetId < 1) {
    throw new NotFoundError('User not found');
  }

  const base = await User.findByPk(targetId, {
    attributes: ['id', 'first_name', 'last_name', 'username', 'gender', 'role'],
  });
  if (!base) {
    throw new NotFoundError('User not found');
  }

  await assertCanViewUserProfile(requester, targetId);

  let teachers = [];
  let students = [];

  if (base.role === 'STUDENT') {
    const row = await User.findByPk(targetId, {
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'teachers',
          attributes: ROSTER_ATTRIBUTES,
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
    teachers = (row?.teachers || []).map((t) => t.toJSON());
  } else if (base.role === 'TICHER') {
    const row = await User.findByPk(targetId, {
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'students',
          attributes: ROSTER_ATTRIBUTES,
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
    students = (row?.students || []).map((s) => s.toJSON());
  }

  return {
    ...base.toJSON(),
    teachers,
    students,
  };
}

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
    return findUsersByRole('TICHER');
  },

  /** Ադմին — մեկ պատասխանում բոլոր ուսուցիչներն ու աշակերտները */
  async getAdminOverview() {
    const [teachers, students] = await Promise.all([
      findUsersByRole('TICHER'),
      findUsersByRole('STUDENT'),
    ]);
    return { teachers, students };
  },

  async getAdminTeachersRoster() {
    return findUsersByRole('TICHER');
  },

  async getAdminStudentsRoster() {
    return findUsersByRole('STUDENT');
  },

  getUserWithRelationsById,

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
