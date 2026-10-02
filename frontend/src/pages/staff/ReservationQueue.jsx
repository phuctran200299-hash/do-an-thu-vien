import { useEffect, useState } from "react";
import { getReservationsApi } from "../../api/reservations";

const STATUS_LABEL = {
  cho_sach: { label: "Đang chờ", className: "bg-yellow-100 text-yellow-800" },
  san_sang: { label: "Sẵn sàng", className: "bg-green-100 text-green-800" },
  hoan_tat: { label: "Hoàn tất", className: "bg-gray-100 text-gray-600" },
  da_huy: { label: "Đã huỷ", className: "bg-gray-100 text-gray-500" },
};

export default function ReservationQueue() {
  const [reservations, setReservations] = useState(null);

  useEffect(() => {
    getReservationsApi().then((res) => setReservations(res.data));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Hàng chờ đặt trước sách</h1>
      <p className="mb-4 text-sm text-gray-500">
        Danh sách độc giả đang đặt trước các đầu sách hiện đã hết. Khi sách được trả về, hệ thống tự động chuyển lượt
        đặt trước sớm nhất sang trạng thái "Sẵn sàng".
      </p>

      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Độc giả</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Sách</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Thời gian đặt</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations?.data.map((r) => {
              const info = STATUS_LABEL[r.status] || { label: r.status, className: "bg-gray-100" };
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.user?.name}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">{r.book?.title}</td>
                  <td className="px-4 py-3">{r.created_at?.slice(0, 16).replace("T", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${info.className}`}>{info.label}</span>
                  </td>
                </tr>
              );
            })}
            {reservations && reservations.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Chưa có ai đặt trước sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
