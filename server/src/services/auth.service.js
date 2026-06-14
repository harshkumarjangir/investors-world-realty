import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import prisma from '../utils/prisma.js';
import { getRedisClient, keys, TTL } from '../utils/redis.js';

// ─── Token Helpers ────────────────────────────────────────────────────────────
function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
}

// Long-lived token for mobile app associates (30 days, no refresh needed)
function generateAssociateToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_ASSOCIATE_EXPIRES_IN });
}

// ─── Associate Auth ───────────────────────────────────────────────────────────
export async function loginAssociate(userId, password, deviceToken = null) {
  const redis = getRedisClient();

  // Check account lock
  const lockKey = keys.accountLock(userId);
  const locked = await redis.get(lockKey);
  if (locked) {
    const ttl = await redis.ttl(lockKey);
    const minutes = Math.ceil(ttl / 60);
    throw Object.assign(new Error(`Account locked. Try again in ${minutes} minute(s)`), { statusCode: 423 });
  }

  const associate = await prisma.associate.findUnique({
    where: { userId, deletedAt: null },
  });

  if (!associate) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  if (associate.status === 'SUSPENDED') {
    throw Object.assign(new Error('Account suspended. Contact support'), { statusCode: 403 });
  }

  if (associate.status === 'INACTIVE') {
    throw Object.assign(new Error('Account pending admin approval. Please wait for activation.'), { statusCode: 403 });
  }

  const passwordMatch = await bcrypt.compare(password, associate.password);

  if (!passwordMatch) {
    const attempts = associate.failedAttempts + 1;
    const update = { failedAttempts: attempts };

    if (attempts >= 5) {
      update.failedAttempts = 0;
      await redis.set(lockKey, '1', 'EX', TTL.ACCOUNT_LOCK);
    }

    await prisma.associate.update({ where: { id: associate.id }, data: update });
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  // Reset failed attempts on success
  if (associate.failedAttempts > 0) {
    await prisma.associate.update({ where: { id: associate.id }, data: { failedAttempts: 0 } });
  }

  // ── Long-lived token — no refresh token for mobile app ────────────────────
  const tokenPayload = {
    id: associate.id,
    userId: associate.userId,
    type: 'associate',
  };

  // 30-day access token — user stays logged in for a month without re-auth
  const accessToken = generateAssociateToken(tokenPayload);

  // No refresh token stored — when the 30d token expires, user logs in again
  // Persist device token if provided
  if (deviceToken) {
    await upsertDeviceToken(associate.id, deviceToken);
  }

  return {
    accessToken,
    user: {
      id: associate.id,
      userId: associate.userId,
      name: associate.name,
      email: associate.email,
      phone: associate.phone,
      status: associate.status,
      rank: associate.rank,
      theme: associate.theme,
      language: associate.language,
    },
  };
}

// ─── Verify Associate OTP (Step 2 of login) ──────────────────────────────────
export async function verifyAssociateOtp(associateId, otp) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const valid = await verifyOtp(associate.email, otp);

  if (!valid) {
    throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  }

  const tokenPayload = {
    id: associate.id,
    userId: associate.userId,
    type: 'associate',
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token in Redis
  const redis = getRedisClient();
  await redis.set(keys.refreshSession(refreshToken), associate.id, 'EX', TTL.REFRESH_TOKEN);

  // Store device token if was pending
  const pendingDevice = await redis.get(`pending_device:${associate.id}`);
  if (pendingDevice) {
    await upsertDeviceToken(associate.id, pendingDevice);
    await redis.del(`pending_device:${associate.id}`);
  }

  return {
    accessToken,
    refreshToken,
    user: {
      id: associate.id,
      userId: associate.userId,
      name: associate.name,
      email: associate.email,
      phone: associate.phone,
      status: associate.status,
      theme: associate.theme,
      language: associate.language,
    },
  };
}

export async function refreshAssociateToken(refreshToken) {
  // Associates use long-lived 30-day tokens — no refresh needed.
  // This endpoint is for admin use only.
  throw Object.assign(
    new Error('Token refresh is not available for associates. Please log in again when your token expires.'),
    { statusCode: 400 },
  );
}

export async function logoutAssociate(accessToken) {
  const redis = getRedisClient();

  // Blacklist the access token so it can't be reused
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.set(keys.authBlacklist(accessToken), '1', 'EX', Math.min(ttl, 30 * 24 * 3600));
      }
    }
  } catch { /* ignore */ }

  // Device token stays registered — push notifications continue to the device.
  // FCM token is only removed if the user explicitly disables notifications
  // or the app is uninstalled (handled by Firebase).
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
export async function sendOtp(identifier) {
  const redis = getRedisClient();
  const otp = crypto.randomInt(100000, 999999).toString();
  await redis.set(keys.otp(identifier), otp, 'EX', TTL.OTP);

  // Send OTP via email
  try {
    const { sendOtpEmail } = await import('../utils/email.js');
    await sendOtpEmail(identifier, otp);
  } catch (err) {
    console.error('[OTP] Email send failed:', err.message);
  }

  // Also log in dev mode for debugging
  // if (config.NODE_ENV !== 'production') {
  //   console.log(`[OTP] ${identifier} → ${otp}`);
  // }

  // Always log OTP to console
  console.log(`[OTP] ${identifier} → ${otp}`);

  return otp;
}

