const { ForbiddenError } = require('../utils/errors.js');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

module.exports = { requireAdmin };
