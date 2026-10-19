import React from 'react';
import { useFinancial, AppView } from '../../context/FinancialContext';
import { Icon } from '../common/Icon';

interface SidebarProps {
  onOpenQuickAdd: () => void;
  onOpenAnalyzer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd, onOpenAnalyzer }) => {
  const { currentView, setCurrentView, profile, setMode } = useFinancial();
  const handleModeChange = async (mode: 'campus' | 'pro') => {
    try { await setMode(mode); }
    catch { window.alert('Could not save the experience mode. Please try again.'); }
  };

  const navItems: { id: AppView; label: string; icon: string; badge?: string }[] = [
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

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 bg-[#151E38] border-r border-white/10 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Luminous Logo Orb */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-turquoise to-lavender flex items-center justify-center p-0.5 shadow-glow-turquoise group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#10172E] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-r from-turquoise to-lavender bg-clip-text text-transparent">
                PW
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-text-primary flex items-center gap-1.5">
              Pennywise
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-turquoise rounded">
                v1.0
              </span>
            </h1>
            <p className="text-[10px] font-medium text-text-muted tracking-wide uppercase">
              Financial Companion
            </p>
          </div>
        </div>
      </div>

      {/* Mode Indicator & Switcher Pill */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="p-1 rounded-xl bg-midnight border border-white/5 flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => handleModeChange('campus')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              profile.mode === 'campus'
                ? 'bg-turquoise text-midnight font-bold shadow-glow-turquoise'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>🎓</span>
            Campus
          </button>
          <button
            onClick={() => handleModeChange('pro')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              profile.mode === 'pro'
                ? 'bg-lavender text-midnight font-bold shadow-glow-lavender'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>💼</span>
            Pro
          </button>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-midnight-elevated text-text-primary font-semibold border border-turquoise/30 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`transition-colors ${
                    isActive ? 'text-turquoise' : 'text-text-muted group-hover:text-text-primary'
                  }`}
                >
                  <Icon name={item.icon} size={17} />
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === 'Signature'
                      ? 'bg-turquoise/20 text-turquoise'
                      : 'bg-lavender/20 text-lavender'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Launch Action Buttons */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <button
          onClick={onOpenQuickAdd}
          className="w-full py-2.5 px-3 rounded-xl bg-turquoise hover:bg-turquoise-hover text-midnight text-xs font-bold transition-all shadow-glow-turquoise flex items-center justify-center gap-2"
        >
          <Icon name="Plus" size={16} />
          Add Transaction
        </button>
        <button
          onClick={onOpenAnalyzer}
          className="w-full py-2 px-3 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-text-primary text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Icon name="Sparkles" size={15} className="text-turquoise" />
          Can I Afford This?
        </button>
      </div>

      {/* User Mini Profile Footer */}
      <div className="p-3 bg-midnight border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-8 h-8 rounded-full border border-turquoise/40 object-cover shrink-0"
          />
          <div className="truncate">
            <p className="text-xs font-bold text-text-primary truncate">{profile.name}</p>
            <p className="text-[10px] text-text-muted truncate">{profile.collegeOrCompany}</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('settings')}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Settings"
        >
          <Icon name="Sliders" size={15} />
        </button>
      </div>
    </aside>
  );
};

