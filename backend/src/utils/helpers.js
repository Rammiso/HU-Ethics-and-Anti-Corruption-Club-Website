import { v4 as uuidv4 } from 'uuid';

export const generateTrackingId = () => {
  return uuidv4();
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

export const formatResponse = (success, data = null, message = null) => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

export const formatError = (message, code = null, details = null) => {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
};
