// pages/customer/ContactPage.jsx
import { useState } from "react";
import { CheckCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input, Textarea } from "../../components/ui/FormFields.jsx";
import Button from "../../components/ui/Button.jsx";
import { api } from "../../utils/api.js";

const CONTACT_ITEMS = [
  { icon: <MapPin size={20} />, title: "Visit Us", value: "Meenakshi Sarees, Madurai, Tamil Nadu – 625001" },
  { icon: <Phone size={20} />, title: "Call / WhatsApp", value: `+91 ${import.meta.env.VITE_SHOP_WHATSAPP_NUMBER?.slice(2) || "6380768419"}` },
  { icon: <Mail size={20} />, title: "Email", value: "hello@meenakshisarees.in" },
  { icon: <Clock size={20} />, title: "Hours", value: "Mon – Sat · 9:00 AM – 8:00 PM" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/enquiries", {
        name:    form.name,
        phone:   form.phone,
        email:   form.email || undefined,
        message: form.message,
      });
      setSuccess(true);
      setForm({ name: "", phone: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to send enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal to-charcoal-light py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag text-gold/80">✦ We'd love to hear from you</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
        </div>
      </div>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - info */}
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal mb-4">Visit Meenakshi Sarees</h2>
              <p className="text-charcoal-muted text-sm leading-relaxed mb-8">
                We're located in the heart of Madurai. Come explore over 500 saree designs, or reach out for home delivery and custom orders.
              </p>
              <div className="space-y-4 mb-8">
                {CONTACT_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-luxury">
                    <div className="w-10 h-10 rounded-xl bg-rose/8 text-rose flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-0.5">{item.title}</p>
                      <p className="text-sm text-charcoal">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Map placeholder */}
              <button
                onClick={() => window.open("https://maps.app.goo.gl/gL5dEqn1Yhbbjsts5", "_blank")}
                className="w-full h-48 bg-gradient-to-br from-rose/5 to-gold/10 rounded-2xl border-2 border-dashed border-gold/30
                           flex flex-col items-center justify-center gap-3 hover:border-rose/40 transition-colors"
              >
                <span className="text-3xl">📍</span>
                <p className="text-sm text-charcoal-muted font-medium">Open in Google Maps</p>
                <p className="text-xs text-charcoal-muted opacity-70">Meenakshi Sarees, Madurai</p>
              </button>
            </div>

            {/* Right - form */}
            <div className="bg-white rounded-3xl shadow-luxury-xl p-8 border border-gold/10">
              <h3 className="font-display text-xl font-semibold text-charcoal mb-6">Send an Enquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" placeholder="Your name" value={form.name} onChange={set("name")} required />
                <Input label="Phone" placeholder="98765 43210" value={form.phone} onChange={set("phone")} required />
                <Input label="Email" type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
                <Textarea label="Message" placeholder="I'm looking for a bridal Kancheepuram silk saree..." rows={5} value={form.message} onChange={set("message")} required />
                {success && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle size={16} /> Enquiry sent! We'll reply within 24 hours.
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" variant="rose" fullWidth size="lg" loading={loading}>Send Enquiry →</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
