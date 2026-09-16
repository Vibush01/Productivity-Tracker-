import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useRoutineStore } from '../store/routineStore';
import RoutineCard from '../components/routines/RoutineCard';
import RoutineForm from '../components/routines/RoutineForm';
import RoutinePlayer from '../components/routines/RoutinePlayer';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Navbar from '../components/common/Navbar';
import type { Routine } from '../types';

const timeOfDayOrder = ['morning', 'afternoon', 'evening', 'night'];
const timeOfDayLabels: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
  night: '🌙 Night',
};

const Routines: React.FC = () => {
  const { routines, fetchRoutines, isLoading } = useRoutineStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [playingRoutine, setPlayingRoutine] = useState<Routine | null>(null);

  useEffect(() => { fetchRoutines(); }, []);

  const handleEdit = (routine: Routine) => { setEditingRoutine(routine); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingRoutine(null); fetchRoutines(); };

  // Group routines by timeOfDay
  const grouped = timeOfDayOrder.reduce((acc, tod) => {
    const items = routines.filter((r) => r.timeOfDay === tod);
    if (items.length > 0) acc[tod] = items;
    return acc;
  }, {} as Record<string, Routine[]>);

  return (
    <>
      <Navbar onQuickAdd={() => setShowForm(true)} />
      <div className="animate-fade-in">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
          </div>
        ) : routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-4 opacity-50">📋</span>
            <h3 className="text-text-primary font-semibold mb-2">No routines yet</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-[400px]">
              Create a routine to group habits and tasks into a guided sequence
            </p>
            <Button variant="primary" onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
              Create Routine
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([tod, items]) => (
              <div key={tod}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {timeOfDayLabels[tod]}
                  <span className="text-xs font-mono text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">{items.length}</span>
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {items.map((routine, i) => (
                    <div key={routine._id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <RoutineCard
                        routine={routine}
                        onEdit={handleEdit}
                        onPlay={(r) => setPlayingRoutine(r)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-neon text-black flex items-center justify-center neon-glow-strong cursor-pointer transition-all duration-200 z-50 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_40px_rgba(57,255,20,0.5),0_0_80px_rgba(57,255,20,0.2)] animate-pop-in max-md:bottom-[calc(64px+16px)] max-md:right-4"
          onClick={() => setShowForm(true)}
          title="Create new routine"
        >
          <Plus size={24} />
        </button>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleCloseForm} title={editingRoutine ? 'Edit Routine' : 'Create Routine'} size="lg">
          <RoutineForm routine={editingRoutine} onClose={handleCloseForm} />
        </Modal>

        {/* Player */}
        {playingRoutine && (
          <RoutinePlayer routine={playingRoutine} onClose={() => { setPlayingRoutine(null); fetchRoutines(); }} />
        )}
      </div>
    </>
  );
};

export default Routines;
