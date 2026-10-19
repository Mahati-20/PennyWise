import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { MoneyOrbit } from '../dashboard/MoneyOrbit';
import { Icon } from '../common/Icon';

interface DashboardViewProps {
  onOpenQuickAdd: (type?: 'expense' | 'income') => void;
  onOpenAnalyzer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickAdd,
  onOpenAnalyzer,
}) => {
  const {
    profile,
    currentBalance,
    availableToSpendInfo,
    incomeThisMonth,
    expenseThisMonth,
    netSavingsRate,
    budgetsProgress,
    goals,
    events,
    transactions,
    insights,
    dailyAllowance,
    setCurrentView,
  } = useFinancial();

  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const currency = profile.currency;

  // Upcoming bills due in next 14 days
  const upcomingBills = events
    .filter(e => (e.type === 'bill' || e.type === 'subscription') && e.status === 'upcoming')
    .slice(0, 3);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Top coach insight
  const activeInsight = insights.find(i => !i.read) || insights[0];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. FINANCIAL BALANCE HERO CARD */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#16203D] via-[#1B2645] to-[#151E38] border border-white/10 p-6 md:p-8 shadow-subtle-elevated overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-turquoise-glow rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-lavender-glow rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Balances & Calculation */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {profile.mode === 'campus' ? 'Student Financial Position' : 'Liquid Cash Position'}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-turquoise font-medium">
                {profile.collegeOrCompany}
              </span>
            </div>

            {/* Balances Grid: Total Net Liquid Balance & Available to Spend */}
            <div className="flex flex-wrap items-baseline gap-6 md:gap-10">
              <div>
                <span className="text-xs text-text-muted block mb-1">Total Liquid Balance</span>
                <div className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-text-primary">
                  {formatCurrency(currentBalance, currency)}
                </div>
              </div>

              {/* Signature Available to Spend Highlight Card */}
              <div className="relative bg-[#10172E]/70 p-3.5 md:p-4 rounded-2xl border border-turquoise/30 shadow-glow-turquoise">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-turquoise">
                    Available to Spend (Free Cash)
                  </span>
                  <button
                    onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                    className="text-text-muted hover:text-turquoise transition-colors"
                    title="Explain Available-to-Spend formula"
                  >
                    <Icon name="Info" size={14} />
                  </button>
                </div>

                <div className="text-2xl md:text-3xl font-extrabold font-mono text-turquoise tracking-tight">
                  {formatCurrency(availableToSpendInfo.available, currency)}
                </div>

                {/* Formula Explanation Popover */}
                {showFormulaTooltip && (
                  <div className="absolute left-0 top-full mt-2 w-72 md:w-80 p-3.5 rounded-xl bg-midnight border border-turquoise/40 shadow-2xl z-30 text-xs text-text-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-text-primary">Available-to-Spend Math</span>
                      <button onClick={() => setShowFormulaTooltip(false)}>
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                    <p className="mb-2 text-[11px] leading-relaxed">
                      Unlike your total balance, Available-to-Spend guards you against overdrafts by
                      protecting scheduled bills and planned savings.
                    </p>
                    <div className="space-y-1 font-mono text-[10px] bg-[#151E38] p-2 rounded-lg border border-white/5">
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="text-text-primary">
                          {formatCurrency(currentBalance, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-semantic-warning">
                        <span>- Upcoming Bills:</span>
                        <span>
                          {formatCurrency(availableToSpendInfo.upcomingCommitted, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lavender">
                        <span>- Goal Contributions:</span>
                        <span>{formatCurrency(availableToSpendInfo.reservedGoals, currency)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 font-bold text-turquoise">
                        <span>= Safe to Spend:</span>
                        <span>{formatCurrency(availableToSpendInfo.available, currency)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode-Specific Metric Highlight */}
              {profile.mode === 'campus' ? (
                <div className="bg-[#10172E]/50 p-3 rounded-2xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-0.5">
                    Safe Daily Allowance
                  </span>
                  <div className="text-xl font-bold font-mono text-semantic-success">
                    {formatCurrency(dailyAllowance, currency)}
                    <span className="text-xs font-sans text-text-muted font-normal"> / day</span>
                  </div>
                  <span className="text-[10px] text-text-secondary">
                    Based on days remaining this month
                  </span>
                </div>
              ) : (
                <div className="bg-[#10172E]/50 p-3 rounded-2xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-0.5">
                    Emergency Runway
                  </span>
                  <div className="text-xl font-bold font-mono text-lavender">
                    {(currentBalance / (expenseThisMonth || 2500)).toFixed(1)}
                    <span className="text-xs font-sans text-text-muted font-normal"> mo</span>
                  </div>
                  <span className="text-[10px] text-text-secondary">
                    Months of current expenses covered
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Primary Quick Action Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="p-3 rounded-xl bg-midnight-surface hover:bg-midnight border border-white/10 hover:border-semantic-warning/40 transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-text-primary"
            >
              <div className="p-2 rounded-lg bg-semantic-warning/15 text-semantic-warning">
                <Icon name="ArrowUpRight" size={16} />
              </div>
              <span className="font-semibold">Add Expense</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('income')}
              className="p-3 rounded-xl bg-midnight-surface hover:bg-midnight border border-white/10 hover:border-semantic-success/40 transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-text-primary"
            >
              <div className="p-2 rounded-lg bg-semantic-success/15 text-semantic-success">
                <Icon name="ArrowDownLeft" size={16} />
              </div>
              <span className="font-semibold">Add Income</span>
            </button>

            <button
              onClick={onOpenAnalyzer}
              className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-gradient-to-br from-turquoise/20 to-turquoise/5 hover:from-turquoise/30 border border-turquoise/40 transition-all flex flex-col items-center justify-center gap-1.5 text-xs text-turquoise shadow-glow-turquoise font-bold"
            >
              <div className="p-2 rounded-lg bg-turquoise text-midnight">
                <Icon name="ShieldAlert" size={16} />
              </div>
              <span>Can I Afford?</span>
            </button>
          </div>
        </div>

        {/* Hero Period Cash Flow Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-semantic-success/15 text-semantic-success">
              <Icon name="TrendingUp" size={16} />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Income This Month</span>
              <span className="font-mono font-bold text-text-primary">
                {formatCurrency(incomeThisMonth, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-semantic-warning/15 text-semantic-warning">
              <Icon name="TrendingDown" size={16} />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Spent This Month</span>
              <span className="font-mono font-bold text-text-primary">
                {formatCurrency(expenseThisMonth, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lavender/15 text-lavender">
              <Icon name="PiggyBank" size={16} />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Net Savings Rate</span>
              <span className="font-mono font-bold text-lavender">{netSavingsRate}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-turquoise/15 text-turquoise">
              <Icon name="Target" size={16} />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Active Goals</span>
              <span className="font-mono font-bold text-turquoise">
                {goals.length} Projects Funded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROACTIVE COACH HIGHLIGHT BANNER */}
      {activeInsight && (
        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-turquoise/15 text-turquoise shrink-0">
              <Icon name="Sparkles" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">{activeInsight.title}</span>
                <span className="text-[10px] text-text-muted">{activeInsight.timestamp}</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">{activeInsight.explanation}</p>
            </div>
          </div>

          {activeInsight.actionText && (
            <button
              onClick={() => {
                if (activeInsight.actionView) setCurrentView(activeInsight.actionView as any);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-turquoise/30 text-xs font-semibold text-turquoise shrink-0 transition-colors"
            >
              {activeInsight.actionText} →
            </button>
          )}
        </div>
      )}

      {/* 3. CORE TWO-COLUMN GRID: MONEY ORBIT + CATEGORY BUDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Signature Interactive Money Orbit (7 cols) */}
        <div className="lg:col-span-7">
          <MoneyOrbit />
        </div>

        {/* Right: Active Budget Progress & Quick Allocations (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-lavender/10 text-lavender">
                  <Icon name="PieChart" size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Budget Utilization</h3>
                  <p className="text-[11px] text-text-muted">Monthly category allocations</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('budgets')}
                className="text-xs text-turquoise hover:underline font-semibold"
              >
                View All →
              </button>
            </div>

            {/* Budget Progress Bars */}
            {budgetsProgress.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-midnight/60 border border-white/5 text-center my-auto">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
                  <Icon name="PieChart" size={18} />
                </div>
                <p className="text-xs font-semibold text-text-primary">No budget categories yet</p>
                <p className="text-[11px] text-text-muted mt-1 max-w-xs mx-auto">
                  Set monthly caps to track category spending velocity and get alerts before overspending.
                </p>
                <button
                  onClick={() => setCurrentView('budgets')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-midnight-elevated hover:bg-midnight border border-turquoise/30 text-xs font-semibold text-turquoise transition-colors"
                >
                  Create First Budget
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {budgetsProgress.slice(0, 4).map(b => (
                  <div key={b.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">{b.category}</span>
                      <span className="font-mono text-text-secondary">
                        {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-midnight overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          b.status === 'over'
                            ? 'bg-semantic-error'
                            : b.status === 'warning'
                            ? 'bg-semantic-warning'
                            : 'bg-turquoise'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>
                        {b.status === 'over'
                          ? 'Over limit!'
                          : `${formatCurrency(b.remaining, currency)} remaining`}
                      </span>
                      <span className="font-mono">{b.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {budgetsProgress.length === 0
                ? '0 active budgets'
                : `${budgetsProgress.filter(b => b.status === 'over').length} categories over limit`}
            </span>
            <button
              onClick={() => setCurrentView('budgets')}
              className="px-3 py-1.5 rounded-lg bg-midnight border border-white/10 text-xs font-medium text-text-primary hover:border-turquoise/30"
            >
              {budgetsProgress.length === 0 ? 'Setup Budgets' : 'Adjust Allocations'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. GOALS PROGRESS & UPCOMING BILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Savings Goals Studio Snapshot (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-semantic-success/15 text-semantic-success">
                  <Icon name="Target" size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Savings Goals</h3>
                  <p className="text-[11px] text-text-muted">Active targets & milestones</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('goals')}
                className="text-xs text-turquoise hover:underline font-semibold"
              >
                Open Studio →
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-midnight/60 border border-white/5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-semantic-success/10 text-semantic-success flex items-center justify-center">
                  <Icon name="Target" size={18} />
                </div>
                <p className="text-xs font-semibold text-text-primary">No savings goals yet</p>
                <p className="text-[11px] text-text-muted mt-1 max-w-xs mx-auto">
                  Define a target like an emergency cushion, gadget, or trip to automate monthly progress.
                </p>
                <button
                  onClick={() => setCurrentView('goals')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-midnight-elevated hover:bg-midnight border border-semantic-success/30 text-xs font-semibold text-semantic-success transition-colors"
                >
                  Set a Savings Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map(g => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div
                      key={g.id}
                      onClick={() => setCurrentView('goals')}
                      className="p-3 rounded-xl bg-midnight border border-white/5 hover:border-white/20 cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">{g.name}</span>
                        <span className="text-xs font-mono font-bold text-semantic-success">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-midnight-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-turquoise to-[#5ED6A2] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-text-muted font-mono">
                        <span>{formatCurrency(g.currentAmount, currency)}</span>
                        <span>Target: {formatCurrency(g.targetAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Commitments & Bills (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-semantic-warning/15 text-semantic-warning">
                  <Icon name="CalendarClock" size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Upcoming Commitments</h3>
                  <p className="text-[11px] text-text-muted">Scheduled bills & subscriptions</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('calendar')}
                className="text-xs text-turquoise hover:underline font-semibold"
              >
                Calendar →
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-midnight/60 border border-white/5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-semantic-warning/10 text-semantic-warning flex items-center justify-center">
                  <Icon name="CalendarClock" size={18} />
                </div>
                <p className="text-xs font-semibold text-text-primary">No bills due in the next 14 days</p>
                <p className="text-[11px] text-text-muted mt-1 max-w-xs mx-auto">
                  Schedule rent, subscriptions, or utility dates in your calendar so Available-to-Spend reserves them automatically.
                </p>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-midnight-elevated hover:bg-midnight border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Manage Calendar
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingBills.map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-midnight border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/5 text-semantic-warning">
                        <Icon name="AlertCircle" size={14} />
                      </div>
                      <div>
                        <span className="font-semibold text-text-primary block">{b.title}</span>
                        <span className="text-[11px] text-text-muted">Due on {b.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-text-primary block">
                        {formatCurrency(b.amount, currency)}
                      </span>
                      <span className="text-[10px] text-turquoise">Reserved in funds</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY LEDGER */}
      <div className="rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
              <Icon name="Receipt" size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
              <p className="text-[11px] text-text-muted">Latest verified transactions</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('transactions')}
            className="text-xs text-turquoise hover:underline font-semibold"
          >
            All Activity ({transactions.length}) →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 px-4 rounded-xl bg-midnight/40 border border-white/5 text-center">
            <div className="w-12 h-12 mx-auto mb-2.5 rounded-full bg-turquoise/10 text-turquoise flex items-center justify-center">
              <Icon name="Receipt" size={20} />
            </div>
            <h4 className="text-xs font-bold text-text-primary">No transactions recorded yet</h4>
            <p className="text-[11px] text-text-muted mt-1 max-w-sm mx-auto">
              Add your first expense or income to see live cash flow, calculate available-to-spend, and activate your Money Orbit rings.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="px-3.5 py-1.5 rounded-xl bg-midnight-surface hover:bg-midnight border border-white/10 hover:border-semantic-warning/40 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-semantic-warning" />
                Add First Expense
              </button>
              <button
                onClick={() => onOpenQuickAdd('income')}
                className="px-3.5 py-1.5 rounded-xl bg-midnight-surface hover:bg-midnight border border-white/10 hover:border-semantic-success/40 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-semantic-success" />
                Add Income
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentTransactions.map(t => {
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isIncome
                          ? 'bg-semantic-success/15 text-semantic-success'
                          : 'bg-semantic-warning/15 text-semantic-warning'
                      }`}
                    >
                      <Icon name={isIncome ? 'ArrowDownLeft' : 'ArrowUpRight'} size={15} />
                    </div>
                    <div>
                      <span className="font-semibold text-text-primary block">{t.description}</span>
                      <span className="text-[11px] text-text-muted">
                        {t.category} • {t.date} • {t.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        isIncome ? 'text-semantic-success' : 'text-text-primary'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

