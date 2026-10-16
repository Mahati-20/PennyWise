import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
  Transaction,
  Budget,
  BudgetProgress,
  SavingsGoal,
  SavingsGoalProjection,
  CalendarEvent,
  CoachInsight,
  PurchaseAnalysisInput,
  PurchaseAnalysisResult,
  UserMode,
  CurrencyCode,
} from '../types';
import {
  CAMPUS_SAMPLE_PROFILE,
  CAMPUS_SAMPLE_TRANSACTIONS,
  CAMPUS_SAMPLE_BUDGETS,
  CAMPUS_SAMPLE_GOALS,
  CAMPUS_SAMPLE_EVENTS,
  CAMPUS_SAMPLE_INSIGHTS,
  PRO_SAMPLE_PROFILE,
  PRO_SAMPLE_TRANSACTIONS,
  PRO_SAMPLE_BUDGETS,
  PRO_SAMPLE_GOALS,
  PRO_SAMPLE_EVENTS,
  PRO_SAMPLE_INSIGHTS,
} from '../data/mockData';
import {
  calculateCurrentBalance,
  calculateAvailableToSpend,
  calculateBudgetsProgress,
  calculateGoalProjections,
  evaluatePurchaseAffordability,
  generateSmartBudgets,
} from '../utils/calculations';

export type AppView =
  | 'welcome'
  | 'onboarding'
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'analyzer'
  | 'coach'
  | 'calendar'
  | 'reports'
  | 'settings';

interface FinancialContextType {
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  events: CalendarEvent[];
  insights: CoachInsight[];
  savedAnalyses: PurchaseAnalysisResult[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Derived calculations
  currentBalance: number;
  availableToSpendInfo: {
    available: number;
    currentBalance: number;
    upcomingCommitted: number;
    reservedGoals: number;
  };
  incomeThisMonth: number;
  expenseThisMonth: number;
  netSavingsRate: number;
  budgetsProgress: BudgetProgress[];
  goalsProjections: SavingsGoalProjection[];
  dailyAllowance: number;
  unreadNotificationsCount: number;

  // Actions
  setMode: (mode: UserMode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (data: Partial<UserProfile>) => void;
  resetToDemoData: (mode?: UserMode) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => void;
  editBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  applySuggestedBudgets: () => void;

  // Goals
  addGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  editGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  logGoalContribution: (goalId: string, amount: number) => void;
  updateGoalAllocations: (allocations: Record<string, number>) => void;

  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  toggleEventStatus: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;

  // Purchase Analyzer
  analyzePurchase: (input: PurchaseAnalysisInput) => PurchaseAnalysisResult;
  savePurchaseAnalysis: (analysis: PurchaseAnalysisResult) => void;
  deleteSavedAnalysis: (id: string) => void;

  // Coach & Notifications
  markInsightAsRead: (id: string) => void;
  dismissInsight: (id: string) => void;
  clearAllNotifications: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const STORAGE_KEY = 'pennywise_app_state_v1';

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state or defaults
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_PROFILE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_goals`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_GOALS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_events`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_EVENTS;
  });

