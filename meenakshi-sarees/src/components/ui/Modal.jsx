// components/ui/Modal.jsx
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-luxury-xl
                    animate-fade-up max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/10 flex-shrink-0">
          <h3 className="font-display text-xl font-semibold text-charcoal">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-muted hover:bg-cream-dark hover:text-charcoal transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
