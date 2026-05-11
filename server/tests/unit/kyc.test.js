/**
 * Unit tests for KYC status transitions.
 * KYC states: PENDING → APPROVED or PENDING → REJECTED
 * REJECTED allows re-submission (back to PENDING)
 * APPROVED is final
 */

// ─── Pure logic function (mirrors KYC service logic) ──────────────────────────

function canTransitionKYC(currentStatus, newStatus) {
  if (currentStatus === 'PENDING' && (newStatus === 'APPROVED' || newStatus === 'REJECTED')) return true;
  if (currentStatus === 'REJECTED' && newStatus === 'PENDING') return true; // re-submission
  return false;
}

// ─── Valid Transitions ────────────────────────────────────────────────────────

describe('KYC: Valid Status Transitions', () => {
  it('allows PENDING → APPROVED', () => {
    expect(canTransitionKYC('PENDING', 'APPROVED')).toBe(true);
  });

  it('allows PENDING → REJECTED', () => {
    expect(canTransitionKYC('PENDING', 'REJECTED')).toBe(true);
  });

  it('allows REJECTED → PENDING (re-submission)', () => {
    expect(canTransitionKYC('REJECTED', 'PENDING')).toBe(true);
  });
});

// ─── Invalid Transitions ──────────────────────────────────────────────────────

describe('KYC: Invalid Status Transitions', () => {
  it('rejects APPROVED → PENDING', () => {
    expect(canTransitionKYC('APPROVED', 'PENDING')).toBe(false);
  });

  it('rejects APPROVED → REJECTED', () => {
    expect(canTransitionKYC('APPROVED', 'REJECTED')).toBe(false);
  });

  it('rejects APPROVED → APPROVED', () => {
    expect(canTransitionKYC('APPROVED', 'APPROVED')).toBe(false);
  });

  it('rejects PENDING → PENDING (same state)', () => {
    expect(canTransitionKYC('PENDING', 'PENDING')).toBe(false);
  });

  it('rejects REJECTED → REJECTED (same state)', () => {
    expect(canTransitionKYC('REJECTED', 'REJECTED')).toBe(false);
  });

  it('rejects REJECTED → APPROVED (must go through PENDING first)', () => {
    expect(canTransitionKYC('REJECTED', 'APPROVED')).toBe(false);
  });

  it('rejects unknown status as current', () => {
    expect(canTransitionKYC('UNKNOWN', 'APPROVED')).toBe(false);
    expect(canTransitionKYC('UNKNOWN', 'PENDING')).toBe(false);
  });

  it('rejects unknown status as target', () => {
    expect(canTransitionKYC('PENDING', 'UNKNOWN')).toBe(false);
    expect(canTransitionKYC('PENDING', 'CANCELLED')).toBe(false);
  });

  it('rejects null/undefined transitions', () => {
    expect(canTransitionKYC(null, 'APPROVED')).toBe(false);
    expect(canTransitionKYC('PENDING', null)).toBe(false);
    expect(canTransitionKYC(undefined, 'APPROVED')).toBe(false);
    expect(canTransitionKYC('PENDING', undefined)).toBe(false);
  });

  it('rejects empty string transitions', () => {
    expect(canTransitionKYC('', 'APPROVED')).toBe(false);
    expect(canTransitionKYC('PENDING', '')).toBe(false);
  });
});

// ─── Full Lifecycle ───────────────────────────────────────────────────────────

describe('KYC: Full Lifecycle Scenarios', () => {
  it('happy path: PENDING → APPROVED (final)', () => {
    expect(canTransitionKYC('PENDING', 'APPROVED')).toBe(true);
    // APPROVED is final — no further transitions
    expect(canTransitionKYC('APPROVED', 'PENDING')).toBe(false);
    expect(canTransitionKYC('APPROVED', 'REJECTED')).toBe(false);
  });

  it('rejection and re-submission: PENDING → REJECTED → PENDING → APPROVED', () => {
    expect(canTransitionKYC('PENDING', 'REJECTED')).toBe(true);
    expect(canTransitionKYC('REJECTED', 'PENDING')).toBe(true);
    expect(canTransitionKYC('PENDING', 'APPROVED')).toBe(true);
  });

  it('multiple rejections: PENDING → REJECTED → PENDING → REJECTED → PENDING', () => {
    expect(canTransitionKYC('PENDING', 'REJECTED')).toBe(true);
    expect(canTransitionKYC('REJECTED', 'PENDING')).toBe(true);
    expect(canTransitionKYC('PENDING', 'REJECTED')).toBe(true);
    expect(canTransitionKYC('REJECTED', 'PENDING')).toBe(true);
  });
});
