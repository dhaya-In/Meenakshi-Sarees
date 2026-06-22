// components/layout/CheckoutModal.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
import {
  Wallet, Smartphone, Banknote, CheckCircle2, Copy, ExternalLink, Loader2,
} from "lucide-react";
import { useStore } from "../../context/StoreContext.jsx";
import { useToast } from "../ui/Toast.jsx";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { Input, Textarea } from "../ui/FormFields.jsx";
import { formatINR, validateEmail, validatePhone } from "../../utils/helpers.js";
import { api } from "../../utils/api.js";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: <Banknote size={18} />, desc: "Pay when your order arrives" },
  { id: "upi", label: "UPI Payment",      icon: <Smartphone size={18} />, desc: "GPay, PhonePe, Paytm & more — free, no extra charges" },
];

const EMPTY_FORM = {
  customer_name: "", customer_email: "", phone_number: "", company_name: "",
  address_line_1: "", address_line_2: "", city: "", state: "Tamil Nadu",
  postal_code: "", country: "India", notes: "",
};

const POSTAL_CODE_RE = /^\d{6}$/;

// Detects whether the customer is likely on a phone — used to decide between
// "launch the UPI app directly" (mobile) vs "show a QR code to scan" (desktop).
// This is a best-effort heuristic (User-Agent sniffing is never 100% reliable)
// but it's the standard approach for this kind of UX branching.
function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, cartTotal, placeOrder } = useStore();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  // Result state after the order has actually been created server-side.
  const [placedOrder, setPlacedOrder] = useState(null); // { order, upi_uri } | null
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [utrInput, setUtrInput] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const isMobile = useMemo(() => isMobileDevice(), []);

  // Reset everything each time the modal opens fresh.
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setPaymentMethod("cod");
      setPlacedOrder(null);
      setQrDataUrl("");
      setUtrInput("");
      setPaymentConfirmed(false);
    }
  }, [isOpen]);

  // Generate the QR code on desktop the moment we have a UPI URI.
  useEffect(() => {
    if (!placedOrder?.upi_uri || isMobile) return;
    QRCode.toDataURL(placedOrder.upi_uri, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => toast("Couldn't generate the QR code — try the copy link instead.", "error"));
  }, [placedOrder, isMobile, toast]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((e2) => ({ ...e2, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.customer_name.trim()) next.customer_name = "Full name is required.";
    if (!form.customer_email.trim()) next.customer_email = "Email is required.";
    else if (!validateEmail(form.customer_email)) next.customer_email = "Enter a valid email address.";
    if (!form.phone_number.trim()) next.phone_number = "Phone number is required.";
    else if (!validatePhone(form.phone_number)) next.phone_number = "Enter a valid 10-digit Indian mobile number.";
    if (!form.address_line_1.trim()) next.address_line_1 = "Address Line 1 is required.";
    if (!form.city.trim()) next.city = "City / Town is required.";
    if (!form.postal_code.trim()) next.postal_code = "Postal code is required.";
    else if (!POSTAL_CODE_RE.test(form.postal_code.trim())) next.postal_code = "Enter a valid 6-digit postal code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }

    setPlacing(true);
    try {
      const data = await placeOrder({
        items: cartItems.map((i) => ({ product_id: i.id, qty: i.qty })),
        ...form,
        payment_method: paymentMethod,
      });
      // placeOrder (StoreContext) returns the raw API response body
      setPlacedOrder({ order: data.order, upi_uri: data.upi_uri });
      toast("Order placed successfully!", "success");
    } catch (err) {
      toast(err.message || "Failed to place order.", "error");
    } finally {
      setPlacing(false);
    }
  };

  const handleConfirmPayment = async () => {
    setConfirmingPayment(true);
    try {
      await api.patch(`/orders/${placedOrder.order.id}/confirm-payment`, {
        utr_number: utrInput.trim() || undefined,
      });
      setPaymentConfirmed(true);
      toast("Payment marked as completed!", "success");
    } catch (err) {
      toast(err.message || "Failed to confirm payment.", "error");
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(placedOrder.upi_uri);
    toast("UPI link copied!", "success");
  };

  const buildWhatsAppMessage = () => {
    const order = placedOrder.order;
    const itemsList = order.items
      .map((i) => `• ${i.name} × ${i.qty} — ${formatINR(i.unit_price * i.qty)}`)
      .join("\n");
    const address = [form.address_line_1, form.address_line_2, `${form.city}, ${form.state} ${form.postal_code}`, form.country]
      .filter(Boolean).join(", ");

    return [
      `🧵 *New Order* #${order.id.slice(0, 8).toUpperCase()}`,
      ``,
      `*Customer:* ${form.customer_name}`,
      `*Phone:* ${form.phone_number}`,
      `*Address:* ${address}`,
      ``,
      `*Items:*`,
      itemsList,
      ``,
      `*Total:* ${formatINR(order.total_amount)}`,
      `*Payment:* ${paymentMethod === "cod" ? "Cash on Delivery" : "UPI Payment"}`,
    ].join("\n");
  };

  const handleSendWhatsApp = () => {
    const shopNumber = import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || "916380768419";
    const message = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${shopNumber}?text=${message}`, "_blank");
  };

  // ── Success / payment screen, shown once the order exists server-side ──────
  if (placedOrder) {
    const order = placedOrder.order;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="font-display text-2xl font-bold text-charcoal mb-1">Order Placed!</h3>
          <p className="text-sm text-charcoal-muted">Order ID: <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span></p>
        </div>

        {/* UPI payment step */}
        {paymentMethod === "upi" && !paymentConfirmed && (
          <div className="bg-cream rounded-2xl p-5 mb-5 text-center">
            <p className="text-sm font-medium text-charcoal mb-1">
              Pay {formatINR(order.total_amount)} via UPI
            </p>
            <p className="text-xs text-charcoal-muted mb-4">to complete your order</p>

            {isMobile ? (
              <a
                href={placedOrder.upi_uri}
                className="inline-flex items-center gap-2 bg-rose text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-rose-light transition-colors"
              >
                <Smartphone size={16} />
                Pay via UPI App (Google Pay / PhonePe / Paytm)
              </a>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="UPI payment QR code" className="mx-auto rounded-xl border border-gold/20" />
            ) : (
              <div className="flex items-center justify-center py-8 text-charcoal-muted">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}

            <button
              onClick={handleCopyUpiLink}
              className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-charcoal-muted hover:text-rose transition-colors"
            >
              <Copy size={12} /> Copy UPI link
            </button>

            <div className="border-t border-gold/15 mt-4 pt-4">
              <Input
                label="UTR / Transaction ID (optional)"
                placeholder="e.g. 123456789012"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
              />
              <Button
                variant="rose"
                fullWidth
                className="mt-3"
                loading={confirmingPayment}
                onClick={handleConfirmPayment}
              >
                I have completed payment
              </Button>
            </div>
          </div>
        )}

        {(paymentMethod === "cod" || paymentConfirmed) && (
          <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm text-center mb-5">
            {paymentMethod === "cod"
              ? "You'll pay in cash when your order is delivered."
              : "Payment recorded — we'll verify and confirm shortly."}
          </div>
        )}

        {/* Order summary */}
        <div className="space-y-2 mb-5">
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-charcoal-muted">{i.name} × {i.qty}</span>
              <span className="text-charcoal font-medium">{formatINR(i.unit_price * i.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-gold/15">
            <span>Total</span>
            <span className="text-rose font-display text-xl">{formatINR(order.total_amount)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={handleSendWhatsApp}>
            <ExternalLink size={15} /> Send Order to WhatsApp
          </Button>
          <Button variant="rose" fullWidth onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Checkout form ────────────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <form onSubmit={handlePlaceOrder} className="space-y-6">
        {/* Order summary */}
        <div className="bg-cream rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm text-charcoal-muted">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
          <span className="font-display text-xl font-bold text-rose">{formatINR(cartTotal)}</span>
        </div>

        {/* Contact details */}
        <div>
          <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Contact Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.customer_name} onChange={set("customer_name")} error={errors.customer_name} />
            <Input label="Email Address *" type="email" value={form.customer_email} onChange={set("customer_email")} error={errors.customer_email} />
            <Input label="Phone Number *" placeholder="98765 43210" value={form.phone_number} onChange={set("phone_number")} error={errors.phone_number} />
            <Input label="Company / Business Name (optional)" value={form.company_name} onChange={set("company_name")} />
          </div>
        </div>

        {/* Shipping address */}
        <div>
          <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Shipping Address</p>
          <div className="space-y-4">
            <Input label="Address Line 1 *" value={form.address_line_1} onChange={set("address_line_1")} error={errors.address_line_1} />
            <Input label="Address Line 2 (optional)" value={form.address_line_2} onChange={set("address_line_2")} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City / Town *" value={form.city} onChange={set("city")} error={errors.city} />
              <Input label="State / Province" value={form.state} onChange={set("state")} />
              <Input label="ZIP / Postal Code *" placeholder="625001" value={form.postal_code} onChange={set("postal_code")} error={errors.postal_code} />
            </div>
            <Input label="Country" value={form.country} onChange={set("country")} />
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Wallet size={13} /> Payment Method
          </p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left
                  ${paymentMethod === pm.id ? "border-rose bg-rose-50" : "border-gold/20 hover:border-rose/30"}`}
              >
                <span className={paymentMethod === pm.id ? "text-rose" : "text-charcoal-muted"}>{pm.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{pm.label}</p>
                  <p className="text-xs text-charcoal-muted">{pm.desc}</p>
                </div>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${paymentMethod === pm.id ? "border-rose bg-rose" : "border-charcoal/20"}`} />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Order Notes (optional)"
          placeholder="Any special instructions..."
          rows={2}
          value={form.notes}
          onChange={set("notes")}
        />

        <Button type="submit" variant="rose" fullWidth size="lg" loading={placing}>
          Place Order — {formatINR(cartTotal)}
        </Button>
      </form>
    </Modal>
  );
}
