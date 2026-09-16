import React, { useEffect, useState } from 'react';
import { Clock, Timer as TimerIcon, Hourglass, Trash2 } from 'lucide-react';
import PomodoroTimer from '../components/timer/PomodoroTimer';
import Stopwatch from '../components/timer/Stopwatch';
import CountdownTimer from '../components/timer/CountdownTimer';
import Navbar from '../components/common/Navbar';
import { useTimerStore } from '../store/timerStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { formatDurationLabel, timeAgo } from '../utils/dateUtils';

type TimerTab = 'pomodoro' | 'stopwatch' | 'countdown';

const tabConfig: { key: TimerTab; label: string; icon: React.ReactNode }[] = [
  { key: 'pomodoro', label: 'Pomodoro', icon: <TimerIcon size={16} /> },
  { key: 'stopwatch', label: 'Stopwatch', icon: <Clock size={16} /> },
  { key: 'countdown', label: 'Countdown', icon: <Hourglass size={16} /> },
];

const Timer: React.FC = () => {
  const { sessions, stats, fetchSessions, fetchStats, deleteSession } = useTimerStore();
  const { habits, fetchHabits } = useHabitStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<TimerTab>('pomodoro');
  const [linkedHabitId, setLinkedHabitId] = useState('');

  useEffect(() => {
    fetchSessions();
    fetchStats('week');
    fetchHabits();
  }, []);

  const linkedHabit = habits.find((h) => h._id === linkedHabitId);

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Delete this session?')) {
      await deleteSession(id);
      showToast('info', 'Session deleted');
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Tab bar */}
        <div className="flex gap-1 mb-8 p-1 bg-bg-secondary rounded-2xl w-fit mx-auto">
          {tabConfig.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${activeTab === key ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Link to habit (Pomodoro only) */}
        {activeTab === 'pomodoro' && (
          <div className="mb-8 flex justify-center">
            <select
              className="py-2 px-3.5 bg-bg-secondary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200 max-w-[280px]"
              value={linkedHabitId}
              onChange={(e) => setLinkedHabitId(e.target.value)}
            >
              <option value="">Link to a habit (optional)</option>
              {habits.filter((h) => !h.isArchived).map((h) => (
                <option key={h._id} value={h._id}>{h.icon} {h.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active timer */}
        <div className="flex justify-center mb-10">
          {activeTab === 'pomodoro' && (
            <PomodoroTimer linkedHabitId={linkedHabitId || undefined} linkedHabitTitle={linkedHabit?.title} />
          )}
          {activeTab === 'stopwatch' && <Stopwatch />}
          {activeTab === 'countdown' && <CountdownTimer />}
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8 max-sm:grid-cols-1">
            <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
              <span className="text-2xl font-bold font-mono text-neon">{stats.overview.totalSessions}</span>
              <span className="block text-xs text-text-tertiary mt-1">Sessions (week)</span>
            </div>
            <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
              <span className="text-2xl font-bold font-mono text-neon">{formatDurationLabel(stats.overview.totalFocusTime)}</span>
              <span className="block text-xs text-text-tertiary mt-1">Focus Time</span>
            </div>
            <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
              <span className="text-2xl font-bold font-mono text-neon">{formatDurationLabel(Math.round(stats.overview.avgDuration))}</span>
              <span className="block text-xs text-text-tertiary mt-1">Avg Duration</span>
            </div>
          </div>
        )}

        {/* Session history */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-text-tertiary text-sm text-center py-8">No sessions yet. Start a timer above!</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 10).map((session, i) => {
                const typeColors: Record<string, string> = {
                  pomodoro: '#FF6B6B',
                  stopwatch: '#39FF14',
                  countdown: '#00D1FF',
                };
                const typeEmojis: Record<string, string> = {
                  pomodoro: '🍅',
                  stopwatch: '⏱️',
                  countdown: '⏰',
                };

                return (
                  <div
                    key={session._id}
                    className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border rounded-2xl hover:border-border-neon transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="text-lg">{typeEmojis[session.type]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary truncate block">
                        {session.label || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
                      </span>
                      <span className="text-xs text-text-tertiary">{timeAgo(session.startedAt)}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold" style={{ color: typeColors[session.type] }}>
                      {formatDurationLabel(session.actualDuration)}
                    </span>
                    <button
                      className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-danger transition-all duration-200"
                      onClick={() => handleDeleteSession(session._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Timer;
