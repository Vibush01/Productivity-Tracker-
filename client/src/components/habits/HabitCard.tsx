import React, { useState } from 'react';
import { Flame, Check, MoreVertical, Edit2, Trash2, Archive } from 'lucide-react';
import type { Habit } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { useUIStore } from '../../store/uiStore';

interface HabitCardProps {
  habit: Habit;
  compact?: boolean;
  onEdit?: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, compact = false, onEdit }) => {
  const { logHabit, deleteLog, archiveHabit, deleteHabit } = useHabitStore();
  const { showToast } = useUIStore();
  const [showMenu, setShowMenu] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      if (habit.todayCompleted) {
        const today = new Date().toISOString().split('T')[0];
        await deleteLog(habit._id, today);
        showToast('info', `"${habit.title}" unmarked`);
      } else {
        setAnimateCheck(true);
        const result = await logHabit(habit._id, { completed: true });
        if (result.xpGained > 0) showToast('success', `+${result.xpGained} XP earned!`);
        if (result.leveledUp) showToast('success', `🎉 Level Up! You're now Level ${result.newLevel}!`);
        if (result.accountabilityMessage && Math.random() < 0.15) {
          setAccountMsg(result.accountabilityMessage);
          setTimeout(() => setAccountMsg(null), 5000);
        }
        if (result.streakMessage) setTimeout(() => showToast('info', result.streakMessage!), 1000);
        setTimeout(() => setAnimateCheck(false), 600);
      }
    } catch {
      showToast('error', 'Failed to log habit');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${habit.title}"? This will also delete all logs.`)) {
      await deleteHabit(habit._id);
      showToast('success', `"${habit.title}" deleted`);
    }
    setShowMenu(false);
  };

  const handleArchive = async () => {
    await archiveHabit(habit._id);
    showToast('info', `"${habit.title}" archived`);
    setShowMenu(false);
  };

  return (
    <div className={`flex items-center gap-3 bg-bg-secondary border border-border rounded-2xl transition-all duration-200 relative overflow-hidden hover:border-border-neon hover:bg-bg-tertiary ${compact ? 'py-2.5 px-3.5' : 'py-3.5 px-4'} ${habit.todayCompleted ? 'border-neon/15' : ''}`}>
      {/* Color strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: habit.color }} />

      {/* Check button */}
      <button
        className={`w-7 h-7 min-w-[28px] rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ml-2 ${
          habit.todayCompleted
            ? 'shadow-[0_0_12px_rgba(57,255,20,0.3)]'
            : 'border-border bg-transparent hover:border-neon hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]'
        } ${animateCheck ? 'animate-pop-in' : ''}`}
        style={{
          borderColor: habit.todayCompleted ? habit.color : undefined,
          background: habit.todayCompleted ? habit.color : undefined,
          color: habit.todayCompleted ? '#000' : undefined,
        }}
        onClick={handleToggle}
      >
        {habit.todayCompleted && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{habit.icon}</span>
          <span className={`font-medium text-sm truncate ${habit.todayCompleted ? 'line-through opacity-60' : ''}`}>{habit.title}</span>
        </div>
        {!compact && habit.category && (
          <span className="text-xs mt-0.5 block" style={{ color: (habit.category as any).color }}>
            {(habit.category as any).icon} {(habit.category as any).name}
          </span>
        )}
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF8C00]/8 text-[#FF8C00] text-xs font-semibold font-mono whitespace-nowrap ${habit.currentStreak >= 7 ? 'bg-[#FF8C00]/15 animate-pulse-glow shadow-[0_0_10px_rgba(255,140,0,0.2)]' : ''}`}>
          <Flame size={14} />
          <span>{habit.currentStreak}</span>
        </div>
      )}

      {/* Menu */}
      {!compact && (
        <div className="relative">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-[10px] text-text-tertiary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[5]" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 bg-bg-tertiary border border-border rounded-[10px] shadow-lg min-w-[140px] z-10 overflow-hidden animate-scale-in">
                {onEdit && (
                  <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200 text-left" onClick={() => { onEdit(habit); setShowMenu(false); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200 text-left" onClick={handleArchive}>
                  <Archive size={14} /> Archive
                </button>
                <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-danger/8 hover:text-danger transition-all duration-200 text-left" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Accountability message */}
      {accountMsg && (
        <div className="absolute -bottom-10 left-5 right-5 bg-bg-tertiary border border-border-neon rounded-[10px] px-3 py-2 z-[5] shadow-md neon-glow animate-slide-up">
          <p className="text-xs text-text-secondary italic">{accountMsg}</p>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
