import fc from 'fast-check';

// ─── Associate Generators ─────────────────────────────────────────────────────

export const associateNameArb = fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length > 0);

export const phoneArb = fc.integer({ min: 6, max: 9 }).chain((first) =>
  fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
    .map((digits) => `${first}${digits.join('')}`),
);

export const emailArb = fc.emailAddress();

export const passwordArb = fc.tuple(
  fc.string({ minLength: 4, maxLength: 20 }),
  fc.constantFrom('A', 'B', 'C', 'Z'),
  fc.constantFrom('1', '2', '3', '9'),
  fc.constantFrom('!', '@', '#', '$'),
).map(([base, upper, num, special]) => `${base}${upper}${num}${special}`);

export const weakPasswordArb = fc.string({ minLength: 1, maxLength: 7 });

// ─── Financial Generators ─────────────────────────────────────────────────────

export const positiveAmountArb = fc.double({ min: 0.01, max: 1000000, noNaN: true });

export const walletBalanceArb = fc.double({ min: 0, max: 10000000, noNaN: true });

export const creditDebitSequenceArb = fc.array(
  fc.record({
    type: fc.constantFrom('credit', 'debit'),
    amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  }),
  { minLength: 1, maxLength: 50 },
);

// ─── EMI Generators ───────────────────────────────────────────────────────────

export const principalArb = fc.double({ min: 10000, max: 100000000, noNaN: true });
export const annualRateArb = fc.double({ min: 0.1, max: 30, noNaN: true });
export const tenureArb = fc.integer({ min: 1, max: 360 });

// ─── Tree Generators ──────────────────────────────────────────────────────────

export const legArb = fc.constantFrom('LEFT', 'RIGHT');
export const depthArb = fc.integer({ min: 1, max: 10 });

// ─── Page Size Generators ─────────────────────────────────────────────────────

export const pageSizeArb = fc.integer({ min: -10, max: 200 });
export const validPageSizeArb = fc.integer({ min: 1, max: 100 });
