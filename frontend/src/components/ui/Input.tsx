import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.replace(/\s/g, '-');
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/50 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border px-4 py-2.5 text-sm bg-white/[0.03] text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200 ${
          error ? 'border-red-500/50' : 'border-white/[0.07]'
        } ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400/80">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const inputId = id || label?.replace(/\s/g, '-');
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/50 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-md border px-4 py-2.5 text-sm bg-white/[0.03] text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200 resize-none ${
          error ? 'border-red-500/50' : 'border-white/[0.07]'
        } ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
