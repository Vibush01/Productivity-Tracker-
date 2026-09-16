import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Input, TextArea } from '../common/Input';
import Button from '../common/Button';
import { useRoutineStore } from '../../store/routineStore';
import { useHabitStore } from '../../store/habitStore';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import type { Routine, RoutineFormData } from '../../types';

const ICONS = ['📋', '🌅', '☀️', '🌆', '🌙', '💪', '🧘', '📚', '💻', '🏃', '🍳', '🧹', '🎯', '⭐', '🔥'];
const COLORS = ['#39FF14', '#00D1FF', '#A855F7', '#FF3B3B', '#FFB800', '#FF8C00', '#FF69B4', '#00FF88'];

interface RoutineFormProps {
  routine?: Routine | null;
  onClose: () => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({ routine, onClose }) => {
  const { createRoutine, updateRoutine } = useRoutineStore();
  const { habits, fetchHabits } = useHabitStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<RoutineFormData>({
    name: routine?.name || '',
    description: routine?.description || '',
    icon: routine?.icon || '📋',
    color: routine?.color || '#39FF14',
    timeOfDay: routine?.timeOfDay || 'morning',
    startTime: routine?.startTime || '',
    items: routine?.items?.map((item) => ({
      type: item.type,
      refId: item.refId,
      order: item.order,
      duration: item.duration,
    })) || [],
    daysActive: routine?.daysActive || [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    fetchHabits();
    fetchTasks({ completed: 'false' });
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (type: 'habit' | 'task', refId: string) => {
    if (form.items.some((i) => i.refId === refId && i.type === type)) return;
    updateField('items', [
      ...form.items,
      { type, refId, order: form.items.length, duration: 5 },
    ]);
  };

  const removeItem = (index: number) => {
    updateField('items', form.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
  };

  const updateItemDuration = (index: number, duration: number) => {
    const items = [...form.items];
    items[index] = { ...items[index], duration };
    updateField('items', items);
  };

  const toggleDay = (day: number) => {
    const current = form.daysActive;
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    updateField('daysActive', updated);
  };

  const getItemTitle = (item: { type: string; refId: string }) => {
    if (item.type === 'habit') {
      const h = habits.find((h) => h._id === item.refId);
      return h ? `${h.icon} ${h.title}` : 'Unknown Habit';
    }
    const t = tasks.find((t) => t._id === item.refId);
    return t ? `📌 ${t.title}` : 'Unknown Task';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('error', 'Routine name is required'); return; }
    if (form.items.length === 0) { showToast('error', 'Add at least one item'); return; }

    setLoading(true);
    try {
      if (routine) {
        await updateRoutine(routine._id, form);
        showToast('success', `"${form.name}" updated`);
      } else {
        await createRoutine(form);
        showToast('success', `"${form.name}" created`);
      }
      onClose();
    } catch {
      showToast('error', 'Failed to save routine');
    } finally {
      setLoading(false);
    }
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeOptions = [
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '☀️ Afternoon' },
    { value: 'evening', label: '🌆 Evening' },
    { value: 'night', label: '🌙 Night' },
  ];

  const availableHabits = habits.filter((h) => !h.isArchived && !form.items.some((i) => i.type === 'habit' && i.refId === h._id));
  const availableTasks = tasks.filter((t) => !t.completed && !form.items.some((i) => i.type === 'task' && i.refId === t._id));

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
      <Input label="Routine Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
      <TextArea label="Description (optional)" value={form.description} onChange={(e) => updateField('description', e.target.value)} />

      {/* Icon + Color */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Icon</label>
          <div className="flex flex-wrap gap-1">
            {ICONS.map((icon) => (
              <button key={icon} type="button" className={`w-9 h-9 rounded-[10px] bg-bg-tertiary text-lg flex items-center justify-center transition-all duration-200 hover:bg-bg-quaternary ${form.icon === icon ? 'border-2 border-neon neon-glow' : 'border-2 border-transparent'}`} onClick={() => updateField('icon', icon)}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button key={color} type="button" className={`w-7 h-7 rounded-full transition-all duration-200 hover:scale-110 ${form.color === color ? 'border-[3px] border-white scale-110' : 'border-[3px] border-transparent'}`} style={{ background: color }} onClick={() => updateField('color', color)} />
            ))}
          </div>
        </div>
      </div>

      {/* Time of Day + Start Time */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Time of Day</label>
          <div className="flex flex-wrap gap-1.5">
            {timeOptions.map(({ value, label }) => (
              <button key={value} type="button" className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${form.timeOfDay === value ? 'bg-neon/10 border border-neon text-neon' : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon'}`} onClick={() => updateField('timeOfDay', value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} />
      </div>

      {/* Days Active */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Active Days</label>
        <div className="flex gap-1.5">
          {dayLabels.map((label, i) => (
            <button key={i} type="button" className={`w-10 h-10 rounded-[10px] text-xs font-medium transition-all duration-200 ${form.daysActive.includes(i) ? 'bg-neon border-neon text-black font-bold' : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon'}`} onClick={() => toggleDay(i)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Builder */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Routine Items ({form.items.length})</label>

        {/* Current items */}
        <div className="space-y-1.5 mb-3">
          {form.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-[10px]">
              <GripVertical size={14} className="text-text-tertiary shrink-0" />
              <span className="w-5 h-5 rounded-full bg-bg-quaternary flex items-center justify-center text-[10px] font-bold text-text-tertiary shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm truncate">{getItemTitle(item)}</span>
              <input
                type="number"
                value={item.duration || ''}
                onChange={(e) => updateItemDuration(i, parseInt(e.target.value) || 0)}
                className="w-12 px-1.5 py-0.5 bg-bg-quaternary rounded text-xs text-center text-text-secondary outline-none border border-transparent focus:border-neon"
                placeholder="min"
                min={0}
              />
              <span className="text-[10px] text-text-tertiary">min</span>
              <button type="button" className="w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-quaternary hover:text-danger transition-all duration-200" onClick={() => removeItem(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add items */}
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          {availableHabits.length > 0 && (
            <div>
              <span className="text-[11px] text-text-tertiary uppercase font-semibold tracking-wider mb-1 block">Habits</span>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                {availableHabits.map((h) => (
                  <button key={h._id} type="button" className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200 text-left" onClick={() => addItem('habit', h._id)}>
                    <Plus size={12} className="text-neon shrink-0" />
                    <span className="truncate">{h.icon} {h.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableTasks.length > 0 && (
            <div>
              <span className="text-[11px] text-text-tertiary uppercase font-semibold tracking-wider mb-1 block">Tasks</span>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                {availableTasks.map((t) => (
                  <button key={t._id} type="button" className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200 text-left" onClick={() => addItem('task', t._id)}>
                    <Plus size={12} className="text-neon shrink-0" />
                    <span className="truncate">📌 {t.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>
          {routine ? 'Update Routine' : 'Create Routine'}
        </Button>
      </div>
    </form>
  );
};

export default RoutineForm;
