import { useEffect, useState } from "react";
import { createBookApi, deleteBookApi, getBooksApi, toggleFeaturedApi, updateBookApi } from "../../api/books";
import { getAuthorsApi, getCategoriesApi } from "../../api/catalog";

const EMPTY_FORM = {
  title: "",
  category_id: "",
  description: "",
  quantity: 1,
  borrow_fee: 0,
  status: "available",
  author_ids: [],
};

export default function AdminBooks() {
  const [books, setBooks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadBooks = () => getBooksApi({ per_page: 20 }).then((res) => setBooks(res.data));

  useEffect(() => {
    loadBooks();
    getCategoriesApi().then((res) => setCategories(res.data.categories));
    getAuthorsApi({ per_page: 100 }).then((res) => setAuthors(res.data.data));
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (editingId) {
        await updateBookApi(editingId, payload);
      } else {
        await createBookApi(payload);
      }
      resetForm();
      loadBooks();
    } catch (e2) {
      setError(e2.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      category_id: b.category_id || "",
      description: b.description || "",
      quantity: b.quantity,
      borrow_fee: b.borrow_fee,
      status: b.status,
      author_ids: b.authors?.map((a) => a.id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá sách này?")) return;
    try {
      await deleteBookApi(id);
      loadBooks();
    } catch (e2) {
      alert(e2.response?.data?.message || "Không thể xoá sách.");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeaturedApi(id);
      loadBooks();
    } catch (e) {
      alert(e.response?.data?.message || "Không thể ghim/bỏ ghim sách này.");
    }
  };

  const toggleAuthor = (id) => {
    setForm((f) => ({
      ...f,
      author_ids: f.author_ids.includes(id) ? f.author_ids.filter((x) => x !== id) : [...f.author_ids, id],
    }));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý sách</h1>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Đóng form" : "+ Thêm sách mới"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 p-4">
          {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tên sách</label>
              <input
                className="input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Thể loại</label>
              <select
                className="input"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">-- Chọn thể loại --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Số lượng</label>
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
                className="input"
                value={form.borrow_fee}
                onChange={(e) => setForm({ ...form, borrow_fee: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Trạng thái</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">Còn cung cấp</option>
                <option value="unavailable">Ngừng cung cấp</option>
                <option value="damaged">Hư hỏng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Mô tả</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Tác giả</label>
            <div className="flex flex-wrap gap-2">
              {authors.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAuthor(a.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    form.author_ids.includes(a.id)
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            {editingId ? "Cập nhật sách" : "Thêm sách"}
          </button>
        </form>
      )}

      {!books && <p className="text-gray-500">Đang tải...</p>}

      {books && (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tên sách</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Thể loại</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">SL còn / tổng</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phí mượn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.data.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                  <td className="px-4 py-3 text-gray-600">{b.category?.name || "-"}</td>
                  <td className="px-4 py-3">
                    {b.available_quantity} / {b.quantity}
                  </td>
                  <td className="px-4 py-3">{Number(b.borrow_fee).toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3 text-gray-600">{b.status}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => handleToggleFeatured(b.id)}
                      className={b.is_featured ? "text-yellow-600 hover:underline" : "text-gray-400 hover:underline"}
                      title="Ghim/bỏ ghim làm sách nổi bật trên trang chủ"
                    >
                      {b.is_featured ? "★ Nổi bật" : "☆ Ghim"}
                    </button>
                    <button onClick={() => handleEdit(b)} className="text-primary-600 hover:underline">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
