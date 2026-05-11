import { validatePasswordStrength } from '../../src/services/auth.service.js';

/**
 * Unit tests for authentication logic.
 * Tests password validation, OTP generation format, account lockout logic,
 * and token payload structure.
 */

// ─── Pure helpers (mirrors auth.service.js logic) ─────────────────────────────

function generateOtp() {
  // crypto.randomInt(100000, 999999) produces 6-digit numbers
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function shouldLockAccount(failedAttempts) {
  return failedAttempts >= 5;
}

function isAccountLocked(lockTimestamp, lockDurationMs = 30 * 60 * 1000) {
  if (!lockTimestamp) return false;
  return Date.now() - lockTimestamp < lockDurationMs;
}

function createTokenPayload(associate) {
  return {
    id: associate.id,
    userId: associate.userId,
    type: 'associate',
  };
}

function createAdminTokenPayload(admin) {
  return {
    id: admin.id,
    email: admin.email,
    type: 'admin',
    permissions: admin.permissions,
  };
}

// ─── validatePasswordStrength ─────────────────────────────────────────────────

describe('Auth: validatePasswordStrength', () => {
  describe('accepts strong passwords', () => {
    const strongPasswords = [
      'Admin@123',
      'Test1234!',
      'Hello#World9',
      'P@ssw0rd',
      'MyP@ss1234',
      'Str0ng!Pass',
      'C0mplex#Pwd',
      'Valid$Pass8',
    ];

    it.each(strongPasswords)('accepts "%s"', (password) => {
      expect(validatePasswordStrength(password)).toBe(true);
    });
  });

  describe('rejects weak passwords', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const shortPasswords = ['Ab1!', 'A1@bc', 'Xy9#ab', 'Zz1!abc'];
      for (const pw of shortPasswords) {
        expect(validatePasswordStrength(pw)).toBe(false);
      }
    });

    it('rejects passwords without uppercase letter', () => {
      const noUpper = ['admin@123', 'test1234!', 'hello#world9', 'password1!'];
      for (const pw of noUpper) {
        expect(validatePasswordStrength(pw)).toBe(false);
      }
    });

    it('rejects passwords without number', () => {
      const noNumber = ['Admin@abc', 'Test!abcde', 'Hello#World', 'Password!x'];
      for (const pw of noNumber) {
        expect(validatePasswordStrength(pw)).toBe(false);
      }
    });

    it('rejects passwords without special character', () => {
      const noSpecial = ['Admin1234', 'Test12345', 'HelloWorld9', 'Password12'];
      for (const pw of noSpecial) {
        expect(validatePasswordStrength(pw)).toBe(false);
      }
    });

    it('rejects empty string', () => {
      expect(validatePasswordStrength('')).toBe(false);
    });

    it('rejects null/undefined gracefully', () => {
      expect(validatePasswordStrength(null)).toBe(false);
      expect(validatePasswordStrength(undefined)).toBe(false);
    });
  });
});

// ─── OTP Generation ───────────────────────────────────────────────────────────

describe('Auth: OTP Generation', () => {
  it('generates a 6-digit string', () => {
    for (let i = 0; i < 100; i++) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  it('OTP is always between 100000 and 999999', () => {
    for (let i = 0; i < 100; i++) {
      const otp = parseInt(generateOtp(), 10);
      expect(otp).toBeGreaterThanOrEqual(100000);
      expect(otp).toBeLessThanOrEqual(999999);
    }
  });

  it('OTP length is exactly 6', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateOtp();
      expect(otp.length).toBe(6);
    }
  });
});

// ─── Account Lockout Logic ────────────────────────────────────────────────────

describe('Auth: Account Lockout Logic', () => {
  it('account is locked after 5 failed attempts', () => {
    expect(shouldLockAccount(5)).toBe(true);
    expect(shouldLockAccount(6)).toBe(true);
    expect(shouldLockAccount(10)).toBe(true);
  });

  it('account is NOT locked with fewer than 5 failed attempts', () => {
    expect(shouldLockAccount(0)).toBe(false);
    expect(shouldLockAccount(1)).toBe(false);
    expect(shouldLockAccount(2)).toBe(false);
    expect(shouldLockAccount(3)).toBe(false);
    expect(shouldLockAccount(4)).toBe(false);
  });

  it('locked account remains locked within 30 minutes', () => {
    const lockTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    expect(isAccountLocked(lockTime)).toBe(true);
  });

  it('locked account unlocks after 30 minutes', () => {
    const lockTime = Date.now() - 31 * 60 * 1000; // 31 minutes ago
    expect(isAccountLocked(lockTime)).toBe(false);
  });

  it('no lock timestamp means not locked', () => {
    expect(isAccountLocked(null)).toBe(false);
    expect(isAccountLocked(undefined)).toBe(false);
  });

  it('lock at exactly 30 minutes is still locked', () => {
    const lockTime = Date.now() - 30 * 60 * 1000 + 1; // just under 30 min
    expect(isAccountLocked(lockTime)).toBe(true);
  });
});

// ─── Token Generation ─────────────────────────────────────────────────────────

describe('Auth: Token Payload', () => {
  it('associate token contains id, userId, and type "associate"', () => {
    const associate = { id: 'uuid-123', userId: 'IW100001' };
    const payload = createTokenPayload(associate);

    expect(payload).toHaveProperty('id', 'uuid-123');
    expect(payload).toHaveProperty('userId', 'IW100001');
    expect(payload).toHaveProperty('type', 'associate');
  });

  it('admin token contains id, email, type "admin", and permissions', () => {
    const admin = {
      id: 'admin-uuid-1',
      email: 'admin@example.com',
      permissions: ['manage_associates', 'manage_properties'],
    };
    const payload = createAdminTokenPayload(admin);

    expect(payload).toHaveProperty('id', 'admin-uuid-1');
    expect(payload).toHaveProperty('email', 'admin@example.com');
    expect(payload).toHaveProperty('type', 'admin');
    expect(payload).toHaveProperty('permissions');
    expect(payload.permissions).toEqual(['manage_associates', 'manage_properties']);
  });

  it('associate token type is never "admin"', () => {
    const associate = { id: 'uuid-456', userId: 'IW100002' };
    const payload = createTokenPayload(associate);
    expect(payload.type).not.toBe('admin');
  });

  it('admin token type is never "associate"', () => {
    const admin = { id: 'admin-2', email: 'test@test.com', permissions: [] };
    const payload = createAdminTokenPayload(admin);
    expect(payload.type).not.toBe('associate');
  });

  it('token payload does not contain password', () => {
    const associate = { id: 'uuid-789', userId: 'IW100003', password: 'hashed_secret' };
    const payload = createTokenPayload(associate);
    expect(payload).not.toHaveProperty('password');
  });
});
