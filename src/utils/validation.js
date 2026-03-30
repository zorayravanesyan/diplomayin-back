const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
});

/** Ադմին POST /api/users/teachers — նույն դաշտերը, ինչ register */
const createTeacherSchema = registerSchema;

const loginSchema = Joi.object({
  login_data: Joi.string().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().min(1).max(100),
  weight_kg: Joi.number().positive().allow(null),
  height_sm: Joi.number().positive().allow(null),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN'),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      });
    }

    req.body = value;
    next();
  };
}

module.exports = {
  registerSchema,
  createTeacherSchema,
  loginSchema,
  updateProfileSchema,
  refreshTokenSchema,
  validate,
};
