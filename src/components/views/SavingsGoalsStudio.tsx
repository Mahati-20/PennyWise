import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { SavingsGoal } from '../../types';
import { Icon } from '../common/Icon';

export const SavingsGoalsStudio: React.FC = () => {
  const {
    profile,
    goals,
    goalsProjections,
    addGoal,
    editGoal,
    deleteGoal,
    logGoalContribution,
    updateGoalAllocations,
  } = useFinancial();

  const currency = profile.currency;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Interactive Allocation Simulator state
  const [simulatedAllocations, setSimulatedAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    goals.forEach(g => {
      initial[g.id] = g.plannedMonthlyContribution;
    });
    return initial;
  });

  const [hasUnsavedSimulation, setHasUnsavedSimulation] = useState(false);

  // New Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('2027-04-30');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [plannedContribution, setPlannedContribution] = useState('');
  const [category, setCategory] = useState('General');

  // Handle allocation slider change
  const handleSliderChange = (goalId: string, val: number) => {
    setSimulatedAllocations(prev => ({
      ...prev,
      [goalId]: val,
    }));
    setHasUnsavedSimulation(true);
  };

  const handleSaveAllocations = () => {
    updateGoalAllocations(simulatedAllocations);
    setHasUnsavedSimulation(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    logGoalContribution(depositGoalId, amount);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#40D9D0', '#B9A7FF', '#5ED6A2'],
      });
    } catch (err) {
      console.error(err);
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const contNum = parseFloat(plannedContribution) || 0;
    const savedNum = parseFloat(initialSaved) || 0;
    if (isNaN(targetNum) || targetNum <= 0) return;

    addGoal({
      name: name.trim() || 'New Savings Target',
      targetAmount: targetNum,
      currentAmount: savedNum,
      targetDate,
      priority,
      plannedMonthlyContribution: contNum,
      icon: 'Target',
      category,
    });

    setIsAddModalOpen(false);
    setName('');
    setTargetAmount('');
    setInitialSaved('');
    setPlannedContribution('');
  };

  // Total monthly planned savings pool
  const totalMonthlySavingsPlanned = Object.values(simulatedAllocations).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Studio Banner */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-text-primary">Advanced Savings Goals Studio</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-semantic-success/20 text-semantic-success uppercase tracking-wider">
              Interactive Engine
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Simulate monthly contribution trade-offs, project completion dates & celebrate milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedSimulation && (
            <button
              onClick={handleSaveAllocations}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-midnight text-xs font-bold shadow-glow-turquoise transition-all flex items-center gap-1.5 animate-pulse"
            >
              <Icon name="Save" size={14} />
              Save Revised Plan
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-turquoise/30 text-turquoise text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            New Goal
          </button>
        </div>
      </div>

      {/* Simulator Trade-Off Notice */}
      <div className="p-4 rounded-2xl bg-midnight-elevated/70 border border-lavender/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lavender/15 text-lavender shrink-0">
            <Icon name="Sliders" size={18} />
          </div>
          <div>
            <span className="font-bold text-text-primary block">
              Multi-Goal Allocation Simulator
            </span>
            <span className="text-text-secondary text-[11px]">
              Adjust monthly sliders below to explore how prioritizing one goal affects other
              targets. Actual balances will not change until you click "Save Revised Plan".
            </span>
          </div>
        </div>

        <div className="bg-midnight px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0 font-mono">
          <span className="text-text-muted text-[10px] block">Total Monthly Savings Pool</span>
          <span className="font-bold text-turquoise text-sm">
            {formatCurrency(totalMonthlySavingsPlanned, currency)} / month
          </span>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goalsProjections.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const simulatedCont =
            simulatedAllocations[goal.id] ?? goal.plannedMonthlyContribution;

          // Re-project based on simulated allocation
          const remainingToSave = Math.max(0, goal.targetAmount - goal.currentAmount);
          const simulatedMonths = Math.ceil(remainingToSave / (simulatedCont || 1));
          const simProjected = new Date();
          simProjected.setMonth(simProjected.getMonth() + simulatedMonths);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 hover:border-turquoise/30 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      goal.priority === 'High'
                        ? 'bg-semantic-error/15 text-semantic-error border border-semantic-error/30'
                        : goal.priority === 'Medium'
                        ? 'bg-turquoise/15 text-turquoise border border-turquoise/30'
                        : 'bg-lavender/15 text-lavender border border-lavender/30'
                    }`}
                  >
                    {goal.priority} Priority
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setDepositGoalId(goal.id);
                        setDepositAmount('');
                      }}
                      className="px-2 py-1 rounded bg-semantic-success/15 hover:bg-semantic-success/25 text-semantic-success text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Deposit money to this goal"
                    >
                      <Icon name="PlusCircle" size={13} />
                      Deposit
                    </button>
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-1 text-text-muted hover:text-text-primary rounded"
                      title="Edit Goal"
                    >
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-text-muted hover:text-semantic-error rounded"
                      title="Delete Goal"
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-text-primary mb-1">{goal.name}</h3>
                <span className="text-[11px] text-text-muted">{goal.category}</span>
              </div>

              {/* Progress & Saved vs Target */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="font-bold text-turquoise text-sm">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="text-text-muted text-[11px]">
                    Target: {formatCurrency(goal.targetAmount, currency)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-midnight overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-turquoise via-lavender to-semantic-success rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-text-secondary">
                  <span>{pct}% funded</span>
                  <span>{formatCurrency(remainingToSave, currency)} remaining</span>
                </div>
              </div>

              {/* Interactive Allocation Slider for Trade-off testing */}
              <div className="p-3 rounded-xl bg-midnight border border-white/5 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-secondary">Planned Monthly:</span>
                  <span className="font-mono font-bold text-text-primary">
                    {formatCurrency(simulatedCont, currency)} / mo
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={Math.max(10000, goal.targetAmount * 0.25)}
                  step={goal.targetAmount > 20000 ? 500 : 100}
                  value={simulatedCont}
                  onChange={e => handleSliderChange(goal.id, parseFloat(e.target.value))}
                  className="w-full accent-turquoise cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>₹0</span>
                  <span>Max Sim</span>
                </div>
              </div>

              {/* Projections & Milestone */}
              <div className="pt-3 border-t border-white/5 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Projected Finish:</span>
                  <span className="font-semibold text-text-primary">
                    {simProjected.toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Target Deadline:</span>
                  <span className="font-mono text-text-secondary">{goal.targetDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#151E38] border border-semantic-success/40 p-6 shadow-2xl relative text-text-primary text-center">
            <div className="w-12 h-12 rounded-full bg-semantic-success/15 text-semantic-success mx-auto mb-3 flex items-center justify-center">
              <Icon name="PiggyBank" size={24} />
            </div>
            <h3 className="text-base font-bold mb-1">Add Savings Deposit</h3>
            <p className="text-xs text-text-muted mb-4">
              Celebrate your milestone! Funds will be marked saved and recorded in your ledger.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="Deposit Amount"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-midnight border border-white/10 font-mono text-base font-bold focus:border-semantic-success focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 rounded-xl bg-midnight border border-white/10 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-semantic-success text-midnight font-bold"
                >
                  Confirm Deposit 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Create New Savings Target</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. New Coding Laptop, Summer Trip"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Target Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Already Saved ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={initialSaved}
                    onChange={e => setInitialSaved(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Planned Monthly ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={plannedContribution}
                    onChange={e => setPlannedContribution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['High', 'Medium', 'Low'] as ('High' | 'Medium' | 'Low')[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl text-center border font-semibold ${
                        priority === p
                          ? 'border-turquoise bg-turquoise/15 text-turquoise'
                          : 'border-white/10 bg-midnight text-text-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Edit Goal: {editingGoal.name}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                editGoal(editingGoal.id, editingGoal);
                setEditingGoal(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-text-secondary mb-1">Goal Name</label>
                <input
                  type="text"
                  value={editingGoal.name}
                  onChange={e => setEditingGoal({ ...editingGoal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Target Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={editingGoal.targetAmount}
                    onChange={e =>
                      setEditingGoal({
                        ...editingGoal,
                        targetAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Planned Monthly ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={editingGoal.plannedMonthlyContribution}
                    onChange={e =>
                      setEditingGoal({
                        ...editingGoal,
                        plannedMonthlyContribution: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-3.5 py-2 text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
