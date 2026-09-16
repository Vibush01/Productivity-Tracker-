import React from 'react';
import { Clock, Play, MoreVertical, Edit2, Trash2, Power } from 'lucide-react';
import type { Routine } from '../../types';
import { useRoutineStore } from '../../store/routineStore';
import { useUIStore } from '../../store/uiStore';

interface RoutineCardProps {
  routine: Routine;
  onEdit?: (routine: Routine) => void;
  onPlay?: (routine: Routine) => void;
}

const timeIcons: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
};

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onEdit, onPlay }) => {
  const { deleteRoutine, toggleRoutine } = useRoutineStore();
  const { showToast } = useUIStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const totalDuration = routine.items.reduce((sum, item) => sum + (item.duration || 0), 0);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDelete = async () => {
    if (window.confirm(`Delete "${routine.name}"?`)) {
      await deleteRoutine(routine._id);
      showToast('success', `"${routine.name}" deleted`);
    }
    setShowMenu(false);
  };

  const handleToggle = async () => {
    await toggleRoutine(routine._id);
    showToast('info', `"${routine.name}" ${routine.isActive ? 'deactivated' : 'activated'}`);
    setShowMenu(false);
  };

  return (
    <div className={`bg-bg-secondary border border-border rounded-2xl p-5 transition-all duration-200 hover:border-border-neon hover:bg-bg-tertiary relative group ${!routine.isActive ? 'opacity-50' : ''}`}>
      {/* Color accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: routine.color }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{routine.icon}</span>
          <div>
            <h3 className="font-semibold text-text-primary">{routine.name}</h3>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              {timeIcons[routine.timeOfDay]} {routine.timeOfDay.charAt(0).toUpperCase() + routine.timeOfDay.slice(1)}
              {routine.startTime && <> · {routine.startTime}</>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {routine.isActive && (
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-neon/10 text-neon hover:bg-neon/20 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-200"
              onClick={() => onPlay?.(routine)}
              title="Start routine"
            >
              <Play size={18} />
            </button>
          )}
          <div className="relative">
            <button
              className="flex items-center justify-center w-8 h-8 rounded-[10px] text-text-tertiary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-[5]" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-9 bg-bg-tertiary border border-border rounded-[10px] shadow-lg min-w-[150px] z-10 overflow-hidden animate-scale-in">
                  {onEdit && (
                    <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200 text-left" onClick={() => { onEdit(routine); setShowMenu(false); }}>
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                  <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-bg-quaternary hover:text-text-primary transition-all duration-200 text-left" onClick={handleToggle}>
                    <Power size={14} /> {routine.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-text-secondary hover:bg-danger/8 hover:text-danger transition-all duration-200 text-left" onClick={handleDelete}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items preview */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-text-secondary font-mono">{routine.items.length} items</span>
        {totalDuration > 0 && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock size={11} /> ~{totalDuration} min
          </span>
        )}
      </div>

      {/* Item list preview */}
      <div className="space-y-1 max-h-[120px] overflow-hidden relative">
        {routine.items.slice(0, 4).map((item, i) => (
          <div key={item._id || i} className="flex items-center gap-2 py-1">
            <span className="w-5 h-5 rounded-full bg-bg-quaternary flex items-center justify-center text-[10px] font-bold text-text-tertiary shrink-0">
              {i + 1}
            </span>
            <span className="text-sm text-text-secondary truncate">
              {item.refData?.icon && <span className="mr-1">{item.refData.icon}</span>}
              {item.refData?.title || (item.type === 'habit' ? 'Habit' : 'Task')}
            </span>
            {item.duration && <span className="text-[10px] text-text-tertiary font-mono ml-auto shrink-0">{item.duration}m</span>}
          </div>
        ))}
        {routine.items.length > 4 && (
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
        )}
      </div>

      {/* Days active */}
      <div className="flex gap-1 mt-3 pt-3 border-t border-border">
        {dayLabels.map((label, i) => (
          <span
            key={i}
            className={`flex-1 text-center py-0.5 rounded text-[10px] font-medium transition-all ${
              routine.daysActive.includes(i)
                ? 'bg-neon/10 text-neon'
                : 'text-text-tertiary'
            }`}
          >
            {label[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RoutineCard;
