import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { UserMode } from '../../types';
import { Icon } from '../common/Icon';

interface WelcomeScreenProps {
  onStartOnboarding: (mode: UserMode) => void;
  onExploreDemo: (mode: UserMode) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartOnboarding,
  onExploreDemo,
}) => {
  const { setMode } = useFinancial();

  const handleSelectMode = (mode: UserMode, startOnboarding: boolean) => {
    setMode(mode);
    if (startOnboarding) {
      onStartOnboarding(mode);
    } else {
      onExploreDemo(mode);
    }
  };

  return (
    <div className="min-h-screen bg-[#10172E] text-text-primary flex flex-col justify-between p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background ambient fintech glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-turquoise/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-turquoise to-lavender p-0.5 shadow-glow-turquoise">
            <div className="w-full h-full bg-[#10172E] rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-base bg-gradient-to-r from-turquoise to-lavender bg-clip-text text-transparent">
                PW
              </span>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">Pennywise</span>
            <span className="text-[10px] text-turquoise font-mono block leading-none">
              Fintech Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectMode('campus', false)}
            className="px-3.5 py-1.5 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-turquoise transition-all"
          >
            Instant Campus Demo
          </button>
          <button
            onClick={() => handleSelectMode('pro', false)}
            className="px-3.5 py-1.5 rounded-xl bg-midnight-surface hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-lavender transition-all"
          >
            Instant Pro Demo
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 z-10 flex flex-col items-center text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-elevated border border-turquoise/30 text-turquoise text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
          A clearer view of your everyday finances
        </div>

        {/* Memorable Headline */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight mb-4">
          Make your money{' '}
          <span className="bg-gradient-to-r from-turquoise via-lavender to-turquoise bg-clip-text text-transparent">
            make sense.
          </span>
        </h1>

        <p className="text-sm md:text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed font-normal">
          Beyond ordinary expense trackers. Pennywise pairs luminous financial visualizations with
          our signature <strong className="text-turquoise font-semibold">Money Orbit</strong> and{' '}
          <strong className="text-lavender font-semibold">Can I Afford This?</strong> decision
          engine.
        </p>

        {/* Mode Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          {/* Card 1: Campus Mode */}
          <div className="group rounded-3xl bg-midnight-surface/80 border border-turquoise/20 hover:border-turquoise/60 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-turquoise flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-turquoise/10 rounded-full blur-2xl pointer-events-none group-hover:bg-turquoise/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎓</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-turquoise/15 text-turquoise border border-turquoise/30">
                  Student Life
                </span>
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">Campus Mode</h3>
              <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                Tailored for college students managing pocket money, stipends, canteen meals, books,
                hostel expenses, and semester savings goals without stress.
              </p>

              <ul className="space-y-2 text-xs text-text-muted mb-6">
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-turquoise" />
                  Daily spending allowance pacing (Safe to spend today)
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-turquoise" />
                  Semester budget health & student categories
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-turquoise" />
                  Coding laptop, trips & milestone challenges
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/5">
              <button
                onClick={() => handleSelectMode('campus', true)}
                className="w-full py-3 rounded-xl bg-turquoise text-midnight font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center justify-center gap-2"
              >
                Start Guided Student Setup
                <Icon name="ArrowRight" size={14} />
              </button>
              <button
                onClick={() => handleSelectMode('campus', false)}
                className="w-full py-2.5 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2"
              >
                Explore Campus Demo Data
              </button>
            </div>
          </div>

          {/* Card 2: Pro Mode */}
          <div className="group rounded-3xl bg-midnight-surface/80 border border-lavender/20 hover:border-lavender/60 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lavender flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/10 rounded-full blur-2xl pointer-events-none group-hover:bg-lavender/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">💼</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-lavender/15 text-lavender border border-lavender/30">
                  Professionals
                </span>
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">Pro Workspace</h3>
              <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                Designed for working professionals managing salary, rent leases, recurring bills,
                emergency fund runways, and multi-goal allocations.
              </p>

              <ul className="space-y-2 text-xs text-text-muted mb-6">
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-lavender" />
                  Monthly cash flow & discretionary vs fixed commitments
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-lavender" />
                  Multi-goal trade-off simulator & emergency runway
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={14} className="text-lavender" />
                  Executive data density & refined financial analytics
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/5">
              <button
                onClick={() => handleSelectMode('pro', true)}
                className="w-full py-3 rounded-xl bg-lavender text-midnight font-bold text-xs hover:shadow-glow-lavender transition-all flex items-center justify-center gap-2"
              >
                Start Guided Pro Setup
                <Icon name="ArrowRight" size={14} />
              </button>
              <button
                onClick={() => handleSelectMode('pro', false)}
                className="w-full py-2.5 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2"
              >
                Explore Pro Demo Data
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 text-xs text-text-muted border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <span>Pennywise • Premium Fintech Web Companion</span>
        <span className="flex items-center gap-4">
          <span className="text-turquoise">Money Orbit visualizations</span>
          <span>•</span>
          <span>Campus and Pro experiences</span>
          <span>•</span>
          <span className="text-lavender">Multi-Currency (INR, USD, EUR, GBP)</span>
        </span>
      </footer>
    </div>
  );
};

