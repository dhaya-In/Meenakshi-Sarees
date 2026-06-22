// src/middleware/validate.middleware.js
import { validationResult, body, param, query } from "express-validator";
import { AppError } from "./error.middleware.js";

// Run validation result and return 422 if errors exist
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(", ");
    return next(new AppError(messages, 422));
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────────
export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ min: 2, max: 60 }),
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

// ── Product validators ─────────────────────────────────────────────────────────
export const productValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("original_price").optional().isFloat({ min: 0 }),
  body("category_id").notEmpty().withMessage("Category is required."),
  body("fabric").optional().trim(),
  body("description").optional().trim(),
];

// ── Review validators ──────────────────────────────────────────────────────────
export const reviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
  body("comment").trim().notEmpty().withMessage("Review comment is required.").isLength({ max: 1000 }),
  param("productId").notEmpty().withMessage("Product ID is required."),
];

// ── Appointment validators ─────────────────────────────────────────────────────
export const appointmentValidator = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number."),
  body("service").notEmpty().withMessage("Service type is required."),
  body("preferred_date").isISO8601().withMessage("Valid date is required."),
];

// ── Enquiry validators ─────────────────────────────────────────────────────────
export const enquiryValidator = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("phone").matches(/^[6-9]\d{9}$/).withMessage("Valid phone number required."),
  body("message").trim().notEmpty().withMessage("Message is required.").isLength({ max: 2000 }),
];

// ── Order validators ───────────────────────────────────────────────────────────
export const orderValidator = [
  body("items").isArray({ min: 1 }).withMessage("Order must have at least one item."),
  body("items.*.product_id").notEmpty().withMessage("Each item needs a product_id."),
  body("items.*.qty").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),

  body("customer_name").trim().notEmpty().withMessage("Full name is required.").isLength({ max: 150 }),
  body("customer_email")
    .trim().notEmpty().withMessage("Email address is required.")
    .isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("phone_number")
    .trim().notEmpty().withMessage("Phone number is required.")
    .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number."),
  body("company_name").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),

  body("address_line_1").trim().notEmpty().withMessage("Address Line 1 is required."),
  body("address_line_2").optional({ checkFalsy: true }).trim(),
  body("city").trim().notEmpty().withMessage("City / Town is required.").isLength({ max: 100 }),
  body("state").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body("postal_code")
    .trim().notEmpty().withMessage("Postal code is required.")
    .matches(/^\d{6}$/).withMessage("Enter a valid 6-digit Indian postal code."),
  body("country").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),

  body("payment_method")
    .isIn(["cod", "upi"])
    .withMessage("Payment method must be cod or upi."),
];
