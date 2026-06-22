// src/routes/review.routes.js
import { Router } from "express";
import { getProductReviews, addReview, deleteReview } from "../controllers/review.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { reviewValidator, validate } from "../middleware/validate.middleware.js";

const router = Router({ mergeParams: true });
router.get   ("/:productId/reviews",  getProductReviews);
router.post  ("/:productId/reviews",  protect, reviewValidator, validate, addReview);
router.delete("/reviews/:id",         protect, adminOnly, deleteReview);
export default router;
