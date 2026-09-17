import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Target, CheckSquare, ListChecks, Calendar, Timer, BarChart3,
  BookOpen, Trophy, Users, Settings, LogOut, ChevronLeft, ChevronRight, Zap, Shield, Award, PackagePlus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const mainNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/routines', label: 'Routines', icon: ListChecks },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/timer', label: 'Timer', icon: Timer },
  { path: '/stats', label: 'Statistics', icon: BarChart3 },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/templates', label: 'Templates', icon: PackagePlus },
];

const communityNav = [
  { path: '/programs', label: 'Programs', icon: Trophy },
  { path: '/leaderboard', label: 'Leaderboard', icon: Users },
  { path: '/achievements', label: 'Achievements', icon: Award },
];

const adminNav = [
  { path: '/admin', label: 'Admin Panel', icon: Shield },
  { path: '/admin/users', label: 'Manage Users', icon: Users },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, isMobile, sidebarOpen, toggleSidebar } = useUIStore();

  const levelProgress = user ? Math.min((user.xp % 100) / 100 * 100, 100) : 0;

  if (isMobile && !sidebarOpen) return null;

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: any }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 no-underline mb-0.5 ${
          sidebarCollapsed && !isMobile ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-neon/8 text-neon shadow-[inset_3px_0_0_var(--color-neon)] hover:bg-neon/12'
            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
        } ${sidebarCollapsed && !isMobile && isActive ? 'shadow-none' : ''}`
      }
      onClick={() => isMobile && toggleSidebar()}
      title={sidebarCollapsed ? label : undefined}
    >
      <Icon size={20} />
      {(!sidebarCollapsed || isMobile) && <span>{label}</span>}
    </NavLink>
  );

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" onClick={toggleSidebar} />
      )}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-bg-secondary border-r border-border flex flex-col z-[200] transition-[width] duration-300 overflow-x-hidden overflow-y-auto ${
          sidebarCollapsed && !isMobile ? 'w-[72px]' : 'w-[260px]'
        } ${isMobile ? 'w-[260px] animate-slide-in-left' : ''} max-md:hidden ${isMobile && sidebarOpen ? '!flex max-md:!flex' : ''}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-6 whitespace-nowrap">
          <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-neon/10 text-neon shrink-0">
            <Zap size={24} />
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <span className="text-lg font-bold text-text-primary tracking-tight">Productivity</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-4">
            {(!sidebarCollapsed || isMobile) && (
              <span className="block px-3 pt-2 pb-1 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Main</span>
            )}
            {mainNav.map((item) => <NavItem key={item.path} {...item} />)}
          </div>

          <div className="mb-4">
            {(!sidebarCollapsed || isMobile) && (
              <span className="block px-3 pt-2 pb-1 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Community</span>
            )}
            {communityNav.map((item) => <NavItem key={item.path} {...item} />)}
          </div>

          {user?.role === 'admin' && (
            <div className="mb-4">
              {(!sidebarCollapsed || isMobile) && (
                <span className="block px-3 pt-2 pb-1 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Admin</span>
              )}
              {adminNav.map((item) => <NavItem key={item.path} {...item} />)}
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border">
          <NavItem path="/settings" label="Settings" icon={Settings} />

          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-danger transition-all duration-200"
            onClick={logout}
          >
            <LogOut size={20} />
            {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
          </button>

          {/* User card */}
          {user && (
            <div className="flex items-center gap-2.5 p-3 mt-2 rounded-[10px] bg-bg-tertiary">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-neon-dark to-neon flex items-center justify-center font-bold text-sm text-black shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon text-black text-[9px] font-bold flex items-center justify-center border-2 border-bg-tertiary">
                  {user.level}
                </div>
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-text-primary truncate">{user.name}</span>
                  <div className="h-[3px] bg-bg-quaternary rounded-full mt-1 mb-0.5 overflow-hidden">
                    <div
                      className="h-full bg-neon rounded-full transition-[width] duration-500 shadow-[0_0_6px_rgba(57,255,20,0.4)]"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono">Level {user.level} • {user.xp} XP</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!isMobile && (
          <button
            className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-bg-tertiary border border-border text-text-secondary flex items-center justify-center transition-all duration-200 hover:bg-neon hover:text-black hover:border-neon z-10"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
