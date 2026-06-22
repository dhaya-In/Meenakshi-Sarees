// pages/customer/ServicesPage.jsx
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { SERVICES } from "../../data/seedData.js";
import { Input, Select, Textarea } from "../../components/ui/FormFields.jsx";
import Button from "../../components/ui/Button.jsx";
import { api } from "../../utils/api.js";

export default function ServicesPage() {
  const [form, setForm] = useState({ name: "", phone: "", service: "Blouse Stitching", date: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments", {
        name:           form.name,
        phone:          form.phone,
        service:        form.service,
        preferred_date: form.date,
        notes:          form.notes || undefined,
      });
      setSuccess(true);
      setForm({ name: "", phone: "", service: "Blouse Stitching", date: "", notes: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal to-charcoal-light py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag text-gold/80">✦ Expert Craftsmanship</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Stitching & Services</h1>
        </div>
      </div>

      {/* Services grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s) => (
              <div key={s.id} className="bg-cream rounded-2xl p-6 text-center border border-gold/10
                                         hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-charcoal mb-2">{s.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed mb-3">{s.desc}</p>
                <span className="badge bg-rose-50 text-rose">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking section */}
      <section className="py-16 bg-gradient-to-br from-rose-dark to-rose">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-white">
              <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-4">✦ Book Now</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
                Schedule Your Stitching Appointment
              </h2>
              <p className="text-white/75 text-base leading-relaxed mb-8">
                Our expert tailors ensure a perfect fit every single time. Book online and we'll confirm within the hour.
              </p>
              <ul className="space-y-3">
                {["Ready in 2–3 working days", "Free fitting alteration included", "All styles: readymade, designer & bridal", "Home pickup available in Madurai"].map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-luxury-xl p-8">
              <h3 className="font-display text-xl font-semibold text-charcoal mb-6">Appointment Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="Priya" value={form.name} onChange={set("name")} required />
                  <Input label="Phone" placeholder="98765 43210" value={form.phone} onChange={set("phone")} required />
                </div>
                <Select
                  label="Service"
                  value={form.service}
                  onChange={set("service")}
                  options={["Blouse Stitching", "Fall & Edging", "Alteration", "Custom Design"]}
                />
                <Input label="Preferred Date" type="date" value={form.date} onChange={set("date")} required />
                <Textarea label="Notes / Measurements" placeholder="Bust: 36, waist: 28, style preference..." rows={3} value={form.notes} onChange={set("notes")} />

                {success && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle size={16} /> Appointment booked! We'll call you shortly to confirm.
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" variant="rose" fullWidth size="lg" loading={loading}>
                  Confirm Appointment →
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
