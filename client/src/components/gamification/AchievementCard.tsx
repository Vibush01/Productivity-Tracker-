import React from 'react';
import { Lock } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

const RARITY_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  common: { border: 'border-neon/50', bg: 'bg-neon/5', label: 'Common' },
  rare: { border: 'border-info/50', bg: 'bg-info/5', label: 'Rare' },
  epic: { border: 'border-rarity-epic/50', bg: 'bg-rarity-epic/5', label: 'Epic' },
  legendary: { border: 'border-rarity-legendary/50', bg: 'bg-rarity-legendary/5', label: 'Legendary' },
};

const RARITY_COLORS: Record<string, string> = {
  common: '#39FF14',
  rare: '#00D1FF',
  epic: '#A855F7',
  legendary: '#FFD700',
};

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const style = RARITY_STYLES[achievement.rarity];
  const color = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
        isUnlocked
          ? `${style.bg} ${style.border} hover:scale-105`
          : 'bg-bg-tertiary border-border opacity-50 grayscale'
      }`}
      style={isUnlocked ? { boxShadow: `0 0 20px ${color}15` } : undefined}
    >
      {/* Rarity badge */}
      <span
        className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
        style={{ color, background: `${color}15` }}
      >
        {style.label}
      </span>

      {/* Icon */}
      <div className="text-3xl mb-1">
        {isUnlocked ? achievement.icon : <Lock size={28} className="text-text-tertiary" />}
      </div>

      {/* Name */}
      <span className={`text-xs font-semibold text-center ${isUnlocked ? 'text-text-primary' : 'text-text-tertiary'}`}>
        {isUnlocked ? achievement.name : '???'}
      </span>

      {/* Description */}
      <span className="text-[10px] text-text-tertiary text-center line-clamp-2">
        {isUnlocked ? achievement.description : 'Keep going to unlock!'}
      </span>

      {/* Unlock date */}
      {isUnlocked && achievement.unlockedAt && (
        <span className="text-[9px] text-text-tertiary mt-auto">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default AchievementCard;
