'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

const incomeTypes = [
  {
    title: 'Direct Income',
    percentage: '10%',
    description: 'Earn 10% commission on every direct referral who purchases a property package. When someone you personally refer joins and invests, you receive an immediate payout.',
    example: 'If your referral buys a ₹5,00,000 package, you earn ₹50,000 instantly.',
  },
  {
    title: 'Level Income',
    percentage: '1-5%',
    description: 'Earn from up to 10 levels deep in your network. As your team grows and their members invest, you receive a percentage from each level — creating a sustainable passive income stream.',
    example: 'Level 1: 5%, Level 2: 3%, Level 3-5: 2%, Level 6-10: 1%',
  },
  {
    title: 'Matching Income',
    percentage: '10%',
    description: 'Receive a matching bonus when your direct referrals earn their level income. This rewards you for mentoring and supporting your team members to succeed.',
    example: 'If your direct referral earns ₹1,00,000 in level income, you get ₹10,000 as matching bonus.',
  },
  {
    title: 'Reward Income',
    percentage: 'Milestone',
    description: 'Achieve business milestones and unlock exclusive rewards including international trips, luxury cars, and cash bonuses. These are designed to celebrate your growth achievements.',
    example: '₹10L business: Gold reward, ₹50L: International trip, ₹1Cr: Luxury car',
  },
];

export default function IncomePage() {
  const { t } = useI18n();
  const [calcForm, setCalcForm] = useState({ referrals: '', depth: '', package: '500000' });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/public/commission-calculator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrals: parseInt(calcForm.referrals),
            depth: parseInt(calcForm.depth),
            package: parseInt(calcForm.package),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCalcResult(data);
          setCalcLoading(false);
          return;
        }
      } catch {
        // fallthrough to local calculation
      }
    }

    // Local fallback calculation
    const referrals = parseInt(calcForm.referrals) || 0;
    const depth = parseInt(calcForm.depth) || 0;
    const pkg = parseInt(calcForm.package) || 500000;

    const directIncome = referrals * pkg * 0.10;
    const levelRates = [0.05, 0.03, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01];
    let levelIncome = 0;
    for (let i = 0; i < Math.min(depth, 10); i++) {
      const membersAtLevel = Math.pow(referrals, i + 1);
      levelIncome += membersAtLevel * pkg * (levelRates[i] || 0.01);
    }
    const matchingIncome = directIncome * 0.10;
    const totalIncome = directIncome + levelIncome + matchingIncome;

    setCalcResult({
      directIncome: Math.round(directIncome),
      levelIncome: Math.round(levelIncome),
      matchingIncome: Math.round(matchingIncome),
      totalIncome: Math.round(totalIncome),
    });
    setCalcLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">{t('income.title')}</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Multiple income streams to build your financial freedom
          </p>
        </div>
      </section>

      {/* Income Types */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomeTypes.map((income, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{income.title}</h3>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-semibold rounded-full">
                    {income.percentage}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {income.description}
                </p>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Example: </span>
                    {income.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Calculator */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('income.calculator.title')}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Estimate your potential earnings based on your network
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleCalculate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('income.calculator.referrals')}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={calcForm.referrals}
                  onChange={(e) => setCalcForm({ ...calcForm, referrals: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('income.calculator.depth')}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={calcForm.depth}
                  onChange={(e) => setCalcForm({ ...calcForm, depth: e.target.value })}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('income.calculator.package')}
                </label>
                <select
                  value={calcForm.package}
                  onChange={(e) => setCalcForm({ ...calcForm, package: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="250000">₹2,50,000 - Silver</option>
                  <option value="500000">₹5,00,000 - Gold</option>
                  <option value="1000000">₹10,00,000 - Platinum</option>
                  <option value="2500000">₹25,00,000 - Diamond</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={calcLoading}
                className="w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-lg"
              >
                {calcLoading ? 'Calculating...' : t('income.calculator.calculate')}
              </button>
            </form>

            {/* Results */}
            {calcResult && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Estimated Earnings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-slate-700 dark:text-slate-300">Direct Income</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(calcResult.directIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <span className="text-slate-700 dark:text-slate-300">Level Income</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(calcResult.levelIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <span className="text-slate-700 dark:text-slate-300">Matching Income</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(calcResult.matchingIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Potential Income</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(calcResult.totalIncome)}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                  * This is an estimate based on ideal conditions. Actual earnings may vary based on team performance and market conditions.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
