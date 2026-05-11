'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

export default function EMICalculatorPage() {
  const { t } = useI18n();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState(null);

  const calculateEMI = (e) => {
    e.preventDefault();
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const n = parseInt(tenure);

    if (!P || !annualRate || !n) return;

    const r = annualRate / 12 / 100; // monthly interest rate
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setResult({
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">{t('properties.emi.title')}</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Plan your property investment with our easy EMI calculator
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <form onSubmit={calculateEMI} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('properties.emi.principal')}
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="e.g. 5000000"
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('properties.emi.rate')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 8.5"
                  required
                  min="0.1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('properties.emi.tenure')}
                </label>
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="e.g. 240"
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg"
              >
                {t('properties.emi.calculate')}
              </button>
            </form>

            {/* Results */}
            {result && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('properties.emi.monthly')}</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {formatCurrency(result.emi)}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('properties.emi.totalInterest')}</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {formatCurrency(result.totalInterest)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('properties.emi.totalPayment')}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(result.totalPayment)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formula explanation */}
          <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">How EMI is calculated</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              EMI = P × r × (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> - 1)
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Where P = Principal, r = Monthly interest rate, n = Number of months
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
