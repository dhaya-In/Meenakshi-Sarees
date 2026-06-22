// src/utils/upi.js
// Generates a standard UPI payment deep-link / QR payload.
// This is the open UPI URI spec supported by every UPI app (GPay, PhonePe,
// Paytm, BHIM, etc.) — no merchant account, no gateway, no fees, no API key.
//
// Spec reference: upi://pay?pa=<payee_vpa>&pn=<payee_name>&am=<amount>&cu=INR&tn=<note>

export function buildUpiUri({ amount, orderId }) {
  const upiId   = process.env.UPI_ID;
  const upiName = process.env.UPI_NAME || "Meenakshi Sarees";

  if (!upiId) {
    throw new Error("UPI_ID is not configured in the backend .env file.");
  }

  const params = new URLSearchParams({
    pa: upiId,                          // payee VPA, e.g. yourshop@okhdfcbank
    pn: upiName,                        // payee display name
    am: Number(amount).toFixed(2),      // amount, 2 decimal places
    cu: "INR",
    tn: `Order ${orderId}`,             // transaction note
  });

  return `upi://pay?${params.toString()}`;
}
