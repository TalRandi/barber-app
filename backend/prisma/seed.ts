import "dotenv/config";
import prisma from "../src/config/database";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "almog@barber.com" },
    update: {},
    create: {
      email: "almog@barber.com",
      password: hashedPassword,
      name: "אלמוג ניסן",
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin user created: ${admin.email}`);

  // Create default business settings
  const settings = await prisma.businessSettings.findFirst();
  if (!settings) {
    await prisma.businessSettings.create({
      data: {
        openTime: "09:00",
        closeTime: "20:00",
        slotDuration: 30,
        workingDays: [0, 1, 2, 3, 4], // Sunday to Thursday
        breakStartTime: "13:00",
        breakEndTime: "14:00",
      },
    });
    console.log("  ✓ Business settings created");
  }

  // Create sample appointments (for today and tomorrow)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sampleAppointments = [
    {
      customerName: "דוד כהן",
      phone: "050-1234567",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      notes: "תספורת רגילה",
    },
    {
      customerName: "יוסי לוי",
      phone: "052-9876543",
      date: today,
      startTime: "10:00",
      endTime: "10:30",
    },
    {
      customerName: "משה אברהם",
      phone: "054-5551234",
      date: today,
      startTime: "11:00",
      endTime: "11:30",
      notes: "זקן + תספורת",
    },
    {
      customerName: "אבי ישראלי",
      phone: "053-1112222",
      date: tomorrow,
      startTime: "09:30",
      endTime: "10:00",
    },
    {
      customerName: "רון גולן",
      phone: "050-3334444",
      date: tomorrow,
      startTime: "14:00",
      endTime: "14:30",
      notes: "לקוח חדש",
    },
  ];

  for (const appt of sampleAppointments) {
    await prisma.appointment.upsert({
      where: {
        date_startTime: {
          date: appt.date,
          startTime: appt.startTime,
        },
      },
      update: {},
      create: appt,
    });
  }
  console.log(`  ✓ ${sampleAppointments.length} sample appointments created`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
