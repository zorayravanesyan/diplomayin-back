const authService = require('../services/authService.js');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { login_data, password } = req.body;
    const result = await authService.loginUser(login_data, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refreshAccessToken(refresh_token);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
};
