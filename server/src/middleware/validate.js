import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

// Runs after express-validator chains — returns 400 if any validation failed
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return errorResponse(res, messages[0], 400);
  }
  return next();
}
