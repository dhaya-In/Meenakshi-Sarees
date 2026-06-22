// src/routes/appointment.routes.js
import { Router } from "express";
import { bookAppointment, getAppointments, updateAppointmentStatus } from "../controllers/appointment.controller.js";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.middleware.js";
import { appointmentValidator, validate } from "../middleware/validate.middleware.js";

const router = Router();
router.post  ("/",         optionalAuth, appointmentValidator, validate, bookAppointment);
router.get   ("/",         protect, adminOnly, getAppointments);
router.patch ("/:id/status", protect, adminOnly, updateAppointmentStatus);
export default router;
