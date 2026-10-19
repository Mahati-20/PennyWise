import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Protect all routes in this router
router.use(requireAuth);

// GET /api/financials/all - Fetch all financial data for authenticated user
router.get('/all', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC').all(userId);
    const budgets = db.prepare('SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at ASC').all(userId);
    const goals = db.prepare('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at ASC').all(userId);
    const events = db.prepare('SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date ASC').all(userId);
    const wishlist = db.prepare('SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').all(userId);

    return res.json({
      profile,
      transactions: transactions.map((t: any) => ({
        ...t,
        isRecurring: Boolean(t.is_recurring),
        paymentMethod: t.payment_method,
      })),
      budgets: budgets.map((b: any) => ({
        id: b.id,
        category: b.category,
        limit: b.limit_amount,
        period: b.period,
      })),
      goals: goals.map((g: any) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        targetDate: g.target_date,
        priority: g.priority,
        plannedMonthlyContribution: g.planned_monthly_contribution,
        icon: g.icon,
        category: g.category,
      })),
      events: events.map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        type: e.type,
        date: e.date,
        status: e.status,
        isRecurring: Boolean(e.is_recurring),
      })),
      wishlist,
    });
  } catch (err: any) {
    console.error('Fetch all financials error:', err);
    return res.status(500).json({ error: 'Failed to retrieve financial data.' });
  }
});

// PUT /api/financials/profile - Update user profile & onboarding
router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      name,
      mode,
      currency,
      college_or_company,
      starting_balance,
      monthly_income,
      income_source,
      allowance_frequency,
      budget_preference,
      onboarding_completed,
    } = req.body;

    const current = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    if (!current) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const updatedName = name !== undefined ? String(name).trim() : current.name;
    const updatedMode = mode !== undefined ? mode : current.mode;
    const updatedCurrency = currency !== undefined ? currency : current.currency;
    if (!['INR', 'USD', 'EUR', 'GBP'].includes(updatedCurrency)) {
      return res.status(400).json({ error: 'Please choose a supported currency.' });
    }
    if (updatedCurrency !== current.currency) {
      const hasRecords = db.prepare(`SELECT
        (SELECT COUNT(*) FROM transactions WHERE user_id = ?) +
        (SELECT COUNT(*) FROM budgets WHERE user_id = ?) +
        (SELECT COUNT(*) FROM savings_goals WHERE user_id = ?) +
        (SELECT COUNT(*) FROM calendar_events WHERE user_id = ?) +
        (SELECT COUNT(*) FROM wishlist WHERE user_id = ?) AS count
      `).get(userId, userId, userId, userId, userId) as { count: number };
      if (current.starting_balance !== 0 || current.monthly_income !== 0 || hasRecords.count > 0) {
        return res.status(409).json({ error: 'Currency is fixed once financial amounts or records have been saved. Create a new account to use another currency.' });
      }
    }
    const updatedCollegeOrCompany = college_or_company !== undefined ? college_or_company : current.college_or_company;
    const updatedStartingBalance = starting_balance !== undefined ? Number(starting_balance) : current.starting_balance;
    const updatedMonthlyIncome = monthly_income !== undefined ? Number(monthly_income) : current.monthly_income;
    const updatedIncomeSource = income_source !== undefined ? income_source : current.income_source;
    const updatedAllowanceFreq = allowance_frequency !== undefined ? allowance_frequency : current.allowance_frequency;
    const updatedBudgetPref = budget_preference !== undefined ? budget_preference : current.budget_preference;
    const updatedOnboarding = onboarding_completed !== undefined ? (onboarding_completed ? 1 : 0) : current.onboarding_completed;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE profiles SET
        name = ?,
        mode = ?,
        currency = ?,
        college_or_company = ?,
        starting_balance = ?,
        monthly_income = ?,
        income_source = ?,
        allowance_frequency = ?,
        budget_preference = ?,
        onboarding_completed = ?,
        updated_at = ?
      WHERE user_id = ?
    `).run(
      updatedName,
      updatedMode,
      updatedCurrency,
      updatedCollegeOrCompany,
      updatedStartingBalance,
      updatedMonthlyIncome,
      updatedIncomeSource,
      updatedAllowanceFreq,
      updatedBudgetPref,
      updatedOnboarding,
      now,
      userId
    );

    const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    return res.json(updatedProfile);
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/financials/transactions - Add transaction
router.post('/transactions', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      amount,
      currency,
      category,
      date,
      type,
      paymentMethod,
      description,
      isRecurring = false,
      recurringFrequency,
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive amount.' });
    }

    if (!category || !type || !date) {
      return res.status(400).json({ error: 'Category, type, and date are required.' });
    }
    const profile = db.prepare('SELECT currency FROM profiles WHERE user_id = ?').get(userId) as { currency: string } | undefined;
    if (!profile || currency !== profile.currency) {
      return res.status(400).json({ error: 'Transaction currency must match the account currency.' });
    }

    const id = `tx_${Date.now()}_${crypto.randomUUID().substring(0, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO transactions (
        id, user_id, amount, currency, category, date, type,
        payment_method, description, is_recurring, recurring_frequency, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      Number(amount),
      currency || 'INR',
      category,
      date,
      type,
      paymentMethod || 'UPI',
      description || '',
      isRecurring ? 1 : 0,
      recurringFrequency || null,
      now
    );

    const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    return res.status(201).json({
      ...created,
      isRecurring: Boolean(created.is_recurring),
      paymentMethod: created.payment_method,
    });
  } catch (err: any) {
    console.error('Create transaction error:', err);
    return res.status(500).json({ error: 'Failed to save transaction.' });
  }
});

