import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { PersonalOnboarding } from './components/onboarding/PersonalOnboarding';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsGoalsStudio } from './components/views/SavingsGoalsStudio';
import { FinancialCalendarView } from './components/views/FinancialCalendarView';
import { MoneyCoachView } from './components/views/MoneyCoachView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { PurchaseAnalyzerModal } from './components/modals/PurchaseAnalyzerModal';
import { TransactionType } from './types';
import { Icon } from './components/common/Icon';

const MainApp: React.FC = () => {
  const {
    currentUser,
    isDemoMode,
    isAuthLoading,
    loginUser,
    enterDemoMode,
    exitDemoMode,
    profile,
    currentView,
    setCurrentView,
    completeOnboarding,
    addCalendarEvent,
    addGoal,
  } = useFinancial();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Global Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<TransactionType>('expense');
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

  // Mobile Drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // If restoring session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#10172E] text-[#F1F3FA] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-turquoise to-lavender p-0.5 shadow-glow-turquoise animate-pulse mb-4">
          <div className="w-full h-full bg-[#10172E] rounded-[14px] flex items-center justify-center font-bold text-sm text-turquoise">
            PW
          </div>
        </div>
        <p className="text-xs text-[#A7B0C8] font-mono">Restoring secure session...</p>
      </div>
    );
  }

  // If on public landing page and not signed in or in demo mode
  if (currentView === 'landing' && !currentUser && !isDemoMode) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onLogIn={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onExploreDemo={() => enterDemoMode('campus')}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={(user, userProfile) => loginUser(user, userProfile)}
        />
      </>
    );
  }

  // If logged in but onboarding is not completed yet
  if (currentUser && !profile.onboardingCompleted) {
    return (
      <PersonalOnboarding
        initialName={profile.name || currentUser.name || 'User'}
        initialMode={profile.mode}
        onFinish={async data => {
          await completeOnboarding({
            name: profile.name,
            mode: data.mode,
            currency: data.currency,
            collegeOrCompany: data.collegeOrCompany,
            startingBalance: data.startingBalance,
            monthlyIncomeOrAllowance: data.monthlyIncome,
            incomeSource: data.incomeSource,
            allowanceFrequency: data.allowanceFrequency,
            onboardingCompleted: true,
          });

          // If user added initial commitment in onboarding
          if (data.initialCommitment) {
            await addCalendarEvent({
              title: data.initialCommitment.title,
              amount: data.initialCommitment.amount,
              type: 'bill',
              date: data.initialCommitment.date,
              status: 'upcoming',
            });
          }

          // If user added initial savings goal in onboarding
          if (data.initialGoal) {
            await addGoal({
              name: data.initialGoal.name,
              targetAmount: data.initialGoal.targetAmount,
              currentAmount: 0,
              targetDate: data.initialGoal.targetDate,
              priority: 'High',
              plannedMonthlyContribution: data.initialGoal.plannedMonthly,
              icon: data.mode === 'campus' ? 'Laptop' : 'ShieldCheck',
              category: data.mode === 'campus' ? 'Tech & Gadgets' : 'Investments & Savings',
            });
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#10172E] text-text-primary flex flex-col">
      {/* Persistent Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-[#1B2645] via-[#223055] to-[#1B2645] border-b border-turquoise/30 px-4 py-2 text-xs text-[#F1F3FA] flex flex-wrap items-center justify-between gap-2 z-40 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-turquoise animate-ping" />
            <span className="font-semibold text-turquoise">DEMO MODE:</span>
            <span className="text-[#A7B0C8]">
              Exploring fictional sample data. Changes stay in memory and are not saved.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-turquoise text-[#10172E] font-bold text-[11px] hover:shadow-glow-turquoise transition-all"
            >
              Create My Personal Account
            </button>
            <button
              onClick={exitDemoMode}
              className="text-[#A7B0C8] hover:text-[#F1F3FA] text-[11px] underline"
            >
              Exit to Landing Page
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Desktop Persistent Sidebar */}
        <Sidebar
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
          onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <TopHeader
            onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                onOpenQuickAdd={handleOpenQuickAdd}
                onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
              />
            )}

            {currentView === 'transactions' && (
              <TransactionsView onOpenQuickAdd={handleOpenQuickAdd} />
            )}

            {currentView === 'budgets' && <BudgetsView />}

            {currentView === 'goals' && <SavingsGoalsStudio />}

            {currentView === 'calendar' && <FinancialCalendarView />}

            {currentView === 'coach' && <MoneyCoachView />}

            {currentView === 'analyzer' && (
              <div className="py-6">
                <PurchaseAnalyzerModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                />
              </div>
            )}

            {currentView === 'reports' && <ReportsView />}

            {currentView === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNavigation
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultType={quickAddType}
      />

      {/* Purchase Analyzer Modal */}
      <PurchaseAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
      />

      {/* Auth Modal (if opened from top header or demo banner) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(user, userProfile) => loginUser(user, userProfile)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <MainApp />
    </FinancialProvider>
  );
}
