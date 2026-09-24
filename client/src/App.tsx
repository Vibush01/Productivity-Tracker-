import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { useThemeStore } from './store/themeStore';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Routines from './pages/Routines';
import TimerPage from './pages/Timer';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import Journal from './pages/Journal';
import Programs from './pages/Programs';
import LeaderboardPage from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import TemplateManager from './pages/admin/TemplateManager';
import BroadcastNotifications from './pages/admin/BroadcastNotifications';
import { ContentManager, ProgramBuilder, ErrorLogs, FeedbackInbox, FeatureFlags } from './pages/admin/AdminPlaceholders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BottomNav from './components/common/BottomNav';
import HonestyCheckIn from './components/accountability/HonestyCheckIn';
import Achievements from './pages/Achievements';
import Templates from './pages/Templates';
import HabitDetail from './pages/HabitDetail';
import FocusMode from './pages/FocusMode';
import './styles/index.css';

// Layout Protected Route wrapper (with Sidebar)
const LayoutProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-bg-tertiary border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[260px] max-lg:ml-[72px] max-md:ml-0 min-w-0 transition-[margin] duration-300 p-8 pt-24 max-md:p-4 max-md:pt-20 pb-[100px]">
        <Outlet />
      </main>
      <BottomNav />
      <HonestyCheckIn />
    </div>
  );
};

// Standalone Protected Route wrapper (no Sidebar)
const StandaloneProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-bg-tertiary border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-bg-tertiary border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


const App: React.FC = () => {
  const { loadUser } = useAuthStore();
  const { setIsMobile } = useUIStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    loadUser();
    initTheme();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Toast />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Standalone protected routes */}
        <Route element={<StandaloneProtectedRoute />}>
          <Route path="/focus" element={<FocusMode />} />
        </Route>

        {/* Layout protected routes */}
        <Route element={<LayoutProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/templates" element={<TemplateManager />} />
          <Route path="/admin/broadcast" element={<BroadcastNotifications />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/admin/programs" element={<ProgramBuilder />} />
          <Route path="/admin/logs" element={<ErrorLogs />} />
          <Route path="/admin/feedback" element={<FeedbackInbox />} />
          <Route path="/admin/features" element={<FeatureFlags />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