// PUT /api/financials/transactions/:id - Edit transaction
router.put('/transactions/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const txId = req.params.id;
    const { amount, category, date, description, paymentMethod } = req.body;

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(txId, userId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    db.prepare(`
      UPDATE transactions SET
        amount = ?,
        category = ?,
        date = ?,
        description = ?,
        payment_method = ?
      WHERE id = ? AND user_id = ?
    `).run(
      amount !== undefined ? Number(amount) : existing.amount,
      category || existing.category,
      date || existing.date,
      description !== undefined ? description : existing.description,
      paymentMethod || existing.payment_method,
      txId,
      userId
    );

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId) as any;
    return res.json({
      ...updated,
      isRecurring: Boolean(updated.is_recurring),
      paymentMethod: updated.payment_method,
    });
  } catch (err: any) {
    console.error('Edit transaction error:', err);
    return res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// DELETE /api/financials/transactions/:id - Delete transaction
router.delete('/transactions/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const txId = req.params.id;

    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(txId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.json({ success: true, message: 'Transaction deleted.' });
  } catch (err: any) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Budgets Endpoints
router.post('/budgets', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { category, limit, period = 'monthly' } = req.body;

    if (!category || !limit || isNaN(Number(limit))) {
      return res.status(400).json({ error: 'Category and spending limit are required.' });
    }

    const id = `b_${Date.now()}_${crypto.randomUUID().substring(0, 4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO budgets (id, user_id, category, limit_amount, period, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, category, Number(limit), period, now);

    return res.status(201).json({ id, category, limit: Number(limit), period });
  } catch (err: any) {
    console.error('Create budget error:', err);
    return res.status(500).json({ error: 'Failed to create budget.' });
  }
});

router.put('/budgets/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const budgetId = req.params.id;
    const { limit, category } = req.body;

    const existing = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?').get(budgetId, userId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    db.prepare(`
      UPDATE budgets SET
        limit_amount = ?,
        category = ?
      WHERE id = ? AND user_id = ?
    `).run(
      limit !== undefined ? Number(limit) : existing.limit_amount,
      category || existing.category,
      budgetId,
      userId
    );

    return res.json({ id: budgetId, category: category || existing.category, limit: Number(limit) });
  } catch (err: any) {
    console.error('Update budget error:', err);
    return res.status(500).json({ error: 'Failed to update budget.' });
  }
});

router.delete('/budgets/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const budgetId = req.params.id;

    db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(budgetId, userId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete budget error:', err);
    return res.status(500).json({ error: 'Failed to delete budget.' });
  }
});

// POST /api/financials/budgets/batch - Replace user's budgets with smart suggestions
router.post('/budgets/batch', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { budgets } = req.body; // Array of { category, limit, period }

    if (!Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Budgets array required.' });
    }

    const now = new Date().toISOString();
    const batchTransaction = db.transaction(() => {
      db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
      const insert = db.prepare(`
        INSERT INTO budgets (id, user_id, category, limit_amount, period, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const b of budgets) {
        const id = `b_${Date.now()}_${crypto.randomUUID().substring(0, 4)}`;
        insert.run(id, userId, b.category, Number(b.limit), b.period || 'monthly', now);
      }
    });

    batchTransaction();

    const currentBudgets = db.prepare('SELECT * FROM budgets WHERE user_id = ?').all(userId);
    return res.json(currentBudgets.map((b: any) => ({
      id: b.id,
      category: b.category,
      limit: b.limit_amount,
      period: b.period,
    })));
  } catch (err: any) {
    console.error('Batch budgets error:', err);
    return res.status(500).json({ error: 'Failed to apply budgets.' });
  }
});

