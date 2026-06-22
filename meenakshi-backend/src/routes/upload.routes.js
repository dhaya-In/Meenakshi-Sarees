// src/routes/upload.routes.js
import { Router } from "express";
import { handleSingleImageUpload, uploadProductImage, deleteProductImage } from "../controllers/upload.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();
router.post  ("/product-image", protect, adminOnly, handleSingleImageUpload, uploadProductImage);
router.delete("/product-image", protect, adminOnly, deleteProductImage);
export default router;