import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, BarChart3, Trophy, Timer, Shield, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

const features = [
  { icon: Target, title: 'Habit Tracking', desc: 'Build and track daily, weekly, or custom habits with streaks and accountability.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visualize progress with heatmaps, charts, and detailed streak statistics.' },
  { icon: Timer, title: 'Focus Timer', desc: 'Built-in Pomodoro, stopwatch, and countdown timers for deep focus sessions.' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, level up, and unlock achievements as you build consistency.' },
  { icon: Shield, title: 'Accountability', desc: 'Honesty-first system with motivational prompts that keep you genuine.' },
  { icon: Zap, title: 'Community Programs', desc: 'Join challenges, compete on leaderboards, and grow with others.' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
        }} />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-neon opacity-15 -top-[100px] -right-[100px] blur-[80px] animate-float" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-info opacity-15 -bottom-[50px] -left-[100px] blur-[80px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-rarity-epic opacity-15 top-1/2 left-1/2 blur-[80px] animate-[float_12s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <header className="relative z-[1] flex items-center justify-between px-10 py-5 max-md:px-5">
        <div className="flex items-center gap-2.5 text-neon text-lg font-bold">
          <Zap size={28} />
          <span>Productivity Tracker</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-[1]">
        <section className="text-center py-20 px-5 max-w-[800px] mx-auto max-md:py-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neon/8 border border-neon/20 text-neon text-sm font-medium mb-6 animate-slide-down">
            <Zap size={14} /> Built for the disciplined
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.1] tracking-tighter mb-5 animate-slide-up">
            Track Your Habits.<br />
            <span className="text-neon neon-text-glow">Build Your Future.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-[580px] mx-auto mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            The productivity tracker that keeps you honest, motivated, and growing.
            Build streaks, join challenges, and become the person you want to be.
          </p>
          <div className="flex gap-3 justify-center flex-wrap animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/register">
              <Button variant="primary" size="lg">Start Tracking <ArrowRight size={18} /></Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">I have an account</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 justify-center mt-16 pt-10 border-t border-border animate-fade-in max-md:gap-6" style={{ animationDelay: '400ms' }}>
            {[
              { value: '∞', label: 'Habits to Build' },
              { value: '24/7', label: 'Streak Tracking' },
              { value: '100%', label: 'Honest Progress' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <span className="block text-2xl font-bold font-mono text-neon neon-text-glow max-md:text-xl">{value}</span>
                <span className="text-sm text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-10 max-w-[1200px] mx-auto max-md:py-10 max-md:px-5">
          <h2 className="text-center text-2xl font-bold mb-12">
            Everything you need to <span className="text-neon">level up</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 max-md:grid-cols-1">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="bg-bg-secondary border border-border rounded-2xl p-8 transition-all duration-200 hover:border-border-neon hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:-translate-y-0.5 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-[10px] bg-neon/8 text-neon flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-semibold mb-2 text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 px-10 max-w-[800px] mx-auto mb-10 max-md:px-5">
          <div className="glass text-center p-16 max-md:p-8">
            <h2 className="text-2xl font-bold mb-3">Ready to build better habits?</h2>
            <p className="text-lg text-text-secondary mb-6">Join now and start your streak. Your future self will thank you.</p>
            <Link to="/register">
              <Button variant="primary" size="lg">Get Started — It's Free <ArrowRight size={18} /></Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-[1] text-center py-6 border-t border-border">
        <p className="text-sm text-text-tertiary">© {new Date().getFullYear()} Productivity Tracker. Built with discipline.</p>
      </footer>
    </div>
  );
};

export default Landing;
