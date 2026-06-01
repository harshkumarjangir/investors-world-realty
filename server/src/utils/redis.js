import Redis from 'ioredis';
import config from '../config/index.js';

// ─── Redis Key Patterns ───────────────────────────────────────────────────────
// otp:{identifier}                — OTP storage (5min TTL)
// auth:blacklist:{token}          — Invalidated JWT tokens
// rate:{ip}:{endpoint}            — Rate limiting counters (60s TTL)
// lock:{userId}                   — Account lockout (1800s TTL)
// cache:dashboard:{adminId}       — Admin dashboard metrics (60s TTL)
// cache:packages                  — Package list (3600s TTL)
// cache:properties:featured       — Featured properties (300s TTL)
// session:{refreshToken}          — Refresh token validation (7d TTL)

let redisClient = null;

export function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(config.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on('error', (err) => {
      if (!redisClient._errorLogged) {
        console.warn('[REDIS] Error:', err.message);
        redisClient._errorLogged = true;
      }
    });

    // Try to connect but don't crash if it fails
    redisClient.connect().catch(() => {});
  } catch (err) {
    console.warn('[REDIS] Init failed:', err.message);
    // Return a mock redis that won't crash the app
    redisClient = createMockRedis();
  }

  return redisClient;
}

function createMockRedis() {
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    ping: async () => 'PONG',
    _errorLogged: true,
  };
}

export const keys = {
  otp: (identifier) => `otp:${identifier}`,
  authBlacklist: (token) => `auth:blacklist:${token}`,
  rateLimit: (ip, endpoint) => `rate:${ip}:${endpoint}`,
  accountLock: (userId) => `lock:${userId}`,
  dashboardCache: (adminId) => `cache:dashboard:${adminId}`,
  packagesCache: () => 'cache:packages',
  featuredPropertiesCache: () => 'cache:properties:featured',
  refreshSession: (refreshToken) => `session:${refreshToken}`,
};

export const TTL = {
  OTP: 300,
  RATE_LIMIT: 60,
  ACCOUNT_LOCK: 1800,
  DASHBOARD: 60,
  PACKAGES: 3600,
  FEATURED_PROPS: 300,
  REFRESH_TOKEN: 60 * 60 * 24 * 7,
};

export async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    await client.ping();
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}
