import type { Appointment } from '../../types';
import { Clock, Phone, FileText, Pencil, Trash2 } from 'lucide-react';

interface Props {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  CANCELLED: 'bg-white/[0.04] text-white/25 border border-white/[0.06] line-through',
  NO_SHOW: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'מתוכנן',
  COMPLETED: 'הושלם',
  CANCELLED: 'בוטל',
  NO_SHOW: 'לא הגיע',
};

export function AppointmentCard({ appointment, onEdit, onDelete }: Props) {
  const isCancelled = appointment.status === 'CANCELLED';

  const isPast = (() => {
    if (isCancelled || appointment.status === 'COMPLETED') return false;
    const [year, month, day] = appointment.date.slice(0, 10).split('-').map(Number);
    const [hours, minutes] = appointment.endTime.split(':').map(Number);
    const endDate = new Date(year, month - 1, day, hours, minutes);
    return endDate < new Date();
  })();

  return (
    <div
      className={`rounded-lg border p-4 transition-colors duration-200 hover:border-white/[0.1] ${
        isPast ? 'opacity-50 border-white/[0.04] bg-white/[0.01]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      } ${isCancelled ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white/90" style={{ fontFamily: 'var(--font-display)' }}>{appointment.customerName}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${statusColors[appointment.status]}`}
              style={{ fontFamily: 'var(--font-body)' }}>
              {statusLabels[appointment.status]}
            </span>
            {isPast && (
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/25 border border-white/[0.06]"
                style={{ fontFamily: 'var(--font-body)' }}>
                עבר
              </span>
            )}
          </div>
        </div>
        {!isCancelled && (
          <div className="flex gap-0.5">
            <button
              onClick={() => onEdit(appointment)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="עריכה"
            >
              <Pencil className="w-3.5 h-3.5 text-white/25 hover:text-gold" />
            </button>
            <button
              onClick={() => onDelete(appointment.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
              title="מחק"
            >
              <Trash2 className="w-3.5 h-3.5 text-white/25 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gold/50" />
          <span className="text-white/60" style={{ fontFamily: 'var(--font-display)' }}>{appointment.startTime} - {appointment.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gold/50" />
          <span dir="ltr">{appointment.phone}</span>
        </div>
        {appointment.notes && (
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gold/50" />
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
