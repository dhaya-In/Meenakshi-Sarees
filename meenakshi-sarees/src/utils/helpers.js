// ── Formatting ─────────────────────────────────────────────────────────────────
export const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const discountPercent = (original, current) =>
  Math.round(((original - current) / original) * 100);

// ── Badge Color Map ─────────────────────────────────────────────────────────────
export const BADGE_STYLES = {
  Bestseller: "bg-gold text-white",
  New:        "bg-emerald-600 text-white",
  Hot:        "bg-rose text-white",
  Premium:    "bg-charcoal text-white",
  Sale:       "bg-orange-500 text-white",
  default:    "bg-gold text-white",
};

export const getBadgeStyle = (badge) =>
  BADGE_STYLES[badge] || BADGE_STYLES.default;

// ── Star Rating ────────────────────────────────────────────────────────────────
export const renderStars = (rating, size = "text-sm") => {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half: i === Math.floor(rating) && rating % 1 >= 0.5,
  }));
};

// ── Validation ─────────────────────────────────────────────────────────────────
export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

// ── Image Upload ───────────────────────────────────────────────────────────────
// In production: upload to Supabase Storage
//   const { data } = await supabase.storage.from('sarees').upload(path, file)
//   const url = supabase.storage.from('sarees').getPublicUrl(path).data.publicUrl
export const readImageAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
