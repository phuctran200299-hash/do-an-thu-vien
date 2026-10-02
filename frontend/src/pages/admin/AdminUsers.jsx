import { useEffect, useState } from "react";
import { createUserApi, getUsersApi, toggleUserActiveApi, updateUserApi } from "../../api/admin";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", address: "", role: "reader" };

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = () => {
    getUsersApi({ q, per_page: 20 }).then((res) => setUsers(res.data));
  };

  useEffect(load, [q]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserApi(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e2) {
      const errors = e2.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0]?.[0] : null;
      setError(firstError || e2.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleChangeRole = async (user, role) => {
    setActionError(null);
    try {
      await updateUserApi(user.id, { role });
    } catch (e) {
      setActionError(e.response?.data?.message || "Không thể đổi vai trò tài khoản này.");
    } finally {
      load();
    }
  };

  const handleToggleActive = async (user) => {
    setActionError(null);
    try {
      await toggleUserActiveApi(user.id);
    } catch (e) {
      setActionError(e.response?.data?.message || "Không thể khoá/mở khoá tài khoản này.");
    } finally {
      load();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Đóng form" : "+ Tạo tài khoản"}
        </button>
      </div>

      <input
        className="input mb-4 max-w-sm"
        placeholder="Tìm theo tên hoặc email..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {actionError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          {error && <p className="sm:col-span-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <input
            className="input"
            placeholder="Họ tên"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            className="input"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            className="input"
            placeholder="Mật khẩu"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            className="input"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="input"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="reader">Độc giả</option>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <button type="submit" className="btn-primary sm:col-span-3">
            Tạo tài khoản
          </button>
        </form>
      )}

      {!users && <p className="text-gray-500">Đang tải...</p>}

      {users && (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.data.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input py-1"
                      value={u.role?.name || "reader"}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                    >
                      <option value="reader">Độc giả</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.is_active ? "Hoạt động" : "Đã khoá"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggleActive(u)} className="text-primary-600 hover:underline">
                      {u.is_active ? "Khoá" : "Mở khoá"}
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
