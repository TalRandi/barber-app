import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('אימייל או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#030303' }}>

      {/* Subtle grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 w-full max-w-sm booking-animate-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/20 mb-5"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gold-shimmer-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            אלמוג ניסן
          </h1>
          <p className="text-white/25 text-sm" style={{ fontFamily: 'var(--font-body)' }}>ניהול תורים</p>
        </div>

        {/* Form card */}
        <div className="rounded-lg p-6 border border-white/[0.05]"
          style={{ background: '#0a0a0a' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="אימייל"
                  dir="ltr"
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-md pl-4 pr-10 py-3 text-sm text-white text-left
                    placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  dir="ltr"
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-md pl-4 pr-10 py-3 text-sm text-white text-left
                    placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md p-3 border border-red-500/20 bg-red-500/10">
                <p className="text-sm text-red-400 text-center" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-md font-bold text-sm tracking-wide cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 active:scale-[0.99]"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8952e 50%, #d4af37 100%)',
                color: '#030303',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bark/30 border-t-bark rounded-full animate-spin" />
                  מתחבר...
                </span>
              ) : 'התחברות'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