export async function verifyOtp(identifier, otp) {
  const redis = getRedisClient();
  const stored = await redis.get(keys.otp(identifier));
  if (!stored || stored !== otp) return false;
  await redis.del(keys.otp(identifier));
  return true;
}

// ─── Password ─────────────────────────────────────────────────────────────────
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function validatePasswordStrength(password) {
  return PASSWORD_REGEX.test(password);
}

// ─── Forgot Password — 3-step flow ────────────────────────────────────────────
// Step 1: POST /auth/forgot-password      → send OTP to email/phone
// Step 2: POST /auth/verify-forgot-otp   → verify OTP, get reset token
// Step 3: POST /auth/reset-password      → use reset token + new password

export async function verifyForgotOtp(identifier, otp) {
  const redis = getRedisClient();

  // Verify the OTP
  const valid = await verifyOtp(identifier, otp);
  if (!valid) {
    throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  }

  // Find associate
  const associate = await prisma.associate.findFirst({
    where: {
      OR: [{ phone: identifier }, { email: identifier }],
      deletedAt: null,
    },
    select: { id: true, userId: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Store a verified flag keyed by identifier — valid for 10 minutes
  await redis.set(`password_reset_verified:${identifier}`, associate.id, 'EX', 600);

  console.log(`[FORGOT-PASSWORD] OTP verified for ${associate.userId} — can now reset password`);

  return { message: 'OTP verified. You can now reset your password.' };
}

export async function resetPasswordWithToken(identifier, newPassword) {
  const redis = getRedisClient();

  // Check the verified flag
  const associateId = await redis.get(`password_reset_verified:${identifier}`);
  if (!associateId) {
    throw Object.assign(
      new Error('OTP not verified or session expired. Please request a new OTP.'),
      { statusCode: 400 },
    );
  }

  if (!validatePasswordStrength(newPassword)) {
    throw Object.assign(
      new Error('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character'),
      { statusCode: 400 },
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.associate.update({
    where: { id: associateId },
    data: { password: hashed, failedAttempts: 0 },
  });

  // Clear the verified flag so it can't be reused
  await redis.del(`password_reset_verified:${identifier}`);

  console.log(`[FORGOT-PASSWORD] Password reset completed for associate ${associateId}`);
}

export async function changePassword(associateId, currentPassword, newPassword) {
  const associate = await prisma.associate.findUnique({ where: { id: associateId } });

  const match = await bcrypt.compare(currentPassword, associate.password);
  if (!match) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }

  if (!validatePasswordStrength(newPassword)) {
    throw Object.assign(
      new Error('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character'),
      { statusCode: 400 },
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.associate.update({ where: { id: associateId }, data: { password: hashed } });
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export async function loginAdmin(email, password) {
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!admin || !admin.isActive) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  // Send OTP for 2FA
  await sendOtp(admin.email);

  return { message: 'OTP sent to registered email', adminId: admin.id };
}

export async function verifyAdminOtp(adminId, otp) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { role: true },
  });

  if (!admin) {
    throw Object.assign(new Error('Admin not found'), { statusCode: 404 });
  }

  const valid = await verifyOtp(admin.email, otp);
  if (!valid) {
    throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  }

  const tokenPayload = {
    id: admin.id,
    email: admin.email,
    type: 'admin',
    permissions: admin.role.permissions,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const redis = getRedisClient();
  await redis.set(keys.refreshSession(refreshToken), admin.id, 'EX', TTL.REFRESH_TOKEN);

  return {
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      name: admin.name,
      username: admin.username || admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role.name,
      permissions: admin.role.permissions,
    },
  };
}

// ─── Device Token ─────────────────────────────────────────────────────────────
async function upsertDeviceToken(associateId, token, platform = 'unknown') {
  await prisma.deviceToken.upsert({
    where: { token },
    update: { associateId },
    create: { associateId, token, platform },
  });
}
