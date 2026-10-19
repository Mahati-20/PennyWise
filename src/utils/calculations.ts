import {
  Transaction,
  Budget,
  BudgetProgress,
  SavingsGoal,
  SavingsGoalProjection,
  CalendarEvent,
  PurchaseAnalysisInput,
  PurchaseAnalysisResult,
  UserMode,
} from '../types';

/**
 * Calculates current available liquid balance.
 * Starting Balance + Total Income - Total Expenses
 */
export function calculateCurrentBalance(
  startingBalance: number,
  transactions: Transaction[]
): number {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return startingBalance + totalIncome - totalExpense;
}

/**
 * Calculates Available-to-Spend with crystal clear transparency.
 * Available = Current Balance - Upcoming Committed Expenses - Reserved Planned Goal Contributions
 */
export function calculateAvailableToSpend(
  currentBalance: number,
  upcomingEvents: CalendarEvent[],
  goals: SavingsGoal[]
): {
  available: number;
  currentBalance: number;
  upcomingCommitted: number;
  reservedGoals: number;
} {
  // Sum of upcoming bills or commitments that have not yet been marked paid
  const upcomingCommitted = upcomingEvents
    .filter(e => (e.type === 'bill' || e.type === 'subscription') && e.status === 'upcoming')
    .reduce((sum, e) => sum + e.amount, 0);

  // Sum of planned monthly contributions across active goals
  const reservedGoals = goals.reduce((sum, g) => sum + (g.plannedMonthlyContribution || 0), 0);

  const available = Math.max(0, currentBalance - upcomingCommitted - reservedGoals);

  return {
    available,
    currentBalance,
    upcomingCommitted,
    reservedGoals,
  };
}

/**
 * Calculate budget progress and status for each budget category
 */
