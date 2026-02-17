import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { JWT_CONFIG } from '../config/jwt.js';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors.js';
import { sequelize } from '../config/database.js';

export async function registerUser(userData) {
  return sequelize.transaction(async (t) => {
    // Check if email exists
    const existingEmail = await User.findOne({
      where: { email: userData.email },
      transaction: t,
    });
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username exists
    const existingUsername = await User.findOne({
      where: { username: userData.username },
      transaction: t,
    });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Create user
    const user = await User.create(userData, { transaction: t });

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

export async function loginUser(login_data, password) {
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

export async function refreshAccessToken(refreshToken) {
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

export async function getUserProfile(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user.toJSON();
}

export async function updateUserProfile(userId, updateData) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await user.update(updateData);
  return user.toJSON();
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
