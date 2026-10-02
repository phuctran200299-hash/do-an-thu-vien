import { useEffect, useState } from "react";
import { createCategoryApi, deleteCategoryApi, getCategoriesApi, updateCategoryApi } from "../../api/catalog";

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

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
    setError(null);
    try {
      if (editingId) {
        await updateCategoryApi(editingId, form);
      } else {
        await createCategoryApi(form);
      }
      resetForm();
      load();
    } catch (e2) {
      setError(e2.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá thể loại này?")) return;
    try {
      await deleteCategoryApi(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xoá thể loại này.");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Quản lý thể loại sách</h1>

      <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-[2fr_3fr_auto]">
        {error && <p className="sm:col-span-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <input
          className="input"
          placeholder="Tên thể loại"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={resetForm}>
              Huỷ
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tên thể loại</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Mô tả</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.description}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleEdit(c)} className="text-primary-600 hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
