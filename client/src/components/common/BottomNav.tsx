import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Timer, BarChart3, MoreHorizontal, X, Calendar, BookOpen, Trophy, Users, Settings, User, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const mainItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/habits', icon: ListChecks, label: 'Habits' },
  { path: '/timer', icon: Timer, label: 'Timer' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
];

const moreItems = [
  { path: '/tasks', icon: ListChecks, label: 'Tasks' },
  { path: '/routines', icon: Timer, label: 'Routines' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/programs', icon: Trophy, label: 'Programs' },
  { path: '/leaderboard', icon: Users, label: 'Leaderboard' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [showMore, setShowMore] = useState(false);

  const allMoreItems = user?.role === 'admin'
    ? [...moreItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : moreItems;

  return (
    <>
      {/* More slide-up */}
      {showMore && (
        <div className="fixed inset-0 z-[90] md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute bottom-[72px] left-0 right-0 bg-bg-secondary border-t border-border rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary">More</h3>
              <button onClick={() => setShowMore(false)} className="text-text-tertiary"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {allMoreItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-200 ${
                      isActive ? 'bg-neon/10 text-neon' : 'text-text-secondary hover:bg-bg-tertiary'
                    }`}
                    onClick={(e) => { e.stopPropagation(); navigate(path); setShowMore(false); }}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] bg-bg-secondary/95 backdrop-blur-md border-t border-border md:hidden">
        <div className="flex items-center justify-around h-[68px] px-2 max-w-[500px] mx-auto">
          {mainItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
                  isActive ? 'text-neon' : 'text-text-tertiary'
                }`}
                onClick={() => navigate(path)}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-neon mt-[-2px]" />}
              </button>
            );
          })}
          <button
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              showMore ? 'text-neon' : 'text-text-tertiary'
            }`}
            onClick={() => setShowMore(!showMore)}
          >
            <MoreHorizontal size={22} strokeWidth={showMore ? 2.5 : 1.5} />
            <span className={`text-[10px] ${showMore ? 'font-bold' : 'font-medium'}`}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
