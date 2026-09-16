import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const iconMap = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const borderColors: Record<string, string> = {
  success: 'border-l-neon',
  error: 'border-l-danger',
  info: 'border-l-info',
  warning: 'border-l-warning',
};

const iconColors: Record<string, string> = {
  success: 'text-neon',
  error: 'text-danger',
  info: 'text-info',
  warning: 'text-warning',
};

const Toast: React.FC = () => {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-[500] flex flex-col gap-2 max-w-[400px] max-md:top-auto max-md:bottom-20 max-md:right-2.5 max-md:left-2.5 max-md:max-w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-4 py-3 bg-bg-secondary border border-border rounded-[10px] shadow-lg min-w-[280px] border-l-[3px] animate-slide-in-right ${borderColors[toast.type]}`}
        >
          <span className={`shrink-0 flex ${iconColors[toast.type]}`}>{iconMap[toast.type]}</span>
          <span className="flex-1 text-sm text-text-primary">{toast.message}</span>
          <button
            className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
            onClick={() => dismissToast(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
