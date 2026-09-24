import React, { useRef, useEffect } from 'react';
import { format, subDays, isSameDay } from 'date-fns';

interface DateSliderProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const DateSlider: React.FC<DateSliderProps> = ({ selectedDate, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 14 days (7 past, today, 6 future)
  const today = new Date();
  const dates = Array.from({ length: 14 }).map((_, i) => subDays(today, 7 - i));

  // Auto-scroll to selected date on mount
  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="relative w-full overflow-hidden mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isSameDay(date, today);
          
          return (
            <button
              key={date.toISOString()}
              data-selected={isSelected}
              onClick={() => onChange(date)}
              className={`snap-center shrink-0 flex flex-col items-center justify-center w-[60px] h-[72px] rounded-[16px] transition-all duration-300 relative border ${
                isSelected 
                  ? 'bg-neon/15 border-neon shadow-[0_0_20px_rgba(57,255,20,0.15)] scale-105' 
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary hover:border-border-neon'
              }`}
            >
              <span className={`text-[11px] uppercase font-bold tracking-wider mb-1 transition-colors ${
                isSelected ? 'text-neon' : isCurrentDay ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {format(date, 'EEE')}
              </span>
              <span className={`text-xl font-black transition-colors ${
                isSelected ? 'text-text-primary' : isCurrentDay ? 'text-neon' : 'text-text-primary'
              }`}>
                {format(date, 'd')}
              </span>
              {isCurrentDay && !isSelected && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-neon shadow-[0_0_5px_var(--color-neon)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSlider;
