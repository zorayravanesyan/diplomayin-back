import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  refreshTokenSchema,
} from '../utils/validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.get('/profile', authenticateToken, authController.getProfile);
router.patch('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);

export default router;
