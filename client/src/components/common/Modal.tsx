import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fade-in max-md:items-end max-md:p-0"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-bg-secondary border border-border-neon rounded-3xl shadow-xl neon-glow w-full max-h-[90vh] overflow-y-auto z-[400] animate-slide-up ${sizeClasses[size]} max-md:max-w-full max-md:max-h-[95vh] max-md:rounded-b-none`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-[10px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
