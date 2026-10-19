import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { Icon } from '../common/Icon';

export const ReportsView: React.FC = () => {
  const { profile, transactions, budgetsProgress } = useFinancial();
  const currency = profile.currency;

  const [dateRange, setDateRange] = useState<'30days' | '90days' | 'year'>('30days');

  const now = new Date();
  const currentYear = now.getFullYear();

  // Filter transactions according to selected date range
  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return true;
    const txDate = new Date(t.date);
    if (isNaN(txDate.getTime())) return true;
    const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
    if (dateRange === '30days') return diffDays <= 31;
    if (dateRange === '90days') return diffDays <= 92;
    if (dateRange === 'year') return txDate.getFullYear() === currentYear;
    return true;
  });

  const periodIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodRetained = Math.max(0, periodIncome - periodExpense);
  const periodSavingsRate =
    periodIncome > 0 ? Math.max(0, Math.round(((periodIncome - periodExpense) / periodIncome) * 100)) : 0;

  // Compute category breakdown from filtered transactions
  const categoryTotals: Record<string, number> = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: periodExpense > 0 ? Math.round((amt / periodExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top spending category
  const topCategory = sortedCategories[0];

  // Average daily burn rate
  const daysInPeriod = dateRange === '30days' ? Math.max(1, now.getDate()) : dateRange === '90days' ? 90 : 365;
  const avgDailyBurn = Math.round(periodExpense / daysInPeriod);

  // Period title badge
  const periodTitle =
    dateRange === '30days'
      ? `${now.toLocaleString('default', { month: 'long' })} ${currentYear} (Last 30 Days)`
      : dateRange === '90days'
      ? `Quarterly View (Last 90 Days)`
      : `${currentYear} Full Year-to-Date`;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. HEADER & DATE FILTER CONTROLS */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-subtle-elevated">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-turquoise">
              Financial Intelligence
            </span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {periodTitle}
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">Reports & Analytics</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Holistic analytics on cash flow retention, spending distribution, and budget health
          </p>
        </div>

        {/* Date range filter pills */}
        <div className="flex items-center rounded-xl bg-midnight p-1 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setDateRange('30days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '30days'
                ? 'bg-turquoise text-midnight font-bold shadow-glow-turquoise'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('90days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '90days'
                ? 'bg-turquoise text-midnight font-bold shadow-glow-turquoise'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'year'
                ? 'bg-turquoise text-midnight font-bold shadow-glow-turquoise'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* 2. HIGH-LEVEL KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
              Cash Retained
            </span>
            <Icon name="PiggyBank" size={14} className="text-semantic-success" />
          </div>
          <span className="text-2xl font-mono font-bold text-semantic-success block">
            {formatCurrency(periodRetained, currency)}
          </span>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            Net Savings Rate: <span className="text-semantic-success font-bold">{periodSavingsRate}%</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
              Avg Daily Burn
            </span>
            <Icon name="TrendingDown" size={14} className="text-semantic-warning" />
          </div>
          <span className="text-2xl font-mono font-bold text-text-primary block">
            {formatCurrency(avgDailyBurn, currency)}
            <span className="text-xs font-normal text-text-muted font-sans"> / day</span>
          </span>
          <p className="text-[10px] text-text-muted mt-1">Over {daysInPeriod} active days</p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
              Top Outflow Category
            </span>
            <Icon name="PieChart" size={14} className="text-turquoise" />
          </div>
          <span className="text-lg font-bold text-turquoise truncate block">
            {topCategory ? topCategory.category : 'None yet'}
          </span>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            {topCategory
              ? `${formatCurrency(topCategory.amount, currency)} (${topCategory.percentage}%)`
              : 'No expenses in range'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
              Budget Health
            </span>
            <Icon name="ShieldAlert" size={14} className="text-lavender" />
          </div>
          <span className="text-2xl font-mono font-bold text-lavender block">
            {budgetsProgress.filter(b => b.status === 'healthy').length} / {budgetsProgress.length || 0}
          </span>
          <p className="text-[10px] text-text-muted mt-1">
            {budgetsProgress.length === 0 ? 'No budget limits configured' : 'Categories within safe limits'}
          </p>
        </div>
      </div>

      {/* 3. VISUAL CHARTS: CASH FLOW COMPARISON & CATEGORY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inflow vs Outflow Comparison Bar Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 shadow-subtle-elevated flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Cash Flow Balance & Retention</h3>
                <p className="text-[11px] text-text-muted">Inflow vs Outflow — {periodTitle}</p>
              </div>
              <span className="text-xs font-mono font-bold text-turquoise bg-turquoise/10 px-2.5 py-1 rounded-full border border-turquoise/20">
                {periodSavingsRate}% Saved
              </span>
            </div>

            {/* Zero state check for Cash Flow */}
            {periodIncome === 0 && periodExpense === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                  <Icon name="TrendingUp" size={18} />
                </div>
                <p className="font-semibold text-text-primary">No cash flow activity in this window</p>
                <p className="text-[11px] mt-1">Log income or expenses to see your balance comparison.</p>
              </div>
            ) : (
              <div className="space-y-5 my-6">
                {/* Income Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-semantic-success" />
                      Total Inflow (Income / Allowance)
                    </span>
                    <span className="font-mono font-bold text-semantic-success">
                      {formatCurrency(periodIncome, currency)}
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-midnight overflow-hidden border border-white/5 p-0.5">
                    <div
                      className="h-full bg-semantic-success rounded-full transition-all duration-500"
                      style={{ width: `${periodIncome > 0 ? 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>Baseline (100% Inflow)</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Expense Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-semantic-warning" />
                      Total Outflow (Living Expenses)
                    </span>
                    <span className="font-mono font-bold text-semantic-warning">
                      {formatCurrency(periodExpense, currency)}
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-midnight overflow-hidden border border-white/5 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        periodExpense > periodIncome ? 'bg-semantic-error' : 'bg-semantic-warning'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          periodIncome > 0 ? Math.round((periodExpense / periodIncome) * 100) : 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>
                      {periodIncome > 0
                        ? `${Math.round((periodExpense / periodIncome) * 100)}% of income spent`
                        : 'No income recorded'}
                    </span>
                    <span>{periodIncome > 0 ? `${Math.round((periodExpense / periodIncome) * 100)}%` : '—'}</span>
                  </div>
                </div>

                {/* Retained Buffer Bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-lavender" />
                      Net Cash Buffer (Retained)
                    </span>
                    <span className="font-mono font-bold text-lavender">
                      {formatCurrency(periodRetained, currency)}
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-midnight overflow-hidden border border-white/5 p-0.5">
                    <div
                      className="h-full bg-lavender rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          periodIncome > 0 ? Math.round((periodRetained / periodIncome) * 100) : 0
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>Available for savings or next cycle</span>
                    <span>{periodSavingsRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Context takeaway box */}
          <div className="p-3.5 rounded-xl bg-midnight border border-white/5 text-xs text-text-secondary mt-4">
            <span className="font-semibold text-text-primary block mb-0.5">💡 Rule of Thumb Guidance</span>
            {profile.mode === 'campus'
              ? 'Campus Benchmark: Strive to retain at least 15% of your allowance to cushion end-of-semester projects and social events.'
              : 'Pro Wealth Benchmark: A sustained 30%+ cash retention rate significantly accelerates debt payoff and early retirement runway.'}
          </div>
        </div>

        {/* Right: Category Spending Breakdown (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 shadow-subtle-elevated flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Category Distribution & Proportions</h3>
                <p className="text-[11px] text-text-muted">Where money flowed — {periodTitle}</p>
              </div>
              <span className="text-xs text-text-muted bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {sortedCategories.length} Categories
              </span>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                  <Icon name="PieChart" size={18} />
                </div>
                <p className="font-semibold text-text-primary">No categorized expenses in this period</p>
                <p className="text-[11px] mt-1">
                  Log transactions to see proportional allocation bars across food, transit, rent, and leisure.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 my-4">
                {sortedCategories.map((item, idx) => {
                  const colors = ['#40D9D0', '#B9A7FF', '#5ED6A2', '#F2C66D', '#F08091', '#38BDF8'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={item.category} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate max-w-[180px]">{item.category}</span>
                        </span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-text-muted text-[11px]">{item.percentage}%</span>
                          <span className="font-bold text-text-primary">
                            {formatCurrency(item.amount, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-midnight overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plain-Language Takeaway Banner */}
          <div className="p-3.5 rounded-xl bg-midnight border border-turquoise/20 text-xs text-text-secondary mt-4">
            <span className="font-bold text-turquoise block mb-0.5">Executive Takeaway</span>
            {periodExpense === 0 ? (
              <p>No outflows recorded. Your funds remain 100% intact.</p>
            ) : topCategory ? (
              <p>
                Your dominant spending driver is <strong className="text-text-primary">{topCategory.category}</strong> at{' '}
                <strong className="text-turquoise">{formatCurrency(topCategory.amount, currency)}</strong>, representing{' '}
                <strong className="text-text-primary">{topCategory.percentage}%</strong> of total period expenses.
              </p>
            ) : (
              <p>Spending is evenly distributed across your tracked categories.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
