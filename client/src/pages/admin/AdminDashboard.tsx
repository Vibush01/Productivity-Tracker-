import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useProgramStore } from '../../store/programStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { formatDisplayDate } from '../../utils/dateUtils';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { programs, fetchAdminPrograms, createProgram, updateProgram, deleteProgram } = useProgramStore();
  const { showToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [icon, setIcon] = useState('🏆');
  const [color, setColor] = useState('#39FF14');
  const [habitToTrack, setHabitToTrack] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  useEffect(() => { fetchAdminPrograms(); }, []);

  if (user?.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <span className="text-5xl">🔒</span>
          <h2 className="text-2xl font-bold">Admin Access Required</h2>
          <p className="text-text-secondary">You need admin permissions to view this page</p>
        </div>
      </>
    );
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setRules(''); setIcon('🏆');
    setColor('#39FF14'); setHabitToTrack(''); setStartDate(''); setEndDate('');
    setMaxParticipants(''); setEditingId(null); setShowForm(false);
  };

  const handleEdit = (program: any) => {
    setEditingId(program._id);
    setTitle(program.title);
    setDescription(program.description);
    setRules(program.rules || '');
    setIcon(program.icon);
    setColor(program.color);
    setHabitToTrack(program.habitToTrack);
    setStartDate(new Date(program.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(program.endDate).toISOString().split('T')[0]);
    setMaxParticipants(program.maxParticipants?.toString() || '');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title || !description || !habitToTrack || !startDate || !endDate) {
      showToast('error', 'Fill all required fields'); return;
    }
    try {
      const data = {
        title, description, rules, icon, color, habitToTrack,
        startDate, endDate,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      };
      if (editingId) {
        await updateProgram(editingId, data);
        showToast('success', 'Program updated');
      } else {
        await createProgram(data);
        showToast('success', 'Program created');
      }
      resetForm();
      fetchAdminPrograms();
    } catch {
      showToast('error', 'Failed to save program');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this program? All participant data will be lost.')) return;
    try {
      await deleteProgram(id);
      showToast('info', 'Program deleted');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const handleToggle = async (program: any) => {
    try {
      await updateProgram(program._id, { isActive: !program.isActive });
      showToast('info', `Program ${program.isActive ? 'deactivated' : 'activated'}`);
      fetchAdminPrograms();
    } catch {
      showToast('error', 'Failed to toggle');
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">🛡️ Admin Panel</h2>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} icon={<Plus size={16} />}>
            New Program
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-sm:grid-cols-1">
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
            <span className="text-2xl font-bold font-mono text-neon">{programs.length}</span>
            <span className="block text-xs text-text-tertiary mt-1">Total Programs</span>
          </div>
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
            <span className="text-2xl font-bold font-mono text-neon">{programs.filter((p) => p.isActive).length}</span>
            <span className="block text-xs text-text-tertiary mt-1">Active Programs</span>
          </div>
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 text-center">
            <span className="text-2xl font-bold font-mono text-neon">
              {programs.reduce((sum, p) => sum + ((p as any).participantCount || 0), 0)}
            </span>
            <span className="block text-xs text-text-tertiary mt-1">Total Participants</span>
          </div>
        </div>

        {/* Program list */}
        <div className="space-y-3">
          {programs.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <span className="text-4xl block mb-3">🏆</span>
              <p>No programs created yet</p>
            </div>
          ) : (
            programs.map((program, i) => (
              <div
                key={program._id}
                className={`bg-bg-secondary border rounded-2xl p-5 transition-all duration-200 animate-slide-up ${program.isActive ? 'border-border hover:border-border-neon' : 'border-border opacity-60'}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{program.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text-primary">{program.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${program.isActive ? 'bg-neon/10 text-neon' : 'bg-bg-tertiary text-text-tertiary'}`}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                      <span>{formatDisplayDate(program.startDate)} → {formatDisplayDate(program.endDate)}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {(program as any).participantCount || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-neon transition-all duration-200" onClick={() => handleToggle(program)}>
                      {program.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200" onClick={() => handleEdit(program)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-danger transition-all duration-200" onClick={() => handleDelete(program._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit form modal */}
      {showForm && (
        <Modal isOpen={true} title={editingId ? 'Edit Program' : 'Create Program'} onClose={resetForm} size="lg">
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                className="w-16 py-2.5 bg-bg-tertiary border border-border rounded-[10px] text-center text-2xl outline-none focus:border-neon transition-colors"
                value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏆"
              />
              <input
                className="flex-1 py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors placeholder:text-text-tertiary/50"
                placeholder="Program title *" value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <textarea
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors placeholder:text-text-tertiary/50 resize-none min-h-[100px]"
              placeholder="Description *" value={description} onChange={(e) => setDescription(e.target.value)}
            />
            <textarea
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors placeholder:text-text-tertiary/50 resize-none min-h-[80px]"
              placeholder="Rules (optional)" value={rules} onChange={(e) => setRules(e.target.value)}
            />
            <input
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors placeholder:text-text-tertiary/50"
              placeholder="Habit to track (e.g., 'Do 50 push-ups daily') *" value={habitToTrack} onChange={(e) => setHabitToTrack(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Start Date *</label>
                <input type="date" className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">End Date *</label>
                <input type="date" className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Color</label>
                <input type="color" className="w-full h-10 bg-bg-tertiary border border-border rounded-[10px] cursor-pointer" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Max Participants</label>
                <input type="number" className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors" placeholder="Unlimited" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
              </div>
            </div>
            <Button fullWidth onClick={handleSubmit}>
              {editingId ? 'Update Program' : 'Create Program'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminDashboard;
