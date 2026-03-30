const express = require('express');
const usersController = require('../controllers/usersController.js');
const { authenticateToken } = require('../middleware/auth.js');
const { requireAdmin } = require('../middleware/requireAdmin.js');
const { validate, createTeacherSchema } = require('../utils/validation.js');

const router = express.Router();

router.post(
  '/teachers',
  authenticateToken,
  requireAdmin,
  validate(createTeacherSchema),
  usersController.createTeacher
);

module.exports = router;
