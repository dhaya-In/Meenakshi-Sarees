// components/ui/StarRating.jsx
import { useState } from "react";
import { Star } from "lucide-react";

// Display-only star rating
export function StarDisplay({ rating, size = 14, showNumber = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "text-gold fill-gold" : "text-charcoal/20"}
        />
      ))}
      {showNumber && (
        <span className="text-xs font-medium text-charcoal-muted ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// Interactive star rating input
export function StarInput({ value = 0, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starVal = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starVal)}
            onMouseEnter={() => setHovered(starVal)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={size}
              className={
                starVal <= (hovered || value)
                  ? "text-gold fill-gold"
                  : "text-charcoal/25 hover:text-gold"
              }
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-sm font-medium text-charcoal-muted ml-2">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}
