// Notification service - prepared for future SMS/WhatsApp integration

interface NotificationPayload {
  to: string; // phone number
  customerName: string;
  date: string;
  time: string;
  message?: string;
}

export async function sendAppointmentReminder(payload: NotificationPayload): Promise<void> {
  // TODO: Integrate with SMS/WhatsApp API (e.g., Twilio)
  console.log(
    `[NOTIFICATION] Reminder for ${payload.customerName}: ` +
      `Appointment on ${payload.date} at ${payload.time}. Phone: ${payload.to}`
  );
}

export async function sendAppointmentConfirmation(payload: NotificationPayload): Promise<void> {
  console.log(
    `[NOTIFICATION] Confirmation for ${payload.customerName}: ` +
      `Appointment booked on ${payload.date} at ${payload.time}. Phone: ${payload.to}`
  );
}

export async function sendCancellationNotice(payload: NotificationPayload): Promise<void> {
  console.log(
    `[NOTIFICATION] Cancellation for ${payload.customerName}: ` +
      `Appointment on ${payload.date} at ${payload.time} has been cancelled. Phone: ${payload.to}`
  );
}
