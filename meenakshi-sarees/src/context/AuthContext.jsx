import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api.js";

// ── Auth Context ───────────────────────────────────────────────────────────────
// Talks to the live Express backend (/api/auth/*), which hashes passwords with
// bcrypt and issues a JWT. The token is stored in localStorage and attached to
// every subsequent request by src/utils/api.js.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  // On page load, if a token is already saved, restore the session by asking
  // the backend who it belongs to — this is what makes refresh not log you out.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setCheckingSession(false); return; }

    api.get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setCheckingSession(false));
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { user: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name, email, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { user: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError("");
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkingSession, error, signIn, signUp, signOut, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
