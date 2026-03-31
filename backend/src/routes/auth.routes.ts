import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { loginValidation, validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", loginValidation, validate, login);
router.get("/me", authenticate, getMe);

export default router;
