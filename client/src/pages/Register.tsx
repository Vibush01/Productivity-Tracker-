import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User } from 'lucide-react';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (password !== confirmPassword) { setFormError('Passwords do not match'); return; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters'); return; }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch {}
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s += 25;
    if (password.length >= 10) s += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s += 25;
    if (/[0-9!@#$%^&*]/.test(password)) s += 25;
    return s;
  };

  const strength = getPasswordStrength();
  const strengthColor = strength <= 25 ? 'bg-danger' : strength <= 50 ? 'bg-warning' : strength <= 75 ? 'bg-info' : 'bg-neon';
  const strengthTextColor = strength <= 25 ? 'text-danger' : strength <= 50 ? 'text-warning' : strength <= 75 ? 'text-info' : 'text-neon';
  const strengthLabel = strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong';

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
          <h1 className="text-xl font-bold mb-1">Create account</h1>
          <p className="text-sm text-text-secondary mb-6">Start building better habits today</p>

          {(error || formError) && (
            <div className="bg-danger/8 border border-danger/20 text-danger px-3.5 py-2.5 rounded-[10px] text-sm mb-4 text-center animate-[shake_0.5s_ease-in-out]">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-left">
            <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={18} />} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18} />} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={18} />} required />

            {password && (
              <div className="flex items-center gap-2.5 -mt-2 mb-2">
                <div className="flex-1 h-1 bg-bg-quaternary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strength}%` }} />
                </div>
                <span className={`text-xs font-medium min-w-[44px] ${strengthTextColor}`}>{strengthLabel}</span>
              </div>
            )}

            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock size={18} />} required />
            <Button type="submit" variant="primary" fullWidth loading={isLoading} size="lg">Create Account</Button>
          </form>

          <p className="mt-5 text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="text-neon font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
