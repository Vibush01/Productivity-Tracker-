import React, { useEffect, useState } from 'react';
import { Users, Calendar, ArrowRight, LogOut, Search } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useProgramStore } from '../store/programStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { formatDisplayDate } from '../utils/dateUtils';

type Tab = 'browse' | 'my';

const Programs: React.FC = () => {
  const { programs, myPrograms, fetchPrograms, fetchMyPrograms, joinProgram, leaveProgram } = useProgramStore();
  const { habits, fetchHabits } = useHabitStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [search, setSearch] = useState('');
  const [joinModal, setJoinModal] = useState<string | null>(null);
  const [linkedHabitId, setLinkedHabitId] = useState('');

  useEffect(() => {
    fetchPrograms();
    fetchMyPrograms();
    fetchHabits();
  }, []);

  const handleJoin = async () => {
    if (!joinModal) return;
    try {
      await joinProgram(joinModal, linkedHabitId || undefined);
      showToast('success', '🎉 Joined the program!');
      setJoinModal(null);
      setLinkedHabitId('');
      fetchMyPrograms();
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to join');
    }
  };

  const handleLeave = async (id: string) => {
    if (!window.confirm('Leave this program?')) return;
    try {
      await leaveProgram(id);
      showToast('info', 'Left the program');
    } catch {
      showToast('error', 'Failed to leave program');
    }
  };

  const filteredPrograms = programs.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-1 p-1 bg-bg-secondary rounded-2xl">
            {(['browse', 'my'] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${activeTab === tab ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'browse' ? '🏆 Browse Programs' : '📋 My Programs'}
              </button>
            ))}
          </div>

          {activeTab === 'browse' && (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                className="pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-[10px] text-sm text-text-primary outline-none focus:border-neon transition-colors duration-200 w-[240px]"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            {filteredPrograms.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-text-tertiary">
                <span className="text-4xl block mb-3">🏆</span>
                <p>No programs available yet</p>
              </div>
            ) : (
              filteredPrograms.map((program, i) => {
                const daysLeft = getDaysLeft(program.endDate);
                return (
                  <div
                    key={program._id}
                    className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-border-neon transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{program.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-primary text-lg">{program.title}</h3>
                        <p className="text-text-secondary text-sm line-clamp-2 mt-0.5">{program.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
                      <span className="flex items-center gap-1"><Users size={12} /> {program.participantCount || 0}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDisplayDate(program.startDate)}</span>
                      {daysLeft > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-neon/10 text-neon font-semibold">
                          {daysLeft}d left
                        </span>
                      )}
                    </div>

                    <div className="px-3 py-2 bg-bg-tertiary rounded-[10px] text-xs text-text-secondary mb-4">
                      📌 {program.habitToTrack}
                    </div>

                    {program.isJoined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neon font-semibold flex-1">✅ Joined</span>
                        <button
                          className="text-xs text-text-tertiary hover:text-danger flex items-center gap-1 transition-colors"
                          onClick={() => handleLeave(program._id)}
                        >
                          <LogOut size={12} /> Leave
                        </button>
                      </div>
                    ) : (
                      <Button size="sm" fullWidth onClick={() => setJoinModal(program._id)} icon={<ArrowRight size={14} />}>
                        Join Program
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* My Programs Tab */}
        {activeTab === 'my' && (
          <div className="space-y-3">
            {myPrograms.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                <span className="text-4xl block mb-3">📋</span>
                <p>You haven't joined any programs yet</p>
                <button className="text-neon text-sm mt-2 hover:underline" onClick={() => setActiveTab('browse')}>
                  Browse Programs →
                </button>
              </div>
            ) : (
              myPrograms.map((participation, i) => {
                const prog = participation.programId as any;
                if (!prog?._id) return null;
                return (
                  <div
                    key={participation._id}
                    className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-border-neon transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{prog.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-primary">{prog.title}</h3>
                        <span className="text-xs text-text-tertiary">Joined {formatDisplayDate(participation.joinedAt)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono text-neon">{participation.currentStreak}</span>
                        <span className="block text-[10px] text-text-tertiary">🔥 streak</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon rounded-full transition-[width] duration-500"
                          style={{ width: `${participation.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-secondary">{participation.completionRate}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {joinModal && (
        <Modal isOpen={true} title="Join Program" onClose={() => { setJoinModal(null); setLinkedHabitId(''); }}>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Optionally link one of your habits to track progress in this program:</p>
            <select
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200"
              value={linkedHabitId}
              onChange={(e) => setLinkedHabitId(e.target.value)}
            >
              <option value="">No linked habit</option>
              {habits.filter((h) => !h.isArchived).map((h) => (
                <option key={h._id} value={h._id}>{h.icon} {h.title}</option>
              ))}
            </select>
            <Button fullWidth onClick={handleJoin}>Join Program</Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Programs;
