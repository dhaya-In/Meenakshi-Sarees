// src/controllers/category.controller.js
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// ── GET /api/categories ───────────────────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("label");

  if (error) throw new AppError(`Failed to fetch categories: ${error.message}`, 500);

  res.json({ categories: data });
});

// ── POST /api/categories  (Admin) ─────────────────────────────────────────────
export const createCategory = asyncHandler(async (req, res) => {
  const { label, icon, color } = req.body;

  if (!label) throw new AppError("Category label is required.", 422);

  const id = label.toLowerCase().replace(/\s+/g, "-");

  const { data, error } = await supabase
    .from("categories")
    .insert([{ id, label, icon: icon || "✨", color: color || "bg-rose-100 text-rose" }])
    .select()
    .single();

  if (error) throw new AppError(`Failed to create category: ${error.message}`, 500);

  res.status(201).json({ message: "Category created.", category: data });
});

// ── PATCH /api/categories/:id  (Admin) ────────────────────────────────────────
export const updateCategory = asyncHandler(async (req, res) => {
  const { label, icon, color } = req.body;

  const { data, error } = await supabase
    .from("categories")
    .update({ label, icon, color })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) throw new AppError("Category not found.", 404);

  res.json({ message: "Category updated.", category: data });
});

// ── DELETE /api/categories/:id  (Admin) ───────────────────────────────────────
export const deleteCategory = asyncHandler(async (req, res) => {
  // Prevent deletion if products are using this category
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", req.params.id);

  if (count > 0) {
    throw new AppError(`Cannot delete — ${count} product(s) use this category.`, 409);
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", req.params.id);

  if (error) throw new AppError("Failed to delete category.", 500);

  res.json({ message: "Category deleted." });
});