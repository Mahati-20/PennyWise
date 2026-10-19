import React, { useState } from 'react';
import { Icon } from '../common/Icon';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogIn,
  onExploreDemo,
}) => {
  const [hoveredPreviewRing, setHoveredPreviewRing] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#10172E] text-[#F1F3FA] flex flex-col justify-between selection:bg-turquoise/30 selection:text-turquoise relative overflow-hidden">
      {/* Background luxury ambient glow */}
      <div className="absolute top-0 left-1/3 w-[550px] h-[550px] bg-turquoise/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto px-4 md:px-8 py-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-turquoise to-lavender p-0.5 shadow-glow-turquoise group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#10172E] rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-base bg-gradient-to-r from-turquoise to-lavender bg-clip-text text-transparent">
                PW
              </span>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#F1F3FA]">Pennywise</span>
            <span className="text-[10px] text-turquoise font-mono block leading-none tracking-wider uppercase">
              Fintech Companion
            </span>
          </div>
        </div>

        {/* Action Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExploreDemo}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151E38] hover:bg-[#1B2645] border border-white/10 text-xs font-semibold text-[#A7B0C8] hover:text-[#F1F3FA] transition-all"
          >
            <span>✨</span>
            <span>Explore Demo (Sample Data)</span>
          </button>

          <button
            onClick={onLogIn}
            className="px-4 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-xs font-semibold text-[#F1F3FA] transition-all"
          >
            Log In
          </button>

          <button
            onClick={onGetStarted}
            className="px-4 md:px-5 py-2 rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-[#10172E] text-xs font-bold hover:shadow-glow-turquoise transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <Icon name="ArrowRight" size={14} />
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-14 z-10 flex flex-col lg:flex-row items-center justify-between gap-12 my-auto">
        {/* Left: Value Proposition */}
        <div className="lg:max-w-xl text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B2645]/80 border border-turquoise/30 text-turquoise text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
            <span>Interactive Personal Finance Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F1F3FA] leading-[1.12]">
            Your money,{' '}
            <span className="bg-gradient-to-r from-turquoise via-lavender to-turquoise bg-clip-text text-transparent">
              made visual.
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#A7B0C8] leading-relaxed font-normal">
            Pennywise helps college students and working professionals understand spending, manage
            budgets, and make confident money decisions without complex spreadsheets.
          </p>

          {/* Dual Experience Mode Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#151E38]/80 border border-turquoise/20 hover:border-turquoise/40 transition-colors">
              <div className="flex items-center gap-2 text-turquoise font-bold text-xs mb-1">
                <span>🎓</span>
                <span>Campus Experience</span>
              </div>
              <p className="text-[11px] text-[#A7B0C8] leading-normal">
                Paced for allowances, student stipends, campus canteen meals & semester goals.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#151E38]/80 border border-lavender/20 hover:border-lavender/40 transition-colors">
              <div className="flex items-center gap-2 text-lavender font-bold text-xs mb-1">
                <span>💼</span>
                <span>Pro Workspace</span>
              </div>
              <p className="text-[11px] text-[#A7B0C8] leading-normal">
                Structured for salaries, recurring commitments, emergency runways & multi-goal wealth.
              </p>
            </div>
          </div>

          {/* Primary Call-to-Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-[#10172E] text-sm font-bold shadow-glow-turquoise hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <Icon name="ArrowRight" size={16} />
            </button>

            <button
              onClick={onExploreDemo}
              className="px-5 py-3.5 rounded-2xl bg-[#1B2645] hover:bg-[#223055] border border-white/10 text-xs font-semibold text-[#F1F3FA] transition-all flex items-center gap-2"
            >
              <span>Explore Sample Demo</span>
              <Icon name="Sparkles" size={15} className="text-lavender" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-[#A7B0C8]">
            <span className="flex items-center gap-1.5">
              <Icon name="Coins" size={15} className="text-semantic-success" />
              Track spending, budgets & goals
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="Compass" size={15} className="text-lavender" />
              Explore with fictional sample data
            </span>
          </div>
        </div>

        {/* Right: Tasteful Live Interactive Mini Money Orbit Preview */}
        <div className="w-full lg:max-w-md">
          <div className="relative rounded-3xl bg-[#151E38]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* Sample Data Badge */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-turquoise" />
                <span className="text-xs font-bold text-[#F1F3FA]">Money Orbit™ Live Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lavender/15 text-lavender font-semibold border border-lavender/30">
                Sample Interactive Data
              </span>
            </div>

            {/* Interactive SVG Orbit Preview */}
            <div className="relative flex flex-col items-center justify-center py-4 select-none">
              <svg viewBox="0 0 260 260" className="w-56 h-56 drop-shadow-xl">
                {/* Center Core Glow */}
                <circle cx="130" cy="130" r="42" fill="#1B2645" stroke="#40D9D0" strokeWidth="2" />
                <text x="130" y="122" textAnchor="middle" className="text-[9px] fill-[#A7B0C8] uppercase font-semibold">
                  Safe to Spend
                </text>
                <text x="130" y="140" textAnchor="middle" className="text-[14px] font-bold font-mono fill-[#40D9D0]">
                  ₹12,450
                </text>

                {/* Ring 1: Category Expenses */}
                <circle
                  cx="130"
                  cy="130"
                  r="62"
                  fill="none"
                  stroke="#40D9D0"
                  strokeWidth="5"
                  strokeDasharray="90 280"
                  className="cursor-pointer transition-all hover:stroke-turquoise-light"
                  onMouseEnter={() => setHoveredPreviewRing('Food & Canteen (₹4,500 - 36%)')}
                  onMouseLeave={() => setHoveredPreviewRing(null)}
                />
                <circle
                  cx="130"
                  cy="130"
                  r="62"
                  fill="none"
                  stroke="#B9A7FF"
                  strokeWidth="5"
                  strokeDasharray="60 300"
                  strokeDashoffset="-100"
                  className="cursor-pointer transition-all hover:stroke-lavender-light"
                  onMouseEnter={() => setHoveredPreviewRing('Books & Supplies (₹2,000 - 16%)')}
                  onMouseLeave={() => setHoveredPreviewRing(null)}
                />
                <circle
                  cx="130"
                  cy="130"
                  r="62"
                  fill="none"
                  stroke="#5ED6A2"
                  strokeWidth="5"
                  strokeDasharray="45 320"
                  strokeDashoffset="-170"
                  className="cursor-pointer transition-all hover:opacity-100"
                  onMouseEnter={() => setHoveredPreviewRing('Campus Transit (₹1,200 - 10%)')}
                  onMouseLeave={() => setHoveredPreviewRing(null)}
                />

                {/* Ring 2: Outer Savings Orbit & Satellites */}
                <circle
                  cx="130"
                  cy="130"
                  r="90"
                  fill="none"
                  stroke="rgba(185, 167, 255, 0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Satellite 1: Laptop Goal */}
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPreviewRing('Goal: MacBook M3 Pro (45% Funded)')}
                  onMouseLeave={() => setHoveredPreviewRing(null)}
                >
                  <circle cx="210" cy="90" r="10" fill="rgba(64, 217, 208, 0.2)" stroke="#40D9D0" strokeWidth="1.5" />
                  <circle cx="210" cy="90" r="4" fill="#40D9D0" />
                </g>

                {/* Satellite 2: Goa Trip Goal */}
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPreviewRing('Goal: Hackathon Trip (60% Funded)')}
                  onMouseLeave={() => setHoveredPreviewRing(null)}
                >
                  <circle cx="65" cy="180" r="10" fill="rgba(185, 167, 255, 0.2)" stroke="#B9A7FF" strokeWidth="1.5" />
                  <circle cx="65" cy="180" r="4" fill="#B9A7FF" />
                </g>
              </svg>

              {/* Dynamic hover caption */}
              <div className="w-full mt-3 p-2.5 rounded-xl bg-[#10172E] border border-white/5 text-center text-xs min-h-[42px] flex items-center justify-center text-[#A7B0C8]">
                {hoveredPreviewRing ? (
                  <span className="text-turquoise font-semibold">{hoveredPreviewRing}</span>
                ) : (
                  <span>Hover arcs or satellites to preview interactive financial data</span>
                )}
              </div>
            </div>

            {/* Bottom preview summary */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[11px]">
              <div className="p-2 rounded-lg bg-[#10172E]/60 text-left">
                <span className="text-[#A7B0C8] block text-[10px]">Monthly Inflow</span>
                <span className="font-mono font-bold text-semantic-success">₹16,000</span>
              </div>
              <div className="p-2 rounded-lg bg-[#10172E]/60 text-left">
                <span className="text-[#A7B0C8] block text-[10px]">Safe Daily Spend</span>
                <span className="font-mono font-bold text-turquoise">₹450 / day</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 md:px-8 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A7B0C8] gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F1F3FA]">Pennywise</span>
          <span>•</span>
          <span>Fintech Hackathon Build</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={onExploreDemo} className="hover:text-turquoise transition-colors">
            Explore Demo Mode
          </button>
          <span>•</span>
          <button onClick={onLogIn} className="hover:text-turquoise transition-colors">
            Sign In
          </button>
          <span>•</span>
          <button onClick={onGetStarted} className="text-turquoise font-semibold hover:underline">
            Get Started Free
          </button>
        </div>
      </footer>
    </div>
  );
};

