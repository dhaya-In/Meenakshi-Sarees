// components/ui/ProductCard.jsx
import { ShoppingCart, Heart } from "lucide-react";
import { StarDisplay } from "./StarRating.jsx";
import { formatINR, discountPercent, getBadgeStyle } from "../../utils/helpers.js";

export default function ProductCard({ product, onAddToCart, onViewDetails }) {
  const discount = discountPercent(product.original_price, product.price);

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-luxury border border-gold/10
                 hover:shadow-luxury-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-cream-dark"
        onClick={() => onViewDetails?.(product)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />

        {/* Badge */}
        {product.badge && (
          <span className={`badge absolute top-3 left-3 ${getBadgeStyle(product.badge)}`}>
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 badge bg-emerald-600 text-white">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-body text-sm font-semibold text-charcoal-muted bg-white px-4 py-2 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100
                           transition-all duration-200 hover:bg-white shadow-luxury text-charcoal-muted hover:text-rose">
          <Heart size={15} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-charcoal-muted mb-1 font-medium">{product.fabric}</p>
        <h3
          className="font-body text-[15px] font-medium text-charcoal mb-2 line-clamp-1 cursor-pointer hover:text-rose transition-colors"
          onClick={() => onViewDetails?.(product)}
        >
          {product.name}
        </h3>

        {/* Stars */}
        {product.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <StarDisplay rating={product.rating} size={13} />
            <span className="text-xs text-charcoal-muted">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display text-xl font-bold text-rose">
            {formatINR(product.price)}
          </span>
          {product.original_price > product.price && (
            <span className="text-xs text-charcoal-muted line-through">
              {formatINR(product.original_price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => product.in_stock && onAddToCart?.(product)}
          disabled={!product.in_stock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 active:scale-95
                      ${product.in_stock
                        ? "bg-charcoal text-white hover:bg-rose"
                        : "bg-cream-dark text-charcoal-muted cursor-not-allowed"
                      }`}
        >
          <ShoppingCart size={15} />
          {product.in_stock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
