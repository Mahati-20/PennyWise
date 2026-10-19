import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyCode, UserMode } from '../../types';
import { CURRENCIES } from '../../utils/currency';
import { Icon } from '../common/Icon';

interface OnboardingWizardProps {
  initialMode: UserMode;
  onComplete: () => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialMode,
  onComplete,
  onCancel,
}) => {
  const { completeOnboarding, setMode, addGoal, applySuggestedBudgets } = useFinancial();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [mode, setFormMode] = useState<UserMode>(initialMode);
  const [name, setName] = useState(initialMode === 'campus' ? 'Aarav Sharma' : 'Elena Vance');
  const [collegeOrCompany, setCollegeOrCompany] = useState(
    initialMode === 'campus' ? 'Western Lakes College' : 'Northstar Labs'
  );
  const [currency, setFormCurrency] = useState<CurrencyCode>(
    initialMode === 'campus' ? 'INR' : 'USD'
  );

  // Financial inputs
  const [startingBalance, setStartingBalance] = useState(
    initialMode === 'campus' ? '12000' : '15000'
  );
  const [monthlyIncome, setMonthlyIncome] = useState(
    initialMode === 'campus' ? '16000' : '7200'
  );
  const [incomeSource, setIncomeSource] = useState(
    initialMode === 'campus' ? 'Family Allowance & TA Stipend' : 'Primary Salary'
  );

  // Goal
  const [goalName, setGoalName] = useState(
    initialMode === 'campus' ? 'MacBook Pro for AI Dev' : '6-Month Emergency Runway'
  );
  const [goalTarget, setGoalTarget] = useState(
    initialMode === 'campus' ? '85000' : '25000'
  );
  const [goalContribution, setGoalContribution] = useState(
    initialMode === 'campus' ? '4000' : '1200'
  );

  const handleFinish = () => {
    setMode(mode);
    const balanceNum = parseFloat(startingBalance) || 0;
    const incomeNum = parseFloat(monthlyIncome) || 0;

    completeOnboarding({
      name,
      collegeOrCompany,
      mode,
      currency,
      startingBalance: balanceNum,
      monthlyIncomeOrAllowance: incomeNum,
      incomeSource,
      allowanceFrequency: 'monthly',
      budgetPreference: 'monthly',
      onboardingCompleted: true,
    });

    // Add initial goal if specified
    const targetNum = parseFloat(goalTarget) || 0;
    const contNum = parseFloat(goalContribution) || 0;
    if (goalName.trim() && targetNum > 0) {
      addGoal({
        name: goalName.trim(),
        targetAmount: targetNum,
        currentAmount: Math.round(targetNum * 0.25),
        targetDate: '2027-04-30',
        priority: 'High',
        plannedMonthlyContribution: contNum,
        icon: mode === 'campus' ? 'Laptop' : 'ShieldCheck',
        category: mode === 'campus' ? 'Tech & Gadgets' : 'Investments & Savings',
      });
    }

    applySuggestedBudgets();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#10172E] text-text-primary flex items-center justify-center p-4 relative select-none">
      <div className="w-full max-w-xl rounded-3xl bg-[#151E38] border border-white/10 p-6 md:p-8 shadow-2xl relative">
        {/* Top Progress Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-turquoise">
              Step {step} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Skip to Demo
          </button>
        </div>

        {/* Progress track */}
        <div className="w-full h-1.5 bg-midnight rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-turquoise to-lavender transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Persona & Currency */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Welcome! Let's tailor Pennywise for you</h3>
              <p className="text-xs text-text-muted mt-1">
                Choose your focus mode and default currency
              </p>
            </div>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormMode('campus');
                  setFormCurrency('INR');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'campus'
                    ? 'border-turquoise bg-turquoise/10 shadow-glow-turquoise'
                    : 'border-white/10 bg-midnight hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-2 block">🎓</span>
                <span className="text-sm font-bold block text-text-primary">Campus</span>
                <span className="text-[11px] text-text-secondary">College & university life</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormMode('pro');
                  setFormCurrency('USD');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'pro'
                    ? 'border-lavender bg-lavender/10 shadow-glow-lavender'
                    : 'border-white/10 bg-midnight hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-2 block">💼</span>
                <span className="text-sm font-bold block text-text-primary">Pro</span>
                <span className="text-[11px] text-text-secondary">Working professionals</span>
              </button>
            </div>

            {/* Name & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {mode === 'campus' ? 'College / University' : 'Company / Role'}
                </label>
                <input
                  type="text"
                  value={collegeOrCompany}
                  onChange={e => setCollegeOrCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Currency Choice */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Primary Currency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(CURRENCIES).map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setFormCurrency(code as CurrencyCode)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      currency === code
                        ? 'border-turquoise bg-turquoise/15 text-turquoise font-bold'
                        : 'border-white/10 bg-midnight text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs font-bold block font-mono">
                      {CURRENCIES[code as CurrencyCode].symbol}
                    </span>
                    <span className="text-[10px] block">{code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Income / Allowance */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">
                {mode === 'campus' ? 'Allowance & Starting Balance' : 'Salary & Liquid Funds'}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Used to compute available-to-spend buffer and safe daily burn rate
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Current Liquid Funds / Account Balance ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">
                    {CURRENCIES[currency].symbol}
                  </span>
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={e => setStartingBalance(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-midnight border border-white/10 font-mono text-sm focus:border-turquoise focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {mode === 'campus' ? 'Monthly Pocket Allowance / Stipend' : 'Monthly Salary Income'} ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">
                    {CURRENCIES[currency].symbol}
                  </span>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-midnight border border-white/10 font-mono text-sm focus:border-turquoise focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Income Description / Source
                </label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={e => setIncomeSource(e.target.value)}
                  placeholder="e.g. Monthly stipend or allowance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Spending Style & Budgets */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Budgeting Strategy</h3>
              <p className="text-xs text-text-muted mt-1">
                Pennywise can automatically seed recommended category allocations
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-midnight border border-white/10 space-y-3">
              <div className="flex items-center gap-2.5 text-turquoise font-semibold text-xs">
                <Icon name="Wand2" size={16} />
                <span>
                  {mode === 'campus'
                    ? 'Smart Student Allocation (Food, Books, Transit, Outings)'
                    : 'Classic 50/30/20 Wealth Framework (Needs, Wants, Savings)'}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                We will automatically calculate balanced category limits from your monthly income of{' '}
                <strong className="font-mono text-text-primary">
                  {CURRENCIES[currency].symbol}
                  {monthlyIncome}
                </strong>
                . You can adjust limits anytime in the Budgets tab.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-midnight-elevated border border-white/5 flex items-center justify-between text-xs">
              <span className="text-text-secondary">Tracking Cycle</span>
              <span className="font-semibold text-text-primary px-2.5 py-1 rounded bg-white/5">
                {mode === 'campus' ? 'Monthly & Semester Pacing' : 'Monthly Cash Flow'}
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Primary Savings Goal */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Set Your First Savings Target</h3>
              <p className="text-xs text-text-muted mt-1">
                We'll project your completion milestone and protect it in the Money Orbit
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                  placeholder="e.g. New Laptop, Emergency Fund"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Target Total ({currency})
                  </label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={e => setGoalTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 font-mono text-xs focus:border-turquoise focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Planned Monthly Contribution ({currency})
                  </label>
                  <input
                    type="number"
                    value={goalContribution}
                    onChange={e => setGoalContribution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 font-mono text-xs focus:border-turquoise focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
            >
              Cancel
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-turquoise text-midnight font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
            >
              Continue
              <Icon name="ArrowRight" size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-midnight font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
            >
              Complete Setup & Open Dashboard
              <Icon name="Check" size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

