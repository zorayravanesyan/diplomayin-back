const express = require('express');
const usersController = require('../controllers/usersController.js');
const { authenticateToken } = require('../middleware/auth.js');
const { requireAdmin } = require('../middleware/requireAdmin.js');
const { validate, createTeacherSchema } = require('../utils/validation.js');

const router = express.Router();

// Public: list teachers
router.get('/teachers', usersController.getTeachers);

// Authenticated: my relations
router.get('/me/teachers', authenticateToken, usersController.getMyTeachers);
router.get('/me/students', authenticateToken, usersController.getMyStudents);

router.post(
  '/teachers',
  authenticateToken,
  requireAdmin,
  validate(createTeacherSchema),
  usersController.createTeacher
);

module.exports = router;
