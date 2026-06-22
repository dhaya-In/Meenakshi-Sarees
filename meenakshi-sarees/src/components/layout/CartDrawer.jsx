// components/layout/CartDrawer.jsx
import { useState } from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useStore } from "../../context/StoreContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatINR } from "../../utils/helpers.js";
import Button from "../ui/Button.jsx";
import CheckoutModal from "./CheckoutModal.jsx";

export default function CartDrawer({ isOpen, onClose, onRequireLogin }) {
  const { cartItems, removeFromCart, updateCartQty, cartTotal } = useStore();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-charcoal/50 z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50
                    shadow-luxury-xl flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold/10">
          <div>
            <h3 className="font-display text-xl font-semibold text-charcoal">Your Cart</h3>
            <p className="text-xs text-charcoal-muted mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-dark text-charcoal-muted hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-charcoal-muted">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs opacity-70">Explore our beautiful saree collection!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-cream rounded-xl">
                <img src={item.image_url} alt={item.name} className="w-16 h-20 rounded-lg object-cover bg-cream-dark flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</p>
                  <p className="text-xs text-charcoal-muted mb-2">{item.fabric}</p>
                  <p className="font-display text-base font-bold text-rose">{formatINR(item.price)}</p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center hover:border-rose transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center hover:border-rose transition-colors"
                    >
                      <Plus size={11} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-xs text-charcoal-muted hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gold/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-charcoal">Total</span>
              <span className="font-display text-2xl font-bold text-rose">{formatINR(cartTotal)}</span>
            </div>
            <Button variant="rose" fullWidth size="lg" onClick={handleCheckoutClick}>
              Proceed to Checkout →
            </Button>
            <p className="text-xs text-center text-charcoal-muted">UPI · Cards · Cash on Delivery</p>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
