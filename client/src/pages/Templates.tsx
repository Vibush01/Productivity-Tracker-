import React, { useEffect, useState } from 'react';
import { PackagePlus, Check, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import { useUIStore } from '../store/uiStore';
import { useHabitStore } from '../store/habitStore';
import api from '../services/api';

interface HabitTemplate {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface TemplatePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  habits: HabitTemplate[];
}

const Templates: React.FC = () => {
  const { showToast } = useUIStore();
  const { fetchHabits } = useHabitStore();
  const [packs, setPacks] = useState<TemplatePack[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/habits/templates');
        if (data.success) setPacks(data.data);
      } catch { /* ignore */ } finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleImport = async (packId: string) => {
    setImporting(packId);
    try {
      const { data } = await api.post(`/habits/templates/${packId}/import`);
      if (data.success) {
        showToast('success', `✅ Imported ${data.data.imported} habits!`);
        setImported((prev) => new Set(prev).add(packId));
        fetchHabits();
      }
    } catch {
      showToast('error', 'Failed to import template');
    } finally {
      setImporting(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[900px] mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
            <PackagePlus size={24} className="text-neon" /> Habit Templates
          </h2>
          <p className="text-sm text-text-secondary">Pre-built habit packs to kickstart your journey. One click to import.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-[200px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {packs.map((pack, i) => (
              <div
                key={pack.id}
                className="bg-bg-secondary border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:border-border-neon animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Pack header */}
                <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${pack.color}15` }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: `${pack.color}15` }}
                    >
                      {pack.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">{pack.name}</h3>
                      <p className="text-xs text-text-secondary">{pack.description}</p>
                    </div>
                  </div>
                  {imported.has(pack.id) ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-neon/10 text-neon text-xs font-semibold">
                      <Check size={14} /> Imported
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleImport(pack.id)}
                      loading={importing === pack.id}
                      icon={<ArrowRight size={14} />}
                    >
                      Import {pack.habits.length} habits
                    </Button>
                  )}
                </div>

                {/* Habit preview grid */}
                <div className="px-5 py-3 flex flex-wrap gap-2">
                  {pack.habits.map((habit) => (
                    <div
                      key={habit.title}
                      className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-[10px] text-xs"
                    >
                      <span>{habit.icon}</span>
                      <span className="text-text-primary font-medium">{habit.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Templates;
