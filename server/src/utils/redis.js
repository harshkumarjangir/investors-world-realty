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

  redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('connect', () => console.log('[REDIS] Connected'));
  redisClient.on('error', (err) => console.error('[REDIS] Error:', err.message));
  redisClient.on('close', () => console.warn('[REDIS] Connection closed'));

  return redisClient;
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
