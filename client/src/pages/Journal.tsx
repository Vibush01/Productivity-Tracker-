import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Trash2, Edit3, Tag } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import MoodSelector from '../components/journal/MoodSelector';
import { useJournalStore } from '../store/journalStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { formatDisplayDate, timeAgo } from '../utils/dateUtils';
import { MOOD_CONFIG } from '../utils/constants';

const Journal: React.FC = () => {
  const { entries, moodStats, fetchEntries, createEntry, updateEntry, deleteEntry, fetchMoodStats } = useJournalStore();
  const { habits, fetchHabits } = useHabitStore();
  const { showToast } = useUIStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('okay');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [linkedHabits, setLinkedHabits] = useState<string[]>([]);

  useEffect(() => {
    fetchEntries();
    fetchMoodStats();
    fetchHabits();
  }, []);

  const resetForm = () => {
    setTitle(''); setContent(''); setMood('okay'); setTags([]); setTagInput(''); setLinkedHabits([]);
    setEditingId(null); setShowEditor(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) { showToast('error', 'Write something in your journal!'); return; }
    try {
      if (editingId) {
        await updateEntry(editingId, { title, content, mood, tags, linkedHabits });
        showToast('success', '📝 Entry updated');
      } else {
        const result = await createEntry({ date: new Date(), title, content, mood, tags, linkedHabits });
        showToast('success', `📝 Journal saved! +${result.xpGained} XP`);
        if (result.leveledUp) showToast('success', `🎉 Level Up! Level ${result.newLevel}!`);
      }
      resetForm();
      fetchEntries();
      fetchMoodStats();
    } catch {
      showToast('error', 'Failed to save entry');
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry._id);
    setTitle(entry.title || '');
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags);
    setLinkedHabits(entry.linkedHabits?.map((h: any) => h._id) || []);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry(id);
    showToast('info', 'Entry deleted');
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterMood && e.mood !== filterMood) return false;
    if (search) {
      const s = search.toLowerCase();
      return (e.title?.toLowerCase().includes(s) || e.content.toLowerCase().includes(s) || e.tags.some((t) => t.toLowerCase().includes(s)));
    }
    return true;
  });

  // Mood chart (simple bar)
  const moodOrder = ['great', 'good', 'okay', 'bad', 'terrible'] as const;
  const totalMoods = moodStats?.distribution.reduce((sum, m) => sum + m.count, 0) || 1;

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-bold">📓 Journal</h2>
          <Button size="sm" onClick={() => { resetForm(); setShowEditor(true); }} icon={<Plus size={16} />}>
            New Entry
          </Button>
        </div>

        {/* Mood overview */}
        {moodStats && moodStats.distribution.length > 0 && (
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-6">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Mood (Last 30 Days)</h3>
            <div className="flex gap-2">
              {moodOrder.map((moodKey) => {
                const moodConf = MOOD_CONFIG[moodKey];
                const entry = moodStats.distribution.find((m) => m._id === moodKey);
                const count = entry?.count || 0;
                const pct = (count / totalMoods) * 100;
                return (
                  <div key={moodKey} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-lg">{moodConf.emoji}</span>
                    <div className="w-full h-[60px] bg-bg-tertiary rounded-lg relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                        style={{ height: `${Math.max(pct, 5)}%`, background: `${moodConf.color}40` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-[10px] text-sm text-text-primary outline-none focus:border-neon transition-colors duration-200"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            <button
              className={`px-3 py-2 rounded-[10px] text-xs font-medium transition-all duration-200 ${!filterMood ? 'bg-bg-tertiary text-neon' : 'text-text-tertiary hover:text-text-primary'}`}
              onClick={() => setFilterMood('')}
            >
              All
            </button>
            {moodOrder.map((m) => (
              <button
                key={m}
                className={`px-2 py-2 rounded-[10px] text-sm transition-all duration-200 ${filterMood === m ? 'bg-bg-tertiary scale-110' : 'opacity-50 hover:opacity-80'}`}
                onClick={() => setFilterMood(filterMood === m ? '' : m)}
              >
                {MOOD_CONFIG[m].emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Entries list */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <span className="text-4xl block mb-3">📓</span>
            <p>{search || filterMood ? 'No entries match your filters' : 'No journal entries yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, i) => {
              const moodConf = MOOD_CONFIG[entry.mood];
              return (
                <div
                  key={entry._id}
                  className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-border-neon transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{moodConf.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {entry.title && <h3 className="font-semibold text-text-primary">{entry.title}</h3>}
                        <span className="text-xs text-text-tertiary">{formatDisplayDate(entry.date)} · {timeAgo(entry.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-3">{entry.content}</p>

                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-bg-tertiary rounded-full text-[10px] text-text-tertiary flex items-center gap-0.5">
                              <Tag size={8} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-tertiary hover:text-danger transition-all duration-200"
                        onClick={() => handleDelete(entry._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <Modal isOpen={true} title={editingId ? 'Edit Entry' : 'New Journal Entry'} onClose={resetForm} size="lg">
          <div className="space-y-5">
            {/* Mood */}
            <div>
              <label className="block text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">How are you feeling?</label>
              <MoodSelector value={mood} onChange={setMood} />
            </div>

            {/* Title */}
            <input
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-lg font-semibold outline-none focus:border-neon transition-colors duration-200 placeholder:text-text-tertiary/50"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Content */}
            <textarea
              className="w-full py-3 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200 placeholder:text-text-tertiary/50 resize-none min-h-[200px]"
              placeholder="What's on your mind today..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Tags */}
            <div>
              <label className="block text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-bg-tertiary rounded-full text-xs text-text-secondary flex items-center gap-1">
                    {tag}
                    <button className="hover:text-danger" onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 py-2 px-3 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button size="sm" variant="secondary" onClick={addTag}>Add</Button>
              </div>
            </div>

            {/* Linked habits */}
            <div>
              <label className="block text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">Link Habits</label>
              <div className="flex flex-wrap gap-1.5">
                {habits.filter((h) => !h.isArchived).map((h) => {
                  const isLinked = linkedHabits.includes(h._id);
                  return (
                    <button
                      key={h._id}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        isLinked ? 'bg-neon/15 text-neon border border-neon' : 'bg-bg-tertiary text-text-secondary border border-border hover:border-border-neon'
                      }`}
                      onClick={() => setLinkedHabits(isLinked ? linkedHabits.filter((id) => id !== h._id) : [...linkedHabits, h._id])}
                    >
                      {h.icon} {h.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button fullWidth onClick={handleSubmit}>
              {editingId ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Journal;
