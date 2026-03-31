import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import scheduleRoutes from "./routes/schedule.routes";
import settingsRoutes from "./routes/settings.routes";
import bookingRoutes from "./routes/booking.routes";

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin.includes(',') 
    ? config.cors.origin.split(',').map(o => o.trim()) 
    : config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/booking", bookingRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
