import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBooksApi, getFeaturedBooksApi } from "../api/books";
import { getCategoriesApi } from "../api/catalog";
import { aiRecommendationsApi } from "../api/ai";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function BookRow({ title, icon, books }) {
  if (!books?.length) return null;
  return (
    <motion.section
      className="mb-14"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title mb-4">
        <span>{icon}</span> {title}
      </h2>
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {books.map((b) => (
          <motion.div key={b.id} variants={item}>
            <BookCard book={b} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

const FEATURES = [
  {
    icon: "🤖",
    title: "Hỏi AI tìm sách",
    desc: "Mô tả nhu cầu bằng ngôn ngữ tự nhiên, AI gợi ý ngay những cuốn sách phù hợp nhất trong thư viện.",
    color: "from-primary-500 to-primary-600",
  },
  {
    icon: "⚡",
    title: "Mượn - trả nhanh chóng",
    desc: "Đăng ký mượn chỉ với một cú nhấp, theo dõi trạng thái và hạn trả rõ ràng theo thời gian thực.",
    color: "from-accent-400 to-accent-600",
  },
  {
    icon: "🔔",
    title: "Đặt trước thông minh",
    desc: "Sách hết vẫn có thể xếp hàng đặt trước, hệ thống tự thông báo ngay khi đến lượt bạn.",
    color: "from-sunset-400 to-sunset-500",
  },
  {
    icon: "📚",
    title: "Kho sách đa dạng",
    desc: "Hàng trăm đầu sách thuộc nhiều thể loại, liên tục cập nhật và gợi ý theo sở thích của bạn.",
    color: "from-emerald-400 to-emerald-600",
  },
];

export default function Home() {
  const { isReader } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getFeaturedBooksApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));

    Promise.all([getBooksApi({ per_page: 1 }), getCategoriesApi()]).then(([books, categories]) => {
      setStats({ totalBooks: books.data.total, totalCategories: categories.data.categories.length });
    });
  }, []);

  useEffect(() => {
    if (isReader) {
      aiRecommendationsApi().then((res) => setRecommended(res.data.results));
    }
  }, [isReader]);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 px-6 py-16 text-white shadow-card sm:px-12">
        <div className="blob -left-16 -top-16 h-64 w-64 bg-accent-400" />
        <div className="blob -bottom-24 -right-10 h-72 w-72 bg-primary-300 [animation-delay:-4s]" />
        <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-20" />
        <span className="absolute right-10 top-10 hidden text-6xl opacity-20 animate-float sm:block">📖</span>
        <span className="absolute bottom-10 left-1/2 hidden text-5xl opacity-20 animate-float-slow md:block">✨</span>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            ✨ Trải nghiệm đọc sách thế hệ mới
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Hệ thống Quản lý Thư viện <span className="text-white/90">Sách Thông minh</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-primary-50/90 sm:text-lg">
            Tra cứu, tìm kiếm và mượn sách dễ dàng. Khám phá kho sách đa dạng và theo dõi lịch sử mượn - trả của bạn
            mọi lúc, mọi nơi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/sach" className="btn bg-white text-primary-700 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover">
              Khám phá sách ngay
            </Link>
            <Link
              to="/tim-kiem-ai"
              className="btn border-2 border-white/60 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/10"
            >
              🤖 Hỏi AI tìm sách
            </Link>
          </div>

          {stats && (
            <div className="mt-10 flex flex-wrap gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-3xl font-extrabold">{stats.totalBooks}+</p>
                <p className="text-sm text-primary-100/80">Đầu sách</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">{stats.totalCategories}</p>
                <p className="text-sm text-primary-100/80">Thể loại</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">24/7</p>
                <p className="text-sm text-primary-100/80">Truy cập mọi lúc</p>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <motion.section
        className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {FEATURES.map((f) => (
          <motion.div key={f.title} variants={item} className="card-hover p-5">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-2xl text-white shadow-soft`}
            >
              {f.icon}
            </div>
            <h3 className="font-bold text-gray-900">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {isReader && recommended && recommended.length > 0 && (
        <BookRow title="Dành cho bạn" icon="✨" books={recommended.map((r) => r.book)} />
      )}

      {loading && (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] w-full" />
          ))}
        </div>
      )}
      {data && (
        <>
          <BookRow title="Sách nổi bật" icon="📌" books={data.admin_featured} />
          <BookRow title="Sách mới" icon="📗" books={data.newest} />
          <BookRow title="Sách được mượn nhiều" icon="🔥" books={data.most_borrowed} />
          <BookRow title="Sách đánh giá cao" icon="⭐" books={data.top_rated} />
        </>
      )}

      {/* ================= CTA BANNER ================= */}
      {!isReader && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-primary-900 px-8 py-12 text-center text-white shadow-card"
        >
          <div className="blob left-1/3 top-0 h-56 w-56 bg-accent-500 opacity-20" />
          <h2 className="relative text-2xl font-extrabold sm:text-3xl">Sẵn sàng bắt đầu hành trình đọc sách?</h2>
          <p className="relative mx-auto mt-2 max-w-lg text-primary-100/80">
            Đăng ký miễn phí ngay hôm nay để mượn sách, lưu yêu thích và nhận gợi ý sách được AI cá nhân hoá riêng cho
            bạn.
          </p>
          <Link to="/dang-ky" className="btn relative mt-6 bg-white text-primary-700 hover:-translate-y-0.5">
            Đăng ký miễn phí
          </Link>
        </motion.section>
      )}
    </div>
  );
}
