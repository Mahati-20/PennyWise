import React from 'react';
import { useFinancial, AppView } from '../../context/FinancialContext';
import { Icon } from '../common/Icon';

interface MobileNavigationProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenQuickAdd: () => void;
  onOpenAnalyzer: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isDrawerOpen,
  onCloseDrawer,
  onOpenQuickAdd,
  onOpenAnalyzer,
}) => {
  const { currentView, setCurrentView, profile, setMode } = useFinancial();
  const handleModeChange = async (mode: 'campus' | 'pro') => {
    try { await setMode(mode); }
    catch { window.alert('Could not save the experience mode. Please try again.'); }
  };

  const allNavItems: { id: AppView; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'transactions', label: 'Transactions', icon: 'Receipt' },
    { id: 'budgets', label: 'Budgets', icon: 'PieChart' },
    { id: 'goals', label: 'Savings Goals', icon: 'Target', badge: 'Studio' },
    { id: 'calendar', label: 'Financial Calendar', icon: 'CalendarDays' },
    { id: 'coach', label: 'Money Coach', icon: 'Sparkles' },
    { id: 'analyzer', label: 'Can I Afford This?', icon: 'ShieldAlert', badge: 'Signature' },
    { id: 'reports', label: 'Reports & Insights', icon: 'TrendingUp' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  const primaryBottomItems: { id: AppView; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: 'LayoutDashboard' },
    { id: 'transactions', label: 'Activity', icon: 'Receipt' },
    { id: 'analyzer', label: 'Afford?', icon: 'ShieldAlert' },
    { id: 'goals', label: 'Goals', icon: 'Target' },
  ];

  return (
    <>
      {/* Mobile Slide-Out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#151E38] h-full shadow-2xl flex flex-col z-10 border-r border-white/10 animate-slideRight">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-turquoise to-lavender p-0.5">
                  <div className="w-full h-full bg-midnight rounded-[6px] flex items-center justify-center font-bold text-xs text-turquoise">
                    PW
                  </div>
                </div>
                <span className="font-bold text-sm text-text-primary">Pennywise</span>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Mode switch */}
            <div className="p-3 border-b border-white/5">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-midnight border border-white/5 text-xs font-semibold">
                <button
                  onClick={() => handleModeChange('campus')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 ${
                    profile.mode === 'campus'
                      ? 'bg-turquoise text-midnight font-bold'
                      : 'text-text-muted'
                  }`}
                >
                  🎓 Campus
                </button>
                <button
                  onClick={() => handleModeChange('pro')}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1 ${
                    profile.mode === 'pro' ? 'bg-lavender text-midnight font-bold' : 'text-text-muted'
                  }`}
                >
                  💼 Pro
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {allNavItems.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      onCloseDrawer();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-midnight-elevated text-turquoise font-bold border border-turquoise/30'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon name={item.icon} size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-text-primary">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  onCloseDrawer();
                  onOpenQuickAdd();
                }}
                className="w-full py-2 px-3 rounded-xl bg-turquoise text-midnight text-xs font-bold shadow-glow-turquoise"
              >
                + Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Touch-Friendly Bottom Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#151E38]/95 backdrop-blur-md border-t border-white/10 z-30 px-3 flex items-center justify-around">
        {primaryBottomItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-turquoise font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Floating Quick Action Button in Center */}
        <button
          onClick={onOpenQuickAdd}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-turquoise to-[#35C2B9] text-midnight flex items-center justify-center shadow-glow-turquoise -mt-4 active:scale-95 transition-transform"
          aria-label="Add expense or income"
        >
          <Icon name="Plus" size={20} className="stroke-[2.5]" />
        </button>

        {/* More/Menu item */}
        <button
          onClick={onCloseDrawer} // Toggle
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-text-muted hover:text-text-primary"
        >
          <Icon name="Grid" size={18} />
          <span className="text-[10px] leading-none">More</span>
        </button>
      </div>
    </>
  );
};

