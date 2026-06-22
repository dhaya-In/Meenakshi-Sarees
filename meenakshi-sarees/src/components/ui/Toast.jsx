// components/ui/Toast.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error:   <XCircle size={18} className="text-red-500" />,
  info:    <Info size={18} className="text-blue-500" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 bg-white px-4 py-3
                       rounded-xl shadow-luxury-lg border border-gold/10 animate-fade-up
                       min-w-[260px] max-w-sm"
          >
            {ICONS[t.type]}
            <p className="text-sm font-medium text-charcoal flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-charcoal-muted hover:text-charcoal">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};
