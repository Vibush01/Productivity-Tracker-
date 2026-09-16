import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { formatTimer } from '../../utils/dateUtils';
import { useTimerStore } from '../../store/timerStore';
import { useUIStore } from '../../store/uiStore';

interface Lap {
  number: number;
  splitTime: number;
  totalTime: number;
}

const Stopwatch: React.FC = () => {
  const { saveSession } = useTimerStore();
  const { showToast } = useUIStore();

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);
  const lastLapRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleStart = () => {
    if (!startedAtRef.current) startedAtRef.current = new Date();
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
    startedAtRef.current = null;
    lastLapRef.current = 0;
  };

  const handleLap = () => {
    const splitTime = elapsed - lastLapRef.current;
    setLaps((prev) => [
      { number: prev.length + 1, splitTime, totalTime: elapsed },
      ...prev,
    ]);
    lastLapRef.current = elapsed;
  };

  const handleSave = async () => {
    if (elapsed < 1) return;
    try {
      const result = await saveSession({
        type: 'stopwatch',
        duration: elapsed,
        actualDuration: elapsed,
        startedAt: startedAtRef.current || new Date(),
        label: `Stopwatch — ${formatTimer(elapsed)}`,
      });
      showToast('success', `⏱️ Stopwatch saved! +${result.xpGained} XP`);
      handleReset();
    } catch {
      showToast('error', 'Failed to save session');
    }
  };

  // Millisecond-like display (use centiseconds for visual effect)
  const displayMs = `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer display */}
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-6xl font-mono font-bold text-neon neon-text-glow">
          {formatTimer(elapsed)}
        </span>
        {isRunning && (
          <span className="text-2xl font-mono text-neon/50">.{displayMs}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {elapsed > 0 && (
          <button
            className="w-12 h-12 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        )}

        <button
          className="w-16 h-16 rounded-full bg-neon text-black flex items-center justify-center font-bold transition-all duration-200 neon-glow-strong hover:shadow-[0_0_40px_rgba(57,255,20,0.5)]"
          onClick={isRunning ? handlePause : handleStart}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>

        {isRunning && (
          <button
            className="w-12 h-12 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-neon transition-all duration-200"
            onClick={handleLap}
            title="Lap"
          >
            <Flag size={18} />
          </button>
        )}

        {!isRunning && elapsed > 0 && (
          <button
            className="px-5 py-2.5 rounded-[10px] bg-neon/10 border border-neon text-neon font-semibold text-sm hover:bg-neon/20 transition-all duration-200"
            onClick={handleSave}
          >
            Save Session
          </button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="w-full max-w-[360px] max-h-[240px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left py-1.5 px-2">Lap</th>
                <th className="text-right py-1.5 px-2">Split</th>
                <th className="text-right py-1.5 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((lap, i) => (
                <tr key={lap.number} className={`border-t border-border ${i === 0 ? 'text-neon' : 'text-text-secondary'}`}>
                  <td className="py-1.5 px-2 font-mono">#{lap.number}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{formatTimer(lap.splitTime)}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{formatTimer(lap.totalTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
