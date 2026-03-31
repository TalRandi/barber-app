import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { getAvailableSlots } from '../../api/client';
import type { Appointment, AppointmentFormData } from '../../types';
import { formatDateISO } from '../../utils/date';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointment?: Appointment | null; // null = create mode
  defaultDate?: Date;
}

export function AppointmentModal({ isOpen, onClose, onSubmit, appointment, defaultDate }: Props) {
  const isEdit = !!appointment;

  const [form, setForm] = useState<AppointmentFormData>({
    customerName: '',
    phone: '',
    date: defaultDate ? formatDateISO(defaultDate) : formatDateISO(new Date()),
    startTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (appointment) {
      setForm({
        customerName: appointment.customerName,
        phone: appointment.phone,
        date: appointment.date.split('T')[0],
        startTime: appointment.startTime,
        notes: appointment.notes || '',
      });
    } else {
      setForm({
        customerName: '',
        phone: '',
        date: defaultDate ? formatDateISO(defaultDate) : formatDateISO(new Date()),
        startTime: '',
        notes: '',
      });
    }
    setErrors({});
  }, [appointment, defaultDate, isOpen]);

  // Fetch available slots for the selected date
  const { data: slotsData } = useQuery({
    queryKey: ['available-slots', form.date],
    queryFn: () => getAvailableSlots(form.date),
    enabled: isOpen && !!form.date,
  });

  const availableSlots = slotsData?.slots || [];
  // When editing, include the current slot as available
  const displaySlots = isEdit && appointment
    ? [...new Set([appointment.startTime, ...availableSlots])].sort()
    : availableSlots;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = 'שם לקוח הוא שדה חובה';
    if (!form.phone.trim()) newErrors.phone = 'מספר טלפון הוא שדה חובה';
    if (!form.date) newErrors.date = 'תאריך הוא שדה חובה';
    if (!form.startTime) newErrors.startTime = 'שעה היא שדה חובה';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'שגיאה בשמירת התור';
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'עריכת תור' : 'קביעת תור'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="שם לקוח"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          error={errors.customerName}
          placeholder="הכנס שם לקוח"
          autoFocus
        />
        <Input
          label="טלפון"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          error={errors.phone}
          placeholder="050-1234567"
          type="tel"
          dir="ltr"
        />
        <Input
          label="תאריך"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value, startTime: '' })}
          error={errors.date}
        />

        {/* Time slot picker */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-white/50 mb-2" style={{ fontFamily: 'var(--font-body)' }}>שעה</label>
          {displaySlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.2) transparent' }}>
              {displaySlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm({ ...form, startTime: slot })}
                  className={`px-2 py-1.5 text-sm rounded-md border transition-colors duration-200 cursor-pointer ${
                    form.startTime === slot
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/[0.1] hover:text-white/70'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30" style={{ fontFamily: 'var(--font-body)' }}>
              {slotsData?.isWorkingDay === false ? 'יום זה אינו יום עבודה' : 'אין תורים פנויים בתאריך זה'}
            </p>
          )}
          {errors.startTime && <p className="mt-1 text-xs text-red-400/80">{errors.startTime}</p>}
        </div>

        <TextArea
          label="הערות"
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="הערות נוספות (אופציונלי)"
        />

        {errors.form && (
          <div className="mb-3 rounded-md p-3 border border-red-500/20 bg-red-500/10">
            <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-body)' }}>{errors.form}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-md font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 active:scale-[0.99]"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'linear-gradient(135deg, #d4af37 0%, #b8952e 50%, #d4af37 100%)',
              color: '#030303',
            }}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-bark/30 border-t-bark rounded-full animate-spin" />
              </span>
            ) : isEdit ? 'עדכון' : 'שמור'}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-md text-sm font-medium border border-white/[0.07] text-white/40 hover:bg-white/[0.05] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}>
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}
