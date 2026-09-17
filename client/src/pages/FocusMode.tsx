import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Check, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

const FocusMode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUIStore();
  
  // State from location (e.g., passed from Tasks or Habits page)
  const itemTitle = String(location.state?.title || 'Deep Work Session');
  const itemType = String(location.state?.type || 'Session');
  const initialTime = Number(location.state?.duration || 25 * 60);

  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgMode, setBgMode] = useState<'deep' | 'flow' | 'zen'>('deep');

  // Handle countdown
  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      showToast('success', 'Focus session completed! 🎉');
      if (soundEnabled) {
        // Play a simple chime sound if possible
        const audio = new Audio('/chime.mp3'); // Assuming we have or will have this
        audio.play().catch(() => {});
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, soundEnabled, showToast]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsRunning((prev) => !prev);
    } else if (e.code === 'Enter') {
      e.preventDefault();
      handleComplete();
    } else if (e.code === 'Escape') {
      if (!document.fullscreenElement) {
        handleExit();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleComplete = () => {
    // Logic to actually complete the task/habit can go here if we pass the ID
    showToast('success', `${itemType} completed!`);
    handleExit();
  };

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bgClasses = {
    deep: 'bg-bg-primary text-text-primary',
    flow: 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white',
    zen: 'bg-[#002200] text-neon', // Dark green tint
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center relative transition-colors duration-1000 ${bgClasses[bgMode]}`}>
      {/* Top Controls */}
      <div className="absolute top-6 w-full px-8 flex items-center justify-between z-10">
        <button onClick={handleExit} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex bg-black/20 rounded-full p-1 backdrop-blur-sm">
            {(['deep', 'flow', 'zen'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBgMode(mode)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  bgMode === mode ? 'bg-white/20 shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} opacity={0.5} />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-white/10 transition-colors hidden md:block">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 animate-slide-up">
        <div className="text-sm font-semibold tracking-widest uppercase mb-4 opacity-80 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isRunning ? 'bg-neon shadow-[0_0_8px_rgba(57,255,20,0.8)]' : 'bg-warning'}`} />
          {isRunning ? 'Focusing' : 'Paused'}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center max-w-[800px] px-6">
          {itemTitle}
        </h1>

        <div className="text-[120px] md:text-[180px] font-mono font-bold leading-none tracking-tighter mb-16 drop-shadow-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          
          <button
            onClick={handleComplete}
            className="px-8 h-16 rounded-full bg-neon text-bg-primary font-bold text-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all flex items-center gap-2"
          >
            <Check size={24} /> Complete {itemType}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-8 text-xs opacity-50 flex items-center gap-6">
        <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> Play/Pause</span>
        <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> Complete</span>
        <span className="flex items-center gap-2 hidden md:flex"><kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> Exit</span>
      </div>

      {/* Abstract Background Elements based on mode */}
      {bgMode === 'flow' && (
        <>
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </>
      )}
      {bgMode === 'zen' && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-neon)_0%,_transparent_60%)]" />
      )}
    </div>
  );
};

export default FocusMode;
