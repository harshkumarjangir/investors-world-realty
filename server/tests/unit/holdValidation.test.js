/**
 * Pure logic tests for property hold validation and payment override rules.
 * Mirrors the logic implemented in booking.service.js and admin/booking.service.js.
 */

function validateHoldAndBooking({
  propertyStatus,
  heldByAssociateId,
  requestingAssociateId,
  paymentType,
  amount,
  propertyPrice,
}) {
  if (propertyStatus === 'BOOKED' || propertyStatus === 'SOLD') {
    return { allowed: false, reason: 'Property is already booked or sold' };
  }

  if (propertyStatus === 'HOLD') {
    if (requestingAssociateId !== heldByAssociateId) {
      if (paymentType === 'BOOKING') {
        return {
          allowed: false,
          reason: 'Property is currently on hold. Only full payment (in person) can override this hold.',
        };
      }
      if (paymentType === 'FULL_PAYMENT' && amount < propertyPrice) {
        return {
          allowed: false,
          reason: `Property is currently on hold. Only full payment (at least ${propertyPrice}) can override this hold.`,
        };
      }
    }
  }

  if (amount <= 0) {
    return { allowed: false, reason: 'Amount must be positive' };
  }

  return { allowed: true };
}

describe('Hold & Booking Logic: Validation Rules', () => {
  const propertyPrice = 1000000; // 10 Lakhs

  // ─── Available Property ─────────────────────────────────────────────────────
  describe('when property is AVAILABLE', () => {
    it('allows booking amount payment by any associate', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'AVAILABLE',
        heldByAssociateId: null,
        requestingAssociateId: 'assoc-1',
        paymentType: 'BOOKING',
        amount: 50000,
        propertyPrice,
      });
      expect(res.allowed).toBe(true);
    });

    it('allows full payment by any associate', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'AVAILABLE',
        heldByAssociateId: null,
        requestingAssociateId: 'assoc-1',
        paymentType: 'FULL_PAYMENT',
        amount: propertyPrice,
        propertyPrice,
      });
      expect(res.allowed).toBe(true);
    });
  });

  // ─── Held Property ──────────────────────────────────────────────────────────
  describe('when property is on HOLD', () => {
    const heldByAssociateId = 'assoc-holder';

    it('allows the holding associate to pay the booking amount', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'HOLD',
        heldByAssociateId,
        requestingAssociateId: heldByAssociateId,
        paymentType: 'BOOKING',
        amount: 50000,
        propertyPrice,
      });
      expect(res.allowed).toBe(true);
    });

    it('blocks a different associate from paying the booking amount', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'HOLD',
        heldByAssociateId,
        requestingAssociateId: 'assoc-other',
        paymentType: 'BOOKING',
        amount: 50000,
        propertyPrice,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Only full payment (in person) can override this hold.');
    });

    it('allows a different associate to override with a full payment', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'HOLD',
        heldByAssociateId,
        requestingAssociateId: 'assoc-other',
        paymentType: 'FULL_PAYMENT',
        amount: propertyPrice,
        propertyPrice,
      });
      expect(res.allowed).toBe(true);
    });

    it('blocks a different associate from overriding if they pay less than full price', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'HOLD',
        heldByAssociateId,
        requestingAssociateId: 'assoc-other',
        paymentType: 'FULL_PAYMENT',
        amount: 999999, // less than 10 Lakhs
        propertyPrice,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Only full payment (at least 1000000) can override this hold.');
    });
  });

  // ─── Booked / Sold Property ─────────────────────────────────────────────────
  describe('when property is BOOKED or SOLD', () => {
    it('blocks any booking attempt on BOOKED property', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'BOOKED',
        heldByAssociateId: null,
        requestingAssociateId: 'assoc-1',
        paymentType: 'BOOKING',
        amount: 50000,
        propertyPrice,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('Property is already booked or sold');
    });

    it('blocks any booking attempt on SOLD property', () => {
      const res = validateHoldAndBooking({
        propertyStatus: 'SOLD',
        heldByAssociateId: null,
        requestingAssociateId: 'assoc-1',
        paymentType: 'FULL_PAYMENT',
        amount: propertyPrice,
        propertyPrice,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('Property is already booked or sold');
    });
  });
});
