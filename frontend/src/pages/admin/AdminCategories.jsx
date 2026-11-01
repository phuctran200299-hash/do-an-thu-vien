import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Pencil, Tags, Trash2 } from "lucide-react";
import { createCategoryApi, deleteCategoryApi, getCategoriesApi, updateCategoryApi } from "../../api/catalog";
import { Alert, PageHeader } from "../../components/admin/ui";

const EMPTY_FORM = { name: "", description: "" };
const GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-red-600",
];

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const load = () => {
    getCategoriesApi().then((res) => setCategories(res.data.categories));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingId ? await updateCategoryApi(editingId, form) : await createCategoryApi(form);
      setAlert({ tone: "success", message: res.data.message });
      resetForm();
      load();
    } catch (e2) {
      const errors = e2.response?.data?.errors;
      setAlert({ tone: "error", message: (errors && Object.values(errors)[0]?.[0]) || e2.response?.data?.message || "Có lỗi xảy ra." });
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Xoá thể loại "${c.name}"?`)) return;
    try {
      const res = await deleteCategoryApi(c.id);
      setAlert({ tone: "success", message: res.data.message });
      load();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể xoá thể loại này." });
    }
  };

  return (
    <div>
      <PageHeader icon={Tags} title="Quản lý thể loại" subtitle={`${categories?.length ?? "…"} thể loại sách. Thể loại đang có sách sẽ không thể xoá.`} />

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-1 items-end gap-3 p-5 md:grid-cols-[1fr_2fr_auto]">
        <div>
          <label className="label">{editingId ? "Sửa tên thể loại" : "Tên thể loại mới"} *</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Mô tả</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Lưu" : "Thêm thể loại"}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={resetForm}>
              Huỷ
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(categories || []).map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`group card relative overflow-hidden p-5 hover:-translate-y-1 hover:shadow-card-hover ${editingId === c.id ? "ring-2 ring-primary-400" : ""}`}
          >
            <span className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} opacity-10 transition-transform duration-500 group-hover:scale-150`} />
            <div className="relative flex items-start gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} text-white shadow-soft`}>
                <BookOpen size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{c.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{c.description || "Chưa có mô tả."}</p>
                <p className="mt-3 text-2xl font-extrabold text-gray-900">
                  {c.books_count} <span className="text-xs font-medium text-gray-400">đầu sách</span>
                </p>
              </div>
            </div>
            <div className="relative mt-4 flex justify-end gap-1.5 border-t border-gray-100 pt-3">
              <button onClick={() => handleEdit(c)} className="act-primary">
                <Pencil size={13} /> Sửa
              </button>
              <button onClick={() => handleDelete(c)} className="act-danger" disabled={c.books_count > 0} title={c.books_count > 0 ? "Thể loại đang có sách" : "Xoá"}>
                <Trash2 size={13} /> Xoá
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