// Savings Goals Endpoints
router.post('/goals', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      name,
      targetAmount,
      currentAmount = 0,
      targetDate,
      priority = 'Medium',
      plannedMonthlyContribution = 0,
      icon = 'Target',
      category = 'General',
    } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Goal name and target amount are required.' });
    }

    const id = `g_${Date.now()}_${crypto.randomUUID().substring(0, 4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO savings_goals (
        id, user_id, name, target_amount, current_amount, target_date,
        priority, planned_monthly_contribution, icon, category, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      name.trim(),
      Number(targetAmount),
      Number(currentAmount),
      targetDate || '2027-04-30',
      priority,
      Number(plannedMonthlyContribution),
      icon,
      category,
      now
    );

    return res.status(201).json({
      id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate,
      priority,
      plannedMonthlyContribution: Number(plannedMonthlyContribution),
      icon,
      category,
    });
  } catch (err: any) {
    console.error('Create goal error:', err);
    return res.status(500).json({ error: 'Failed to create goal.' });
  }
});

router.put('/goals/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goalId = req.params.id;
    const { name, targetAmount, plannedMonthlyContribution, targetDate, priority } = req.body;

    const existing = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    db.prepare(`
      UPDATE savings_goals SET
        name = ?,
        target_amount = ?,
        planned_monthly_contribution = ?,
        target_date = ?,
        priority = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name || existing.name,
      targetAmount !== undefined ? Number(targetAmount) : existing.target_amount,
      plannedMonthlyContribution !== undefined ? Number(plannedMonthlyContribution) : existing.planned_monthly_contribution,
      targetDate || existing.target_date,
      priority || existing.priority,
      goalId,
      userId
    );

    const updated = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(goalId) as any;
    return res.json({
      id: updated.id,
      name: updated.name,
      targetAmount: updated.target_amount,
      currentAmount: updated.current_amount,
      targetDate: updated.target_date,
      priority: updated.priority,
      plannedMonthlyContribution: updated.planned_monthly_contribution,
      icon: updated.icon,
      category: updated.category,
    });
  } catch (err: any) {
    console.error('Update goal error:', err);
    return res.status(500).json({ error: 'Failed to update goal.' });
  }
});

