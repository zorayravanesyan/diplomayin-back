const userService = require('../services/userService.js');


module.exports = {
  async createTeacher(req, res, next) {
    try {
      const user = await userService.createTeacher(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async getTeachers(req, res, next) {
    try {
      const teachers = await userService.getTeachers();
      res.json({ teachers });
    } catch (error) {
      next(error);
    }
  },

  async getMyTeachers(req, res, next) {
    try {
      const teachers = await userService.getMyTeachers(req.user);
      res.json({ teachers });
    } catch (error) {
      next(error);
    }
  },

  async getMyStudents(req, res, next) {
    try {
      const students = await userService.getMyStudents(req.user);
      res.json({ students });
    } catch (error) {
      next(error);
    }
  },

  async getAdminOverview(req, res, next) {
    try {
      const overview = await userService.getAdminOverview();
      res.json(overview);
    } catch (error) {
      next(error);
    }
  },

  async getAdminTeachersRoster(req, res, next) {
    try {
      const teachers = await userService.getAdminTeachersRoster();
      res.json({ teachers });
    } catch (error) {
      next(error);
    }
  },

  async getAdminStudentsRoster(req, res, next) {
    try {
      const students = await userService.getAdminStudentsRoster();
      res.json({ students });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const userPayload = await userService.getUserWithRelationsById(req.params.id, req.user);
      res.json({ user: userPayload });
    } catch (error) {
      next(error);
    }
  },

  async patchUserById(req, res, next) {
    try {
      const userPayload = await userService.updateUserByAdmin(req.params.id, req.body, req.user);
      res.json({ user: userPayload });
    } catch (error) {
      next(error);
    }
  },
};
