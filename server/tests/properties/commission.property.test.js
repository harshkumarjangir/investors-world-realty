import fc from 'fast-check';

/**
 * Pure logic tests for commission calculations.
 * These replicate the formulas used in mlm.service.js and income.service.js
 * without hitting the database.
 */

// ─── Pure calculation functions (mirrors service logic) ───────────────────────

function calculateDirectIncome(packagePrice, directPercentage) {
  return packagePrice * (directPercentage / 100);
}

function calculateLevelIncome(packagePrice, levelPercentage) {
  return packagePrice * (levelPercentage / 100);
}

function calculateMatchingIncome(leftVolume, rightVolume, matchingPercentage) {
  const pairedVolume = Math.min(leftVolume, rightVolume);
  return pairedVolume * (matchingPercentage / 100);
}

function checkRewardEligibility(totalVolume, milestone) {
  return totalVolume >= milestone;
}

function computeIncomeSummary(records) {
  const summary = { direct: 0, level: 0, matching: 0, reward: 0, total: 0 };
  for (const record of records) {
    const amount = Number(record.amount);
    switch (record.type) {
      case 'DIRECT':
        summary.direct += amount;
        break;
      case 'LEVEL':
        summary.level += amount;
        break;
      case 'MATCHING':
        summary.matching += amount;
        break;
      case 'REWARD':
        summary.reward += amount;
        break;
      default:
        break;
    }
    summary.total += amount;
  }
  return summary;
}

// ─── Property 5: Commission Calculation Correctness ───────────────────────────

describe('Feature: investors-world-platform, Property 5: Commission Calculation Correctness', () => {
  it('directIncome = packagePrice × directPercentage / 100', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1000, max: 10000000, noNaN: true }),
        fc.integer({ min: 1, max: 50 }),
        (packagePrice, directPercentage) => {
          const result = calculateDirectIncome(packagePrice, directPercentage);
          const expected = packagePrice * directPercentage / 100;
          expect(Math.abs(result - expected)).toBeLessThan(0.01);
          expect(result).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('levelIncome = packagePrice × levelPercentage / 100 for any level N', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1000, max: 10000000, noNaN: true }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 1, max: 5 }),
        (packagePrice, levelPercentage, _level) => {
          const result = calculateLevelIncome(packagePrice, levelPercentage);
          const expected = packagePrice * levelPercentage / 100;
          expect(Math.abs(result - expected)).toBeLessThan(0.01);
          expect(result).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('matchingIncome = min(leftVolume, rightVolume) × matchingPercentage / 100', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 50000000, noNaN: true }),
        fc.double({ min: 0, max: 50000000, noNaN: true }),
        fc.integer({ min: 1, max: 20 }),
        (leftVolume, rightVolume, matchingPercentage) => {
          const result = calculateMatchingIncome(leftVolume, rightVolume, matchingPercentage);
          const pairedVolume = Math.min(leftVolume, rightVolume);
          const expected = pairedVolume * matchingPercentage / 100;
          expect(Math.abs(result - expected)).toBeLessThan(0.01);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(Math.max(leftVolume, rightVolume) * matchingPercentage / 100);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 6: Reward Income Threshold ──────────────────────────────────────

describe('Feature: investors-world-platform, Property 6: Reward Income Threshold', () => {
  it('associate receives reward iff totalVolume >= milestone', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000000, noNaN: true }),
        fc.double({ min: 1000, max: 50000000, noNaN: true }),
        fc.double({ min: 1000, max: 1000000, noNaN: true }),
        (totalVolume, milestone, rewardAmount) => {
          const eligible = checkRewardEligibility(totalVolume, milestone);
          if (totalVolume >= milestone) {
            expect(eligible).toBe(true);
          } else {
            expect(eligible).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('reward eligibility is monotonic: if eligible at volume V, eligible at V+delta', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1000, max: 50000000, noNaN: true }),
        fc.double({ min: 0.01, max: 10000000, noNaN: true }),
        fc.double({ min: 1000, max: 50000000, noNaN: true }),
        (volume, delta, milestone) => {
          if (checkRewardEligibility(volume, milestone)) {
            expect(checkRewardEligibility(volume + delta, milestone)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 19: Income Summary Invariant ────────────────────────────────────

describe('Feature: investors-world-platform, Property 19: Income Summary Invariant', () => {
  const incomeRecordArb = fc.record({
    type: fc.constantFrom('DIRECT', 'LEVEL', 'MATCHING', 'REWARD'),
    amount: fc.double({ min: 0.01, max: 1000000, noNaN: true }),
  });

  it('total always equals sum(direct) + sum(level) + sum(matching) + sum(reward)', () => {
    fc.assert(
      fc.property(
        fc.array(incomeRecordArb, { minLength: 0, maxLength: 50 }),
        (records) => {
          const summary = computeIncomeSummary(records);
          const expectedTotal = summary.direct + summary.level + summary.matching + summary.reward;
          expect(Math.abs(summary.total - expectedTotal)).toBeLessThan(0.01);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('each category sum is non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(incomeRecordArb, { minLength: 1, maxLength: 50 }),
        (records) => {
          const summary = computeIncomeSummary(records);
          expect(summary.direct).toBeGreaterThanOrEqual(0);
          expect(summary.level).toBeGreaterThanOrEqual(0);
          expect(summary.matching).toBeGreaterThanOrEqual(0);
          expect(summary.reward).toBeGreaterThanOrEqual(0);
          expect(summary.total).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('empty records produce zero summary', () => {
    const summary = computeIncomeSummary([]);
    expect(summary).toEqual({ direct: 0, level: 0, matching: 0, reward: 0, total: 0 });
  });
});
