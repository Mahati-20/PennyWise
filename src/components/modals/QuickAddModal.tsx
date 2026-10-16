import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { getCategoriesForMode } from '../../utils/categories';
import { PaymentMethod, TransactionType } from '../../types';
import { Icon } from '../common/Icon';
import { CURRENCIES } from '../../utils/currency';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { profile, addTransaction } = useFinancial();
  const categories = getCategoriesForMode(profile.mode);

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    profile.mode === 'campus' ? 'UPI' : 'Card'
  );
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly'>('monthly');

  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrors({ amount: 'Please enter a valid positive amount' });
      return;
    }

    if (!category.trim()) {
      setErrors({ category: 'Please select a category' });
      return;
    }

    // Save transaction
    addTransaction({
      amount: parsedAmount,
      currency: profile.currency,
      category,
      date,
      type,
      paymentMethod,
      description: description.trim() || (type === 'income' ? 'Income Deposit' : 'Expense'),
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setAmount('');
      setDescription('');
      setIsRecurring(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`p-2.5 rounded-xl ${
              type === 'expense'
                ? 'bg-semantic-warning/15 text-semantic-warning border border-semantic-warning/30'
                : 'bg-semantic-success/15 text-semantic-success border border-semantic-success/30'
            }`}
          >
            <Icon name={type === 'expense' ? 'ArrowUpRight' : 'ArrowDownLeft'} size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Record Transaction</h3>
            <p className="text-xs text-text-muted">
              Instantly updates balance, orbit, and active budgets
            </p>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 p-1 mb-5 rounded-xl bg-midnight border border-white/5 text-sm font-medium">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              type === 'expense'
                ? 'bg-[#1B2645] text-semantic-warning font-semibold shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon name="MinusCircle" size={16} />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              type === 'income'
                ? 'bg-[#1B2645] text-semantic-success font-semibold shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon name="PlusCircle" size={16} />
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Amount and Currency */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Amount ({CURRENCIES[profile.currency].symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold text-base">
                {CURRENCIES[profile.currency].symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({});
                }}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-midnight border font-mono text-base font-semibold focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-semantic-error focus:ring-semantic-error/40'
                    : 'border-white/10 focus:border-turquoise focus:ring-turquoise/20'
                }`}
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-semantic-error mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-midnight border border-white/10 text-text-primary focus:outline-none focus:border-turquoise"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name} className="bg-midnight">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-midnight border border-white/10 text-text-primary focus:outline-none focus:border-turquoise text-xs"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['UPI', 'Card', 'Cash', 'Bank Transfer'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    paymentMethod === pm
                      ? 'bg-turquoise/15 border-turquoise text-turquoise font-bold'
                      : 'bg-midnight border-white/5 text-text-muted hover:border-white/20'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Canteen lunch or grocery bill' : 'e.g. Monthly stipend'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight border border-white/10 text-text-primary focus:outline-none focus:border-turquoise placeholder:text-text-muted text-xs"
            />
          </div>

          {/* Recurring Expense checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight border border-white/5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="rounded border-white/20 text-turquoise focus:ring-0 focus:outline-none accent-turquoise w-4 h-4"
              />
              <label htmlFor="isRecurring" className="text-xs text-text-secondary cursor-pointer">
                Recurring commitment (auto-reserves in Available funds)
              </label>
            </div>
            {isRecurring && (
              <select
                value={recurringFrequency}
                onChange={e => setRecurringFrequency(e.target.value as 'monthly' | 'weekly')}
                className="text-xs bg-midnight-elevated px-2 py-1 rounded-lg border border-white/10 text-text-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-midnight hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
            >
              {isSuccess ? (
                <>
                  <Icon name="Check" size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Icon name="CheckCircle2" size={16} />
                  Save Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
