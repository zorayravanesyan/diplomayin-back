const express = require('express');
const usersController = require('../controllers/usersController.js');
const { authenticateToken } = require('../middleware/auth.js');
const { requireAdmin } = require('../middleware/requireAdmin.js');
const { validate, createTeacherSchema } = require('../utils/validation.js');

const router = express.Router();

// Admin-only roster (place before dynamic segments if any)
router.get(
  '/admin/overview',
  authenticateToken,
  requireAdmin,
  usersController.getAdminOverview
);
router.get(
  '/admin/teachers',
  authenticateToken,
  requireAdmin,
  usersController.getAdminTeachersRoster
);
router.get(
  '/admin/students',
  authenticateToken,
  requireAdmin,
  usersController.getAdminStudentsRoster
);

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

// :id must stay last (after /teachers, /me/..., /admin/...)
router.get('/:id', authenticateToken, usersController.getUserById);

module.exports = router;
