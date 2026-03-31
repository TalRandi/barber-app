import { Request, Response } from "express";
import prisma from "../config/database";
import { Appointment, BlockedSlot } from "@prisma/client";
import { generateTimeSlots, hasOverlap } from "../utils/time";

// Get available time slots for a given date
export async function getAvailableSlots(req: Request, res: Response): Promise<void> {
  const { date } = req.query;

  if (!date) {
    res.status(400).json({ success: false, error: "Date is required" });
    return;
  }

  const targetDate = new Date(date as string);

  const settings = await prisma.businessSettings.findFirst();
  if (!settings) {
    res.status(500).json({ success: false, error: "Business settings not configured" });
    return;
  }

  // Check if it's a working day
  const dayOfWeek = targetDate.getDay();
  if (!settings.workingDays.includes(dayOfWeek)) {
    res.json({ success: true, data: { date, slots: [], isWorkingDay: false } });
    return;
  }

  // Generate all possible slots
  const allSlots = generateTimeSlots(
    settings.openTime,
    settings.closeTime,
    settings.slotDuration
  );

  // Get existing appointments for the date
  const appointments = await prisma.appointment.findMany({
    where: {
      date: targetDate,
      status: { not: "CANCELLED" },
    },
  });

  // Get blocked slots
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: targetDate },
  });

  // Filter out booked and blocked slots
  const availableSlots = allSlots.filter((slotStart) => {
    const slotEnd = addMinutesStr(slotStart, settings.slotDuration);

    // Check break time
    if (settings.breakStartTime && settings.breakEndTime) {
      if (hasOverlap(slotStart, slotEnd, settings.breakStartTime, settings.breakEndTime)) {
        return false;
      }
    }

    // Check existing appointments
    const isBooked = appointments.some((appt: Appointment) =>
      hasOverlap(slotStart, slotEnd, appt.startTime, appt.endTime)
    );
    if (isBooked) return false;

    // Check blocked slots
    const isBlocked = blockedSlots.some((slot: BlockedSlot) =>
      hasOverlap(slotStart, slotEnd, slot.startTime, slot.endTime)
    );
    if (isBlocked) return false;

    return true;
  });

  res.json({
    success: true,
    data: {
      date,
      slots: availableSlots,
      isWorkingDay: true,
      openTime: settings.openTime,
      closeTime: settings.closeTime,
      slotDuration: settings.slotDuration,
    },
  });
}

// Inline helper to avoid circular import issues
function addMinutesStr(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
