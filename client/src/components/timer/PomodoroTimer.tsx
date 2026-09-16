import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { formatTimer } from '../../utils/dateUtils';
import { POMODORO_DEFAULTS, POMODORO_PHASES } from '../../utils/constants';
import { useTimerStore } from '../../store/timerStore';
import { useUIStore } from '../../store/uiStore';

type Phase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

interface PomodoroTimerProps {
  linkedHabitId?: string;
  linkedHabitTitle?: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ linkedHabitId, linkedHabitTitle }) => {
  const { saveSession } = useTimerStore();
  const { showToast } = useUIStore();

  const [phase, setPhase] = useState<Phase>('WORK');
  const [timeLeft, setTimeLeft] = useState(POMODORO_DEFAULTS.WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  const phaseDuration = phase === 'WORK'
    ? POMODORO_DEFAULTS.WORK
    : phase === 'SHORT_BREAK'
    ? POMODORO_DEFAULTS.SHORT_BREAK
    : POMODORO_DEFAULTS.LONG_BREAK;

  const progress = ((phaseDuration - timeLeft) / phaseDuration) * 100;
  const phaseConfig = POMODORO_PHASES[phase];

  // SVG circle dimensions
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handlePhaseComplete = useCallback(async () => {
    setIsRunning(false);

    if (phase === 'WORK') {
      // Save the work session
      try {
        const result = await saveSession({
          type: 'pomodoro',
          linkedHabit: linkedHabitId || undefined,
          duration: POMODORO_DEFAULTS.WORK,
          actualDuration: POMODORO_DEFAULTS.WORK,
          startedAt: startedAtRef.current || new Date(),
          label: linkedHabitTitle ? `Pomodoro: ${linkedHabitTitle}` : `Pomodoro Session ${sessionCount}`,
        });
        showToast('success', `🍅 Focus session complete! +${result.xpGained} XP`);
        if (result.leveledUp) showToast('success', `🎉 Level Up! Level ${result.newLevel}!`);
      } catch {
        showToast('error', 'Failed to save session');
      }

      // Determine next break
      const isLongBreak = sessionCount % POMODORO_DEFAULTS.SESSIONS_BEFORE_LONG === 0;
      if (isLongBreak) {
        setPhase('LONG_BREAK');
        setTimeLeft(POMODORO_DEFAULTS.LONG_BREAK);
      } else {
        setPhase('SHORT_BREAK');
        setTimeLeft(POMODORO_DEFAULTS.SHORT_BREAK);
      }
    } else {
      // Break complete — next work session
      setPhase('WORK');
      setTimeLeft(POMODORO_DEFAULTS.WORK);
      if (phase === 'LONG_BREAK') setSessionCount(1);
      else setSessionCount((prev) => prev + 1);
    }

    startedAtRef.current = null;
  }, [phase, sessionCount, linkedHabitId, linkedHabitTitle, saveSession, showToast]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          setTotalElapsed((t) => t + 1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handlePhaseComplete]);

  const handleStart = () => {
    if (!startedAtRef.current) startedAtRef.current = new Date();
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setPhase('WORK');
    setTimeLeft(POMODORO_DEFAULTS.WORK);
    setSessionCount(1);
    setTotalElapsed(0);
    startedAtRef.current = null;
  };

  const handleSkip = () => handlePhaseComplete();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase label */}
      <div className="flex items-center gap-3">
        <span
          className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider"
          style={{ background: `${phaseConfig.color}15`, color: phaseConfig.color }}
        >
          {phaseConfig.label}
        </span>
        <span className="text-xs text-text-tertiary font-mono">
          Session {sessionCount} of {POMODORO_DEFAULTS.SESSIONS_BEFORE_LONG}
        </span>
      </div>

      {/* Circular progress */}
      <div className="relative w-[280px] h-[280px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle cx="140" cy="140" r={radius} fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="6" />
          {/* Progress arc */}
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={phaseConfig.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${phaseConfig.color}40)` }}
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold tabular-nums" style={{ color: phaseConfig.color, textShadow: `0 0 20px ${phaseConfig.color}40` }}>
            {formatTimer(timeLeft)}
          </span>
          {linkedHabitTitle && (
            <span className="text-xs text-text-tertiary mt-2 max-w-[180px] truncate text-center">{linkedHabitTitle}</span>
          )}
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

        <button
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200"
          style={{
            background: phaseConfig.color,
            color: '#000',
            boxShadow: `0 0 20px ${phaseConfig.color}40, 0 0 40px ${phaseConfig.color}20`,
          }}
          onClick={isRunning ? handlePause : handleStart}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>

        <button
          className="w-12 h-12 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200"
          onClick={handleSkip}
          title="Skip phase"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Total focus time */}
      {totalElapsed > 0 && (
        <span className="text-xs text-text-tertiary font-mono">Total focus: {formatTimer(totalElapsed)}</span>
      )}
    </div>
  );
};

export default PomodoroTimer;
