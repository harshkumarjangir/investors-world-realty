import fc from 'fast-check';
import { calculateEMI, getEMISchedule } from '../../src/services/emi.service.js';
import { principalArb, annualRateArb, tenureArb } from '../helpers/generators.js';

describe('Feature: investors-world-platform, Property 4: EMI Calculation Correctness', () => {
  it('EMI matches the reducing balance formula', () => {
    fc.assert(
      fc.property(principalArb, annualRateArb, tenureArb, (P, R, n) => {
        const result = calculateEMI(P, R, n);
        const r = R / 12 / 100;
        const expected = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        // Allow 1% tolerance for floating-point differences
        const tolerance = Math.max(1, expected * 0.01);
        expect(Math.abs(result.emi - parseFloat(expected.toFixed(2)))).toBeLessThan(tolerance);
      }),
      { numRuns: 100 },
    );
  });

  it('EMI schedule principal components sum to P within rounding tolerance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10000, max: 10000000, noNaN: true }),
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.integer({ min: 1, max: 120 }),
        (P, R, n) => {
          const schedule = getEMISchedule(P, R, n);
          expect(schedule.length).toBe(n);

          const totalPrincipal = schedule.reduce((sum, row) => sum + row.principalComponent, 0);
          // Allow 0.1% tolerance for accumulated rounding
          expect(Math.abs(totalPrincipal - P)).toBeLessThan(P * 0.001 + 10);
        },
      ),
      { numRuns: 100 },
    );
  });
});
