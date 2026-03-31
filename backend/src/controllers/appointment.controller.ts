import { Request, Response } from "express";
import prisma from "../config/database";
import { Appointment, BlockedSlot } from "@prisma/client";
import { addMinutes, hasOverlap, getWeekStart, getWeekEnd } from "../utils/time";
import { sendAppointmentConfirmation, sendCancellationNotice } from "../services/notification";

// Get appointments by date or week
export async function getAppointments(req: Request, res: Response): Promise<void> {
  const { date, weekOf } = req.query;

  let where: any = {};

  if (date) {
    where.date = new Date(date as string);
  } else if (weekOf) {
    const refDate = new Date(weekOf as string);
    where.date = {
      gte: getWeekStart(refDate),
      lte: getWeekEnd(refDate),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  res.json({ success: true, data: appointments });
}

// Get single appointment
export async function getAppointment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    res.status(404).json({ success: false, error: "Appointment not found" });
    return;
  }

  res.json({ success: true, data: appointment });
}

// Create appointment
export async function createAppointment(req: Request, res: Response): Promise<void> {
  const customerName = req.body.customerName as string;
  const phone = req.body.phone as string;
  const date = req.body.date as string;
  const startTime = req.body.startTime as string;
  const notes = req.body.notes as string | undefined;

  const appointmentDate = new Date(date);

  // Get business settings for slot duration
  const settings = await prisma.businessSettings.findFirst();
  const slotDuration = settings?.slotDuration || 30;
  const endTime = addMinutes(startTime, slotDuration);

  // Validate working hours
  if (settings) {
    if (startTime < settings.openTime || endTime > settings.closeTime) {
      res.status(400).json({
        success: false,
        error: "Appointment is outside working hours",
      });
      return;
    }

    // Check working day
    const dayOfWeek = appointmentDate.getDay();
    if (!settings.workingDays.includes(dayOfWeek)) {
      res.status(400).json({
        success: false,
        error: "Selected day is not a working day",
      });
      return;
    }

    // Check break time
    if (settings.breakStartTime && settings.breakEndTime) {
      if (hasOverlap(startTime, endTime, settings.breakStartTime, settings.breakEndTime)) {
        res.status(400).json({
          success: false,
          error: "Appointment overlaps with break time",
        });
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
    res.status(409).json({
      success: false,
      error: "Time slot is already booked",
    });
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
    res.status(409).json({
      success: false,
      error: "Time slot is blocked",
    });
    return;
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

  // Log notification (future: send SMS)
  await sendAppointmentConfirmation({
    to: phone,
    customerName,
    date: date,
    time: startTime,
  });

  res.status(201).json({ success: true, data: appointment });
}

// Update appointment
export async function updateAppointment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const customerName = req.body.customerName as string | undefined;
  const phone = req.body.phone as string | undefined;
  const date = req.body.date as string | undefined;
  const startTime = req.body.startTime as string | undefined;
  const notes = req.body.notes as string | undefined;
  const status = req.body.status as string | undefined;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: "Appointment not found" });
    return;
  }

  // If time/date is being changed, validate overlap
  const newDate = date ? new Date(date) : existing.date;
  const settings = await prisma.businessSettings.findFirst();
  const slotDuration = settings?.slotDuration || 30;
  const newStartTime = startTime || existing.startTime;
  const newEndTime = addMinutes(newStartTime, slotDuration);

  if (date || startTime) {
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: newDate,
        status: { not: "CANCELLED" },
        id: { not: id },
      },
    });

    const isOverlapping = existingAppointments.some((appt: Appointment) =>
      hasOverlap(newStartTime, newEndTime, appt.startTime, appt.endTime)
    );

    if (isOverlapping) {
      res.status(409).json({
        success: false,
        error: "Time slot is already booked",
      });
      return;
    }
  }

  const updateData: any = {};
  if (customerName !== undefined) updateData.customerName = customerName;
  if (phone !== undefined) updateData.phone = phone;
  if (date !== undefined) {
    updateData.date = newDate;
    updateData.startTime = newStartTime;
    updateData.endTime = newEndTime;
  }
  if (startTime !== undefined) {
    updateData.startTime = newStartTime;
    updateData.endTime = newEndTime;
  }
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  res.json({ success: true, data: appointment });
}

// Delete appointment
export async function deleteAppointment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: "Appointment not found" });
    return;
  }

  await prisma.appointment.delete({ where: { id } });

  // Log cancellation notification
  await sendCancellationNotice({
    to: existing.phone,
    customerName: existing.customerName,
    date: existing.date.toISOString().split("T")[0],
    time: existing.startTime,
  });

  res.json({ success: true, message: "Appointment deleted" });
}
