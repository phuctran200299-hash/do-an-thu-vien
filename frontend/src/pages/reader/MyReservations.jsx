import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelReservationApi, getMyReservationsApi } from "../../api/reservations";

const STATUS_LABEL = {
  cho_sach: { label: "Đang chờ", className: "bg-yellow-100 text-yellow-800" },
  san_sang: { label: "Sẵn sàng - mời đến mượn", className: "bg-green-100 text-green-800" },
  hoan_tat: { label: "Hoàn tất", className: "bg-gray-100 text-gray-600" },
  da_huy: { label: "Đã huỷ", className: "bg-gray-100 text-gray-500" },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState(null);
  const [message, setMessage] = useState(null);

  const load = () => {
    getMyReservationsApi().then((res) => setReservations(res.data.reservations));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    setMessage(null);
    try {
      await cancelReservationApi(id);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Không thể huỷ lượt đặt trước này.");
      load();
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Sách đã đặt trước</h1>
      <p className="mb-4 text-sm text-gray-500">
        Khi sách bạn đặt trước còn hàng trở lại, trạng thái sẽ chuyển sang "Sẵn sàng" - hãy vào trang chi tiết sách để
        đăng ký mượn ngay.
      </p>

      {message && <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</p>}
      {!reservations && <p className="text-gray-500">Đang tải...</p>}
      {reservations && reservations.length === 0 && <p className="text-gray-500">Bạn chưa đặt trước cuốn sách nào.</p>}

      <div className="space-y-3">
        {reservations?.map((r) => {
          const info = STATUS_LABEL[r.status] || { label: r.status, className: "bg-gray-100 text-gray-700" };
          return (
            <div key={r.id} className="card flex items-center justify-between p-4">
              <div>
                <Link to={`/sach/${r.book?.id}`} className="font-medium text-primary-700 hover:underline">
                  {r.book?.title}
                </Link>
                <p className="text-xs text-gray-500">Đặt trước lúc: {r.created_at?.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${info.className}`}>{info.label}</span>
                {r.status === "cho_sach" && (
                  <button onClick={() => handleCancel(r.id)} className="text-sm text-red-600 hover:underline">
                    Huỷ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
