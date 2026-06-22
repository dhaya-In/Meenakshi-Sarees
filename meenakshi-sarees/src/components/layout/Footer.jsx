// components/layout/Footer.jsx

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-charcoal text-white/70">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-display text-xl font-bold text-white mb-3">
              Meenakshi <span className="text-gold">Sarees</span>
            </p>
            <p className="text-sm leading-relaxed opacity-70">
              Madurai's trusted destination for premium sarees since 1985. Celebrating womanhood, one drape at a time.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">Shop</p>
            <ul className="space-y-2 text-sm">
              {["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Collection", "New Arrivals"].map((l) => (
                <li key={l}>
                  <button onClick={() => onNavigate("shop")} className="hover:text-white transition-colors">{l}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">Services</p>
            <ul className="space-y-2 text-sm">
              {["Blouse Stitching", "Fall & Edging", "Alteration", "Home Delivery", "Bulk Orders"].map((l) => (
                <li key={l}>
                  <button onClick={() => onNavigate("services")} className="hover:text-white transition-colors">{l}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">Contact</p>
            <ul className="space-y-2 text-sm">
              <li>📍 Madurai, Tamil Nadu</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ hello@meenakshisarees.in</li>
              <li className="pt-2 opacity-80">Mon – Sat · 9 AM – 8 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-60">
          <p>© 2025 Meenakshi Sarees, Madurai. All rights reserved.</p>
          <p>Made with ♥ for Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
