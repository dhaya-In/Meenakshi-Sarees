// src/controllers/product.controller.js
import supabase from "../config/supabase.js";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";

// ── GET /api/products ─────────────────────────────────────────────────────────
// Public — supports filtering, sorting, search, pagination
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    sort = "created_at",
    order = "desc",
    page = 1,
    limit = 12,
    in_stock,
  } = req.query;

  let query = supabase
    .from("products")
    .select("*, categories(id, label, icon, color)", { count: "exact" });

  if (category)  query = query.eq("category_id", category);
  if (in_stock !== undefined) query = query.eq("in_stock", in_stock === "true");
  if (search)    query = query.ilike("name", `%${search}%`);

  // Sorting
  const validSorts = ["price", "created_at", "rating", "name"];
  const sortField = validSorts.includes(sort) ? sort : "created_at";
  query = query.order(sortField, { ascending: order === "asc" });

  // Pagination
  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, parseInt(limit));
  const from = (pageNum - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(`Failed to fetch products: ${error.message}`, 500);

  res.json({
    products: data,
    pagination: {
      total: count,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, label, icon, color)")
    .eq("id", req.params.id)
    .single();

  if (error || !data) throw new AppError("Product not found.", 404);

  res.json({ product: data });
});

// ── POST /api/products  (Admin only) ─────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, category_id, fabric, price, original_price,
    occasion, color, description, image_url, badge, in_stock,
  } = req.body;

  const { data, error } = await supabase
    .from("products")
    .insert([{
      name, category_id, fabric, price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      occasion, color, description, image_url, badge,
      in_stock: in_stock !== false,
      rating: 0, review_count: 0,
    }])
    .select("*, categories(id, label)")
    .single();

  if (error) throw new AppError(`Failed to create product: ${error.message}`, 500);

  res.status(201).json({ message: "Product created.", product: data });
});

// ── PATCH /api/products/:id  (Admin only) ─────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name", "category_id", "fabric", "price", "original_price",
    "occasion", "color", "description", "image_url", "badge", "in_stock",
  ];

  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", req.params.id)
    .select("*, categories(id, label)")
    .single();

  if (error || !data) throw new AppError("Product not found or update failed.", 404);

  res.json({ message: "Product updated.", product: data });
});

// ── DELETE /api/products/:id  (Admin only) ────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", req.params.id);

  if (error) throw new AppError("Failed to delete product.", 500);

  res.json({ message: "Product deleted successfully." });
});

// ── PATCH /api/products/:id/stock  (Admin only) ───────────────────────────────
export const toggleStock = asyncHandler(async (req, res) => {
  const { in_stock } = req.body;

  const { data, error } = await supabase
    .from("products")
    .update({ in_stock, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("id, name, in_stock")
    .single();

  if (error) throw new AppError("Failed to update stock status.", 500);

  res.json({ message: `Stock updated to ${in_stock ? "in stock" : "out of stock"}.`, product: data });
});