  const [insights, setInsights] = useState<CoachInsight[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_insights`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return CAMPUS_SAMPLE_INSIGHTS;
  });

  const [savedAnalyses, setSavedAnalyses] = useState<PurchaseAnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_analyses`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Current screen
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals));
      localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
      localStorage.setItem(`${STORAGE_KEY}_insights`, JSON.stringify(insights));
      localStorage.setItem(`${STORAGE_KEY}_analyses`, JSON.stringify(savedAnalyses));
    } catch (e) {
      console.error('Failed to sync to local storage', e);
    }
  }, [profile, transactions, budgets, goals, events, insights, savedAnalyses]);

  // Derived Calculations
  const currentBalance = useMemo(() => {
    return calculateCurrentBalance(profile.startingBalance, transactions);
  }, [profile.startingBalance, transactions]);

  const availableToSpendInfo = useMemo(() => {
    return calculateAvailableToSpend(currentBalance, events, goals);
  }, [currentBalance, events, goals]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const incomeThisMonth = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentYear, currentMonth]);

  const expenseThisMonth = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentYear, currentMonth]);

  const netSavingsRate = useMemo(() => {
    if (incomeThisMonth <= 0) return 0;
    const diff = incomeThisMonth - expenseThisMonth;
    return Math.max(0, Math.round((diff / incomeThisMonth) * 100));
  }, [incomeThisMonth, expenseThisMonth]);

  const budgetsProgress = useMemo(() => {
    return calculateBudgetsProgress(budgets, transactions);
  }, [budgets, transactions]);

  const goalsProjections = useMemo(() => {
    return calculateGoalProjections(goals);
  }, [goals]);

  // Daily Allowance for Campus
  const dailyAllowance = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = Math.max(1, daysInMonth - now.getDate());
    return Math.round(availableToSpendInfo.available / daysRemaining);
  }, [availableToSpendInfo.available, currentYear, currentMonth, now]);

  const unreadNotificationsCount = useMemo(() => {
    return insights.filter(i => !i.read).length;
  }, [insights]);

  // Dynamic Rule-Based Coach Insights Generation
  useEffect(() => {
    // Check if any budget is over limit or approaching limit
    const overBudgets = budgetsProgress.filter(b => b.status === 'over');
    if (overBudgets.length > 0) {
      const topOver = overBudgets[0];
      const existing = insights.find(i => i.id === `budget-alert-${topOver.category}`);
      if (!existing) {
        setInsights(prev => [
          {
            id: `budget-alert-${topOver.category}`,
            title: `Budget Exceeded: ${topOver.category} ⚠️`,
            explanation: `You've spent ${topOver.spent} out of ${topOver.limit} in ${topOver.category}. Consider moderating spending here.`,
            supportingData: `Exceeded by ${(topOver.spent - topOver.limit).toFixed(0)}`,
            type: 'warning',
            actionText: 'Manage Budgets',
            actionView: 'budgets',
            read: false,
            timestamp: 'Just now',
          },
          ...prev,
        ]);
      }
    }
  }, [budgetsProgress]);

  // Actions
  const setMode = (mode: UserMode) => {
    if (mode === profile.mode) return;
    if (mode === 'campus') {
      setProfile(prev => ({
        ...prev,
        mode: 'campus',
        currency: 'INR',
        monthlyIncomeOrAllowance: 16000,
        startingBalance: 12450,
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        mode: 'pro',
        currency: 'USD',
        monthlyIncomeOrAllowance: 7200,
        startingBalance: 18450,
      }));
    }
  };

  const setCurrency = (currency: CurrencyCode) => {
    setProfile(prev => ({ ...prev, currency }));
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  const completeOnboarding = (data: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...data,
      onboardingCompleted: true,
    }));
    setCurrentView('dashboard');
  };

  const resetToDemoData = (targetMode?: UserMode) => {
    const mode = targetMode || profile.mode;
    if (mode === 'campus') {
      setProfile(CAMPUS_SAMPLE_PROFILE);
      setTransactions(CAMPUS_SAMPLE_TRANSACTIONS);
      setBudgets(CAMPUS_SAMPLE_BUDGETS);
      setGoals(CAMPUS_SAMPLE_GOALS);
      setEvents(CAMPUS_SAMPLE_EVENTS);
      setInsights(CAMPUS_SAMPLE_INSIGHTS);
    } else {
      setProfile(PRO_SAMPLE_PROFILE);
      setTransactions(PRO_SAMPLE_TRANSACTIONS);
      setBudgets(PRO_SAMPLE_BUDGETS);
      setGoals(PRO_SAMPLE_GOALS);
      setEvents(PRO_SAMPLE_EVENTS);
      setInsights(PRO_SAMPLE_INSIGHTS);
    }
    setSavedAnalyses([]);
    setCurrentView('dashboard');
  };

  // Transactions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Budgets
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...b,
      id: `b-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const editBudget = (id: string, updated: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const applySuggestedBudgets = () => {
    const suggestions = generateSmartBudgets(
      profile.monthlyIncomeOrAllowance,
      profile.mode
    );
    const newBudgets: Budget[] = suggestions.map((s, idx) => ({
      id: `b-sug-${Date.now()}-${idx}`,
      category: s.category,
      limit: s.limit,
      period: s.period,
    }));
    setBudgets(newBudgets);
  };

  // Goals
  const addGoal = (g: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...g,
      id: `g-${Date.now()}`,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const editGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const logGoalContribution = (goalId: string, amount: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    // Add transaction record as an investment / savings expense
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      addTransaction({
        amount,
        currency: profile.currency,
        category: profile.mode === 'campus' ? 'Hostel & Living' : 'Investments & Savings',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        paymentMethod: 'Bank Transfer',
        description: `Deposit to Goal: ${goal.name}`,
      });
    }
  };

  const updateGoalAllocations = (allocations: Record<string, number>) => {
    setGoals(prev =>
      prev.map(g => {
        if (allocations[g.id] !== undefined) {
          return { ...g, plannedMonthlyContribution: allocations[g.id] };
        }
        return g;
      })
    );
  };

  // Calendar
  const addCalendarEvent = (e: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...e,
      id: `ev-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const toggleEventStatus = (id: string) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === id) {
          const nextStatus = e.status === 'upcoming' ? 'paid' : 'upcoming';
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  const deleteCalendarEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Purchase Analyzer
  const analyzePurchase = (input: PurchaseAnalysisInput): PurchaseAnalysisResult => {
    return evaluatePurchaseAffordability(
      input,
      currentBalance,
      availableToSpendInfo.available,
      budgetsProgress,
      goals
    );
  };

  const savePurchaseAnalysis = (analysis: PurchaseAnalysisResult) => {
    setSavedAnalyses(prev => [analysis, ...prev]);
  };

  const deleteSavedAnalysis = (id: string) => {
    setSavedAnalyses(prev => prev.filter(a => a.id !== id));
  };

  // Coach & Notifications
  const markInsightAsRead = (id: string) => {
    setInsights(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
  };

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const clearAllNotifications = () => {
    setInsights(prev => prev.map(i => ({ ...i, read: true })));
  };

  return (
    <FinancialContext.Provider
      value={{
        profile,
        transactions,
        budgets,
        goals,
        events,
        insights,
        savedAnalyses,
        currentView,
        setCurrentView,
        currentBalance,
        availableToSpendInfo,
        incomeThisMonth,
        expenseThisMonth,
        netSavingsRate,
        budgetsProgress,
        goalsProjections,
        dailyAllowance,
        unreadNotificationsCount,
        setMode,
        setCurrency,
        updateProfile,
        completeOnboarding,
        resetToDemoData,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addBudget,
        editBudget,
        deleteBudget,
        applySuggestedBudgets,
        addGoal,
        editGoal,
        deleteGoal,
        logGoalContribution,
        updateGoalAllocations,
        addCalendarEvent,
        toggleEventStatus,
        deleteCalendarEvent,
        analyzePurchase,
        savePurchaseAnalysis,
        deleteSavedAnalysis,
        markInsightAsRead,
        dismissInsight,
        clearAllNotifications,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
