import React, { useEffect } from 'react';
import { Calendar, Target, Flame, Clock, BookOpen, Zap, Award } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import XPBar from '../components/gamification/XPBar';
import { useAuthStore } from '../store/authStore';
import { useStatsStore } from '../store/statsStore';
import { formatDurationLabel, formatDisplayDate } from '../utils/dateUtils';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { overview, heatmap, fetchOverview, fetchHeatmap } = useStatsStore();

  useEffect(() => {
    fetchOverview();
    fetchHeatmap();
  }, []);

  if (!user) return null;

  // Heatmap rendering (compact version)
  const renderMiniHeatmap = () => {
    if (heatmap.length === 0) return <p className="text-text-tertiary text-xs text-center py-4">No activity data yet</p>;

    const rateMap: Record<string, number> = {};
    heatmap.forEach((entry) => { rateMap[entry.date] = entry.rate; });

    const today = new Date();
    const days: { date: string; rate: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().split('T')[0], rate: rateMap[d.toISOString().split('T')[0]] || 0 });
    }

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
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[2px] min-w-[600px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ background: getColor(day.rate) }}
                  title={`${day.date}: ${day.rate}%`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Profile card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5 mb-5 max-sm:flex-col max-sm:text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-neon/10 border-[3px] border-neon flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-neon">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary max-sm:justify-center">
                <span className="flex items-center gap-1"><Calendar size={12} /> Joined {formatDisplayDate(user.createdAt || new Date().toISOString())}</span>
                <span className="flex items-center gap-1"><Award size={12} /> {user.role}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <XPBar xp={user.xp} level={user.level} />
        </div>

        {/* Stats grid */}
        {overview && (
          <div className="grid grid-cols-3 gap-3 mb-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[
              { label: 'Habits Tracked', value: overview.totalHabits, icon: <Target size={16} />, color: '#39FF14' },
              { label: 'Total Completions', value: overview.totalCompletions, icon: <Zap size={16} />, color: '#00D1FF' },
              { label: 'Best Streak', value: `${overview.bestStreak} days`, icon: <Flame size={16} />, color: '#FFB800' },
              { label: 'Completion Rate', value: `${overview.completionRate}%`, icon: <Target size={16} />, color: '#A855F7' },
              { label: 'Focus Time', value: formatDurationLabel(overview.totalFocusSeconds), icon: <Clock size={16} />, color: '#FF6B6B' },
              { label: 'Total XP', value: `${user.xp} XP`, icon: <Zap size={16} />, color: '#39FF14' },
            ].map(({ label, value, icon, color }, i) => (
              <div
                key={label}
                className="bg-bg-secondary border border-border rounded-2xl p-4 hover:border-border-neon transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color }}>{icon}</span>
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{label}</span>
                </div>
                <span className="text-xl font-bold font-mono text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Activity heatmap */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen size={14} /> Activity Heatmap
          </h3>
          {renderMiniHeatmap()}
        </div>

        {/* Level milestones */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award size={14} /> Level Progress
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
              const isReached = user.level >= lvl;
              const isCurrent = user.level === lvl;
              return (
                <div
                  key={lvl}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCurrent
                      ? 'bg-neon/20 border-2 border-neon text-neon neon-glow scale-110'
                      : isReached
                        ? 'bg-neon/10 border border-neon/50 text-neon'
                        : 'bg-bg-tertiary border border-border text-text-tertiary'
                  }`}
                >
                  {lvl}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
