import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyCode, UserMode } from '../../types';
import { CURRENCIES } from '../../utils/currency';
import { Icon } from '../common/Icon';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    setMode,
    setCurrency,
    resetToDemoData,
    transactions,
    budgets,
    goals,
    events,
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<'profile' | 'transparency' | 'data'>('profile');
  const [name, setName] = useState(profile.name);
  const [collegeOrCompany, setCollegeOrCompany] = useState(profile.collegeOrCompany);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, collegeOrCompany });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleExportJSON = () => {
    const exportData = {
      profile,
      transactions,
      budgets,
      goals,
      events,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Pennywise_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Settings & Transparency Center</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Configure preferences, inspect calculation math, and manage your financial records
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center rounded-xl bg-midnight p-1 border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('transparency')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transparency'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Transparency
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'data'
                ? 'bg-turquoise text-midnight font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Data & Demo
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Preferences */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Persona Mode Switch */}
          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Active Persona Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('campus')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  profile.mode === 'campus'
                    ? 'border-turquoise bg-turquoise/10 shadow-glow-turquoise'
                    : 'border-white/10 bg-midnight text-text-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎓</span>
                  <span className="text-sm font-bold text-text-primary">Campus Mode</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Tailored for college students with allowance pacing, daily burn limits, and student
                  categories.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('pro')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  profile.mode === 'pro'
                    ? 'border-lavender bg-lavender/10 shadow-glow-lavender'
                    : 'border-white/10 bg-midnight text-text-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💼</span>
                  <span className="text-sm font-bold text-text-primary">Pro Workspace</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Tailored for working professionals managing salary, rent leases, emergency
                  runways, and investments.
                </p>
              </button>
            </div>
          </div>

          {/* Currency Preference */}
          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Global Display Currency</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    profile.currency === code
                      ? 'border-turquoise bg-turquoise/15 text-turquoise font-bold shadow-sm'
                      : 'border-white/10 bg-midnight text-text-muted hover:border-white/20'
                  }`}
                >
                  <span className="text-base font-mono font-bold block mb-0.5">
                    {CURRENCIES[code].symbol}
                  </span>
                  <span className="text-xs block font-sans">{code}</span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    {CURRENCIES[code].name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info Form */}
          <form
            onSubmit={handleProfileSave}
            className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-text-primary">Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">
                  {profile.mode === 'campus' ? 'College / University' : 'Company / Workplace'}
                </label>
                <input
                  type="text"
                  value={collegeOrCompany}
                  onChange={e => setCollegeOrCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedNotice ? (
                <span className="text-xs text-semantic-success flex items-center gap-1 font-semibold">
                  <Icon name="Check" size={14} /> Profile updated!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Transparency Center */}
      {activeTab === 'transparency' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-turquoise">
              <Icon name="ShieldCheck" size={18} />
              1. Available-to-Spend Calculation Formula
            </div>
            <p className="text-text-secondary leading-relaxed">
              Available-to-spend is strictly defined to prevent accidental overdrafts and debt.
            </p>
            <div className="p-3 rounded-xl bg-midnight font-mono text-[11px] text-text-primary border border-white/5 space-y-1">
              <p className="text-turquoise font-bold">
                Available to Spend = Liquid Balance - Upcoming Committed Bills - Reserved Monthly Goal Contributions
              </p>
              <p className="text-text-muted text-[10px]">
                * It never double-counts expenses that have already cleared from your starting balance.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-turquoise">
              <Icon name="ShieldAlert" size={18} />
              2. "Can I Afford This?" Scoring Rules
            </div>
            <p className="text-text-secondary leading-relaxed">
              The purchase analyzer produces a deterministic 0 to 100 score based on 4 transparent rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
              <li>
                <strong>Cash Runway Impact (up to 45 pts):</strong> Assesses what percentage of your free liquid cash buffer is absorbed by the proposed purchase.
              </li>
              <li>
                <strong>Category Budget Cap (up to 30 pts):</strong> Assesses whether the purchase pushes your designated category over limit.
              </li>
              <li>
                <strong>Savings Goal Trade-off (up to 20 pts):</strong> Calculates the days of planned goal savings delayed if this money is diverted.
              </li>
              <li>
                <strong>Essential Priority (+10 pts bonus):</strong> Work or academic requirements receive reduced sensitivity penalty.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-lavender">
              <Icon name="Lock" size={18} />
              3. Privacy & Zero-API Commitment
            </div>
            <p className="text-text-secondary leading-relaxed">
              Pennywise runs 100% locally in your browser using structured client-side persistence. No personal financial data is transmitted to third-party ad networks or external tracking systems. The Money Coach heuristics are fully verifiable mathematical formulas, eliminating hallucinations.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Data & Demo Management */}
      {activeTab === 'data' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Demo Data Management</h3>
            <p className="text-text-secondary leading-relaxed">
              Pennywise provides realistic sample datasets tailored for college students and working
              professionals. You can reset anytime without affecting other devices.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => resetToDemoData('campus')}
                className="px-4 py-2.5 rounded-xl bg-midnight border border-turquoise/30 text-turquoise hover:bg-turquoise/15 font-semibold transition-all flex items-center gap-2"
              >
                <Icon name="RotateCcw" size={14} />
                Load Campus Demo Data (IIT Bombay)
              </button>

              <button
                onClick={() => resetToDemoData('pro')}
                className="px-4 py-2.5 rounded-xl bg-midnight border border-lavender/30 text-lavender hover:bg-lavender/15 font-semibold transition-all flex items-center gap-2"
              >
                <Icon name="RotateCcw" size={14} />
                Load Pro Demo Data (Stripe Senior Designer)
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-surface/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Backup & Export</h3>
            <p className="text-text-secondary leading-relaxed">
              Download your complete financial records, transactions, budgets, and savings goals as
              a portable JSON file.
            </p>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-text-primary font-semibold flex items-center gap-2"
            >
              <Icon name="Download" size={14} className="text-turquoise" />
              Export Full Account Backup (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
