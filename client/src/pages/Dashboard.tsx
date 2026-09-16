import React, { useEffect, useState } from 'react';
import { CheckCircle, Flame, TrendingUp, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import HabitCard from '../components/habits/HabitCard';
import QuoteCard from '../components/accountability/QuoteCard';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import type { Quote } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { habits, fetchHabits } = useHabitStore();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchHabits();
    api.get('/motivation/daily-quote').then(({ data }) => {
      if (data.success) setQuote(data.data);
    }).catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const todayHabits = habits.filter((h) => !h.isArchived);
  const completedToday = todayHabits.filter((h) => h.todayCompleted).length;
  const completionPercent = todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const totalXP = user?.xp || 0;

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
    { icon: Zap, value: totalXP, label: 'Total XP', iconBg: 'bg-rarity-epic/10', iconColor: 'text-rarity-epic' },
  ];

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Greeting */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl font-bold mb-1 max-md:text-xl">
            {getGreeting()}, <span className="text-neon">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          {quote && (
            <p className="text-sm text-text-secondary italic max-w-[600px]">"{quote.text}" — {quote.author}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-8 max-sm:grid-cols-1 max-md:grid-cols-2">
          {stats.map(({ icon: Icon, value, label, iconBg, iconColor }, i) => (
            <div
              key={label}
              className="bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-200 hover:border-border-neon hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
                <Icon size={22} />
              </div>
              <div className="text-2xl font-bold font-mono text-neon neon-text-glow">{value}</div>
              <div className="text-sm text-text-secondary mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress Ring + Today's Habits */}
        <div className="grid grid-cols-[300px_1fr] gap-8 mb-8 max-lg:grid-cols-1">
          {/* Progress section */}
          <div className="flex flex-col items-center gap-6 animate-slide-up max-lg:flex-row max-lg:justify-around max-md:flex-col">
            {/* Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="-scale-x-100" width="160" height="160" viewBox="0 0 160 160">
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
                <span className="block text-2xl font-bold font-mono text-neon neon-text-glow">{completionPercent}%</span>
                <span className="text-sm text-text-secondary">Done</span>
              </div>
            </div>

            {/* Week strip */}
            <div className="flex gap-2 w-full">
              {weekDays.map((day, i) => {
                const isToday = i === 6;
                return (
                  <div key={i} className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-[10px] transition-all duration-200 ${isToday ? 'bg-neon/6 border border-border-neon' : ''}`}>
                    <span className="text-[10px] text-text-tertiary uppercase font-medium">{dayNames[day.getDay()]}</span>
                    <span className="text-sm font-semibold text-text-primary font-mono">{day.getDate()}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday && completionPercent === 100 ? 'bg-neon shadow-[0_0_6px_rgba(57,255,20,0.5)]' : 'bg-bg-quaternary'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Habits */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today's Habits</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neon/10 text-neon border border-neon/20">
                {completedToday} of {todayHabits.length}
              </span>
            </div>

            {todayHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl mb-4 opacity-50">🎯</span>
                <h3 className="text-text-primary font-semibold mb-2">No habits yet</h3>
                <p className="text-text-secondary text-sm max-w-[400px]">Create your first habit to get started</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayHabits.slice(0, 6).map((habit, i) => (
                  <div key={habit._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <HabitCard habit={habit} compact />
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
