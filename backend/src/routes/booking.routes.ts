import { Router } from "express";
import { getPublicAvailableSlots, createPublicBooking } from "../controllers/booking.controller";
import { appointmentValidation, validate } from "../middleware/validation";

const router = Router();

// Public routes — no authentication required
router.get("/available-slots", getPublicAvailableSlots);
router.post("/", appointmentValidation, validate, createPublicBooking);

export default router;
