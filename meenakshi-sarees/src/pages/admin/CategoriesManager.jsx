// pages/admin/CategoriesManager.jsx
import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useStore } from "../../context/StoreContext.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/FormFields.jsx";

const COLOR_OPTIONS = [
  { value: "bg-rose-100 text-rose",           label: "Rose" },
  { value: "bg-green-50 text-green-700",       label: "Green" },
  { value: "bg-purple-50 text-purple-700",     label: "Purple" },
  { value: "bg-gold-50 text-gold-dark",        label: "Gold" },
  { value: "bg-orange-50 text-orange-700",     label: "Orange" },
  { value: "bg-blue-50 text-blue-700",         label: "Blue" },
  { value: "bg-pink-50 text-pink-700",         label: "Pink" },
  { value: "bg-teal-50 text-teal-700",         label: "Teal" },
];

const EMOJI_OPTIONS = ["✨", "🌿", "💎", "👑", "🪔", "🌸", "🧵", "🎀", "🌺", "✿"];

const EMPTY_FORM = { label: "", icon: "✨", color: COLOR_OPTIONS[0].value };

export default function CategoriesManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" && v.startsWith("[") ? v : v }));
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setEditCat(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ label: cat.label, icon: cat.icon, color: cat.color }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.label) { toast("Category name is required.", "error"); return; }
    setSaving(true);
    try {
      if (editCat) {
        await updateCategory(editCat.id, form);
        toast("Category updated!", "success");
      } else {
        await addCategory(form);
        toast("Category added!", "success");
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || "Failed to save category.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // The backend rejects this with a 409 (and a clear message) if any
      // product still references the category — no need to duplicate that
      // check client-side against stale local data.
      await deleteCategory(id);
      toast("Category deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete category.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Categories</h2>
          <p className="text-sm text-charcoal-muted">{categories.length} categories</p>
        </div>
        <Button variant="rose" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.id).length;
          return (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-luxury border border-gold/10 flex items-start justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${cat.color}`}>
                  {cat.icon}
                </div>
                <div>
                  <p className="font-semibold text-charcoal">{cat.label}</p>
                  <p className="text-xs text-charcoal-muted mt-0.5">{count} product{count !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-gold/10 text-charcoal-muted hover:text-gold-dark transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-charcoal-muted hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? "Edit Category" : "Add Category"} size="sm">
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="Category Name *" placeholder="e.g. Festival, Bridal..." value={form.label} onChange={setField("label")} required />

          {/* Icon picker */}
          <div>
            <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon: em }))}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all
                    ${form.icon === em ? "bg-rose text-white scale-110 shadow-rose" : "bg-cream hover:bg-cream-dark"}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider mb-2">Color Theme</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: col.value }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2
                    ${col.value} ${form.color === col.value ? "border-charcoal scale-105" : "border-transparent"}`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-cream rounded-xl p-4">
            <p className="text-xs text-charcoal-muted mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${form.color}`}>
                {form.icon}
              </div>
              <p className="font-semibold text-charcoal">{form.label || "Category Name"}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" variant="rose" loading={saving} fullWidth>
              {editCat ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category?" size="sm">
        <p className="text-sm text-charcoal-muted mb-6">
          Are you sure you want to delete this category? Products in this category will not be deleted but will lose their category tag.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
