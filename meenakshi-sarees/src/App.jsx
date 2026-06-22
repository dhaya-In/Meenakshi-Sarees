// App.jsx - Root router
import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

import Navbar from "./components/layout/Navbar.jsx";
import CartDrawer from "./components/layout/CartDrawer.jsx";
import Footer from "./components/layout/Footer.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/customer/HomePage.jsx";
import ShopPage from "./pages/customer/ShopPage.jsx";
import ServicesPage from "./pages/customer/ServicesPage.jsx";
import ContactPage from "./pages/customer/ContactPage.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProductsManager from "./pages/admin/ProductsManager.jsx";
import CategoriesManager from "./pages/admin/CategoriesManager.jsx";
import AppointmentsManager from "./pages/admin/AppointmentsManager.jsx";

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");

  // Admin panel
  if (user?.role === "admin") {
    return (
      <AdminDashboard activeTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === "products" && <ProductsManager />}
        {adminTab === "categories" && <CategoriesManager />}
        {adminTab === "appointments" && <AppointmentsManager />}
      </AdminDashboard>
    );
  }

  // Login page
  if (page === "login") {
    return <LoginPage onNavigate={setPage} />;
  }

  // Customer layout
  const CUSTOMER_PAGES = {
    home:     <HomePage onNavigate={setPage} onViewProduct={setSelectedProduct} />,
    shop:     <ShopPage onNavigate={setPage} />,
    services: <ServicesPage />,
    about:    <ContactPage />,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} onNavigate={setPage} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRequireLogin={() => { setCartOpen(false); setPage("login"); }}
      />
      <div className="flex-1">
        {CUSTOMER_PAGES[page] || CUSTOMER_PAGES["home"]}
      </div>
      <Footer onNavigate={setPage} />
      {/* WhatsApp FAB */}
      <button
        onClick={() => {
          const shopNumber = import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || "916380768419";
          window.open(`https://wa.me/${shopNumber}?text=Hi! I'm interested in sarees from Meenakshi Sarees`, "_blank");
        }}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#25D366] text-white rounded-full
                   flex items-center justify-center text-2xl shadow-lg hover:scale-110
                   transition-transform duration-200"
        title="Chat on WhatsApp"
      >
        💬
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
