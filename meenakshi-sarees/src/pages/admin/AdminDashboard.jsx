// pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Package, Tag, Star, ShoppingBag, LogOut, LayoutDashboard, Settings, Scissors } from "lucide-react";
import { formatINR } from "../../utils/helpers.js";
import { api } from "../../utils/api.js";

export default function AdminDashboard({ activeTab, onTabChange, children }) {
  const { products, productsLoading, categories } = useStore();
  const { user, signOut } = useAuth();
  const [pendingAppointments, setPendingAppointments] = useState(0);

  // Poll for new stitching appointment requests so the sidebar badge stays
  // current even if the admin never opens that tab — this is the "message/
  // notification" behavior for new bookings.
  useEffect(() => {
    let cancelled = false;
    const checkPending = async () => {
      try {
        const data = await api.get("/appointments?status=pending");
        if (!cancelled) setPendingAppointments(data.appointments?.length || 0);
      } catch {
        // Silent — sidebar badge just won't update this cycle, not worth a toast.
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 30000); // refresh every 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeTab]); // re-check whenever the admin switches tabs too

  const inStockCount = products.filter((p) => p.in_stock).length;
  const outOfStockCount = products.length - inStockCount;

  const STATS = [
    { icon: <Package size={22} />, label: "Total Products", value: products.length, color: "bg-rose/8 text-rose" },
    { icon: <Tag size={22} />, label: "Categories", value: categories.length, color: "bg-gold/10 text-gold-dark" },
    { icon: <ShoppingBag size={22} />, label: "In Stock", value: inStockCount, color: "bg-emerald-50 text-emerald-600" },
    { icon: <ShoppingBag size={22} />, label: "Out of Stock", value: outOfStockCount, color: "bg-red-50 text-red-600" },
  ];

  const TABS = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "products", label: "Products", icon: <Package size={16} /> },
    { id: "categories", label: "Categories", icon: <Tag size={16} /> },
    { id: "appointments", label: "Appointments", icon: <Scissors size={16} />, badge: pendingAppointments },
  ];

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-60 bg-charcoal text-white flex flex-col fixed top-0 left-0 h-full z-20 shadow-luxury-xl">
        <div className="p-6 border-b border-white/10">
          <p className="font-display text-lg font-bold text-white">
            Meenakshi <span className="text-gold">Admin</span>
          </p>
          <p className="text-xs text-white/40 mt-1">Management Panel</p>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose flex items-center justify-center text-xs font-bold">
              {user?.name[0]}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{user?.name}</p>
              <p className="text-[10px] text-white/40">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? "bg-rose text-white shadow-rose"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
                }`}
            >
              {tab.icon}
              {tab.label}
              {!!tab.badge && (
                <span className="ml-auto bg-gold text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/8 hover:text-white transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gold/10 px-8 py-4 flex items-center justify-between shadow-luxury">
          <h1 className="font-display text-xl font-semibold text-charcoal capitalize">
            {activeTab === "overview" ? "Dashboard Overview" : activeTab}
          </h1>
          <span className="text-xs text-charcoal-muted bg-cream px-3 py-1.5 rounded-full">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        <div className="p-8">
          {/* Stats (always visible on overview) */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-luxury border border-gold/10">
                    <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                      {s.icon}
                    </div>
                    <p className="font-display text-3xl font-bold text-charcoal">{s.value}</p>
                    <p className="text-xs text-charcoal-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent products preview */}
              <div className="bg-white rounded-2xl shadow-luxury border border-gold/10 p-6">
                <h2 className="font-display text-xl font-semibold text-charcoal mb-5">Recent Products</h2>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream transition-colors">
                      <img src={p.image_url} alt={p.name} className="w-12 h-14 rounded-lg object-cover bg-cream-dark flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{p.name}</p>
                        <p className="text-xs text-charcoal-muted">{p.fabric}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-bold text-rose">{formatINR(p.price)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.in_stock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                          {p.in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab content */}
          {children}
        </div>
      </main>
    </div>
  );
}
