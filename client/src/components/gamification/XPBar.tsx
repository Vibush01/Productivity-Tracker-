import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

// XP curve matching server
const XP_CURVE = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3800, 5200];

const getXPForLevel = (level: number) => XP_CURVE[Math.min(level - 1, XP_CURVE.length - 1)] || 0;
const getXPForNextLevel = (level: number) => XP_CURVE[Math.min(level, XP_CURVE.length - 1)] || XP_CURVE[XP_CURVE.length - 1];

const XPBar: React.FC<XPBarProps> = ({ xp, level, compact = false }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const percentage = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-neon/10 border-[1.5px] border-neon flex items-center justify-center">
          <span className="text-[10px] font-bold text-neon">{level}</span>
        </div>
        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-neon rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-text-tertiary">{xpInLevel}/{xpNeeded}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center shrink-0 relative">
        <span className="text-sm font-bold text-neon">{level}</span>
        <Zap size={10} className="absolute -top-0.5 -right-0.5 text-neon" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-text-secondary">Level {level}</span>
          <span className="text-xs font-mono text-text-tertiary">{xpInLevel} / {xpNeeded} XP</span>
        </div>
        <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out neon-glow"
            style={{
              width: `${animatedWidth}%`,
              background: 'linear-gradient(90deg, #39FF14, #00FF88)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default XPBar;
