import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyCode } from '../../types';
import { CURRENCIES } from '../../utils/currency';
import { Icon } from '../common/Icon';
import { NotificationDropdown } from './NotificationDropdown';

interface TopHeaderProps {
  onOpenQuickAdd: () => void;
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenQuickAdd, onOpenMobileMenu }) => {
  const {
    currentView,
    profile,
    currentUser,
    isDemoMode,
    logoutUser,
    exitDemoMode,
    setCurrency,
    setMode,
    unreadNotificationsCount,
    setCurrentView,
  } = useFinancial();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const handleModeChange = async () => {
    try { await setMode(profile.mode === 'campus' ? 'pro' : 'campus'); }
    catch { window.alert('Could not save the experience mode. Please try again.'); }
  };

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: profile.mode === 'campus' ? 'Campus Financial Hub' : 'Executive Financial Workspace',
      subtitle:
        profile.mode === 'campus'
          ? 'Pocket money, semester budgets & daily spending pace'
          : 'Cash flow, commitments & wealth allocations',
    },
    transactions: {
      title: 'Transactions Ledger',
      subtitle: 'Complete searchable record of your income, expenses & transfers',
    },
    budgets: {
      title: 'Budgets & Smart Allocations',
      subtitle: 'Categorized spending caps with automated 50/30/20 & student suggestions',
    },
    goals: {
      title: 'Advanced Savings Goals Studio',
      subtitle: 'Interactive multi-goal simulator, monthly trade-offs & milestones',
    },
    calendar: {
      title: 'Financial Calendar',
      subtitle: 'Upcoming bills, scheduled recurring subscriptions & payday events',
    },
    coach: {
      title: 'Proactive Money Coach',
      subtitle: 'Transparent rule-driven financial heuristics & personalized tips',
    },
    analyzer: {
      title: 'Can I Afford This?',
      subtitle: 'Evaluate discretionary purchases against available funds & priorities',
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Spending trends, category breakdown & net cash retention trajectory',
    },
    settings: {
      title: 'Preferences & Transparency',
      subtitle: 'Profile customization, financial calculation audit & data management',
    },
  };

  const currentMeta = viewTitles[currentView] || {
    title: 'Pennywise',
    subtitle: 'Personal Finance',
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#10172E]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger + Page Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#A7B0C8] hover:text-[#F1F3FA] rounded-xl hover:bg-white/5"
          aria-label="Open mobile navigation"
        >
          <Icon name="Menu" size={20} />
        </button>

        <div>
          <h2 className="text-sm md:text-base font-bold text-[#F1F3FA] leading-tight flex items-center gap-2">
            {currentMeta.title}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                profile.mode === 'campus'
                  ? 'bg-turquoise/15 text-turquoise border border-turquoise/30'
                  : 'bg-lavender/15 text-lavender border border-lavender/30'
              }`}
            >
              {profile.mode === 'campus' ? 'Campus Mode' : 'Pro Mode'}
            </span>
            {isDemoMode && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30">
                Sample Demo
              </span>
            )}
          </h2>
          <p className="text-xs text-[#A7B0C8] hidden sm:block truncate max-w-md">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Currency, Notifications & Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Currency Selector */}
        <div className="relative">
          <select
            value={profile.currency}
            disabled={profile.onboardingCompleted}
            onChange={e => setCurrency(e.target.value as CurrencyCode)}
            className="appearance-none bg-[#151E38] hover:bg-[#1B2645] border border-white/10 rounded-xl px-2.5 py-1.5 pr-7 text-xs font-mono font-bold text-[#F1F3FA] cursor-pointer focus:outline-none focus:border-turquoise transition-all"
            title="Account currency is fixed after onboarding; amounts are not converted"
          >
            {Object.keys(CURRENCIES).map(code => (
              <option key={code} value={code} className="bg-[#10172E] font-sans">
                {CURRENCIES[code as CurrencyCode].symbol} {code}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#A7B0C8]">
            <Icon name="ChevronDown" size={13} />
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-turquoise hover:bg-turquoise-hover text-[#10172E] text-xs font-bold transition-all shadow-glow-turquoise"
        >
          <Icon name="Plus" size={15} />
          <span>Add</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-[#151E38] hover:bg-[#1B2645] border border-white/10 text-[#A7B0C8] hover:text-[#F1F3FA] transition-colors relative"
            title="Alerts and Insights"
          >
            <Icon name="Bell" size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-semantic-warning text-[#10172E] font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* Profile Avatar & User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full border border-white/20 object-cover"
            />
            <Icon name="ChevronDown" size={13} className="text-[#A7B0C8] hidden md:block" />
          </button>

          {/* User Menu Dropdown */}
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 top-12 w-64 rounded-2xl bg-[#151E38] border border-white/10 shadow-2xl py-2 z-50 text-xs animate-fadeIn"
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-white/5">
                <p className="font-bold text-[#F1F3FA]">{profile.name}</p>
                <p className="text-[11px] text-[#A7B0C8] truncate">
                  {currentUser ? currentUser.email : isDemoMode ? 'Sample Demo Session' : ''}
                </p>
                {profile.collegeOrCompany && (
                  <p className="text-[10px] text-turquoise truncate mt-0.5">{profile.collegeOrCompany}</p>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    void handleModeChange();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-[#F1F3FA]"
                >
                  <Icon name="Repeat" size={14} className="text-turquoise" />
                  Switch to {profile.mode === 'campus' ? 'Pro Mode' : 'Campus Mode'}
                </button>

                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-[#F1F3FA]"
                >
                  <Icon name="Settings" size={14} className="text-lavender" />
                  Settings & Transparency
                </button>

                {currentUser && (
                  <button
                    onClick={async () => {
                      setIsProfileMenuOpen(false);
                      await logoutUser();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-semantic-error border-t border-white/5 mt-1"
                  >
                    <Icon name="LogOut" size={14} />
                    Log Out of Pennywise
                  </button>
                )}

                {isDemoMode && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      exitDemoMode();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-turquoise border-t border-white/5 mt-1"
                  >
                    <Icon name="ArrowLeft" size={14} />
                    Exit to Public Landing Page
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