export function calculateBudgetsProgress(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetProgress[] {
  // Get expenses for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const nextMonthStart = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`;
  const semesterStartMonth = Math.floor(month / 6) * 6;
  const periodStart = `${year}-${String(semesterStartMonth + 1).padStart(2, '0')}-01`;
  const periodEnd = semesterStartMonth === 6 ? `${year + 1}-01-01` : `${year}-${String(semesterStartMonth + 7).padStart(2, '0')}-01`;
  const tomorrow = new Date(year, month, now.getDate() + 1);
  const todayExclusive = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  return budgets.map(budget => {
    const spent = transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        if (t.category.toLowerCase() !== budget.category.toLowerCase()) return false;
        const start = budget.period === 'semester' ? periodStart : monthStart;
        const end = [budget.period === 'semester' ? periodEnd : nextMonthStart, todayExclusive].sort()[0];
        return t.date >= start && t.date < end;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = Math.max(0, budget.limit - spent);
    const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

    let status: 'healthy' | 'warning' | 'over' = 'healthy';
    if (percentage >= 100) {
      status = 'over';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return {
      ...budget,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}

/**
 * Calculate savings goals projections and completion dates
 */
export function calculateGoalProjections(goals: SavingsGoal[]): SavingsGoalProjection[] {
  const today = new Date();

  return goals.map(goal => {
    const remainingToSave = Math.max(0, goal.targetAmount - goal.currentAmount);
    const monthlyContribution = Math.max(0, goal.plannedMonthlyContribution);

    const [targetYear, targetMonth] = goal.targetDate.split('-').map(Number);
    const monthsUntilTarget = Math.max(
      1,
      (targetYear - today.getFullYear()) * 12 +
        (targetMonth - 1 - today.getMonth())
    );

    // Months required based on planned contribution
    const monthsRequired = remainingToSave === 0 ? 0 : monthlyContribution > 0
      ? Math.ceil(remainingToSave / monthlyContribution)
      : 0;

    // Projected completion date
    const projectedDate = new Date(today);
    projectedDate.setMonth(today.getMonth() + monthsRequired);
    const dateOnly = `${projectedDate.getFullYear()}-${String(projectedDate.getMonth() + 1).padStart(2, '0')}-${String(projectedDate.getDate()).padStart(2, '0')}`;
    const projectedCompletionDate = remainingToSave === 0
      ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      : monthlyContribution > 0 ? dateOnly : '';

    // Required monthly to meet the target date exactly
    const requiredMonthlyToMeetTarget = Math.ceil(remainingToSave / monthsUntilTarget);
    const isOnTrack = remainingToSave === 0 || (monthlyContribution > 0 && monthsRequired <= monthsUntilTarget);
    const monthlyShortfall = Math.max(0, requiredMonthlyToMeetTarget - monthlyContribution);

    return {
      ...goal,
      projectedCompletionDate,
      monthsRemaining: monthsRequired,
      isOnTrack,
      requiredMonthlyToMeetTarget,
      monthlyShortfall,
    };
  });
}

/**
 * FEATURE 4: Signature Purchase Analyzer ("Can I Afford This?")
 * Transparent, reproducible rules-based scoring.
 */
export function evaluatePurchaseAffordability(
  input: PurchaseAnalysisInput,
  currentBalance: number,
  availableToSpend: number,
  budgetsProgress: BudgetProgress[],
  goals: SavingsGoal[]
): PurchaseAnalysisResult {
  const { name, amount, category, isEssential } = input;
  const reasons: string[] = [];
  let score = 100;

  // 1. Available to Spend Check (Up to 45 pts deduction)
  if (amount > availableToSpend) {
    const deficit = amount - availableToSpend;
    if (amount > currentBalance) {
      score -= 55;
      reasons.push(`Purchase exceeds total balance by ${deficit.toFixed(0)}.`);
    } else {
      score -= 40;
      reasons.push(
        `Purchase uses money reserved for upcoming commitments or goals (exceeds available-to-spend by ${deficit.toFixed(0)}).`
      );
    }
  } else {
    const pctOfAvailable = (amount / (availableToSpend || 1)) * 100;
    if (pctOfAvailable > 60) {
      score -= 25;
      reasons.push(`Consumes ${pctOfAvailable.toFixed(0)}% of your available-to-spend funds.`);
    } else if (pctOfAvailable > 30) {
      score -= 10;
      reasons.push(`Takes up ${pctOfAvailable.toFixed(0)}% of your available spending buffer.`);
    } else {
      reasons.push(`Comfortably within your available-to-spend limit.`);
    }
  }

  // 2. Category Budget Check (Up to 30 pts deduction)
  const categoryBudget = budgetsProgress.find(
    b => b.category.toLowerCase() === category.toLowerCase()
  );
  let budgetImpact = {
    category: category || 'Discretionary',
    currentSpent: 0,
    budgetLimit: 0,
    afterPurchaseSpent: amount,
    exceedsBudget: false,
    excessAmount: 0,
  };

  if (categoryBudget) {
    const afterSpent = categoryBudget.spent + amount;
    const exceeds = afterSpent > categoryBudget.limit;
    const excess = Math.max(0, afterSpent - categoryBudget.limit);

    budgetImpact = {
      category: categoryBudget.category,
      currentSpent: categoryBudget.spent,
      budgetLimit: categoryBudget.limit,
      afterPurchaseSpent: afterSpent,
      exceedsBudget: exceeds,
      excessAmount: excess,
    };

    if (exceeds) {
      score -= 25;
      reasons.push(
        `Will push '${categoryBudget.category}' budget over limit by ${excess.toFixed(0)}.`
      );
    } else {
      reasons.push(`Fits within your monthly '${categoryBudget.category}' budget.`);
    }
  } else {
    reasons.push(`No specific budget cap set for this category.`);
  }

  // 3. Savings Goal Delay Impact (Up to 20 pts deduction)
  const highestPriorityGoal = goals.find(g => g.priority === 'High') || goals[0];
  let savingsImpact = {
    affectedGoalName: highestPriorityGoal ? highestPriorityGoal.name : 'General Savings',
    delayDays: 0,
    monthlyContributionCovered: 0,
  };

  if (highestPriorityGoal && highestPriorityGoal.plannedMonthlyContribution > 0) {
    const daysDelayed = Math.round(
      (amount / highestPriorityGoal.plannedMonthlyContribution) * 30
    );
    savingsImpact.delayDays = daysDelayed;
    savingsImpact.monthlyContributionCovered = Math.round(
      (amount / highestPriorityGoal.plannedMonthlyContribution) * 100
    );

    if (daysDelayed > 20) {
      score -= 15;
      reasons.push(
        `Equivalent to ${daysDelayed} days of planned savings for '${highestPriorityGoal.name}'.`
      );
    }
  }

  // Essential bonus
  if (isEssential) {
    score = Math.min(100, score + 10);
    reasons.push(`Marked as essential requirement (+10 score adjustment).`);
  }

  // Bound score
  score = Math.max(5, Math.min(100, score));

  // Recommendation Tier
  let recommendation: 'Affordable' | 'Be Careful' | 'Not Recommended' = 'Affordable';
  if (score < 45 || amount > currentBalance) {
    recommendation = 'Not Recommended';
  } else if (score < 75) {
    recommendation = 'Be Careful';
  }

  // Remaining money calculation
  const moneyRemaining = Math.max(0, availableToSpend - amount);

  // Scenarios
  const weeksToSave = Math.max(2, Math.ceil(amount / (availableToSpend > 0 ? availableToSpend * 0.25 : 1000)));
  const amountPerWeek = Math.round(amount / weeksToSave);

  const waitDate = new Date();
  waitDate.setDate(waitDate.getDate() + 18); // Next cycle

  return {
    id: `pa-${Date.now()}`,
    input,
    recommendation,
    score,
    moneyRemaining,
    budgetImpact,
    savingsImpact,
    reasons,
    scenarios: {
      buyNow: {
        feasible: recommendation !== 'Not Recommended',
        summary:
          recommendation === 'Affordable'
            ? 'Safe to purchase today without stressing cash flow.'
            : recommendation === 'Be Careful'
            ? 'Purchase is doable, but reduces your cash buffer significantly.'
            : 'Immediate purchase may cause an overdraft or missed bill.',
        riskLevel: recommendation === 'Affordable' ? 'Low' : recommendation === 'Be Careful' ? 'Medium' : 'High',
      },
      wait: {
        recommendedDate: waitDate.toISOString().split('T')[0],
        summary: `Waiting until the next income/allowance cycle on ${waitDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} reduces cash pressure to zero.`,
      },
      savePlan: {
        weeks: weeksToSave,
        amountPerWeek,
        summary: `Set aside ${amountPerWeek}/week for ${weeksToSave} weeks to purchase guilt-free.`,
      },
    },
    suggestedAlternative:
      amount > 1000
        ? `Look for student/corporate discounts, refurbished deals, or wait for upcoming seasonal sales to save 15-25%.`
        : undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate smart suggested budgets based on income and mode
 */
export function generateSmartBudgets(
  monthlyIncome: number,
  mode: UserMode
): { category: string; limit: number; period: 'monthly' }[] {
  if (mode === 'campus') {
    // Student Breakdown: 35% Food/Canteen, 15% Books/Supplies, 10% Transit, 15% Outing/Fun, 5% Subs, 20% Savings
    return [
      { category: 'Food & Canteen', limit: Math.round(monthlyIncome * 0.35), period: 'monthly' },
      { category: 'Books & Supplies', limit: Math.round(monthlyIncome * 0.15), period: 'monthly' },
      { category: 'Campus Transit', limit: Math.round(monthlyIncome * 0.10), period: 'monthly' },
      { category: 'Outing & Hangouts', limit: Math.round(monthlyIncome * 0.15), period: 'monthly' },
      { category: 'Student Subscriptions', limit: Math.round(monthlyIncome * 0.05), period: 'monthly' },
      { category: 'Hostel & Living', limit: Math.round(monthlyIncome * 0.20), period: 'monthly' },
    ];
  } else {
    // Pro Breakdown (50/30/20 Rule): 30% Housing, 12% Groceries, 8% Utilities, 15% Dining/Entertainment, 10% Shopping, 25% Investments
    return [
      { category: 'Housing & Rent', limit: Math.round(monthlyIncome * 0.30), period: 'monthly' },
      { category: 'Groceries & Dining', limit: Math.round(monthlyIncome * 0.15), period: 'monthly' },
      { category: 'Utilities & Bills', limit: Math.round(monthlyIncome * 0.08), period: 'monthly' },
      { category: 'Investments & Savings', limit: Math.round(monthlyIncome * 0.22), period: 'monthly' },
      { category: 'Health & Wellness', limit: Math.round(monthlyIncome * 0.08), period: 'monthly' },
      { category: 'Shopping & Gear', limit: Math.round(monthlyIncome * 0.10), period: 'monthly' },
    ];
  }
}

