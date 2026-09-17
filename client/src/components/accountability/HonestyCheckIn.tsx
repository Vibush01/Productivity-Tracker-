import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import api from '../../services/api';

const LAST_CHECKIN_KEY = 'pt-honesty-checkin';

const QUOTES = [
  "The only person you're reporting to is your future self.",
  "Consistency built on honesty is the only kind that lasts.",
  "Your streak is real only if your effort is.",
  "Small honest steps beat dishonest leaps.",
  "We can't verify this — but your progress can. Be honest.",
];

const HonestyCheckIn: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [show, setShow] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const day = now.getDay(); // 0=Sunday
    const hour = now.getHours();

    // Show on Sunday from 5 PM onwards
    if (day !== 0 || hour < 17) return;

    const lastCheckin = localStorage.getItem(LAST_CHECKIN_KEY);
    if (lastCheckin) {
      const lastDate = new Date(lastCheckin);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      if (lastDate >= weekStart) return; // Already checked in this week
    }

    // Delay showing by 2 seconds for smoother UX
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleHonest = async () => {
    try {
      // Award XP for honesty check-in
      await api.post('/habits/honesty-checkin');
      showToast('success', '✅ Honesty check-in complete! +25 XP');
    } catch {
      // If endpoint doesn't exist yet, still mark as done
      showToast('success', '✅ Thank you for being honest with yourself!');
    }
    localStorage.setItem(LAST_CHECKIN_KEY, new Date().toISOString());
    setAnswered(true);
  };

  const handleCorrect = () => {
    localStorage.setItem(LAST_CHECKIN_KEY, new Date().toISOString());
    setShow(false);
    showToast('info', 'Take a moment to review your past week on the Calendar page.');
  };

  const handleClose = () => {
    localStorage.setItem(LAST_CHECKIN_KEY, new Date().toISOString());
    setShow(false);
  };

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  if (!show) return null;

  return (
    <Modal isOpen={true} onClose={handleClose} title="🪞 Weekly Honesty Check-In" size="md">
      <div className="space-y-5">
        {!answered ? (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">
              Take a moment to reflect on your logged habits this past week.
              Were you honest about completing them?
            </p>

            <div className="p-4 bg-bg-tertiary rounded-2xl border border-border">
              <p className="text-sm italic text-text-secondary text-center">"{quote}"</p>
            </div>

            <div className="flex gap-3">
              <Button fullWidth onClick={handleHonest} icon={<CheckCircle size={16} />}>
                Yes, I was honest
              </Button>
              <Button fullWidth variant="secondary" onClick={handleCorrect} icon={<AlertCircle size={16} />}>
                I need to correct some
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <span className="text-5xl block mb-3">🌟</span>
            <h3 className="text-lg font-bold text-text-primary mb-1">Great job!</h3>
            <p className="text-sm text-text-secondary mb-1">+25 XP for your honesty check-in</p>
            <p className="text-xs text-text-tertiary italic mt-3">"{quote}"</p>
            <Button className="mt-4" onClick={handleClose}>Continue</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HonestyCheckIn;
