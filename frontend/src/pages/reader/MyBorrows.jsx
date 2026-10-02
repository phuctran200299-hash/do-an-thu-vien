import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBorrowApi, getMyBorrowsApi } from "../../api/borrows";
import { payBorrowApi, renewBorrowApi } from "../../api/payments";
import StatusBadge from "../../components/StatusBadge";

const TABS = [
  { value: "", label: "Tất cả" },
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "dang_muon", label: "Đang mượn" },
  { value: "qua_han", label: "Quá hạn" },
  { value: "da_tra", label: "Đã trả" },
  { value: "da_huy", label: "Đã huỷ" },
];

export default function MyBorrows() {
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const load = () => {
    setLoading(true);
    getMyBorrowsApi({ status })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const handleCancel = async (id) => {
    setMessage(null);
    try {
      await cancelBorrowApi(id);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Không thể huỷ yêu cầu này.");
      load();
    }
  };

  const handlePay = async (id) => {
    setMessage(null);
    try {
      const res = await payBorrowApi(id);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Thanh toán thất bại.");
    }
  };

  const handleRenew = async (id) => {
    setMessage(null);
    try {
      const res = await renewBorrowApi(id);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Không thể gia hạn.");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Sách của tôi</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              status === t.value ? "bg-primary-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</p>}
      {loading && <p className="text-gray-500">Đang tải...</p>}

      {data && (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sách</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ngày mượn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Hạn trả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ngày trả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Thanh toán / Phạt</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((r) => {
                const unpaidPayment = r.payments?.find((p) => p.payment_status === "pending");
                const unpaidFine = r.fines?.find((f) => f.status === "unpaid");
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <Link to={`/sach/${r.book?.id}`} className="font-medium text-primary-700 hover:underline">
                        {r.book?.title}
                      </Link>
                      {r.renewed_count > 0 && <p className="text-xs text-gray-400">Đã gia hạn {r.renewed_count} lần</p>}
                    </td>
                    <td className="px-4 py-3">{r.borrow_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">{r.due_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">{r.return_date ? r.return_date.slice(0, 10) : "-"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {unpaidPayment && (
                        <span className="badge bg-yellow-100 text-yellow-800">
                          Chờ thanh toán {Number(unpaidPayment.amount).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      {unpaidFine && (
                        <span className="badge bg-red-100 text-red-700">
                          Phạt {Number(unpaidFine.amount).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      {!unpaidPayment && !unpaidFine && "-"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      {r.status === "cho_xac_nhan" && (
                        <button onClick={() => handleCancel(r.id)} className="text-sm text-red-600 hover:underline">
                          Huỷ
                        </button>
                      )}
                      {unpaidPayment && (
                        <button onClick={() => handlePay(r.id)} className="text-sm text-primary-600 hover:underline">
                          Thanh toán
                        </button>
                      )}
                      {r.status === "dang_muon" && r.renewed_count === 0 && (
                        <button onClick={() => handleRenew(r.id)} className="text-sm text-green-600 hover:underline">
                          Gia hạn
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
