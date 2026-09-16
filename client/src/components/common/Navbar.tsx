import React from 'react';
import { Menu, Plus, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/habits': 'Habits',
  '/tasks': 'Tasks',
  '/routines': 'Routines',
  '/calendar': 'Calendar',
  '/timer': 'Timer',
  '/stats': 'Statistics',
  '/journal': 'Journal',
  '/programs': 'Programs',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
};

interface NavbarProps {
  onQuickAdd?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onQuickAdd }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { isMobile, toggleSidebar } = useUIStore();

  const title = pageTitles[location.pathname] || 'Productivity Tracker';

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-bg-primary/85 backdrop-blur-2xl border-b border-border flex items-center justify-between px-6 z-[199] transition-[left] duration-300 max-lg:left-[72px] max-md:left-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            className="flex items-center justify-center w-10 h-10 rounded-[10px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {onQuickAdd && (
          <button
            className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-neon/10 text-neon hover:bg-neon/20 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-200"
            onClick={onQuickAdd}
            title="Quick Add"
          >
            <Plus size={20} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-bg-tertiary border-2 border-border flex items-center justify-center text-text-secondary overflow-hidden cursor-pointer hover:border-neon transition-colors duration-200">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <User size={18} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
