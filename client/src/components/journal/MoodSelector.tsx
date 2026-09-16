import React from 'react';
import { MOOD_CONFIG } from '../../utils/constants';

interface MoodSelectorProps {
  value: string;
  onChange: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  const moods = Object.entries(MOOD_CONFIG);

  return (
    <div className="flex items-center gap-2">
      {moods.map(([key, config]) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all duration-200 ${
              isSelected
                ? 'bg-bg-tertiary scale-110'
                : 'hover:bg-bg-tertiary/50 opacity-50 hover:opacity-80'
            }`}
            style={isSelected ? { boxShadow: `0 0 15px ${config.color}30` } : undefined}
            onClick={() => onChange(key)}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className={`text-[10px] font-medium ${isSelected ? 'text-text-primary' : 'text-text-tertiary'}`}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
