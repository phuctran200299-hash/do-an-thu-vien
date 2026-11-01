import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookCopy, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { createBookApi, deleteBookApi, getBooksApi, toggleFeaturedApi, updateBookApi } from "../../api/books";
import { getAuthorsApi, getCategoriesApi } from "../../api/catalog";
import { Alert, BookCell, DataTable, PageHeader, Pagination, Pill, SearchBox } from "../../components/admin/ui";
import { money } from "../../components/admin/format";

const EMPTY_FORM = {
  title: "",
  category_id: "",
  cover_image: "",
  description: "",
  quantity: 1,
  borrow_fee: 0,
  status: "available",
  author_ids: [],
};

const STATUS = {
  available: { label: "Đang cung cấp", tone: "green" },
  unavailable: { label: "Ngừng cung cấp", tone: "gray" },
  damaged: { label: "Hư hỏng", tone: "red" },
};

function StockBar({ available, total }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = available === 0 ? "bg-rose-500" : pct < 40 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-28">
      <p className="mb-1 text-xs font-semibold text-gray-700">
        {available} <span className="font-normal text-gray-400">/ {total} bản</span>
      </p>
      <div className="h-1.5 rounded-full bg-gray-100">
        <motion.div className={`h-1.5 rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("");

  const loadBooks = useCallback(
    () => getBooksApi({ q: q || undefined, category_id: categoryId || undefined, page, per_page: 12 }).then((res) => setBooks(res.data)),
    [q, categoryId, page]
  );

  useEffect(() => {
    const t = setTimeout(loadBooks, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadBooks, q]);

  useEffect(() => {
    getCategoriesApi().then((res) => setCategories(res.data.categories));
    getAuthorsApi({ per_page: 200 }).then((res) => setAuthors(res.data.data));
  }, []);

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = { ...form, category_id: form.category_id || null, cover_image: form.cover_image || null };
      const res = editingId ? await updateBookApi(editingId, payload) : await createBookApi(payload);
      setAlert({ tone: "success", message: res.data.message });
      closeForm();
      loadBooks();
    } catch (e2) {
      const errors = e2.response?.data?.errors;
      setFormError((errors && Object.values(errors)[0]?.[0]) || e2.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      category_id: b.category_id || "",
      cover_image: b.cover_image || "",
      description: b.description || "",
      quantity: b.quantity,
      borrow_fee: Number(b.borrow_fee),
      status: b.status,
      author_ids: b.authors?.map((a) => a.id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Xoá sách "${b.title}"?`)) return;
    try {
      const res = await deleteBookApi(b.id);
      setAlert({ tone: "success", message: res.data.message });
      loadBooks();
    } catch (e2) {
      setAlert({ tone: "error", message: e2.response?.data?.message || "Không thể xoá sách." });
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await toggleFeaturedApi(id);
      setAlert({ tone: "success", message: res.data.message });
      loadBooks();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể ghim/bỏ ghim sách này." });
    }
  };

  const toggleAuthor = (id) =>
    setForm((f) => ({
      ...f,
      author_ids: f.author_ids.includes(id) ? f.author_ids.filter((x) => x !== id) : [...f.author_ids, id],
    }));

  const visibleAuthors = authors.filter(
    (a) => form.author_ids.includes(a.id) || a.name.toLowerCase().includes(authorFilter.toLowerCase())
  );

  return (
    <div>
      <PageHeader icon={BookCopy} title="Quản lý sách" subtitle={`Kho sách hiện có ${books?.total ?? "…"} đầu sách. Thêm mới, cập nhật thông tin và ghim sách nổi bật lên trang chủ.`}>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Thêm sách mới
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-3">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên sách hoặc tác giả..."
        />
        <select
          className="input !w-auto !rounded-xl"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả thể loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.books_count})
            </option>
          ))}
        </select>
      </div>

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <DataTable
        loading={!books}
        colSpan={6}
        head={
          <>
            <th>Sách</th>
            <th>Thể loại</th>
            <th>Tồn kho</th>
            <th>Phí mượn</th>
            <th>Tình trạng</th>
            <th className="!text-right">Thao tác</th>
          </>
        }
        footer={<Pagination meta={books} onChange={setPage} />}
      >
        {(books?.data || []).map((b) => (
          <tr key={b.id}>
            <td className="min-w-[260px]">
              <BookCell book={b} sub={b.authors?.map((a) => a.name).join(", ") || "Chưa rõ tác giả"} />
            </td>
            <td>{b.category ? <Pill tone="violet" dot={false}>{b.category.name}</Pill> : <span className="text-gray-300">—</span>}</td>
            <td>
              <StockBar available={b.available_quantity} total={b.quantity} />
            </td>
            <td className="whitespace-nowrap font-semibold">
              {Number(b.borrow_fee) > 0 ? money(b.borrow_fee) : <span className="text-emerald-600">Miễn phí</span>}
            </td>
            <td>
              <Pill tone={STATUS[b.status]?.tone}>{STATUS[b.status]?.label || b.status}</Pill>
            </td>
            <td>
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => handleToggleFeatured(b.id)}
                  className={b.is_featured ? "act-warning" : "act-ghost"}
                  title={b.is_featured ? "Bỏ ghim khỏi trang chủ" : "Ghim làm sách nổi bật"}
                >
                  <Star size={14} fill={b.is_featured ? "currentColor" : "none"} />
                </button>
                <button onClick={() => handleEdit(b)} className="act-primary" title="Sửa">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(b)} className="act-danger" title="Xoá">
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* ============ Form thêm / sửa sách dạng bảng trượt ============ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
            />
            <motion.form
              onSubmit={handleSubmit}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{editingId ? "Cập nhật sách" : "Thêm sách mới"}</h2>
                  <p className="text-xs text-gray-500">Các trường có dấu * là bắt buộc</p>
                </div>
                <button type="button" onClick={closeForm} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {formError && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>}

                <div className="flex gap-4">
                  <div className="h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 shadow-card ring-1 ring-black/5">
                    {form.cover_image && <img src={form.cover_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="label">Tên sách *</label>
                      <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Ảnh bìa (URL)</label>
                      <input
                        className="input"
                        placeholder="https://..."
                        value={form.cover_image}
                        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Thể loại</label>
                    <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">-- Chọn thể loại --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tình trạng</label>
                    <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="available">Đang cung cấp</option>
                      <option value="unavailable">Ngừng cung cấp</option>
                      <option value="damaged">Hư hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Số lượng *</label>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      required
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Phí mượn (đ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="input"
                      value={form.borrow_fee}
                      onChange={(e) => setForm({ ...form, borrow_fee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Mô tả</label>
                  <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div>
                  <label className="label">
                    Tác giả <span className="font-normal text-gray-400">(đã chọn {form.author_ids.length})</span>
                  </label>
                  <input className="input mb-2" placeholder="Lọc tác giả..." value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} />
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-100 p-2">
                    {visibleAuthors.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => toggleAuthor(a.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          form.author_ids.includes(a.id)
                            ? "border-primary-500 bg-primary-600 text-white"
                            : "border-gray-200 text-gray-600 hover:border-primary-300"
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                <button type="button" className="btn-outline" onClick={closeForm}>
                  Huỷ
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Lưu thay đổi" : "Thêm sách"}
                </button>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
