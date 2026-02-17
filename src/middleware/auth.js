import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
import { User } from '../models/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }
    next(error);
  }
}
