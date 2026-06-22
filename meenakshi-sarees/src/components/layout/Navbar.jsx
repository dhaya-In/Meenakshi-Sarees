// components/layout/Navbar.jsx
import { useState } from "react";
import { ShoppingCart, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useStore } from "../../context/StoreContext.jsx";

export default function Navbar({ currentPage, onNavigate, onCartOpen }) {
  const { user, signOut } = useAuth();
  const { cartCount } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: "home",       label: "Home" },
    { id: "shop",       label: "Collections" },
    { id: "services",   label: "Stitching" },
    { id: "about",      label: "Contact" },
  ];

  const go = (page) => { onNavigate(page); setMobileOpen(false); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-b border-gold/15 shadow-luxury">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => go("home")}
            className="font-display text-xl font-bold text-rose tracking-tight"
          >
            Meenakshi <span className="text-gold">Sarees</span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => go(link.id)}
                  className={`text-sm font-medium transition-colors duration-200
                    ${currentPage === link.id
                      ? "text-rose border-b-2 border-rose pb-0.5"
                      : "text-charcoal hover:text-rose"
                    }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2.5 bg-rose text-white rounded-xl hover:bg-rose-light
                         transition-colors duration-200 shadow-rose"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold text-white
                                 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cream-dark rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-rose text-white flex items-center justify-center text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-xs font-medium text-charcoal">{user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-charcoal-muted hover:text-rose hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("login")}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 border border-rose/30
                           text-rose text-sm font-medium rounded-xl hover:bg-rose hover:text-white transition-all"
              >
                <User size={15} /> Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 text-charcoal-muted hover:text-charcoal"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-gold/10 shadow-luxury md:hidden">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${currentPage === link.id ? "bg-rose-50 text-rose" : "text-charcoal hover:bg-cream"}`}
              >
                {link.label}
              </button>
            ))}
            <hr className="my-2 border-gold/10" />
            {user ? (
              <button onClick={signOut} className="text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2">
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button onClick={() => go("login")} className="text-left px-4 py-3 text-sm text-rose font-medium hover:bg-rose-50 rounded-xl">
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
