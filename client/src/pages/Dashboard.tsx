import React, { useEffect, useState } from 'react';
import { CheckCircle, Flame, TrendingUp, Zap, Clock, CalendarDays, Snowflake, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import HabitCard from '../components/habits/HabitCard';
import QuoteCard from '../components/accountability/QuoteCard';
import Navbar from '../components/common/Navbar';
import DateSlider from '../components/common/DateSlider';
import api from '../services/api';
import { isSameDay, startOfDay } from 'date-fns';
import type { Quote } from '../types';

interface TaskItem {
  _id: string;
  title: string;
  priority: string;
  dueDate?: string;
  isCompleted: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { habits, fetchHabits } = useHabitStore();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{ completed: number; total: number; xpEarned: number } | null>(null);

  useEffect(() => {
    fetchHabits(false, selectedDate.toISOString());

    api.get('/tasks').then(({ data }) => {
      if (data.success) {
        // Filter tasks that are due on or before the selected date, and not completed 
        // (or completed ON the selected date - though for simplicity we'll just show tasks due on this date)
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        
        const dateTasks = (data.data as TaskItem[])
          .filter((t) => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate).toISOString().split('T')[0];
            return taskDate === selectedDateStr && !t.isCompleted;
          })
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
          .slice(0, 5);
        setUpcomingTasks(dateTasks);
      }
    }).catch(() => {});
  }, [selectedDate]);

  useEffect(() => {
    api.get('/motivation/daily-quote').then(({ data }) => {
      if (data.success) setQuote(data.data);
    }).catch(() => {});

    // Fetch weekly stats
    api.get('/stats/weekly-summary').then(({ data }) => {
      if (data.success) setWeeklyStats(data.data);
    }).catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return `🏅 ${streak} days! You're in the LEGENDARY tier!`;
    if (streak >= 30) return `🌟 ${streak} days! Top 5% of all users — epic!`;
    if (streak >= 14) return `🔥 ${streak} days! You're in the top 10%!`;
    if (streak >= 7) return `⚡ ${streak}-day streak! Consistency is building.`;
    if (streak >= 3) return `🌱 ${streak} days going strong — keep it up!`;
    return streak > 0 ? `Nice — ${streak} day${streak > 1 ? 's' : ''} in!` : 'Start your streak today!';
  };

  const todayHabits = habits.filter((h) => !h.isArchived);
  const completedToday = todayHabits.filter((h) => h.todayCompleted).length;
  const completionPercent = todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const totalXP = user?.xp || 0;
  const freezes = (user as any)?.streakFreezes || 0;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const stats = [
    { icon: CheckCircle, value: `${completedToday}/${todayHabits.length}`, label: 'Completed Today', iconBg: 'bg-neon/10', iconColor: 'text-neon' },
    { icon: Flame, value: bestStreak, label: 'Best Streak', iconBg: 'bg-[#FF8C00]/10', iconColor: 'text-[#FF8C00]' },
    { icon: TrendingUp, value: `${completionPercent}%`, label: "Today's Progress", iconBg: 'bg-info/10', iconColor: 'text-info' },
    { icon: Zap, value: totalXP.toLocaleString(), label: 'Total XP', iconBg: 'bg-rarity-epic/10', iconColor: 'text-rarity-epic' },
  ];

  const getDueLabel = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'text-danger';
    if (p === 'medium') return 'text-warning';
    return 'text-text-tertiary';
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Greeting + Streak message */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold mb-1 max-md:text-xl">
            {getGreeting()}, <span className="text-neon">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {quote && (
              <p className="text-sm text-text-secondary italic max-w-[500px]">"{quote.text}" — {quote.author}</p>
            )}
          </div>
          {/* Streak message */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-text-primary font-medium">{getStreakMessage(bestStreak)}</span>
            {freezes > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 text-info text-xs font-semibold">
                <Snowflake size={12} /> {freezes} freeze{freezes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-6 max-sm:grid-cols-2">
          {stats.map(({ icon: Icon, value, label, iconBg, iconColor }, i) => (
            <div
              key={label}
              className="bg-bg-secondary border border-border rounded-2xl p-5 transition-all duration-200 hover:border-border-neon animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-2.5 ${iconBg} ${iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold font-mono text-neon">{value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Weekly summary bar */}
        {weeklyStats && (
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-neon/10 text-neon flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary">This Week</span>
                <p className="text-xs text-text-secondary">
                  {weeklyStats.completed}/{weeklyStats.total} completions • +{weeklyStats.xpEarned} XP
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-[200px] min-w-[100px]">
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon rounded-full transition-[width] duration-700"
                  style={{ width: `${weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Ring + Today's Habits + Upcoming */}
        <div className="grid grid-cols-[280px_1fr_240px] gap-6 mb-6 max-xl:grid-cols-[280px_1fr] max-lg:grid-cols-1">
          {/* Progress section */}
          <div className="flex flex-col items-center gap-5 animate-slide-up max-lg:flex-row max-lg:justify-around max-md:flex-col">
            {/* Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="-scale-x-100" width="150" height="150" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="var(--color-bg-tertiary)" strokeWidth="8" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="var(--color-neon)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - completionPercent / 100)}
                  style={{ transition: 'stroke-dashoffset 1s ease-out', filter: 'drop-shadow(0 0 6px rgba(57, 255, 20, 0.4))' }}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl font-bold font-mono text-neon">{completionPercent}%</span>
                <span className="text-xs text-text-secondary">Done</span>
              </div>
            </div>

            {/* Week strip */}
            <div className="flex gap-1.5 w-full">
              {weekDays.map((day, i) => {
                const isToday = i === 6;
                return (
                  <div key={i} className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-[8px] transition-all duration-200 ${isToday ? 'bg-neon/6 border border-border-neon' : ''}`}>
                    <span className="text-[9px] text-text-tertiary uppercase font-medium">{dayNames[day.getDay()]}</span>
                    <span className="text-xs font-semibold text-text-primary font-mono">{day.getDate()}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday && completionPercent === 100 ? 'bg-neon shadow-[0_0_6px_rgba(57,255,20,0.5)]' : 'bg-bg-quaternary'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Slider */}
          <DateSlider selectedDate={selectedDate} onChange={setSelectedDate} />

          {/* Today's Habits */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Target size={18} className="text-neon" /> {isSameDay(selectedDate, new Date()) ? "Today's" : "Selected Date"} Habits
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neon/10 text-neon border border-neon/20">
                  {completedToday}/{todayHabits.length}
                </span>
                {isSameDay(selectedDate, new Date()) && (
                  <button
                    onClick={() => navigate('/focus', { state: { title: 'Deep Work Session', type: 'Session', duration: 25 * 60 } })}
                    className="px-2 py-1 bg-neon/10 text-neon rounded text-[10px] uppercase font-bold hover:bg-neon/20 transition-colors flex items-center gap-1"
                  >
                    <Target size={12} /> Focus
                  </button>
                )}
              </div>
            </div>

            {todayHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3 opacity-50">🎯</span>
                <h3 className="text-text-primary font-semibold mb-1 text-sm">No habits yet</h3>
                <p className="text-text-secondary text-xs mb-3">Get started with a template pack</p>
                <button
                  className="text-xs text-neon hover:underline"
                  onClick={() => navigate('/templates')}
                >
                  Browse Templates →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {todayHabits.map((habit, i) => (
                  <div key={habit._id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <HabitCard habit={habit} date={selectedDate.toISOString()} compact />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="max-xl:hidden">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} className="text-warning" /> Upcoming
            </h2>
            {upcomingTasks.length === 0 ? (
              <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
                <span className="text-2xl block mb-2">✨</span>
                <span className="text-xs text-text-tertiary">No upcoming deadlines</span>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-bg-secondary border border-border rounded-[10px] p-3 hover:border-border-neon transition-colors cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <span className="block text-xs font-medium text-text-primary truncate">{task.title}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] text-text-tertiary">{getDueLabel(task.dueDate)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <QuoteCard />
      </div>
    </>
  );
};

export default Dashboard;
