import { Request, Response } from "express";
import prisma from "../config/database";
import { Appointment, BlockedSlot } from "@prisma/client";
import { addMinutes, generateTimeSlots, hasOverlap } from "../utils/time";
import { sendAppointmentConfirmation } from "../services/notification";

// Public: Get available time slots for a given date
export async function getPublicAvailableSlots(req: Request, res: Response): Promise<void> {
  const { date } = req.query;

  if (!date) {
    res.status(400).json({ success: false, error: "Date is required" });
    return;
  }

  const targetDate = new Date(date as string);

  // Don't allow querying dates in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (targetDate < today) {
    res.json({ success: true, data: { date, slots: [], isWorkingDay: true } });
    return;
  }

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

  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();

  // Filter out booked, blocked, and past slots
  const availableSlots = allSlots.filter((slotStart) => {
    const slotEnd = addMinutes(slotStart, settings.slotDuration);

    // If today, skip past slots
    if (isToday) {
      const [h, m] = slotStart.split(":").map(Number);
      const slotTime = new Date(now);
      slotTime.setHours(h, m, 0, 0);
      if (slotTime <= now) return false;
    }

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

// Public: Create a booking
export async function createPublicBooking(req: Request, res: Response): Promise<void> {
  const customerName = req.body.customerName as string;
  const phone = req.body.phone as string;
  const date = req.body.date as string;
  const startTime = req.body.startTime as string;
  const notes = req.body.notes as string | undefined;

  const appointmentDate = new Date(date);

  // Don't allow booking in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    res.status(400).json({ success: false, error: "Cannot book appointments in the past" });
    return;
  }

  const settings = await prisma.businessSettings.findFirst();
  const slotDuration = settings?.slotDuration || 30;
  const endTime = addMinutes(startTime, slotDuration);

  // Validate working hours and day
  if (settings) {
    if (startTime < settings.openTime || endTime > settings.closeTime) {
      res.status(400).json({ success: false, error: "Appointment is outside working hours" });
      return;
    }

    const dayOfWeek = appointmentDate.getDay();
    if (!settings.workingDays.includes(dayOfWeek)) {
      res.status(400).json({ success: false, error: "Selected day is not a working day" });
      return;
    }

    if (settings.breakStartTime && settings.breakEndTime) {
      if (hasOverlap(startTime, endTime, settings.breakStartTime, settings.breakEndTime)) {
        res.status(400).json({ success: false, error: "Appointment overlaps with break time" });
        return;
      }
    }
  }

  // Check for overlapping appointments
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: appointmentDate,
      status: { not: "CANCELLED" },
    },
  });

  const isOverlapping = existingAppointments.some((appt: Appointment) =>
    hasOverlap(startTime, endTime, appt.startTime, appt.endTime)
  );

  if (isOverlapping) {
    res.status(409).json({ success: false, error: "Time slot is already booked" });
    return;
  }

  // Check for blocked slots
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: appointmentDate },
  });

  const isBlocked = blockedSlots.some((slot: BlockedSlot) =>
    hasOverlap(startTime, endTime, slot.startTime, slot.endTime)
  );

  if (isBlocked) {
    res.status(409).json({ success: false, error: "Time slot is blocked" });
    return;
  }

  // If today, ensure the slot hasn't passed
  const now = new Date();
  if (appointmentDate.toDateString() === now.toDateString()) {
    const [h, m] = startTime.split(":").map(Number);
    const slotTime = new Date(now);
    slotTime.setHours(h, m, 0, 0);
    if (slotTime <= now) {
      res.status(400).json({ success: false, error: "Cannot book a time slot that has already passed" });
      return;
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerName,
      phone,
      date: appointmentDate,
      startTime,
      endTime,
      notes,
    },
  });

  await sendAppointmentConfirmation({
    to: phone,
    customerName,
    date,
    time: startTime,
  });

  res.status(201).json({ success: true, data: appointment });
}
