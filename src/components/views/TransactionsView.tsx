import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { getCategoriesForMode } from '../../utils/categories';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { Icon } from '../common/Icon';

interface TransactionsViewProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenQuickAdd }) => {
  const { profile, transactions, editTransaction, deleteTransaction } = useFinancial();
  const categories = getCategoriesForMode(profile.mode);
  const currency = profile.currency;

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'all' | PaymentMethod>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  // Edit & Delete State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setSaving(true);
    setActionError('');
    try {
      await editTransaction(editingTx.id, editingTx);
      setEditingTx(null);
    } catch {
      setActionError('Could not save the transaction. Your changes are still here; please retry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTxId) return;
    setSaving(true);
    setActionError('');
    try {
      await deleteTransaction(deletingTxId);
      setDeletingTxId(null);
    } catch {
      setActionError('Could not delete the transaction. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        // Search
        if (
          searchTerm &&
          !t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !t.category.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        // Category
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }
        // Type
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }
        // Payment Method
        if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, selectedCategory, selectedType, selectedPaymentMethod, sortBy]);

  // Totals for filtered view
  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pennywise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Summary Card */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Transactions Activity</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time ledger connected to your Available-to-Spend buffer and active budgets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-text-primary transition-colors flex items-center gap-1.5"
          >
            <Icon name="Download" size={14} className="text-turquoise" />
            Export CSV
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-3.5 py-2 rounded-xl bg-semantic-success/15 hover:bg-semantic-success/25 border border-semantic-success/30 text-xs font-bold text-semantic-success transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            Income
          </button>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-3.5 py-2 rounded-xl bg-turquoise text-midnight text-xs font-bold shadow-glow-turquoise transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-midnight border border-white/10 text-xs focus:border-turquoise focus:outline-none placeholder:text-text-muted"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs text-text-primary focus:border-turquoise focus:outline-none"
            >
              <option value="all">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs text-text-primary focus:border-turquoise focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs text-text-primary focus:border-turquoise focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Ribbon */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-white/5">
          <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-semantic-success">
              +Income: {formatCurrency(totalFilteredIncome, currency)}
            </span>
            <span className="text-semantic-warning">
              -Spent: {formatCurrency(totalFilteredExpense, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-midnight-surface/80 border border-white/10 overflow-hidden shadow-subtle-elevated">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted space-y-3">
            <Icon name="Receipt" size={32} className="mx-auto text-turquoise/50" />
            <p className="text-sm font-semibold text-text-primary">No transactions found</p>
            <p>Try clearing your search query or add a new transaction above.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="px-4 py-2 rounded-xl bg-midnight-elevated text-turquoise text-xs font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map(t => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-text-muted whitespace-nowrap">
                        {t.date}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        <div className="flex items-center gap-2">
                          <span>{t.description}</span>
                          {t.isRecurring && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-turquoise/15 text-turquoise font-normal">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-midnight border border-white/5">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[11px]">
                          {t.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome ? 'text-semantic-success' : 'text-text-primary'
                          }
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTx(t)}
                            className="p-1.5 text-text-muted hover:text-turquoise rounded-lg hover:bg-white/5 transition-colors"
                            title="Edit Transaction"
                          >
                            <Icon name="Pencil" size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(t.id)}
                            className="p-1.5 text-text-muted hover:text-semantic-error rounded-lg hover:bg-white/5 transition-colors"
                            title="Delete Transaction"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Edit Transaction</h3>
            <form
              onSubmit={handleEditSubmit}
              className="space-y-3.5 text-xs"
            >
              {actionError && <p role="alert" className="text-semantic-error">{actionError}</p>}
              <div>
                <label className="block text-text-secondary mb-1">Description</label>
                <input
                  type="text"
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="any"
                  value={editingTx.amount}
                  onChange={e =>
                    setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Category</label>
                  <select
                    value={editingTx.category}
                    onChange={e => setEditingTx({ ...editingTx, category: e.target.value })}
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
                  <label className="block text-text-secondary mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3.5 py-2 text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#151E38] border border-semantic-error/40 p-6 shadow-2xl relative text-text-primary text-center">
            <div className="w-12 h-12 rounded-full bg-semantic-error/15 text-semantic-error mx-auto mb-3 flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} />
            </div>
            <h3 className="text-base font-bold mb-1">Delete Transaction?</h3>
            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
              This will remove the transaction from your ledger and recalculate your balance and
              monthly budget spent amounts.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingTxId(null)}
                className="px-4 py-2 rounded-xl bg-midnight border border-white/10 text-xs text-text-secondary hover:text-text-primary"
              >
                Keep
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-semantic-error text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
            {actionError && <p role="alert" className="mt-3 text-xs text-semantic-error">{actionError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

