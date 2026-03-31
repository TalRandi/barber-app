import { Request, Response } from "express";
import prisma from "../config/database";

export async function getSettings(_req: Request, res: Response): Promise<void> {
  let settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    // Create default settings if none exist
    settings = await prisma.businessSettings.create({
      data: {},
    });
  }

  res.json({ success: true, data: settings });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const { openTime, closeTime, slotDuration, workingDays, breakStartTime, breakEndTime } = req.body;

  let settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: { openTime, closeTime, slotDuration, workingDays, breakStartTime, breakEndTime },
    });
  } else {
    const updateData: any = {};
    if (openTime !== undefined) updateData.openTime = openTime;
    if (closeTime !== undefined) updateData.closeTime = closeTime;
    if (slotDuration !== undefined) updateData.slotDuration = slotDuration;
    if (workingDays !== undefined) updateData.workingDays = workingDays;
    if (breakStartTime !== undefined) updateData.breakStartTime = breakStartTime;
    if (breakEndTime !== undefined) updateData.breakEndTime = breakEndTime;

    settings = await prisma.businessSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  res.json({ success: true, data: settings });
}
