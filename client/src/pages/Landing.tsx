import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, BarChart3, Trophy, Timer, Shield, ArrowRight, Check, X, Smartphone, Globe, Lock } from 'lucide-react';
import Button from '../components/common/Button';

const features = [
  { icon: Target, title: 'Habit Tracking', desc: 'Build and track daily, weekly, or custom habits with streaks and accountability.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visualize progress with heatmaps, charts, and detailed streak statistics.' },
  { icon: Timer, title: 'Focus Timer', desc: 'Built-in Pomodoro, stopwatch, and countdown timers for deep focus sessions.' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, level up, and unlock achievements as you build consistency.' },
  { icon: Shield, title: 'Accountability', desc: 'Honesty-first system with motivational prompts that keep you genuine.' },
  { icon: Zap, title: 'Community Programs', desc: 'Join challenges, compete on leaderboards, and grow with others.' },
];

import { useThemeStore } from '../store/themeStore';

const Landing: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  
  return (
    <div className="min-h-screen relative bg-bg-primary text-text-primary selection:bg-neon/30">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
        }} />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-neon opacity-10 -top-[100px] -right-[100px] blur-[80px] animate-float" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-info opacity-10 -bottom-[50px] -left-[100px] blur-[80px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-rarity-epic opacity-10 top-1/2 left-1/2 blur-[80px] animate-[float_12s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 max-md:px-5 bg-bg-primary/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2.5 text-neon text-lg font-bold">
          <Zap size={28} />
          <span className="hidden sm:inline">Productivity Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-text-secondary hover:bg-bg-tertiary transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        {/* Hero Section */}
        <section className="text-center pt-24 pb-16 px-5 max-w-[900px] mx-auto max-md:pt-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neon/8 border border-neon/20 text-neon text-sm font-medium mb-6 animate-slide-down shadow-[0_0_15px_rgba(57,255,20,0.15)]">
            <Zap size={14} /> Built for the disciplined
          </div>
          <h1 className="text-[clamp(3rem,8vw,5rem)] font-bold leading-[1.05] tracking-tighter mb-6 animate-slide-up">
            Track Your Habits.<br />
            <span className="text-neon neon-text-glow drop-shadow-md">Build Your Future.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-[650px] mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            The ultimate productivity suite that keeps you honest, motivated, and growing.
            Stop switching between apps—manage your habits, tasks, and timers in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/register">
              <Button variant="primary" size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.5)]">
                Start Tracking For Free <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats Highlight */}
          <div className="flex gap-12 justify-center mt-20 pt-12 border-t border-border animate-fade-in max-md:gap-6 flex-wrap" style={{ animationDelay: '400ms' }}>
            {[
              { value: '∞', label: 'Habits to Build' },
              { value: '24/7', label: 'Streak Tracking' },
              { value: '100%', label: 'Honest Progress' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center px-4 transition-transform duration-300 hover:scale-110">
                <span className="block text-4xl font-bold font-mono text-neon neon-text-glow max-md:text-3xl mb-2">{value}</span>
                <span className="text-sm font-bold text-text-secondary mt-1 block uppercase tracking-[0.2em]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Capabilities Showcase */}
        <section className="py-24 px-10 max-w-[1200px] mx-auto max-md:py-16 max-md:px-5 border-t border-border/50">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to <span className="text-neon">level up</span>
            </h2>
            <p className="text-text-secondary text-lg">
              We replaced your habit tracker, to-do list, pomodoro timer, and journal with one seamless experience.
            </p>
          </div>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 max-md:grid-cols-1">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-bg-secondary/40 backdrop-blur-md border border-border rounded-3xl p-8 transition-all duration-300 hover:border-border-neon hover:shadow-[0_0_40px_rgba(57,255,20,0.15)] hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-neon/10 text-neon flex items-center justify-center mb-6 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-neon/20">
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-text-primary transition-colors duration-300 group-hover:text-neon">{title}</h3>
                <p className="text-text-secondary leading-relaxed text-base">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The Edge / Comparison Section */}
        <section className="py-24 px-10 max-w-[1000px] mx-auto max-md:py-16 max-md:px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose us over the rest?</h2>
            <p className="text-text-secondary text-lg">We respect your data, your wallet, and your discipline.</p>
          </div>

          <div className="grid grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border max-md:grid-cols-1">
            <div className="bg-bg-tertiary p-10 flex flex-col items-center text-center opacity-70">
              <X size={48} className="text-danger mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-6 text-text-secondary">Other Apps</h3>
              <ul className="space-y-4 text-left w-full text-text-secondary text-sm">
                <li className="flex items-start gap-3"><X size={18} className="text-danger shrink-0 mt-0.5" /> Expensive $10/month subscriptions</li>
                <li className="flex items-start gap-3"><X size={18} className="text-danger shrink-0 mt-0.5" /> Cluttered with ads and popups</li>
                <li className="flex items-start gap-3"><X size={18} className="text-danger shrink-0 mt-0.5" /> Only tracks habits (no timer/tasks)</li>
                <li className="flex items-start gap-3"><X size={18} className="text-danger shrink-0 mt-0.5" /> Sells your habit data to advertisers</li>
              </ul>
            </div>
            
            <div className="bg-bg-secondary p-10 flex flex-col items-center text-center relative overflow-hidden border-l border-border max-md:border-l-0 max-md:border-t">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-neon/5 blur-[50px] pointer-events-none" />
              
              <Zap size={48} className="text-neon mb-4 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
              <h3 className="text-xl font-bold mb-6 text-white">Productivity Tracker</h3>
              <ul className="space-y-4 text-left w-full text-text-primary text-sm font-medium">
                <li className="flex items-start gap-3"><Check size={18} className="text-neon shrink-0 mt-0.5" /> Simple One-Time Lifetime Payment</li>
                <li className="flex items-start gap-3"><Check size={18} className="text-neon shrink-0 mt-0.5" /> 100% Ad-Free, forever</li>
                <li className="flex items-start gap-3"><Check size={18} className="text-neon shrink-0 mt-0.5" /> All-in-one suite (Habits, Tasks, Timer)</li>
                <li className="flex items-start gap-3"><Check size={18} className="text-neon shrink-0 mt-0.5" /> Local-first approach, total privacy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Subscription Model / Pricing */}
        <section className="py-24 px-10 bg-bg-tertiary/50 border-y border-border/50 max-md:py-16 max-md:px-5">
          <div className="max-w-[1000px] mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Simple, Honest Pricing</h2>
            <p className="text-text-secondary text-lg max-w-[600px] mx-auto mb-16">
              Start for free. When you're ready to get serious, unlock lifetime premium access for the price of a couple of coffees. No recurring subscriptions.
            </p>

            <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
              {/* Free Tier */}
              <div className="bg-bg-secondary border border-border rounded-2xl p-8 text-left flex flex-col">
                <h3 className="text-xl font-bold mb-2">Free Forever</h3>
                <div className="text-3xl font-bold mb-2 font-mono">$0</div>
                <p className="text-text-secondary text-sm mb-8 h-10">Perfect for getting started and building your baseline discipline.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-text-tertiary" /> Track up to 5 Habits</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-text-tertiary" /> Basic Pomodoro Timer</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-text-tertiary" /> 7-Day Analytics History</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check size={16} className="text-text-tertiary" /> Basic Gamification (Up to Level 5)</li>
                </ul>
                <Link to="/register" className="block mt-auto">
                  <Button variant="secondary" className="w-full h-12">Start Free</Button>
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-bg-primary border-2 border-neon rounded-3xl p-8 text-left flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(57,255,20,0.2)] hover:shadow-[0_0_60px_rgba(57,255,20,0.3)] transition-all duration-500 hover:-translate-y-2 z-10 scale-105 max-md:scale-100 max-md:mt-4">
                <div className="absolute inset-0 bg-neon/5 blur-[50px] pointer-events-none animate-pulse-glow" />
                <div className="absolute top-0 right-0 bg-neon text-bg-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">Most Popular</div>
                <h3 className="text-xl font-bold mb-2 text-neon">Pro Lifetime</h3>
                <div className="text-3xl font-bold mb-2 font-mono flex items-end gap-2">
                  $14.99 <span className="text-sm font-normal text-text-secondary pb-1">one-time payment</span>
                </div>
                <p className="text-text-secondary text-sm mb-8 h-10">Unleash the full power of the tracker without monthly fees.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Unlimited Habits & Routines</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Infinite Analytics & Heatmaps</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Advanced Focus Mode (Sounds & Backgrounds)</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Cross-device sync (Web, Mobile, PWA)</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Cloud Backups & Export</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><Check size={16} className="text-neon" /> Unlock all Rarity Achievements</li>
                </ul>
                <Link to="/register" className="block mt-auto">
                  <Button variant="primary" className="w-full h-12 text-base font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)]">
                    Unlock Pro Forever
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Availability */}
        <section className="py-20 px-10 max-w-[800px] mx-auto text-center border-b border-border/50 max-md:py-12 max-md:px-5">
          <h2 className="text-2xl font-bold mb-8">Available Everywhere You Work</h2>
          <div className="flex justify-center items-center gap-12 max-md:flex-col max-md:gap-8 opacity-70">
            <div className="flex flex-col items-center gap-3">
              <Globe size={40} className="text-text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">Web App</span>
            </div>
            <div className="w-[1px] h-12 bg-border max-md:w-12 max-md:h-[1px]" />
            <div className="flex flex-col items-center gap-3">
              <Smartphone size={40} className="text-text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">Installable PWA</span>
            </div>
            <div className="w-[1px] h-12 bg-border max-md:w-12 max-md:h-[1px]" />
            <div className="flex flex-col items-center gap-3">
              <Lock size={40} className="text-text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">Local-First</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-10 max-w-[800px] mx-auto mb-10 max-md:py-16 max-md:px-5">
          <div className="bg-bg-secondary/60 backdrop-blur-xl text-center p-16 max-md:p-8 rounded-[40px] border border-border shadow-[var(--shadow-cta)] relative overflow-hidden group hover:border-border-neon transition-colors duration-500">
            <div className="absolute inset-0 bg-neon/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to build better habits?</h2>
            <p className="text-xl text-text-secondary mb-10 font-medium">Join now and start your streak. Your future self will thank you.</p>
            <Link to="/register">
              <Button variant="primary" size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                Get Started For Free <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Hit the Bottom Section */}
        <section className="relative w-full py-40 flex items-center justify-center text-center overflow-hidden bg-black border-t border-border/50">
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <img 
              src="/hero-bg.jpg" 
              alt="Neon Productivity Abstract" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black opacity-80" />
          
          <div className="relative z-10 px-5 max-w-4xl mx-auto">
            <h2 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-xl max-md:text-4xl">
              You've reached the end.
            </h2>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon to-[#39FF14] drop-shadow-lg leading-tight max-md:text-5xl pb-4">
              Your journey to absolute<br className="hidden max-md:block" /> discipline starts here.
            </h2>
          </div>
        </section>
      </main>

      {/* Scroll to Top Button (Sticky) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-neon text-black flex items-center justify-center hover:bg-neon-dim transition-all duration-300 hover:scale-110 shadow-[0_0_20px_rgba(57,255,20,0.4)] z-[100] max-md:bottom-6 max-md:right-6"
        title="Scroll to Top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>

      {/* Footer */}
      <footer className="relative z-[1] text-center py-8 border-t border-border bg-bg-secondary">
        <div className="flex items-center justify-center gap-2 text-neon text-sm font-bold mb-4 opacity-50">
          <Zap size={16} /> Productivity Tracker
        </div>
        <p className="text-sm text-text-tertiary">© {new Date().getFullYear()} Productivity Tracker. Built with discipline.</p>
      </footer>
    </div>
  );
};

export default Landing;
