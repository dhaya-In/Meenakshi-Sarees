// pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Input } from "../components/ui/FormFields.jsx";
import Button from "../components/ui/Button.jsx";
import { ShieldCheck, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onNavigate }) {
  const { signIn, signUp, loading, error, setError } = useAuth();
  const [mode, setMode] = useState("customer"); // "customer" | "admin"
  const [tab, setTab] = useState("login");       // "login" | "register"
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === "login") {
      const { user } = await signIn(form.email, form.password);
      if (user) onNavigate(user.role === "admin" ? "admin" : "home");
    } else {
      const { user } = await signUp(form.name, form.email, form.password);
      if (user) onNavigate("home");
    }
  };

  return (
    <div className="min-h-screen bg-luxury flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-rose">
            Meenakshi <span className="text-gold">Sarees</span>
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">Madurai's Finest Collection</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-cream-dark rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode("customer"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${mode === "customer" ? "bg-white text-charcoal shadow-luxury" : "text-charcoal-muted hover:text-charcoal"}`}
          >
            <User size={16} /> Customer
          </button>
          <button
            onClick={() => { setMode("admin"); setTab("login"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${mode === "admin" ? "bg-white text-charcoal shadow-luxury" : "text-charcoal-muted hover:text-charcoal"}`}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-luxury-xl p-8 border border-gold/10">
          {/* Admin badge */}
          {mode === "admin" && (
            <div className="flex items-center gap-2 bg-rose/8 border border-rose/20 rounded-xl px-4 py-3 mb-6">
              <ShieldCheck size={16} className="text-rose flex-shrink-0" />
              <p className="text-xs text-rose font-medium">Admin access — restricted to authorized personnel only.</p>
            </div>
          )}

          {/* Customer tabs */}
          {mode === "customer" && (
            <div className="flex border-b border-gold/15 mb-6">
              {["login", "register"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 pb-3 text-sm font-medium capitalize transition-colors duration-200
                    ${tab === t
                      ? "text-rose border-b-2 border-rose"
                      : "text-charcoal-muted hover:text-charcoal"
                    }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && mode === "customer" && (
              <Input
                label="Full Name"
                placeholder="Priya Lakshmi"
                value={form.name}
                onChange={set("name")}
                required
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder={mode === "admin" ? "admin@meenakshisarees.in" : "you@email.com"}
              value={form.email}
              onChange={set("email")}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-charcoal-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" variant="rose" fullWidth size="lg" loading={loading} className="mt-2">
              {loading ? "Please wait..." : mode === "admin" ? "Access Admin Panel" : tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-cream rounded-xl border border-gold/15">
            <p className="text-xs font-semibold text-charcoal-muted mb-1.5">Demo Credentials</p>
            {mode === "admin" ? (
              <p className="text-xs text-charcoal-muted">admin@meenakshisarees.in / admin123</p>
            ) : (
              <p className="text-xs text-charcoal-muted">priya@email.com / priya123 — or register new</p>
            )}
          </div>

          <button
            onClick={() => onNavigate("home")}
            className="w-full mt-4 text-xs text-charcoal-muted hover:text-rose transition-colors text-center"
          >
            ← Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
