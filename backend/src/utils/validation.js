import Joi from 'joi';

export const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

export const validatePassword = (password) => {
  const schema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long',
    });
  return schema.validate(password);
};

export const validateUUID = (uuid) => {
  const schema = Joi.string().uuid().required();
  return schema.validate(uuid);
};

export const validatePagination = (page, limit) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });
  return schema.validate({ page, limit });
};
