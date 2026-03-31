// Time utility helpers

/**
 * Add minutes to a time string (HH:mm)
 */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Check if time1 < time2 (both HH:mm strings)
 */
export function isBefore(time1: string, time2: string): boolean {
  return time1.localeCompare(time2) < 0;
}

/**
 * Check if two time ranges overlap
 * [start1, end1) and [start2, end2)
 */
export function hasOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return isBefore(start1, end2) && isBefore(start2, end1);
}

/**
 * Generate all time slots between start and end with given duration
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  let current = startTime;

  while (isBefore(current, endTime)) {
    const slotEnd = addMinutes(current, durationMinutes);
    if (isBefore(endTime, slotEnd)) break;
    slots.push(current);
    current = slotEnd;
  }

  return slots;
}

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  start.setDate(start.getDate() + 6);
  start.setHours(23, 59, 59, 999);
  return start;
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
