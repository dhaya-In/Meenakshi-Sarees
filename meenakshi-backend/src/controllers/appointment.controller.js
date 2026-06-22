// src/controllers/appointment.controller.js
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// ── POST /api/appointments  (Public) ─────────────────────────────────────────
export const bookAppointment = asyncHandler(async (req, res) => {
  const { name, phone, service, preferred_date, notes } = req.body;

  const { data, error } = await supabase
    .from("appointments")
    .insert([{
      name, phone, service,
      preferred_date,
      notes: notes || null,
      user_id: req.user?.id || null,
      status: "pending",
    }])
    .select()
    .single();

  if (error) throw new AppError("Failed to book appointment.", 500);

  res.status(201).json({
    message: "Appointment booked! We'll call you shortly to confirm.",
    appointment: data,
  });
});

// ── GET /api/appointments  (Admin only) ───────────────────────────────────────
export const getAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;

  let query = supabase
    .from("appointments")
    .select("*")
    .order("preferred_date", { ascending: true });

  if (status) query = query.eq("status", status);
  if (date)   query = query.eq("preferred_date", date);

  const { data, error } = await query;
  if (error) throw new AppError("Failed to fetch appointments.", 500);

  res.json({ appointments: data });
});

// ── PATCH /api/appointments/:id/status  (Admin only) ─────────────────────────
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid status.", 422);
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) throw new AppError("Appointment not found.", 404);

  res.json({ message: "Appointment updated.", appointment: data });
});
