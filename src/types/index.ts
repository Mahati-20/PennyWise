export type UserMode = 'campus' | 'pro';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // For clean aggregate conversions when requested
  locale: string;
}

export interface UserProfile {
  name: string;
  mode: UserMode;
  currency: CurrencyCode;
  avatar: string;
  collegeOrCompany: string;
  startingBalance: number;
  monthlyIncomeOrAllowance: number;
  incomeSource: string;
  allowanceFrequency: 'monthly' | 'bi-weekly' | 'semester';
  budgetPreference: 'monthly' | 'semester';
  onboardingCompleted: boolean;
}

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'Bank Transfer';

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  category: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  paymentMethod: PaymentMethod;
  description: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly';
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  mode: 'all' | 'campus' | 'pro';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'semester';
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'over';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  priority: 'High' | 'Medium' | 'Low';
  plannedMonthlyContribution: number;
  icon: string;
  category: string;
}

export interface SavingsGoalProjection extends SavingsGoal {
  projectedCompletionDate: string;
  monthsRemaining: number;
  isOnTrack: boolean;
  requiredMonthlyToMeetTarget: number;
  monthlyShortfall: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'bill' | 'income' | 'subscription' | 'milestone';
  date: string; // YYYY-MM-DD
  status: 'upcoming' | 'paid' | 'received';
  isRecurring?: boolean;
  category?: string;
}

export type InsightType = 'warning' | 'tip' | 'celebration' | 'alert';

export interface CoachInsight {
  id: string;
  title: string;
  explanation: string;
  supportingData: string;
  type: InsightType;
  actionText?: string;
  actionView?: string;
  read: boolean;
  timestamp: string;
}

export interface PurchaseAnalysisInput {
  name: string;
  amount: number;
  category: string;
  plannedDate?: string;
  isEssential?: boolean;
}

export interface PurchaseAnalysisResult {
  id: string;
  input: PurchaseAnalysisInput;
  recommendation: 'Affordable' | 'Be Careful' | 'Not Recommended';
  score: number; // 0 - 100
  moneyRemaining: number;
  budgetImpact: {
    category: string;
    currentSpent: number;
    budgetLimit: number;
    afterPurchaseSpent: number;
    exceedsBudget: boolean;
    excessAmount: number;
  };
  savingsImpact: {
    affectedGoalName: string;
    delayDays: number;
    monthlyContributionCovered: number;
  };
  reasons: string[];
  scenarios: {
    buyNow: {
      feasible: boolean;
      summary: string;
      riskLevel: 'Low' | 'Medium' | 'High';
    };
    wait: {
      recommendedDate: string;
      summary: string;
    };
    savePlan: {
      weeks: number;
      amountPerWeek: number;
      summary: string;
    };
  };
  suggestedAlternative?: string;
  createdAt: string;
}
