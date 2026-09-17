import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Flame, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HabitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: resp } = await api.get(`/habits/${id}/detail`);
        if (resp.success) setData(resp.data);
      } catch { navigate('/habits'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  if (isLoading || !data) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-[3px] border-bg-tertiary border-t-neon rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const { habit, stats, dayDistribution, monthlyTrend, recentLogs } = data;
  const maxDay = Math.max(...dayDistribution, 1);
  const maxMonth = Math.max(...monthlyTrend.map((m: any) => m.count), 1);

  // Build 90-day completion calendar
  const calendarDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = recentLogs.find((l: any) => l.date?.substring(0, 10) === dateStr);
    return { date: d, completed: log?.completed || false, dateStr };
  });

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Back + Header */}
        <button
          className="flex items-center gap-2 text-text-secondary hover:text-neon transition-colors text-sm mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${habit.color}15` }}
          >
            {habit.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{habit.title}</h2>
            {habit.description && <p className="text-sm text-text-secondary">{habit.description}</p>}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
          {[
            { icon: CheckCircle, label: 'Completions', value: stats.totalCompleted, color: 'text-neon' },
            { icon: TrendingUp, label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'text-info' },
            { icon: Flame, label: 'Current Streak', value: `${stats.currentStreak}d`, color: 'text-[#FF8C00]' },
            { icon: Flame, label: 'Best Streak', value: `${stats.longestStreak}d`, color: 'text-rarity-legendary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
              <Icon size={20} className={`mx-auto mb-2 ${color}`} />
              <span className="block text-lg font-bold font-mono text-text-primary">{value}</span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* 90-day calendar */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-neon" /> Last 90 Days
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-[3px]">
            {calendarDays.map(({ dateStr, completed, date }) => (
              <div
                key={dateStr}
                className="aspect-square rounded-[3px] transition-colors"
                style={{
                  background: completed ? habit.color : 'var(--color-bg-tertiary)',
                  opacity: completed ? 1 : 0.3,
                }}
                title={`${date.toLocaleDateString()} — ${completed ? '✅ Done' : '❌ Missed'}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2 text-[9px] text-text-tertiary">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-bg-tertiary opacity-30" />
            <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: habit.color, opacity: 0.5 }} />
            <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: habit.color }} />
            <span>More</span>
          </div>
        </div>

        {/* Day of week + Monthly trend */}
        <div className="grid grid-cols-2 gap-5 mb-6 max-sm:grid-cols-1">
          {/* Day distribution */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-info" /> Best Days
            </h3>
            <div className="space-y-2">
              {DAYS.map((day, i) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-7 font-mono">{day}</span>
                  <div className="flex-1 h-4 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${(dayDistribution[i] / maxDay) * 100}%`,
                        background: habit.color,
                        minWidth: dayDistribution[i] > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono w-5 text-right">{dayDistribution[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly trend */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-neon" /> Monthly Trend
            </h3>
            <div className="flex items-end gap-2 h-[120px]">
              {monthlyTrend.map((m: any) => {
                const height = maxMonth > 0 ? (m.count / maxMonth) * 100 : 0;
                const [, monthNum] = m.month.split('-');
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-tertiary font-mono">{m.count}</span>
                    <div className="w-full bg-bg-tertiary rounded-t-md overflow-hidden" style={{ height: '100%' }}>
                      <div
                        className="w-full rounded-t-md transition-[height] duration-500 mt-auto"
                        style={{ height: `${height}%`, background: habit.color, marginTop: `${100 - height}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-text-tertiary">{MONTHS_SHORT[parseInt(monthNum) - 1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HabitDetail;
