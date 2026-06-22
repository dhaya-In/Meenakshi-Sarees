// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";
import supabase from "../config/supabase.js";

// Verify JWT and attach user to req
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided. Please sign in.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch current user from DB to ensure account still exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      throw new AppError("User no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401));
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please sign in again.", 401));
    }
    next(err);
  }
};

// Restrict to admin role only
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Access denied. Admins only.", 403));
  }
  next();
};

// Optional auth — attaches user if token present, continues even if not
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", decoded.id)
      .single();

    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
};
