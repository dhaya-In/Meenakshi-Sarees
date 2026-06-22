// pages/customer/ShopPage.jsx
import { useState, useEffect } from "react";
import { Search, X, CheckCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import ProductCard from "../../components/ui/ProductCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { StarDisplay, StarInput } from "../../components/ui/StarRating.jsx";
import Button from "../../components/ui/Button.jsx";
import { Textarea } from "../../components/ui/FormFields.jsx";
import { formatINR, discountPercent, formatDate } from "../../utils/helpers.js";

export default function ShopPage({ onNavigate }) {
  const { products, categories, addToCart, addReview, getProductReviews, fetchProductReviews } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Filter & sort — category_id is the real column name returned by the API
  const filtered = products
    .filter((p) => activeCategory === "all" || p.category_id === activeCategory)
    .filter((p) =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const handleAddToCart = (product) => {
    addToCart(product);
    toast(`${product.name} added to cart!`, "success");
  };

  // Reviews live in a separate table — fetch them fresh each time a product
  // is opened, instead of relying on a local cache that was never populated.
  const openProduct = async (product) => {
    setSelectedProduct(product);
    setReviewsLoading(true);
    try {
      await fetchProductReviews(product.id);
    } catch (err) {
      toast(err.message || "Failed to load reviews.", "error");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast("Please sign in to leave a review.", "error"); return; }
    if (reviewRating === 0) { toast("Please select a star rating.", "error"); return; }
    setReviewSubmitting(true);
    try {
      // The backend reads the reviewer's identity from the JWT, so we only
      // send productId/rating/comment — not a user object.
      await addReview({ productId: selectedProduct.id, rating: reviewRating, comment: reviewComment });
      setReviewRating(0);
      setReviewComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      toast("Review submitted! Thank you.", "success");
    } catch (err) {
      // e.g. "You have already reviewed this product." from the 409 the
      // backend returns on a duplicate review.
      toast(err.message || "Failed to submit review.", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const productReviews = selectedProduct ? getProductReviews(selectedProduct.id) : [];

  return (
    <main className="pt-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-charcoal to-charcoal-light py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag text-gold/80">✦ Browse</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Our Full Collection</h1>
          <p className="text-white/60 mt-2 text-sm">Explore {products.length} handpicked sarees for every occasion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search by name or fabric..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal">
                <X size={16} />
              </button>
            )}
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-full sm:w-44"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
              ${activeCategory === "all" ? "bg-rose text-white border-rose shadow-rose" : "bg-white text-charcoal-muted border-gold/20 hover:border-rose/40"}`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${activeCategory === cat.id ? "bg-rose text-white border-rose shadow-rose" : "bg-white text-charcoal-muted border-gold/20 hover:border-rose/40"}`}
              >
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-charcoal-muted mb-6">
          Showing <strong className="text-charcoal">{filtered.length}</strong> sarees
          {search && <> for "<strong className="text-rose">{search}</strong>"</>}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-charcoal-muted">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-medium text-lg">No sarees found</p>
            <p className="text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                onViewDetails={openProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Product Detail Modal ──────────────────────────────────── */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="" size="xl">
        {selectedProduct && (
          <div className="space-y-8">
            {/* Product Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="rounded-saree overflow-hidden aspect-[3/4] bg-cream-dark">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>

              {/* Details */}
              <div>
                <span className="badge bg-cream-dark text-charcoal-muted mb-3 inline-block">
                  {selectedProduct.categories?.label || categories.find((c) => c.id === selectedProduct.category_id)?.label || selectedProduct.category_id}
                </span>
                <h2 className="font-display text-3xl font-bold text-charcoal mb-2">{selectedProduct.name}</h2>

                <div className="flex items-center gap-3 mb-4">
                  <StarDisplay rating={selectedProduct.rating} size={16} />
                  <span className="text-sm font-medium text-charcoal">{Number(selectedProduct.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-charcoal-muted">({selectedProduct.review_count || 0} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-display text-4xl font-bold text-rose">{formatINR(selectedProduct.price)}</span>
                  {selectedProduct.original_price > selectedProduct.price && (
                    <>
                      <span className="text-base text-charcoal-muted line-through">{formatINR(selectedProduct.original_price)}</span>
                      <span className="badge bg-emerald-100 text-emerald-700">
                        {discountPercent(selectedProduct.original_price, selectedProduct.price)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm text-charcoal-muted leading-relaxed mb-6">{selectedProduct.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  {[["Fabric", selectedProduct.fabric], ["Occasion", selectedProduct.occasion], ["Color", selectedProduct.color], ["Stock", selectedProduct.in_stock ? "In Stock" : "Out of Stock"]].map(([k, v]) => (
                    <div key={k} className="bg-cream rounded-xl p-3">
                      <p className="text-xs text-charcoal-muted mb-0.5">{k}</p>
                      <p className="font-medium text-charcoal">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="rose"
                    fullWidth
                    size="lg"
                    onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                    disabled={!selectedProduct.in_stock}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="gold"
                    onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || "916380768419"}?text=I'm interested in ${selectedProduct.name}`, "_blank")}
                  >
                    💬
                  </Button>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gold/10 pt-8">
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-6">
                Customer Reviews
                <span className="text-sm font-body font-normal text-charcoal-muted ml-2">({productReviews.length})</span>
              </h3>

              {/* Write a review */}
              <div className="bg-cream rounded-2xl p-6 mb-6 border border-gold/10">
                <h4 className="font-medium text-charcoal mb-4">
                  {user ? "Write a Review" : "Sign in to leave a review"}
                </h4>
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <p className="text-xs text-charcoal-muted uppercase tracking-wider mb-2">Your Rating</p>
                      <StarInput value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <Textarea
                      label="Your Comment"
                      placeholder="Share your experience with this saree..."
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                    {reviewSuccess && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl text-sm">
                        <CheckCircle size={16} /> Review submitted successfully!
                      </div>
                    )}
                    <Button type="submit" variant="rose" loading={reviewSubmitting}>
                      Submit Review
                    </Button>
                  </form>
                ) : (
                  <Button variant="outline" onClick={() => { setSelectedProduct(null); onNavigate("login"); }}>
                    Sign In to Review
                  </Button>
                )}
              </div>

              {/* Review list */}
              {reviewsLoading ? (
                <p className="text-sm text-charcoal-muted text-center py-8">Loading reviews...</p>
              ) : productReviews.length === 0 ? (
                <p className="text-sm text-charcoal-muted text-center py-8">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {productReviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-5 border border-gold/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {r.users?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-charcoal">{r.users?.name || "Anonymous"}</p>
                              {r.verified && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                              )}
                            </div>
                            <StarDisplay rating={r.rating} size={12} />
                          </div>
                        </div>
                        <span className="text-xs text-charcoal-muted">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-sm text-charcoal leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
