// src/controllers/review.controller.js
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// ── GET /api/products/:productId/reviews ──────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { data, error } = await supabase
    .from("reviews")
    .select("*, users(name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new AppError("Failed to fetch reviews.", 500);

  res.json({ reviews: data });
});

// ── POST /api/products/:productId/reviews  (Auth required) ───────────────────
export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  // One review per user per product
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();

  if (existing) throw new AppError("You have already reviewed this product.", 409);

  // Check product exists
  const { data: product } = await supabase
    .from("products")
    .select("id, rating, review_count")
    .eq("id", productId)
    .single();

  if (!product) throw new AppError("Product not found.", 404);

  // Insert review
  const { data: review, error } = await supabase
    .from("reviews")
    .insert([{ product_id: productId, user_id: userId, rating, comment, verified: true }])
    .select("*, users(name)")
    .single();

  if (error) throw new AppError("Failed to submit review.", 500);

  // Recalculate product rating in real-time
  const newCount  = product.review_count + 1;
  const newRating = ((product.rating * product.review_count) + rating) / newCount;

  await supabase
    .from("products")
    .update({
      rating: Math.round(newRating * 10) / 10,
      review_count: newCount,
    })
    .eq("id", productId);

  res.status(201).json({ message: "Review submitted. Thank you!", review });
});

// ── DELETE /api/reviews/:id  (Admin only) ─────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
  const { data: review } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .eq("id", req.params.id)
    .single();

  if (!review) throw new AppError("Review not found.", 404);

  await supabase.from("reviews").delete().eq("id", req.params.id);

  // Recalculate product rating after deletion
  const { data: remaining } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", review.product_id);

  const count     = remaining?.length || 0;
  const avgRating = count > 0
    ? remaining.reduce((s, r) => s + r.rating, 0) / count
    : 0;

  await supabase
    .from("products")
    .update({ rating: Math.round(avgRating * 10) / 10, review_count: count })
    .eq("id", review.product_id);

  res.json({ message: "Review deleted." });
});
