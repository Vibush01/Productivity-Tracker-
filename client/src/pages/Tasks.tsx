import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Navbar from '../components/common/Navbar';
import type { Task } from '../types';

const Tasks: React.FC = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { fetchCategories } = useHabitStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [quickAdd, setQuickAdd] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (activeTab === 'active') filters.completed = 'false';
    if (activeTab === 'completed') filters.completed = 'true';
    if (search) filters.search = search;
    if (priorityFilter) filters.priority = priorityFilter;
    fetchTasks(filters);
    fetchCategories();
  }, [activeTab, search, priorityFilter]);

  const handleEdit = (task: Task) => { setEditingTask(task); setShowForm(true); };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
    const filters: Record<string, string> = {};
    if (activeTab === 'active') filters.completed = 'false';
    if (activeTab === 'completed') filters.completed = 'true';
    fetchTasks(filters);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdd.trim()) return;
    const { createTask } = useTaskStore.getState();
    await createTask({ title: quickAdd.trim() });
    setQuickAdd('');
    const filters: Record<string, string> = {};
    if (activeTab === 'active') filters.completed = 'false';
    fetchTasks(filters);
  };

  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const regularTasks = tasks.filter((t) => !overdueTasks.includes(t));

  return (
    <>
      <Navbar onQuickAdd={() => setShowForm(true)} />
      <div className="animate-fade-in">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-bg-secondary rounded-2xl w-fit">
          {(['active', 'all', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick add */}
        <form onSubmit={handleQuickAdd} className="mb-6">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-bg-secondary border border-border rounded-[10px] focus-within:border-neon transition-colors duration-200">
            <Plus size={16} className="text-text-tertiary" />
            <input
              type="text"
              placeholder="Quick add task (press Enter)..."
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-primary text-sm outline-none placeholder:text-text-tertiary"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-bg-secondary border border-border rounded-[10px] max-w-[360px] text-text-secondary focus-within:border-neon transition-colors duration-200">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-primary text-sm outline-none placeholder:text-text-tertiary"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${!priorityFilter ? 'bg-neon/8 border border-neon text-neon' : 'bg-bg-secondary border border-border text-text-secondary hover:border-border-neon'}`}
              onClick={() => setPriorityFilter('')}
            >
              All
            </button>
            {[
              { value: 'urgent', label: '🔴 Urgent', color: '#FF3B3B' },
              { value: 'high', label: '🟠 High', color: '#FF8C00' },
              { value: 'medium', label: '🟡 Medium', color: '#FFB800' },
              { value: 'low', label: '🟢 Low', color: '#39FF14' },
            ].map(({ value, label, color }) => (
              <button
                key={value}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${priorityFilter === value ? 'bg-neon/8 border text-neon' : 'bg-bg-secondary border border-border text-text-secondary hover:border-border-neon'}`}
                onClick={() => setPriorityFilter(priorityFilter === value ? '' : value)}
                style={priorityFilter === value ? { borderColor: color, color } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-4 opacity-50">✅</span>
            <h3 className="text-text-primary font-semibold mb-2">{search || priorityFilter ? 'No tasks found' : 'No tasks yet'}</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-[400px]">{search || priorityFilter ? 'Try adjusting your filters' : 'Create your first task or use quick-add above'}</p>
            {!search && !priorityFilter && (
              <Button variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={18} />}>Create Task</Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overdue section */}
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-danger mb-2 flex items-center gap-1.5">
                  ⚠️ Overdue ({overdueTasks.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {overdueTasks.map((task, i) => (
                    <div key={task._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <TaskCard task={task} onEdit={handleEdit} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular tasks */}
            <div className="flex flex-col gap-2">
              {regularTasks.map((task, i) => (
                <div key={task._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <TaskCard task={task} onEdit={handleEdit} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-neon text-black flex items-center justify-center neon-glow-strong cursor-pointer transition-all duration-200 z-50 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_40px_rgba(57,255,20,0.5),0_0_80px_rgba(57,255,20,0.2)] animate-pop-in max-md:bottom-[calc(64px+16px)] max-md:right-4"
          onClick={() => setShowForm(true)}
          title="Create new task"
        >
          <Plus size={24} />
        </button>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleCloseForm} title={editingTask ? 'Edit Task' : 'Create Task'} size="md">
          <TaskForm task={editingTask} onClose={handleCloseForm} />
        </Modal>
      </div>
    </>
  );
};

export default Tasks;
