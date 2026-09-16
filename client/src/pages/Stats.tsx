import React, { useEffect } from 'react';
import { BarChart3, Target, Flame, Clock, Zap, TrendingUp } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useStatsStore } from '../store/statsStore';
import { formatDurationLabel } from '../utils/dateUtils';


const Stats: React.FC = () => {
  const { overview, weekly, heatmap, categories, fetchOverview, fetchWeekly, fetchHeatmap, fetchCategories } = useStatsStore();

  useEffect(() => {
    fetchOverview();
    fetchWeekly();
    fetchHeatmap();
    fetchCategories();
  }, []);

  // Heatmap rendering
  const renderHeatmap = () => {
    if (heatmap.length === 0) return <p className="text-text-tertiary text-sm text-center py-8">No data yet. Start tracking habits!</p>;

    // Build a date→rate map
    const rateMap: Record<string, number> = {};
    heatmap.forEach((entry) => { rateMap[entry.date] = entry.rate; });

    // Generate last 365 days
    const today = new Date();
    const days: { date: string; rate: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: key, rate: rateMap[key] || 0 });
    }

    // Group into weeks (columns)
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];
    days.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    const getColor = (rate: number) => {
      if (rate === 0) return 'var(--color-bg-tertiary)';
      if (rate < 25) return 'rgba(57, 255, 20, 0.15)';
      if (rate < 50) return 'rgba(57, 255, 20, 0.3)';
      if (rate < 75) return 'rgba(57, 255, 20, 0.5)';
      return 'rgba(57, 255, 20, 0.8)';
    };

    return (
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-[700px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="w-[13px] h-[13px] rounded-sm transition-colors duration-200 hover:ring-1 hover:ring-neon cursor-pointer"
                  style={{ background: getColor(day.rate) }}
                  title={`${day.date}: ${day.rate}%`}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end text-xs text-text-tertiary">
          <span>Less</span>
          {[0, 15, 30, 50, 80].map((rate) => (
            <div key={rate} className="w-[13px] h-[13px] rounded-sm" style={{ background: getColor(rate) }} />
          ))}
          <span>More</span>
        </div>
      </div>
    );
  };

  // Weekly bar chart
  const renderWeeklyChart = () => {
    if (weekly.length === 0) return null;
    const maxRate = Math.max(...weekly.map((d) => d.rate), 1);

    return (
      <div className="flex items-end gap-2 h-[180px]">
        {weekly.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="text-xs font-mono text-neon font-bold">{day.rate}%</span>
            <div
              className="w-full rounded-t-[10px] transition-all duration-500 ease-out min-h-[4px]"
              style={{
                height: `${Math.max((day.rate / maxRate) * 140, 4)}px`,
                background: day.rate === 100 ? '#39FF14' : day.rate > 0 ? 'rgba(57, 255, 20, 0.5)' : 'var(--color-bg-tertiary)',
                boxShadow: day.rate === 100 ? '0 0 15px rgba(57,255,20,0.3)' : 'none',
              }}
            />
            <span className="text-[11px] text-text-tertiary">{day.dayName}</span>
          </div>
        ))}
      </div>
    );
  };

  // Category donut chart (simple CSS-based)
  const renderCategoryChart = () => {
    if (categories.length === 0) return <p className="text-text-tertiary text-sm text-center py-4">No categories yet</p>;

    const total = categories.reduce((sum, c) => sum + c.completed, 0);
    let accumulatedPercent = 0;
    const segments = categories.map((cat) => {
      const percent = total > 0 ? (cat.completed / total) * 100 : 0;
      const start = accumulatedPercent;
      accumulatedPercent += percent;
      return { ...cat, percent, start };
    });

    // Build conic-gradient
    const gradientParts = segments.map((s) => `${s.color} ${s.start}% ${s.start + s.percent}%`).join(', ');

    return (
      <div className="flex items-center gap-6 max-sm:flex-col">
        <div
          className="w-[140px] h-[140px] rounded-full shrink-0 relative"
          style={{
            background: total > 0 ? `conic-gradient(${gradientParts})` : 'var(--color-bg-tertiary)',
          }}
        >
          <div className="absolute inset-[20px] bg-bg-secondary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold font-mono text-text-primary">{total}</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {segments.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cat.color }} />
              <span className="text-sm text-text-secondary flex-1 truncate">{cat.icon} {cat.name}</span>
              <span className="text-xs font-mono text-text-tertiary">{cat.completed}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Overview cards */}
        {overview ? (
          <div className="grid grid-cols-4 gap-3 mb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[
              { label: 'Total Habits', value: overview.totalHabits, icon: <Target size={18} />, color: '#39FF14' },
              { label: 'Completion Rate', value: `${overview.completionRate}%`, icon: <TrendingUp size={18} />, color: '#00D1FF' },
              { label: 'Best Streak', value: `${overview.bestStreak} days`, icon: <Flame size={18} />, color: '#FFB800' },
              { label: 'Focus Time', value: formatDurationLabel(overview.totalFocusSeconds), icon: <Clock size={18} />, color: '#A855F7' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-border-neon transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color }}>{icon}</span>
                  <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">{label}</span>
                </div>
                <span className="text-2xl font-bold font-mono text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        )}

        {/* XP & Level */}
        {overview && (
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center">
              <span className="text-lg font-bold text-neon">{overview.level}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-neon" />
                <span className="text-sm font-semibold text-text-primary">Level {overview.level}</span>
                <span className="text-xs text-text-tertiary font-mono">{overview.xp} XP total</span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-neon rounded-full neon-glow transition-[width] duration-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* 365-Day Heatmap */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> 365-Day Activity
          </h3>
          {renderHeatmap()}
        </div>

        {/* Weekly performance */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">This Week</h3>
          {renderWeeklyChart()}
        </div>

        {/* Category breakdown */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Category Breakdown</h3>
          {renderCategoryChart()}
        </div>

        {/* Additional stats */}
        {overview && (
          <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <div className="bg-bg-secondary border border-border rounded-2xl p-5 text-center">
              <span className="text-3xl font-bold font-mono text-neon">{overview.totalCompletions}</span>
              <span className="block text-xs text-text-tertiary mt-1">Total Completions</span>
            </div>
            <div className="bg-bg-secondary border border-border rounded-2xl p-5 text-center">
              <span className="text-3xl font-bold font-mono text-info">{overview.totalTasks}</span>
              <span className="block text-xs text-text-tertiary mt-1">Total Tasks</span>
            </div>
            <div className="bg-bg-secondary border border-border rounded-2xl p-5 text-center">
              <span className="text-3xl font-bold font-mono text-warning">{overview.totalSessions}</span>
              <span className="block text-xs text-text-tertiary mt-1">Timer Sessions</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Stats;
