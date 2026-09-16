import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock } from 'lucide-react';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
        }} />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-neon opacity-15 -top-[100px] -right-[100px] blur-[80px] animate-float" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-info opacity-15 -bottom-[50px] -left-[100px] blur-[80px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-[1] w-full max-w-[440px] px-5 animate-scale-in">
        <div className="glass p-8 text-center max-sm:p-6">
          <div className="w-14 h-14 rounded-2xl bg-neon/10 text-neon flex items-center justify-center mx-auto mb-5 neon-glow">
            <Zap size={32} />
          </div>
          <h1 className="text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-6">Log in to continue your streak</p>

          {error && (
            <div className="bg-danger/8 border border-danger/20 text-danger px-3.5 py-2.5 rounded-[10px] text-sm mb-4 text-center animate-[shake_0.5s_ease-in-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-left">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18} />} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={18} />} required />
            <Button type="submit" variant="primary" fullWidth loading={isLoading} size="lg">Log In</Button>
          </form>

          <p className="mt-5 text-sm text-text-secondary">
            Don't have an account? <Link to="/register" className="text-neon font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
