import { useEffect, useState } from "react";
import { getStatisticsApi } from "../../api/statistics";
import { aiAdminLogsApi } from "../../api/ai";

function StatCard({ label, value, color }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Bar({ label, value, max, color = "bg-primary-600" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [aiLogs, setAiLogs] = useState(null);

  useEffect(() => {
    getStatisticsApi().then((res) => setStats(res.data));
    aiAdminLogsApi().then((res) => setAiLogs(res.data));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Tổng quan hệ thống</h1>
      {!stats && <p className="text-gray-500">Đang tải thống kê...</p>}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Tổng đầu sách" value={stats.total_books} color="text-primary-600" />
            <StatCard label="Đang mượn" value={stats.currently_borrowed} color="text-blue-600" />
            <StatCard label="Chờ xác nhận" value={stats.pending_requests} color="text-yellow-600" />
            <StatCard label="Quá hạn" value={stats.currently_overdue} color="text-red-600" />
            <StatCard label="Tổng độc giả" value={stats.total_users} color="text-gray-700" />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Lượt mượn miễn phí" value={stats.free_borrow_count} color="text-gray-700" />
            <StatCard label="Lượt mượn có phí" value={stats.paid_borrow_count} color="text-gray-700" />
            <StatCard
              label="Doanh thu mượn sách (30 ngày)"
              value={`${stats.total_revenue.toLocaleString("vi-VN")}đ`}
              color="text-green-600"
            />
            <StatCard
              label="Doanh thu phí phạt"
              value={`${stats.total_fine_revenue.toLocaleString("vi-VN")}đ`}
              color="text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-4 font-semibold text-gray-800">📚 Sách được mượn nhiều nhất (30 ngày)</h2>
              {stats.most_borrowed_books.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>}
              {stats.most_borrowed_books.map((item) => (
                <Bar
                  key={item.book_id}
                  label={item.book?.title || `#${item.book_id}`}
                  value={item.total_borrows}
                  max={stats.most_borrowed_books[0]?.total_borrows || 1}
                />
              ))}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 font-semibold text-gray-800">🏷️ Thể loại được quan tâm nhiều nhất</h2>
              {stats.top_categories.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>}
              {stats.top_categories.map((item) => (
                <Bar
                  key={item.id}
                  label={item.name}
                  value={item.total}
                  max={stats.top_categories[0]?.total || 1}
                  color="bg-purple-500"
                />
              ))}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 font-semibold text-gray-800">💰 Sách có doanh thu cao nhất</h2>
              {stats.top_revenue_books.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>}
              {stats.top_revenue_books.map((item) => (
                <Bar
                  key={item.id}
                  label={item.title}
                  value={Number(item.revenue)}
                  max={Number(stats.top_revenue_books[0]?.revenue) || 1}
                  color="bg-green-500"
                />
              ))}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 font-semibold text-gray-800">🤖 Chức năng AI - sách được đề xuất nhiều nhất</h2>
              {!aiLogs && <p className="text-sm text-gray-500">Đang tải...</p>}
              {aiLogs && aiLogs.top_recommended_books.length === 0 && (
                <p className="text-sm text-gray-500">Chưa có lượt đề xuất nào.</p>
              )}
              {aiLogs?.top_recommended_books.map((item) => (
                <Bar
                  key={item.book_id}
                  label={item.book?.title || `#${item.book_id}`}
                  value={item.total}
                  max={aiLogs.top_recommended_books[0]?.total || 1}
                  color="bg-orange-500"
                />
              ))}
              {aiLogs && (
                <p className="mt-3 text-xs text-gray-400">Tổng số lượt AI xử lý: {aiLogs.total_logs}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
