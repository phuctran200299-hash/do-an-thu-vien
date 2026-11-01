import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Star, Trash2 } from "lucide-react";
import { adminDeleteReviewApi, getAdminReviewsApi } from "../../api/statistics";
import { Alert, Avatar, PageHeader, Pagination, Tabs } from "../../components/admin/ui";
import { fmtDateTime } from "../../components/admin/format";

const RATING_TABS = [
  { value: "", label: "Tất cả" },
  ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} ★` })),
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [alert, setAlert] = useState(null);

  const load = useCallback(() => {
    getAdminReviewsApi({ rating: rating || undefined, page }).then((res) => setReviews(res.data));
  }, [rating, page]);

  useEffect(load, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá đánh giá này vì nội dung không phù hợp?")) return;
    try {
      const res = await adminDeleteReviewApi(id);
      setAlert({ tone: "success", message: res.data.message });
      load();
    } catch (e) {
      setAlert({ tone: "error", message: e.response?.data?.message || "Không thể xoá đánh giá này." });
    }
  };

  return (
    <div>
      <PageHeader
        icon={MessageSquareText}
        title="Kiểm duyệt đánh giá"
        subtitle={`${reviews?.total ?? "…"} đánh giá từ độc giả. Xoá các nhận xét spam hoặc vi phạm nội dung.`}
      />

      <Tabs
        tabs={RATING_TABS}
        value={rating}
        onChange={(v) => {
          setRating(v);
          setPage(1);
        }}
      />

      <Alert message={alert?.message} tone={alert?.tone} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(reviews?.data || []).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card flex gap-4 p-5 hover:shadow-card-hover"
          >
            <Avatar name={r.user?.name || "?"} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{r.user?.name}</p>
                  <p className="truncate text-xs text-gray-400">{r.user?.email}</p>
                </div>
                <div className="flex shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} className={s <= r.rating ? "text-amber-400" : "text-gray-200"} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="mt-2 inline-flex rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600">
                📖 <span className="ml-1 font-semibold">{r.book?.title}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{r.comment || <i className="text-gray-400">Không có nhận xét</i>}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{fmtDateTime(r.created_at)}</span>
                <button onClick={() => handleDelete(r.id)} className="act-danger">
                  <Trash2 size={13} /> Xoá
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {reviews && reviews.data.length === 0 && <p className="py-10 text-center text-gray-500">Không có đánh giá nào.</p>}
      {reviews && (
        <div className="card mt-4">
          <Pagination meta={reviews} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
