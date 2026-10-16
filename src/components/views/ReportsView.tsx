import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { Icon } from '../common/Icon';

export const ReportsView: React.FC = () => {
  const { profile, transactions, budgetsProgress, incomeThisMonth, expenseThisMonth, netSavingsRate } =
    useFinancial();
  const currency = profile.currency;

  const [dateRange, setDateRange] = useState<'30days' | '90days' | 'year'>('30days');

  // Compute category breakdown from transactions
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: Math.round((amt / totalExpense) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top spending category
  const topCategory = sortedCategories[0];

  // Average daily burn rate
  const now = new Date();
  const daysPassed = Math.max(1, now.getDate());
  const avgDailyBurn = Math.round(expenseThisMonth / daysPassed);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Reports & Insights</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Holistic analytics on cash flow retention, spending distribution, and budget health
          </p>
        </div>

        {/* Date range filter pills */}
        <div className="flex items-center rounded-xl bg-midnight p-1 border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setDateRange('30days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '30days'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('90days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === '90days'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'year'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* High-Level Financial Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block mb-1">
            Cash Retained
          </span>
          <span className="text-2xl font-mono font-bold text-semantic-success">
            {formatCurrency(Math.max(0, incomeThisMonth - expenseThisMonth), currency)}
          </span>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            Net Savings Rate: {netSavingsRate}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block mb-1">
            Average Daily Burn
          </span>
          <span className="text-2xl font-mono font-bold text-text-primary">
            {formatCurrency(avgDailyBurn, currency)}
            <span className="text-xs font-normal text-text-muted font-sans"> / day</span>
          </span>
          <p className="text-[10px] text-text-muted mt-1">Based on this cycle</p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block mb-1">
            Top Spend Category
          </span>
          <span className="text-lg font-bold text-turquoise truncate block">
            {topCategory ? topCategory.category : 'N/A'}
          </span>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            {topCategory ? `${formatCurrency(topCategory.amount, currency)} (${topCategory.percentage}%)` : 'No data'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block mb-1">
            Budget Health Score
          </span>
          <span className="text-2xl font-mono font-bold text-lavender">
            {budgetsProgress.filter(b => b.status === 'healthy').length} / {budgetsProgress.length}
          </span>
          <p className="text-[10px] text-text-muted mt-1">Categories in healthy range</p>
        </div>
      </div>

      {/* Visual Charts: Cash Inflow vs Outflow & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inflow vs Outflow Comparison (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Cash Flow Balance</h3>
              <p className="text-[11px] text-text-muted">Inflow vs Outflow this cycle</p>
            </div>
            <span className="text-xs font-mono font-bold text-turquoise">
              {netSavingsRate}% Saved
            </span>
          </div>

          {/* Bar comparison */}
          <div className="space-y-4 my-6">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-semantic-success" />
                  Total Income / Allowance
                </span>
                <span className="font-mono font-bold text-text-primary">
                  {formatCurrency(incomeThisMonth, currency)}
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-midnight overflow-hidden">
                <div className="h-full bg-semantic-success rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-semantic-warning" />
                  Total Expenses
                </span>
                <span className="font-mono font-bold text-text-primary">
                  {formatCurrency(expenseThisMonth, currency)}
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-midnight overflow-hidden">
                <div
                  className="h-full bg-semantic-warning rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      incomeThisMonth > 0 ? (expenseThisMonth / incomeThisMonth) * 100 : 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-midnight border border-white/5 text-xs text-text-secondary">
            💡 {profile.mode === 'campus'
              ? 'Campus Rule of Thumb: Aim to retain at least 15% of your allowance for semester emergency cushioning.'
              : 'Pro Wealth Rule: Targeting a 30%+ cash retention rate significantly accelerates financial independence.'}
          </div>
        </div>

        {/* Category Spending Breakdown (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 shadow-subtle-elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Category Distribution</h3>
              <p className="text-[11px] text-text-muted">Proportional spending across categories</p>
            </div>
            <span className="text-xs text-text-muted">{sortedCategories.length} Categories</span>
          </div>

          {/* List of categories with proportional bars */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {sortedCategories.map((item, idx) => {
              const colors = ['#40D9D0', '#B9A7FF', '#5ED6A2', '#F2C66D', '#F08091', '#38BDF8'];
              const color = colors[idx % colors.length];

              return (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-text-primary truncate max-w-[180px]">
                      {item.category}
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
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
