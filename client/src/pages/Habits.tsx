import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Navbar from '../components/common/Navbar';
import type { Habit } from '../types';

const Habits: React.FC = () => {
  const { habits, fetchHabits, categories, fetchCategories, isLoading } = useHabitStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchHabits(activeTab === 'archived');
    fetchCategories();
  }, [activeTab]);

  const handleEdit = (habit: Habit) => { setEditingHabit(habit); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingHabit(null); fetchHabits(activeTab === 'archived'); };

  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || (h.category as any)?._id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar onQuickAdd={() => setShowForm(true)} />
      <div className="animate-fade-in">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-bg-secondary rounded-2xl w-fit">
          {(['active', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 flex items-center gap-1.5 capitalize ${activeTab === tab ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'active' && activeTab === 'active' && (
                <span className="text-xs font-mono">{habits.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-bg-secondary border border-border rounded-[10px] max-w-[360px] text-text-secondary focus-within:border-neon transition-colors duration-200">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search habits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-primary text-sm outline-none placeholder:text-text-tertiary"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              className={`px-3.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${!categoryFilter ? 'bg-neon/8 border border-neon text-neon' : 'bg-bg-secondary border border-border text-text-secondary hover:border-border-neon hover:text-text-primary'}`}
              onClick={() => setCategoryFilter('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`px-3.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${categoryFilter === cat._id ? 'bg-neon/8 border border-neon text-neon' : 'bg-bg-secondary border border-border text-text-secondary hover:border-border-neon hover:text-text-primary'}`}
                onClick={() => setCategoryFilter(categoryFilter === cat._id ? '' : cat._id)}
                style={categoryFilter === cat._id ? { borderColor: cat.color, color: cat.color } : undefined}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-4 opacity-50">🎯</span>
            <h3 className="text-text-primary font-semibold mb-2">{search || categoryFilter ? 'No habits found' : 'No habits yet'}</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-[400px]">{search || categoryFilter ? 'Try adjusting your filters' : 'Create your first habit to start building streaks'}</p>
            {!search && !categoryFilter && (
              <Button variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={18} />}>Create Habit</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredHabits.map((habit, i) => (
              <div key={habit._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <HabitCard habit={habit} onEdit={handleEdit} />
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-neon text-black flex items-center justify-center neon-glow-strong cursor-pointer transition-all duration-200 z-50 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_40px_rgba(57,255,20,0.5),0_0_80px_rgba(57,255,20,0.2)] animate-pop-in max-md:bottom-[calc(64px+16px)] max-md:right-4"
          onClick={() => setShowForm(true)}
          title="Create new habit"
        >
          <Plus size={24} />
        </button>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleCloseForm} title={editingHabit ? 'Edit Habit' : 'Create Habit'} size="md">
          <HabitForm habit={editingHabit} onClose={handleCloseForm} />
        </Modal>
      </div>
    </>
  );
};

export default Habits;
