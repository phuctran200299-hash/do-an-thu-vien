// Các khối nội dung bổ sung cho trang chủ, dùng dữ liệu từ GET /home/overview.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookCopy,
  BookOpen,
  Library,
  PenLine,
  Quote,
  Repeat,
  Search,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { CountUp } from "../Motion";
import { Avatar } from "../admin/ui";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const pop = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function SectionHeader({ title, subtitle, to, linkLabel = "Xem tất cả" }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 pl-[18px] text-sm text-gray-500">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="group flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
          {linkLabel} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/* ---------------- Dải số liệu ---------------- */
export function StatsBand({ stats }) {
  if (!stats) return null;
  const items = [
    { icon: Library, value: stats.books, label: "Đầu sách", tone: "text-primary-600 bg-primary-50" },
    { icon: BookCopy, value: stats.copies, label: "Bản sách trong kho", tone: "text-sky-600 bg-sky-50" },
    { icon: PenLine, value: stats.authors, label: "Tác giả", tone: "text-accent-600 bg-accent-50" },
    { icon: Users, value: stats.readers, label: "Độc giả", tone: "text-emerald-600 bg-emerald-50" },
    { icon: Repeat, value: stats.borrows, label: "Lượt mượn", tone: "text-amber-600 bg-amber-50" },
    {
      icon: Star,
      value: stats.avg_rating,
      label: `Điểm TB / ${stats.reviews} đánh giá`,
      tone: "text-yellow-600 bg-yellow-50",
      format: (v) => v.toFixed(1),
    },
  ];
  return (
    <motion.section
      className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {items.map(({ icon: Icon, value, label, tone, format }) => (
        <motion.div key={label} variants={pop} className="card flex flex-col items-start gap-2 p-4">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={18} />
          </span>
          <p className="text-2xl font-extrabold text-gray-900">
            <CountUp value={value} {...(format ? { format } : {})} />
          </p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </motion.div>
      ))}
    </motion.section>
  );
}

/* ---------------- Thể loại ---------------- */
export function CategoryGrid({ categories }) {
  if (!categories?.length) return null;
  return (
    <motion.section className="mb-16" {...reveal}>
      <SectionHeader title="Khám phá theo thể loại" subtitle="Chọn một chủ đề để xem toàn bộ sách thuộc thể loại đó." to="/sach" />
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {categories.map((c) => (
          <motion.div key={c.id} variants={pop}>
            <Link
              to={`/sach?category_id=${c.id}`}
              className="card-hover group flex h-full items-center gap-4 overflow-hidden p-4"
            >
              <div className="relative h-20 w-20 shrink-0">
                {(c.covers?.length ? c.covers : [null]).slice(0, 3).map((src, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-20 w-14 overflow-hidden rounded-md bg-gradient-to-br from-primary-100 to-accent-100 shadow-md ring-2 ring-white transition-transform duration-300"
                    style={{
                      left: i * 9,
                      zIndex: 3 - i,
                      transform: `rotate(${(i - 1) * 6}deg)`,
                    }}
                  >
                    {src ? (
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="m-auto mt-6 text-primary-400" size={22} />
                    )}
                  </div>
                ))}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900 group-hover:text-primary-700">{c.name}</p>
                <p className="text-xs text-gray-500">{c.books_count} đầu sách</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary-600 opacity-0 transition group-hover:opacity-100">
                  Khám phá <ArrowRight size={12} />
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

/* ---------------- Tác giả tiêu biểu ---------------- */
export function AuthorStrip({ authors }) {
  if (!authors?.length) return null;
  return (
    <motion.section className="mb-16" {...reveal}>
      <SectionHeader title="Tác giả tiêu biểu" subtitle="Những cây bút có nhiều tác phẩm nhất trong thư viện." />
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {authors.map((a) => (
          <motion.div key={a.id} variants={pop}>
            <Link
              to={`/sach?author_id=${a.id}&author=${encodeURIComponent(a.name)}`}
              className="card-hover group flex h-full gap-3 p-4"
            >
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-md">
                {a.top_book?.cover_image ? (
                  <img
                    src={a.top_book.cover_image}
                    alt={a.top_book.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <PenLine size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-primary-700">{a.name}</p>
                <p className="text-xs font-semibold text-primary-600">{a.books_count} tác phẩm</p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500">{a.biography}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

/* ---------------- Vừa được mượn (chạy ngang) ---------------- */
function daysAgo(date) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d <= 0) return "Hôm nay";
  if (d === 1) return "Hôm qua";
  return `${d} ngày trước`;
}

export function RecentBorrowsTicker({ items }) {
  if (!items?.length) return null;
  const loop = [...items, ...items];
  return (
    <motion.section className="mb-16" {...reveal}>
      <div className="marquee card relative overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center bg-white pl-4 pr-4 shadow-[16px_0_16px_-4px_white] sm:pr-6">
          <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">Vừa được mượn</span>
          </span>
        </div>
        <div className="marquee-track flex w-max">
          {loop.map((r, i) => (
            <Link
              key={`${r.id}-${i}`}
              to={`/sach/${r.book?.id}`}
              className="mr-3 flex shrink-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 py-1.5 pl-1.5 pr-4 transition hover:border-primary-200 hover:bg-primary-50"
            >
              {r.book?.cover_image ? (
                <img src={r.book.cover_image} alt="" className="h-10 w-7 rounded object-cover" loading="lazy" />
              ) : (
                <span className="flex h-10 w-7 items-center justify-center rounded bg-primary-100 text-primary-500">
                  <BookOpen size={14} />
                </span>
              )}
              <span className="text-xs leading-tight">
                <span className="block max-w-[200px] truncate font-semibold text-gray-800">{r.book?.title}</span>
                <span className="text-gray-500">
                  {r.reader} · {daysAgo(r.borrow_date)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------- Độc giả nói gì ---------------- */
export function ReviewWall({ reviews }) {
  if (!reviews?.length) return null;
  return (
    <motion.section className="mb-16" {...reveal}>
      <SectionHeader title="Độc giả nói gì" subtitle="Nhận xét mới nhất từ những người đã mượn và đọc sách." />
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {reviews.map((r) => (
          <motion.figure key={r.id} variants={pop} className="card-hover relative flex flex-col p-5">
            <Quote className="absolute right-4 top-4 text-primary-100" size={36} />
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">“{r.comment}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
              <Avatar name={r.reader} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{r.reader}</p>
                <Link to={`/sach/${r.book?.id}`} className="block truncate text-xs text-primary-600 hover:underline">
                  về “{r.book?.title}”
                </Link>
              </div>
              {r.book?.cover_image && (
                <img src={r.book.cover_image} alt="" loading="lazy" className="h-12 w-8 rounded object-cover shadow" />
              )}
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </motion.section>
  );
}

/* ---------------- Quy trình mượn sách ---------------- */
const STEPS = [
  { icon: UserPlus, title: "Tạo tài khoản", desc: "Đăng ký miễn phí bằng email trong chưa đầy một phút." },
  { icon: Search, title: "Tìm sách", desc: "Lọc theo thể loại, tác giả hoặc mô tả nhu cầu để AI gợi ý." },
  { icon: BookOpen, title: "Gửi yêu cầu mượn", desc: "Thanh toán phí (nếu có), chờ thủ thư xác nhận và nhận sách." },
  { icon: Repeat, title: "Gia hạn & trả sách", desc: "Theo dõi hạn trả, gia hạn một lần và trả đúng hạn để tránh phạt." },
];

export function HowItWorks() {
  return (
    <motion.section className="mb-16" {...reveal}>
      <SectionHeader title="Mượn sách chỉ với 4 bước" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="card relative overflow-hidden p-5">
            <span className="absolute -right-2 -top-4 text-7xl font-black text-gray-100">{i + 1}</span>
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
              <Icon size={20} />
            </span>
            <h3 className="relative mt-4 font-bold text-gray-900">{title}</h3>
            <p className="relative mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
