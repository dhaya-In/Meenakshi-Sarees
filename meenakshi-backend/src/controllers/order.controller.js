// src/controllers/order.controller.js
import supabase from "../config/supabase.js";
import { v4 as uuid } from "uuid";
import { AppError, asyncHandler } from "../middleware/error.middleware.js";
import { buildUpiUri } from "../utils/upi.js";
import { sendCustomerOrderEmail, sendStoreOwnerOrderEmail } from "../utils/email.js";

// ── POST /api/orders  (Customer - auth required) ───────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    customer_name, customer_email, phone_number, company_name,
    address_line_1, address_line_2, city, state, postal_code, country,
    payment_method, notes,
  } = req.body;

  // Validate products exist and calculate total — server-side, never trust
  // a client-sent amount.
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, name, price, in_stock")
    .in("id", productIds);

  if (pErr) throw new AppError("Failed to validate products.", 500);

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) throw new AppError(`Product ${item.product_id} not found.`, 404);
    if (!product.in_stock) throw new AppError(`"${product.name}" is out of stock.`, 400);
    return {
      product_id: item.product_id,
      name: product.name, // denormalized for email content & history even if product is later edited/deleted
      qty: item.qty,
      unit_price: product.price,
    };
  });

  const total_amount = orderItems.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const orderId = uuid();

  // COD orders are immediately "cash_on_delivery"; UPI orders start "pending"
  // until the customer confirms payment (or admin verifies the UTR later).
  const payment_status = payment_method === "cod" ? "cash_on_delivery" : "pending";

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert([{
      id: orderId,
      user_id: req.user.id,
      customer_name, customer_email, phone_number, company_name,
      address_line_1, address_line_2, city,
      state: state || "Tamil Nadu",
      postal_code,
      country: country || "India",
      payment_method,
      payment_status,
      total_amount,
      notes,
      status: "pending",
    }])
    .select()
    .single();

  if (oErr) throw new AppError(`Failed to create order: ${oErr.message}`, 500);

  // Insert order items (without the denormalized `name` field — that's
  // for email rendering only, not part of the order_items table schema)
  const itemRows = orderItems.map(({ product_id, qty, unit_price }) => ({
    product_id, qty, unit_price, order_id: orderId,
  }));
  await supabase.from("order_items").insert(itemRows);

  const fullOrder = { ...order, items: orderItems };

  // Fire-and-forget — email failures must never block the customer's
  // order confirmation response.
  sendCustomerOrderEmail(fullOrder);
  sendStoreOwnerOrderEmail(fullOrder);

  // For UPI orders, hand back a ready-to-use payment URI so the frontend
  // can immediately show the deep-link button (mobile) or QR code (desktop)
  // without a second round trip.
  const upi_uri = payment_method === "upi"
    ? buildUpiUri({ amount: total_amount, orderId })
    : null;

  res.status(201).json({
    message: "Order placed successfully!",
    order: fullOrder,
    upi_uri,
  });
});

// ── PATCH /api/orders/:id/confirm-payment  (Customer - auth required) ─────────
// Customer clicks "I have completed payment" after paying via UPI, optionally
// with a UTR/transaction ID. This does NOT verify the payment against a bank
// or gateway (we have none — this is the free/manual UPI flow) — it just
// records the customer's claim so the store owner can verify and confirm.
export const confirmUpiPayment = asyncHandler(async (req, res) => {
  const { utr_number } = req.body;

  const { data: order, error: findErr } = await supabase
    .from("orders")
    .select("id, user_id, payment_method")
    .eq("id", req.params.id)
    .single();

  if (findErr || !order) throw new AppError("Order not found.", 404);
  if (order.user_id !== req.user.id) throw new AppError("Not authorized to update this order.", 403);
  if (order.payment_method !== "upi") throw new AppError("This order is not a UPI payment.", 400);

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      utr_number: utr_number || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) throw new AppError("Failed to update payment status.", 500);

  res.json({ message: "Payment marked as completed. We'll confirm and ship your order shortly!", order: data });
});

// ── GET /api/orders  (Customer - own orders) ──────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new AppError("Failed to fetch orders.", 500);

  res.json({ orders: data });
});

// ── GET /api/orders  (Admin - all orders) ─────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from("orders")
    .select("*, users(name, email), order_items(*, products(name))", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const from = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(from, from + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError("Failed to fetch orders.", 500);

  res.json({ orders: data, total: count });
});

// ── PATCH /api/orders/:id/status  (Admin only) ────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 422);
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("id, status, user_id")
    .single();

  if (error || !data) throw new AppError("Order not found.", 404);

  res.json({ message: `Order status updated to "${status}".`, order: data });
});
