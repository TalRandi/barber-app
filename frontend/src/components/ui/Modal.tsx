import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      <div className="relative rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-white/[0.05]"
        style={{ background: '#0a0a0a' }}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
          <h2 className="text-lg font-semibold text-white/90" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white/30" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
