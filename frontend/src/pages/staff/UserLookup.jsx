import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BookMarked, Mail, MapPin, Phone, UserSearch, Wallet } from "lucide-react";
import { getUserBorrowHistoryApi, searchStaffUsersApi } from "../../api/statistics";
import StatusBadge from "../../components/StatusBadge";
import { Avatar, BookCell, PageHeader, Pagination, SearchBox } from "../../components/admin/ui";
import { fmtDate, money } from "../../components/admin/format";

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-xl p-3 ${tone}`}>
      <Icon size={16} />
      <p className="mt-2 text-lg font-extrabold">{value}</p>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
    </div>
  );
}

export default function UserLookup() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      searchStaffUsersApi({ q: q || undefined, page }).then((res) => setUsers(res.data));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, page]);

  const viewHistory = async (userId) => {
    const res = await getUserBorrowHistoryApi(userId);
    setSelected(res.data);
  };

  const history = selected?.borrow_history || [];
  const borrowing = history.filter((r) => r.status === "dang_muon" || r.status === "qua_han").length;

  return (
    <div>
      <PageHeader icon={UserSearch} title="Tra cứu độc giả" subtitle="Tìm độc giả để xem lịch sử mượn - trả, tình trạng quá hạn và phí phạt chưa thanh toán.">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Tên hoặc email độc giả..."
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <div className="card h-fit overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Độc giả ({users?.total ?? "…"})
          </div>
          <div className="max-h-[560px] divide-y divide-gray-50 overflow-y-auto">
            {(users?.data || []).map((u) => (
              <button
                key={u.id}
                onClick={() => viewHistory(u.id)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition ${
                  selected?.user?.id === u.id ? "bg-primary-50" : "hover:bg-gray-50"
                }`}
              >
                <Avatar name={u.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{u.name}</p>
                  <p className="truncate text-xs text-gray-500">{u.email}</p>
                </div>
                {!u.is_active && <span className="text-[10px] font-bold text-rose-500">KHOÁ</span>}
              </button>
            ))}
            {users && users.data.length === 0 && <p className="p-6 text-center text-sm text-gray-500">Không tìm thấy độc giả phù hợp.</p>}
          </div>
          <Pagination meta={users} onChange={setPage} />
        </div>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center justify-center gap-3 p-16 text-center text-gray-400">
              <UserSearch size={44} strokeWidth={1.4} />
              <p>Chọn một độc giả ở danh sách bên trái để xem chi tiết.</p>
            </motion.div>
          ) : (
            <motion.div key={selected.user.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="min-w-0 space-y-4">
              <div className="card overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500" />
                <div className="-mt-10 px-6 pb-5">
                  <div className="rounded-full ring-4 ring-white" style={{ width: 72 }}>
                    <Avatar name={selected.user.name} size={72} />
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold text-gray-900">{selected.user.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Mail size={14} /> {selected.user.email}</span>
                    <span className="flex items-center gap-1.5"><Phone size={14} /> {selected.user.phone || "Chưa có SĐT"}</span>
                    {selected.user.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {selected.user.address}</span>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat icon={BookMarked} label="Tổng lượt mượn" value={history.length} tone="bg-primary-50 text-primary-700" />
                    <Stat icon={BookMarked} label="Đang giữ sách" value={borrowing} tone="bg-sky-50 text-sky-700" />
                    <Stat icon={AlertTriangle} label="Đang quá hạn" value={selected.overdue_count} tone="bg-rose-50 text-rose-700" />
                    <Stat icon={Wallet} label="Phạt chưa thu" value={money(selected.unpaid_fine_total)} tone="bg-amber-50 text-amber-700" />
                  </div>
                </div>
              </div>

              <div className="admin-table overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-soft">
                <div className="max-h-[440px] overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th>Sách</th>
                        <th>Ngày mượn</th>
                        <th>Hạn trả</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r) => (
                        <tr key={r.id}>
                          <td className="min-w-[220px]">
                            <BookCell book={r.book} />
                          </td>
                          <td className="whitespace-nowrap">{fmtDate(r.borrow_date)}</td>
                          <td className="whitespace-nowrap">{fmtDate(r.due_date)}</td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {history.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Độc giả chưa có lịch sử mượn sách.</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
