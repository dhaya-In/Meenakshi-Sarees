// src/utils/email.js
import nodemailer from "nodemailer";

// Lazily create the transporter so a missing/bad SMTP config doesn't crash
// the whole server on boot — it only fails when an email is actually sent,
// and that failure is caught and logged, never thrown back at the customer.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  EMAIL_USER / EMAIL_PASS not set — order emails will be skipped.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password — NOT your regular password
    },
  });

  return transporter;
}

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const PAYMENT_LABELS = { cod: "Cash on Delivery", upi: "UPI Payment" };

// Customer-supplied fields (name, address, notes, item names) get interpolated
// directly into HTML emails below. Without escaping, a customer typing
// "<script>" or even "<b>" into any field would have that markup render in
// both their own inbox and the store owner's. Every dynamic value goes
// through this first.
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderItemsTable(items) {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${escapeHtml(i.qty)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatINR(i.unit_price * i.qty)}</td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-family:sans-serif;font-size:14px;">
      <thead>
        <tr style="background:#FBF6EE;">
          <th style="padding:8px 12px;text-align:left;">Item</th>
          <th style="padding:8px 12px;text-align:center;">Qty</th>
          <th style="padding:8px 12px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderAddress(order) {
  return [
    order.company_name,
    order.address_line_1,
    order.address_line_2,
    `${order.city}, ${order.state} ${order.postal_code}`,
    order.country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br/>");
}

/** Sends the "thank you, here's your order" email to the customer. */
export async function sendCustomerOrderEmail(order) {
  const t = getTransporter();
  if (!t || !order.customer_email) return; // no SMTP configured, or guest gave no email

  try {
    await t.sendMail({
      from: `"Meenakshi Sarees" <${process.env.EMAIL_USER}>`,
      to: order.customer_email,
      subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C1A10;">
          <h2 style="color:#8B1C45;">Thank you for your order, ${escapeHtml(order.customer_name)}! 🌸</h2>
          <p>We've received your order and will begin preparing it right away.</p>
          <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
          ${renderItemsTable(order.items)}
          <p><strong>Total: ${formatINR(order.total_amount)}</strong></p>
          <p><strong>Payment Method:</strong> ${escapeHtml(PAYMENT_LABELS[order.payment_method] || order.payment_method)}</p>
          <p><strong>Shipping Address:</strong><br/>${renderAddress(order)}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
          <p style="font-size:12px;color:#8a6a52;">Meenakshi Sarees · Madurai, Tamil Nadu</p>
        </div>
      `,
    });
  } catch (err) {
    // Email failure should never break order placement — log and move on.
    console.error("[email] Failed to send customer order email:", err.message);
  }
}

/** Sends the full order detail alert to the store owner. */
export async function sendStoreOwnerOrderEmail(order) {
  const t = getTransporter();
  const storeEmail = process.env.STORE_EMAIL;
  if (!t || !storeEmail) return;

  try {
    await t.sendMail({
      from: `"Meenakshi Sarees Website" <${process.env.EMAIL_USER}>`,
      to: storeEmail,
      subject: `🛍️ New Order #${order.id.slice(0, 8).toUpperCase()} — ${formatINR(order.total_amount)}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C1A10;">
          <h2 style="color:#8B1C45;">New Order Received</h2>
          <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
          <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(order.phone_number)}</p>
          <p><strong>Email:</strong> ${escapeHtml(order.customer_email) || "Not provided"}</p>
          ${renderItemsTable(order.items)}
          <p><strong>Total: ${formatINR(order.total_amount)}</strong></p>
          <p><strong>Payment Method:</strong> ${escapeHtml(PAYMENT_LABELS[order.payment_method] || order.payment_method)}</p>
          <p><strong>Payment Status:</strong> ${escapeHtml(order.payment_status)}</p>
          ${order.utr_number ? `<p><strong>UTR / Transaction ID:</strong> ${escapeHtml(order.utr_number)}</p>` : ""}
          <p><strong>Shipping Address:</strong><br/>${renderAddress(order)}</p>
          ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send store owner order email:", err.message);
  }
}
