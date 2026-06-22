// src/controllers/enquiry.controller.js
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// ── POST /api/enquiries  (Public) ─────────────────────────────────────────────
export const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;

  const { data, error } = await supabase
    .from("enquiries")
    .insert([{ name, phone, email: email || null, message, status: "new" }])
    .select()
    .single();

  if (error) throw new AppError("Failed to submit enquiry.", 500);

  res.status(201).json({
    message: "Enquiry received! We'll get back to you within 24 hours.",
    enquiry: data,
  });
});

// ── GET /api/enquiries  (Admin only) ──────────────────────────────────────────
export const getEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new AppError("Failed to fetch enquiries.", 500);

  res.json({ enquiries: data });
});

// ── PATCH /api/enquiries/:id/status  (Admin only) ─────────────────────────────
export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const { data, error } = await supabase
    .from("enquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) throw new AppError("Enquiry not found.", 404);

  res.json({ message: "Enquiry status updated.", enquiry: data });
});
