import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
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
import { TransactionType, UserMode } from './types';

const MainApp: React.FC = () => {
  const { profile, currentView, setCurrentView, resetToDemoData } = useFinancial();

  // Onboarding flow states
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<UserMode>('campus');

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

  // If onboarding is not completed yet, show welcome or onboarding
  if (!profile.onboardingCompleted && !isOnboardingActive) {
    return (
      <WelcomeScreen
        onStartOnboarding={mode => {
          setOnboardingMode(mode);
          setIsOnboardingActive(true);
        }}
        onExploreDemo={mode => {
          resetToDemoData(mode);
        }}
      />
    );
  }

  if (isOnboardingActive) {
    return (
      <OnboardingWizard
        initialMode={onboardingMode}
        onComplete={() => setIsOnboardingActive(false)}
        onCancel={() => {
          resetToDemoData(onboardingMode);
          setIsOnboardingActive(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#10172E] text-text-primary flex">
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

      {/* Purchase Analyzer Modal (When invoked from shortcut or button) */}
      <PurchaseAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
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
