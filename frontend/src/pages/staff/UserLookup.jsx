import { useState } from "react";
import { getUserBorrowHistoryApi, searchStaffUsersApi } from "../../api/statistics";
import StatusBadge from "../../components/StatusBadge";

export default function UserLookup() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchStaffUsersApi({ q });
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const viewHistory = async (userId) => {
    const res = await getUserBorrowHistoryApi(userId);
    setSelected(res.data);
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Tra cứu &amp; hỗ trợ độc giả</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Tìm theo tên hoặc email độc giả..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Tìm kiếm
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-semibold text-gray-800">Kết quả tìm kiếm</h2>
          {loading && <p className="text-gray-500">Đang tìm...</p>}
          <div className="space-y-2">
            {users?.map((u) => (
              <button
                key={u.id}
                onClick={() => viewHistory(u.id)}
                className={`block w-full rounded-md border p-3 text-left hover:bg-gray-50 ${
                  selected?.user?.id === u.id ? "border-primary-500 bg-primary-50" : "border-gray-200"
                }`}
              >
                <p className="font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email} · {u.phone || "Chưa có SĐT"}</p>
              </button>
            ))}
            {users && users.length === 0 && <p className="text-gray-500">Không tìm thấy độc giả phù hợp.</p>}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold text-gray-800">Lịch sử mượn - trả</h2>
          {!selected && <p className="text-gray-500">Chọn một độc giả để xem chi tiết.</p>}
          {selected && (
            <div>
              <p className="mb-2 text-sm">
                <span className="font-medium">{selected.user.name}</span> - {selected.user.email}
              </p>
              <div className="mb-3 flex gap-2 text-sm">
                <span className="badge bg-red-100 text-red-700">Đang quá hạn: {selected.overdue_count}</span>
                <span className="badge bg-yellow-100 text-yellow-800">
                  Phí phạt chưa thu: {Number(selected.unpaid_fine_total).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {selected.borrow_history.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b pb-2 text-sm">
                    <div>
                      <p className="font-medium">{r.book?.title}</p>
                      <p className="text-xs text-gray-500">
                        {r.borrow_date?.slice(0, 10)} → {r.due_date?.slice(0, 10)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
                {selected.borrow_history.length === 0 && (
                  <p className="text-gray-500">Độc giả chưa có lịch sử mượn sách.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
