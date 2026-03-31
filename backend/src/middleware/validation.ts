import { Request, Response, NextFunction } from "express";
import { validationResult, body, param, query } from "express-validator";

// Run validation and return errors if any
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.type === "field" ? (e as any).path : undefined, message: e.msg })),
    });
    return;
  }
  next();
}

// Appointment validation rules
export const appointmentValidation = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ max: 100 })
    .withMessage("Customer name must be under 100 characters"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[\d\-+() ]{7,20}$/)
    .withMessage("Invalid phone number format"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid time format (HH:mm)"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be under 500 characters"),
];

export const appointmentUpdateValidation = [
  body("customerName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer name cannot be empty")
    .isLength({ max: 100 }),
  body("phone")
    .optional()
    .trim()
    .matches(/^[\d\-+() ]{7,20}$/)
    .withMessage("Invalid phone number format"),
  body("date").optional().isISO8601().withMessage("Invalid date format"),
  body("startTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid time format (HH:mm)"),
  body("notes").optional().trim().isLength({ max: 500 }),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .withMessage("Invalid status"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const dateQueryValidation = [
  query("date").optional().isISO8601().withMessage("Invalid date format"),
  query("weekOf").optional().isISO8601().withMessage("Invalid date format"),
];

export const idParamValidation = [
  param("id").isUUID().withMessage("Invalid ID format"),
];
