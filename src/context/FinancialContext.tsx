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
import { api } from '../services/api';

export type AppView =
  | 'landing'
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

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  mode?: string;
}

interface FinancialContextType {
  // Auth state
  currentUser: AuthUser | null;
  isDemoMode: boolean;
  isAuthLoading: boolean;
  loginUser: (user: AuthUser, profile: any) => Promise<void>;
  logoutUser: () => Promise<void>;
  enterDemoMode: (mode?: UserMode) => void;
  exitDemoMode: () => void;

  // Financial Data
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
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  resetToDemoData: (mode?: UserMode) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  editBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  applySuggestedBudgets: () => Promise<void>;

  // Goals
  addGoal: (g: Omit<SavingsGoal, 'id'>) => Promise<void>;
  editGoal: (id: string, g: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  logGoalContribution: (goalId: string, amount: number) => Promise<void>;
  updateGoalAllocations: (allocations: Record<string, number>) => Promise<void>;

  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => Promise<void>;
  toggleEventStatus: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // Purchase Analyzer
  analyzePurchase: (input: PurchaseAnalysisInput) => PurchaseAnalysisResult;
  savePurchaseAnalysis: (analysis: PurchaseAnalysisResult) => Promise<void>;
  deleteSavedAnalysis: (id: string) => Promise<void>;

  // Coach & Notifications
  markInsightAsRead: (id: string) => void;
  dismissInsight: (id: string) => void;
  clearAllNotifications: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth & Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Core Financial Entities
  const [profile, setProfile] = useState<UserProfile>(CAMPUS_SAMPLE_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<PurchaseAnalysisResult[]>([]);

  // Current view
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Load User Data from Backend
  const loadUserDataFromBackend = async () => {
    try {
      const data = await api.financials.getAll();
      if (data.profile) {
        setProfile({
          name: data.profile.name || 'User',
          mode: data.profile.mode || 'campus',
          currency: data.profile.currency || 'INR',
          avatar:
            data.profile.mode === 'campus'
              ? CAMPUS_SAMPLE_PROFILE.avatar
              : PRO_SAMPLE_PROFILE.avatar,
          collegeOrCompany: data.profile.college_or_company || '',
          startingBalance: Number(data.profile.starting_balance) || 0,
          monthlyIncomeOrAllowance: Number(data.profile.monthly_income) || 0,
          incomeSource: data.profile.income_source || '',
          allowanceFrequency: data.profile.allowance_frequency || 'monthly',
          budgetPreference: data.profile.budget_preference || 'monthly',
          onboardingCompleted: Boolean(data.profile.onboarding_completed),
        });

        if (!data.profile.onboarding_completed) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('dashboard');
        }
      }

      setTransactions(data.transactions || []);
      setBudgets(data.budgets || []);
      setGoals(data.goals || []);
      setEvents(data.events || []);
      setSavedAnalyses(data.wishlist || []);
      setInsights([]); // Personal users start with fresh, rule-derived insights
    } catch (err) {
      console.error('Failed to load user financial data:', err);
    }
  };

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const { user } = await api.auth.getMe();
        if (user) {
          setCurrentUser(user);
          setIsDemoMode(false);
          await loadUserDataFromBackend();
        } else {
          setCurrentUser(null);
          setCurrentView('landing');
        }
      } catch (err) {
        console.warn('Session restoration failed or backend offline:', err);
        setCurrentUser(null);
        setCurrentView('landing');
      } finally {
        setIsAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  // Enter Demo Mode (strictly isolated sample data, no database writes)
  const enterDemoMode = (targetMode: UserMode = 'campus') => {
    setIsDemoMode(true);
    setCurrentUser(null);
    if (targetMode === 'campus') {
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

  // Exit Demo Mode and return to Landing Page
  const exitDemoMode = () => {
    setIsDemoMode(false);
    setCurrentView('landing');
  };

  // Log in user
  const loginUser = async (user: AuthUser, initialProfile: any) => {
    setIsDemoMode(false);
    setCurrentUser(user);
    if (initialProfile) {
      setProfile({
        name: initialProfile.name || user.name || 'User',
        mode: initialProfile.mode || 'campus',
        currency: initialProfile.currency || 'INR',
        avatar:
          initialProfile.mode === 'campus'
            ? CAMPUS_SAMPLE_PROFILE.avatar
            : PRO_SAMPLE_PROFILE.avatar,
        collegeOrCompany: initialProfile.college_or_company || '',
        startingBalance: Number(initialProfile.starting_balance) || 0,
        monthlyIncomeOrAllowance: Number(initialProfile.monthly_income) || 0,
        incomeSource: initialProfile.income_source || '',
        allowanceFrequency: initialProfile.allowance_frequency || 'monthly',
        budgetPreference: initialProfile.budget_preference || 'monthly',
        onboardingCompleted: Boolean(initialProfile.onboarding_completed),
      });

      if (!initialProfile.onboarding_completed) {
        setCurrentView('onboarding');
      } else {
        await loadUserDataFromBackend();
        setCurrentView('dashboard');
      }
    } else {
      await loadUserDataFromBackend();
    }
  };

  // Log out user
  const logoutUser = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setIsDemoMode(false);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setEvents([]);
      setInsights([]);
      setCurrentView('landing');
    }
  };

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
  const setMode = async (mode: UserMode) => {
    if (mode === profile.mode) return;
    const updated = { ...profile, mode };
    if (!isDemoMode && currentUser) {
      await api.financials.updateProfile({ mode });
    }
    setProfile(updated);
  };

  const setCurrency = async (currency: CurrencyCode) => {
    if (!isDemoMode && currentUser) {
      await api.financials.updateProfile({ currency });
    }
    setProfile(prev => ({ ...prev, currency }));
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial };
    if (!isDemoMode && currentUser) {
      await api.financials.updateProfile({
        name: updated.name,
        mode: updated.mode,
        currency: updated.currency,
        college_or_company: updated.collegeOrCompany,
        starting_balance: updated.startingBalance,
        monthly_income: updated.monthlyIncomeOrAllowance,
        income_source: updated.incomeSource,
        allowance_frequency: updated.allowanceFrequency,
        budget_preference: updated.budgetPreference,
      });
    }
    setProfile(updated);
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile,
      ...data,
      onboardingCompleted: true,
    };
    if (!isDemoMode && currentUser) {
      await api.financials.updateProfile({
        name: updated.name,
        mode: updated.mode,
        currency: updated.currency,
        college_or_company: updated.collegeOrCompany,
        starting_balance: updated.startingBalance,
        monthly_income: updated.monthlyIncomeOrAllowance,
        income_source: updated.incomeSource,
        allowance_frequency: updated.allowanceFrequency,
        budget_preference: updated.budgetPreference,
        onboarding_completed: true,
      });
    }
    setProfile(updated);
    setCurrentView('dashboard');
  };

  const resetToDemoData = (targetMode?: UserMode) => {
    enterDemoMode(targetMode || profile.mode);
  };

  // Transactions
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.addTransaction(tx);
        setTransactions(prev => [saved, ...prev]);
        return;
      } catch (err) {
        console.error('Failed to save transaction to backend:', err);
        throw err;
      }
    }

    // Demo / fallback local
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const editTransaction = async (id: string, updated: Partial<Transaction>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.editTransaction(id, updated);
        setTransactions(prev => prev.map(t => (t.id === id ? saved : t)));
        return;
      } catch (err) {
        console.error('Failed to update transaction in backend:', err);
        throw err;
      }
    }
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.deleteTransaction(id);
      } catch (err) {
        console.error('Failed to delete transaction from backend:', err);
        throw err;
      }
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Budgets
  const addBudget = async (b: Omit<Budget, 'id'>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.addBudget(b);
        setBudgets(prev => [...prev, saved]);
        return;
      } catch (err) {
        console.error('Failed to add budget to backend:', err);
        throw err;
      }
    }
    const newBudget: Budget = { ...b, id: `b-${Date.now()}` };
    setBudgets(prev => [...prev, newBudget]);
  };

  const editBudget = async (id: string, updated: Partial<Budget>) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.editBudget(id, updated);
      } catch (err) {
        console.error('Failed to edit budget in backend:', err);
        throw err;
      }
    }
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBudget = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.deleteBudget(id);
      } catch (err) {
        console.error('Failed to delete budget from backend:', err);
        throw err;
      }
    }
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const applySuggestedBudgets = async () => {
    if (budgets.length > 0 && !window.confirm(`Replace all ${budgets.length} existing budgets with the suggested set? Existing budget limits will be removed.`)) return;
    const suggestions = generateSmartBudgets(
      profile.monthlyIncomeOrAllowance,
      profile.mode
    );

    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.applyBatchBudgets(suggestions);
        setBudgets(saved);
        return;
      } catch (err) {
        console.error('Failed to apply batch budgets in backend:', err);
        throw err;
      }
    }

    const newBudgets: Budget[] = suggestions.map((s, idx) => ({
      id: `b-sug-${Date.now()}-${idx}`,
      category: s.category,
      limit: s.limit,
      period: s.period,
    }));
    setBudgets(newBudgets);
  };

  // Goals
  const addGoal = async (g: Omit<SavingsGoal, 'id'>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.addGoal(g);
        setGoals(prev => [...prev, saved]);
        return;
      } catch (err) {
        console.error('Failed to add goal to backend:', err);
        throw err;
      }
    }
    const newGoal: SavingsGoal = { ...g, id: `g-${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
  };

  const editGoal = async (id: string, updated: Partial<SavingsGoal>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.editGoal(id, updated);
        setGoals(prev => prev.map(g => (g.id === id ? saved : g)));
        return;
      } catch (err) {
        console.error('Failed to edit goal in backend:', err);
        throw err;
      }
    }
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGoal = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.deleteGoal(id);
      } catch (err) {
        console.error('Failed to delete goal from backend:', err);
        throw err;
      }
    }
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const logGoalContribution = async (goalId: string, amount: number) => {
    if (!isDemoMode && currentUser) {
      try {
        const result = await api.financials.depositGoal(goalId, amount);
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: result.currentAmount } : g));
          const today = new Date();
          const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          setTransactions(prev => [{
            id: result.transactionId,
            amount,
            currency: profile.currency,
            category: profile.mode === 'campus' ? 'Hostel & Living' : 'Investments & Savings',
            date,
            type: 'expense',
            paymentMethod: 'Bank Transfer',
            description: `Goal Deposit: ${goal.name}`,
          }, ...prev]);
        }
        return;
      } catch (err) {
        console.error('Failed to deposit to goal in backend:', err);
        throw err;
      }
    }

    // Demo mode local state update
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
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

  const updateGoalAllocations = async (allocations: Record<string, number>) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.updateGoalAllocations(allocations);
      } catch (err) {
        console.error('Failed to update goal allocations in backend:', err);
        throw err;
      }
    }
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
  const addCalendarEvent = async (e: Omit<CalendarEvent, 'id'>) => {
    if (!isDemoMode && currentUser) {
      try {
        const saved = await api.financials.addCalendarEvent(e);
        setEvents(prev => [...prev, saved]);
        return;
      } catch (err) {
        console.error('Failed to add calendar event to backend:', err);
        throw err;
      }
    }
    const newEvent: CalendarEvent = { ...e, id: `ev-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
  };

  const toggleEventStatus = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        const res = await api.financials.toggleCalendarEvent(id);
        setEvents(prev =>
          prev.map(e => (e.id === id ? { ...e, status: res.status as any } : e))
        );
        return;
      } catch (err) {
        console.error('Failed to toggle event in backend:', err);
        throw err;
      }
    }
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

  const deleteCalendarEvent = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.deleteCalendarEvent(id);
      } catch (err) {
        console.error('Failed to delete calendar event from backend:', err);
        throw err;
      }
    }
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

  const savePurchaseAnalysis = async (analysis: PurchaseAnalysisResult) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.saveWishlist({
          itemName: analysis.input.name,
          amount: analysis.input.amount,
          category: analysis.input.category,
          score: analysis.score,
          recommendation: analysis.recommendation,
        });
      } catch (err) {
        console.error('Failed to save analysis to backend wishlist:', err);
        throw err;
      }
    }
    setSavedAnalyses(prev => [analysis, ...prev]);
  };

  const deleteSavedAnalysis = async (id: string) => {
    if (!isDemoMode && currentUser) {
      try {
        await api.financials.deleteWishlist(id);
      } catch (err) {
        console.error('Failed to delete wishlist item from backend:', err);
        throw err;
      }
    }
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
        currentUser,
        isDemoMode,
        isAuthLoading,
        loginUser,
        logoutUser,
        enterDemoMode,
        exitDemoMode,
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
