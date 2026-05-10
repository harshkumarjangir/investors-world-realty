import { getRedisClient, keys, TTL } from '../utils/redis.js';
import { errorResponse } from '../utils/response.js';

const inMemoryStore = new Map(); // fallback when Redis is unavailable

function inMemoryRateLimit(key, limit) {
  const now = Date.now();
  const windowMs = TTL.RATE_LIMIT * 1000;
  const entry = inMemoryStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  inMemoryStore.set(key, entry);
  return entry.count <= limit;
}

function createRateLimiter(limit) {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = `${req.method}:${req.path}`;
    const key = keys.rateLimit(ip, endpoint);

    try {
      const redis = getRedisClient();
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, TTL.RATE_LIMIT);
      }
      if (current > limit) {
        return errorResponse(res, 'Too many requests, please try again later', 429);
      }
    } catch {
      // Redis unavailable — fall back to in-memory limiting
      if (!inMemoryRateLimit(key, limit)) {
        return errorResponse(res, 'Too many requests, please try again later', 429);
      }
    }

    return next();
  };
}

// 100 req/min for public endpoints
export const publicRateLimit = createRateLimiter(100);

// 300 req/min for authenticated endpoints
export const authRateLimit = createRateLimiter(300);
