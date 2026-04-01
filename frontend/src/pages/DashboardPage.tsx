import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../api/client';
import type { Appointment, AppointmentFormData } from '../types';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { AppointmentModal } from '../components/appointments/AppointmentModal';
import {
  getWeekDays,
  formatDateISO,
  formatDateShort,
  getDayNameShort,
  isToday,
  isSameDay,
  addDays,
} from '../utils/date';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const weekDays = getWeekDays(weekStart);
  const weekOfISO = formatDateISO(weekStart);

  // Fetch appointments for the week
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', weekOfISO],
    queryFn: () => getAppointments({ weekOf: weekOfISO }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) =>
      updateAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const handleCreate = useCallback(async (data: AppointmentFormData) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdate = useCallback(async (data: AppointmentFormData) => {
    if (!editingAppointment) return;
    await updateMutation.mutateAsync({ id: editingAppointment.id, data });
  }, [editingAppointment, updateMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התור?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const openCreate = () => {
    setEditingAppointment(null);
    setModalOpen(true);
  };

  const openEdit = (appt: Appointment) => {
    setEditingAppointment(appt);
    setModalOpen(true);
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateISO = formatDateISO(date);
    return appointments
      .filter((a) => a.date.startsWith(dateISO))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday = () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    setWeekStart(start);
    setSelectedDate(now);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          <button onClick={prevWeek} className="p-2 rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
          <button onClick={goToday}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gold border border-gold/20 hover:bg-gold/10 transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-body)' }}>
            היום
          </button>
          <button onClick={nextWeek} className="p-2 rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-white/40" />
          </button>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-md font-semibold text-sm cursor-pointer transition-colors duration-200 active:scale-[0.99]"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8952e 50%, #d4af37 100%)',
            color: '#030303',
          }}>
          <Plus className="w-4 h-4" />
          קביעת תור
        </button>
      </div>

      {/* Week day selector */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => {
          const dayAppts = getAppointmentsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center p-2.5 rounded-lg transition-colors duration-200 cursor-pointer border ${
                isSelected
                  ? 'border-gold/50 bg-gold/10'
                  : today
                  ? 'border-gold/20 bg-gold/[0.04]'
                  : 'border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]'
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-gold' : today ? 'text-gold/60' : 'text-white/30'}`}
                style={{ fontFamily: 'var(--font-body)' }}>
                {getDayNameShort(day)}
              </span>
              <span className={`text-lg font-bold ${isSelected ? 'text-gold' : 'text-white/70'}`}
                style={{ fontFamily: 'var(--font-display)' }}>
                {formatDateShort(day)}
              </span>
              {dayAppts.length > 0 && (
                <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-gold/20 text-gold' : 'bg-white/[0.05] text-white/30'
                }`} style={{ fontFamily: 'var(--font-body)' }}>
                  {dayAppts.length} תורים
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Appointments list for selected day */}
      <div>
        <h2 className="text-lg font-semibold text-white/80 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          תורים ליום {getDayNameShort(selectedDate)} {formatDateShort(selectedDate)}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : getAppointmentsForDate(selectedDate).length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed border-gold/20 bg-white/[0.01]">
            <p className="text-white/25 mb-4" style={{ fontFamily: 'var(--font-body)' }}>אין תורים ליום זה</p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}>
              <Plus className="w-4 h-4" />
              הוסף תור
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {getAppointmentsForDate(selectedDate).map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
        }}
        onSubmit={editingAppointment ? handleUpdate : handleCreate}
        appointment={editingAppointment}
        defaultDate={selectedDate}
      />
    </div>
  );
}
