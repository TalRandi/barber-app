import { format, addDays, startOfWeek, isToday, isSameDay, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

export function formatDateHebrew(date: Date): string {
  return format(date, 'EEEE, d בMMMM yyyy', { locale: he });
}

export function formatDateShort(date: Date): string {
  return format(date, 'd/M', { locale: he });
}

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekDays(referenceDate: Date): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Sunday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: he });
}

export function getDayNameShort(date: Date): string {
  return format(date, 'EEE', { locale: he });
}

export { isToday, isSameDay, parseISO, addDays };
