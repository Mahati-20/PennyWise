import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCurrentBalance,
  calculateBudgetsProgress,
  calculateGoalProjections,
} from '../src/utils/calculations.ts';
import { formatCurrency } from '../src/utils/currency.ts';
import type { Budget, SavingsGoal, Transaction } from '../src/types/index.ts';

const tx = (date: string, amount: number, type: 'expense' | 'income' = 'expense'): Transaction => ({
  id: date,
  date,
  amount,
  type,
  currency: 'INR',
  category: 'Food',
  paymentMethod: 'Cash',
  description: '',
});

test('balance uses starting balance plus income less expenses, including empty history', () => {
  assert.equal(calculateCurrentBalance(2500, []), 2500);
  assert.equal(calculateCurrentBalance(2500, [tx('2026-10-01', 900), tx('2026-10-02', 500, 'income')]), 2100);
});

test('budget progress honors monthly and semester periods and excludes later dates', () => {
  const budgets: Budget[] = [
    { id: 'm', category: 'Food', limit: 1000, period: 'monthly' },
    { id: 's', category: 'Food', limit: 2000, period: 'semester' },
    { id: 'empty', category: 'Travel', limit: 100, period: 'monthly' },
  ];
  const progress = calculateBudgetsProgress(budgets, [
    tx('2026-10-01', 300), tx('2026-09-30', 200), tx('2026-11-01', 800),
  ]);
  assert.deepEqual(progress.map(p => p.spent), [300, 500, 0]);
});

test('goal projections distinguish completed goals from zero-contribution goals', () => {
  const goals: SavingsGoal[] = [
    { id: 'done', name: 'Done', targetAmount: 100, currentAmount: 100, targetDate: '2026-12-01', priority: 'High', plannedMonthlyContribution: 0, icon: 'Target', category: 'General' },
    { id: 'paused', name: 'Paused', targetAmount: 100, currentAmount: 0, targetDate: '2026-12-01', priority: 'Low', plannedMonthlyContribution: 0, icon: 'Target', category: 'General' },
  ];
  const result = calculateGoalProjections(goals);
  assert.notEqual(result[0].projectedCompletionDate, '');
  assert.equal(result[0].monthsRemaining, 0);
  assert.equal(result[1].projectedCompletionDate, '');
  assert.equal(result[1].isOnTrack, false);
});

test('currency formatting displays the selected currency without conversion', () => {
  assert.match(formatCurrency(1250, 'USD'), /1,?250/);
  assert.match(formatCurrency(1250, 'INR'), /1,?250/);
});
