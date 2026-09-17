import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import AchievementCard from '../components/gamification/AchievementCard';
import type { Achievement } from '../components/gamification/AchievementCard';
import api from '../services/api';

type Rarity = 'all' | 'common' | 'rare' | 'epic' | 'legendary';

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Rarity>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // First check for new achievements
        await api.post('/achievements/check');
        // Then fetch all
        const { data } = await api.get('/achievements');
        if (data.success) {
          setAchievements(data.data.achievements);
          setUnlocked(data.data.unlocked);
          setTotal(data.data.total);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.rarity === filter);

  // Sort: unlocked first, then by rarity order
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award size={24} className="text-neon" /> Achievements
          </h2>
          <span className="text-sm text-text-secondary font-mono">{unlocked}/{total}</span>
        </div>

        {/* Progress bar */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">Overall Progress</span>
            <span className="text-sm font-mono text-neon">{percentage}%</span>
          </div>
          <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #39FF14, #00FF88, #A855F7, #FFD700)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-text-tertiary">
            <span>🟢 Common</span>
            <span>🔵 Rare</span>
            <span>🟣 Epic</span>
            <span>✨ Legendary</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 p-1 bg-bg-secondary rounded-2xl w-fit mb-6">
          {(['all', 'common', 'rare', 'epic', 'legendary'] as Rarity[]).map((r) => (
            <button
              key={r}
              className={`px-4 py-2 rounded-[10px] text-xs font-medium transition-all duration-200 capitalize ${
                filter === r ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setFilter(r)}
            >
              {r === 'all' ? '🏆 All' : r === 'common' ? '🟢 Common' : r === 'rare' ? '🔵 Rare' : r === 'epic' ? '🟣 Epic' : '✨ Legendary'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-[160px] rounded-2xl" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <Award size={48} className="mx-auto mb-3 opacity-30" />
            <p>No achievements in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {sorted.map((achievement, i) => (
              <div key={achievement.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                <AchievementCard achievement={achievement} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Achievements;
