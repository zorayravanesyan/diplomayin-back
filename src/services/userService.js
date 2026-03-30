const { User, StudentTeacher, UserSettings } = require('../models/index.js');
const {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require('../utils/errors.js');
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
 * Մեկ օգտատիրոջ լրիվ տվյալներ (առանց password), settings, teachers/students, teacher_ids
 */
async function getUserWithRelationsById(targetIdRaw, requester) {
  const targetId = Number(targetIdRaw);
  if (!Number.isInteger(targetId) || targetId < 1) {
    throw new NotFoundError('User not found');
  }

  const row = await User.findByPk(targetId, {
    attributes: { exclude: ['password', 'refresh_token'] },
    include: [{ model: UserSettings, as: 'settings', required: false }],
  });
  if (!row) {
    throw new NotFoundError('User not found');
  }

  await assertCanViewUserProfile(requester, targetId);

  let teachers = [];
  let students = [];

  if (row.role === 'STUDENT') {
    const sub = await User.findByPk(targetId, {
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
    teachers = (sub?.teachers || []).map((t) => t.toJSON());
  } else if (row.role === 'TICHER') {
    const sub = await User.findByPk(targetId, {
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
    students = (sub?.students || []).map((s) => s.toJSON());
  }

  const plain = row.toJSON();
  const settingsRaw = plain.settings;
  const settings = settingsRaw
    ? {
        weight_kg: settingsRaw.weight_kg,
        height_sm: settingsRaw.height_sm,
        experience_months: settingsRaw.experience_months,
      }
    : null;
  delete plain.settings;

  return {
    ...plain,
    settings,
    teachers,
    students,
    teacher_ids: teachers.map((t) => t.id),
  };
}

async function updateUserByAdmin(targetIdRaw, body, requester) {
  if (!requester || requester.role !== 'ADMIN') {
    throw new ForbiddenError('Admin only');
  }

  const targetId = Number(targetIdRaw);
  if (!Number.isInteger(targetId) || targetId < 1) {
    throw new NotFoundError('User not found');
  }

  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(targetId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'STUDENT') {
      const tids = body.teacher_ids;
      if (!Array.isArray(tids) || tids.length < 1) {
        throw new ValidationError('Աշակերտի դեպքում պարտադիր է teacher_ids', [
          { field: 'teacher_ids', message: 'Ընտրեք առնվազն մեկ ուսուցիչ' },
        ]);
      }
      const uniqueTeacherIds = [...new Set(tids)];
      const teacherRows = await User.findAll({
        attributes: ['id'],
        where: { id: uniqueTeacherIds, role: 'TICHER' },
        transaction: t,
      });
      if (teacherRows.length !== uniqueTeacherIds.length) {
        const found = new Set(teacherRows.map((x) => x.id));
        const missingTeacherIds = uniqueTeacherIds.filter((id) => !found.has(id));
        throw new ValidationError('Անվավեր teacher_ids', [
          {
            field: 'teacher_ids',
            message: 'Որոշ ուսուցիչներ գոյություն չունեն',
            missingTeacherIds,
          },
        ]);
      }
      await StudentTeacher.destroy({ where: { student_id: targetId }, transaction: t });
      await StudentTeacher.bulkCreate(
        uniqueTeacherIds.map((teacher_id) => ({
          student_id: targetId,
          teacher_id,
        })),
        { transaction: t }
      );
    } else if (body.teacher_ids !== undefined) {
      throw new ValidationError('teacher_ids թույլատրված է միայն աշակերտի համար', [
        { field: 'teacher_ids', message: 'Invalid field for this user role' },
      ]);
    }

    const { teacher_ids: _tid, settings: settingsBody, password, ...rest } = body;
    const patch = {};
    ['first_name', 'last_name', 'email', 'username', 'gender'].forEach((k) => {
      if (rest[k] !== undefined) patch[k] = rest[k];
    });
    if (password) {
      patch.password = password;
    }

    if (patch.email !== undefined && patch.email !== user.email) {
      const ex = await User.findOne({ where: { email: patch.email }, transaction: t });
      if (ex) {
        throw new ConflictError('Email already registered');
      }
    }
    if (patch.username !== undefined && patch.username !== user.username) {
      const ex = await User.findOne({ where: { username: patch.username }, transaction: t });
      if (ex) {
        throw new ConflictError('Username already taken');
      }
    }

    if (Object.keys(patch).length > 0) {
      await user.update(patch, { transaction: t });
    }

    if (settingsBody && typeof settingsBody === 'object') {
      const [settingsRow] = await UserSettings.findOrCreate({
        where: { user_id: targetId },
        defaults: {
          weight_kg: null,
          height_sm: null,
          experience_months: 0,
        },
        transaction: t,
      });
      const sPatch = {};
      if (settingsBody.weight_kg !== undefined) {
        sPatch.weight_kg = settingsBody.weight_kg;
      }
      if (settingsBody.height_sm !== undefined) {
        sPatch.height_sm = settingsBody.height_sm;
      }
      if (settingsBody.experience_months !== undefined) {
        sPatch.experience_months = settingsBody.experience_months;
      }
      if (Object.keys(sPatch).length > 0) {
        await settingsRow.update(sPatch, { transaction: t });
      }
    }
  });

  return getUserWithRelationsById(targetId, requester);
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
  updateUserByAdmin,

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
