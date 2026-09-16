import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { formatTimer } from '../../utils/dateUtils';
import { COUNTDOWN_PRESETS } from '../../utils/constants';
import { useTimerStore } from '../../store/timerStore';
import { useUIStore } from '../../store/uiStore';

const CountdownTimer: React.FC = () => {
  const { saveSession } = useTimerStore();
  const { showToast } = useUIStore();

  const [targetSeconds, setTargetSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  const progress = targetSeconds > 0 ? ((targetSeconds - timeLeft) / targetSeconds) * 100 : 0;

  // SVG circle dimensions
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleComplete = async () => {
    setIsRunning(false);
    try {
      const result = await saveSession({
        type: 'countdown',
        duration: targetSeconds,
        actualDuration: targetSeconds,
        startedAt: startedAtRef.current || new Date(),
        label: `Countdown — ${formatTimer(targetSeconds)}`,
      });
      showToast('success', `⏰ Countdown complete! +${result.xpGained} XP`);
      if (result.leveledUp) showToast('success', `🎉 Level Up! Level ${result.newLevel}!`);
    } catch {
      showToast('error', 'Failed to save session');
    }
    startedAtRef.current = null;
  };

  const selectPreset = (seconds: number) => {
    setTargetSeconds(seconds);
    setTimeLeft(seconds);
    setIsSetup(false);
  };

  const handleCustomStart = () => {
    const mins = parseInt(customMinutes);
    if (!mins || mins < 1) {
      showToast('error', 'Enter at least 1 minute');
      return;
    }
    selectPreset(mins * 60);
  };

  const handleStart = () => {
    if (!startedAtRef.current) startedAtRef.current = new Date();
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setTargetSeconds(0);
    setIsSetup(true);
    startedAtRef.current = null;
    setCustomMinutes('');
  };

  if (isSetup) {
    return (
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-lg font-semibold text-text-primary">Select Duration</h3>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 justify-center max-w-[360px]">
          {COUNTDOWN_PRESETS.map(({ label, value }) => (
            <button
              key={value}
              className="px-5 py-3 rounded-2xl bg-bg-secondary border border-border text-text-primary font-medium hover:border-neon hover:bg-bg-tertiary hover:text-neon transition-all duration-200 hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]"
              onClick={() => selectPreset(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            placeholder="Custom (min)"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomStart()}
            className="w-32 py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm text-center outline-none focus:border-neon transition-colors duration-200 placeholder:text-text-tertiary font-mono"
            min={1}
          />
          <button
            className="px-4 py-2.5 rounded-[10px] bg-neon text-black font-semibold text-sm hover:bg-neon-dim transition-all duration-200"
            onClick={handleCustomStart}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular progress */}
      <div className="relative w-[280px] h-[280px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r={radius} fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="6" />
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={timeLeft === 0 ? '#FF3B3B' : '#00D1FF'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${timeLeft === 0 ? '#FF3B3B40' : '#00D1FF40'})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-mono font-bold tabular-nums ${timeLeft === 0 ? 'text-danger animate-pulse' : 'text-info'}`}
            style={timeLeft > 0 ? { textShadow: '0 0 20px rgba(0,209,255,0.4)' } : undefined}
          >
            {formatTimer(timeLeft)}
          </span>
          {timeLeft === 0 && <span className="text-sm text-danger mt-2 font-medium animate-pulse">Time's up!</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          className="w-12 h-12 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200"
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>

        {timeLeft > 0 && (
          <button
            className="w-16 h-16 rounded-full bg-info text-black flex items-center justify-center font-bold transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,209,255,0.4)]"
            onClick={isRunning ? () => setIsRunning(false) : handleStart}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
