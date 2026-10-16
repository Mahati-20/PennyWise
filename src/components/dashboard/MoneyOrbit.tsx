import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { Icon } from '../common/Icon';

interface SegmentDetail {
  title: string;
  category?: string;
  amount: number;
  percentage?: number;
  color: string;
  description: string;
  type: 'spending' | 'budget' | 'goal' | 'balance';
}

export const MoneyOrbit: React.FC = () => {
  const {
    profile,
    currentBalance,
    availableToSpendInfo,
    budgetsProgress,
    goals,
    expenseThisMonth,
    setCurrentView,
  } = useFinancial();

  const [activeCenterMetric, setActiveCenterMetric] = useState<'available' | 'balance'>('available');
  const [hoveredSegment, setHoveredSegment] = useState<SegmentDetail | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showA11yTable, setShowA11yTable] = useState(false);

  // Currency
  const currency = profile.currency;

  // Prepare spending arcs
  const topBudgets = budgetsProgress.slice(0, 5);
  const totalBudgetSpent = topBudgets.reduce((sum, b) => sum + b.spent, 0) || 1;

  // Concentric ring radii
  const size = 380;
  const center = size / 2;
  const innerRadius = 78;
  const midRadius = 114;
  const outerRadius = 150;

  // Compute angles for spending segments
  let currentAngle = -90; // Start at top
  const spendingArcs = topBudgets.map(b => {
    const fraction = b.spent / totalBudgetSpent;
    const arcAngle = Math.max(12, fraction * 340); // Leave a small gap
    const start = currentAngle;
    const end = currentAngle + arcAngle;
    currentAngle = end + 4; // 4 deg gap

    return {
      category: b.category,
      amount: b.spent,
      percentage: Math.round(fraction * 100),
      startAngle: start,
      endAngle: end,
      color: b.percentage > 100 ? '#F08091' : b.percentage > 75 ? '#F2C66D' : '#40D9D0',
    };
  });

  // Convert polar coordinates to SVG path
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Center value display
  const centerAmount =
    activeCenterMetric === 'available' ? availableToSpendInfo.available : currentBalance;
  const centerLabel =
    activeCenterMetric === 'available' ? 'Available to Spend' : 'Total Net Balance';

  return (
    <div className="relative rounded-2xl bg-midnight-elevated/70 border border-white/10 p-5 md:p-6 backdrop-blur-md overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-turquoise-glow blur-[100px] pointer-events-none opacity-40" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-lavender-glow blur-[90px] pointer-events-none opacity-30" />

      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-turquoise/10 border border-turquoise/30 text-turquoise">
            <Icon name="Compass" size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              Interactive Money Orbit
            </h3>
            <p className="text-xs text-text-muted">
              Visual map of liquid funds, category spend & active goals
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Metric toggle pill */}
          <div className="flex items-center rounded-lg bg-midnight-surface p-0.5 border border-white/5 text-xs font-medium">
            <button
              onClick={() => setActiveCenterMetric('available')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCenterMetric === 'available'
                  ? 'bg-turquoise text-midnight font-bold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveCenterMetric('balance')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCenterMetric === 'balance'
                  ? 'bg-lavender text-midnight font-bold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Net Balance
            </button>
          </div>

          {/* Accessibility toggle */}
          <button
            onClick={() => setShowA11yTable(!showA11yTable)}
            title="Toggle accessible data table"
            className="p-1.5 rounded-lg bg-midnight-surface hover:bg-midnight-hover text-text-secondary hover:text-text-primary border border-white/5 transition-colors"
          >
            <Icon name="Table" size={15} />
          </button>
        </div>
      </div>

      {/* Accessible Table Fallback */}
      {showA11yTable ? (
        <div className="my-4 p-4 rounded-xl bg-midnight-surface/90 border border-white/10 text-xs text-text-secondary">
          <h4 className="font-semibold text-text-primary mb-2">Money Orbit Data Table</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>{centerLabel}</span>
              <span className="font-semibold text-turquoise">
                {formatCurrency(centerAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>This Month Expenses</span>
              <span className="font-semibold text-semantic-warning">
                {formatCurrency(expenseThisMonth, currency)}
              </span>
            </div>
            {topBudgets.map(b => (
              <div key={b.id} className="flex justify-between py-1">
                <span>{b.category}</span>
                <span>
                  {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)} (
                  {b.percentage}%)
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowA11yTable(false)}
            className="mt-3 text-xs text-turquoise hover:underline"
          >
            Return to visual orbit
          </button>
        </div>
      ) : (
        /* Orbit Visualization Container */
        <div className="relative flex flex-col items-center justify-center my-2">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[340px] md:max-w-[380px] h-auto drop-shadow-2xl select-none"
            aria-label="Money Orbit financial visualization"
          >
            <defs>
              {/* Radial gradient for central glow */}
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#40D9D0" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#1B2645" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#151E38" stopOpacity="0.95" />
              </radialGradient>
              <linearGradient id="orbitRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#40D9D0" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#B9A7FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#40D9D0" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Background orbital guide tracks */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle
              cx={center}
              cy={center}
              r={midRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="none"
              stroke="rgba(185, 167, 255, 0.12)"
              strokeWidth="1"
              strokeDasharray="6 6"
              className={reducedMotion ? '' : 'animate-spin-slow origin-center'}
              style={{ animationDuration: '45s' }}
            />

            {/* Ring 1: Inner Spending Arcs */}
            {spendingArcs.map((arc, i) => {
              const pathD = describeArc(center, center, innerRadius, arc.startAngle, arc.endAngle);
              const isHovered = hoveredSegment?.category === arc.category;

              return (
                <path
                  key={i}
                  d={pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isHovered ? 8 : 5}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer hover:opacity-100"
                  style={{
                    opacity: hoveredSegment && !isHovered ? 0.35 : 0.85,
                    filter: isHovered ? `drop-shadow(0 0 6px ${arc.color})` : 'none',
                  }}
                  onMouseEnter={() =>
                    setHoveredSegment({
                      title: arc.category,
                      category: arc.category,
                      amount: arc.amount,
                      percentage: arc.percentage,
                      color: arc.color,
                      description: `${arc.percentage}% of month's tracked spending`,
                      type: 'spending',
                    })
                  }
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => setCurrentView('budgets')}
                />
              );
            })}

            {/* Ring 2: Mid Budget Progress Arc */}
            <path
              d={describeArc(center, center, midRadius, -90, 160)}
              fill="none"
              stroke="#B9A7FF"
              strokeWidth="3.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
              className="cursor-pointer transition-all hover:stroke-lavender-light"
              onMouseEnter={() =>
                setHoveredSegment({
                  title: 'Monthly Budget Health',
                  amount: expenseThisMonth,
                  color: '#B9A7FF',
                  description: 'Tracked against monthly category allocations',
                  type: 'budget',
                })
              }
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => setCurrentView('budgets')}
            />

            {/* Ring 3: Orbital Goal Satellites */}
            {goals.slice(0, 3).map((goal, index) => {
              // Position satellites around outer orbit
              const angle = (index * 115 + 35) * (Math.PI / 180);
              const x = center + outerRadius * Math.cos(angle);
              const y = center + outerRadius * Math.sin(angle);
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isHovered = hoveredSegment?.title === goal.name;

              return (
                <g
                  key={goal.id}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() =>
                    setHoveredSegment({
                      title: goal.name,
                      amount: goal.currentAmount,
                      percentage: pct,
                      color: '#5ED6A2',
                      description: `Target: ${formatCurrency(goal.targetAmount, currency)} (${pct}% funded)`,
                      type: 'goal',
                    })
                  }
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => setCurrentView('goals')}
                >
                  {/* Glowing halo */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 16 : 12}
                    fill="rgba(94, 214, 162, 0.15)"
                    stroke="rgba(94, 214, 162, 0.4)"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  {/* Goal core dot */}
                  <circle cx={x} cy={y} r={isHovered ? 7 : 5} fill="#5ED6A2" />
                </g>
              );
            })}

            {/* Central Core Surface */}
            <circle
              cx={center}
              cy={center}
              r={56}
              fill="url(#centerGlow)"
              stroke={activeCenterMetric === 'available' ? 'rgba(64, 217, 208, 0.4)' : 'rgba(185, 167, 255, 0.4)'}
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer filter drop-shadow-md"
              onClick={() =>
                setActiveCenterMetric(prev => (prev === 'available' ? 'balance' : 'available'))
              }
            />

            {/* Central Information */}
            <text
              x={center}
              y={center - 16}
              textAnchor="middle"
              className="text-[10px] font-medium tracking-wider fill-[#A7B0C8] uppercase"
            >
              {centerLabel}
            </text>
            <text
              x={center}
              y={center + 8}
              textAnchor="middle"
              className="text-[16px] md:text-[18px] font-bold font-mono tracking-tight fill-[#F1F3FA]"
            >
              {formatCurrency(centerAmount, currency, { compact: centerAmount > 99999 })}
            </text>
            <text
              x={center}
              y={center + 26}
              textAnchor="middle"
              className="text-[9px] fill-[#40D9D0] cursor-pointer hover:underline"
              onClick={() =>
                setActiveCenterMetric(prev => (prev === 'available' ? 'balance' : 'available'))
              }
            >
              Tap to switch
            </text>
          </svg>

          {/* Interactive Info Card below Orbit */}
          <div className="w-full mt-2 min-h-[58px] p-2.5 rounded-xl bg-midnight-surface/80 border border-white/5 flex items-center justify-between text-xs transition-all">
            {hoveredSegment ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: hoveredSegment.color }}
                  />
                  <div>
                    <span className="font-semibold text-text-primary block">
                      {hoveredSegment.title}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {hoveredSegment.description}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-text-primary block">
                    {formatCurrency(hoveredSegment.amount, currency)}
                  </span>
                  {hoveredSegment.percentage !== undefined && (
                    <span className="text-[11px] text-turquoise">
                      {hoveredSegment.percentage}%
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full text-text-muted px-1">
                <span className="flex items-center gap-1.5">
                  <Icon name="MousePointerClick" size={14} className="text-turquoise" />
                  Hover arcs & satellites to inspect spending & goals
                </span>
                <span className="text-[11px] text-text-secondary hidden sm:inline">
                  {goals.length} Goals Active
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orbit legend tags */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-text-secondary text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-turquoise" />
          <span>Category Arcs</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lavender" />
          <span>Budget Utilization</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-semantic-success" />
          <span>Goal Satellites</span>
        </div>
      </div>
    </div>
  );
};
