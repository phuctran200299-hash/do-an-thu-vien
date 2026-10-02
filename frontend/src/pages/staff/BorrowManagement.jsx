import { useEffect, useState } from "react";
import {
  approveBorrowApi,
  getBorrowRequestsApi,
  getOverdueBorrowsApi,
  rejectBorrowApi,
  returnBorrowApi,
} from "../../api/borrows";
import StatusBadge from "../../components/StatusBadge";

const TABS = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "dang_muon", label: "Đang mượn" },
  { value: "qua_han", label: "Quá hạn" },
  { value: "da_tra", label: "Đã trả" },
  { value: "da_huy", label: "Đã huỷ" },
];

export default function BorrowManagement() {
  const [status, setStatus] = useState("cho_xac_nhan");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const load = () => {
    setLoading(true);
    const request = status === "qua_han" ? getOverdueBorrowsApi() : getBorrowRequestsApi({ status });
    request.then((res) => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const runAction = async (action, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setMessage(null);
    try {
      const res = await action(id);
      setMessage(res.data.message);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Quản lý mượn - trả sách</h1>

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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Độc giả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sách</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ngày mượn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Hạn trả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Thanh toán</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((r) => {
                const payment = r.payments?.[r.payments.length - 1];
                const unpaidFine = r.fines?.find((f) => f.status === "unpaid");
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.user?.name}</p>
                      <p className="text-xs text-gray-500">{r.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{r.book?.title}</td>
                    <td className="px-4 py-3">{r.borrow_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">{r.due_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {payment && (
                        <span
                          className={`badge ${
                            payment.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.payment_status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                        </span>
                      )}
                      {unpaidFine && (
                        <span className="badge ml-1 bg-red-100 text-red-700">
                          Phạt {Number(unpaidFine.amount).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      {!payment && !unpaidFine && "-"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {r.status === "cho_xac_nhan" && (
                        <>
                          <button
                            onClick={() => runAction(approveBorrowApi, r.id)}
                            className="text-sm font-medium text-green-600 hover:underline"
                            title={
                              payment && payment.payment_status !== "paid"
                                ? "Độc giả chưa thanh toán phí mượn"
                                : undefined
                            }
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => runAction(rejectBorrowApi, r.id, "Từ chối yêu cầu mượn này?")}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {(r.status === "dang_muon" || r.status === "qua_han") && (
                        <button
                          onClick={() => runAction(returnBorrowApi, r.id)}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          Xác nhận trả sách
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
