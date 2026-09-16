import React, { useEffect, useState, useRef } from 'react';
import { X, Check, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import type { Routine } from '../../types';
import { useRoutineStore } from '../../store/routineStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../common/Button';

interface RoutinePlayerProps {
  routine: Routine;
  onClose: () => void;
}

const RoutinePlayer: React.FC<RoutinePlayerProps> = ({ routine, onClose }) => {
  const { completeRoutine } = useRoutineStore();
  const { showToast } = useUIStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const currentItem = routine.items[currentIndex];
  const nextItem = routine.items[currentIndex + 1];
  const progress = routine.items.length > 0 ? (completedItems.size / routine.items.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCompleteItem = () => {
    const newCompleted = new Set(completedItems);
    newCompleted.add(currentIndex);
    setCompletedItems(newCompleted);
    setElapsed(0);

    if (currentIndex < routine.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = async () => {
    try {
      const result = await completeRoutine(routine._id);
      showToast('success', `🎉 Routine complete! +${result.xpGained} XP`);
      if (result.leveledUp) showToast('success', `Level Up! You're now Level ${result.newLevel}!`);
      onClose();
    } catch {
      showToast('error', 'Failed to complete routine');
    }
  };

  const allDone = completedItems.size === routine.items.length;

  return (
    <div className="fixed inset-0 bg-bg-primary z-[500] flex flex-col animate-fade-in">
      {/* Progress bar */}
      <div className="h-1 bg-bg-tertiary">
        <div className="h-full bg-neon transition-[width] duration-500 shadow-[0_0_10px_rgba(57,255,20,0.5)]" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">{routine.icon} {routine.name}</h2>
          <span className="text-xs text-text-secondary">{completedItems.size} of {routine.items.length} completed</span>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-[10px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200" onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {allDone ? (
          <div className="text-center animate-pop-in">
            <span className="text-6xl block mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-neon neon-text-glow mb-2">All Done!</h2>
            <p className="text-text-secondary mb-6">You've completed your entire routine</p>
            <Button variant="primary" size="lg" onClick={handleFinish}>Finish & Earn XP</Button>
          </div>
        ) : currentItem ? (
          <>
            {/* Current item */}
            <div className="text-center animate-scale-in max-w-[400px]">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon/8 text-neon text-xs font-semibold mb-4">
                Step {currentIndex + 1} of {routine.items.length}
              </span>
              <div className="w-20 h-20 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center text-4xl mx-auto mb-4">
                {currentItem.refData?.icon || (currentItem.type === 'habit' ? '🎯' : '📌')}
              </div>
              <h2 className="text-xl font-bold mb-1">{currentItem.refData?.title || 'Unknown Item'}</h2>
              <span className="text-sm text-text-secondary capitalize">{currentItem.type}</span>
              {currentItem.duration && (
                <span className="text-sm text-text-secondary"> · ~{currentItem.duration} min</span>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-bold text-neon neon-text-glow tabular-nums">{formatTime(elapsed)}</span>
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200"
                  onClick={() => setElapsed(0)}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Complete button */}
            <Button variant="primary" size="lg" onClick={handleCompleteItem} icon={<Check size={20} />}>
              Complete & Next
            </Button>

            {/* Next up */}
            {nextItem && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-border rounded-2xl animate-slide-up">
                <span className="text-xs text-text-tertiary">Next up:</span>
                <span className="text-sm text-text-secondary">
                  {nextItem.refData?.icon || '📌'} {nextItem.refData?.title || 'Unknown'}
                </span>
                <ChevronRight size={14} className="text-text-tertiary" />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Bottom item list */}
      <div className="border-t border-border px-6 py-3 flex gap-2 overflow-x-auto">
        {routine.items.map((item, i) => (
          <button
            key={item._id || i}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              completedItems.has(i)
                ? 'bg-neon/10 text-neon border border-neon/20 line-through opacity-60'
                : i === currentIndex
                ? 'bg-neon/8 text-neon border border-neon'
                : 'bg-bg-secondary border border-border text-text-secondary'
            }`}
            onClick={() => { if (!completedItems.has(i)) setCurrentIndex(i); }}
          >
            {completedItems.has(i) && <Check size={12} />}
            {item.refData?.title || `Item ${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoutinePlayer;
