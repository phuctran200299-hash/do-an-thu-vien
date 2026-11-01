import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BookCopy, BookOpenCheck, Bot, Clock, Coins, Gavel, TrendingUp, Users } from "lucide-react";
import { getStatisticsApi } from "../../api/statistics";
import { aiAdminLogsApi } from "../../api/ai";
import { CountUp } from "../../components/Motion";
import { useAuth } from "../../context/AuthContext";
import RevenueChart from "../../components/admin/RevenueChart";
import { BookCell } from "../../components/admin/ui";
import { money } from "../../components/admin/format";

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const cell = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const RANGES = [
  { days: 7, label: "7 ngày" },
  { days: 30, label: "30 ngày" },
  { days: 90, label: "90 ngày" },
];

function Kpi({ icon: Icon, label, value, format, tone, to, hint }) {
  const body = (
    <motion.div variants={cell} whileHover={{ y: -4 }} className="card group relative h-full overflow-hidden p-5 hover:shadow-card-hover">
      <span className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 ${tone.bg}`} />
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-soft ${tone.bg}`}>
          <Icon size={20} />
        </span>
        {to && <ArrowRight size={16} className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-primary-500" />}
      </div>
      <p className="mt-4 text-[28px] font-extrabold leading-none text-gray-900">
        <CountUp value={value} format={format} />
      </p>
      <p className="mt-1.5 text-sm font-medium text-gray-500">{label}</p>
      {hint && <p className={`mt-1 text-xs font-semibold ${tone.text}`}>{hint}</p>}
    </motion.div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function RankRow({ rank, children, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`w-5 text-center text-sm font-extrabold ${rank <= 3 ? "text-primary-600" : "text-gray-300"}`}>{rank}</span>
      <div className="min-w-0 flex-1">
        {children}
        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
          <motion.div
            className={`h-1.5 rounded-full ${color}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [aiLogs, setAiLogs] = useState(null);

  useEffect(() => {
    const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
    getStatisticsApi({ from }).then((res) => setStats(res.data));
  }, [days]);

  useEffect(() => {
    aiAdminLogsApi().then((res) => setAiLogs(res.data));
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const statusTotal = stats ? stats.currently_borrowed + stats.currently_returned + stats.currently_overdue + stats.pending_requests : 0;
  const statusRows = stats
    ? [
        { label: "Đang mượn", value: stats.currently_borrowed, color: "bg-sky-500" },
        { label: "Đã trả", value: stats.currently_returned, color: "bg-emerald-500" },
        { label: "Chờ xác nhận", value: stats.pending_requests, color: "bg-amber-500" },
        { label: "Quá hạn", value: stats.currently_overdue, color: "bg-rose-500" },
      ]
    : [];

  return (
    <div>
      {/* ============ Lời chào + chọn khoảng thời gian ============ */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#141b45] via-primary-700 to-accent-600 p-6 text-white shadow-card sm:p-8">
        <div className="blob -right-10 -top-16 h-56 w-56 bg-accent-400" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70">{greet},</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{user?.name} 👋</h1>
            <p className="mt-1 text-sm text-white/70">Đây là tình hình hoạt động của thư viện trong {days} ngày gần nhất.</p>
          </div>
          <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${days === r.days ? "bg-white text-primary-700 shadow" : "text-white/80 hover:text-white"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-36" />
          ))}
        </div>
      ) : (
        <>
          <motion.div variants={grid} initial="hidden" animate="show" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi icon={BookCopy} label="Đầu sách trong kho" value={stats.total_books} tone={{ bg: "bg-primary-600", text: "text-primary-600" }} to="/quan-tri/sach" />
            <Kpi icon={BookOpenCheck} label="Sách đang được mượn" value={stats.currently_borrowed} tone={{ bg: "bg-sky-500", text: "text-sky-600" }} to="/nhan-vien/muon-tra" />
            <Kpi
              icon={Clock}
              label="Yêu cầu chờ xác nhận"
              value={stats.pending_requests}
              tone={{ bg: "bg-amber-500", text: "text-amber-600" }}
              to="/nhan-vien/muon-tra"
              hint={stats.pending_requests > 0 ? "Cần xử lý ngay" : undefined}
            />
            <Kpi
              icon={AlertTriangle}
              label="Giao dịch quá hạn"
              value={stats.currently_overdue}
              tone={{ bg: "bg-rose-500", text: "text-rose-600" }}
              to="/nhan-vien/muon-tra"
              hint={stats.currently_overdue > 0 ? "Cần nhắc độc giả trả sách" : undefined}
            />
            <Kpi icon={Users} label="Độc giả đăng ký" value={stats.total_users} tone={{ bg: "bg-violet-500", text: "text-violet-600" }} to="/quan-tri/nguoi-dung" />
            <Kpi icon={Coins} label={`Doanh thu phí mượn (${days} ngày)`} value={stats.total_revenue} format={(v) => money(Math.round(v))} tone={{ bg: "bg-emerald-500", text: "text-emerald-600" }} />
            <Kpi icon={Gavel} label={`Phí phạt đã thu (${days} ngày)`} value={stats.total_fine_revenue} format={(v) => money(Math.round(v))} tone={{ bg: "bg-orange-500", text: "text-orange-600" }} />
            <Kpi icon={Gavel} label="Phí phạt chưa thu" value={stats.unpaid_fine_total} format={(v) => money(Math.round(v))} tone={{ bg: "bg-gray-700", text: "text-gray-600" }} to="/nhan-vien/giao-dich" />
          </motion.div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="card p-6 xl:col-span-2">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-gray-900">
                    <TrendingUp size={18} className="text-primary-600" /> Doanh thu phí mượn theo ngày
                  </h2>
                  <p className="text-xs text-gray-500">
                    {stats.range.from.split("-").reverse().join("/")} – {stats.range.to.split("-").reverse().join("/")}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{money(stats.total_revenue)}</p>
              </div>
              <RevenueChart from={stats.range.from} to={stats.range.to} points={stats.revenue_by_day} />
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-gray-900">Tình trạng giao dịch</h2>
              <p className="mb-5 text-xs text-gray-500">Toàn bộ {statusTotal} giao dịch đang theo dõi</p>
              <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
                {statusRows.map((s) => (
                  <motion.div
                    key={s.label}
                    className={`${s.color} border-r-2 border-white last:border-r-0`}
                    initial={{ width: 0 }}
                    animate={{ width: `${statusTotal ? (s.value / statusTotal) * 100 : 0}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    title={`${s.label}: ${s.value}`}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {statusRows.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} /> {s.label}
                    </span>
                    <span className="font-bold text-gray-900">
                      {s.value}{" "}
                      <span className="text-xs font-medium text-gray-400">({statusTotal ? Math.round((s.value / statusTotal) * 100) : 0}%)</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-center">
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{stats.free_borrow_count}</p>
                  <p className="text-xs text-gray-500">Lượt mượn miễn phí</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{stats.paid_borrow_count}</p>
                  <p className="text-xs text-gray-500">Lượt mượn có phí</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div className="card p-6">
              <h2 className="mb-2 font-bold text-gray-900">📚 Sách được mượn nhiều nhất</h2>
              {stats.most_borrowed_books.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu trong khoảng này.</p>}
              {stats.most_borrowed_books.map((item, i) => (
                <RankRow key={item.book_id} rank={i + 1} value={item.total_borrows} max={stats.most_borrowed_books[0].total_borrows} color="bg-primary-500">
                  <div className="flex items-center justify-between gap-2">
                    <BookCell book={item.book} sub={`${item.total_borrows} lượt mượn`} />
                  </div>
                </RankRow>
              ))}
            </div>

            <div className="card p-6">
              <h2 className="mb-2 font-bold text-gray-900">🏷️ Thể loại được quan tâm</h2>
              {stats.top_categories.length === 0 && <p className="text-sm text-gray-500">Chưa có dữ liệu trong khoảng này.</p>}
              {stats.top_categories.map((item, i) => (
                <RankRow key={item.id} rank={i + 1} value={item.total} max={stats.top_categories[0].total} color="bg-violet-500">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <span className="font-bold text-gray-900">{item.total} lượt</span>
                  </div>
                </RankRow>
              ))}
              <h2 className="mb-2 mt-6 font-bold text-gray-900">💰 Sách mang lại doanh thu cao</h2>
              {stats.top_revenue_books.map((item, i) => (
                <RankRow key={item.id} rank={i + 1} value={Number(item.revenue)} max={Number(stats.top_revenue_books[0].revenue)} color="bg-emerald-500">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-gray-800">{item.title}</span>
                    <span className="shrink-0 font-bold text-gray-900">{money(item.revenue)}</span>
                  </div>
                </RankRow>
              ))}
            </div>

            <div className="card p-6 lg:col-span-2 xl:col-span-1">
              <h2 className="mb-2 flex items-center gap-2 font-bold text-gray-900">
                <Bot size={18} className="text-accent-500" /> Trợ lý AI - sách được gợi ý nhiều
              </h2>
              {!aiLogs && <div className="skeleton h-40" />}
              {aiLogs?.top_recommended_books.slice(0, 5).map((item, i) => (
                <RankRow key={item.book_id} rank={i + 1} value={item.total} max={aiLogs.top_recommended_books[0].total} color="bg-accent-500">
                  <BookCell book={item.book} sub={`${item.total} lượt gợi ý`} />
                </RankRow>
              ))}
              {aiLogs && (
                <>
                  <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-gray-400">Câu hỏi gần đây ({aiLogs.total_logs} lượt AI xử lý)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiLogs.recent_queries.slice(0, 8).map((qr) => (
                      <span key={qr} className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600">
                        {qr}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
