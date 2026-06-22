import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";

// ── Store Context ──────────────────────────────────────────────────────────────
// Every action here calls the live backend (Express → Supabase). Local state is
// just a cache: each mutation re-syncs from the server's response so the UI never
// shows something that isn't actually saved in the database.

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // ── Products ────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const fetchProducts = useCallback(async (params = {}) => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const query = new URLSearchParams(params).toString();
      const data = await api.get(`/products${query ? `?${query}` : ""}`);
      setProducts(data.products || []);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (product) => {
    const data = await api.post("/products", product);
    setProducts((prev) => [data.product, ...prev]);
    return data.product;
  };

  const updateProduct = async (id, updates) => {
    const data = await api.patch(`/products/${id}`, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
    return data.product;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductStock = async (id, inStock) => {
    const data = await api.patch(`/products/${id}/stock`, { in_stock: inStock });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: inStock } : p)));
    return data.product;
  };

  // ── Categories ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await api.get("/categories");
      setCategories(data.categories || []);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = async (category) => {
    const data = await api.post("/categories", category);
    setCategories((prev) => [...prev, data.category]);
    return data.category;
  };

  const updateCategory = async (id, updates) => {
    const data = await api.patch(`/categories/${id}`, updates);
    setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)));
    return data.category;
  };

  const deleteCategory = async (id) => {
    // Backend blocks this with a 409 if products still reference the category —
    // let that error surface to the caller (the admin UI shows it as a toast).
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Reviews ─────────────────────────────────────────────────────────────────
  // Reviews are fetched per-product (not all at once) since they're shown inside
  // the product detail modal. Cache them keyed by productId.
  const [reviewsByProduct, setReviewsByProduct] = useState({});

  const fetchProductReviews = async (productId) => {
    const data = await api.get(`/reviews/${productId}/reviews`);
    setReviewsByProduct((prev) => ({ ...prev, [productId]: data.reviews || [] }));
    return data.reviews || [];
  };

  const addReview = async (review) => {
    const data = await api.post(`/reviews/${review.productId}/reviews`, {
      rating: review.rating,
      comment: review.comment,
    });
    setReviewsByProduct((prev) => ({
      ...prev,
      [review.productId]: [data.review, ...(prev[review.productId] || [])],
    }));
    // The backend already recalculated the product's rating/review_count —
    // refresh that single product so the star average updates everywhere.
    const { product } = await api.get(`/products/${review.productId}`);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    return data.review;
  };

  const getProductReviews = (productId) => reviewsByProduct[productId] || [];

  // ── Cart (stays client-side — carts are session state, not server data) ──────
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((i) => i.id !== id));

  const updateCartQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // ── Orders ──────────────────────────────────────────────────────────────────
  const placeOrder = async (orderPayload) => {
    const data = await api.post("/orders", orderPayload);
    clearCart();
    return data; // full response: { message, order, upi_uri }
  };

  return (
    <StoreContext.Provider
      value={{
        // Products
        products, productsLoading, productsError, fetchProducts,
        addProduct, updateProduct, deleteProduct, toggleProductStock,
        // Categories
        categories, categoriesLoading,
        addCategory, updateCategory, deleteCategory,
        // Reviews
        addReview, getProductReviews, fetchProductReviews,
        // Cart
        cartItems, addToCart, removeFromCart, updateCartQty, clearCart,
        cartTotal, cartCount,
        // Orders
        placeOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
};
