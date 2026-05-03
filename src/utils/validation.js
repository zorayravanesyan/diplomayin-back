import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
});

export const loginSchema = Joi.object({
  login_data: Joi.string().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().min(1).max(100),
  weight_kg: Joi.number().positive().allow(null),
  height_sm: Joi.number().positive().allow(null),
  gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN'),
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

export const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(4000).required(),
});

export const createConversationSchema = Joi.object({
  title: Joi.string().trim().max(120).optional().allow(null, ''),
  first_message: Joi.string().trim().min(1).max(4000).optional(),
});

export function validate(schema) {
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
