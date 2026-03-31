import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Settings, LogOut } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#030303' }}>
      {/* Top navbar */}
      <header className="border-b border-white/[0.05]" style={{ background: 'rgba(5,5,5,0.95)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <h1 className="text-lg font-bold gold-shimmer-text" style={{ fontFamily: 'var(--font-display)' }}>אלמוג ניסן</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40 hidden sm:block" style={{ fontFamily: 'var(--font-body)' }}>שלום, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-gold transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">יציאה</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="border-b border-white/[0.04]" style={{ background: 'rgba(8,8,8,0.9)' }}>
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-gold'
                  : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/10'
              }`
            }
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Calendar className="w-4 h-4" />
            לוח תורים
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-gold'
                  : 'border-transparent text-white/30 hover:text-white/50 hover:border-white/10'
              }`
            }
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Settings className="w-4 h-4" />
            הגדרות
          </NavLink>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
