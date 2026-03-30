const userService = require('../services/userService.js');

async function createTeacher(req, res, next) {
  try {
    const user = await userService.createTeacher(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTeacher,
};
