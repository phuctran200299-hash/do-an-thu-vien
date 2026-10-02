import { useEffect, useState } from "react";
import { getFinesApi, getPaymentsApi, markFinePaidApi } from "../../api/payments";

export default function PaymentsAndFines() {
  const [tab, setTab] = useState("payments");
  const [payments, setPayments] = useState(null);
  const [fines, setFines] = useState(null);

  const loadPayments = () => getPaymentsApi().then((res) => setPayments(res.data));
  const loadFines = () => getFinesApi().then((res) => setFines(res.data));

  useEffect(() => {
    if (tab === "payments") loadPayments();
    else loadFines();
  }, [tab]);

  const handleMarkPaid = async (id) => {
    try {
      await markFinePaidApi(id);
      loadFines();
    } catch (e) {
      alert(e.response?.data?.message || "Không thể xác nhận thu phí phạt.");
    }
  };

  const paymentStatusBadge = (status) => {
    const map = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-700",
    };
    const labels = { paid: "Đã thanh toán", pending: "Chờ thanh toán", failed: "Thất bại/Đã huỷ" };
    return <span className={`badge ${map[status]}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Giao dịch mượn có phí &amp; Phí phạt</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("payments")}
          className={`rounded-full px-3 py-1.5 text-sm ${tab === "payments" ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}
        >
          Thanh toán mượn sách có phí
        </button>
        <button
          onClick={() => setTab("fines")}
          className={`rounded-full px-3 py-1.5 text-sm ${tab === "fines" ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}
        >
          Phí phạt quá hạn
        </button>
      </div>

      {tab === "payments" && (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Độc giả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sách</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Số tiền</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments?.data.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.user?.name}</td>
                  <td className="px-4 py-3">{p.borrow_record?.book?.title}</td>
                  <td className="px-4 py-3">{Number(p.amount).toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3">{paymentStatusBadge(p.payment_status)}</td>
                  <td className="px-4 py-3">{p.paid_at ? p.paid_at.slice(0, 16).replace("T", " ") : "-"}</td>
                </tr>
              ))}
              {payments && payments.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "fines" && (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Độc giả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sách</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Lý do</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Số tiền</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fines?.data.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3">{f.borrow_record?.user?.name}</td>
                  <td className="px-4 py-3">{f.borrow_record?.book?.title}</td>
                  <td className="px-4 py-3">{f.reason}</td>
                  <td className="px-4 py-3">{Number(f.amount).toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${f.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {f.status === "paid" ? "Đã thu" : "Chưa thu"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {f.status === "unpaid" && (
                      <button onClick={() => handleMarkPaid(f.id)} className="text-sm text-primary-600 hover:underline">
                        Xác nhận đã thu tiền
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {fines && fines.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có phí phạt nào.
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
