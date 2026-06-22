// pages/admin/ProductsManager.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, ToggleLeft, ToggleRight, X, Package } from "lucide-react";
import { useStore } from "../../context/StoreContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import { Input, Select, Textarea } from "../../components/ui/FormFields.jsx";
import { StarDisplay } from "../../components/ui/StarRating.jsx";
import { formatINR } from "../../utils/helpers.js";
import { api } from "../../utils/api.js";

// Form keys are snake_case to match the Express/Supabase schema directly —
// no translation layer needed between the form and the API payload.
const EMPTY_FORM = {
  name: "", category_id: "silk", fabric: "", price: "", original_price: "",
  occasion: "", color: "", description: "", image_url: "", badge: "", in_stock: true,
};

export default function ProductsManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductStock } = useStore();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.id || "silk" });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name, category_id: product.category_id, fabric: product.fabric,
      price: product.price, original_price: product.original_price,
      occasion: product.occasion, color: product.color,
      description: product.description, image_url: product.image_url,
      badge: product.badge || "", in_stock: product.in_stock,
    });
    setModalOpen(true);
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      // Hits the backend's multer + Supabase Storage endpoint — returns a real
      // public URL, not a base64 blob, so the products table stays lightweight.
      const data = await api.upload("/upload/product-image", formData);
      setForm((f) => ({ ...f, image_url: data.url }));
    } catch (err) {
      toast(err.message || "Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast("Name and price are required.", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
      };
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        toast("Product updated successfully!", "success");
      } else {
        await addProduct(payload);
        toast("Product added successfully!", "success");
      }
      setModalOpen(false);
    } catch (err) {
      // Surfaces real backend errors — e.g. validation messages from
      // express-validator, or a 403 if the JWT isn't an admin token.
      toast(err.message || "Failed to save product.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast("Product deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete product.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = products.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Products</h2>
          <p className="text-sm text-charcoal-muted">{products.length} total products</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1 sm:w-56"
          />
          <Button variant="rose" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxury border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 bg-cream">
                <th className="text-left px-5 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden lg:table-cell">Rating</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Stock</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/8">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt={p.name} className="w-12 h-14 rounded-lg object-cover bg-cream-dark flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">{p.name}</p>
                        <p className="text-xs text-charcoal-muted">{p.fabric}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="badge bg-cream text-charcoal-muted capitalize">{p.categories?.label || p.category_id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-display font-bold text-rose">{formatINR(p.price)}</p>
                    {p.original_price > p.price && (
                      <p className="text-xs text-charcoal-muted line-through">{formatINR(p.original_price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <StarDisplay rating={p.rating} size={12} />
                    <p className="text-xs text-charcoal-muted mt-0.5">({p.review_count})</p>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={async () => {
                        try {
                          await toggleProductStock(p.id, !p.in_stock);
                        } catch (err) {
                          toast(err.message || "Failed to update stock.", "error");
                        }
                      }}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${p.in_stock ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {p.in_stock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {p.in_stock ? "In Stock" : "Out"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-gold/10 text-charcoal-muted hover:text-gold-dark transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-charcoal-muted hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-charcoal-muted">
              <Package size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Image upload */}
          <div>
            <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">Product Image</p>
            <div className="flex items-start gap-4">
              {form.image_url ? (
                <div className="relative w-24 h-28 flex-shrink-0">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-28 flex-shrink-0 border-2 border-dashed border-gold/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-rose/50 transition-colors bg-cream">
                  {uploading ? (
                    <span className="text-[10px] text-charcoal-muted">Uploading...</span>
                  ) : (
                    <>
                      <ImagePlus size={20} className="text-charcoal-muted mb-1" />
                      <span className="text-[10px] text-charcoal-muted">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
              <div className="flex-1">
                <Input label="Or paste image URL" placeholder="https://..." value={form.image_url} onChange={set("image_url")} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name *" placeholder="Kancheepuram Silk Saree" value={form.name} onChange={set("name")} required />
            <Select
              label="Category *"
              value={form.category_id}
              onChange={set("category_id")}
              options={categories.map((c) => ({ value: c.id, label: c.label }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹) *" type="number" placeholder="12500" value={form.price} onChange={set("price")} required />
            <Input label="Original Price (₹)" type="number" placeholder="15000" value={form.original_price} onChange={set("original_price")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fabric" placeholder="Pure Silk" value={form.fabric} onChange={set("fabric")} />
            <Input label="Occasion" placeholder="Bridal, Festival, Daily..." value={form.occasion} onChange={set("occasion")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" placeholder="Deep Red" value={form.color} onChange={set("color")} />
            <Select
              label="Badge"
              value={form.badge}
              onChange={set("badge")}
              options={[{ value: "", label: "None" }, "Bestseller", "New", "Hot", "Premium", "Sale"]}
            />
          </div>

          <Textarea label="Description" placeholder="Describe the saree..." rows={3} value={form.description} onChange={set("description")} />

          <div className="flex items-center gap-3">
            <input type="checkbox" id="instock" checked={form.in_stock} onChange={set("in_stock")} className="accent-rose w-4 h-4" />
            <label htmlFor="instock" className="text-sm font-medium text-charcoal">In Stock</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" variant="rose" loading={saving} fullWidth>
              {editProduct ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product?" size="sm">
        <p className="text-sm text-charcoal-muted mb-6">
          This will permanently remove the product from your collection. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
