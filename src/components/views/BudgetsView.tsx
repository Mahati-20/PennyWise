import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { getCategoriesForMode } from '../../utils/categories';
import { Budget } from '../../types';
import { Icon } from '../common/Icon';

export const BudgetsView: React.FC = () => {
  const {
    profile,
    budgetsProgress,
    addBudget,
    editBudget,
    deleteBudget,
    applySuggestedBudgets,
  } = useFinancial();

  const categories = getCategoriesForMode(profile.mode);
  const currency = profile.currency;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // New Budget Form State
  const [category, setCategory] = useState(categories[0]?.name || 'Other');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'semester'>('monthly');

  // Overall budget utilization
  const totalAllocated = budgetsProgress.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetsProgress.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) return;

    addBudget({
      category,
      limit: parsedLimit,
      period,
    });

    setIsAddModalOpen(false);
    setLimit('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Budgets & Smart Allocations</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Set category guardrails and monitor your burn rate before payday
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={applySuggestedBudgets}
            className="px-3.5 py-2 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-turquoise/30 text-xs font-semibold text-turquoise transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="Wand2" size={14} />
            Generate Smart Suggestions
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-turquoise text-midnight text-xs font-bold shadow-glow-turquoise transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            Add Budget Limit
          </button>
        </div>
      </div>

      {/* Aggregate Health Metric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-xs text-text-muted block mb-1">Total Monthly Budget</span>
          <span className="text-2xl font-mono font-bold text-text-primary">
            {formatCurrency(totalAllocated, currency)}
          </span>
          <p className="text-[11px] text-text-secondary mt-1">
            Across {budgetsProgress.length} active categories
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-xs text-text-muted block mb-1">Total Spent This Month</span>
          <span className="text-2xl font-mono font-bold text-semantic-warning">
            {formatCurrency(totalSpent, currency)}
          </span>
          <p className="text-[11px] text-text-secondary mt-1 font-mono">
            {overallPercentage}% of total budget consumed
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10">
          <span className="text-xs text-text-muted block mb-1">Remaining Discretionary</span>
          <span className="text-2xl font-mono font-bold text-turquoise">
            {formatCurrency(Math.max(0, totalAllocated - totalSpent), currency)}
          </span>
          <p className="text-[11px] text-text-secondary mt-1">
            Safe to spend for the rest of this cycle
          </p>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetsProgress.map(b => {
          const isOver = b.status === 'over';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-midnight-surface/80 border transition-all ${
                isOver
                  ? 'border-semantic-error/40 shadow-sm'
                  : isWarning
                  ? 'border-semantic-warning/40 shadow-sm'
                  : 'border-white/10 hover:border-turquoise/30'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isOver
                        ? 'bg-semantic-error/15 text-semantic-error'
                        : isWarning
                        ? 'bg-semantic-warning/15 text-semantic-warning'
                        : 'bg-turquoise/15 text-turquoise'
                    }`}
                  >
                    <Icon name="PieChart" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{b.category}</h3>
                    <span className="text-[10px] text-text-muted capitalize">
                      {b.period} Allocation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingBudget(b)}
                    className="p-1.5 text-text-muted hover:text-text-primary rounded-lg"
                    title="Edit Limit"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="p-1.5 text-text-muted hover:text-semantic-error rounded-lg"
                    title="Delete Budget"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">Spent: {formatCurrency(b.spent, currency)}</span>
                  <span className="font-bold text-text-primary">Limit: {formatCurrency(b.limit, currency)}</span>
                </div>

                <div className="w-full h-2 rounded-full bg-midnight overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-semantic-error'
                        : isWarning
                        ? 'bg-semantic-warning'
                        : 'bg-turquoise'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span
                    className={`font-semibold ${
                      isOver
                        ? 'text-semantic-error'
                        : isWarning
                        ? 'text-semantic-warning'
                        : 'text-text-muted'
                    }`}
                  >
                    {isOver
                      ? `Exceeded by ${formatCurrency(b.spent - b.limit, currency)}`
                      : `${formatCurrency(b.remaining, currency)} left to spend`}
                  </span>
                  <span className="font-mono font-bold text-text-secondary">{b.percentage}%</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-text-muted text-[11px]">Health Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isOver
                      ? 'bg-semantic-error/15 text-semantic-error border border-semantic-error/30'
                      : isWarning
                      ? 'bg-semantic-warning/15 text-semantic-warning border border-semantic-warning/30'
                      : 'bg-semantic-success/15 text-semantic-success border border-semantic-success/30'
                  }`}
                >
                  {isOver ? 'Over Budget' : isWarning ? 'Approaching Limit' : 'Healthy'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Create Category Budget</h3>
            <form onSubmit={handleCreateBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Spending Limit ({currency})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Period</label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                >
                  <option value="monthly">Monthly</option>
                  <option value="semester">Semester</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Edit Budget: {editingBudget.category}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                editBudget(editingBudget.id, editingBudget);
                setEditingBudget(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-text-secondary mb-1">Spending Limit ({currency})</label>
                <input
                  type="number"
                  step="any"
                  value={editingBudget.limit}
                  onChange={e =>
                    setEditingBudget({
                      ...editingBudget,
                      limit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="px-3.5 py-2 text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
                >
                  Update Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
