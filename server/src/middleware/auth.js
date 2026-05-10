import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { getRedisClient, keys } from '../utils/redis.js';
import { errorResponse } from '../utils/response.js';

// ─── Associate Auth Middleware ────────────────────────────────────────────────
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (logged out)
    const redis = getRedisClient();
    const blacklisted = await redis.get(keys.authBlacklist(token));
    if (blacklisted) {
      return errorResponse(res, 'Token has been invalidated', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.type !== 'associate') {
      return errorResponse(res, 'Invalid token type', 401);
    }

    req.associate = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid access token', 401);
  }
}

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
export async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }

    const token = authHeader.split(' ')[1];

    const redis = getRedisClient();
    const blacklisted = await redis.get(keys.authBlacklist(token));
    if (blacklisted) {
      return errorResponse(res, 'Token has been invalidated', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.type !== 'admin') {
      return errorResponse(res, 'Invalid token type', 401);
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid access token', 401);
  }
}

// ─── Role Guard Middleware ────────────────────────────────────────────────────
export function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = req.admin?.permissions || [];
    if (!permissions.includes(permission)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
    return next();
  };
}
