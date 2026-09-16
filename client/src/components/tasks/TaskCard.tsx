import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, MoreVertical, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: '#39FF14', label: 'Low' },
  medium: { color: '#FFB800', label: 'Medium' },
  high: { color: '#FF8C00', label: 'High' },
  urgent: { color: '#FF3B3B', label: 'Urgent' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { completeTask, toggleSubtask, deleteTask } = useTaskStore();
  const { showToast } = useUIStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);

  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleComplete = async () => {
    try {
      setAnimateCheck(true);
      const result = await completeTask(task._id);
      if (result.xpGained > 0 && !task.completed) showToast('success', `+${result.xpGained} XP earned!`);
      if (result.leveledUp) showToast('success', `🎉 Level Up! You're now Level ${result.newLevel}!`);
      setTimeout(() => setAnimateCheck(false), 600);
    } catch {
      showToast('error', 'Failed to update task');
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask(task._id, subtaskId);
    } catch {
      showToast('error', 'Failed to update subtask');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      await deleteTask(task._id);
      showToast('success', `"${task.title}" deleted`);
    }
    setShowMenu(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-bg-secondary border border-border rounded-2xl transition-all duration-200 relative overflow-hidden hover:border-border-neon hover:bg-bg-tertiary ${task.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-danger/30 hover:border-danger/50' : ''}`}>
      {/* Priority strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: priority.color }} />

      <div className="flex items-center gap-3 py-3.5 px-4 pl-5">
        {/* Check button */}
        <button
          className={`w-6 h-6 min-w-[24px] rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'border-neon bg-neon text-black'
              : 'border-border hover:border-neon hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]'
          } ${animateCheck ? 'animate-pop-in' : ''}`}
          onClick={handleComplete}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm truncate ${task.completed ? 'line-through text-text-tertiary' : ''}`}>
              {task.title}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: `${priority.color}15`, color: priority.color }}
            >
              {priority.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger font-medium' : 'text-text-secondary'}`}>
                <Calendar size={11} />
                {formatDate(task.dueDate)}
                {isOverdue && ' · Overdue'}
              </span>
            )}
            {task.dueTime && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={11} />
                {task.dueTime}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-text-secondary font-mono">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Subtask toggle */}
        {task.subtasks.length > 0 && (
          <button
            className="flex items-center justify-center w-7 h-7 rounded-[10px] text-text-tertiary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* Menu */}
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
                  <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200 text-left" onClick={() => { onEdit(task); setShowMenu(false); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-danger/8 hover:text-danger transition-all duration-200 text-left" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subtasks */}
      {showSubtasks && task.subtasks.length > 0 && (
        <div className="border-t border-border px-5 py-2.5 space-y-1 animate-slide-down">
          {task.subtasks.map((subtask) => (
            <div key={subtask._id} className="flex items-center gap-2.5 py-1">
              <button
                className={`w-[18px] h-[18px] min-w-[18px] rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                  subtask.completed
                    ? 'border-neon bg-neon/20 text-neon'
                    : 'border-border hover:border-neon'
                }`}
                onClick={() => handleToggleSubtask(subtask._id)}
              >
                {subtask.completed && <Check size={11} strokeWidth={3} />}
              </button>
              <span className={`text-sm ${subtask.completed ? 'line-through text-text-tertiary' : 'text-text-secondary'}`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
