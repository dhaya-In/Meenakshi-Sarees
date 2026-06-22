// src/middleware/error.middleware.js

// Global error handler — catches anything thrown in controllers
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  const status  = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error.";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Wrap async route handlers so you don't need try/catch in every controller
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Create consistent HTTP errors
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
