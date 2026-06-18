import app from './app.js';
import config from './config/index.js';
import prisma from './utils/prisma.js';
import { getRedisClient } from './utils/redis.js';
import { startHoldExpirationWorker } from './utils/holdExpirationWorker.js';
import { startAutoDeleteWorker } from './utils/autoDeleteWorker.js';

const PORT = config.PORT;

async function startServer() {
  // ─── Check DB connection ───────────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB] PostgreSQL connected');
  } catch (err) {
    console.error('[DB] PostgreSQL connection failed:', err.message);
    process.exit(1);
  }

  // ─── Check Redis connection ────────────────────────────────────────────────
  try {
    const redis = getRedisClient();
    await redis.ping();
    console.log('[REDIS] Connected');
  } catch (err) {
    console.warn('[REDIS] Connection failed (non-fatal):', err.message);
    // Redis failure is non-fatal on startup — rate limiting falls back to in-memory
  }

  // ─── Start HTTP server ─────────────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`[SERVER] Investors World Realty API running on port ${PORT} (${config.NODE_ENV})`);
    startHoldExpirationWorker();
    
    // NOTE: Comment out the line below to disable 7-day auto-deletion after Google Play Store review
    startAutoDeleteWorker();
  });
}

startServer(); // Trigger reload

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1); // Force nodemon reload trigger comment v2
});
