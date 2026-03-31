import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller";
import {
  appointmentValidation,
  appointmentUpdateValidation,
  dateQueryValidation,
  idParamValidation,
  validate,
} from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

router.get("/", dateQueryValidation, validate, getAppointments);
router.get("/:id", idParamValidation, validate, getAppointment);
router.post("/", appointmentValidation, validate, createAppointment);
router.put("/:id", idParamValidation, appointmentUpdateValidation, validate, updateAppointment);
router.delete("/:id", idParamValidation, validate, deleteAppointment);

export default router;
