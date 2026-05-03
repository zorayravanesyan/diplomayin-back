const express = require('express');
const authController = require('../controllers/authController.js');
const { authenticateToken } = require('../middleware/auth.js');
const {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  refreshTokenSchema,
} = require('../utils/validation.js');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.get('/profile', authenticateToken, authController.getProfile);
router.patch('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
