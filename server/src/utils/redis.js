import Redis from 'ioredis';
import config from '../config/index.js';

// ─── Redis Key Patterns ───────────────────────────────────────────────────────
let redisClient = null;
let useMemoryFallback = false;
const memoryStore = new Map();

// In-memory fallback when Redis is not available
const memoryClient = {
  async get(key) { 
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) { memoryStore.delete(key); return null; }
    return item.value;
  },
  async set(key, value, ...args) {
    let expiry = null;
    if (args[0] === 'EX' && args[1]) expiry = Date.now() + (args[1] * 1000);
    memoryStore.set(key, { value, expiry });
    return 'OK';
  },
  async del(key) { memoryStore.delete(key); return 1; },
  async ping() { return 'PONG'; },
  async incr(key) {
    const item = memoryStore.get(key);
    const val = item ? parseInt(item.value || '0') + 1 : 1;
    memoryStore.set(key, { value: String(val), expiry: item?.expiry || null });
    return val;
  },
  async expire(key, seconds) {
    const item = memoryStore.get(key);
    if (item) item.expiry = Date.now() + (seconds * 1000);
    return 1;
  },
  async ttl(key) {
    const item = memoryStore.get(key);
    if (!item || !item.expiry) return -1;
    return Math.max(0, Math.floor((item.expiry - Date.now()) / 1000));
  },
};

export function getRedisClient() {
  if (useMemoryFallback) return memoryClient;
  if (redisClient) return redisClient;

  if (!config.REDIS_URL || config.REDIS_URL === 'redis://localhost:6379') {
    // Check if we should even try connecting
    try {
      redisClient = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy(times) {
          if (times > 2) {
            console.warn('[REDIS] Connection failed, switching to in-memory fallback');
            useMemoryFallback = true;
            return null; // stop retrying
          }
          return Math.min(times * 500, 2000);
        },
      });

      redisClient.on('connect', () => console.log('[REDIS] Connected'));
      redisClient.on('error', (err) => {
        if (!useMemoryFallback) {
          console.warn('[REDIS] Error:', err.message, '— using memory fallback');
          useMemoryFallback = true;
        }
      });

      return redisClient;
    } catch {
      useMemoryFallback = true;
      console.warn('[REDIS] Not available, using in-memory store');
      return memoryClient;
    }
  }

  // External Redis URL provided (e.g., Upstash, Railway Redis)
  redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('[REDIS] External Redis failed, switching to memory fallback');
        useMemoryFallback = true;
        return null;
      }
      return Math.min(times * 500, 3000);
    },
  });

  redisClient.on('connect', () => console.log('[REDIS] Connected to external Redis'));
  redisClient.on('error', (err) => {
    if (!useMemoryFallback) {
      console.warn('[REDIS] Error:', err.message, '— using memory fallback');
      useMemoryFallback = true;
    }
  });

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
    const result = await client.ping();
    return { status: 'ok', mode: useMemoryFallback ? 'memory' : 'redis' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}











// import Redis from 'ioredis';
// import config from '../config/index.js';

// // ─── Redis Key Patterns ───────────────────────────────────────────────────────
// // otp:{identifier}                — OTP storage (5min TTL)
// // auth:blacklist:{token}          — Invalidated JWT tokens
// // rate:{ip}:{endpoint}            — Rate limiting counters (60s TTL)
// // lock:{userId}                   — Account lockout (1800s TTL)
// // cache:dashboard:{adminId}       — Admin dashboard metrics (60s TTL)
// // cache:packages                  — Package list (3600s TTL)
// // cache:properties:featured       — Featured properties (300s TTL)
// // session:{refreshToken}          — Refresh token validation (7d TTL)

// let redisClient = null;

// export function getRedisClient() {
//   if (redisClient) return redisClient;

//   redisClient = new Redis(config.REDIS_URL, {
//     maxRetriesPerRequest: 3,
//     enableReadyCheck: true,
//     lazyConnect: false,
//   });

//   redisClient.on('connect', () => console.log('[REDIS] Connected'));
//   redisClient.on('error', (err) => console.error('[REDIS] Error:', err.message));
//   redisClient.on('close', () => console.warn('[REDIS] Connection closed'));

//   return redisClient;
// }

// export const keys = {
//   otp: (identifier) => `otp:${identifier}`,
//   authBlacklist: (token) => `auth:blacklist:${token}`,
//   rateLimit: (ip, endpoint) => `rate:${ip}:${endpoint}`,
//   accountLock: (userId) => `lock:${userId}`,
//   dashboardCache: (adminId) => `cache:dashboard:${adminId}`,
//   packagesCache: () => 'cache:packages',
//   featuredPropertiesCache: () => 'cache:properties:featured',
//   refreshSession: (refreshToken) => `session:${refreshToken}`,
// };

// export const TTL = {
//   OTP: 300,
//   RATE_LIMIT: 60,
//   ACCOUNT_LOCK: 1800,
//   DASHBOARD: 60,
//   PACKAGES: 3600,
//   FEATURED_PROPS: 300,
//   REFRESH_TOKEN: 60 * 60 * 24 * 7,
// };

// export async function checkRedisHealth() {
//   try {
//     const client = getRedisClient();
//     await client.ping();
//     return { status: 'ok' };
//   } catch (err) {
//     return { status: 'error', message: err.message };
//   }
// }
