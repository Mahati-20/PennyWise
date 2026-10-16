import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { getCategoriesForMode } from '../../utils/categories';
import { formatCurrency } from '../../utils/currency';
import { PurchaseAnalysisResult } from '../../types';
import { Icon } from '../common/Icon';

interface PurchaseAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialName?: string;
}

export const PurchaseAnalyzerModal: React.FC<PurchaseAnalyzerModalProps> = ({
  isOpen,
  onClose,
  initialAmount = '',
  initialName = '',
}) => {
  const {
    profile,
    currentBalance,
    availableToSpendInfo,
    analyzePurchase,
    savePurchaseAnalysis,
    addTransaction,
  } = useFinancial();
  const categories = getCategoriesForMode(profile.mode);

  const [name, setName] = useState(initialName);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [category, setCategory] = useState(categories[0]?.name || 'Shopping');
  const [isEssential, setIsEssential] = useState(false);
  const [result, setResult] = useState<PurchaseAnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isConvertedToExpense, setIsConvertedToExpense] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const analysis = analyzePurchase({
      name: name.trim() || 'Proposed Purchase',
      amount: parsedAmount,
      category,
      isEssential,
      plannedDate: new Date().toISOString().split('T')[0],
    });

    setResult(analysis);
    setIsSaved(false);
    setIsConvertedToExpense(false);
  };

  const handleSaveToWishlist = () => {
    if (result) {
      savePurchaseAnalysis(result);
      setIsSaved(true);
    }
  };

  const handleRecordExpense = () => {
    if (result) {
      addTransaction({
        amount: result.input.amount,
        currency: profile.currency,
        category: result.input.category,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        paymentMethod: profile.mode === 'campus' ? 'UPI' : 'Card',
        description: `Purchased: ${result.input.name}`,
      });
      setIsConvertedToExpense(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-semantic-success border-semantic-success';
    if (score >= 45) return 'text-semantic-warning border-semantic-warning';
    return 'text-semantic-error border-semantic-error';
  };

  const getScoreBadgeBg = (rec: 'Affordable' | 'Be Careful' | 'Not Recommended') => {
    if (rec === 'Affordable') return 'bg-semantic-success/15 text-semantic-success border-semantic-success/30';
    if (rec === 'Be Careful') return 'bg-semantic-warning/15 text-semantic-warning border-semantic-warning/30';
    return 'bg-semantic-error/15 text-semantic-error border-semantic-error/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#151E38] border border-white/10 p-5 md:p-6 shadow-2xl relative text-text-primary my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-turquoise/15 text-turquoise border border-turquoise/30">
              <Icon name="ShieldAlert" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Can I Afford This?</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-turquoise/20 text-turquoise uppercase tracking-wider">
                  Signature Analyzer
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Evaluates liquid buffer, budget limits, upcoming bills, and goal trade-offs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Item / Experience Name
            </label>
            <input
              type="text"
              placeholder="e.g. Wireless ANC Headphones"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Price ({profile.currency})
            </label>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono text-xs focus:border-turquoise focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name} className="bg-midnight">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-8 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="essentialToggle"
              checked={isEssential}
              onChange={e => setIsEssential(e.target.checked)}
              className="rounded border-white/20 text-turquoise focus:ring-0 accent-turquoise w-4 h-4 cursor-pointer"
            />
            <label htmlFor="essentialToggle" className="text-xs text-text-secondary cursor-pointer">
              Essential / Academic / Work Requirement (adjusts scoring sensitivity)
            </label>
          </div>

          <div className="md:col-span-4 flex justify-end pt-1">
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-turquoise text-midnight hover:shadow-glow-turquoise transition-all flex items-center justify-center gap-2"
            >
              <Icon name="Search" size={15} />
              Evaluate Affordability
            </button>
          </div>
        </form>

        {/* Live Context Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-xl bg-midnight border border-white/5 mb-5 text-xs">
          <div>
            <span className="text-[11px] text-text-muted block">Liquid Balance</span>
            <span className="font-mono font-semibold text-text-primary">
              {formatCurrency(currentBalance, profile.currency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-text-muted block">Available to Spend</span>
            <span className="font-mono font-bold text-turquoise">
              {formatCurrency(availableToSpendInfo.available, profile.currency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-text-muted block">Upcoming Bills</span>
            <span className="font-mono text-semantic-warning">
              {formatCurrency(availableToSpendInfo.upcomingCommitted, profile.currency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-text-muted block">Goal Contributions</span>
            <span className="font-mono text-lavender">
              {formatCurrency(availableToSpendInfo.reservedGoals, profile.currency)}
            </span>
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div className="space-y-4 animate-fadeIn">
            {/* Primary Recommendation Banner */}
            <div className="p-4 rounded-xl bg-midnight-elevated border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Circular Score Gauge */}
                <div
                  className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                    result.score
                  )}`}
                >
                  <span className="text-lg font-bold font-mono leading-none">{result.score}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
                    / 100
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeBg(
                        result.recommendation
                      )}`}
                    >
                      {result.recommendation}
                    </span>
                    <span className="text-xs text-text-muted">
                      for {formatCurrency(result.input.amount, profile.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {result.scenarios.buyNow.summary}
                  </p>
                </div>
              </div>

              {/* Remaining funds after purchase */}
              <div className="text-left md:text-right bg-midnight/50 p-2.5 rounded-lg border border-white/5 w-full md:w-auto">
                <span className="text-[11px] text-text-muted block">Available funds after buy:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    result.moneyRemaining > 0 ? 'text-text-primary' : 'text-semantic-error'
                  }`}
                >
                  {formatCurrency(result.moneyRemaining, profile.currency)}
                </span>
              </div>
            </div>

            {/* Impact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Budget Impact */}
              <div className="p-3.5 rounded-xl bg-midnight border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-text-primary mb-2">
                  <Icon name="PieChart" size={15} className="text-lavender" />
                  Category Budget Impact
                </div>
                {result.budgetImpact.budgetLimit > 0 ? (
                  <div className="space-y-1 text-text-secondary">
                    <div className="flex justify-between">
                      <span>Category Limit:</span>
                      <span className="font-mono">
                        {formatCurrency(result.budgetImpact.budgetLimit, profile.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent + This Purchase:</span>
                      <span
                        className={`font-mono font-semibold ${
                          result.budgetImpact.exceedsBudget
                            ? 'text-semantic-error'
                            : 'text-text-primary'
                        }`}
                      >
                        {formatCurrency(result.budgetImpact.afterPurchaseSpent, profile.currency)}
                      </span>
                    </div>
                    {result.budgetImpact.exceedsBudget && (
                      <p className="text-[11px] text-semantic-error mt-1">
                        ⚠️ Exceeds limit by {formatCurrency(result.budgetImpact.excessAmount, profile.currency)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-text-muted text-[11px]">
                    No set cap for '{result.budgetImpact.category}'. Deducted from general discretionary pool.
                  </p>
                )}
              </div>

              {/* Savings Goal Trade-off */}
              <div className="p-3.5 rounded-xl bg-midnight border border-white/5">
                <div className="flex items-center gap-2 font-semibold text-text-primary mb-2">
                  <Icon name="Target" size={15} className="text-turquoise" />
                  Savings Priority Impact
                </div>
                <div className="space-y-1 text-text-secondary">
                  <p className="text-[11px]">
                    Trade-off against: <span className="font-medium text-text-primary">{result.savingsImpact.affectedGoalName}</span>
                  </p>
                  {result.savingsImpact.delayDays > 0 ? (
                    <p className="text-[11px] text-semantic-warning">
                      ⏱️ May delay this goal's completion by ~{result.savingsImpact.delayDays} days.
                    </p>
                  ) : (
                    <p className="text-[11px] text-semantic-success">
                      ✓ No noticeable delay to primary savings goals.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Scenario Comparisons */}
            <div className="p-3.5 rounded-xl bg-midnight border border-white/5 text-xs">
              <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Icon name="GitFork" size={15} className="text-turquoise" />
                Scenario Comparison
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-midnight-surface border border-white/5">
                  <span className="font-semibold text-text-primary block mb-1">1. Buy Now</span>
                  <p className="text-[11px] text-text-secondary">{result.scenarios.buyNow.summary}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-midnight-surface border border-white/5">
                  <span className="font-semibold text-turquoise block mb-1">2. Wait for Next Cycle</span>
                  <p className="text-[11px] text-text-secondary">{result.scenarios.wait.summary}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-midnight-surface border border-white/5">
                  <span className="font-semibold text-lavender block mb-1">3. Save Incrementally</span>
                  <p className="text-[11px] text-text-secondary">{result.scenarios.savePlan.summary}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveToWishlist}
                disabled={isSaved}
                className="px-4 py-2 rounded-xl bg-midnight-surface border border-white/10 hover:border-white/20 text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5"
              >
                <Icon name={isSaved ? 'BookmarkCheck' : 'Bookmark'} size={15} className="text-turquoise" />
                {isSaved ? 'Saved to Wishlist!' : 'Save Analysis to Wishlist'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecordExpense}
                  disabled={isConvertedToExpense}
                  className="px-4 py-2 rounded-xl bg-semantic-warning/20 border border-semantic-warning/30 hover:bg-semantic-warning/30 text-xs font-semibold text-semantic-warning transition-all flex items-center gap-1.5"
                >
                  <Icon name="Receipt" size={15} />
                  {isConvertedToExpense ? 'Recorded in Expenses!' : 'Record as Actual Expense'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
