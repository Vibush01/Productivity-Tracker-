import React, { useEffect, useState } from 'react';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useProgramStore } from '../store/programStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { LeaderboardEntry } from '../types';

type Tab = 'global' | 'weekly' | 'programs';

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold, silver, bronze

const Leaderboard: React.FC = () => {
  const { myPrograms, fetchMyPrograms } = useProgramStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchMyPrograms(); }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, selectedProgram]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      let res;
      if (activeTab === 'global') {
        res = await api.get('/leaderboard/global');
      } else if (activeTab === 'weekly') {
        res = await api.get('/leaderboard/weekly');
      } else if (activeTab === 'programs' && selectedProgram) {
        res = await api.get(`/leaderboard/program/${selectedProgram}`);
      } else {
        setIsLoading(false);
        return;
      }

      if (res.data.success) {
        setRankings(res.data.data.rankings || []);
        setMyRank(res.data.data.myRank || null);
        setMyScore(res.data.data.myScore || 0);
      }
    } catch {
      setRankings([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[800px] mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-secondary rounded-2xl w-fit mx-auto mb-8">
          {([
            { key: 'global' as Tab, label: '🌍 Global' },
            { key: 'weekly' as Tab, label: '📅 Weekly' },
            { key: 'programs' as Tab, label: '🏆 Programs' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              className={`px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${activeTab === key ? 'bg-bg-tertiary text-neon' : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Program selector */}
        {activeTab === 'programs' && (
          <div className="mb-6">
            <select
              className="w-full py-2.5 px-3.5 bg-bg-secondary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">Select a program...</option>
              {myPrograms.map((mp) => {
                const prog = mp.programId as any;
                return prog?._id ? (
                  <option key={prog._id} value={prog._id}>{prog.icon} {prog.title}</option>
                ) : null;
              })}
            </select>
          </div>
        )}

        {/* My rank card */}
        {myRank && (
          <div className="bg-bg-secondary border border-neon rounded-2xl p-5 mb-6 flex items-center gap-4 neon-glow animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center">
              <span className="text-xl font-bold text-neon">#{myRank}</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-text-primary">Your Rank</span>
              <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                <span className="flex items-center gap-1"><TrendingUp size={12} /> Score: {myScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* Podium (top 3) */}
        {rankings.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8 h-[200px]">
            {[1, 0, 2].map((pos) => {
              const entry = rankings[pos];
              if (!entry) return null;
              const height = pos === 0 ? 160 : pos === 1 ? 120 : 100;
              return (
                <div key={pos} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${pos * 100}ms` }}>
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary border-2 flex items-center justify-center mb-1 text-lg" style={{ borderColor: PODIUM_COLORS[pos] }}>
                    {entry.avatar ? entry.avatar.charAt(0).toUpperCase() : entry.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-text-primary font-medium text-center max-w-[80px] truncate">{entry.name}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">{entry.score}</span>
                  <div
                    className="w-[80px] rounded-t-[10px] mt-2 flex items-end justify-center pb-2"
                    style={{
                      height: `${height}px`,
                      background: `${PODIUM_COLORS[pos]}15`,
                      borderTop: `3px solid ${PODIUM_COLORS[pos]}`,
                    }}
                  >
                    <span className="text-2xl font-bold" style={{ color: PODIUM_COLORS[pos] }}>
                      {pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rankings table */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <Trophy size={48} className="mx-auto mb-3 opacity-30" />
            <p>No rankings yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.slice(3).map((entry, i) => {
              const isMe = entry.userId === user?._id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 animate-slide-up ${
                    isMe ? 'bg-neon/5 border border-neon' : 'bg-bg-secondary border border-border hover:border-border-neon'
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="text-sm font-mono font-bold text-text-tertiary w-8">#{entry.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-primary">
                    {entry.isAnonymous ? '?' : entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isMe ? 'text-neon' : 'text-text-primary'}`}>
                      {entry.name} {isMe && '(You)'}
                    </span>
                    <span className="text-xs text-text-tertiary ml-2">Lv.{entry.level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-warning"><Flame size={12} /> {entry.bestStreak || entry.currentStreak || 0}</span>
                    <span className="font-mono font-bold text-neon">{entry.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
