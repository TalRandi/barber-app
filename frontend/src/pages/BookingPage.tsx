import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicAvailableSlots, createPublicBooking } from '../api/client';
import { formatDateISO, getDayName } from '../utils/date';
import type { AppointmentFormData } from '../types';
import { Check, ChevronDown } from 'lucide-react';

type Step = 'form' | 'success';

// Decorative barber pole SVG stripes
function BarberStripe({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none overflow-hidden opacity-[0.03] ${className}`}>
      <svg width="400" height="400" viewBox="0 0 400 400">
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={i}
            x1={i * 40 - 200}
            y1="0"
            x2={i * 40 + 200}
            y2="400"
            stroke="currentColor"
            strokeWidth="8"
          />
        ))}
      </svg>
    </div>
  );
}

export function BookingPage() {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<AppointmentFormData>({
    customerName: '',
    phone: '',
    date: formatDateISO(new Date()),
    startTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookedTime, setBookedTime] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['public-slots', form.date],
    queryFn: () => getPublicAvailableSlots(form.date),
    enabled: !!form.date,
  });

  const bookMutation = useMutation({
    mutationFn: createPublicBooking,
    onSuccess: () => {
      setBookedTime(form.startTime);
      setStep('success');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'שגיאה בקביעת התור. נסה שנית.';
      setErrors({ form: msg });
    },
  });

  const availableSlots = slotsData?.slots || [];

  const dateOptions: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dateOptions.push(d);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = 'שם הוא שדה חובה';
    if (!form.phone.trim()) newErrors.phone = 'מספר טלפון הוא שדה חובה';
    if (!form.date) newErrors.date = 'יש לבחור תאריך';
    if (!form.startTime) newErrors.startTime = 'יש לבחור שעה';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    bookMutation.mutate(form);
  };

  const resetForm = () => {
    setForm({ customerName: '', phone: '', date: formatDateISO(new Date()), startTime: '', notes: '' });
    setErrors({});
    setShowNotes(false);
    setStep('form');
  };

  const hebrewDayShort = (d: Date) => {
    const days = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    return days[d.getDay()];
  };

  /* ───── SUCCESS SCREEN ───── */
  if (step === 'success') {
    return (
    <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: '#030303' }}>
        <div className="booking-scale-in max-w-md w-full text-center">
          {/* Animated check circle */}
          <div className="mx-auto mb-6 sm:mb-8 w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-gold/40 flex items-center justify-center"
            style={{ animation: 'booking-scale-in 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="sm:w-12 sm:h-12">
              <path
                d="M12 24L20 32L36 16"
                stroke="#d4af37"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                style={{ animation: 'check-draw 0.6s ease-out 0.6s both' }}
              />
            </svg>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold mb-2 gold-shimmer-text" style={{ fontFamily: 'var(--font-display)' }}>
            התור נקבע בהצלחה
          </h2>
          <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-body)' }}>מחכים לך</p>

          {/* Appointment card */}
          <div className="rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-right border border-gold/10"
            style={{
              background: '#0a0a0a',
              animation: 'booking-fade-up 0.35s cubic-bezier(0.16,1,0.3,1) 0.3s both',
            }}>
            <div className="space-y-2 sm:space-y-3" style={{ fontFamily: 'var(--font-body)' }}>
              {[
                { label: 'שם', value: form.customerName },
                { label: 'תאריך', value: `${getDayName(new Date(form.date + 'T00:00:00'))}, ${form.date.split('-').reverse().join('/')}` },
                { label: 'שעה', value: bookedTime },
                { label: 'טלפון', value: form.phone, dir: 'ltr' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-xs sm:text-sm">{row.label}</span>
                  <span className="text-white font-medium text-xs sm:text-sm" dir={row.dir}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={resetForm}
            className="w-full py-2.5 sm:py-3.5 rounded-md font-semibold text-xs sm:text-sm tracking-wide transition-colors duration-200 cursor-pointer
              border border-gold/30 text-gold hover:bg-gold/10 active:scale-[0.99] min-h-[40px] sm:min-h-[44px]"
            style={{ fontFamily: 'var(--font-body)', animation: 'booking-fade-up 0.35s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
          >
            קביעת תור נוסף
          </button>
        </div>
      </div>
    );
  }

  /* ───── BOOKING FORM ───── */
  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: '#030303' }}>

      {/* Background texture */}
      <BarberStripe className="top-0 left-0 w-full h-full text-gold" />

      {/* Geometric grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-10"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-20 max-w-lg mx-auto px-4 sm:px-5 pb-8 sm:pb-12">

        {/* ── Header ── */}
        <header className="pt-8 sm:pt-12 pb-6 sm:pb-10 text-center booking-animate-in">
          {/* Gold scissors icon */}
          <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full border border-gold/20 mb-3 sm:mb-5"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight gold-shimmer-text mb-2"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            אלמוג ניסן
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3">
            <span className="h-px w-6 sm:w-10 bg-gold/20" />
            <span className="text-white/30 text-[10px] sm:text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
              BARBERSHOP
            </span>
            <span className="h-px w-6 sm:w-10 bg-gold/20" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

          {/* ── Personal Info Section ── */}
          <section className="booking-animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="rounded-lg p-4 sm:p-5 border border-white/[0.05]"
              style={{ background: '#0a0a0a' }}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="w-0.5 h-5 bg-gold" />
                <h2 className="text-white/90 font-semibold text-xs sm:text-sm" style={{ fontFamily: 'var(--font-body)' }}>פרטים אישיים</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="שם מלא"
                    autoFocus
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white
                      placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  {errors.customerName && <p className="mt-1.5 text-xs text-red-400/80 mr-1">{errors.customerName}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="050-1234567"
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white text-left
                      placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  {errors.phone && <p className="mt-1.5 text-xs text-red-400/80 mr-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ── Date Selection ── */}
          <section className="booking-animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="rounded-lg p-4 sm:p-5 border border-white/[0.05]"
              style={{ background: '#0a0a0a' }}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="w-0.5 h-5 bg-gold" />
                <h2 className="text-white/90 font-semibold text-xs sm:text-sm" style={{ fontFamily: 'var(--font-body)' }}>בחר תאריך</h2>
              </div>

              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-2 px-2"
                style={{ scrollbarWidth: 'none' }}>
                {dateOptions.map((d) => {
                  const iso = formatDateISO(d);
                  const isSelected = form.date === iso;
                  const isToday = iso === formatDateISO(new Date());
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setForm({ ...form, date: iso, startTime: '' })}
                      className={`flex-shrink-0 flex flex-col items-center py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg border transition-colors duration-200 cursor-pointer min-w-[56px] sm:min-w-[62px] ${
                        isSelected
                          ? 'border-gold/50 bg-gold/10'
                          : 'border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`text-[9px] sm:text-[10px] font-medium mb-0.5 ${isSelected ? 'text-gold' : 'text-white/30'}`}
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {hebrewDayShort(d)}
                      </span>
                      <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-gold' : 'text-white/70'}`}
                        style={{ fontFamily: 'var(--font-display)' }}>
                        {d.getDate()}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-gold/60' : 'text-white/20'}`}
                        style={{ fontFamily: 'var(--font-body)' }}>
                        {d.getMonth() + 1}/{String(d.getFullYear()).slice(2)}
                      </span>
                      {isToday && (
                        <span className={`mt-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-gold' : 'bg-white/30'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="mt-2 text-xs text-red-400/80 mr-1">{errors.date}</p>}
            </div>
          </section>

          {/* ── Time Slot Selection ── */}
          <section className="booking-animate-in" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-lg p-4 sm:p-5 border border-white/[0.05]"
              style={{ background: '#0a0a0a' }}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="w-0.5 h-5 bg-gold" />
                <h2 className="text-white/90 font-semibold text-xs sm:text-sm" style={{ fontFamily: 'var(--font-body)' }}>בחר שעה</h2>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
              ) : slotsData?.isWorkingDay === false ? (
                <div className="text-center py-6">
                  <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-body)' }}>יום זה אינו יום עבודה</p>
                  <p className="text-white/15 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>בחר תאריך אחר</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-body)' }}>אין תורים פנויים</p>
                  <p className="text-white/15 text-xs mt-1" style={{ fontFamily: 'var(--font-body)' }}>נסה תאריך אחר</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 max-h-52 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.2) transparent' }}>
                  {availableSlots.map((slot) => {
                    const isSelected = form.startTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm({ ...form, startTime: slot })}
                        className={`relative py-2 sm:py-2.5 px-1 text-xs sm:text-sm rounded-md border transition-colors duration-200 cursor-pointer font-medium min-h-[40px] flex items-center justify-center ${
                          isSelected
                            ? 'border-gold/50 bg-gold/15 text-gold'
                            : 'border-white/[0.05] bg-white/[0.02] text-white/50 hover:border-white/[0.1] hover:text-white/70 hover:bg-white/[0.03]'
                        }`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {slot}
                        {isSelected && (
                          <Check className="absolute top-0.5 left-0.5 w-3 h-3 text-gold" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.startTime && <p className="mt-2 text-xs text-red-400/80 mr-1">{errors.startTime}</p>}
            </div>
          </section>

          {/* ── Notes (collapsible) ── */}
          <section className="booking-animate-in" style={{ animationDelay: '0.4s' }}>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-white/25 hover:text-white/40 transition-colors text-xs sm:text-sm cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showNotes ? 'rotate-180' : ''}`} />
              הוסף הערות
            </button>
            {showNotes && (
              <div className="mt-3 booking-animate-in">
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="תספורת, עיצוב זקן, הערות נוספות..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white
                    placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/[0.05]
                    transition-colors duration-200 resize-none"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            )}
          </section>

          {/* ── Error message ── */}
          {errors.form && (
            <div className="booking-animate-in rounded-md p-3 border border-red-500/20 bg-red-500/10">
              <p className="text-xs sm:text-sm text-red-400" style={{ fontFamily: 'var(--font-body)' }}>{errors.form}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="booking-animate-in pt-2" style={{ animationDelay: '0.5s' }}>
            <button
              type="submit"
              disabled={bookMutation.isPending}
              className="group relative w-full py-3 sm:py-4 rounded-md font-bold text-xs sm:text-sm tracking-wide overflow-hidden cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 active:scale-[0.99] min-h-[44px] sm:min-h-[48px]"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8952e 50%, #d4af37 100%)',
                backgroundSize: '200% 200%',
                color: '#030303',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = '100% 100%'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = '0% 0%'; }}
            >
              {bookMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bark/30 border-t-bark rounded-full animate-spin" />
                  קובע תור...
                </span>
              ) : (
                'קבע תור'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/15 mt-10 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          לביטול תור צרו קשר בטלפון
        </p>
      </div>
    </div>
  );
}
