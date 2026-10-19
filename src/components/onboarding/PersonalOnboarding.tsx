import React, { useState } from 'react';
import { CurrencyCode, UserMode } from '../../types';
import { CURRENCIES } from '../../utils/currency';
import { Icon } from '../common/Icon';

interface PersonalOnboardingProps {
  initialName: string;
  initialMode: UserMode;
  onFinish: (data: {
    mode: UserMode;
    currency: CurrencyCode;
    collegeOrCompany: string;
    startingBalance: number;
    monthlyIncome: number;
    incomeSource: string;
    allowanceFrequency: 'monthly' | 'bi-weekly' | 'semester';
    initialCommitment?: { title: string; amount: number; date: string };
    initialGoal?: { name: string; targetAmount: number; plannedMonthly: number; targetDate: string };
  }) => Promise<void> | void;
}

export const PersonalOnboarding: React.FC<PersonalOnboardingProps> = ({
  initialName,
  initialMode,
  onFinish,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Mode & Currency & Institution
  const [mode, setMode] = useState<UserMode>(initialMode);
  const [currency, setCurrency] = useState<CurrencyCode>(initialMode === 'campus' ? 'INR' : 'USD');
  const [collegeOrCompany, setCollegeOrCompany] = useState('');

  // Step 2: Financial Baseline (Starting balance vs Income)
  const [startingBalance, setStartingBalance] = useState('0');
  const [monthlyIncome, setMonthlyIncome] = useState('0');
  const [incomeSource, setIncomeSource] = useState(
    mode === 'campus' ? 'Monthly Allowance / TA Stipend' : 'Primary Salary'
  );
  const [frequency, setFrequency] = useState<'monthly' | 'bi-weekly' | 'semester'>('monthly');

  // Step 3: Optional Upcoming Commitment
  const [hasCommitment, setHasCommitment] = useState(false);
  const [commitmentTitle, setCommitmentTitle] = useState(
    mode === 'campus' ? 'Hostel / Mess Amenity Fee' : 'Apartment Lease / Rent'
  );
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [commitmentDate, setCommitmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  // Step 4: Optional First Savings Target
  const [hasGoal, setHasGoal] = useState(false);
  const [goalName, setGoalName] = useState(
    mode === 'campus' ? 'New Laptop for AI Course' : 'Emergency Runway Fund'
  );
  const [goalTarget, setGoalTarget] = useState(mode === 'campus' ? '60000' : '15000');
  const [goalMonthly, setGoalMonthly] = useState(mode === 'campus' ? '3000' : '800');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    const balanceNum = parseFloat(startingBalance) || 0;
    const incomeNum = parseFloat(monthlyIncome) || 0;

    let commitmentData;
    if (hasCommitment && commitmentTitle && parseFloat(commitmentAmount) > 0) {
      commitmentData = {
        title: commitmentTitle.trim(),
        amount: parseFloat(commitmentAmount),
        date: commitmentDate,
      };
    }

    let goalData;
    if (hasGoal && goalName && parseFloat(goalTarget) > 0) {
      goalData = {
        name: goalName.trim(),
        targetAmount: parseFloat(goalTarget),
        plannedMonthly: parseFloat(goalMonthly) || 0,
        targetDate: '2027-04-30',
      };
    }

    setSaving(true);
    setSaveError('');
    try {
      await onFinish({
        mode,
        currency,
        collegeOrCompany: collegeOrCompany.trim(),
        startingBalance: balanceNum,
        monthlyIncome: incomeNum,
        incomeSource: incomeSource.trim(),
        allowanceFrequency: frequency,
        initialCommitment: commitmentData,
        initialGoal: goalData,
      });
    } catch {
      setSaveError('Setup could not be fully saved. Please retry; your entries remain available.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10172E] text-[#F1F3FA] flex items-center justify-center p-4 relative select-none">
      <div className="w-full max-w-xl rounded-3xl bg-[#151E38] border border-white/10 p-6 md:p-8 shadow-2xl relative">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-turquoise">
              Step {step} of {totalSteps}
            </span>
          </div>
          <span className="text-xs text-[#A7B0C8]">Personal Financial Setup</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#10172E] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-turquoise to-lavender transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Experience & Currency */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Welcome, {initialName}!</h3>
              <p className="text-xs text-[#A7B0C8] mt-1">
                Let's configure your currency and experience mode.
              </p>
            </div>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('campus');
                  setCurrency('INR');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'campus'
                    ? 'border-turquoise bg-turquoise/10 shadow-glow-turquoise'
                    : 'border-white/10 bg-[#10172E] hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-2 block">🎓</span>
                <span className="text-sm font-bold block text-[#F1F3FA]">Campus Mode</span>
                <span className="text-[11px] text-[#A7B0C8]">College student & allowance pacing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('pro');
                  setCurrency('USD');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'pro'
                    ? 'border-lavender bg-lavender/10 shadow-glow-lavender'
                    : 'border-white/10 bg-[#10172E] hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-2 block">💼</span>
                <span className="text-sm font-bold block text-[#F1F3FA]">Pro Workspace</span>
                <span className="text-[11px] text-[#A7B0C8]">Working professional & cash flow</span>
              </button>
            </div>

            {/* Currency Choice */}
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1.5">Primary Currency</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      currency === code
                        ? 'border-turquoise bg-turquoise/15 text-turquoise font-bold'
                        : 'border-white/10 bg-[#10172E] text-[#A7B0C8] hover:text-[#F1F3FA]'
                    }`}
                  >
                    <span className="text-xs font-bold block font-mono">{CURRENCIES[code].symbol}</span>
                    <span className="text-[10px] block">{code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Institution or Company */}
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1">
                {mode === 'campus' ? 'College / University (Optional)' : 'Company / Workplace (Optional)'}
              </label>
              <input
                type="text"
                placeholder={mode === 'campus' ? 'e.g. Western Lakes College' : 'e.g. Northstar Labs'}
                value={collegeOrCompany}
                onChange={e => setCollegeOrCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-xs focus:border-turquoise focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Financial Baseline (Starting Balance vs Income) */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Your Financial Baseline</h3>
              <p className="text-xs text-[#A7B0C8] mt-0.5">
                Clearly distinguishing existing liquid cash from regular incoming funds.
              </p>
            </div>

            {/* Transparency Note */}
            <div className="p-3 rounded-xl bg-[#10172E] border border-turquoise/20 text-xs text-[#A7B0C8] flex items-start gap-2.5">
              <Icon name="Info" size={16} className="text-turquoise shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-[#F1F3FA]">Starting Balance</strong> is money you currently have in hand or in your bank account today. It is <em>not</em> treated as new period income and won't distort your savings rate.
              </p>
            </div>

            {/* Starting Balance Input */}
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1">
                Current Liquid Balance ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C8] font-mono font-bold">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={startingBalance}
                  onChange={e => setStartingBalance(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#10172E] border border-white/10 font-mono text-sm font-semibold focus:border-turquoise focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Monthly Income / Allowance Input */}
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1">
                {mode === 'campus' ? 'Expected Monthly Allowance / Stipend' : 'Expected Monthly Salary / Income'} ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C8] font-mono font-bold">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#10172E] border border-white/10 font-mono text-sm font-semibold focus:border-turquoise focus:outline-none"
                />
              </div>
            </div>

            {/* Income Source Description & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Income Source</label>
                <input
                  type="text"
                  placeholder={mode === 'campus' ? 'e.g. Parents / TA Stipend' : 'e.g. Salary / Retainer'}
                  value={incomeSource}
                  onChange={e => setIncomeSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-xs text-[#F1F3FA] focus:border-turquoise focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="semester">Semester</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Optional Upcoming Commitment */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Upcoming Scheduled Commitment</h3>
              <p className="text-xs text-[#A7B0C8] mt-0.5">
                Bills or subscriptions due soon will be automatically reserved in your Available-to-Spend buffer.
              </p>
            </div>

            {/* Toggle checkbox */}
            <div className="p-3.5 rounded-2xl bg-[#10172E] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block text-[#F1F3FA]">Do you have a bill due in the next 30 days?</span>
                <span className="text-[11px] text-[#A7B0C8]">e.g. Rent, internet, hostel fee, or course book</span>
              </div>
              <input
                type="checkbox"
                checked={hasCommitment}
                onChange={e => setHasCommitment(e.target.checked)}
                className="w-4 h-4 rounded text-turquoise focus:ring-0 accent-turquoise cursor-pointer"
              />
            </div>

            {hasCommitment && (
              <div className="p-4 rounded-2xl bg-[#10172E]/80 border border-turquoise/20 space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Commitment Title</label>
                  <input
                    type="text"
                    value={commitmentTitle}
                    onChange={e => setCommitmentTitle(e.target.value)}
                    placeholder="e.g. Apartment Rent or Spotify Student"
                    className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Amount ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={commitmentAmount}
                      onChange={e => setCommitmentAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs font-mono focus:border-turquoise focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Due Date</label>
                    <input
                      type="date"
                      value={commitmentDate}
                      onChange={e => setCommitmentDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {!hasCommitment && (
              <div className="p-4 rounded-2xl bg-[#10172E]/50 border border-dashed border-white/10 text-center text-xs text-[#A7B0C8]">
                <span>No upcoming commitments. You can schedule them later on the Financial Calendar.</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Optional First Savings Goal */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold">Set Your First Savings Goal</h3>
              <p className="text-xs text-[#A7B0C8] mt-0.5">
                We'll monitor milestone progress and protect planned contributions in your Money Orbit.
              </p>
            </div>

            {/* Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#10172E] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block text-[#F1F3FA]">Set a savings milestone now?</span>
                <span className="text-[11px] text-[#A7B0C8]">Optional — you can add or adjust goals anytime</span>
              </div>
              <input
                type="checkbox"
                checked={hasGoal}
                onChange={e => setHasGoal(e.target.checked)}
                className="w-4 h-4 rounded text-turquoise focus:ring-0 accent-turquoise cursor-pointer"
              />
            </div>

            {hasGoal && (
              <div className="p-4 rounded-2xl bg-[#10172E]/80 border border-lavender/20 space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder="e.g. New Coding Laptop, Emergency Runway"
                    className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs focus:border-turquoise focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Target Total ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      value={goalTarget}
                      onChange={e => setGoalTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs font-mono focus:border-turquoise focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Planned Monthly ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      value={goalMonthly}
                      onChange={e => setGoalMonthly(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#151E38] border border-white/10 text-xs font-mono focus:border-turquoise focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {!hasGoal && (
              <div className="p-4 rounded-2xl bg-[#10172E]/50 border border-dashed border-white/10 text-center text-xs text-[#A7B0C8]">
                <span>You can create custom savings targets anytime inside the Savings Goals Studio.</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
          {saveError && <p role="alert" className="text-xs text-semantic-error">{saveError}</p>}
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-medium text-[#A7B0C8] hover:text-[#F1F3FA] rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-turquoise text-[#10172E] font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-[#10172E] font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
            >
              <span>Launch My Personal Dashboard</span>
              <Icon name="Check" size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

