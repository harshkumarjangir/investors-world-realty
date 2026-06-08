/**
 * Unit tests for booking status transitions.
 * Booking states: PENDING → CONFIRMED or PENDING → CANCELLED
 * CONFIRMED and CANCELLED are final states.
 */

// ─── Pure logic function (mirrors booking service logic) ──────────────────────

function canTransitionBooking(currentStatus, newStatus) {
  if (currentStatus === 'PENDING' && (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED')) return true;
  if (currentStatus === 'HOLD' && (newStatus === 'CONFIRMED' || newStatus === 'EXPIRED' || newStatus === 'CANCELLED')) return true;
  return false;
}

// ─── Valid Transitions ────────────────────────────────────────────────────────

describe('Booking: Valid Status Transitions', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(canTransitionBooking('PENDING', 'CONFIRMED')).toBe(true);
  });

  it('allows PENDING → CANCELLED', () => {
    expect(canTransitionBooking('PENDING', 'CANCELLED')).toBe(true);
  });
});

// ─── Invalid Transitions ──────────────────────────────────────────────────────

describe('Booking: Invalid Status Transitions', () => {
  it('rejects CONFIRMED → PENDING', () => {
    expect(canTransitionBooking('CONFIRMED', 'PENDING')).toBe(false);
  });

  it('rejects CONFIRMED → CANCELLED', () => {
    expect(canTransitionBooking('CONFIRMED', 'CANCELLED')).toBe(false);
  });

  it('rejects CONFIRMED → CONFIRMED (same state)', () => {
    expect(canTransitionBooking('CONFIRMED', 'CONFIRMED')).toBe(false);
  });

  it('rejects CANCELLED → PENDING', () => {
    expect(canTransitionBooking('CANCELLED', 'PENDING')).toBe(false);
  });

  it('rejects CANCELLED → CONFIRMED', () => {
    expect(canTransitionBooking('CANCELLED', 'CONFIRMED')).toBe(false);
  });

  it('rejects CANCELLED → CANCELLED (same state)', () => {
    expect(canTransitionBooking('CANCELLED', 'CANCELLED')).toBe(false);
  });

  it('rejects PENDING → PENDING (same state)', () => {
    expect(canTransitionBooking('PENDING', 'PENDING')).toBe(false);
  });

  it('rejects unknown status as current', () => {
    expect(canTransitionBooking('UNKNOWN', 'CONFIRMED')).toBe(false);
    expect(canTransitionBooking('PROCESSING', 'CONFIRMED')).toBe(false);
  });

  it('rejects unknown status as target', () => {
    expect(canTransitionBooking('PENDING', 'UNKNOWN')).toBe(false);
    expect(canTransitionBooking('PENDING', 'PROCESSING')).toBe(false);
    expect(canTransitionBooking('PENDING', 'COMPLETED')).toBe(false);
  });

  it('rejects null/undefined transitions', () => {
    expect(canTransitionBooking(null, 'CONFIRMED')).toBe(false);
    expect(canTransitionBooking('PENDING', null)).toBe(false);
    expect(canTransitionBooking(undefined, 'CONFIRMED')).toBe(false);
    expect(canTransitionBooking('PENDING', undefined)).toBe(false);
  });

  it('rejects empty string transitions', () => {
    expect(canTransitionBooking('', 'CONFIRMED')).toBe(false);
    expect(canTransitionBooking('PENDING', '')).toBe(false);
  });
});

// ─── Final State Verification ─────────────────────────────────────────────────

describe('Booking: Final State Verification', () => {
  const allStates = ['PENDING', 'CONFIRMED', 'CANCELLED', 'HOLD', 'EXPIRED'];

  it('CONFIRMED is a terminal state (no outgoing transitions)', () => {
    for (const target of allStates) {
      expect(canTransitionBooking('CONFIRMED', target)).toBe(false);
    }
  });

  it('CANCELLED is a terminal state (no outgoing transitions)', () => {
    for (const target of allStates) {
      expect(canTransitionBooking('CANCELLED', target)).toBe(false);
    }
  });

  it('EXPIRED is a terminal state (no outgoing transitions)', () => {
    for (const target of allStates) {
      expect(canTransitionBooking('EXPIRED', target)).toBe(false);
    }
  });

  it('PENDING only transitions to CONFIRMED or CANCELLED', () => {
    expect(canTransitionBooking('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransitionBooking('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransitionBooking('PENDING', 'HOLD')).toBe(false);
    expect(canTransitionBooking('PENDING', 'EXPIRED')).toBe(false);
  });

  it('HOLD transitions to CONFIRMED, EXPIRED, or CANCELLED', () => {
    expect(canTransitionBooking('HOLD', 'CONFIRMED')).toBe(true);
    expect(canTransitionBooking('HOLD', 'EXPIRED')).toBe(true);
    expect(canTransitionBooking('HOLD', 'CANCELLED')).toBe(true);
    expect(canTransitionBooking('HOLD', 'PENDING')).toBe(false);
  });
});
