// ─── calculateEMI ─────────────────────────────────────────────────────────────

/**
 * Calculate EMI, total payment, and total interest.
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (e.g. 8.5 for 8.5%)
 * @param {number} tenureMonths - Loan tenure in months (must be a positive integer)
 * @returns {{ emi, totalInterest, totalPayment }}
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || principal <= 0) {
    throw Object.assign(new Error('principal must be greater than 0'), { statusCode: 400 });
  }
  if (!annualRate || annualRate <= 0) {
    throw Object.assign(new Error('annualRate must be greater than 0'), { statusCode: 400 });
  }
  if (!tenureMonths || tenureMonths <= 0 || !Number.isInteger(Number(tenureMonths))) {
    throw Object.assign(new Error('tenureMonths must be a positive integer'), { statusCode: 400 });
  }

  const P = Number(principal);
  const n = Number(tenureMonths);
  const r = Number(annualRate) / 12 / 100;

  const onePlusRPowN = Math.pow(1 + r, n);
  const emi = (P * r * onePlusRPowN) / (onePlusRPowN - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return {
    emi: parseFloat(emi.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
  };
}

// ─── getEMISchedule ───────────────────────────────────────────────────────────

/**
 * Generate a month-by-month EMI amortization schedule.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} tenureMonths
 * @returns {Array<{ month, principalComponent, interestComponent, remainingBalance, emi }>}
 */
export function getEMISchedule(principal, annualRate, tenureMonths) {
  const { emi } = calculateEMI(principal, annualRate, tenureMonths);

  const P = Number(principal);
  const n = Number(tenureMonths);
  const r = Number(annualRate) / 12 / 100;

  const schedule = [];
  let remainingBalance = P;

  for (let month = 1; month <= n; month++) {
    const interestComponent = parseFloat((remainingBalance * r).toFixed(2));
    let principalComponent = parseFloat((emi - interestComponent).toFixed(2));

    // Adjust final month to ensure remainingBalance reaches exactly 0
    if (month === n) {
      principalComponent = parseFloat(remainingBalance.toFixed(2));
    }

    remainingBalance = parseFloat((remainingBalance - principalComponent).toFixed(2));

    // Guard against floating-point drift making balance slightly negative
    if (remainingBalance < 0) remainingBalance = 0;

    schedule.push({
      month,
      principalComponent,
      interestComponent,
      remainingBalance,
      emi: parseFloat(emi.toFixed(2)),
    });
  }

  return schedule;
}
