import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Input, TextArea, Select } from '../common/Input';
import Button from '../common/Button';
import { useTaskStore } from '../../store/taskStore';
import { useHabitStore } from '../../store/habitStore';
import { useUIStore } from '../../store/uiStore';
import type { Task, TaskFormData } from '../../types';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { createTask, updateTask } = useTaskStore();
  const { categories, fetchCategories } = useHabitStore();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    category: (task?.category as any)?._id || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    dueTime: task?.dueTime || '',
    subtasks: task?.subtasks?.map((s) => ({ title: s.title, completed: s.completed })) || [],
  });

  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      updateField('subtasks', [...form.subtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    updateField('subtasks', form.subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('error', 'Task title is required'); return; }

    setLoading(true);
    try {
      const data: any = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        subtasks: form.subtasks,
      };
      if (form.category) data.category = form.category;
      if (form.dueDate) data.dueDate = form.dueDate;
      if (form.dueTime) data.dueTime = form.dueTime;

      if (task) {
        await updateTask(task._id, data);
        showToast('success', `"${form.title}" updated`);
      } else {
        await createTask(data);
        showToast('success', `"${form.title}" created`);
      }
      onClose();
    } catch {
      showToast('error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'low', label: 'Low', color: '#39FF14' },
    { value: 'medium', label: 'Medium', color: '#FFB800' },
    { value: 'high', label: 'High', color: '#FF8C00' },
    { value: 'urgent', label: 'Urgent', color: '#FF3B3B' },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
      <Input label="Task Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
      <TextArea label="Description (optional)" value={form.description} onChange={(e) => updateField('description', e.target.value)} />

      {/* Priority */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
        <div className="flex gap-1.5 flex-wrap">
          {priorities.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                form.priority === value
                  ? 'font-semibold'
                  : 'bg-bg-tertiary border border-border text-text-secondary hover:border-border-neon'
              }`}
              style={form.priority === value ? { background: `${color}15`, border: `1px solid ${color}`, color } : undefined}
              onClick={() => updateField('priority', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
        <Input label="Due Time" type="time" value={form.dueTime} onChange={(e) => updateField('dueTime', e.target.value)} />
      </div>

      <Select
        label="Category"
        value={form.category}
        onChange={(e) => updateField('category', e.target.value)}
        options={categories.map((c) => ({ value: c._id, label: `${c.icon} ${c.name}` }))}
      />

      {/* Subtasks */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Subtasks</label>
        <div className="space-y-1.5 mb-2">
          {form.subtasks.map((subtask, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-[10px]">
              <span className="flex-1 text-sm text-text-primary">{subtask.title}</span>
              <button
                type="button"
                className="w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-quaternary hover:text-danger transition-all duration-200"
                onClick={() => removeSubtask(i)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a subtask..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            className="flex-1 py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200 placeholder:text-text-tertiary"
          />
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-neon/10 text-neon hover:bg-neon/20 transition-all duration-200"
            onClick={addSubtask}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
