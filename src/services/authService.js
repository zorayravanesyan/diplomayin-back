const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, StudentTeacher, UserSettings } = require('../models/index.js');
const { JWT_CONFIG } = require('../config/jwt.js');
const { UnauthorizedError, NotFoundError, ConflictError, ValidationError } = require('../utils/errors.js');
const { sequelize } = require('../config/database.js');

async function registerUser(userData) {
  return sequelize.transaction(async (t) => {
    const { teacher_ids, ...userCreateData } = userData;

    // Check if email exists
    const existingEmail = await User.findOne({
      where: { email: userCreateData.email },
      transaction: t,
    });
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username exists
    const existingUsername = await User.findOne({
      where: { username: userCreateData.username },
      transaction: t,
    });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Validate teachers exist and are role=TICHER (single DB call)
    const uniqueTeacherIds = Array.from(new Set(teacher_ids || []));
    const teachers = await User.findAll({
      attributes: ['id'],
      where: { id: uniqueTeacherIds, role: 'TICHER' },
      transaction: t,
    });

    if (teachers.length !== uniqueTeacherIds.length) {
      const found = new Set(teachers.map((x) => x.id));
      const missingTeacherIds = uniqueTeacherIds.filter((id) => !found.has(id));
      throw new ValidationError('Invalid teacher_ids', [
        { field: 'teacher_ids', message: 'Some teachers do not exist', missingTeacherIds },
      ]);
    }

    // Create user
    const user = await User.create(userCreateData, { transaction: t });

    // Create relations (bulk insert)
    await StudentTeacher.bulkCreate(
      uniqueTeacherIds.map((teacherId) => ({
        student_id: user.id,
        teacher_id: teacherId,
      })),
      { transaction: t }
    );

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Update refresh token in DB
    await user.update({ refresh_token: tokens.refreshToken }, { transaction: t });

    return {
      user: user.toJSON(),
      ...tokens,
    };
  });
}

async function loginUser(login_data, password) {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: login_data },
        { username: login_data },
      ],
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate new tokens
  const tokens = generateTokens(user.id);

  // Update refresh token in DB
  await user.update({ refresh_token: tokens.refreshToken });

  return {
    user: user.toJSON(),
    ...tokens,
  };
}

async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.refreshTokenSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refresh_token !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user.id);
    return { accessToken };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw error;
  }
}

async function getUserProfile(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: UserSettings,
        as: 'settings',
        attributes: ['weight_kg', 'height_sm'],
        required: false,
      },
    ],
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user.toJSON();
}

async function updateUserProfile(userId, updateData) {
  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { weight_kg, height_sm, ...userFields } = updateData;
    const userPatch = {};
    ['first_name', 'last_name', 'gender'].forEach((field) => {
      if (userFields[field] !== undefined) {
        userPatch[field] = userFields[field];
      }
    });

    if (Object.keys(userPatch).length > 0) {
      await user.update(userPatch, { transaction: t });
    }

    const settingsPatch = {};
    if (weight_kg !== undefined) {
      settingsPatch.weight_kg = weight_kg;
    }
    if (height_sm !== undefined) {
      settingsPatch.height_sm = height_sm;
    }

    if (Object.keys(settingsPatch).length > 0) {
      const [settings] = await UserSettings.findOrCreate({
        where: { user_id: userId },
        defaults: {
          weight_kg: null,
          height_sm: null,
          experience_months: 0,
        },
        transaction: t,
      });
      await settings.update(settingsPatch, { transaction: t });
    }
  });

  return getUserProfile(userId);
}

function generateTokens(userId) {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_CONFIG.accessTokenSecret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_CONFIG.refreshTokenSecret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
  });
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
};
