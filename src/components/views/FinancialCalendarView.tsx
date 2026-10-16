import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/currency';
import { CalendarEvent } from '../../types';
import { Icon } from '../common/Icon';

export const FinancialCalendarView: React.FC = () => {
  const { profile, events, transactions, addCalendarEvent, toggleEventStatus, deleteCalendarEvent } =
    useFinancial();
  const currency = profile.currency;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'bill' | 'subscription' | 'income' | 'milestone'>('bill');
  const [date, setDate] = useState(selectedDateStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Events & Transactions for selected date
  const eventsOnSelectedDate = events.filter(e => e.date === selectedDateStr);
  const transactionsOnSelectedDate = transactions.filter(t => t.date === selectedDateStr);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    addCalendarEvent({
      title: title.trim() || 'Scheduled Payment',
      amount: parsedAmount,
      type,
      date,
      status: 'upcoming',
    });

    setIsAddEventOpen(false);
    setTitle('');
    setAmount('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-midnight-surface/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Financial Calendar</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Visualize upcoming commitments, auto-debits, paydays, and milestone checkpoints
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={goToToday}
            className="px-3 py-2 rounded-xl bg-midnight border border-white/10 text-xs font-semibold text-text-secondary hover:text-text-primary"
          >
            Today
          </button>
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="px-4 py-2 rounded-xl bg-turquoise text-midnight text-xs font-bold shadow-glow-turquoise transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            Schedule Commitment
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar (8 cols) + Selected Date Details (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 shadow-subtle-elevated">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-text-primary">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-midnight hover:bg-midnight-hover border border-white/5 text-text-muted hover:text-text-primary transition-colors"
                title="Previous month"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-midnight hover:bg-midnight-hover border border-white/5 text-text-muted hover:text-text-primary transition-colors"
                title="Next month"
              >
                <Icon name="ChevronRight" size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[70px] p-1 rounded-xl bg-midnight/20" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateString = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = selectedDateStr === dateString;
              const isToday =
                new Date().toISOString().split('T')[0] === dateString;

              const dayEvents = events.filter(e => e.date === dateString);
              const dayTxs = transactions.filter(t => t.date === dateString);

              return (
                <div
                  key={dateString}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`min-h-[70px] md:min-h-[85px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-midnight-elevated border-turquoise shadow-glow-turquoise/20'
                      : 'bg-midnight/70 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-turquoise text-midnight'
                          : isSelected
                          ? 'text-turquoise'
                          : 'text-text-primary'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Small badges count */}
                    {(dayEvents.length > 0 || dayTxs.length > 0) && (
                      <span className="text-[9px] font-bold text-text-muted">
                        {dayEvents.length + dayTxs.length}
                      </span>
                    )}
                  </div>

                  {/* Visual Event Pills */}
                  <div className="space-y-1 my-1">
                    {dayEvents.slice(0, 2).map(e => (
                      <div
                        key={e.id}
                        className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${
                          e.type === 'bill'
                            ? 'bg-semantic-warning/20 text-semantic-warning'
                            : e.type === 'income'
                            ? 'bg-semantic-success/20 text-semantic-success'
                            : 'bg-lavender/20 text-lavender'
                        }`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayTxs.length > 0 && dayEvents.length === 0 && (
                      <div className="text-[9px] text-text-muted truncate px-1">
                        {dayTxs.length} txs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-midnight-surface/80 border border-white/10 p-5 md:p-6 flex flex-col justify-between shadow-subtle-elevated">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block">
                  Selected Date
                </span>
                <h4 className="text-sm font-bold text-text-primary font-mono">
                  {new Date(selectedDateStr).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
              </div>
              <button
                onClick={() => {
                  setDate(selectedDateStr);
                  setIsAddEventOpen(true);
                }}
                className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise hover:bg-turquoise/25"
                title="Add event for this date"
              >
                <Icon name="Plus" size={15} />
              </button>
            </div>

            {/* Scheduled Commitments */}
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
                  <Icon name="CalendarClock" size={14} className="text-semantic-warning" />
                  Scheduled Commitments ({eventsOnSelectedDate.length})
                </h5>

                {eventsOnSelectedDate.length === 0 ? (
                  <p className="text-[11px] text-text-muted italic py-2">
                    No scheduled bills or income due on this date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eventsOnSelectedDate.map(e => (
                      <div
                        key={e.id}
                        className="p-3 rounded-xl bg-midnight border border-white/5 text-xs flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-text-primary block">{e.title}</span>
                          <span className="text-[10px] text-text-muted capitalize">
                            {e.type} •{' '}
                            <button
                              onClick={() => toggleEventStatus(e.id)}
                              className={`underline ${
                                e.status === 'paid' ? 'text-semantic-success' : 'text-semantic-warning'
                              }`}
                            >
                              Status: {e.status}
                            </button>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text-primary">
                            {formatCurrency(e.amount, currency)}
                          </span>
                          <button
                            onClick={() => deleteCalendarEvent(e.id)}
                            className="text-text-muted hover:text-semantic-error"
                          >
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions Recorded on this date */}
              <div className="pt-3 border-t border-white/5">
                <h5 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
                  <Icon name="Receipt" size={14} className="text-turquoise" />
                  Past Ledger Activity ({transactionsOnSelectedDate.length})
                </h5>

                {transactionsOnSelectedDate.length === 0 ? (
                  <p className="text-[11px] text-text-muted italic py-1">
                    No recorded transactions on this day.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {transactionsOnSelectedDate.map(t => (
                      <div
                        key={t.id}
                        className="p-2 rounded-lg bg-midnight text-[11px] flex justify-between items-center"
                      >
                        <span className="truncate max-w-[140px] text-text-secondary">
                          {t.description}
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            t.type === 'income' ? 'text-semantic-success' : 'text-text-primary'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-text-muted">
            Tip: All scheduled upcoming bills are automatically factored into your Available-to-Spend
            buffer.
          </div>
        </div>
      </div>

      {/* Add Scheduled Commitment Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151E38] border border-white/10 p-6 shadow-2xl relative text-text-primary">
            <h3 className="text-base font-bold mb-4">Schedule Future Commitment</h3>
            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Electric Bill, Rent Lease, Spotify"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  >
                    <option value="bill">Upcoming Bill</option>
                    <option value="subscription">Subscription</option>
                    <option value="income">Payday / Income</option>
                    <option value="milestone">Goal Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/10"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-3.5 py-2 text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-turquoise text-midnight font-bold"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
