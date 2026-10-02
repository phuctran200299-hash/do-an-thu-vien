import { useEffect, useState } from "react";
import { adminDeleteReviewApi, getAdminReviewsApi } from "../../api/statistics";

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    getAdminReviewsApi().then((res) => setReviews(res.data));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá đánh giá này vì nội dung không phù hợp?")) return;
    try {
      await adminDeleteReviewApi(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xoá đánh giá này.");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Quản lý đánh giá &amp; nhận xét</h1>
      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="space-y-3">
        {reviews?.data.map((r) => (
          <div key={r.id} className="card flex items-start justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{r.user?.name}</span>
                <span className="text-xs text-gray-400">({r.user?.email})</span>
                <span className="text-yellow-600">{"★".repeat(r.rating)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Sách: <span className="font-medium">{r.book?.title}</span>
              </p>
              {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
              <p className="mt-1 text-xs text-gray-400">{r.created_at?.slice(0, 16).replace("T", " ")}</p>
            </div>
            <button onClick={() => handleDelete(r.id)} className="whitespace-nowrap text-sm text-red-600 hover:underline">
              Xoá
            </button>
          </div>
        ))}
        {reviews && reviews.data.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào trong hệ thống.</p>}
      </div>
    </div>
  );
}
