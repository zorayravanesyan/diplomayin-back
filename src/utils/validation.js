const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
  teacher_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const createTeacherSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
  student_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const loginSchema = Joi.object({
  login_data: Joi.string().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().min(1).max(100),
  weight_kg: Joi.number().positive().allow(null),
  height_sm: Joi.number().positive().allow(null),
  age: Joi.number().integer().min(1).max(120).allow(null),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN'),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(4000).required(),
});

const createConversationSchema = Joi.object({
  title: Joi.string().trim().max(120).optional().allow(null, ''),
  first_message: Joi.string().trim().min(1).max(4000).optional(),
});

const adminUpdateUserSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().min(1).max(100),
  email: Joi.string().email(),
  username: Joi.string().alphanum().min(3).max(30),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN'),
  password: Joi.string().min(6),
  teacher_ids: Joi.array().items(Joi.number().integer().positive()),
  settings: Joi.object({
    weight_kg: Joi.number().positive().allow(null),
    height_sm: Joi.number().integer().positive().allow(null),
    age: Joi.number().integer().min(1).max(120).allow(null),
    experience_months: Joi.number().integer().min(0).allow(null),
  }),
})
  .min(1)
  .messages({
    'object.min': 'Չի փոխվել ոչ մի դաշտ',
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
  sendMessageSchema,
  createConversationSchema,
  adminUpdateUserSchema,
  validate,
};
