// src/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes       from "./routes/auth.routes.js";
import productRoutes    from "./routes/product.routes.js";
import categoryRoutes   from "./routes/category.routes.js";
import reviewRoutes     from "./routes/review.routes.js";
import orderRoutes      from "./routes/order.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import enquiryRoutes    from "./routes/enquiry.routes.js";
import uploadRoutes     from "./routes/upload.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", limiter);

// ── Static uploads ────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/products",     productRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/reviews",      reviewRoutes);
app.use("/api/orders",       orderRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/enquiries",    enquiryRoutes);
app.use("/api/upload",       uploadRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🪔  Meenakshi Sarees API`);
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV}\n`);
});

export default app;