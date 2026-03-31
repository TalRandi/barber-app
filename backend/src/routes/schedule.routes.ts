import { Router } from "express";
import { getAvailableSlots } from "../controllers/schedule.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/available-slots", getAvailableSlots);

export default router;
