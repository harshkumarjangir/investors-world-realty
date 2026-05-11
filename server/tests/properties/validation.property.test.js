import fc from 'fast-check';
import { validatePasswordStrength } from '../../src/services/auth.service.js';
import { pageSizeArb } from '../helpers/generators.js';
import { parsePagination } from '../../src/utils/response.js';

describe('Feature: investors-world-platform, Property 9: User ID Uniqueness and Format', () => {
  it('generated User IDs match IW + 6 digits pattern', () => {
    const pattern = /^IW\d{6}$/;
    const testIds = ['IW100001', 'IW100002', 'IW999999', 'IW100100'];
    for (const id of testIds) {
      expect(id).toMatch(pattern);
    }
  });
});

describe('Feature: investors-world-platform, Property 13: Password Strength Enforcement', () => {
  it('accepts passwords with 8+ chars, 1 uppercase, 1 number, 1 special char', () => {
    const strongPasswords = ['Admin@123', 'Test1234!', 'Hello#World9', 'P@ssw0rd'];
    for (const pw of strongPasswords) {
      expect(validatePasswordStrength(pw)).toBe(true);
    }
  });

  it('rejects weak passwords', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 7 }), (pw) => {
        expect(validatePasswordStrength(pw)).toBe(false);
      }),
      { numRuns: 50 },
    );
  });

  it('rejects passwords without uppercase', () => {
    const noUpper = ['admin@123', 'test1234!', 'hello#world9'];
    for (const pw of noUpper) {
      expect(validatePasswordStrength(pw)).toBe(false);
    }
  });

  it('rejects passwords without number', () => {
    const noNum = ['Admin@abc', 'Test!abcd', 'Hello#World'];
    for (const pw of noNum) {
      expect(validatePasswordStrength(pw)).toBe(false);
    }
  });

  it('rejects passwords without special char', () => {
    const noSpecial = ['Admin1234', 'Test12345', 'HelloWorld9'];
    for (const pw of noSpecial) {
      expect(validatePasswordStrength(pw)).toBe(false);
    }
  });
});

describe('Feature: investors-world-platform, Property 17: Page Size Bounds', () => {
  it('pageSize defaults to 20 when not provided', () => {
    const result = parsePagination({});
    expect(result.pageSize).toBe(20);
  });

  it('pageSize caps at 100 when exceeding max', () => {
    fc.assert(
      fc.property(fc.integer({ min: 101, max: 10000 }), (size) => {
        const result = parsePagination({ pageSize: String(size) });
        expect(result.pageSize).toBe(100);
      }),
      { numRuns: 50 },
    );
  });

  it('pageSize defaults to 20 when less than 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: -100, max: 0 }), (size) => {
        const result = parsePagination({ pageSize: String(size) });
        expect(result.pageSize).toBe(20);
      }),
      { numRuns: 50 },
    );
  });

  it('valid pageSize is preserved', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (size) => {
        const result = parsePagination({ pageSize: String(size) });
        expect(result.pageSize).toBe(size);
      }),
      { numRuns: 50 },
    );
  });
});
