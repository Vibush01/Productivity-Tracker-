import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setShow(true), 50);
    // Generate particles
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 1.5,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(57, 255, 20, ${0.3 + Math.random() * 0.5})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(57, 255, 20, 0.5)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 p-10 transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
      >
        <button
          className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Level badge */}
        <div className="w-28 h-28 rounded-full border-4 border-neon flex items-center justify-center bg-bg-secondary neon-glow animate-pulse">
          <span className="text-4xl font-bold text-neon">{newLevel}</span>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-neon tracking-wider mb-2" style={{ textShadow: '0 0 30px rgba(57, 255, 20, 0.5)' }}>
            LEVEL UP!
          </h2>
          <p className="text-text-secondary">You've reached Level {newLevel}</p>
          <p className="text-xs text-text-tertiary mt-1">Keep pushing — consistency is your superpower 🚀</p>
        </div>

        <Button onClick={onClose} className="min-w-[160px]">Continue</Button>
      </div>
    </div>
  );
};

export default LevelUpModal;
