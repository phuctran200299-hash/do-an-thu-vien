import { useCallback, useEffect, useState } from "react";
import { PenTool, Pencil, Trash2 } from "lucide-react";
import { createAuthorApi, deleteAuthorApi, getAuthorsApi, updateAuthorApi } from "../../api/catalog";
import { Alert, Avatar, DataTable, PageHeader, Pagination, Pill, SearchBox } from "../../components/admin/ui";

const EMPTY_FORM = { name: "", biography: "" };

export default function AdminAuthors() {
  const [authors, setAuthors] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const load = useCallback(() => {
    getAuthorsApi({ q: q || undefined, page, per_page: 12 }).then((res) => setAuthors(res.data));
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingId ? await updateAuthorApi(editingId, form) : await createAuthorApi(form);
      setAlert({ tone: "success", message: res.data.message });
      resetForm();
      load();
    } catch (e2) {
      setAlert({ tone: "error", message: e2.response?.data?.message || "Có lỗi xảy ra." });
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id);
    setForm({ name: a.name, biography: a.biography || "" });
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Xoá tác giả "${a.name}"?`)) return;
    try {
      const res = await deleteAuthorApi(a.id);
      setAlert({ tone: "success", message: res.data.message });
      load();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể xoá tác giả này." });
    }
  };

  return (
    <div>
      <PageHeader icon={PenTool} title="Quản lý tác giả" subtitle={`Hệ thống đang lưu trữ ${authors?.total ?? "…"} tác giả.`}>
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm tác giả..."
        />
      </PageHeader>

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <form onSubmit={handleSubmit} className="card h-fit space-y-4 p-5 xl:sticky xl:top-24">
          <div>
            <h2 className="font-bold text-gray-900">{editingId ? "Cập nhật tác giả" : "Thêm tác giả mới"}</h2>
            <p className="text-xs text-gray-500">{editingId ? "Đang chỉnh sửa thông tin tác giả đã chọn" : "Nhập tên và tiểu sử ngắn gọn"}</p>
          </div>
          <div>
            <label className="label">Tên tác giả *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Tiểu sử</label>
            <textarea className="input" rows={5} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? "Lưu thay đổi" : "Thêm tác giả"}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={resetForm}>
                Huỷ
              </button>
            )}
          </div>
        </form>

        <DataTable
          loading={!authors}
          colSpan={3}
          head={
            <>
              <th>Tác giả</th>
              <th>Số đầu sách</th>
              <th className="!text-right">Thao tác</th>
            </>
          }
          footer={<Pagination meta={authors} onChange={setPage} />}
        >
          {(authors?.data || []).map((a) => (
            <tr key={a.id} className={editingId === a.id ? "!bg-primary-50" : ""}>
              <td>
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} size={40} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <p className="line-clamp-2 max-w-xl text-xs text-gray-500">{a.biography || "Chưa có tiểu sử."}</p>
                  </div>
                </div>
              </td>
              <td>
                <Pill tone={a.books_count > 0 ? "blue" : "gray"} dot={false}>
                  {a.books_count} sách
                </Pill>
              </td>
              <td>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => handleEdit(a)} className="act-primary" title="Sửa">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(a)} className="act-danger" title="Xoá">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
