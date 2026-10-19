import React, { useRef, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Icon } from '../common/Icon';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { insights, markInsightAsRead, dismissInsight, clearAllNotifications, setCurrentView } =
    useFinancial();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-[#151E38] border border-white/10 shadow-2xl z-50 overflow-hidden animate-fadeIn text-text-primary"
    >
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-midnight">
        <div className="flex items-center gap-2">
          <Icon name="Bell" size={16} className="text-turquoise" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Coach Alerts & Insights</h4>
        </div>
        {insights.some(i => !i.read) && (
          <button
            onClick={clearAllNotifications}
            className="text-[11px] text-turquoise hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
        {insights.length === 0 ? (
          <div className="p-6 text-center text-text-muted text-xs">
            <Icon name="CheckCircle" size={24} className="mx-auto mb-2 text-turquoise/50" />
            No new alerts. Your finances are running smoothly!
          </div>
        ) : (
          insights.map(item => {
            const isWarning = item.type === 'warning';
            const isCelebration = item.type === 'celebration';
            const isAlert = item.type === 'alert';

            return (
              <div
                key={item.id}
                className={`p-3 transition-colors hover:bg-white/5 ${
                  !item.read ? 'bg-midnight-elevated/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 p-1 rounded-lg shrink-0 ${
                        isWarning
                          ? 'bg-semantic-warning/15 text-semantic-warning'
                          : isCelebration
                          ? 'bg-semantic-success/15 text-semantic-success'
                          : isAlert
                          ? 'bg-semantic-error/15 text-semantic-error'
                          : 'bg-turquoise/15 text-turquoise'
                      }`}
                    >
                      <Icon
                        name={
                          isWarning
                            ? 'AlertTriangle'
                            : isCelebration
                            ? 'PartyPopper'
                            : isAlert
                            ? 'Flame'
                            : 'Sparkles'
                        }
                        size={14}
                      />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                        {item.title}
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-turquoise" />
                        )}
                      </h5>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                        {item.explanation}
                      </p>
                      <p className="text-[10px] text-text-muted font-mono mt-1">
                        {item.supportingData}
                      </p>

                      {item.actionText && (
                        <button
                          onClick={() => {
                            if (item.actionView) {
                              setCurrentView(item.actionView as any);
                            }
                            markInsightAsRead(item.id);
                            onClose();
                          }}
                          className="mt-2 text-[11px] font-semibold text-turquoise hover:underline flex items-center gap-1"
                        >
                          {item.actionText} →
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => dismissInsight(item.id)}
                    className="p-1 text-text-muted hover:text-text-primary rounded"
                    title="Dismiss"
                  >
                    <Icon name="X" size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2.5 border-t border-white/5 bg-midnight text-center">
        <button
          onClick={() => {
            setCurrentView('coach');
            onClose();
          }}
          className="text-xs font-semibold text-turquoise hover:underline"
        >
          Open Full Money Coach Hub →
        </button>
      </div>
    </div>
  );
};

