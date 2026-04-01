import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../api/client';
import { Save, Check } from 'lucide-react';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const [form, setForm] = useState({
    openTime: '09:00',
    closeTime: '20:00',
    slotDuration: 30,
    workingDays: [0, 1, 2, 3, 4] as number[],
    breakStartTime: '13:00',
    breakEndTime: '14:00',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        openTime: settings.openTime,
        closeTime: settings.closeTime,
        slotDuration: settings.slotDuration,
        workingDays: settings.workingDays,
        breakStartTime: settings.breakStartTime || '',
        breakEndTime: settings.breakEndTime || '',
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day].sort(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.07] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-colors duration-200";

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-white/90 mb-6" style={{ fontFamily: 'var(--font-display)' }}>הגדרות עסק</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Working hours */}
        <div className="rounded-lg p-5 border border-gold/10 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.6) 100%)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-0.5 h-5 bg-gold" />
            <h3 className="text-white/80 font-semibold text-sm" style={{ fontFamily: 'var(--font-body)' }}>שעות פעילות</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>שעת פתיחה</label>
              <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                className={inputClass} style={{ fontFamily: 'var(--font-body)' }} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>שעת סגירה</label>
              <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                className={inputClass} style={{ fontFamily: 'var(--font-body)' }} />
            </div>
          </div>
        </div>

        {/* Slot duration */}
        <div className="rounded-lg p-5 border border-gold/10 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.6) 100%)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-0.5 h-5 bg-gold" />
            <h3 className="text-white/80 font-semibold text-sm" style={{ fontFamily: 'var(--font-body)' }}>משך תור (דקות)</h3>
          </div>
          <select value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: Number(e.target.value) })}
            className={inputClass} style={{ fontFamily: 'var(--font-body)' }}>
            <option value={15}>15 דקות</option>
            <option value={20}>20 דקות</option>
            <option value={30}>30 דקות</option>
            <option value={45}>45 דקות</option>
            <option value={60}>60 דקות</option>
          </select>
        </div>

        {/* Working days */}
        <div className="rounded-lg p-5 border border-gold/10 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.6) 100%)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-0.5 h-5 bg-gold" />
            <h3 className="text-white/80 font-semibold text-sm" style={{ fontFamily: 'var(--font-body)' }}>ימי עבודה</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAY_NAMES.map((name, index) => (
              <button key={index} type="button" onClick={() => toggleDay(index)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors duration-200 cursor-pointer ${
                  form.workingDays.includes(index)
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-white/[0.1]'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Break time */}
        <div className="rounded-lg p-5 border border-gold/10 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.6) 100%)' }}>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-0.5 h-5 bg-gold" />
            <h3 className="text-white/80 font-semibold text-sm" style={{ fontFamily: 'var(--font-body)' }}>הפסקה</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>תחילת הפסקה</label>
              <input type="time" value={form.breakStartTime} onChange={(e) => setForm({ ...form, breakStartTime: e.target.value })}
                className={inputClass} style={{ fontFamily: 'var(--font-body)' }} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>סוף הפסקה</label>
              <input type="time" value={form.breakEndTime} onChange={(e) => setForm({ ...form, breakEndTime: e.target.value })}
                className={inputClass} style={{ fontFamily: 'var(--font-body)' }} />
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-md p-3 border border-green-500/20 bg-green-500/10">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-sm text-green-400" style={{ fontFamily: 'var(--font-body)' }}>ההגדרות נשמרו בהצלחה!</p>
          </div>
        )}

        <button type="submit" disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-md font-bold text-sm cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 active:scale-[0.99]"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8952e 50%, #d4af37 100%)',
            color: '#030303',
          }}>
          {mutation.isPending ? (
            <span className="w-4 h-4 border-2 border-bark/30 border-t-bark rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          שמור הגדרות
        </button>
      </form>
    </div>
  );
}
