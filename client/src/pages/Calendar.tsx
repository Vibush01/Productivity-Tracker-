import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useStatsStore } from '../store/statsStore';
import { getCalendarGrid, getMonthName, isSameDay } from '../utils/dateUtils';
import { DAY_LABELS_SHORT, PRIORITY_CONFIG } from '../utils/constants';
import type { CalendarDayData } from '../types';

const Calendar: React.FC = () => {
  const { calendarData, fetchCalendarData, isLoading } = useStatsStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => { fetchCalendarData(year, month); }, [year, month]);

  const grid = getCalendarGrid(year, month);
  const today = new Date();

  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goToNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  };

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];
  const getDayData = (date: Date): CalendarDayData | null => calendarData[getDateKey(date)] || null;

  const selectedDayData = selectedDate ? calendarData[selectedDate] : null;

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[900px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-[10px] bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200" onClick={goToPrev}>
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold min-w-[160px] text-center">
              {getMonthName(month, false)} {year}
            </h2>
            <button className="w-9 h-9 rounded-[10px] bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200" onClick={goToNext}>
              <ChevronRight size={18} />
            </button>
          </div>
          <button className="px-4 py-1.5 rounded-full bg-bg-secondary border border-border text-sm text-text-secondary hover:text-neon hover:border-neon transition-all duration-200" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="flex gap-4 max-md:flex-col">
          {/* Calendar grid */}
          <div className="flex-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAY_LABELS_SHORT.map((label, i) => (
                <div key={i} className="text-center text-xs font-medium text-text-tertiary py-1.5">{label}</div>
              ))}
            </div>

            {/* Day cells */}
            {isLoading ? (
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: 42 }).map((_, i) => <div key={i} className="skeleton h-16 md:h-20 lg:h-24 rounded-[10px]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5">
                {grid.map((date, i) => {
                  const isCurrentMonth = date.getMonth() === month;
                  const isToday = isSameDay(date, today);
                  const dateKey = getDateKey(date);
                  const dayData = getDayData(date);
                  const isSelected = selectedDate === dateKey;
                  const completionRate = dayData && dayData.totalHabits > 0
                    ? Math.round((dayData.completedHabits / dayData.totalHabits) * 100)
                    : 0;

                  // Color intensity based on completion
                  let bgStyle = '';
                  if (isCurrentMonth && dayData) {
                    if (completionRate === 100) bgStyle = 'bg-neon/15';
                    else if (completionRate >= 50) bgStyle = 'bg-neon/8';
                    else if (completionRate > 0) bgStyle = 'bg-neon/4';
                  }

                  return (
                    <button
                      key={i}
                      className={`h-16 md:h-20 lg:h-24 rounded-[10px] flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${
                        isCurrentMonth ? 'text-text-primary hover:bg-bg-tertiary' : 'text-text-tertiary/30'
                      } ${isToday ? 'border border-neon' : ''} ${isSelected ? 'border-2 border-neon bg-neon/10' : ''} ${bgStyle}`}
                      onClick={() => isCurrentMonth && setSelectedDate(isSelected ? null : dateKey)}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-neon font-bold' : ''}`}>
                        {date.getDate()}
                      </span>

                      {/* Dots indicator */}
                      {isCurrentMonth && dayData && (dayData.habits.length > 0 || dayData.tasks.length > 0) && (
                        <div className="flex gap-[2px]">
                          {dayData.completedHabits > 0 && <span className="w-1 h-1 rounded-full bg-neon" />}
                          {dayData.habits.length > dayData.completedHabits && <span className="w-1 h-1 rounded-full bg-danger" />}
                          {dayData.tasks.length > 0 && <span className="w-1 h-1 rounded-full bg-info" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 justify-center text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> Missed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> Tasks</span>
            </div>
          </div>

          {/* Day detail panel */}
          {selectedDate && (
            <div className="w-[300px] max-md:w-full bg-bg-secondary border border-border rounded-2xl p-5 animate-slide-up shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200" onClick={() => setSelectedDate(null)}>
                  <X size={16} />
                </button>
              </div>

              {!selectedDayData ? (
                <p className="text-text-tertiary text-sm text-center py-4">No data for this day</p>
              ) : (
                <div className="space-y-4">
                  {/* Completion summary */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon rounded-full transition-[width] duration-500"
                        style={{ width: `${selectedDayData.totalHabits > 0 ? (selectedDayData.completedHabits / selectedDayData.totalHabits) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-secondary">
                      {selectedDayData.completedHabits}/{selectedDayData.totalHabits}
                    </span>
                  </div>

                  {/* Habits */}
                  {selectedDayData.habits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Habits</h4>
                      <div className="space-y-1.5">
                        {selectedDayData.habits.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5">
                            <span className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center text-[10px] ${h.completed ? 'border-neon bg-neon/20 text-neon' : 'border-border text-text-tertiary'}`}>
                              {h.completed ? '✓' : ''}
                            </span>
                            <span className="text-sm">{h.icon}</span>
                            <span className={`text-sm flex-1 truncate ${h.completed ? 'text-text-primary' : 'text-text-secondary line-through'}`}>{h.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedDayData.tasks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Tasks</h4>
                      <div className="space-y-1.5">
                        {selectedDayData.tasks.map((t) => {
                          const priority = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
                          return (
                            <div key={t._id} className="flex items-center gap-2 py-1.5">
                              <span className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center text-[10px] ${t.completed ? 'border-neon bg-neon/20 text-neon' : 'border-border'}`}>
                                {t.completed ? '✓' : ''}
                              </span>
                              <span className={`text-sm flex-1 truncate ${t.completed ? 'line-through text-text-tertiary' : ''}`}>{t.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase" style={{ background: `${priority?.color}15`, color: priority?.color }}>
                                {priority?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Calendar;
