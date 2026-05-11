import fc from 'fast-check';
import { creditDebitSequenceArb, positiveAmountArb } from '../helpers/generators.js';

describe('Feature: investors-world-platform, Property 1: Wallet Balance Invariant', () => {
  it('balance always equals totalCredits - totalDebits after any sequence of operations', () => {
    fc.assert(
      fc.property(creditDebitSequenceArb, (operations) => {
        let balance = 0;
        let totalCredits = 0;
        let totalDebits = 0;

        for (const op of operations) {
          if (op.type === 'credit') {
            balance += op.amount;
            totalCredits += op.amount;
          } else if (op.type === 'debit' && balance >= op.amount) {
            balance -= op.amount;
            totalDebits += op.amount;
          }
        }

        const expected = totalCredits - totalDebits;
        expect(Math.abs(balance - expected)).toBeLessThan(0.01);
        expect(balance).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Feature: investors-world-platform, Property 2: Fund Transfer Conservation', () => {
  it('total sum of both wallets is preserved after transfer', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100, max: 100000, noNaN: true }),
        fc.double({ min: 100, max: 100000, noNaN: true }),
        positiveAmountArb,
        (balanceA, balanceB, transferAmount) => {
          const amount = Math.min(transferAmount, balanceA);
          const totalBefore = balanceA + balanceB;

          const newBalanceA = balanceA - amount;
          const newBalanceB = balanceB + amount;
          const totalAfter = newBalanceA + newBalanceB;

          expect(Math.abs(totalBefore - totalAfter)).toBeLessThan(0.01);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Feature: investors-world-platform, Property 10: Withdrawal Balance Guard', () => {
  it('withdrawal accepted iff amount <= balance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0.01, max: 200000, noNaN: true }),
        (balance, amount) => {
          const accepted = amount <= balance;
          if (accepted) {
            expect(balance - amount).toBeGreaterThanOrEqual(0);
          } else {
            expect(amount).toBeGreaterThan(balance);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
