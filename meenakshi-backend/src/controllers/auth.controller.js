// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// Generate signed JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Register ──────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check duplicate email
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) throw new AppError("Email already registered.", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from("users")
    .insert([{ id: uuid(), name, email, password: hashedPassword, role: "customer" }])
    .select("id, name, email, role")
    .single();

  if (error) throw new AppError("Registration failed. Please try again.", 500);

  const token = signToken(user.id);

  res.status(201).json({
    message: "Account created successfully.",
    token,
    user,
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, password")
    .eq("email", email)
    .single();

  if (error || !user) throw new AppError("Invalid email or password.", 401);

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new AppError("Invalid email or password.", 401);

  const { password: _, ...safeUser } = user;
  const token = signToken(user.id);

  res.json({
    message: "Login successful.",
    token,
    user: safeUser,
  });
});

// ── Get current user profile ──────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .update({ name, phone, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select("id, name, email, phone, role")
    .single();

  if (error) throw new AppError("Profile update failed.", 500);

  res.json({ message: "Profile updated.", user });
});

// ── Change password ───────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("password")
    .eq("id", req.user.id)
    .single();

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new AppError("Current password is incorrect.", 401);

  const hashed = await bcrypt.hash(newPassword, 12);
  await supabase
    .from("users")
    .update({ password: hashed, updated_at: new Date().toISOString() })
    .eq("id", req.user.id);

  res.json({ message: "Password changed successfully." });
});
