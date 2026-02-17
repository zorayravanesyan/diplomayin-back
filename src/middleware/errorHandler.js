import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const statusCode = getStatusCode(err.code);
    return res.status(statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      code: 'CONFLICT',
      message: `${field} already exists`,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Database validation failed',
      details: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

function getStatusCode(code) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
  };
  return statusMap[code] || 500;
}
