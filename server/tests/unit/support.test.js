/**
 * Unit tests for support ticket lifecycle.
 * Ticket states: OPEN → IN_PROGRESS → RESOLVED → CLOSED
 * Also: OPEN → CLOSED (direct close)
 * Cannot go backwards.
 */

// ─── Pure logic function (mirrors support service logic) ──────────────────────

function canTransitionTicket(currentStatus, newStatus) {
  const order = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };
  if (!(currentStatus in order) || !(newStatus in order)) return false;
  // Can only move forward, or OPEN can jump to CLOSED
  if (currentStatus === 'OPEN' && newStatus === 'CLOSED') return true;
  return order[newStatus] === order[currentStatus] + 1;
}

// ─── Valid Transitions ────────────────────────────────────────────────────────

describe('Support Ticket: Valid Status Transitions', () => {
  it('allows OPEN → IN_PROGRESS', () => {
    expect(canTransitionTicket('OPEN', 'IN_PROGRESS')).toBe(true);
  });

  it('allows IN_PROGRESS → RESOLVED', () => {
    expect(canTransitionTicket('IN_PROGRESS', 'RESOLVED')).toBe(true);
  });

  it('allows RESOLVED → CLOSED', () => {
    expect(canTransitionTicket('RESOLVED', 'CLOSED')).toBe(true);
  });

  it('allows OPEN → CLOSED (direct close)', () => {
    expect(canTransitionTicket('OPEN', 'CLOSED')).toBe(true);
  });
});

// ─── Backward Transitions Rejected ───────────────────────────────────────────

describe('Support Ticket: Backward Transitions Rejected', () => {
  it('rejects IN_PROGRESS → OPEN', () => {
    expect(canTransitionTicket('IN_PROGRESS', 'OPEN')).toBe(false);
  });

  it('rejects RESOLVED → OPEN', () => {
    expect(canTransitionTicket('RESOLVED', 'OPEN')).toBe(false);
  });

  it('rejects RESOLVED → IN_PROGRESS', () => {
    expect(canTransitionTicket('RESOLVED', 'IN_PROGRESS')).toBe(false);
  });

  it('rejects CLOSED → OPEN', () => {
    expect(canTransitionTicket('CLOSED', 'OPEN')).toBe(false);
  });

  it('rejects CLOSED → IN_PROGRESS', () => {
    expect(canTransitionTicket('CLOSED', 'IN_PROGRESS')).toBe(false);
  });

  it('rejects CLOSED → RESOLVED', () => {
    expect(canTransitionTicket('CLOSED', 'RESOLVED')).toBe(false);
  });
});

// ─── Same-State Transitions Rejected ──────────────────────────────────────────

describe('Support Ticket: Same-State Transitions Rejected', () => {
  it('rejects OPEN → OPEN', () => {
    expect(canTransitionTicket('OPEN', 'OPEN')).toBe(false);
  });

  it('rejects IN_PROGRESS → IN_PROGRESS', () => {
    expect(canTransitionTicket('IN_PROGRESS', 'IN_PROGRESS')).toBe(false);
  });

  it('rejects RESOLVED → RESOLVED', () => {
    expect(canTransitionTicket('RESOLVED', 'RESOLVED')).toBe(false);
  });

  it('rejects CLOSED → CLOSED', () => {
    expect(canTransitionTicket('CLOSED', 'CLOSED')).toBe(false);
  });
});

// ─── Skip Transitions ─────────────────────────────────────────────────────────

describe('Support Ticket: Skip Transitions', () => {
  it('rejects OPEN → RESOLVED (must go through IN_PROGRESS)', () => {
    expect(canTransitionTicket('OPEN', 'RESOLVED')).toBe(false);
  });

  it('rejects IN_PROGRESS → CLOSED (must go through RESOLVED)', () => {
    expect(canTransitionTicket('IN_PROGRESS', 'CLOSED')).toBe(false);
  });

  it('allows OPEN → CLOSED as special case (direct close)', () => {
    expect(canTransitionTicket('OPEN', 'CLOSED')).toBe(true);
  });
});

// ─── Invalid/Unknown States ───────────────────────────────────────────────────

describe('Support Ticket: Invalid States', () => {
  it('rejects unknown current status', () => {
    expect(canTransitionTicket('UNKNOWN', 'OPEN')).toBe(false);
    expect(canTransitionTicket('PENDING', 'IN_PROGRESS')).toBe(false);
    expect(canTransitionTicket('CANCELLED', 'CLOSED')).toBe(false);
  });

  it('rejects unknown target status', () => {
    expect(canTransitionTicket('OPEN', 'UNKNOWN')).toBe(false);
    expect(canTransitionTicket('OPEN', 'PENDING')).toBe(false);
    expect(canTransitionTicket('IN_PROGRESS', 'CANCELLED')).toBe(false);
  });

  it('rejects null/undefined states', () => {
    expect(canTransitionTicket(null, 'OPEN')).toBe(false);
    expect(canTransitionTicket('OPEN', null)).toBe(false);
    expect(canTransitionTicket(undefined, 'CLOSED')).toBe(false);
    expect(canTransitionTicket('OPEN', undefined)).toBe(false);
  });

  it('rejects empty string states', () => {
    expect(canTransitionTicket('', 'OPEN')).toBe(false);
    expect(canTransitionTicket('OPEN', '')).toBe(false);
  });
});

// ─── Full Lifecycle ───────────────────────────────────────────────────────────

describe('Support Ticket: Full Lifecycle', () => {
  it('normal flow: OPEN → IN_PROGRESS → RESOLVED → CLOSED', () => {
    expect(canTransitionTicket('OPEN', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionTicket('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(canTransitionTicket('RESOLVED', 'CLOSED')).toBe(true);
  });

  it('quick close: OPEN → CLOSED', () => {
    expect(canTransitionTicket('OPEN', 'CLOSED')).toBe(true);
  });

  it('CLOSED is terminal — no outgoing transitions', () => {
    const allStates = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    for (const target of allStates) {
      expect(canTransitionTicket('CLOSED', target)).toBe(false);
    }
  });
});
