import React, { useState, useEffect } from 'react';
import { Input, TextArea, Select } from '../common/Input';
import Button from '../common/Button';
import { useHabitStore } from '../../store/habitStore';
import { useUIStore } from '../../store/uiStore';
import type { Habit, HabitFormData } from '../../types';

const ICONS = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🍎', '🎯', '💻', '🎨', '🎵', '📝', '🧠', '😴', '🚭', '🏋️', '📖', '✍️', '🌱', '⭐', '🔥', '💎', '🦅', '🎸', '🏊', '🚴', '🧹', '💰', '📱', '🍳'];
const COLORS = ['#39FF14', '#00D1FF', '#A855F7', '#FF3B3B', '#FFB800', '#FF8C00', '#FF69B4', '#00FF88', '#4169E1', '#FFD700'];

interface HabitFormProps {
  habit?: Habit | null;
  onClose: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ habit, onClose }) => {
  const { createHabit, updateHabit, categories, fetchCategories } = useHabitStore();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<HabitFormData>({
    title: habit?.title || '',
    description: habit?.description || '',
    icon: habit?.icon || '✅',
    color: habit?.color || '#39FF14',
    category: (habit?.category as any)?._id || '',
    frequency: habit?.frequency || { type: 'daily' },
    goalType: habit?.goalType || 'boolean',
    goalValue: habit?.goalValue || 1,
    goalUnit: habit?.goalUnit || '',
    reminderTime: habit?.reminderTime || '',
  });

  useEffect(() => { fetchCategories(); }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast('error', 'Habit title is required'); return; }
    setLoading(true);
    try {
      const data: any = { title: form.title, description: form.description, icon: form.icon, color: form.color, frequency: form.frequency, goalType: form.goalType };
      if (form.category) data.category = form.category;
      if (form.goalType !== 'boolean') { data.goalValue = form.goalValue; data.goalUnit = form.goalUnit; }
      if (form.reminderTime) data.reminderTime = form.reminderTime;

      if (habit) { await updateHabit(habit._id, data); showToast('success', `"${form.title}" updated`); }
      else { await createHabit(data); showToast('success', `"${form.title}" created`); }
      onClose();
    } catch { showToast('error', 'Failed to save habit'); }
    finally { setLoading(false); }
  };

  const steps = ['Basics', 'Schedule', 'Goal'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: number) => {
    const current = form.frequency.daysOfWeek || [];
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    updateField('frequency', { ...form.frequency, daysOfWeek: updated });
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Steps */}
      <div className="flex gap-2 mb-6 pb-4 border-b border-border">
        {steps.map((s, i) => (
          <button
            key={s}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-all duration-200 ${step === i ? 'bg-neon/8 text-neon' : step > i ? 'text-neon' : 'text-text-secondary'}`}
            onClick={() => setStep(i)}
          >
            <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold ${step === i ? 'bg-neon text-black' : step > i ? 'bg-neon/20 text-neon' : 'bg-bg-tertiary'}`}>
              {step > i ? '✓' : i + 1}
            </span>
            <span className="font-medium">{s}</span>
          </button>
        ))}
      </div>

      {/* Step 0: Basics */}
      {step === 0 && (
        <div className="min-h-[200px] animate-fade-in">
          <Input label="Habit Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
          <TextArea label="Description (optional)" value={form.description} onChange={(e) => updateField('description', e.target.value)} />

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((icon) => (
                <button key={icon} type="button" className={`w-10 h-10 rounded-[10px] bg-bg-tertiary text-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-bg-quaternary ${form.icon === icon ? 'border-2 border-neon neon-glow' : 'border-2 border-transparent'}`} onClick={() => updateField('icon', icon)}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button key={color} type="button" className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 hover:scale-115 ${form.color === color ? 'border-[3px] border-white shadow-[0_0_12px_currentColor] scale-115' : 'border-[3px] border-transparent'}`} style={{ background: color }} onClick={() => updateField('color', color)} />
              ))}
            </div>
          </div>

          <Select label="Category" value={form.category} onChange={(e) => updateField('category', e.target.value)} options={categories.map((c) => ({ value: c._id, label: `${c.icon} ${c.name}` }))} />
        </div>
      )}

      {/* Step 1: Schedule */}
      {step === 1 && (
        <div className="min-h-[200px] animate-fade-in">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Frequency</label>
            <div className="flex gap-1.5 flex-wrap">
              {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                <button key={type} type="button" className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 ${form.frequency.type === type ? 'bg-neon/10 border border-neon text-neon' : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon hover:text-text-primary'}`} onClick={() => updateField('frequency', { ...form.frequency, type })}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {form.frequency.type === 'weekly' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">Days of Week</label>
              <div className="flex gap-1.5 max-sm:flex-wrap">
                {dayLabels.map((label, i) => (
                  <button key={i} type="button" className={`w-11 h-11 rounded-[10px] text-xs font-medium cursor-pointer transition-all duration-200 max-sm:w-[38px] max-sm:h-[38px] ${(form.frequency.daysOfWeek || []).includes(i) ? 'bg-neon border-neon text-black font-bold' : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon'}`} onClick={() => toggleDay(i)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.frequency.type === 'custom' && (
            <Input label="Every N days" type="number" value={form.frequency.customInterval || 2} onChange={(e) => updateField('frequency', { ...form.frequency, customInterval: parseInt(e.target.value) })} min={1} />
          )}

          <Input label="Reminder Time (optional)" type="time" value={form.reminderTime} onChange={(e) => updateField('reminderTime', e.target.value)} />
        </div>
      )}

      {/* Step 2: Goal */}
      {step === 2 && (
        <div className="min-h-[200px] animate-fade-in">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Goal Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {[{ value: 'boolean', label: 'Yes / No' }, { value: 'count', label: 'Count' }, { value: 'duration', label: 'Duration' }].map(({ value, label }) => (
                <button key={value} type="button" className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 ${form.goalType === value ? 'bg-neon/10 border border-neon text-neon' : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon'}`} onClick={() => updateField('goalType', value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.goalType !== 'boolean' && (
            <>
              <Input label={form.goalType === 'duration' ? 'Target (minutes)' : 'Target Count'} type="number" value={form.goalValue} onChange={(e) => updateField('goalValue', parseInt(e.target.value))} min={1} />
              {form.goalType === 'count' && (
                <Input label='Unit (e.g., "glasses", "pages")' value={form.goalUnit} onChange={(e) => updateField('goalUnit', e.target.value)} />
              )}
            </>
          )}

          {/* Preview */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Preview</label>
            <div className="flex items-center gap-3 py-3.5 px-4 bg-bg-tertiary border border-border rounded-2xl" style={{ borderLeftColor: form.color, borderLeftWidth: '3px' }}>
              <span className="text-2xl">{form.icon}</span>
              <div>
                <span className="font-medium block">{form.title || 'Your Habit'}</span>
                <span className="text-xs text-text-secondary capitalize">{form.frequency.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button> : <div />}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={loading}>{habit ? 'Update Habit' : 'Create Habit'}</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitForm;
