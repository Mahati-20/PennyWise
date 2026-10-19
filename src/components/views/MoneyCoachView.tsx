import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { Icon } from '../common/Icon';

export const MoneyCoachView: React.FC = () => {
  const {
    profile,
    insights,
    markInsightAsRead,
    dismissInsight,
    clearAllNotifications,
    currentBalance,
    availableToSpendInfo,
    dailyAllowance,
    setCurrentView,
  } = useFinancial();

  const [filterType, setFilterType] = useState<'all' | 'warning' | 'tip' | 'celebration'>('all');
  const currency = profile.currency;

  const filteredInsights = insights.filter(i => {
    if (filterType === 'all') return true;
    return i.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-text-primary">Proactive Money Coach</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-turquoise/20 text-turquoise uppercase tracking-wider">
              Transparent Rules Engine
            </span>
          </div>
          <p className="text-xs text-text-muted">
            {profile.mode === 'campus'
              ? 'Friendly financial guidance, allowance pacing & student habit building'
              : 'Concise executive insights on cash flow, commitment ratios & runway security'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {insights.some(i => !i.read) && (
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-midnight-elevated hover:bg-midnight-hover border border-white/10 text-xs font-semibold text-turquoise transition-all"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Heuristics Snapshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-turquoise/15 text-turquoise">
            <Icon name="Activity" size={20} />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Spending Velocity</span>
            <span className="text-base font-bold font-mono text-text-primary">
              {profile.mode === 'campus'
                ? `${formatCurrency(dailyAllowance, currency)} / day limit`
                : 'Controlled Pace (Healthy)'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-lavender/15 text-lavender">
            <Icon name="ShieldCheck" size={20} />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Committed Protection</span>
            <span className="text-base font-bold font-mono text-lavender">
              {formatCurrency(availableToSpendInfo.upcomingCommitted, currency)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-midnight-surface border border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-semantic-success/15 text-semantic-success">
            <Icon name="Sparkles" size={20} />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Decision Confidence</span>
            <span className="text-base font-bold font-mono text-semantic-success">
              High (Verified Model)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-medium border-b border-white/10 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterType === 'all'
              ? 'bg-turquoise text-midnight font-bold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          All Insights ({insights.length})
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterType === 'warning'
              ? 'bg-semantic-warning text-midnight font-bold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Warnings & Alerts
        </button>
        <button
          onClick={() => setFilterType('tip')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterType === 'tip'
              ? 'bg-turquoise text-midnight font-bold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Recommendations & Tips
        </button>
        <button
          onClick={() => setFilterType('celebration')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterType === 'celebration'
              ? 'bg-semantic-success text-midnight font-bold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Milestones & Wins
        </button>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-3.5">
        {filteredInsights.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted rounded-2xl bg-midnight-surface/80 border border-white/10">
            <Icon name="CheckCircle2" size={28} className="mx-auto text-turquoise mb-2" />
            <p className="font-semibold text-text-primary">No insights matching this filter.</p>
            <p>Your finances are in excellent standing!</p>
          </div>
        ) : (
          filteredInsights.map(insight => {
            const isWarning = insight.type === 'warning' || insight.type === 'alert';
            const isCelebration = insight.type === 'celebration';

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl bg-midnight-surface/80 border transition-all ${
                  !insight.read ? 'border-turquoise/40 shadow-sm' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isWarning
                          ? 'bg-semantic-warning/15 text-semantic-warning'
                          : isCelebration
                          ? 'bg-semantic-success/15 text-semantic-success'
                          : 'bg-turquoise/15 text-turquoise'
                      }`}
                    >
                      <Icon
                        name={
                          isWarning
                            ? 'AlertTriangle'
                            : isCelebration
                            ? 'PartyPopper'
                            : 'Lightbulb'
                        }
                        size={18}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">{insight.title}</h3>
                        {!insight.read && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-turquoise text-midnight uppercase">
                            New
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted">{insight.timestamp}</span>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {insight.explanation}
                      </p>

                      <div className="pt-1.5 flex items-center gap-4">
                        <span className="text-[11px] font-mono text-text-muted bg-midnight px-2.5 py-1 rounded-lg border border-white/5">
                          {insight.supportingData}
                        </span>

                        {insight.actionText && (
                          <button
                            onClick={() => {
                              if (insight.actionView) setCurrentView(insight.actionView as any);
                              markInsightAsRead(insight.id);
                            }}
                            className="text-xs font-semibold text-turquoise hover:underline flex items-center gap-1"
                          >
                            {insight.actionText} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!insight.read && (
                      <button
                        onClick={() => markInsightAsRead(insight.id)}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-white/5"
                        title="Mark read"
                      >
                        <Icon name="Check" size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="p-1.5 text-text-muted hover:text-semantic-error rounded-lg hover:bg-white/5"
                      title="Dismiss"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

