// pages/customer/HomePage.jsx
import { useStore } from "../../context/StoreContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import ProductCard from "../../components/ui/ProductCard.jsx";
import { StarDisplay } from "../../components/ui/StarRating.jsx";
import { TESTIMONIALS, SERVICES } from "../../data/seedData.js";
import Button from "../../components/ui/Button.jsx";
import { Truck, Scissors, Star, Award } from "lucide-react";

const TRUST_BADGES = [
  { icon: <Truck size={18} />,   text: "Free delivery above ₹2000" },
  { icon: <Scissors size={18} />, text: "Expert blouse stitching" },
  { icon: <Star size={18} />,    text: "5000+ happy customers" },
  { icon: <Award size={18} />,   text: "38 years of trust" },
];

export default function HomePage({ onNavigate, onViewProduct }) {
  const { products, addToCart } = useStore();
  const toast = useToast();
  const featured = products.slice(0, 4);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast(`${product.name} added to cart!`, "success");
  };

  return (
    <main className="pt-16">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] bg-luxury flex items-center overflow-hidden">
        {/* BG shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/8 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          {/* Text */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              New Collection Arrived
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold text-charcoal leading-[1.02] mb-5">
              Drape Yourself<br />in <em className="text-rose not-italic">Timeless</em><br />
              <span className="text-gradient">Elegance</span>
            </h1>

            <p className="text-charcoal-muted text-lg leading-relaxed mb-8 max-w-md">
              Discover Madurai's finest Kancheepuram silk, Banarasi, and handloom sarees — woven with tradition, worn with pride.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button variant="rose" size="lg" onClick={() => onNavigate("shop")}>
                Explore Collection →
              </Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate("services")}>
                Book Stitching
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-gold/20">
              {[["38+", "Years of Trust"], ["5000+", "Happy Customers"], ["500+", "Designs"]].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl font-bold text-rose">{num}</p>
                  <p className="text-xs text-charcoal-muted mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="rounded-saree overflow-hidden aspect-[3/4] shadow-luxury-xl max-w-sm mx-auto">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
                alt="Featured saree"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge 1 */}
            <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl p-4 shadow-luxury-lg">
              <p className="text-xs font-semibold text-charcoal">🚚 Free Delivery</p>
              <p className="text-[11px] text-charcoal-muted">Orders above ₹2000</p>
            </div>
            {/* Floating badge 2 */}
            <div className="absolute top-6 -right-6 bg-rose text-white rounded-2xl p-4 shadow-rose">
              <p className="text-xs opacity-80">New In</p>
              <p className="font-display text-lg font-bold">Bridal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ────────────────────────────────────────────── */}
      <section className="bg-charcoal py-5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white/75">
                <span className="text-gold">{b.icon}</span>
                <span className="text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────── */}
      <section className="section-padding bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag">✦ Handpicked</p>
              <h2 className="section-title">Featured Sarees</h2>
            </div>
            <Button variant="ghost" onClick={() => onNavigate("shop")}>View all →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="section-tag">✦ We Offer</p>
            <h2 className="section-title">Stitching & Services</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-6 text-center shadow-luxury border border-gold/10
                                         hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-body font-semibold text-charcoal text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed mb-3">{s.desc}</p>
                <span className="text-xs font-semibold text-rose bg-rose-50 px-3 py-1 rounded-full">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="section-tag">✦ Customer Love</p>
            <h2 className="section-title">What They Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6 border border-gold/15">
                <StarDisplay rating={t.rating} size={14} />
                <p className="text-sm text-charcoal leading-relaxed my-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                    <p className="text-xs text-charcoal-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-rose-dark via-rose to-rose-light">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Can't Find Your Perfect Saree?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            WhatsApp us and our experts will help you choose from over 500 designs.
          </p>
          <Button
            variant="gold"
            size="lg"
            onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || "916380768419"}?text=Hi! I need help choosing a saree.`, "_blank")}
          >
            💬 Chat on WhatsApp
          </Button>
        </div>
      </section>
    </main>
  );
}