router.delete('/goals/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goalId = req.params.id;

    db.prepare('DELETE FROM savings_goals WHERE id = ? AND user_id = ?').run(goalId, userId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete goal error:', err);
    return res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

// POST /api/financials/goals/:id/deposit - Log deposit to goal & create investment transaction
router.post('/goals/:id/deposit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goalId = req.params.id;
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid deposit amount.' });
    }

    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const newSaved = goal.current_amount + Number(amount);
    const txId = `tx_${Date.now()}_deposit`;

    const depositTx = db.transaction(() => {
      // 1. Update goal amount
      db.prepare('UPDATE savings_goals SET current_amount = ? WHERE id = ?').run(newSaved, goalId);

      // 2. Add savings deposit transaction to ledger
      db.prepare(`
        INSERT INTO transactions (
          id, user_id, amount, currency, category, date, type, payment_method, description, is_recurring, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        txId,
        userId,
        Number(amount),
        profile?.currency || 'INR',
        profile?.mode === 'campus' ? 'Hostel & Living' : 'Investments & Savings',
        today,
        'expense',
        'Bank Transfer',
        `Goal Deposit: ${goal.name}`,
        0,
        now
      );
    });

    depositTx();

    return res.json({
      success: true,
      goalId,
      currentAmount: newSaved,
      transactionId: txId,
    });
  } catch (err: any) {
    console.error('Goal deposit error:', err);
    return res.status(500).json({ error: 'Failed to record goal deposit.' });
  }
});

// POST /api/financials/goals/allocations - Batch update monthly goal contribution sliders
router.post('/goals/allocations', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { allocations } = req.body; // Record<goalId, monthlyAmount>

    if (!allocations || typeof allocations !== 'object') {
      return res.status(400).json({ error: 'Allocations object required.' });
    }

    const batch = db.transaction(() => {
      const stmt = db.prepare('UPDATE savings_goals SET planned_monthly_contribution = ? WHERE id = ? AND user_id = ?');
      for (const [id, val] of Object.entries(allocations)) {
        stmt.run(Number(val), id, userId);
      }
    });

    batch();
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Update allocations error:', err);
    return res.status(500).json({ error: 'Failed to save allocations.' });
  }
});

// Calendar Commitments Endpoints
router.post('/calendar', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, amount, type = 'bill', date, status = 'upcoming' } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ error: 'Title, amount, and date are required.' });
    }

    const id = `ev_${Date.now()}_${crypto.randomUUID().substring(0, 4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO calendar_events (id, user_id, title, amount, type, date, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, title.trim(), Number(amount), type, date, status, now);

    return res.status(201).json({ id, title, amount: Number(amount), type, date, status });
  } catch (err: any) {
    console.error('Create calendar commitment error:', err);
    return res.status(500).json({ error: 'Failed to save calendar commitment.' });
  }
});

router.put('/calendar/:id/toggle', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const eventId = req.params.id;

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ? AND user_id = ?').get(eventId, userId) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const nextStatus = event.status === 'upcoming' ? 'paid' : 'upcoming';
    db.prepare('UPDATE calendar_events SET status = ? WHERE id = ?').run(nextStatus, eventId);

    return res.json({ id: eventId, status: nextStatus });
  } catch (err: any) {
    console.error('Toggle event error:', err);
    return res.status(500).json({ error: 'Failed to toggle event.' });
  }
});

router.delete('/calendar/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const eventId = req.params.id;

    db.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?').run(eventId, userId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// Saved Wishlist Analyses
router.post('/wishlist', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { itemName, amount, category, score, recommendation } = req.body;

    const id = `wl_${Date.now()}_${crypto.randomUUID().substring(0, 4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO wishlist (id, user_id, item_name, amount, category, score, recommendation, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, itemName || 'Purchase Analysis', Number(amount), category || 'General', Number(score), recommendation || 'Affordable', now);

    return res.status(201).json({ id, itemName, amount: Number(amount), category, score, recommendation });
  } catch (err: any) {
    console.error('Save wishlist error:', err);
    return res.status(500).json({ error: 'Failed to save to wishlist.' });
  }
});

router.delete('/wishlist/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const wishlistId = req.params.id;

    db.prepare('DELETE FROM wishlist WHERE id = ? AND user_id = ?').run(wishlistId, userId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete wishlist error:', err);
    return res.status(500).json({ error: 'Failed to delete wishlist item.' });
  }
});

export default router;

