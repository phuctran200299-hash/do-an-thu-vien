import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen, Plus, Users, X } from "lucide-react";
import { createUserApi, getUsersApi, toggleUserActiveApi, updateUserApi } from "../../api/admin";
import { Alert, DataTable, PageHeader, Pagination, Pill, SearchBox, Tabs, UserCell } from "../../components/admin/ui";
import { fmtDate } from "../../components/admin/format";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", address: "", role: "reader" };
const ROLE_TABS = [
  { value: "", label: "Tất cả" },
  { value: "reader", label: "Độc giả" },
  { value: "staff", label: "Nhân viên" },
  { value: "admin", label: "Quản trị" },
];
const ROLE_TONE = { reader: "blue", staff: "violet", admin: "yellow" };

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [alert, setAlert] = useState(null);

  const load = useCallback(() => {
    getUsersApi({ q: q || undefined, role: role || undefined, page }).then((res) => setUsers(res.data));
  }, [q, role, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await createUserApi(form);
      setAlert({ tone: "success", message: res.data.message });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e2) {
      const errors = e2.response?.data?.errors;
      setFormError((errors && Object.values(errors)[0]?.[0]) || e2.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      const res = await updateUserApi(user.id, { role: newRole });
      setAlert({ tone: "success", message: res.data.message });
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể đổi vai trò tài khoản này." });
    } finally {
      load();
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await toggleUserActiveApi(user.id);
      setAlert({ tone: "success", message: res.data.message });
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể khoá/mở khoá tài khoản này." });
    } finally {
      load();
    }
  };

  return (
    <div>
      <PageHeader icon={Users} title="Quản lý tài khoản" subtitle="Tạo tài khoản, phân quyền và khoá/mở khoá người dùng trong hệ thống.">
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Tạo tài khoản
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          tabs={ROLE_TABS}
          value={role}
          onChange={(v) => {
            setRole(v);
            setPage(1);
          }}
        />
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên hoặc email..."
        />
      </div>

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <DataTable
        loading={!users}
        colSpan={6}
        head={
          <>
            <th>Người dùng</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th className="!text-right">Thao tác</th>
          </>
        }
        footer={<Pagination meta={users} onChange={setPage} />}
      >
        {(users?.data || []).map((u) => (
          <tr key={u.id} className={u.is_active ? "" : "opacity-60"}>
            <td>
              <UserCell user={u} />
            </td>
            <td className="whitespace-nowrap">{u.phone || <span className="text-gray-300">—</span>}</td>
            <td>
              <div className="flex items-center gap-2">
                <Pill tone={ROLE_TONE[u.role?.name] || "gray"} dot={false}>
                  {ROLE_TABS.find((r) => r.value === u.role?.name)?.label || "—"}
                </Pill>
                <select
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none focus:border-primary-400"
                  value={u.role?.name || "reader"}
                  onChange={(e) => handleChangeRole(u, e.target.value)}
                  title="Đổi vai trò"
                >
                  <option value="reader">Độc giả</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </td>
            <td className="whitespace-nowrap">{fmtDate(u.created_at)}</td>
            <td>
              <Pill tone={u.is_active ? "green" : "red"}>{u.is_active ? "Hoạt động" : "Đã khoá"}</Pill>
            </td>
            <td>
              <div className="flex justify-end">
                <button onClick={() => handleToggleActive(u)} className={u.is_active ? "act-danger" : "act-success"}>
                  {u.is_active ? <Lock size={14} /> : <LockOpen size={14} />}
                  {u.is_active ? "Khoá" : "Mở khoá"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Tạo tài khoản mới</h2>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              {formError && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className="input" placeholder="Họ tên *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input type="email" className="input" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input
                  type="password"
                  className="input"
                  placeholder="Mật khẩu (≥ 6 ký tự) *"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <input className="input" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="input sm:col-span-2" placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <select className="input sm:col-span-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="reader">Độc giả</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                  Huỷ
                </button>
                <button type="submit" className="btn-primary">
                  Tạo tài khoản
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
