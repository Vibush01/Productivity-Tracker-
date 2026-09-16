import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import './styles/index.css';

// Protected Route wrapper
const ProtectedRoute: React.FC = () => {
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
      <main className="flex-1 ml-[260px] max-lg:ml-[72px] max-md:ml-0 min-w-0 transition-[margin] duration-300 pt-16 p-8 max-md:p-4 pb-[100px]">
        <Outlet />
      </main>
    </div>
  );
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

// Placeholder for pages not yet built
const ComingSoon: React.FC<{ page: string }> = ({ page }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <span className="text-5xl">🚧</span>
    <h2 className="text-2xl font-bold">{page}</h2>
    <p className="text-text-secondary">Coming in the next phase</p>
  </div>
);

const App: React.FC = () => {
  const { loadUser } = useAuthStore();
  const { setIsMobile } = useUIStore();

  useEffect(() => {
    loadUser();

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

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/tasks" element={<ComingSoon page="Tasks" />} />
          <Route path="/routines" element={<ComingSoon page="Routines" />} />
          <Route path="/calendar" element={<ComingSoon page="Calendar" />} />
          <Route path="/timer" element={<ComingSoon page="Timer" />} />
          <Route path="/stats" element={<ComingSoon page="Statistics" />} />
          <Route path="/journal" element={<ComingSoon page="Journal" />} />
          <Route path="/programs" element={<ComingSoon page="Programs" />} />
          <Route path="/leaderboard" element={<ComingSoon page="Leaderboard" />} />
          <Route path="/profile" element={<ComingSoon page="Profile" />} />
          <Route path="/settings" element={<ComingSoon page="Settings" />} />
          <Route path="/admin" element={<ComingSoon page="Admin Panel" />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
