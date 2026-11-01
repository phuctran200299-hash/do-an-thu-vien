import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedBooksApi, getHomeOverviewApi } from "../api/books";
import { aiRecommendationsApi } from "../api/ai";
import BookCard from "../components/BookCard";
import HeroSlider from "../components/HeroSlider";
import {
  AuthorStrip,
  CategoryGrid,
  HowItWorks,
  RecentBorrowsTicker,
  ReviewWall,
  SectionHeader,
  StatsBand,
} from "../components/home/HomeSections";
import { useAuth } from "../context/AuthContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function BookRow({ title, icon, subtitle, to, books }) {
  const scroller = useRef(null);
  if (!books?.length) return null;
  const scrollBy = (dir) => {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <motion.section
      className="mb-14"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title={
          <>
            <span>{icon}</span> {title}
          </>
        }
        subtitle={subtitle}
        to={to}
      />
      <div className="group/row relative">
        <motion.div
          ref={scroller}
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {books.map((b) => (
            <motion.div
              key={b.id}
              variants={item}
              className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)]"
            >
              <BookCard book={b} />
            </motion.div>
          ))}
        </motion.div>
        {books.length > 2 &&
          [
            [-1, ChevronLeft, "-left-4"],
            [1, ChevronRight, "-right-4"],
          ].map(([dir, Icon, pos]) => (
            <button
              key={dir}
              onClick={() => scrollBy(dir)}
              aria-label={dir < 0 ? "Xem sách trước" : "Xem thêm sách"}
              className={`absolute top-[38%] z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 opacity-0 shadow-card ring-1 ring-gray-100 transition hover:text-primary-600 group-hover/row:opacity-100 md:flex ${pos}`}
            >
              <Icon size={20} />
            </button>
          ))}
      </div>
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
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getFeaturedBooksApi()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));

    getHomeOverviewApi().then((res) => setOverview(res.data));
  }, []);

  useEffect(() => {
    if (isReader) {
      aiRecommendationsApi().then((res) => setRecommended(res.data.results));
    }
  }, [isReader]);

  return (
    <div>
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider
        stats={overview && { totalBooks: overview.stats.books, totalCategories: overview.categories.length }}
        featured={data?.admin_featured}
      />

      <StatsBand stats={overview?.stats} />

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
          <BookRow title="Sách nổi bật" icon="📌" subtitle="Do thủ thư tuyển chọn và giới thiệu." books={data.admin_featured} />
          <CategoryGrid categories={overview?.categories} />
          <BookRow title="Sách mới" icon="📗" subtitle="Những đầu sách vừa được bổ sung vào kho." to="/sach" books={data.newest} />
          <RecentBorrowsTicker items={overview?.recent_borrows} />
          <BookRow title="Sách được mượn nhiều" icon="🔥" subtitle="Được độc giả mượn đọc nhiều nhất." books={data.most_borrowed} />
          <AuthorStrip authors={overview?.authors} />
          <BookRow title="Sách đánh giá cao" icon="⭐" subtitle="Điểm đánh giá trung bình cao nhất." to="/sach?sort=avg_rating:desc" books={data.top_rated} />
          <ReviewWall reviews={overview?.reviews} />
        </>
      )}

      <HowItWorks />

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
