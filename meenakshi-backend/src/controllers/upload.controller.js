// src/controllers/upload.controller.js
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "5");

// ── Multer config (memory storage → upload to Supabase) ──────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    // Pass a plain Error here, not AppError — Multer re-wraps fileFilter
    // errors in its own way, and AppError's extra fields get lost in transit.
    // We translate it properly in handleUploadErrors below instead.
    return cb(new Error("UNSUPPORTED_FILE_TYPE"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

// Wraps upload.single("image") so every failure mode — wrong field name,
// file too large, wrong file type, no file at all — comes back as clear
// JSON with the correct status code, instead of a bare "400 Bad Request"
// with no body that the frontend can't explain to the user.
export const handleSingleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(`Image must be smaller than ${MAX_SIZE_MB}MB.`, 413));
      }
      if (err.code === "LIMIT_UNEXPECTED_FIELD") {
        return next(new AppError(
          `Upload field name mismatch — expected "image" but received "${err.field}".`,
          400
        ));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }

    if (err.message === "UNSUPPORTED_FILE_TYPE") {
      return next(new AppError("Only JPG, PNG, and WebP images are allowed.", 422));
    }

    next(err);
  });
};

// ── POST /api/upload/product-image  (Admin only) ─────────────────────────────
export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file provided.", 422);

  const ext      = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const filename = `products/${uuid()}${ext}`;

  // Upload to Supabase Storage bucket "sarees"
  const { error } = await supabase.storage
    .from("sarees")
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) throw new AppError(`Upload failed: ${error.message}`, 500);

  // Get public URL
  const { data: urlData } = supabase.storage.from("sarees").getPublicUrl(filename);

  res.status(201).json({
    message: "Image uploaded successfully.",
    url: urlData.publicUrl,
    filename,
  });
});

// ── DELETE /api/upload/product-image  (Admin only) ───────────────────────────
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { filename } = req.body;
  if (!filename) throw new AppError("Filename is required.", 422);

  const { error } = await supabase.storage.from("sarees").remove([filename]);
  if (error) throw new AppError("Failed to delete image.", 500);

  res.json({ message: "Image deleted." });
});